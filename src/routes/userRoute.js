import express from 'express';
import * as userCtrlr from '../controllers/index.js';
import { userImage } from '../config/index.js';
import {
  requestSchema,
  updateUserSchema,
  passwordSchema,
} from '../schema/index.js';
import {
  validateData,
  authMiddleware,
  userMiddleware,
} from '../middlewares/index.js';

const userRoute = express.Router();

userRoute.post('/clock-in', authMiddleware, userMiddleware, userCtrlr.clockIn);
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
  '/users',
  authMiddleware,
  userMiddleware,
  userImage.single('image'),
  validateData(updateUserSchema),
  userCtrlr.editProfile
);

userRoute.post(
  '/passwords',
  authMiddleware,
  userMiddleware,
  validateData(passwordSchema),
  userCtrlr.managePasswords
);

export default userRoute;
