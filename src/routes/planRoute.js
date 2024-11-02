import express from 'express';
import * as planCtrlr from '../controllers/index.js';
import { plansSchema } from '../schema/index.js';
import {
  validateData,
  authMiddleware,
  adminMiddleware,
} from '../middlewares/index.js';

const planRouter = express.Router();

planRouter.post(
  '/plans',
  authMiddleware,
  adminMiddleware,
  validateData(plansSchema),
  planCtrlr.createPlan
);

planRouter.get('/plans', planCtrlr.getPlans);

export default planRouter;
