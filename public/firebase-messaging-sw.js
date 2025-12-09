importScripts("https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js");
firebase.initializeApp({
  apiKey: "AIzaSyB6lOJS5aY5wOkjYlib9bl5YAMu9jLsM-g",
  authDomain: "poise-dc7b7.firebaseapp.com",
  projectId: "poise-dc7b7",
  storageBucket: "poise-dc7b7.appspot.com", // أضفته
  messagingSenderId: "589037198223",
  appId: "1:589037198223:web:a044cdf653163e1a4949fa",
});
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  console.log("Background notification:", payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo192.png",
  });
});