import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to create the directory if it doesn't exist
const createDirectoryIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

export const adminImage = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.resolve(__dirname, '../public/adminImage/');
      createDirectoryIfNotExists(dir); // Ensure the directory exists
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(
        null,
        file.fieldname + '_' + Date.now() + path.extname(file.originalname)
      );
    },
  }),
  limits: { fileSize: 1000000 },
});

export const userImage = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.resolve(__dirname, '../public/userImage/');
      createDirectoryIfNotExists(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(
        null,
        file.fieldname + '_' + Date.now() + path.extname(file.originalname)
      );
    },
  }),
  limits: { fileSize: 1000000 },
});

export const cvsUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.resolve(__dirname, '../public/cvsUpload/');
      createDirectoryIfNotExists(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + path.extname(file.originalname);
      cb(null, `${file.fieldname}_${uniqueSuffix}`);
    },
  }),
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => {
    const acceptedMimeTypes = [
      'text/csv',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (acceptedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new multer.MulterError(
          'LIMIT_UNEXPECTED_FILE',
          'Only CSV, TXT, or Excel files are allowed'
        )
      );
    }
  },
});
