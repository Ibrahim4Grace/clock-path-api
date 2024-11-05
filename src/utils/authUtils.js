import bcrypt from 'bcryptjs';
import otpGenerator from 'otp-generator';
import { OTP, User, Admin } from '../models/index.js';
import { customEnv } from '../config/index.js';
import jwt from 'jsonwebtoken';
import {
  asyncHandler,
  ResourceNotFound,
  BadRequest,
} from '../middlewares/index.js';

import {
  sendMail,
  forgetPasswordMsg,
  sendPasswordResetEmail,
} from '../utils/index.js';

const hashFunction = async (data) => {
  const saltRounds = 10;
  return bcrypt.hash(data, saltRounds);
};

export const generateOTP = async () => {
  const otp = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  const hashedOTP = await hashFunction(otp);
  return { otp, hashedOTP };
};

export const saveOTPToDatabase = asyncHandler(
  async (userId, otp, hashedOTP) => {
    const newOTP = new OTP({
      userOrAdmin: userId,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    await newOTP.save();
    return otp;
  }
);

// Base password reset service
class PasswordResetService {
  constructor(Model, userType) {
    this.Model = Model;
    this.userType = userType;
  }

  async handleForgotPassword(email) {
    const user = await this.Model.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      throw new ResourceNotFound(`${this.userType} email not found`);
    }

    // Clean up any existing OTPs
    await OTP.deleteMany({ userOrAdmin: user._id });

    // Generate and save new OTP
    const { otp, hashedOTP } = await generateOTP();
    await saveOTPToDatabase(user._id, otp, hashedOTP);

    // Send email
    const emailContent = forgetPasswordMsg(user, otp);
    await sendMail(emailContent);

    return 'Your 6-digit Verification Code has been sent.';
  }

  async handleVerifyOTP(otp) {
    const existingOtp = await OTP.findOne({
      otp: { $exists: true },
      expiresAt: { $gt: new Date() },
    }).select('+otp');

    if (!existingOtp) {
      throw new BadRequest('Invalid or expired OTP');
    }

    const userId = existingOtp.userOrAdmin;
    const user = await this.Model.findById(userId);

    if (!user) {
      throw new ResourceNotFound(`${this.userType} not found!`);
    }

    // Verify OTP
    const isOTPValid = await bcrypt.compare(otp, existingOtp.otp);
    if (!isOTPValid || new Date() > existingOtp.expiresAt) {
      throw new BadRequest('Invalid or expired OTP');
    }

    // Clean up used OTP
    await OTP.deleteOne({ _id: existingOtp._id });

    // Generate reset token
    const resetToken = jwt.sign(
      {
        userId: existingOtp.userOrAdmin,
        type: this.userType.toLowerCase(),
      },
      customEnv.jwtSecret,
      {
        expiresIn: customEnv.jwtExpiry,
        audience: `${this.userType.toLowerCase()}-reset`,
      }
    );

    return resetToken;
  }

  async handleResetPassword(resetToken, new_password) {
    if (!resetToken) {
      throw new BadRequest('Reset token is missing');
    }

    try {
      const decoded = jwt.verify(resetToken, customEnv.jwtSecret, {
        audience: `${this.userType.toLowerCase()}-reset`,
      });

      if (decoded.type !== this.userType.toLowerCase()) {
        throw new BadRequest('Invalid reset token');
      }

      const user = await this.Model.findById(decoded.userId);
      if (!user) {
        throw new ResourceNotFound(`${this.userType} not found`);
      }

      // Update password with proper hashing (assuming you have a pre-save hook)
      user.password = new_password;
      await user.save();

      // Clean up any remaining OTPs
      await OTP.deleteMany({ userOrAdmin: decoded.userId });

      // Send confirmation email
      const emailContent = sendPasswordResetEmail(user);
      await sendMail(emailContent);

      return 'Password reset successfully';
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new BadRequest('Invalid reset token');
      }
      if (error.name === 'TokenExpiredError') {
        throw new BadRequest('Reset token has expired');
      }
      throw error;
    }
  }
}

export const userPasswordService = new PasswordResetService(User, 'User');
export const adminPasswordService = new PasswordResetService(Admin, 'Admin');
