import { DeviceToken } from '../models/index.js';
import admin from 'firebase-admin';

// import serviceAccount from '../config/firebase/incoming.json'  };

// Initialize Firebase Admin SDK
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

class NotificationService {
  static async sendPushNotification(userId, notificationData) {
    try {
      // Get user's device token
      const deviceToken = await DeviceToken.findOne({ userId });

      if (!deviceToken) {
        throw new Error('No device token found for user');
      }

      const message = {
        notification: {
          title: notificationData.title,
          body: notificationData.body,
        },
        data: {
          type: notificationData.type,
          // Add any additional data needed by the mobile app
        },
        token: deviceToken.deviceToken,
      };

      // Send message
      // const response = await admin.messaging().send(message);
      return response;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }
}

export { NotificationService };
