import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { customEnv } from '../config/index.js';
import crypto from 'crypto';
import { Invite } from '../models/index.js';

export const generateTokensAndSetCookies = (res, userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid userId format');
  }

  const accessToken = jwt.sign({ id: userId }, customEnv.accessSecret, {
    expiresIn: customEnv.accessExpireTime,
  });

  const refreshToken = jwt.sign({ id: userId }, customEnv.refreshSecret, {
    expiresIn: customEnv.refreshExpireTime,
  });

  res.cookie('accessToken', accessToken, {
    maxAge: 15 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.cookie('refreshToken', refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return { accessToken, refreshToken };
};

export const generateInviteToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const saveInviteToDatabase = async (email, token, admin, adminName) => {
  await Invite.create({
    adminName,
    email,
    token,
    adminId: admin,
    status: 'pending',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
};
