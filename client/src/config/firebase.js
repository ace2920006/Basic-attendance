import { registerFCMTokenApi } from '../services/api';

/**
 * Request Browser Web Push Notification permissions and register FCM token
 */
export const requestPushPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    return { success: false, message: 'Browser does not support push notifications' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // In production with active FCM VAPID key:
      // const token = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
      // Generate a client push token or simulation token for testing:
      const token = `fcm_web_token_${Math.random().toString(36).substring(2)}_${Date.now()}`;
      await registerFCMTokenApi(token);
      return { success: true, permission: 'granted', token };
    } else {
      return { success: false, permission, message: 'Notification permission denied by user' };
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return { success: false, message: error.message };
  }
};
