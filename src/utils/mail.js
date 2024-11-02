import nodemailer from 'nodemailer';
import { customEnv } from '../config/index.js';
import { log } from '../utils/index.js';
import { ServerError } from '../middlewares/index.js';

export const sendMail = async (emailcontent) => {
  const transporter = nodemailer.createTransport({
    service: customEnv.mailerService,
    host: 'smtp.gmail.com',
    auth: {
      user: customEnv.nodemailerEmail,
      pass: customEnv.nodemailerPassword,
    },
  });

  try {
    await transporter.sendMail(emailcontent);
    return 'Email sent successfully.';
  } catch (error) {
    log.error(error);
    throw new ServerError(error);
  }
};
