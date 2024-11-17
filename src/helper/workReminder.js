import { User } from '../models/index.js';
import {
  asyncHandler,
  BadRequest,
  ResourceNotFound,
} from '../middlewares/index.js';

export const parseReminderTime = (timeStr) => {
  const [time, modifier] = timeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  let parsedHours = hours;

  if (modifier === 'PM' && hours !== 12) {
    parsedHours += 12;
  } else if (modifier === 'AM' && hours === 12) {
    parsedHours = 0;
  }

  const date = new Date();
  date.setHours(parsedHours, minutes, 0, 0);
  return date;
};

// Format time for display
const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Check if it's time to send a reminder
const shouldSendReminder = (targetTime) => {
  const now = new Date();
  // Check if current time is within 1 minute of target time
  return Math.abs(now - targetTime) <= 60000;
};

export const checkUserReminders = asyncHandler(async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const now = new Date();
  const today = now.toLocaleString('en-us', { weekday: 'long' });
  const todayShift = user.work_days.find((day) => day.day === today);

  if (!todayShift) {
    return {
      message: 'No work schedule for today',
      hasReminders: false,
    };
  }

  const todayDate = now.toDateString();
  const shiftStart = new Date(`${todayDate} ${todayShift.shift.start}`);
  const shiftEnd = new Date(`${todayDate} ${todayShift.shift.end}`);

  try {
    const clockInTime = parseReminderTime(user.reminders.clockIn);
    const clockOutTime = parseReminderTime(user.reminders.clockOut);

    if (isNaN(clockInTime.getTime()) || isNaN(clockOutTime.getTime())) {
      throw new BadRequest('Invalid reminder time calculation');
    }

    const reminders = {
      hasReminders: false,
      clockIn: {
        shouldRemind: shouldSendReminder(clockInTime),
        message: `Your shift starts at ${formatTime(
          shiftStart
        )}. Please remember to clock in.`,
        reminderTime: formatTime(clockInTime),
        shiftTime: formatTime(shiftStart),
      },
      clockOut: {
        shouldRemind: shouldSendReminder(clockOutTime),
        message: `Your shift ends at ${formatTime(
          shiftEnd
        )}. Please remember to clock out.`,
        reminderTime: formatTime(clockOutTime),
        shiftTime: formatTime(shiftEnd),
      },
      nextReminders: {
        clockIn: formatTime(clockInTime),
        clockOut: formatTime(clockOutTime),
      },
    };

    reminders.hasReminders =
      reminders.clockIn.shouldRemind || reminders.clockOut.shouldRemind;

    return reminders;
  } catch (error) {
    throw new BadRequest('Invalid reminder values');
  }
});

export const checkReminders = asyncHandler(async (req, res) => {
  const reminders = await checkUserReminders(req.currentUser);

  if (!reminders) {
    throw new ResourceNotFound('Unable to check reminders');
  }

  return {
    status: 200,
    message: reminders.hasReminders
      ? 'Reminders available'
      : 'No current reminders',
    data: reminders,
  };
});
