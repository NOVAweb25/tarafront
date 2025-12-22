import { initializeApp } from "firebase/app";
import { onMessage } from "firebase/messaging";
import { getMessaging, getToken } from "firebase/messaging";
import { API_BASE, VAPID_KEY } from "./firebaseConfig";
// ⬆ سننشئ هذا الملف الآن

const firebaseConfig = {
  apiKey: "AIzaSyB6lOJS5aY5wOkjYlib9bl5YAMu9jLsM-g",
  authDomain: "poise-dc7b7.firebaseapp.com",
  projectId: "poise-dc7b7",
  storageBucket: "poise-dc7b7.firebasestorage.app",
  messagingSenderId: "589037198223",
  appId: "1:589037198223:web:a044cdf653163e1a4949fa",
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// 🟢 طلب صلاحيات الإشعارات وتسجيل التوكن
export const requestNotificationPermission = async (userId) => {
  try {
    // 🔹 التحقق الجديد: هل Service Worker و Push Manager مدعومين؟
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("🛑 Web Push Notifications غير مدعومة في هذا المتصفح (مثل iOS).");
      return; // يمنع محاولة الحصول على token ويستمر الـ app
    }

    let token = null;
    try {
      token = await getToken(messaging, { vapidKey: VAPID_KEY });
    } catch (err) {
      console.warn("FCM Token Error:", err);
      return; // يمنع الكراش
    }

    if (token) {
      console.log("🔑 fcmToken:", token);
      await fetch(`${API_BASE}/users/${userId}/fcm-token`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fcmToken: token }),
      });
    } else {
      console.warn("⚠️ المستخدم لم يمنح إذن الإشعارات");
    }
  } catch (err) {
    console.error("❌ فشل في طلب الإذن للإشعارات:", err);
  }
};

export const listenToMessages = (onNotification) => {
  try {
    onMessage(messaging, (payload) => {
      console.log("📩 إشعار مباشر:", payload);
      const title = payload?.notification?.title || "إشعار جديد";
      const body = payload?.notification?.body || "";
      if (onNotification) {
        onNotification({ title, body });
      }
      if (Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/logo192.png",
          vibrate: [100, 50, 100],
          tag: "order-update",
        });
      }
    });
  } catch (err) {
    console.error("❌ خطأ في الاستماع للإشعارات:", err);
  }
};