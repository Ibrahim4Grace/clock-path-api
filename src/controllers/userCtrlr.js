import { cloudinary } from '../config/index.js';
import { User, Request, ClockIn } from '../models/index.js';
import { sendJsonResponse } from '../helper/index.js';
import {
  asyncHandler,
  Conflict,
  ResourceNotFound,
  BadRequest,
  Unauthorized,
} from '../middlewares/index.js';
import { sendMail, formatTime, updatePassword } from '../utils/index.js';

export const clockIn = asyncHandler(async (req, res) => {
  const userId = req.currentUser;

  const user = await User.findById(userId);
  if (!user) {
    throw new ResourceNotFound('User not found');
  }

  const openShift = await ClockIn.findOne({ user: userId, clockOutTime: null });
  if (openShift) {
    throw new BadRequest('Already clocked in');
  }

  const newClockIn = await ClockIn.create({
    user: userId,
    clockInTime: new Date(),
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

export const editProfile = asyncHandler(async (req, res) => {
  const userId = req.currentUser;
  const { email, full_name, role, work_days, shift_duration } = req.body;
  const file = req.file;

  const updateFields = {
    email,
    full_name,
    role,
    work_days,
    shift_duration,
  };

  Object.keys(updateFields).forEach((key) => {
    if (updateFields[key] === undefined) {
      delete updateFields[key];
    }
  });

  if (file) {
    const cloudinaryResult = await cloudinary.uploader.upload(file.path);
    updateFields.image = {
      imageId: cloudinaryResult.public_id,
      imageUrl: cloudinaryResult.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(userId, updateFields, {
    new: true,
  });
  if (!user) {
    throw new ResourceNotFound('User not found or update failed');
  }

  const formattedUser = {
    ...user.toObject(),
    work_days: user.work_days ? user.work_days.join(' - ') : '',
    shift_duration: user.shift_duration
      ? `${formatTime(user.shift_duration.start)} - ${formatTime(
          user.shift_duration.end
        )}`
      : '',
  };

  sendJsonResponse(res, 200, 'User updated successfully', formattedUser);
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
