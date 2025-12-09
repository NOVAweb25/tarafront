import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// import { messaging } from './firebase'; // مش محتاج ده هنا، لأن مش هنستخدم useServiceWorker

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 🟢 تسجيل Service Worker لـ FCM (بدون ربط يدوي)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/firebase-messaging-sw.js')
      .then((registration) => {
        console.log('✅ SW registered:', registration.scope);
        // أزل هذا السطر: messaging.useServiceWorker(registration);
      })
      .catch((err) => console.error('❌ SW registration failed:', err));
  });
}

reportWebVitals();