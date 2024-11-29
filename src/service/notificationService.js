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
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        timestamp: new Date().getTime().toString(),
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'reminders',
          defaultSound: true,
        },
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: 'default',
            'content-available': 1,
            priority: 10,
          },
        },
        headers: {
          'apns-push-type': 'alert',
          'apns-priority': '10',
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
      deviceToken: user.deviceToken,
      delivered: false,
    });
    await notification.save();

    const result = await admins.messaging().send(firebaseMessage);

    await Notification.findByIdAndUpdate(notification._id, {
      delivered: true,
      deliveryAttemptTime: new Date(),
      messageId: result,
    });

    return result;
  }
);
