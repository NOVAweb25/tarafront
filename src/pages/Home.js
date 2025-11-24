import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { colors, fonts, fontSizes, buttonSizes } from "../utils/theme";
import backgroundVideo from "../assets/autumn.mp4";

const Home = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  useEffect(() => {
    const handleStorageChange = () => {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      setUser(savedUser);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div style={styles.container}>
      {/* 🎥 خلفية الفيديو */}
      <video autoPlay loop muted playsInline style={styles.video}>
        <source src={backgroundVideo} type="video/mp4" />
      </video>

      {/* 🌫️ الطبقة الشفافة والمحتوى */}
      <div style={styles.overlay}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={styles.contentBox}
        >
          {/* 👋 رسالة ترحيب */}
          <h1 style={styles.title}>
            {user ? `🌿 مرحبًا بك ${user.firstName}` : "🌿 مرحبًا بك في موقعنا"}
          </h1>

          {/* 🔗 زر تسجيل الدخول */}
          {!user && (
            <Link to="/login" style={styles.button}>
              تسجيل الدخول
            </Link>
          )}

          {/* رابط التسجيل */}
          {!user && (
            <p style={styles.text}>
              ليس لديك حساب؟{" "}
              <Link to="/register" style={styles.link}>
                سجل حسابك
              </Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Home;

const styles = {

  container: {
       
    position: "relative",
    width: "100%",
    height: "100vh",
    fontFamily: fonts.primary,
    overflow: "hidden",
  },
  video: {
    position: "absolute",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: -1,
  },
  overlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "rgba(0,0,0,0.4)",
  },
  contentBox: {
  textAlign: "center",
  backgroundColor: "rgba(160, 190, 191, 0.25)", // ← #a0bebf بنسبة شفافية
  padding: "30px 40px",
  borderRadius: "30px",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)", // للـ Safari
  boxShadow: "0 8px 20px rgba(0,0,0,0.25)", // ظل ناعم يناسب الزجاج
  border: "1px solid rgba(255,255,255,0.3)", // يعطي إحساس زجاج أكثر
},

  title: {
    color: "#f2a72d",
    fontFamily: fonts.secondary,
    fontSize: fontSizes.title,
    marginBottom: "20px",
  },

  button: {
    ...buttonSizes.medium,
    backgroundColor: "#6b7f4f",
    color: "#f1ebcc",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
    marginTop: "10px",
    transition: "all 0.3s ease",
  },
  link: {
    color: "#a0bebf",
    textDecoration: "underline",
    fontSize: fontSizes.link,
  },
  text: {
    marginTop: "15px",
    color:"#f1ebcc",
    fontSize: fontSizes.content,
  },
};
