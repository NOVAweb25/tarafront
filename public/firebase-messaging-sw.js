/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js");

firebase.initializeApp({
   apiKey: "AIzaSyB6lOJS5aY5wOkjYlib9bl5YAMu9jLsM-g",
  authDomain: "poise-dc7b7.firebaseapp.com",
  projectId: "poise-dc7b7",
  storageBucket: "poise-dc7b7.firebasestorage.app",
  messagingSenderId: "589037198223",
  appId: "1:589037198223:web:a044cdf653163e1a4949fa",
  measurementId: "G-LTX58DDBV4"
});

const messaging = firebase.messaging();

// ✅ عرض الإشعار في الخلفية (خارج الموقع)
messaging.onBackgroundMessage((payload) => {
  console.log("📱 Background Message:", payload);
  const { title, body } = payload.notification;

  self.registration.showNotification(title, {
    body,
    icon: "/logo192.png",
    data: payload.data,
  });
});
