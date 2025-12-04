import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { registerUser } from "../api/api";
import { colors, fonts, fontSizes, buttonSizes } from "../utils/theme";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// إصلاح أيقونة Marker الافتراضية
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// مكون DraggableMarker (تم تصحيح التكرار وإضافة فتح Google Maps)
const DraggableMarker = ({ position, setCoords, setFormLocation }) => {
  const markerRef = React.useRef(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setCoords([lat, lng]);
      setFormLocation(`${lat},${lng}`);
    },
  });

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const { lat, lng } = marker.getLatLng();
        setCoords([lat, lng]);
        setFormLocation(`${lat},${lng}`);
      }
    },
  };

  const openInGoogleMaps = () => {
    const [lat, lng] = position;
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    >
      <Popup>
        <div style={{ cursor: "pointer" }} onClick={openInGoogleMaps}>
          عرض الموقع في Google Maps
        </div>
      </Popup>
    </Marker>
  );
};

const Register = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    phone: "",
    location: "",
    password: "",
  });
  const [coords, setCoords] = useState([24.7136, 46.6753]);
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();
  const [hoverBack, setHoverBack] = useState(false);

  const backIcon = "https://res.cloudinary.com/dp1bxbice/image/upload/v1763968570/home_sngijz.svg"; // تصحيح الـ quotes
  const backgroundVideo = "https://res.cloudinary.com/dp1bxbice/video/upload/v1763968598/background_y4wbuh.mp4"; // نقل داخل الـ component لو لزم

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const setFormLocation = (loc) =>
    setForm((prev) => ({ ...prev, location: loc }));

  // ✅ تنبيه علوي
  const showAlert = (msg) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(""), 2500);
  };

  // ✅ الحصول على الموقع الحالي تلقائيًا
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords([latitude, longitude]);
          setFormLocation(`${latitude},${longitude}`);
          showAlert("📍 تم تحديد موقعك بنجاح");
        },
        () => showAlert("⚠️ لم نستطع الحصول على موقعك الحالي")
      );
    } else {
      showAlert("❌ المتصفح لا يدعم تحديد الموقع");
    }
  };

  // ✅ التحقق من الحقول قبل التسجيل
  const validateForm = () => {
    for (let key in form) {
      if (!form[key].trim()) {
        const el = document.querySelector(`[name="${key}"]`);
        if (el) el.focus();
        showAlert("⚠️ يرجى تعبئة جميع الخانات");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const res = await registerUser(form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      // إشعار باقي المكونات بأن مستخدم جديد تم تسجيله
      window.dispatchEvent(new Event("authChange"));
      navigate("/");
    } catch (err) {
      if (err.response) {
        const message = err.response.data?.message || "";
        // ✅ مطابقة رسائل الكنترول
        if (message.includes("رقم الجوال")) {
          showAlert("⚠️ رقم الجوال مستخدم مسبقًا، لا يمكن إنشاء حساب جديد");
        } else if (message.includes("اسم المستخدم")) {
          showAlert("⚠️ اسم المستخدم مستخدم مسبقًا، اختر اسمًا آخر");
        } else {
          showAlert("❌ حدث خطأ أثناء التسجيل، حاول مرة أخرى");
        }
      } else {
        showAlert("❌ لا يمكن الاتصال بالخادم الآن");
      }
    }
  };

  const handleMapClick = () => {
    const [lat, lng] = coords;
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  return (
    <div style={styles.container}>
      <video autoPlay loop muted playsInline style={styles.video}>
        <source src={backgroundVideo} type="video/mp4" />
      </video>
      {/* 🔔 تنبيه علوي */}
      <AnimatePresence>
        {alertMessage && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={styles.toast}
          >
            {alertMessage}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={styles.card}
      >
        <Link
          to="/"
          style={{
            ...styles.back,
            backgroundColor: hoverBack ? "#a0bebf" : "#a0bebf",
          }}
          onMouseEnter={() => setHoverBack(true)}
          onMouseLeave={() => setHoverBack(false)}
        >
          <img
            src={backIcon}
            alt="Back"
            style={{
              ...styles.backIcon,
              transform: hoverBack ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          />
          <span>عودة</span>
        </Link>
        <h2 style={styles.title}>تسجيل جديد</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <input
              type="text"
              name="firstName"
              placeholder="الاسم الأول"
              value={form.firstName}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="الاسم الأخير"
              value={form.lastName}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          <input
            type="text"
            name="phone"
            placeholder="رقم الجوال"
            value={form.phone}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <button type="button" onClick={handleGetLocation} style={{ ...styles.button, marginBottom: "8px" }}>
            تحديد موقعي الحالي
          </button>
          {/* ✅ الخريطة تظهر الموقع المحدد وتفتح خرائط Google عند الضغط */}
          <div onClick={handleMapClick} style={{ cursor: "pointer" }}>
            <MapContainer center={coords} zoom={13} scrollWheelZoom={false} style={{ height: 200, marginBottom: 12 }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <DraggableMarker position={coords} setCoords={setCoords} setFormLocation={setFormLocation} />
            </MapContainer>
          </div>
          <input
            type="text"
            name="username"
            placeholder="اسم المستخدم"
            value={form.username}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="كلمة المرور"
            value={form.password}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <motion.button
            type="submit"
            style={styles.button}
          >
            تسجيل
          </motion.button>
        </form>
        <div style={styles.registerText}>
          لديك حساب؟{" "}
          <Link to="/login" style={styles.registerLink}>
            سجل دخولك
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

// 🎨 الأنماط المعدلة لتكون responsive وتسمح بالسكرول (تصحيح الاختفاء + الشاشات المختلفة)
const styles = {
  container: {
    position: "relative",
    width: "100%",
    minHeight: "100vh",  // تغيير height إلى minHeight عشان يسمح بالسكرول لو المحتوى أكبر
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: fonts.primary,
    overflow: "visible",  // إزالة hidden عشان يسمح بالسكرول الطبيعي للصفحة
  },
  video: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: -1,
  },
  toast: {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#d15c1d",
    color: "#f1ebcc",
    padding: "10px 20px",
    borderRadius: "30px",
    fontWeight: "600",
    fontSize: "14px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    zIndex: 2000,
  },
  card: {
    background: "rgba(160, 190, 191, 0.22)", // ← #a0bebf مع شفافية ممتازة للزجاج
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    padding: "30px 20px",
    borderRadius: "16px",
    textAlign: "center",
    width: "100%",  // تغيير: 100% على الشاشات الصغيرة
    maxWidth: "340px",  // الحد الأقصى للشاشات الكبيرة
    boxShadow: "0 8px 24px rgba(0,0,0,0.35)", // ظل أنعم يناسب اللون
    position: "relative",
    zIndex: 1,
    border: "1px solid rgba(255,255,255,0.35)", // يعطي إيحاء زجاج
    overflow: "visible",  // تأكيد عدم اختفاء أجزاء
  },
  title: {
    fontFamily: fonts.secondary,
    color: "#f2a72d",
    fontSize: fontSizes.title,
    marginBottom: "20px",
  },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  row: { display: "flex", gap: "10px", flexWrap: "wrap" },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "30px",
    border: "none",
    outline: "none",
    fontSize: fontSizes.content,
    fontFamily: fonts.primary,
  },
  button: {
    ...buttonSizes.medium,
    width: "100%",
    backgroundColor: "#6b7f4f",
    color: "#f1ebcc",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    marginTop: "10px",
  },
  registerText: {
    marginTop: "18px",
    fontSize: fontSizes.link,
    color: colors.text,
    lineHeight: 1.4,
  },
  registerLink: {
    color: "#a0bebf",
    fontWeight: "bold",
    textDecoration: "underline",
  },
  back: {
    position: "absolute",
    top: "8px",
    right: "8px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 10px",
    borderRadius: "30px",
    cursor: "pointer",
    textDecoration: "none",
    color: "#493c33",
    fontWeight: "bold",
    fontSize: "14px",
    backgroundColor: "#a0bebf",
    transition: "all 0.3s ease",
    zIndex: 2,  // تأكيد أنه فوق كل حاجة
  },
  backIcon: {
    width: "20px",
    height: "20px",
    transition: "transform 0.3s, filter 0.3s",
  },
};