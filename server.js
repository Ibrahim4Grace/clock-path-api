import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import { db, corsOptions, setupSwagger } from './src/config/index.js';
import { log } from './src/utils/index.js';
import { notFoundMIiddleware, errorHandler } from './src/middlewares/index.js';
// import keepAlive from './src/config/cronJob.js';
import routes from './src/routes/index.js';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import statusMonitor from 'express-status-monitor';
import colors from 'colors';

db.connectDb();

const app = express();

app.use(statusMonitor());

app.use(cors(corsOptions));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));
app.use(cookieParser());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later',
});
app.use('/api', apiLimiter);

app.get('/', (req, res) => {
  res.send('Cloth-Path API is running');
});

app.use(routes);
setupSwagger(app);

app.use(notFoundMIiddleware);
app.use(errorHandler);

const port = process.env.PORT || 6000;

app.listen(port, () => {
  log.info(`Server running on port ${port}`.yellow);
});

// // Start cron job keepAlive function
// keepAlive();
