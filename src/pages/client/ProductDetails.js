import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  getProductById,
  getUserById,
  addFavorite,
  addToCart,
   removeFavorite,
} from "../../api/api";
import cartIcon from "../../assets/cart.svg";
import arrowIcon from "../../assets/arrow-right.svg";
import "./ProductDetails.css";
import { AnimatePresence } from "framer-motion";


const API_BASE = process.env.REACT_APP_API_BASE; // ✅ من env

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [userFavorites, setUserFavorites] = useState([]);
  const [userCart, setUserCart] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
   const [showAuthModal, setShowAuthModal] = useState(false);

  const [alertMessage, setAlertMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?._id || user?.id || null;

  // ✅ دالة لتحديد رابط الصورة الصحيح (Cloudinary أو API_BASE)
  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path; // Cloudinary
    return `${API_BASE}${path}`; // سيرفر
  };

  // 🔹 تحميل بيانات المنتج
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProductById(id);
        const data = res.data;
        // ✅ معالجة الصور لتكون جاهزة للعرض
        data.mainImage = getImageUrl(data.mainImage);
        data.images = (data.images || []).map((img) => getImageUrl(img));
        setProduct(data);
      } catch (err) {
        console.error("Error loading product:", err);
      }
    };
    fetchProduct();
  }, [id]);

  // 🔹 تحميل بيانات المستخدم
  useEffect(() => {
    if (!userId) return;
    const fetchUserData = async () => {
      try {
        const res = await getUserById(userId);
        const userData = res.data;
        const favIds = Array.isArray(userData.favorites)
          ? userData.favorites.map((f) => f._id || f)
          : [];
        setUserFavorites(favIds);
        setUserCart(userData.cart || []);
      } catch (err) {
        console.error("Error loading user data:", err);
      }
    };
    fetchUserData();
  }, [userId]);

  if (!product)
    return <p style={{ textAlign: "center", marginTop: "40px" }}>جاري التحميل...</p>;

  const images = [product.mainImage, ...(product.images || [])].filter(Boolean);

  // ❤️ المفضلة
 const handleFavorite = async () => {
  if (!userId) {
    setShowAuthModal(true);
    return;
  }

  try {
    const isFav = userFavorites.includes(product._id);

    if (isFav) {
      await removeFavorite(userId, product._id);
      setUserFavorites((prev) => prev.filter((id) => id !== product._id));
    } else {
      await addFavorite(userId, { productId: product._id });
      setUserFavorites((prev) => [...prev, product._id]);
    }
  } catch (err) {
    console.error("Error updating favorites:", err);
  }
};


  // 🛒 السلة
  const handleAddToCart = async () => {
   if (!userId) {
  setShowAuthModal(true);
  return;
}
// 🛑 منع إضافة كمية تتجاوز المخزون
const refreshedUser = await getUserById(userId);
const freshCart = refreshedUser.data.cart || [];

const cartItem = freshCart.find(
  (item) =>
    item.product === product._id ||
    item.product?._id === product._id
);

const currentQty = cartItem ? cartItem.quantity : 0;
const stock = product.stock || 0;

if (currentQty + 1 > stock) {
  setAlertMessage(`لا يمكنك إضافة أكثر من ${stock} من هذا المنتج`);
  setShowAlert(true);
  setTimeout(() => setShowAlert(false), 2500);
  return;
}

    try {
      await addToCart(userId, {
        product: product._id,
        name: product.name,
        price: product.price,
        mainImage: product.mainImage,
        quantity: 1,
      });

      setAlertMessage(`تمت إضافة "${product.name}" إلى السلة 🛒`);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2500);

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Error adding to cart:", err);
      setAlertMessage("حدث خطأ أثناء إضافة المنتج 😔");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2500);
    }
  };

  return (
    <div className="product-details-container">
      <motion.div
        className="product-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* 🖼️ الصور */}
        <div className="image-gallery">
          <div className="main-image-wrapper">
            <motion.img
              key={currentImage}
              src={getImageUrl(images[currentImage])}
              alt={product.name}
              className="main-image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              onError={(e) => (e.target.src = "/fallback.png")}
            />
          </div>

          {images.length > 1 && (
            <div className="thumbnail-strip">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={getImageUrl(img)}
                  alt="thumb"
                  className={`thumbnail ${currentImage === i ? "active" : ""}`}
                  onClick={() => setCurrentImage(i)}
                  onError={(e) => (e.target.src = "/fallback.png")}
                />
              ))}
            </div>
          )}
        </div>

        {/* 🏷️ الاسم والسعر */}
        <div className="product-header">
          <h2 className="product-name">{product.name}</h2>
          <p className="product-price">{product.price} ر.س</p>
        </div>

        {/* الأزرار */}
   {/* الأزرار */}
<div className="actions-row">

  {/* 🔥 لو المنتج مخزونه صفر → أرغب به */}
  {product.stock === 0 ? (
    <motion.div
      className="notify-btn"
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        setAlertMessage(`سنعلمك عند توفر "${product.name}" 🔔`);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 2500);
      }}
    >
      🔔 أرغب به
    </motion.div>
  ) : (
    /* 🛒 المنتج متاح */
    <motion.div
      className="action-btn"
      whileTap={{ scale: 0.9 }}
      onClick={handleAddToCart}
    >
      <img src={cartIcon} alt="cart" />
    </motion.div>
  )}

  {/* ❤️ المفضلة */}
  <motion.div
    className={`action-btn heart-btn ${
      userFavorites.includes(product._id) ? "active" : ""
    }`}
    whileTap={{ scale: 0.9 }}
    onClick={handleFavorite}
  >
    <span className="heart-symbol">
      {userFavorites.includes(product._id) ? "❤" : "♡"}
    </span>
  </motion.div>

</div>


        {/* الوصف */}
        <p className="product-description">
          {product.description || "لا يوجد وصف متاح."}
        </p>

        {/* 📍 المسار أسفل المربع */}
        {product.section && (
          <div className="breadcrumb inside-card">
            {product.category && (
              <>
                <span
                  className="meta-link"
                  onClick={() =>
                    navigate(
                      `/sections?sectionId=${product.section._id}&categoryId=${product.category._id}`
                    )
                  }
                >
                  {product.category.name}
                </span>
                <img src={arrowIcon} alt=">" className="breadcrumb-arrow" />
              </>
            )}
            <span
              className="meta-link"
              onClick={() =>
                navigate(`/sections?sectionId=${product.section._id}`)
              }
            >
              {product.section.name}
            </span>
          </div>
        )}
      </motion.div>

      {/* 🛒 التنبيه */}
      {showAlert && (
        <motion.div
          className="cart-alert"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {alertMessage}
        </motion.div>
      )}
{/* 🌟 نافذة الانضمام (Bottom Sheet) */}
<AnimatePresence>
  {showAuthModal && (
    <motion.div
      className="auth-bottom-sheet"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.3 }}
    >
      <p className="auth-message">انضم إلينا لتجربة التسوق الكاملة</p>

      <button
        className="auth-button"
        onClick={() => (window.location.href = "/register")}
      >
        سجّل الآن
      </button>

      <button
        className="auth-close"
        onClick={() => setShowAuthModal(false)}
      >
        إغلاق
      </button>
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );
};

export default ProductDetails;
