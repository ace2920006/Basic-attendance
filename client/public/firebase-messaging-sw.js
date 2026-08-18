// Service Worker for Firebase Cloud Messaging (Web Push)
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
// Defaults to simulation / placeholder credentials if env variables are not compiled into SW
firebase.initializeApp({
  apiKey: "AIzaSyDemoPlaceholderKeyForAttendanceApp",
  authDomain: "attendance-app-demo.firebaseapp.com",
  projectId: "attendance-app-demo",
  storageBucket: "attendance-app-demo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:demo123456"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title || 'Attendance System Notification';
  const notificationOptions = {
    body: payload.notification.body || 'You have a new update in Attendance System',
    icon: '/vite.svg',
    badge: '/vite.svg',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
