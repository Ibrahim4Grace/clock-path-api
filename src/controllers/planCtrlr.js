import { Plan } from '../models/index.js';
import { sendJsonResponse } from '../helper/index.js';
import { asyncHandler, Conflict } from '../middlewares/index.js';

export const createPlan = asyncHandler(async (req, res) => {
  const { name, price, currency, duration, features } = req.body;

  const existingPlan = await Plan.findOne({ name });
  if (existingPlan) {
    throw new Conflict('Plan with this name already exists');
  }

  const plan = await Plan.create({
    name,
    price,
    features,
    currency,
    duration,
  });

  sendJsonResponse(res, 201, 'Plan created successfully', plan);
});

export const getPlans = asyncHandler(async (req, res) => {
  const plans = await Plan.find({ isActive: true });
  sendJsonResponse(res, 200, plans);
});
