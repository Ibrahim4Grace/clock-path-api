import bcrypt from 'bcryptjs';
import { User, OTP, Admin } from '../models/index.js';
import { customEnv } from '../config/index.js';
import jwt from 'jsonwebtoken';
import { sendJsonResponse } from '../helper/index.js';
import {
  asyncHandler,
  Conflict,
  ResourceNotFound,
  BadRequest,
  Forbidden,
  Unauthorized,
} from '../middlewares/index.js';
import {
  sendMail,
  generateOTP,
  saveOTPToDatabase,
  sendOTPByEmail,
  forgetPasswordMsg,
  sendPasswordResetEmail,
  loginNotification,
  generateTokensAndSetCookies,
  welcomeEmail,
} from '../utils/index.js';

export const registerPage = asyncHandler(async (req, res) => {
  const { full_name, email, password } = req.body;

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    throw new Conflict('Email already registered!');
  }

  const newAdmin = new Admin({
    full_name,
    email,
    password,
  });
  await newAdmin.save();

  const { otp, hashedOTP } = await generateOTP();
  await saveOTPToDatabase(newAdmin._id, otp, hashedOTP);
  const emailContent = await sendOTPByEmail(newAdmin, otp);
  await sendMail(emailContent);

  sendJsonResponse(
    res,
    201,
    'Registration successful. Please verify your email.'
  );
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  const existingOtp = await OTP.findOne({ otp: { $exists: true } });
  if (!existingOtp) {
    throw new BadRequest('Invalid or expired OTP');
  }

  const userId = existingOtp.userOrAdmin;
  const admin = await Admin.findById(userId);
  if (!admin) {
    throw new ResourceNotFound('Admin not found!');
  }

  const isOTPValid = await bcrypt.compare(otp, existingOtp.otp);
  if (!isOTPValid || new Date() > existingOtp.expiresAt) {
    throw new BadRequest('Invalid or expired OTP');
  }

  admin.isEmailVerified = true;
  await admin.save();
  await OTP.deleteOne({ _id: existingOtp._id });

  const emailContent = welcomeEmail(admin);
  await sendMail(emailContent);

  sendJsonResponse(res, 200, 'Email Verified successfully.');
});

export const forgetPasswordOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) {
    throw new ResourceNotFound('Email not found');
  }

  await OTP.deleteMany({ userOrAdmin: admin._id });

  const { otp, hashedOTP } = await generateOTP();
  await saveOTPToDatabase(admin._id, otp, hashedOTP);

  const emailContent = forgetPasswordMsg(admin, otp);
  await sendMail(emailContent);

  sendJsonResponse(res, 200, 'Your 6-digit Verification Code has been sent.');
});

export const verifyForgetPwdOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  const existingOtp = await OTP.findOne({
    otp: { $exists: true },
    expiresAt: { $gt: new Date() },
  });

  if (!existingOtp) {
    throw new BadRequest('Invalid or expired OTP');
  }

  const userId = existingOtp.userOrAdmin;
  const admin = await Admin.findById(userId);
  if (!admin) {
    throw new ResourceNotFound('Admin not found!');
  }

  const isOTPValid = await bcrypt.compare(otp, existingOtp.otp);
  if (!isOTPValid || new Date() > existingOtp.expiresAt) {
    throw new BadRequest('Invalid or expired OTP');
  }

  await OTP.deleteOne({ _id: existingOtp._id });

  const resetToken = jwt.sign(
    { userId: existingOtp.userOrAdmin },
    customEnv.jwtSecret,
    { expiresIn: customEnv.jwtExpiry }
  );

  sendJsonResponse(
    res,
    200,
    'OTP verified successfully. You can now reset your password.',
    resetToken
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword, confirm_newPassword } = req.body;

  const resetToken = req.headers.authorization?.split(' ')[1];

  if (!resetToken) throw new BadRequest('Reset token is missing');

  const decoded = jwt.verify(resetToken, customEnv.jwtSecret);
  const userId = decoded.userId;
  const admin = await Admin.findById(userId);
  if (!admin) throw new ResourceNotFound('Admin not found');

  admin.password = newPassword;
  await admin.save();

  await OTP.deleteOne({ admin: userId });

  const emailContent = sendPasswordResetEmail(admin);
  await sendMail(emailContent);

  sendJsonResponse(res, 200, 'Password reset successfully');
});

export const loginPage = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const account =
    (await Admin.findOne({ email }).select('+password')) ||
    (await User.findOne({ email }).select('+password'));

  if (!account) {
    throw new ResourceNotFound('Invalid email or password');
  }

  if (!account.isEmailVerified) {
    throw new Forbidden('Verify your email before sign in.');
  }

  const isPasswordMatch = await account.matchPassword(password);
  if (!isPasswordMatch) {
    throw new Unauthorized('Invalid email or passwordd');
  }

  const emailContent = loginNotification(account);
  await sendMail(emailContent);

  // Convert ObjectId to string explicitly
  const userId = account._id.toString();

  const { accessToken, refreshToken } = generateTokensAndSetCookies(
    res,
    userId
  );

  // Remove sensitive data before sending response
  const userResponse = account.toObject();
  delete userResponse.password;

  sendJsonResponse(
    res,
    200,
    'Login successful',
    {
      user: userResponse,
    },
    accessToken,
    refreshToken
  );
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new Unauthorized('No refresh token provided');
  }

  const decoded = jwt.verify(refreshToken, customEnv.refreshSecret);

  const account =
    (await Admin.findById(decoded.id)) || (await User.findById(decoded.id));

  if (!account) {
    throw new Unauthorized('Account not found');
  }

  const { accessToken, refreshToken: newRefreshToken } =
    generateTokensAndSetCookies(res, account._id.toString());

  sendJsonResponse(
    res,
    200,
    'Token refreshed successfully',
    null,
    accessToken,
    newRefreshToken
  );
});
