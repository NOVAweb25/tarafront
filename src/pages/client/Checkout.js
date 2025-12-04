import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getUserById,
  getBankDetails,
  removeFromCart,
  updateUser,
  updateCartItem,
  createOrder,
  uploadPaymentProof,
  createOrderWithProof,
} from "../../api/api";
import BottomNav from "../../components/BottomNav";
import jsQR from "jsqr";
import { useNavigate } from "react-router-dom";
import { Copy } from "lucide-react";
const API_BASE = process.env.REACT_APP_API_BASE; // ✅ من env
const Checkout = () => {
  const userId = JSON.parse(localStorage.getItem("user"))?._id;
  const [user, setUser] = useState(null);
  const [banks, setBanks] = useState([]);
  const [cart, setCart] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const plusIcon = "https://res.cloudinary.com/dp1bxbice/image/upload/v1763968591/plus_xwrg7i.svg";
  const minusIcon= "https://res.cloudinary.com/dp1bxbice/image/upload/v1763968578/minus_rpgpcr.svg";
  const editIcon = "https://res.cloudinary.com/dp1bxbice/image/upload/v1763968570/edit_xmyhv0.svg";
  const deleteIcon= "https://res.cloudinary.com/dp1bxbice/image/upload/v1763968568/delete_kf2kz4.svg";
  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    location: "",
    latitude: null,
    longitude: null,
    address: "",
  });
  const [copiedField, setCopiedField] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();
  // ✅ دالة لتحديد رابط الصورة الصحيح سواء من Cloudinary أو من السيرفر
  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_BASE}${path}`;
  };
  useEffect(() => {
    if (userId) {
      loadUser();
      loadBanks();
    }
  }, [userId]);
  const loadUser = async () => {
    const res = await getUserById(userId);
    setUser(res.data);
    setCart(res.data.cart || []);
    setEditData({
      firstName: res.data.firstName || "",
      lastName: res.data.lastName || "",
      phone: res.data.phone || "",
      location: res.data.location || "",
      address: res.data.address || "",
    });
  };
  const loadBanks = async () => {
    const res = await getBankDetails();
    const banksWithFullUrls = res.data.map((b) => ({
      ...b,
      barcode: getImageUrl(b.barcode),
    }));
    setBanks(banksWithFullUrls);
  };
  const handleRemoveItem = async (itemId) => {
    await removeFromCart(userId, itemId);
    await loadUser();
  };
  const handleUpdateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const link = `https://www.google.com/maps?q=${latitude},${longitude}`;
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=ar`
          );
          const geoData = await geoRes.json();
          let addressStr = "";
          if (geoData.address) {
            const city =
              geoData.address.city ||
              geoData.address.town ||
              geoData.address.village ||
              "";
            const suburb =
              geoData.address.suburb ||
              geoData.address.neighbourhood ||
              "";
            const road = geoData.address.road || "";
            addressStr = [city, suburb, road].filter(Boolean).join(", ");
          }
          setEditData({
            ...editData,
            latitude,
            longitude,
            location: link,
            address: addressStr,
          });
        } catch (geoErr) {
          console.error("Error fetching address:", geoErr);
          setEditData({
            ...editData,
            latitude,
            longitude,
            location: link,
            address: "",
          });
        }
      });
    } else {
      alert("المتصفح لا يدعم تحديد الموقع الجغرافي");
    }
  };
  const handleSaveEdit = async () => {
    await updateUser(userId, editData);
    await loadUser();
    setIsEditing(false);
  };
  const updateQuantity = async (itemId, newQty) => {
    if (newQty <= 0) {
      await handleRemoveItem(itemId);
      return;
    }
    // 🔥 المخزون الحقيقي (افترض أن stock موجود في item.product.stock)
    const item = cart.find((i) => i._id === itemId);
    if (!item) return;
    const stock = item.product?.stock || 0; // أو جلب stock إذا لزم
    // إذا newQty أكبر من stock → عرض تنبيه
    if (newQty > stock) {
      setAlertMessage(`لا يمكنك إضافة أكثر من ${stock} من هذا المنتج`);
      setTimeout(() => setAlertMessage(""), 2500);
      return;
    }
    try {
      await updateCartItem(userId, itemId, { quantity: newQty });
      await loadUser();
    } catch (err) {
      console.error("Failed to update quantity:", err);
    }
  };
  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };
  const handleScanBarcode = () => {
    if (!banks[0]?.barcode) return alert(" لا يوجد باركود متاح");
    const img = new Image();
    img.src = getImageUrl(banks[0].barcode);
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        const qrValue = code.data.trim();
        console.log("📦 رمز الباركود:", qrValue);
        // 🟢 إذا كان الرابط يبدأ بـ http نعرضه كزر قابل للفتح
        if (qrValue.startsWith("http")) {
          const open = window.confirm(
            ` تم قراءة الباركود:\n${qrValue}\n\nهل ترغب بفتح الرابط الآن؟`
          );
          if (open) window.open(qrValue, "_blank");
        } else {
          // 🔸 في حال كان نص وليس رابط
          alert(`📦 رمز الباركود: ${qrValue}`);
        }
      } else {
        alert(" تعذر قراءة الباركود");
      }
    };
    img.onerror = () => {
      alert(" تعذر تحميل صورة الباركود");
    };
  };
  const totalProducts = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const delivery = 20;
  const total = totalProducts + delivery;
  const handleSubmit = async () => {
    if (!receipt) return alert("📎 يرجى إرفاق إيصال الدفع أولاً");
    setSubmitting(true); // 🔵 تشغيل التحميل
    const orderData = {
      user: userId,
      items: cart.map((item) => ({
        product: item.product._id || item.product,
        name: item.name,
        price: item.price,
        mainImage: item.mainImage,
        quantity: item.quantity,
      })),
      shipping: {
        name: `${user.firstName} ${user.lastName}`,
        phone: user.phone,
        address: user.address || "",
        coords: [user.longitude, user.latitude],
      },
      subtotal: totalProducts,
      tax: 0,
      delivery,
      total,
    };
    try {
      const formData = new FormData();
      formData.append("file", receipt);
      formData.append("orderData", JSON.stringify(orderData));
      const res = await createOrderWithProof(formData);
      window.dispatchEvent(new Event("cartUpdated"));
      alert(" تم إرسال الطلب بنجاح");
      navigate("/my-orders");
    } catch (err) {
      console.error(" Error:", err.response?.data || err.message);
      alert("حدث خطأ أثناء إنشاء الطلب. حاول مرة أخرى.");
    } finally {
      setSubmitting(false); // 🔵 إيقاف التحميل
    }
  };
  return (
    <>
      <div style={styles.page}>
        <motion.div
          style={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 style={styles.header}>بياناتي</h2>
          {user && (
            <div style={styles.box}>
              <div
                style={styles.editCircle}
                onClick={() => setIsEditing(!isEditing)}
              >
                <img src={editIcon} alt="edit" style={{ width: 20 }} />
              </div>
              {!isEditing ? (
                <>
                  <p>
                    <b>الاسم:</b> {user.firstName} {user.lastName}
                  </p>
                  <p>
                    <b>رقم الجوال:</b> {user.phone}
                  </p>
                  <p>
                    <b>الموقع:</b>{" "}
                    {user.location ? (
                      <a href={user.location} target="_blank" rel="noreferrer">
                        عرض على الخريطة
                      </a>
                    ) : (
                      "لم يتم تحديد الموقع"
                    )}
                  </p>
                  {user.address && <p><b>العنوان:</b> {user.address}</p>}
                  {user.latitude && user.longitude && (
                    <iframe
                      title="map"
                      width="100%"
                      height="200"
                      style={styles.map}
                      src={`https://maps.google.com/maps?q=${user.latitude},${user.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    ></iframe>
                  )}
                </>
              ) : (
                <div style={styles.editArea}>
                  <input
                    type="text"
                    value={editData.firstName}
                    onChange={(e) =>
                      setEditData({ ...editData, firstName: e.target.value })
                    }
                    placeholder="الاسم الأول"
                    style={styles.input}
                  />
                  <input
                    type="text"
                    value={editData.lastName}
                    onChange={(e) =>
                      setEditData({ ...editData, lastName: e.target.value })
                    }
                    placeholder="الاسم الأخير"
                    style={styles.input}
                  />
                  <input
                    type="text"
                    value={editData.phone}
                    onChange={(e) =>
                      setEditData({ ...editData, phone: e.target.value })
                    }
                    placeholder="رقم الجوال"
                    style={styles.input}
                  />
                  <button style={styles.smallBtn} onClick={handleUpdateLocation}>
                     تحديد موقعي الحالي
                  </button>
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) =>
                      setEditData({ ...editData, location: e.target.value })
                    }
                    placeholder="أدخل رابط موقع من Google Maps"
                    style={styles.input}
                  />
                  <input
                    type="text"
                    value={editData.address}
                    readOnly
                    placeholder="العنوان (المدينة، الحي، الشارع)"
                    style={styles.input}
                  />
                  {editData.latitude && editData.longitude && (
                    <iframe
                      title="map"
                      width="100%"
                      height="200"
                      style={styles.map}
                      src={`https://maps.google.com/maps?q=${editData.latitude},${editData.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    ></iframe>
                  )}
                  <button style={styles.smallBtn} onClick={handleSaveEdit}>
                     حفظ التعديل
                  </button>
                </div>
              )}
            </div>
          )}
          {/* 🏦 بيانات الدفع */}
          <h2 style={styles.header}>بيانات الدفع</h2>
          {banks.length > 0 && (
            <div style={styles.box}>
              <img
                src={getImageUrl(banks[0].barcode)}
                alt="barcode"
                style={{
                  width: "120px",
                  borderRadius: "30px",
                  cursor: "pointer",
                }}
                onClick={handleScanBarcode}
              />
              <p>
                <b>الاسم:</b> {banks[0].ownerName}
              </p>
              <p style={styles.copyRow}>
                <b>رقم الآيبان:</b> {banks[0].iban}
               <Copy
  size={18}
  style={styles.copyIcon}
  onClick={() => copyToClipboard(banks[0].iban, "iban")}
/>
                {copiedField === "iban" && (
                  <span style={styles.copiedText}>تم النسخ ✓</span>
                )}
              </p>
              <p style={styles.copyRow}>
                <b>رقم الحساب:</b> {banks[0].accountNumber}
               <Copy
  size={18}
  style={styles.copyIcon}
  onClick={() => copyToClipboard(banks[0].accountNumber, "account")}
/>
                {copiedField === "account" && (
                  <span style={styles.copiedText}>تم النسخ ✓</span>
                )}
              </p>
              <p>
                <b>اسم البنك:</b> {banks[0].bankName}
              </p>
            </div>
          )}
          {/* 🛍️ المنتجات */}
          <h2 style={styles.header}>المنتجات</h2>
          <div style={styles.box}>
            {cart.length > 0 ? (
              cart.map((item) => (
                <div key={item._id} style={styles.productCard}>
                  <img
                    src={getImageUrl(item.mainImage)}
                    alt={item.name}
                    style={styles.productImg}
                    onError={(e) => (e.target.src = "/fallback.png")}
                  />
                  <div style={{ flex: 1 }}>
                    <h4>{item.name}</h4>
                    <p>{item.price} ر.س</p>
                    <div style={styles.actions}>
                      <button
                        style={styles.qtyBtn}
                        onClick={() =>
                          updateQuantity(item._id, item.quantity - 1)
                        }
                      >
                        <img src={minusIcon} alt="-" style={styles.smallIcon} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        style={styles.qtyBtn}
                        onClick={() =>
                          updateQuantity(item._id, item.quantity + 1)
                        }
                      >
                        <img src={plusIcon} alt="+" style={styles.smallIcon} />
                      </button>
                    </div>
                  </div>
                  <img
                    src={deleteIcon}
                    alt="delete"
                    style={styles.deleteIcon}
                    onClick={() => handleRemoveItem(item._id)}
                  />
                </div>
              ))
            ) : (
              <p>السلة فارغة</p>
            )}
          </div>
          {/* 💰 الحساب النهائي */}
          <h2 style={styles.header}>الملخص</h2>
          <div style={styles.box}>
            <p>سعر المنتجات: {totalProducts} ر.س</p>
            <p>سعر التوصيل: {delivery} ر.س</p>
            <hr />
            <h3>الإجمالي: {total} ر.س</h3>
            <label style={styles.uploadLabel}>
               إرفاق إيصال الدفع (PDF)
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setReceipt(e.target.files[0])}
                style={{ display: "none" }}
              />
            </label>
            {receipt && <p style={styles.fileName}>الملف: {receipt.name}</p>}
            <button
  style={{
    ...styles.confirmBtn,
    opacity: receipt ? 1 : 0.6,
    pointerEvents: receipt ? "auto" : "none",
  }}
  onClick={handleSubmit}
  disabled={submitting}
>
  {submitting ? " جاري إرسال الطلب..." : " تأكيد الدفع"}
</button>
          </div>
        </motion.div>
      </div>
      <BottomNav />
      {/* 🔔 Toast */}
      <AnimatePresence>
        {alertMessage && (
          <motion.div
            style={styles.toast}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4 }}
          >
            {alertMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default Checkout;
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f1ebcc",
    padding: "20px",
    fontFamily: "Tajawal, sans-serif",
  },
  card: { maxWidth: "500px", margin: "0 auto" },
  header: { margin: "15px 0 10px", color: "#d15c1d" },
  box: {
    background: "#fff",
    borderRadius: "30px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    padding: "15px",
    marginBottom: "15px",
    position: "relative",
  },
  editCircle: {
    position: "absolute",
    top: "10px",
    right: "10px",
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    background: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  productCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    borderBottom: "1px solid #f2a72d",
    padding: "8px 0",
  },
  productImg: { width: "60px", height: "60px", borderRadius: "30px" },
  deleteIcon: { width: "20px", cursor: "pointer" },
  editArea: { marginTop: "10px" },
  input: {
    width: "100%",
    padding: "8px",
    borderRadius: "10px",
    border: "1px solid #f2a72d",
    marginBottom: "8px",
  },
  smallBtn: {
    background: "#6b7f4f",
    border: "none",
    borderRadius: "30px",
    color: "#f1ebcc",
    padding: "8px 12px",
    cursor: "pointer",
    marginBottom: "8px",
  },
  uploadLabel: {
    display: "block",
     background: "#6b7f4f",
    color: "#f1ebcc",
    padding: "10px",
    borderRadius: "30px",
    cursor: "pointer",
    textAlign: "center",
    marginTop: "10px",
  },
  fileName: {
    marginTop: "5px",
    fontSize: "14px",
    color: "#6b7f4f",
    textAlign: "center",
  },
  confirmBtn: {
    width: "100%",
    padding: "10px",
    border: "none",
    borderRadius: "30px",
    background: "linear-gradient(90deg,#d15c1d,#f2a72d)",
    fontWeight: "600",
    color: "#f1ebcc",
    marginTop: "10px",
    cursor: "pointer",
  },
  map: { marginTop: "10px", borderRadius: "10px" },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "4px",
  },
  qtyBtn: {
    backgroundColor: "#fff",
    borderRadius: "50%",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    border: "none",
    padding: "5px",
    cursor: "pointer",
  },
  smallIcon: { width: "22px", height: "22px", cursor: "pointer" },
  copyRow: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
 copyIcon: {
  cursor: "pointer",
  fontSize: "18px",
  color: "#493c33",
  transition: "0.2s",
},
copyIconHover: {
  color: "#f2a72d",
},
  copiedText: {
    color: "d15c1d",
    fontSize: "14px",
  },
  toast: {
    position: "fixed",
    bottom: "90px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#d15c1d",
    color: "#f1ebcc",
    padding: "10px 20px",
    borderRadius: "30px",
    fontSize: "14px",
    fontWeight: "600",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    zIndex: 2000,
  },
};