import dotenv from 'dotenv';

dotenv.config();

export const customEnv = {
  frontendDevUrl: process.env.FRONTEND_URL_DEV,
  frontendProUrl: process.env.FRONTEND_URL_PROD,

  port: process.env.PORT,

  nodeEnv: process.env.NODE_ENV || 'development',

  paystackSecret: process.env.PAYSTACK_SECRET_KEY,

  cors: process.env.CORS_WHITELIST,

  mongoDbURI: process.env.MONGODB_URI,

  jwtExpiry: process.env.JWT_EXPIRY,
  jwtSecret: process.env.JWT_SECRET,

  accessSecret: process.env.ACCESS_SECRET,
  refreshSecret: process.env.REFRESH_SECRET,

  accessExpireTime: process.env.ACCESS_EXPIRATION_TIME,
  refreshExpireTime: process.env.REFRESH_EXPIRATION_TIME,

  mailerService: process.env.MAILER_SERVICE,
  nodemailerEmail: process.env.NODEMAILER_EMAIL,
  nodemailerPassword: process.env.NODEMAILER_PASSWORD,

  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiName: process.env.CLOUDINARY_API_NAME,
  cloudinarySecretName: process.env.CLOUDINARY_SECRET_NAME,
};
