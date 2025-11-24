// src/pages/client/Account.js
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "../../components/BottomNav";
import {
  getUserById,
  updateUser,
  verifyPassword,
  updateUsername,
  updatePassword,
} from "../../api/api";
import "./Account.css";

const Account = () => {
  const userId = JSON.parse(localStorage.getItem("user"))?._id;
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [editField, setEditField] = useState(null);
  const [locationDetected, setLocationDetected] = useState(false);
   const [sheetError, setSheetError] = useState("");
const editIcon= "https://res.cloudinary.com/dp1bxbice/image/upload/v1763968570/edit_xmyhv0.svg";
const closeIcon= "https://res.cloudinary.com/dp1bxbice/image/upload/v1763968567/close_mcygjs.svg";

  const [editModal, setEditModal] = useState(null);
  const [step, setStep] = useState(1);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // 🟢 تحميل بيانات المستخدم
  useEffect(() => {
    if (userId) loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      const res = await getUserById(userId);
      const u = res.data;
      setUser(u);
      setFormData({
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        phone: u.phone || "",
        location: u.location || "",
        latitude: u.latitude || null,
        longitude: u.longitude || null,
        address: u.address || "",
      });
    } catch (err) {
      console.error("Error loading user:", err);
    }
  };

  // 💾 حفظ البيانات العامة
  const handleSave = async () => {
    try {
      await updateUser(userId, formData);
      await loadUser();
      alert("✅ تم حفظ البيانات بنجاح");
      setEditField(null);
      setLocationDetected(false);
    } catch (err) {
      alert(err.response?.data?.message || "حدث خطأ أثناء حفظ البيانات");
    }
  };

  // 📍 تحديد الموقع الذكي
  const detectLocation = () => {
    if (!navigator.geolocation) return alert("المتصفح لا يدعم تحديد الموقع");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`;

        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ar`
          );
          const geoData = await geoRes.json();

          const { city, town, village, suburb, neighbourhood, road } = geoData.address || {};
          const address = [city || town || village, suburb || neighbourhood, road]
            .filter(Boolean)
            .join("، ");

          setFormData((prev) => ({
            ...prev,
            latitude,
            longitude,
            location: url,
            address: address || "لم يتم العثور على عنوان دقيق",
          }));

          setLocationDetected(true);
        } catch (err) {
          console.error("خطأ في جلب العنوان:", err);
          setFormData((prev) => ({
            ...prev,
            latitude,
            longitude,
            location: url,
          }));
          setLocationDetected(true);
        }
      },
      (err) => alert("تعذر تحديد الموقع: " + err.message)
    );
  };

  // 🔒 النوافذ المنبثقة
  const resetModal = () => {
    setEditModal(null);
    setStep(1);
    setCurrentPassword("");
    setNewUsername("");
    setCurrentUsername("");
    setNewPassword("");
  };

 const handleVerifyPassword = async () => {
  try {
    const res = await verifyPassword({ userId, password: currentPassword });
    if (res.data.success) {
      setSheetError("");
      setStep(2);
    }
  } catch {
    setSheetError("كلمة المرور غير صحيحة");
  }
};


  const handleUpdateUsername = async () => {
    try {
      const res = await updateUsername({ userId, password: currentPassword, newUsername });
      if (res.data.success) {
        alert(res.data.message);
        await loadUser();
        resetModal();
      }
    } catch {
      alert("حدث خطأ أثناء تحديث الاسم");
    }
  };

 const handleVerifyUsername = () => {
  if (currentUsername === user.username) {
    setSheetError("");
    setStep(2);
  } else {
    setSheetError("اسم المستخدم غير صحيح");
  }
};


  const handleUpdatePassword = async () => {
    try {
      const res = await updatePassword({ username: currentUsername, newPassword });
      if (res.data.success) {
        alert(res.data.message);
        resetModal();
      }
    } catch {
      alert("حدث خطأ أثناء تحديث كلمة المرور");
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="account-container">
        <motion.div
          className="account-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="account-title">حسابي</h2>

          {/* الاسم */}
          <div className="info-row">
            <div className="info-label">الاسم</div>
            {editField === "name" ? (
              <>
                <input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="الاسم الأول"
                />
                <input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="الاسم الأخير"
                />
              </>
            ) : (
              <div className="info-value">{`${formData.firstName} ${formData.lastName}`}</div>
            )}
            <img
              src={editIcon}
              alt="edit"
              className="edit-icon"
              onClick={() => setEditField(editField === "name" ? null : "name")}
            />
          </div>

          {/* رقم الجوال */}
          <div className="info-row">
            <div className="info-label">رقم الجوال</div>
            {editField === "phone" ? (
              <input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="رقم الجوال"
              />
            ) : (
              <div className="info-value">{formData.phone}</div>
            )}
            <img
              src={editIcon}
              alt="edit"
              className="edit-icon"
              onClick={() => setEditField(editField === "phone" ? null : "phone")}
            />
          </div>

          {/* الموقع */}
          <div className="map-section">
            <div className="map-header">
              <span>الموقع</span>
              <img
                src={editIcon}
                alt="edit"
                className="edit-icon"
                onClick={() => setEditField(editField === "location" ? null : "location")}
              />
            </div>

            {/* عرض الخريطة المحفوظة دائمًا */}
            {formData.latitude && formData.longitude && (
              <iframe
                title="map"
                className="map-frame"
                src={`https://maps.google.com/maps?q=${formData.latitude},${formData.longitude}&z=15&output=embed`}
              ></iframe>
            )}

            {/* تعديل الموقع فقط عند النقر على التعديل */}
            {editField === "location" && (
              <>
                <input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="ضع رابط الموقع أو حدده تلقائيًا"
                />
                <button className="btn-locate" onClick={detectLocation}>
                   موقعي الحالي
                </button>

                {formData.address && (
                  <div className="address-preview">
                    <strong> العنوان المكتشف:</strong> {formData.address}
                  </div>
                )}

                {locationDetected && formData.latitude && formData.longitude && (
                  <iframe
                    title="map-preview"
                    className="map-frame"
                    src={`https://maps.google.com/maps?q=${formData.latitude},${formData.longitude}&z=16&output=embed`}
                  ></iframe>
                )}
              </>
            )}
          </div>

          {/* حفظ */}
          <button className="btn-save" onClick={handleSave}>
             حفظ التعديلات
          </button>

          {/* إعدادات */}
          <div className="account-actions">
            <button className="username-btn" onClick={() => setEditModal("username")}>
              تغيير اسم المستخدم
            </button>
            <button className="password-btn" onClick={() => setEditModal("password")}>
              تعديل كلمة المرور
            </button>
          </div>
        </motion.div>
      </div>

      <BottomNav />

      {/* النوافذ المنبثقة */}
      <AnimatePresence>
        {editModal === "username" && (
          <motion.div className="overlay" onClick={resetModal}>
            <motion.div
              className="bottom-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={closeIcon} alt="close" className="close-icon" onClick={resetModal} />
              <h3>تحديث اسم المستخدم</h3>
{sheetError && <div className="sheet-alert">{sheetError}</div>}

              {step === 1 ? (
                <>
                  <input
                    type="password"
                    placeholder="كلمة المرور الحالية"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <button onClick={handleVerifyPassword}>تحقق</button>
                </>
              ) : (
                <>
                  <input
                    placeholder="اسم المستخدم الجديد"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                  />
                  <button onClick={handleUpdateUsername}>تحديث</button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editModal === "password" && (
          <motion.div className="overlay" onClick={resetModal}>
            <motion.div
              className="bottom-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={closeIcon} alt="close" className="close-icon" onClick={resetModal} />
             <h3>تحديث كلمة المرور</h3>
{sheetError && <div className="sheet-alert">{sheetError}</div>}

              {step === 1 ? (
                <>
                  <input
                    placeholder="اسم المستخدم"
                    value={currentUsername}
                    onChange={(e) => setCurrentUsername(e.target.value)}
                  />
                  <button onClick={handleVerifyUsername}>تحقق</button>
                </>
              ) : (
                <>
                  <input
                    type="password"
                    placeholder="كلمة المرور الجديدة"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button onClick={handleUpdatePassword}>تحديث</button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Account;
