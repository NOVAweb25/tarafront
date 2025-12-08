import React from "react";
import "./NotificationPopup.css";

export default function NotificationPopup({ message, onAllow, onClose }) {
  return (
    <div className="notif-popup">
      <div className="notif-box">
        <p>{message}</p>

        <div className="notif-actions">
          <button className="allow-btn" onClick={onAllow}>
            تفعيل الإشعارات
          </button>

          <button className="cancel-btn" onClick={onClose}>
            لاحقاً
          </button>
        </div>
      </div>
    </div>
  );
}
