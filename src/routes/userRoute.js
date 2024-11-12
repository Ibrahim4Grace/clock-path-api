import express from 'express';
import * as userCtrlr from '../controllers/index.js';
import { userImage } from '../config/index.js';
import { paginatedResults } from '../utils/index.js';
import { ClockIn, Request } from '../models/index.js';
import {
  requestSchema,
  workScheduleSchema,
  passwordSchema,
  coordinatesSchema,
  updateUserSchema,
} from '../schema/index.js';
import {
  validateData,
  authMiddleware,
  userMiddleware,
} from '../middlewares/index.js';

const userRoute = express.Router();

userRoute.post(
  '/profile',
  authMiddleware,
  userMiddleware,
  userImage.single('image'),
  validateData(updateUserSchema),
  userCtrlr.createProfile
);

userRoute.put(
  '/profile',
  authMiddleware,
  userMiddleware,
  userImage.single('image'),
  validateData(workScheduleSchema),
  userCtrlr.updateProfile
);

userRoute.get(
  '/work-schedule',
  authMiddleware,
  userMiddleware,
  validateData(workScheduleSchema),
  userCtrlr.getWorkSchedule
);
userRoute.post(
  '/clock-in',
  authMiddleware,
  userMiddleware,
  validateData(coordinatesSchema),
  userCtrlr.clockIn
);

userRoute.post(
  '/clock-out',
  authMiddleware,
  userMiddleware,
  validateData(coordinatesSchema),
  userCtrlr.clockOut
);

userRoute.get(
  '/recent-activity',
  authMiddleware,
  userMiddleware,
  paginatedResults(ClockIn),
  userCtrlr.getRecentActivity
);

userRoute.post(
  '/requests',
  authMiddleware,
  userMiddleware,
  validateData(requestSchema),
  userCtrlr.userRequest
);

userRoute.get(
  '/requests',
  authMiddleware,
  userMiddleware,
  paginatedResults(Request),
  userCtrlr.userRequests
);

userRoute.post(
  '/passwords',
  authMiddleware,
  userMiddleware,
  validateData(passwordSchema),
  userCtrlr.managePasswords
);

userRoute.post(
  '/device/register',
  authMiddleware,
  userMiddleware,
  userCtrlr.registerDevice
);

userRoute.post('/logout', authMiddleware, userMiddleware, userCtrlr.userLogout);
export default userRoute;
