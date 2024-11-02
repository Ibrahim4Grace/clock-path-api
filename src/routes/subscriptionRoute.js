import express from 'express';
import * as subscriptionCtrlr from '../controllers/index.js';
import { chargeRequestSchema, pinSchema, otpSchema } from '../schema/index.js';
import {
  validateData,
  authMiddleware,
  adminMiddleware,
} from '../middlewares/index.js';

const subscriptionRouter = express.Router();

subscriptionRouter.post(
  '/initialize',
  authMiddleware,
  adminMiddleware,
  subscriptionCtrlr.initializeSubscription
);

subscriptionRouter.get(
  '/verify/:reference',
  authMiddleware,
  adminMiddleware,
  subscriptionCtrlr.verifySubscription
);

subscriptionRouter.post(
  '/charge-card',
  authMiddleware,
  adminMiddleware,
  validateData(chargeRequestSchema),
  subscriptionCtrlr.chargeCard
);
subscriptionRouter.post(
  '/submit-pin',
  authMiddleware,
  adminMiddleware,
  validateData(pinSchema),
  subscriptionCtrlr.submitPin
);
subscriptionRouter.post(
  '/submit-otp',
  authMiddleware,
  adminMiddleware,
  validateData(otpSchema),
  subscriptionCtrlr.submitOtp
);

export default subscriptionRouter;
