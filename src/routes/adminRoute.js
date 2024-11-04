import express from 'express';
import * as adminCtrlr from '../controllers/index.js';
import { adminImage, cvsUpload, userImage } from '../config/index.js';
import { paginatedResults } from '../utils/index.js';
import { User, Request, ClockIn } from '../models/index.js';
import {
  inviteSchema,
  updateUserSchema,
  passwordSchema,
  companySchema,
} from '../schema/index.js';
import {
  validateData,
  authMiddleware,
  adminMiddleware,
  checkUserLimit,
} from '../middlewares/index.js';

const adminRoute = express.Router();

adminRoute.post(
  '/register-company',
  authMiddleware,
  adminMiddleware,
  validateData(companySchema),
  adminCtrlr.registerCompany
);

adminRoute.get(
  '/dashboard-stats',
  authMiddleware,
  adminMiddleware,
  adminCtrlr.getAdminStats
);

adminRoute.get(
  '/users',
  authMiddleware,
  adminMiddleware,
  paginatedResults(User),
  adminCtrlr.allUser
);

adminRoute.get(
  '/users/:id',
  authMiddleware,
  adminMiddleware,
  adminCtrlr.editUser
);

adminRoute.put(
  '/users/:id',
  authMiddleware,
  adminMiddleware,
  userImage.single('image'),
  validateData(updateUserSchema),
  adminCtrlr.editUserPost
);

adminRoute.delete(
  '/users/:id',
  authMiddleware,
  adminMiddleware,
  adminCtrlr.deleteUser
);

adminRoute.post(
  '/invite',
  authMiddleware,
  adminMiddleware,
  validateData(inviteSchema),
  checkUserLimit,
  adminCtrlr.inviteUser
);

adminRoute.post(
  '/invite-bulk',
  authMiddleware,
  adminMiddleware,
  cvsUpload.single('csvFile'),
  validateData(inviteSchema),
  adminCtrlr.inviteBulkUsers
);

adminRoute.get(
  '/clock-in',
  authMiddleware,
  adminMiddleware,
  paginatedResults(ClockIn),
  adminCtrlr.getAllClockInRecords
);

adminRoute.get(
  '/requests',
  authMiddleware,
  adminMiddleware,
  paginatedResults(Request),
  adminCtrlr.getUserRequest
);

adminRoute.get(
  '/requests/:id',
  authMiddleware,
  adminMiddleware,
  adminCtrlr.getRequestById
);

adminRoute.patch(
  '/requests/:id/status',
  authMiddleware,
  adminMiddleware,
  adminCtrlr.updateRequestStatus
);

adminRoute.get(
  '/attendance-summary',
  authMiddleware,
  adminMiddleware,
  paginatedResults(User),
  adminCtrlr.getAttendanceSummary
);

adminRoute.get(
  '/export-summary',
  authMiddleware,
  adminMiddleware,
  paginatedResults(User),
  adminCtrlr.exportAttendanceSummary
);

adminRoute.post(
  '/users',
  authMiddleware,
  adminMiddleware,
  adminImage.single('image'),
  adminCtrlr.adminProfilePost
);

adminRoute.post(
  '/passwords',
  authMiddleware,
  adminMiddleware,
  validateData(passwordSchema),
  adminCtrlr.managePassword
);

export default adminRoute;
