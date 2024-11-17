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
  loginNotification,
  generateTokensAndSetCookies,
  welcomeEmail,
  userPasswordService,
  adminPasswordService,
  passwordChangeNotification,
} from '../utils/index.js';

export const registerAdmin = asyncHandler(async (req, res) => {
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

export const adminForgotPassword = asyncHandler(async (req, res) => {
  const message = await adminPasswordService.handleForgotPassword(
    req.body.email
  );
  sendJsonResponse(res, 200, message);
});

export const adminVerifyPasswordOtp = asyncHandler(async (req, res) => {
  const resetToken = await adminPasswordService.handleVerifyOTP(req.body.otp);
  sendJsonResponse(
    res,
    200,
    'OTP verified successfully. You can now reset your password.',
    { resetToken }
  );
});

export const adminResetPassword = asyncHandler(async (req, res) => {
  const resetToken = req.headers.authorization?.split(' ')[1];
  const message = await adminPasswordService.handleResetPassword(
    resetToken,
    req.body.newPassword
  );
  sendJsonResponse(res, 200, message);
});

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }).select('+password');

  if (!admin) {
    throw new ResourceNotFound('Invalid email or password');
  }

  if (!admin.isEmailVerified) {
    throw new Forbidden('Verify your email before sign in.');
  }

  const isPasswordMatch = await admin.matchPassword(password);
  if (!isPasswordMatch) {
    throw new Unauthorized('Invalid email or password');
  }

  const emailContent = loginNotification(admin);
  await sendMail(emailContent);

  // Convert ObjectId to string explicitly
  const userId = admin._id.toString();

  const { accessToken, refreshToken } = generateTokensAndSetCookies(
    res,
    userId
  );

  // Remove sensitive data before sending response
  const userResponse = admin.toObject();
  delete userResponse.password;

  sendJsonResponse(
    res,
    200,
    'Login successful',
    {
      admin: userResponse,
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

export const userVerifyPasscodeOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ResourceNotFound('User not found');
  }

  const otpRecord = await OTP.findOne({ userOrAdmin: user._id }).sort({
    createdAt: -1,
  });
  if (!otpRecord) {
    throw new BadRequest('OTP not found or expired');
  }

  const isOTPMatch = await bcrypt.compare(otp, otpRecord.otp);
  if (!isOTPMatch) {
    throw new Unauthorized('Invalid OTP');
  }

  await OTP.deleteOne({ _id: otpRecord._id });
  const { accessToken } = generateTokensAndSetCookies(res, user._id);

  sendJsonResponse(
    res,
    200,
    'OTP verified successfully. Please set your new password.',
    {
      success: true,
      accessToken,
    }
  );
});

export const userSetNewPassword = asyncHandler(async (req, res) => {
  const { new_password, confirm_password } = req.body;
  const accessToken = req.headers.authorization?.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(accessToken, customEnv.accessSecret);
  } catch (error) {
    throw new Unauthorized('Invalid or expired session token');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ResourceNotFound('User not found');
  }

  user.password = new_password;
  user.isEmailVerified = true;
  await user.save();

  res.clearCookie('accessToken');

  const emailContent = passwordChangeNotification(user);
  await sendMail(emailContent);

  sendJsonResponse(
    res,
    200,
    'Password set successfully. You can now sign in.',
    {
      success: true,
    }
  );
});

export const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ResourceNotFound('Invalid email or password');
  }

  if (!user.isEmailVerified) {
    throw new Forbidden('Verify your email before sign in.');
  }

  const isPasswordMatch = await user.matchPassword(password);
  if (!isPasswordMatch) {
    throw new Unauthorized('Invalid email or passwordd');
  }

  const userId = user._id.toString();
  const { accessToken, refreshToken } = generateTokensAndSetCookies(
    res,
    userId
  );

  const userResponse = user.toObject();
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

export const userForgotPassword = asyncHandler(async (req, res) => {
  const message = await userPasswordService.handleForgotPassword(
    req.body.email
  );
  sendJsonResponse(res, 200, message);
});

export const userVerifyPasswordOtp = asyncHandler(async (req, res) => {
  const resetToken = await userPasswordService.handleVerifyOTP(req.body.otp);
  sendJsonResponse(
    res,
    200,
    'OTP verified successfully. You can now reset your password.',
    { resetToken }
  );
});

export const userResetPassword = asyncHandler(async (req, res) => {
  const resetToken = req.headers.authorization?.split(' ')[1];
  const message = await userPasswordService.handleResetPassword(
    resetToken,
    req.body.new_password
  );
  sendJsonResponse(res, 200, message);
});
