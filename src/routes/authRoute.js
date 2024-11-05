import express from 'express';
import * as authCtrlr from '../controllers/index.js';
import { validateData } from '../middlewares/index.js';
import {
  registerSchema,
  verifySchema,
  forgetPswdSchema,
  loginSchema,
  verifyOtpSchema,
  newPasswordSchema,
} from '../schema/index.js';

const authRoute = express.Router();

authRoute.post(
  '/admin/register',
  validateData(registerSchema),
  authCtrlr.registerAdmin
);

authRoute.post(
  '/admin/verify-otp',
  validateData(verifySchema),
  authCtrlr.verifyOtp
);

authRoute.post(
  '/admin/password/forgot',
  validateData(forgetPswdSchema),
  authCtrlr.adminForgotPassword
);

authRoute.post(
  '/admin/password/verify-otp',
  validateData(verifySchema),
  authCtrlr.adminVerifyPasswordOtp
);

authRoute.post(
  '/admin/password/reset',
  validateData(newPasswordSchema),
  authCtrlr.adminResetPassword
);

authRoute.post('/admin/login', validateData(loginSchema), authCtrlr.adminLogin);
authRoute.post('/token/refresh', authCtrlr.refreshAccessToken);

authRoute.post('/user/login', validateData(loginSchema), authCtrlr.userLogin);

authRoute.post(
  '/user/invite/verify-otp',
  validateData(verifyOtpSchema),
  authCtrlr.userVerifyPasscodeOtp
);

authRoute.post(
  '/user/password/new',
  validateData(newPasswordSchema),
  authCtrlr.userSetNewPassword
);

authRoute.post(
  '/user/password/forgot',
  validateData(forgetPswdSchema),
  authCtrlr.userForgotPassword
);

authRoute.post(
  '/user/password/verify-otp',
  validateData(verifySchema),
  authCtrlr.userVerifyPasswordOtp
);

authRoute.post(
  '/user/password/reset',
  validateData(newPasswordSchema),
  authCtrlr.userResetPassword
);
export default authRoute;
