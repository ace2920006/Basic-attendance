let admin = null;
let firebaseInitialized = false;

try {
  admin = require('firebase-admin');

  // Check if Firebase Service Account credentials or JSON env variable is set
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    firebaseInitialized = true;
    console.log('🔥 Firebase Admin SDK initialized successfully with Service Account JSON.');
  } else if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    firebaseInitialized = true;
    console.log('🔥 Firebase Admin SDK initialized with Project ID:', process.env.FIREBASE_PROJECT_ID);
  } else {
    console.log('ℹ️ Firebase credentials not provided in .env (FIREBASE_SERVICE_ACCOUNT_JSON). FCM Web Push running in simulation mode.');
  }
} catch (error) {
  console.warn('⚠️ Firebase Admin SDK initialization skipped:', error.message);
}

/**
 * Send FCM Web Push Notification to user's registered devices
 * @param {object} param0 - recipientId, title, message, data
 */
const sendFCMPushNotification = async ({ recipientId, title, message, data = {} }) => {
  if (!firebaseInitialized || !admin) {
    // In dev simulation mode, log FCM push payload
    // console.log(`[FCM Push Sim] To User ${recipientId}: "${title}" - ${message}`);
    return;
  }

  try {
    const User = require('../models/User');
    const user = await User.findById(recipientId).select('fcmTokens');
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      return;
    }

    const payload = {
      notification: {
        title,
        body: message
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      tokens: user.fcmTokens
    };

    const response = await admin.messaging().sendMulticast(payload);
    console.log(`🔥 FCM Push dispatched to ${response.successCount} devices for user ${recipientId}`);
  } catch (error) {
    console.error('Error sending FCM Push notification:', error);
  }
};

module.exports = {
  admin,
  firebaseInitialized,
  sendFCMPushNotification
};
