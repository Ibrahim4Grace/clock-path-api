import { cloudinary } from '../config/index.js';
import { User, Request, ClockIn, DeviceToken } from '../models/index.js';
import { sendMail, updatePassword } from '../utils/index.js';
import {
  sendJsonResponse,
  validateLocationAndSchedule,
  validateLocationAndDistance,
  checkUserReminders,
  convertTo12Hour,
  formatDate,
  getWeekDates,
  parseReminderTime,
} from '../helper/index.js';
import {
  asyncHandler,
  Conflict,
  ResourceNotFound,
  BadRequest,
  Unauthorized,
} from '../middlewares/index.js';

export const createProfile = asyncHandler(async (req, res) => {
  const userId = req.currentUser;
  const { work_days, full_name, role } = req.body;
  const file = req.file;

  const updateFields = {};

  if (work_days) {
    updateFields.work_days = work_days.map((day) => ({
      day: day.day,
      shift: {
        start: convertTo12Hour(day.shift.start),
        end: convertTo12Hour(day.shift.end),
      },
    }));
  }

  if (full_name) updateFields.full_name = full_name;
  if (role) updateFields.role = role;

  if (file) {
    const existingUser = await User.findById(userId);

    if (existingUser.image && existingUser.image.imageId) {
      try {
        await cloudinary.uploader.destroy(existingUser.image.imageId);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }

    try {
      const cloudinaryResult = await cloudinary.uploader.upload(file.path);
      updateFields.image = {
        imageId: cloudinaryResult.public_id,
        imageUrl: cloudinaryResult.secure_url,
      };
    } catch (error) {
      throw new Error('Failed to upload image: ' + error.message);
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new ResourceNotFound('User not found');
  }

  sendJsonResponse(res, 201, 'Profile created successfully', {
    data: updatedUser,
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.currentUser;
  const { work_days, full_name, role, email } = req.body;
  const file = req.file;
  const updateFields = {};

  if (work_days) {
    updateFields.work_days = work_days.map((day) => ({
      day: day.day,
      shift: {
        start: convertTo12Hour(day.shift.start),
        end: convertTo12Hour(day.shift.end),
      },
    }));
  }

  if (full_name) updateFields.full_name = full_name;
  if (role) updateFields.role = role;
  if (email) updateFields.email = email;

  if (file) {
    const existingUser = await User.findById(userId);

    if (existingUser.image && existingUser.image.imageId) {
      try {
        await cloudinary.uploader.destroy(existingUser.image.imageId);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }

    try {
      const cloudinaryResult = await cloudinary.uploader.upload(file.path);
      updateFields.image = {
        imageId: cloudinaryResult.public_id,
        imageUrl: cloudinaryResult.secure_url,
      };
    } catch (error) {
      throw new Error('Failed to upload image: ' + error.message);
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new ResourceNotFound('User not found');
  }

  sendJsonResponse(res, 200, 'Profile updated successfully', {
    data: updatedUser,
  });
});

export const getWorkSchedule = asyncHandler(async (req, res) => {
  const userId = req.currentUser;

  const user = await User.findById(userId);
  if (!user) {
    throw new ResourceNotFound('User not found');
  }

  // Get Monday of current week
  const monday = getWeekDates();

  // Add dates to work days
  const workDaysWithDates = user.work_days.map((workDay, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    return {
      day: workDay.day,
      date: formatDate(date),
      shift: {
        start: workDay.shift.start,
        end: workDay.shift.end,
      },
    };
  });

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 6;
  const startIndex = (page - 1) * perPage;
  const paginatedWorkDays = workDaysWithDates.slice(
    startIndex,
    startIndex + perPage
  );

  return sendJsonResponse(res, 200, 'User work days', {
    data: {
      currentPage: page,
      totalPages: Math.ceil(workDaysWithDates.length / perPage),
      totalItems: workDaysWithDates.length,
      perPage: perPage,
      work_days: paginatedWorkDays,
    },
  });
});

export const clockIn = asyncHandler(async (req, res) => {
  const userId = req.currentUser;
  const { longitude, latitude } = req.body;

  // Validate location, distance, and schedule
  const { user, userLocation, schedule, shiftStatus } =
    await validateLocationAndSchedule(userId, longitude, latitude);

  // Check if already clocked in
  const openShift = await ClockIn.findOne({
    user: userId,
    clockOutTime: null,
  });

  if (openShift) {
    throw new BadRequest('Already clocked in');
  }

  // Create new clock-in record
  const newClockIn = await ClockIn.create({
    user: userId,
    clockInTime: new Date(),
    location: userLocation, // clock-in location
    clockOutLocation: { type: 'Point', coordinates: [0, 0] },
    scheduledStart: shiftStatus.scheduledStart,
    scheduledEnd: shiftStatus.scheduledEnd,
    isLate: shiftStatus.isLate,
    missedShift: shiftStatus.isMissedShift,
  });

  // Prepare response message
  let message = 'Clocked in successfully';
  if (shiftStatus.isLate && !shiftStatus.isMissedShift) {
    message += ' (Late arrival)';
  } else if (shiftStatus.isMissedShift) {
    message += ' (Missed shift)';
  }

  sendJsonResponse(res, 201, message, newClockIn);
});

export const clockOut = asyncHandler(async (req, res) => {
  const userId = req.currentUser;
  const { longitude, latitude } = req.body;

  // Validate location and distance only for clock out
  const { userLocation } = await validateLocationAndDistance(
    userId,
    longitude,
    latitude
  );

  const clockInSession = await ClockIn.findOne({
    user: userId,
    clockOutTime: null,
  });

  if (!clockInSession) {
    throw new ResourceNotFound('No active session to clock out');
  }

  // Set clock out time and location
  clockInSession.clockOutTime = new Date();
  clockInSession.clockOutLocation = userLocation;

  // Check if leaving early
  const currentTime = new Date();
  // clockInSession.isEarlyDeparture = currentTime < clockInSession.scheduledEnd;
  clockInSession.isEarlyDeparture =
    clockInSession.clockOutTime < clockInSession.scheduledEnd;

  // Calculate hours worked
  const hoursWorked =
    (clockInSession.clockOutTime - clockInSession.clockInTime) /
    (1000 * 60 * 60);
  clockInSession.hoursWorked = parseFloat(hoursWorked.toFixed(2));

  await clockInSession.save();

  let message = 'Clocked out successfully';
  if (clockInSession.isEarlyDeparture) {
    message += ' (Early departure)';
  }

  sendJsonResponse(res, 200, message, clockInSession);
});

export const setReminder = asyncHandler(async (req, res) => {
  const { clockInReminder, clockOutReminder } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ResourceNotFound('User not found');
  }

  const today = new Date().toLocaleString('en-us', { weekday: 'long' });
  const todayShift = user.work_days.find((workDay) => workDay.day === today);

  if (!todayShift) {
    throw new ResourceNotFound('No work schedule found for today');
  }

  const shiftStart = parseReminderTime(todayShift.shift.start);
  const shiftEnd = parseReminderTime(todayShift.shift.end);

  if (clockInReminder) {
    const clockInTime = parseReminderTime(clockInReminder);
    if (clockInTime >= shiftStart) {
      throw new BadRequest(
        `Clock-in reminder (${convertTo12Hour(
          clockInReminder
        )}) must be before shift start time (${todayShift.shift.start}).`
      );
    }
  }

  if (clockOutReminder) {
    const clockOutTime = parseReminderTime(clockOutReminder);
    if (clockOutTime >= shiftEnd) {
      throw new BadRequest(
        `Clock-out reminder (${convertTo12Hour(
          clockOutReminder
        )}) must be before shift end time (${todayShift.shift.end}).`
      );
    }
  }

  user.reminders.clockIn = clockInReminder;
  user.reminders.clockOut = clockOutReminder;
  await user.save();

  sendJsonResponse(res, 200, 'Reminder updated successfully', {
    reminders: {
      clockIn: convertTo12Hour(clockInReminder),
      clockOut: convertTo12Hour(clockOutReminder),
    },
  });
});

export const getCurrentReminders = asyncHandler(async (req, res) => {
  const reminders = await checkUserReminders(req.currentUser);

  if (!reminders) {
    throw new BadRequest('Unable to check reminders');
  }

  sendJsonResponse(res, 200, 'Reminders retrieved successfully', reminders);
});

export const getRecentActivity = asyncHandler(async (req, res) => {
  const userId = req.currentUser;

  if (!res.paginatedResults) {
    throw new ResourceNotFound('Paginated results not found');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ResourceNotFound('User not found');
  }

  const { results, currentPage, totalPages, limit } = res.paginatedResults;

  const formattedActivity = results.map((record) => {
    return {
      date: new Date(record.clockInTime).toLocaleDateString(),
      clockInTime: new Date(record.clockInTime).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      clockOutTime: record.clockOutTime
        ? new Date(record.clockOutTime).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })
        : null,
      status: record.missedShift
        ? 'Missed Shift'
        : record.isLate
        ? 'Late Arrival'
        : 'On Time',
      hoursWorked: record.hoursWorked,
    };
  });

  sendJsonResponse(res, 200, 'Recent activity retrieved successfully', {
    results: formattedActivity,
    pagination: {
      currentPage,
      totalPages,
      limit,
    },
  });
});

export const userRequest = asyncHandler(async (req, res) => {
  const userId = req.currentUser;
  const { requestType, reason, note, startDate, endDate } = req.body;

  const start = new Date(startDate);
  const end = new Date(endDate);

  const existingRequest = await Request.findOne({
    user: userId,
    $or: [{ startDate: { $lte: end }, endDate: { $gte: start } }],
  });

  if (existingRequest) {
    throw new Conflict('A request already exists within this date range.');
  }

  const newRequest = await Request.create({
    user: userId,
    requestType,
    reason,
    note,
    startDate: start,
    endDate: end,
  });

  sendJsonResponse(res, 201, 'Request created successfully', newRequest);
});

export const userRequests = asyncHandler(async (req, res) => {
  const userId = req.currentUser;

  if (!res.paginatedResults) {
    throw new ResourceNotFound('Paginated results not found');
  }

  const { results, currentPage, totalPages, limit } = res.paginatedResults;

  if (!results || results.length === 0) {
    throw new ResourceNotFound('No requests found for this user.');
  }

  sendJsonResponse(res, 200, 'User requests retrieved successfully', {
    data: results,
    pagination: {
      currentPage,
      totalPages,
      limit,
    },
  });
});

export const managePasswords = asyncHandler(async (req, res) => {
  const id = req.currentUser;
  const { current_password, new_password, confirm_password } = req.body;

  const user = await User.findById(id).select('+password');
  if (!user) {
    throw new ResourceNotFound('User not found');
  }

  const isMatch = await user.matchPassword(current_password);
  if (!isMatch) {
    throw new Unauthorized('Current password is incorrect');
  }

  user.password = new_password;
  await user.save();

  const emailContent = updatePassword(user);
  await sendMail(emailContent);

  sendJsonResponse(res, 200, 'User password updated successfully');
});

export const getNotificationsAndReminders = asyncHandler(async (req, res) => {
  const userId = req.currentUser;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const requests = await Request.find({
    user: userId,
    status: { $in: ['accepted', 'declined'] },
  })
    .sort({ createdAt: -1 })
    .select('requestType status startDate endDate createdAt');

  const user = await User.findById(userId).select(
    'reminders.clockIn reminders.clockOut'
  );

  const requestNotifications = requests.map((request) => ({
    type: 'request',
    status: request.status,
    message:
      request.status === 'accepted'
        ? `Your ${request.requestType} request for ${formatDate(
            request.startDate
          )} to ${formatDate(request.endDate)} has been accepted`
        : `Your ${request.requestType} request for ${formatDate(
            request.startDate
          )} to ${formatDate(request.endDate)} has been declined`,
    createdAt: request.createdAt,
    sortDate: request.createdAt,
  }));

  const currentDate = new Date();
  const reminderNotifications = [];

  if (user.reminders.clockIn) {
    reminderNotifications.push({
      type: 'reminder',
      status: 'clockIn',
      message: `Daily clock-in reminder set for ${user.reminders.clockIn}`,
      time: user.reminders.clockIn,
      sortDate: currentDate,
    });
  }

  if (user.reminders.clockOut) {
    reminderNotifications.push({
      type: 'reminder',
      status: 'clockOut',
      message: `Daily clock-out reminder set for ${user.reminders.clockOut}`,
      time: user.reminders.clockOut,
      sortDate: currentDate,
    });
  }

  const allNotifications = [
    ...requestNotifications,
    ...reminderNotifications,
  ].sort((a, b) => b.sortDate - a.sortDate);

  const paginatedNotifications = allNotifications.slice(skip, skip + limit);

  const totalItems = allNotifications.length;
  const totalPages = Math.ceil(totalItems / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const response = {
    notifications: paginatedNotifications.map(
      ({ sortDate, ...notification }) => notification
    ),
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
    },
  };

  return res.status(200).json(response);
});

export const userLogout = asyncHandler(async (req, res) => {
  res.clearCookie('accessToken', '', {
    expires: new Date(0),
  });
  res.clearCookie('refreshToken', '', {
    expires: new Date(0),
  });

  sendJsonResponse(res, 200, 'Logout successful');
});
