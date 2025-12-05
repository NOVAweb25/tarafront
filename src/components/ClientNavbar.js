import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { logoutUser } from "../api/api";
import { listenToMessages } from "../firebase";

const ClientNavbar = () => {
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [hasOrderNotification, setHasOrderNotification] = useState({
  active: false,
  message: "",
});
const accountIcon= "https://res.cloudinary.com/dp1bxbice/image/upload/v1764962209/person_iwqjor.svg";

const logo= "https://res.cloudinary.com/dp1bxbice/image/upload/v1763968581/logo_revtav.svg";


useEffect(() => {
  const savedUser = JSON.parse(localStorage.getItem("user"));
  if (savedUser) setUser(savedUser);

  // 🔹 عند تغيير بيانات المستخدم في أي مكان داخل الموقع
  const handleAuthChange = () => {
    const updatedUser = JSON.parse(localStorage.getItem("user"));
    setUser(updatedUser || null);
    setShowAuthModal(false);
  };

  // 🔹 عند تسجيل الدخول أو الخروج في أي مكان
  window.addEventListener("authChange", handleAuthChange);
  return () => window.removeEventListener("authChange", handleAuthChange);
}, []);

// ✅ خارج الـ useEffect السابق
useEffect(() => {
  listenToMessages((payload) => {
    const title = payload?.title || "";
    const body = payload?.body || "";

    // 🔹 إذا كان الإشعار يخص تحديث الطلب
    if (title.includes("تحديث") || body.includes("تحديث")) {
      // مثال على استخراج رقم الطلب من النص (مثل "طلب رقم 123")
      const match = body.match(/(\d+)/);
      const orderNumber = match ? `#${match[1]}` : "";

      setHasOrderNotification({
        active: true,
        message: `تم تحديث حالة الطلب ${orderNumber}`,
      });
    }
  });
}, []);




  // ✅ إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ تسجيل الخروج
 // ✅ تسجيل الخروج (مُحدّثة)
const handleLogout = async () => {
  try {
    await logoutUser();
  } catch (err) {
    console.error("Logout failed:", err);
  }

  // 🔹 حذف بيانات المستخدم من التخزين
  localStorage.removeItem("user");
  localStorage.removeItem("token");

  // ✅ إغلاق أي نوافذ مفتوحة
  setShowLogoutModal(false);
  setShowMenu(false);

  // ✅ تحديث الحالة محليًا
  setUser(null);

  // ✅ بث أحداث عامة ليعرف كل الموقع أن العميل خرج
  setTimeout(() => {
    window.dispatchEvent(new Event("authChange"));
    window.dispatchEvent(new Event("logout"));
  }, 50);

  // ✅ توجيه المستخدم للصفحة الرئيسية (اختياري)
  navigate("/");
};

  // ✅ التعامل مع الزائر
  const handleGuestClick = () => {
    setShowAuthModal(true);
    setShowMenu(false);
  };

  // ✅ الانتقال وإغلاق النافذة فور الضغط
  const handleAuthNavigation = (path) => {
    setShowAuthModal(false);
    navigate(path);
  };

  return (
    <>
      {/* ✅ شريط التنقل */}
      <nav style={styles.navbar}>
        {/* 🟣 الشعار في المنتصف */}
        <div style={styles.logoContainer}>
          <div style={styles.logoCircle}>
            <img src={logo} alt="Logo" style={styles.logo} />
          </div>
        </div>

        {/* 👤 أيقونة المستخدم في اليمين */}
        <div style={styles.userContainer} ref={menuRef}>
          <div
            style={styles.userButton}
            onClick={() => setShowMenu((prev) => !prev)}
          >
            <div style={styles.iconCircle}>
              <img src={accountIcon} alt="Account" style={styles.icon} />
            </div>
            {user && (
              <span style={styles.userName}>
                {user.firstName} {user.lastName}
              </span>
            )}
          </div>

          {/* 🔽 القائمة المنسدلة */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                style={styles.dropdown}
                initial={{ x: 150, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 150, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  style={styles.dropdownItem}
                  onClick={() =>
                    user ? navigate("/account") : handleGuestClick()
                  }
                >
                  حسابي
                </button>

              <button
  style={{ ...styles.dropdownItem, position: "relative" }}
  onClick={() => {
    user ? navigate("/my-orders") : handleGuestClick();
    setHasOrderNotification({ active: false, message: "" });
  }}
>
  طلباتي
 {hasOrderNotification.active && (
  <div style={styles.notificationBubble}>
    <span style={styles.notificationIcon}>!</span>
    <span style={styles.notificationText}>
      {hasOrderNotification.message}
    </span>
  </div>
)}

</button>




                {/* ✅ يظهر فقط عند وجود مستخدم */}
                {user && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowLogoutModal(true)}
                    style={styles.logoutButton}
                  >
                    تسجيل الخروج
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ✅ نافذة تأكيد تسجيل الخروج */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            style={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={styles.modalContent}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <h3 style={{ color: "#121921", marginBottom: "15px" }}>
                هل أنت متأكد من تسجيل الخروج؟
              </h3>
              <div style={styles.modalActions}>
                <button style={styles.confirmButton} onClick={handleLogout}>
                  نعم
                </button>
                <button
                  style={styles.cancelButton}
                  onClick={() => setShowLogoutModal(false)}
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ نافذة الزائر (Bottom Sheet) */}
      <AnimatePresence>
        {showAuthModal && (
          <>
            <motion.div
              style={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
            />
            <motion.div
              style={styles.authSheet}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35 }}
            >
              <p style={styles.authMessage}>
انضم الينا لتجربة شراء كاملة               </p>
              <div style={styles.authActions}>
                <button
                  style={styles.joinButton}
                  onClick={() => handleAuthNavigation("/register")}
                >
                  إنشاء حساب
                </button>
                <button
                  style={styles.loginButton}
                  onClick={() => handleAuthNavigation("/login")}
                >
                  تسجيل دخول
                </button>
              </div>
              <button
                style={styles.closeAuth}
                onClick={() => setShowAuthModal(false)}
              >
                إغلاق
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ClientNavbar;

const styles = {
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "75px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(16px)",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: 1000,
  },

  logoContainer: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
  },

  logoCircle: {
    width: "70px",
    height: "70px",
    background: "#f1ebcc",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    //boxShadow: "0 0 25px #f2a72d",

  },

  logo: {
    width: "100%",
    height: "auto",
    borderRadius: "50%",
  },

  userContainer: {
    position: "absolute",
    right: "30px",
  },

  userButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    color: "#6b7f4f",
  },

  iconCircle: {
    width: "42px",
    height: "42px",
    background: "rgba(255,255,255,0.15)",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 0 10px rgba(255,255,255,0.2)",
  },

  icon: {
    width: "60px",
    height: "60px",
      },

  userName: {
    color: "#6b7f4f",
    fontSize: "1rem",
  },

  dropdown: {
    position: "absolute",
    top: "70px",
    right: "0",
    background: "#493c33",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    width: "180px",
    zIndex: 1200,
  },

  dropdownItem: {
    border: "none",
    background: "transparent",
    textAlign: "right",
    fontSize: "1rem",
    padding: "10px 8px",
    cursor: "pointer",
    color: "#f1ebcc",
  },

  logoutButton: {
    marginTop: "10px",
    padding: "8px 15px",
    border: "none",
    borderRadius: "30px",
    background: "linear-gradient(90deg, #a0bebf, #a0bebf)",
    color: "#493c33",
    fontWeight: "600",
    cursor: "pointer",
  },

notificationBubble: {
  position: "absolute",
  top: "5px",
  left: "12px",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  backgroundColor: "#a0bebf",
  borderRadius: "8px",
  padding: "4px 8px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  maxWidth: "160px",
},

notificationIcon: {
  backgroundColor: "#a0bebf",
  color: "#121921",
  borderRadius: "50%",
  width: "16px",
  height: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  fontSize: "11px",
},

notificationText: {
  color: "#a0bebf",
  fontSize: "0.75rem",
  fontWeight: "600",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
},

  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },

  modalContent: {
        color:"#493c33",
    background: "#a0bebf",
    padding: "30px",
    borderRadius: "30px",
    textAlign: "center",
    width: "300px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
  },

  modalActions: {
    marginTop: "15px",
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
  },

  confirmButton: {
    backgroundColor: "#f1ebcc",
    color: "#6b7f4f",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    fontWeight: "bold",
    padding: "10px 20px",
  },

  cancelButton: {
    backgroundColor: "#f1ebcc",
    color: "#d15c1d",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    padding: "10px 20px",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    zIndex: 1500,
  },

  authSheet: {
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    background: "#a0bebf",
    borderTopLeftRadius: "30px",
    borderTopRightRadius: "30px",
    boxShadow: "0 -4px 15px rgba(0,0,0,0.15)",
    padding: "25px",
    textAlign: "center",
    zIndex: 1600,
  },

  authMessage: {
     color: "#493c33",
    fontSize: "1.1rem",
    fontWeight: "600",
    marginBottom: "15px",
  },

  authActions: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "10px",
  },

  joinButton: {
    background: "#f1ebcc",
    border: "none",
    color: "#d15c1d",
    fontWeight: "600",
    borderRadius: "30px",
    padding: "10px 18px",
    cursor: "pointer",
  },

  loginButton: {
    background: "#f1ebcc",
    border: "none",
    color: "#6b7f4f",
    fontWeight: "600",
    borderRadius: "30px",
    padding: "10px 18px",
    cursor: "pointer",
  },

  closeAuth: {
    background: "transparent",
    border: "none",
    color: "#493c33",
    marginTop: "5px",
    cursor: "pointer",
  },
};