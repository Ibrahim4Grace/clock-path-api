import express from 'express';
import * as userCtrlr from '../controllers/index.js';
import { userImage } from '../config/index.js';
import {
  requestSchema,
  workScheduleSchema,
  passwordSchema,
  coordinatesSchema,
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
  validateData(workScheduleSchema),
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
  userCtrlr.clockOut
);

userRoute.post(
  '/requests',
  authMiddleware,
  userMiddleware,
  validateData(requestSchema),
  userCtrlr.userRequest
);

userRoute.post(
  '/passwords',
  authMiddleware,
  userMiddleware,
  validateData(passwordSchema),
  userCtrlr.managePasswords
);

export default userRoute;
