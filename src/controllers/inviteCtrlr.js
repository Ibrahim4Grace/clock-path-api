import { Invite, User } from '../models/index.js';
import { sendJsonResponse } from '../helper/index.js';
import {
  asyncHandler,
  Conflict,
  ResourceNotFound,
} from '../middlewares/index.js';
import {
  sendMail,
  sendConfirmationEmail,
  generateOTP,
} from '../utils/index.js';

export const acceptInvite = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const invite = await Invite.findOne({ token });
  if (!invite) {
    throw new ResourceNotFound('Invite not found or already accepted.');
  }

  if (invite.status === 'accepted') {
    throw new Conflict('This invitation has already been accepted.');
  }

  const existingUser = await User.findOne({ email: invite.email });
  if (existingUser) {
    throw new Conflict('Email is already registered.');
  }

  const { otp, hashedOTP } = await generateOTP();

  const newUser = await User.create({
    email: invite.email,
    password: hashedOTP,
    invitedBy: invite.adminName,
    isEmailVerified: true,
  });

  invite.status = 'accepted';
  await invite.save();

  const emailContent = sendConfirmationEmail(newUser, otp);
  await sendMail(emailContent);

  sendJsonResponse(res, 200, 'Invite accepted successfully.');
});

export const declineInvite = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const invite = await Invite.findOne({ token });
  if (!invite) {
    throw new ResourceNotFound('Invite not found.');
  }

  invite.status = 'declined';
  await invite.save();

  sendJsonResponse(res, 200, 'Invite declined successfully.');
});
