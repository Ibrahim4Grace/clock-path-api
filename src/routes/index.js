import express from 'express';
const router = express.Router();


import authRoute from './authRoute.js';
import userRoute from './userRoute.js';
import adminRoute from './adminRoute.js';
import planRoute from './planRoute.js';
import subscriptionRoute from './subscriptionRoute.js';


router.use('/api/v1/auth', authRoute);
router.use('/api/v1/user', userRoute);
router.use('/api/v1/admin', adminRoute);
router.use('/api/v1/admin', planRoute);
router.use('/api/v1/admin/subscriptions', subscriptionRoute);

export default router;
