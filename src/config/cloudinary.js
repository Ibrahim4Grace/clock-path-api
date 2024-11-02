import cloudinary from 'cloudinary';
import { customEnv } from '../config/index.js';

cloudinary.config({
  cloud_name: customEnv.cloudinaryCloudName,
  api_key: customEnv.cloudinaryApiName,
  api_secret: customEnv.cloudinarySecretName,
});

export { cloudinary };
