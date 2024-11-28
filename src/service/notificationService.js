import { User, Notification } from '../models/index.js';
import { admins } from '../config/firebase/index.js';
import { asyncHandler } from '../middlewares/index.js';

export const sendPushNotification = asyncHandler(
  async (userId, notificationData) => {
    const user = await User.findById(userId).select('deviceToken');
    if (!user?.deviceToken) {
      return;
    }

    const { title, message, type, status, requestType } = notificationData;

    const firebaseMessage = {
      token: user.deviceToken,
      notification: {
        title,
        body: message,
      },
      data: {
        type: type || '',
        status: status || '',
        title: requestType || '',
        requestType: requestType || '',
      },
      android: {
        priority: 'high',
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
          },
          type: type || '',
          status: status || '',
          requestType: requestType || '',
        },
      },
    };

    const notification = new Notification({
      type,
      title,
      message,
      userId,
      status,
      requestType,
    });
    await notification.save();

    return await admins.messaging().send(firebaseMessage);
  }
);
