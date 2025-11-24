import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, animate, useTransform, useDragControls } from "framer-motion";
import {
  getCurrentUser,
  removeFromCart,
  updateCartItem,
  removeFavorite,
  addToCart,
} from "../api/api";
import cartAddIcon from "../assets/cart.svg";
import { useNavigate } from "react-router-dom";
import { PanelTopClose, PanelRightClose } from "lucide-react";

import "./BottomNav.css";
const plusIcon = "https://res.cloudinary.com/dp1bxbice/image/upload/v1763968591/plus_xwrg7i.svg";
const minusIcon= "https://res.cloudinary.com/dp1bxbice/image/upload/v1763968578/minus_rpgpcr.svg";
const trashIcon= "https://res.cloudinary.com/dp1bxbice/image/upload/v1763968568/delete_kf2kz4.svg";
const BottomNav = () => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [total, setTotal] = useState(0);
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);
  const navigate = useNavigate();
   const [layoutMode, setLayoutMode] = useState("vertical");
const homeIcon= "https://res.cloudinary.com/dp1bxbice/image/upload/v1763968570/home_sngijz.svg";
const favIcon= "https://res.cloudinary.com/dp1bxbice/image/upload/v1763968573/like_eclk8w.svg";
const cartIcon= "https://res.cloudinary.com/dp1bxbice/image/upload/v1763968566/cart_jsj3mh.svg";
const API_BASE = process.env.REACT_APP_API_BASE; 
const CLOUDINARY_BASE = process.env.REACT_APP_CLOUDINARY_BASE;

const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url; // رابط Cloudinary
  return `${API_BASE}${url}`; // رابط من السيرفر
};
   
  // 🟢 جلب بيانات المستخدم الحالي
  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await getCurrentUser();
      setUser(res.data);
      setCart(Array.isArray(res.data.cart) ? res.data.cart : []);
      setFavorites(Array.isArray(res.data.favorites) ? res.data.favorites : []);
    } catch (err) {
      console.error("Error fetching current user:", err);
      setUser(null);
      setCart([]);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCurrentUser();
  }, []);
  // تحديث عند تغيير السلة أو المفضلة من مكان آخر
  useEffect(() => {
    const handleUpdate = () => fetchCurrentUser();
    window.addEventListener("cartUpdated", handleUpdate);
    window.addEventListener("favoritesUpdated", handleUpdate);
    return () => {
      window.removeEventListener("cartUpdated", handleUpdate);
      window.removeEventListener("favoritesUpdated", handleUpdate);
    };
  }, []);
  // حساب الإجمالي
  useEffect(() => {
    const totalPrice = cart.reduce((sum, item) => {
      const price =
        typeof item.price === "object"
          ? Number(item.price.$numberInt)
          : item.price;
      const qty =
        typeof item.quantity === "object"
          ? Number(item.quantity.$numberInt)
          : item.quantity;
      return sum + price * qty;
    }, 0);
    setTotal(totalPrice);
  }, [cart]);
  useEffect(() => {
    const handleResize = () => setScreenHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // تعديل الكمية
 const updateQuantity = async (itemId, newQty) => {
  if (!user) return;

  if (newQty <= 0) {
    handleRemoveFromCart(itemId);
    return;
  }

  // 🔥 إيجاد المنتج في السلة
  const item = cart.find((i) => getItemId(i._id) === itemId);
  if (!item) return;

  // 🔥 المخزون الحقيقي (من populate)
  const stock =
    item.product?.stock ||
    (typeof item.stock === "object"
      ? Number(item.stock.$numberInt)
      : item.stock) ||
    0;

  // إذا حاول يزيد أكثر من المخزون → منع
  if (newQty > stock) {
    setAlertMessage(` لا يمكن طلب أكثر من ${stock} للمنتج "${item.name}"`);
    setTimeout(() => setAlertMessage(""), 2500);
    return;
  }

  try {
    await updateCartItem(user._id, itemId, { quantity: newQty });
    await fetchCurrentUser();
  } catch (err) {
    console.error("Failed to update quantity:", err);
  }
};


  // حذف من السلة
  const handleRemoveFromCart = async (itemId) => {
    if (!user) return;
    try {
      await removeFromCart(user._id, itemId);
      await fetchCurrentUser();
    } catch (err) {
      console.error("Failed to remove from cart:", err);
    }
  };
  // حذف من المفضلة
  const handleRemoveFavorite = async (productId) => {
    if (!user) return;
    try {
      await removeFavorite(user._id, productId);
      await fetchCurrentUser();
    } catch (err) {
      console.error("Failed to remove favorite:", err);
    }
  };
  // إضافة من المفضلة إلى السلة
  const handleAddToCart = async (product) => {
    if (!user) {
      showAlert("يرجى تسجيل الدخول أولاً");
      return;
    }
    const productId = getItemId(product._id);
    try {
      await addToCart(user._id, {
        product: productId,
        name: product.name,
        price:
          typeof product.price === "object"
            ? Number(product.price.$numberInt)
            : product.price,
        mainImage: product.mainImage,
        quantity: 1,
      });
      await fetchCurrentUser();
      showAlert("تمت إضافة المنتج إلى السلة");
    } catch (err) {
      console.error("Failed to add to cart:", err);
      showAlert("فشل في إضافة المنتج");
    }
  };
  const showAlert = (msg) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(""), 2000);
  };

  const getItemId = (id) => {
    if (!id) return null;
    if (typeof id === "string") return id;
    if (id.$oid) return id.$oid;
    if (id.toString) return id.toString();
    return String(id);
  };
  // 🔹 الشريط السفلي
  return (
    <>
<motion.div
  style={{
    ...styles.navbar(layoutMode),
  }}
>
  {/* زر الرئيسية */}
  <motion.button
    style={styles.iconBtn}
    whileTap={{ scale: 0.9 }}
    onClick={() => {
      setActiveModal(null);
      navigate("/");
    }}
  >
    <img src={homeIcon} alt="Home" style={styles.icon} />
  </motion.button>

  {/* زر السلة */}
  <motion.button
    style={styles.iconBtn}
    whileTap={{ scale: 0.9 }}
    onClick={() => {
      setActiveModal("cart");
      fetchCurrentUser();
    }}
  >
    <img src={cartIcon} alt="Cart" style={styles.icon} />
    {cart.length > 0 && <span style={styles.badge}>{cart.length}</span>}
  </motion.button>

  {/* زر المفضلة */}
  <motion.button
    style={styles.iconBtn}
    whileTap={{ scale: 0.9 }}
    onClick={() => {
      setActiveModal("fav");
      fetchCurrentUser();
    }}
  >
    <img src={favIcon} alt="Favorite" style={styles.bigFavIcon} />
  </motion.button>

  {/* زر تغيير الاتجاه */}
  <motion.button
    style={styles.iconBtn}
    whileTap={{ scale: 0.9 }}
    onClick={() =>
      setLayoutMode((prev) =>
        prev === "vertical" ? "horizontal" : "vertical"
      )
    }
  >
    {layoutMode === "vertical" ? (
      <PanelRightClose size={26} color="#f1ebcc" />
    ) : (
      <PanelTopClose size={26} color="#f1ebcc" />
    )}
  </motion.button>
</motion.div>



      {/* 🛒 نافذة السلة */}
      <AnimatePresence>
        {activeModal === "cart" && (
          <>
            <CartSheet
 

              cart={cart}
              loading={loading}
              total={total}
              screenHeight={screenHeight}
              setActiveModal={setActiveModal}
              updateQuantity={updateQuantity}
              handleRemoveFromCart={handleRemoveFromCart}
              navigate={navigate}
              getItemId={getItemId}
               getImageUrl={getImageUrl}
            />
          </>
        )}
      </AnimatePresence>
      {/* ❤️ نافذة المفضلة */}
      <AnimatePresence>
        {activeModal === "fav" && (
          <>
           <FavSheet


              favorites={favorites}
              loading={loading}
              screenHeight={screenHeight}
              setActiveModal={setActiveModal}
              handleAddToCart={handleAddToCart}
              handleRemoveFavorite={handleRemoveFavorite}
              getItemId={getItemId}
               getImageUrl={getImageUrl}
            />
          </>
        )}
      </AnimatePresence>
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
const CartSheet = ({ cart, loading, total, screenHeight, setActiveModal, updateQuantity, handleRemoveFromCart, navigate, getItemId ,getImageUrl, }) => {
  const sheetY = useMotionValue(0);
  const opacity = useTransform(sheetY, [0, screenHeight], [0.45, 0]);
  const paddingBottom = useTransform(sheetY, (y) => y);
  const controls = useDragControls();
  return (
    <>
      <motion.div
        style={{ ...styles.overlay, opacity }}
        onClick={() => setActiveModal(null)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.45 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
     <motion.div
        style={{ ...styles.sheet, maxHeight: "100vh", y: sheetY }}
        initial={{ y: screenHeight }}
        animate={{ y: 0 }}
        exit={{ y: screenHeight }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        drag="y"
        dragListener={false}
        dragControls={controls}
        dragConstraints={{ top: 0, bottom: screenHeight }}
        dragElastic={0.2}
        onDragEnd={(_, { velocity }) => {
          const currentY = sheetY.get();
          const snapPoints = [0, screenHeight * 0.5, screenHeight];
          const closest = snapPoints.reduce((prev, curr) =>
            Math.abs(curr - currentY) < Math.abs(prev - currentY) ? curr : prev
          );
          if (velocity.y > 500 || closest >= screenHeight) {
            setActiveModal(null);
          } else {
            animate(sheetY, closest, { type: "spring", stiffness: 300, damping: 30 });
          }
        }}
      >


        <div
          onPointerDown={(e) => controls.start(e)}
          style={styles.handle}
        />
        <h3 style={styles.title}>سلتي ({cart.length})</h3>
        <div style={{ ...styles.scroll, paddingBottom }}>
          {loading ? (
            <p style={styles.emptyText}>جاري التحميل...</p>
          ) : cart.length === 0 ? (
            <p style={styles.emptyText}>السلة فارغة</p>
          ) : (
            cart.map((item) => {
              const price =
                typeof item.price === "object"
                  ? Number(item.price.$numberInt)
                  : item.price;
              const quantity =
                typeof item.quantity === "object"
                  ? Number(item.quantity.$numberInt)
                  : item.quantity;
              const itemId = getItemId(item._id);
              if (!itemId) return null;
              return (
                <div key={itemId} style={styles.card}>
                  <img
                    src={getImageUrl(item.mainImage)}

                    alt={item.name}
                    style={styles.image}
                  />
                  <div style={styles.details}>
                    <h4 style={styles.name}>{item.name}</h4>
                    <p style={styles.price}>{price} ريال</p>
                    <div style={styles.actions}>
                      <button
                        style={styles.qtyBtn}
                        onClick={() =>
                          updateQuantity(itemId, quantity - 1)
                        }
                      >
                        <img
                          src={minusIcon}
                          alt="-"
                          style={styles.smallIcon}
                        />
                      </button>
                      <span>{quantity}</span>
                      <button
                        style={styles.qtyBtn}
                        onClick={() =>
                          updateQuantity(itemId, quantity + 1)
                        }
                      >
                        <img
                          src={plusIcon}
                          alt="+"
                          style={styles.smallIcon}
                        />
                      </button>
                    </div>
                  </div>
                  <img
                    src={trashIcon}
                    alt="delete"
                    style={styles.deleteIcon}
                    onClick={() => handleRemoveFromCart(itemId)}
                  />
                </div>
              );
            })
          )}
        </div>
        {cart.length > 0 && (
          <div style={styles.footer}>
            <div style={styles.total}>
              الإجمالي: <strong>{total} ريال</strong>
            </div>
            <button
              style={styles.checkoutBtn}
              onClick={() => {
                setActiveModal(null);
                navigate("/checkout");
              }}
            >
              إتمام الشراء
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
};
const FavSheet = ({ favorites, loading, screenHeight, setActiveModal, handleAddToCart, handleRemoveFavorite, getItemId ,getImageUrl, }) => {
  const sheetY = useMotionValue(0);
  const opacity = useTransform(sheetY, [0, screenHeight], [0.45, 0]);
  const paddingBottom = useTransform(sheetY, (y) => y);
  const controls = useDragControls();
  return (
    <>
      <motion.div
        style={{ ...styles.overlay, opacity }}
        onClick={() => setActiveModal(null)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.45 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
      <motion.div
        style={{ ...styles.sheet, maxHeight: "100vh", y: sheetY }}
        initial={{ y: screenHeight }}
        animate={{ y: 0 }}
        exit={{ y: screenHeight }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        drag="y"
        dragListener={false}
        dragControls={controls}
        dragConstraints={{ top: 0, bottom: screenHeight }}
        dragElastic={0.2}
        onDragEnd={(_, { velocity }) => {
          const currentY = sheetY.get();
          const snapPoints = [0, screenHeight * 0.5, screenHeight];
          const closest = snapPoints.reduce((prev, curr) =>
            Math.abs(curr - currentY) < Math.abs(prev - currentY) ? curr : prev
          );
          if (velocity.y > 500 || closest >= screenHeight) {
            setActiveModal(null);
          } else {
            animate(sheetY, closest, { type: "spring", stiffness: 300, damping: 30 });
          }
        }}
      >


        <div
          onPointerDown={(e) => controls.start(e)}
          style={styles.handle}
        />
        <h3 style={styles.title}>مفضلتي ({favorites.length})</h3>
        <div style={{ ...styles.scroll, paddingBottom }}>
          {loading ? (
            <p style={styles.emptyText}>جاري التحميل...</p>
          ) : favorites.length === 0 ? (
            <p style={styles.emptyText}>لا توجد منتجات مفضلة</p>
          ) : (
            favorites.map((item) => {
              const price =
                typeof item.price === "object"
                  ? Number(item.price.$numberInt)
                  : item.price;
              const itemId = getItemId(item._id);
              if (!itemId) return null;
              return (
                <div key={itemId} style={styles.card}>
                  <img
                    src={getImageUrl(item.mainImage)}

                    alt={item.name}
                    style={styles.image}
                  />
                  <div style={styles.details}>
                    <h4 style={styles.name}>{item.name}</h4>
                    <p style={styles.price}>{price} ريال</p>
                  </div>
                  <div style={styles.favActions}>
                    <img
                      src={cartAddIcon}
                      alt="add to cart"
                      style={styles.smallIcon}
                      onClick={() => handleAddToCart(item)}
                    />
                    <img
                      src={trashIcon}
                      alt="delete"
                      style={styles.smallIcon}
                      onClick={() => handleRemoveFavorite(itemId)}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </>
  );
};
export default BottomNav;


const styles = {
  badge: {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    background: "#a0bebf",
    color: "#a0bebf",
    fontSize: "10px",
    fontWeight: "bold",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  navbar: (mode) => ({
  position: "fixed",
  zIndex: 1000,
  background: "rgba(160, 190, 191, 0.55)", // نفس اللون A0BEBF لكن شفاف
backdropFilter: "blur(10px)",
WebkitBackdropFilter: "blur(10px)", // للجوال
border: "1px solid rgba(255,255,255,0.25)",
boxShadow: "0 8px 25px rgba(0,0,0,0.15)",

  borderRadius: "30px",
  display: "flex",
  gap: "15px",

  ...(mode === "vertical"
    ? {
        // 🔵 وضع عامودي كامل
        top: "50%",
        left: "20px",
        transform: "translateY(-50%)",
        flexDirection: "column",
        width: "70px",
        height: "auto",
        padding: "15px 0",
      }
    : {
        // 🟡 الوضع الأفقي الأساسي
        bottom: "70px",
        left: "50%",
        transform: "translateX(-50%)",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        width: "90vw",
        maxWidth: "420px",
        height: "65px",
      }),
}),
  iconBtn: { background: "transparent", border: "none", cursor: "pointer", position: "relative" },
  icon: { width: "35px", height: "35px" },
  bigFavIcon: { width: "30px", height: "30px" },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    zIndex: 1200,
  },
 sheet: {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  width: "100%",
  background: "#a0bebf",
  borderTopLeftRadius: "30px",
  borderTopRightRadius: "30px",
  boxShadow: "0 -4px 15px rgba(0,0,0,0.25)",
  padding: "20px",
  zIndex: 1300,

  // ✅ بدل maxHeight إلى ارتفاع ثابت
  height: "400px",

  // ✅ حتى لا يمتد المحتوى ويظهر سكرول داخلي
  overflow: "hidden",

  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "stretch",
},

  scroll: {
  flex: 1,
    overflowY: "auto",         // ✅ التمرير العمودي
  overflowX: "hidden",       // ✅ لا تمرير أفقي
  paddingRight: "6px",
  WebkitOverflowScrolling: "touch", // ✅ تمرير ناعم على الجوال
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
title: {
  fontSize: "1.2rem",
  fontWeight: "700",
  marginBottom: "12px",
  textAlign: "center",
  color: "#f1ebcc",   // ← اللون الجديد
},

  emptyText: { textAlign: "center", color: "#f1ebcc ", marginTop: "20px" },
  card: {
    display: "flex",
    alignItems: "center",
    background: "#f1ebcc",
    borderRadius: "30px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    padding: "8px",
    gap: "10px",
  },
  image: {
    width: "70px",
    height: "70px",
    borderRadius: "30px",
    objectFit: "cover",
    border: "1px solid #f2a72d",
  },
  details: { flex: 1 },
  name: { fontSize: "0.95rem",color: "#493c33", fontWeight: "600", marginBottom: "4px" },
  price: { color: "#493c33", fontWeight: "500" },
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
  deleteIcon: { width: "50px", height: "30px", cursor: "pointer" },
  favActions: { display: "flex", gap: "22px", alignItems: "center" },
  smallIcon: { width: "22px", height: "22px", cursor: "pointer" },
  footer: {
    marginTop: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #f2a72d",
    paddingTop: "10px",
  },
  total: { fontSize: "1rem",color: "#f1ebcc", fontWeight: "600" },
  checkoutBtn: {
    background: "linear-gradient(90deg,#6b7f4f,#6b7f4f)",
    border: "none",
    borderRadius: "30px",
    padding: "10px 20px",
    fontWeight: "600",
    color: "#f1ebcc",
    cursor: "pointer",
  },
};