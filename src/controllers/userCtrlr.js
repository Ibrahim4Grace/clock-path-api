import { cloudinary } from '../config/index.js';
import { User, Request, ClockIn, Company } from '../models/index.js';
import { sendJsonResponse } from '../helper/index.js';
import {
  asyncHandler,
  Conflict,
  ResourceNotFound,
  BadRequest,
  Unauthorized,
} from '../middlewares/index.js';
import { sendMail, formatTime, updatePassword } from '../utils/index.js';

export const createProfile = asyncHandler(async (req, res) => {
  const userId = req.currentUser;
  const { work_days, full_name, role } = req.body;
  const file = req.file;

  const updateFields = {};

  if (work_days) {
    updateFields.work_days = work_days.map((day) => ({
      day: day.day,
      shift: {
        start: day.shift.start,
        end: day.shift.end,
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
        start: day.shift.start,
        end: day.shift.end,
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

  const workSchedule = {
    work_days: user.work_days.map((day) => ({
      day: day.day,
      shift: {
        start: day.shift?.start || '00:00',
        end: day.shift?.end || '00:00',
      },
    })),
  };

  sendJsonResponse(res, 200, 'User work days', { data: workSchedule });
});

export const clockIn = asyncHandler(async (req, res) => {
  const userId = req.currentUser;
  const { longitude, latitude } = req.body;

  // Validate coordinate ranges
  if (longitude < -180 || longitude > 180) {
    throw new BadRequest('Invalid longitude value');
  }
  if (latitude < -90 || latitude > 90) {
    throw new BadRequest('Invalid latitude value');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ResourceNotFound('User not found');
  }

  // Get user's company and check if within radius
  const company = await Company.findById(user.companyId);
  if (!company) {
    throw new ResourceNotFound('Company not found');
  }

  // Create user location object for distance checking
  const userLocation = {
    type: 'Point',
    coordinates: [longitude, latitude],
  };

  const isWithinRadius = await Company.findOne({
    _id: company._id,
    location: {
      $near: {
        $geometry: userLocation,
        $maxDistance: company.radius || 100,
      },
    },
  });

  if (!isWithinRadius) {
    throw new BadRequest(
      `You must be within ${company.radius || 100} meters of ${
        company.name
      } to clock in`
    );
  }

  // Check for existing open shift
  const openShift = await ClockIn.findOne({ user: userId, clockOutTime: null });
  if (openShift) {
    throw new BadRequest('Already clocked in');
  }

  const newClockIn = await ClockIn.create({
    user: userId,
    clockInTime: new Date(),
    location: userLocation,
  });

  sendJsonResponse(res, 201, 'Clocked in successfully', newClockIn);
});

export const clockOut = asyncHandler(async (req, res) => {
  const user = req.currentUser;

  const clockInSession = await ClockIn.findOne({
    user: user,
    clockOutTime: null,
  });

  if (!clockInSession) {
    throw new ResourceNotFound('No active session to clock out');
  }

  clockInSession.clockOutTime = new Date();

  // Calculate if the shift was missed
  const shiftStart = new Date();
  const shiftEnd = new Date();

  // Set shift start and end times based on user’s scheduled shift duration
  if (user.shift_duration) {
    const [startHour, startMinute] = user.shift_duration.start.split(':');
    shiftStart.setHours(startHour, startMinute, 0);

    const [endHour, endMinute] = user.shift_duration.end.split(':');
    shiftEnd.setHours(endHour, endMinute, 0);
  }

  const missedShift =
    clockInSession.clockInTime > shiftEnd || !clockInSession.clockOutTime;
  clockInSession.missedShift = missedShift;

  await clockInSession.save();

  sendJsonResponse(res, 200, 'Clocked out successfully', clockInSession);
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
