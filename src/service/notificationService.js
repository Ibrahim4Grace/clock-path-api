import { User, Notification } from '../models/index.js';
import { admins } from '../config/firebase/index.js';
import { asyncHandler } from '../middlewares/index.js';

export const sendPushNotification = asyncHandler(
  async (userId, notificationData) => {
    try {
      // Get user with device token
      const user = await User.findById(userId).select('deviceToken');
      if (!user?.deviceToken) {
        console.log(`No device token found for user ${userId}`);
        return;
      }

      const { title, message, type, status, requestType } = notificationData;

      // Create notification message
      const firebaseMessage = {
        token: user.deviceToken,
        notification: {
          title,
          body: message,
        },
        android: {
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              badge: 1,
            },
          },
        },
      };

      // Save notification to database
      const notification = new Notification({
        type,
        title,
        message,
        userId,
        status,
        requestType,
      });
      await notification.save();

      // Send push notification
      return await admins.messaging().send(firebaseMessage);
    } catch (error) {
      console.error('Push notification error:', error);
      throw error;
    }
  }
);
