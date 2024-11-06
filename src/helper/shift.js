import { User, Company } from '../models/index.js';
import { ResourceNotFound, BadRequest } from '../middlewares/index.js';

// Convert 24-hour format to 12-hour format
const convertTo12Hour = (time24h) => {
  const [hours, minutes] = time24h.split(':');
  const hour = parseInt(hours);

  if (hour === 0) {
    return `12:${minutes} AM`;
  } else if (hour === 12) {
    return `12:${minutes} PM`;
  } else if (hour > 12) {
    return `${hour - 12}:${minutes} PM`;
  } else {
    return `${hour}:${minutes} AM`;
  }
};

// Helper function to check if current time is within shift hours
const getShiftStatus = (currentTime, workDay) => {
  const startTime24h = convertTo12Hour(workDay.shift.start);
  const endTime24h = convertTo12Hour(workDay.shift.end);

  const [startHour, startMinute] = startTime24h.split(':');
  const [endHour, endMinute] = endTime24h.split(':');

  const shiftStart = new Date(currentTime);
  shiftStart.setHours(parseInt(startHour), parseInt(startMinute), 0);

  const shiftEnd = new Date(currentTime);
  shiftEnd.setHours(parseInt(endHour), parseInt(endMinute), 0);

  return {
    isLate: currentTime > shiftStart,
    isMissedShift: currentTime > shiftEnd,
    scheduledStart: shiftStart,
    scheduledEnd: shiftEnd,
  };
};

export const validateLocationAndDistance = async (
  userId,
  longitude,
  latitude
) => {
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

  const company = await Company.findById(user.companyId);
  if (!company) {
    throw new ResourceNotFound('Company not found');
  }

  if (!company.location || !company.location.coordinates) {
    throw new BadRequest(
      'Company location not configured. Please contact administrator.'
    );
  }

  const userLocation = {
    type: 'Point',
    coordinates: [longitude, latitude],
  };

  // Calculate distance between user and company
  const nearbyCheck = await Company.aggregate([
    {
      $geoNear: {
        near: userLocation,
        distanceField: 'distance',
        maxDistance: company.radius || 20,
        spherical: true,
        query: { _id: company._id },
      },
    },
  ]);

  if (!nearbyCheck.length) {
    // Get actual distance for error message
    const actualDistance = await Company.aggregate([
      {
        $geoNear: {
          near: userLocation,
          distanceField: 'distance',
          spherical: true,
          query: { _id: company._id },
        },
      },
    ]);

    const distance = actualDistance.length
      ? Math.round(actualDistance[0].distance)
      : 'unknown';
    throw new BadRequest(
      `You must be within ${
        company.radius || 20
      } meters of your workplace. Current distance: ${distance} meters.`
    );
  }

  return { user, userLocation };
};

export const validateLocationAndSchedule = async (
  userId,
  longitude,
  latitude
) => {
  const { user, userLocation } = await validateLocationAndDistance(
    userId,
    longitude,
    latitude
  );

  const currentDate = new Date();
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const currentDay = days[currentDate.getDay()];

  // Find user's schedule for current day
  const todaySchedule = user.work_days.find((day) => day.day === currentDay);
  if (!todaySchedule) {
    throw new BadRequest(`You are not scheduled to work on ${currentDay}`);
  }

  const shiftStatus = getShiftStatus(currentDate, todaySchedule);

  return {
    user,
    userLocation,
    schedule: todaySchedule,
    shiftStatus,
  };
};
