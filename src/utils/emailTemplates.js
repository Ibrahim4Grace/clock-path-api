import { customEnv } from '../config/index.js';

export const sendOTPByEmail = async (newAdmin, otp, otpExpiryHours = 24) => ({
  from: customEnv.nodemailerEmail,
  to: newAdmin.email,
  subject: 'Your 6-digit Verification Code',
  html: `  <p>Dear ${newAdmin.full_name}, </p>
      <p>Use the 6-digit Code provided below to verify your email:</p>
      <p>Your verification code is: <b>${otp}</b></p>
      <p>This code will expire in ${otpExpiryHours} hours.</p>
      <p>If you didn't register, please ignore this email.</p>
      <p>Best regards,<br>
          The Clock Path Team</p>`,
});

export const welcomeEmail = (admin) => ({
  from: customEnv.nodemailerEmail,
  to: admin.email,
  subject: 'Welcome to Clock Path',
  html: `<p>Hello ${admin.full_name},</p>

      <p>Your account has been successfully created, granting you access to our platform's exciting features.</p>
      <p>Should you have any inquiries or require assistance, please don't hesitate to contact our support team.Your satisfaction is our priority, and we are committed to providing you with the assistance you need.</p>
        <p>Best regards,<br>
        The Clock Path Team</p>`,
});

export const forgetPasswordMsg = (admin, otp, otpExpiryHours = 24) => ({
  from: customEnv.nodemailerEmail,
  to: admin.email,
  subject: 'Password Reset Request',
  html: `
  <p>Greetings ${admin.full_name} from Clock Path Services,</p>
  <p>We received a request to reset the password for the Clock Path account associated with this e-mail address.</p>

      <p>Use the 6-digit Code provided below to reset your password:</p>
      <p>Your verification code is: <b>${otp}</b></p>
      <p>This code will expire in ${otpExpiryHours} hours.</p>
      <p>If you did not request to have your password reset, you can safely ignore this email. Rest assured your Clock Path Services account is safe.</p>
      <p>Best regards,<br>
      The Clock Path Team</p>`,
});

export const sendPasswordResetEmail = (admin) => ({
  from: customEnv.nodemailerEmail,
  to: admin.email,
  subject: 'Password Reset Confirmation',
  html: `
            <p>Hello ${admin.full_name},</p>
            <p>Your password has been successfully reset. If you did not perform this action, please contact our support team immediately.</p>

            <p>Best regards,<br>
            The Clock Path Team</p>`,
});

export const loginNotification = (account) => ({
  from: customEnv.nodemailerEmail,
  to: account.email,
  subject: 'New Login Detected!',
  html: `
            <p>Hello ${account.full_name},</p>
            
            <p>You recently sign in to your Clock Path account. If you initiated the request to sign into Clock Path, kindly ignore the mail.</p>

            <p>If you did not initiate the request to sign in to your Clock Path account, we strongly advise you to change your account password. Additionally, we encourage you to enable multi-factor authentication to add an additional layer of protection to your Clock Path account.</p>
            
            <p>Best regards,<br>
        The Clock Path Team</p>`,
});

export const sendInvitationEmail = (
  email,
  adminName,
  invitationLink,
  declineLink
) => ({
  from: customEnv.nodemailerEmail,
  to: email,
  subject: `${adminName} has invited you to join Clockpath!`,
  html: `
    <p>${adminName} has invited you to join Clockpath.</p>
    <p>Click the link below to accept the invitation:</p>
    <a href="${invitationLink}">${invitationLink}</a>

    <p>If you would like to decline this invitation, please click <a href="${declineLink}">here</a>.</p>
    <p>This invitation will expire in 7 days.</p>
    <p>Best regards,<br>The Clockpath Team</p>
  `,
});

export const sendConfirmationEmail = (newUser, otp) => ({
  from: customEnv.nodemailerEmail,
  to: newUser.email,
  subject: `Welcome to Clockpath! 🎉`,
  html: `
    <h2>Welcome to Clockpath!</h2>
    <p>We're excited to have you on board! You've successfully joined Clockpath and now part of the organization.</p>
    
    <p>To log in for the first time:</p>
    <p><strong>Email:</strong> ${newUser.email}</p>
    <p><strong>Temporary Passcode:</strong> ${otp}</p>
    
    <p>Use this passcode to log in and set up your new password.</p>
    
    <p>Here's what you can do next:</p>
    <ul>
      <li>Explore our platform and get familiar with its features.</li>
      <li>Connect with your team and start collaborating effectively.</li>
      <li>Reach out to support if you have any questions along the way.</li>
    </ul>
    
    <p>Thank you for joining us, and we look forward to supporting you every step of the way.</p>
    
    <p>Best regards,<br>The Clockpath Team</p>
  `,
});

export const updatePassword = (user) => ({
  from: customEnv.nodemailerEmail,
  to: user.email,
  subject: `Password Update Confirmation`,
  html: `
    <h2>Welcome to Clockpath!</h2>
    <p>We wanted to inform you that your password has been successfully updated.</p>
    <p>If you did not make this change or if you have any concerns regarding your account security, please contact us immediately.</p>
    <p>Thank you for keeping your account secure!</p>
    <p>Best regards,<br>The Clockpath Team</p>
  `,
});
