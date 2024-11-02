import express from 'express';
import * as authCtrlr from '../controllers/index.js';
import { validateData } from '../middlewares/index.js';
import {
  registerSchema,
  verifySchema,
  forgetPswdSchema,
  resetPswdSchema,
  loginSchema,
} from '../schema/index.js';

const authRoute = express.Router();

authRoute.post(
  '/register',
  validateData(registerSchema),
  authCtrlr.registerPage
);

authRoute.post('/verify-otp', validateData(verifySchema), authCtrlr.verifyOtp);

authRoute.post(
  '/forget-password',
  validateData(forgetPswdSchema),
  authCtrlr.forgetPasswordOtp
);

authRoute.post(
  '/verify-forget-password-otp',
  validateData(verifySchema),
  authCtrlr.verifyForgetPwdOtp
);

authRoute.post(
  '/reset-password',
  validateData(resetPswdSchema),
  authCtrlr.resetPassword
);

authRoute.post('/login', validateData(loginSchema), authCtrlr.loginPage);

authRoute.post('/refresh-token', authCtrlr.refreshAccessToken);

export default authRoute;
