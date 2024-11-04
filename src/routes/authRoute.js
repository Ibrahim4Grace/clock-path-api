import express from 'express';
import * as authCtrlr from '../controllers/index.js';
import { validateData } from '../middlewares/index.js';
import {
  registerSchema,
  verifySchema,
  forgetPswdSchema,
  resetPswdSchema,
  loginSchema,
  verifyOtpSchema,
  newPasswordSchema,
} from '../schema/index.js';

const authRoute = express.Router();

authRoute.post(
  '/register',
  validateData(registerSchema),
  authCtrlr.registerUser
);
authRoute.post('/verify-otp', validateData(verifySchema), authCtrlr.verifyOtp);
authRoute.post(
  '/password/forgot',
  validateData(forgetPswdSchema),
  authCtrlr.forgotPassword
);
authRoute.post(
  '/password/verify-forget-password-otp',
  validateData(verifySchema),
  authCtrlr.verifyOtp
);
authRoute.post(
  '/password/reset',
  validateData(resetPswdSchema),
  authCtrlr.resetPassword
);
authRoute.post('/admin/login', validateData(loginSchema), authCtrlr.adminLogin);
authRoute.post('/refresh-token', authCtrlr.refreshAccessToken);

authRoute.post(
  '/password/verify-otp',
  validateData(verifyOtpSchema),
  authCtrlr.verifyPasswordOtp
);
authRoute.post(
  '/password/new',
  validateData(newPasswordSchema),
  authCtrlr.setNewPassword
);
authRoute.post('/user/login', validateData(loginSchema), authCtrlr.userLogin);

export default authRoute;
