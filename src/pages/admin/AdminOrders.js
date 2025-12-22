import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationPopup from "../../components/NotificationPopup";
import { requestNotificationPermission, listenToMessages } from "../../firebase";
import { Share2 } from "lucide-react";
import { getOrders, getOrderById, updateOrder } from "../../api/api";
import "./AdminOrders.css";
import AdminSidebar from "../../components/AdminSidebar";

const API_BASE = process.env.REACT_APP_API_BASE;


const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [activeStatusMenu, setActiveStatusMenu] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const filterRef = useRef(null);
   const user = JSON.parse(localStorage.getItem("user"));

const SearchIcon = "https://res.cloudinary.com/dp1bxbice/image/upload/v1763968618/search_ke1zur.svg";

const invoiceIcon= "https://res.cloudinary.com/dp1bxbice/image/upload/v1763968572/invoice_kkbd8p.svg";

  const statuses = [
    "بانتظار تأكيد الطلب",
    "تم تأكيد الطلب",
    "طلبك في الطريق",
    "تم التسليم",
    "جاهز للاستلام",
    "تم رفض الطلب",
  ];

  // جلب الطلبات
  const loadOrders = async (params = {}) => {
    try {
      const res = await getOrders(params);
      setOrders(res.data);
    } catch (err) {
      console.error("فشل تحميل الطلبات:", err);
    }
  };

useEffect(() => {
  if (user?.role !== "admin") return;
  console.log("📍 Notification.permission (Admin):", Notification.permission);
  if ("Notification" in window) {
    if (Notification.permission === "default") {
      setShowPopup(true);
    } else if (Notification.permission === "granted") {
      try {
        requestNotificationPermission(user._id);
      } catch (err) {
        console.error("خطأ في طلب إذن الإشعارات:", err);
        // هنا ممكن تعرض رسالة للمستخدم بدل وقف الـ app
        alert("الإشعارات غير مدعومة على هذا الجهاز. يرجى التحقق لاحقاً.");
      }
    } else {
      console.warn("⚠️ Notifications denied by user");
    }
  } else {
    console.warn("🛑 Notifications API غير مدعوم في هذا المتصفح.");
  }
  // 🟢 استمع للإشعارات (أضف try-catch هنا أيضاً لو لازم)
  try {
    listenToMessages((notification) => {
      loadOrders(); // أعد تحميل الطلبات
      alert(`${notification.title}: ${notification.body}`);
    });
  } catch (err) {
    console.error("خطأ في الاستماع للرسائل:", err);
  }
}, [user]);



useEffect(() => {
  // 🔹 عند فتح صفحة الطلبات، نعتبر التنبيهات مقروءة
  window.dispatchEvent(new Event("ordersViewed"));
}, []);

  useEffect(() => {
    loadOrders();
  }, []);

  // بحث حسب رقم الطلب
  const handleSearch = () => {
    const params = search ? { orderNumber: search } : {};
    loadOrders(params);
  };

  const handleShareLocation = (coords) => {
    if (!coords || coords.length !== 2) return;
    const lat = coords[1];
    const lng = coords[0];
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    if (navigator.share) {
      navigator.share({
        title: "موقع العميل",
        text: "موقع العميل على الخريطة:",
        url,
      });
    } else {
      window.open(url, "_blank");
    }
  };

  // تصفية حسب الحالة
  const handleFilter = (status) => {
    setStatusFilter(status);
    setShowFilterMenu(false);
    loadOrders({ status });
  };

  // فتح الفاتورة
  const openInvoice = async (orderId) => {
    try {
      const res = await getOrderById(orderId);
      setInvoiceData(res.data);
      setSelectedInvoice(orderId);
    } catch (err) {
      console.error("فشل تحميل الفاتورة:", err);
    }
  };

  // إغلاق الفاتورة
  const closeInvoice = () => {
    setSelectedInvoice(null);
    setInvoiceData(null);
  };

  // تحديث حالة الطلب
  const updateStatus = async (orderId, newStatus) => {
    try {
      await updateOrder(orderId, { status: newStatus });
      setActiveStatusMenu(null);
      loadOrders();
    } catch (err) {
      console.error("فشل تحديث الحالة:", err);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      if (search.trim() !== "") {
        loadOrders({ query: search }); // endpoint يدعم البحث المتعدد
      } else {
        loadOrders();
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [search]);

  // إغلاق القوائم عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilterMenu(false);
        setActiveStatusMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🟢 دالة لفتح الإيصال في تبويب جديد أو عرض الصورة داخلياً
  const openReceipt = (proofUrl) => {
    if (proofUrl.startsWith("http")) {
  window.open(proofUrl, "_blank");
} else {
  window.open(`${API_BASE}${proofUrl}`, "_blank");
}

  };


const allowNotifications = async () => {
  try {
    await requestNotificationPermission(user._id);
    setShowPopup(false);
    alert("سيتم تنبيهك عند وصول طلب جديد");
  } catch (err) {
    console.error("خطأ في تفعيل الإشعارات:", err);
    setShowPopup(false); // أقفل الـ popup حتى لو error
    alert("حدث خطأ أثناء تفعيل الإشعارات. يرجى التحقق من إعدادات المتصفح أو الجهاز.");
  }
};

console.log("🔍 API_BASE =", API_BASE);


  return (
    <div className="admin-page">
  {showPopup && (
        <NotificationPopup
          message="هل تريد تفعيل الإشعارات لتنبيهك عند وصول طلب جديد؟"
          onAllow={allowNotifications}
          onClose={() => setShowPopup(false)}
        />
      )}
      <AdminSidebar />
      <div className="admin-content">
        <h2 className="page-title">إدارة الطلبات</h2>
        {/* Search Bar */}
        <div className="search-container wide">
          <input
            type="text"
            placeholder="ابحث برقم الطلب، الاسم أو رقم الجوال..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input wide"
          />
          <img src={SearchIcon} alt="بحث" className="search-icon" />

        </div>
        <div className="filterContainer">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => handleFilter(e.target.value)}
          >
            <option value="">كل الحالات</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
       
        {/* Orders List */}
        <div className="orders-list">
          {orders.length > 0 ? (
  orders.map((order) => (
    <motion.div
      key={order._id}
      className="order-card"
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className="order-info">
        <div className="order-number">طلب #{order.orderNumber}</div>
        <div className="client-name">
          {order.user?.firstName} {order.user?.lastName}
        </div>
        <div className="phone">{order.user?.phone}</div>
      </div>

      <div className="order-actions">
        {/* زر الفاتورة */}
        <motion.button
          className="invoice-circle"
          whileTap={{ scale: 0.9 }}
          onClick={() => openInvoice(order._id)}
        >
          <img src={invoiceIcon} alt="فاتورة" />
        </motion.button>

        {/* زر الحالة */}
        <div
          className="status-btn"
          onClick={() =>
            setActiveStatusMenu(
              activeStatusMenu === order._id ? null : order._id
            )
          }
        >
          <span className="status-text">{order.status}</span>
        </div>
      </div>

      {/* ✅ نافذة منبثقة لتحديث حالة الطلب */}
      <AnimatePresence>
        {activeStatusMenu === order._id && (
          <>
            {/* الخلفية */}
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveStatusMenu(null)}
            />

            {/* النافذة */}
            <motion.div
              className="status-popup"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="popup-header">
                <h3>تحديث حالة الطلب #{order.orderNumber}</h3>
                <button
                  className="close-popup"
                  onClick={() => setActiveStatusMenu(null)}
                >
                  ✕
                </button>
              </div>

              <div className="popup-body">
                {statuses.map((s) => (
                  <div
                    key={s}
                    className={`popup-option ${
                      s === order.status ? "active" : ""
                    }`}
                    onClick={() => updateStatus(order._id, s)}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  ))
) : (
  <p className="no-orders">لا توجد طلبات</p>
)}
</div>
        {/* Invoice Modal */}
        <AnimatePresence>
          {selectedInvoice && invoiceData && (
            <>
              <motion.div
                className="modal-overlay"
                onClick={closeInvoice}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.div
                className="invoice-sheet"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <div className="invoice-header">
                  <h3>فاتورة الطلب #{invoiceData.orderNumber}</h3>
                  <button className="close-btn" onClick={closeInvoice}>
                    إغلاق
                  </button>
                </div>
                <div className="invoice-body">
                  {/* 👤 بيانات العميل */}
                  {invoiceData.shipping && (
                    <div className="client-section">
                      <h4>بيانات العميل</h4>
                      <p><strong>الاسم:</strong> {invoiceData.shipping.name}</p>
                      <p><strong>رقم الجوال:</strong> {invoiceData.shipping.phone}</p>
                      <p>
                        <strong>العنوان:</strong>{" "}
                        {invoiceData.shipping.city || "غير محدد"} -{" "}
                        {invoiceData.shipping.district || "غير محدد"}
                      </p>
                      {/* 🗺️ خريطة الموقع */}
                      {invoiceData.shipping.coords &&
                        invoiceData.shipping.coords.length === 2 && (
                          <div className="map-container">
                            <a
                              href={`https://www.google.com/maps?q=${invoiceData.shipping.coords[1]},${invoiceData.shipping.coords[0]}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="map-link"
                            >
                              <iframe
                                title="client-location"
                                className="client-map"
                                width="100%"
                                height="180"
                                style={{ borderRadius: "10px", marginTop: "8px" }}
                                src={`https://www.google.com/maps?q=${invoiceData.shipping.coords[1]},${invoiceData.shipping.coords[0]}&hl=ar&z=15&output=embed`}
                                allowFullScreen
                              ></iframe>
                            </a>
                            {/* 🔗 زر المشاركة */}
                            <button
                              className="share-btn"
                              onClick={() =>
                                handleShareLocation(invoiceData.shipping.coords)
                              }
                            >
                              <Share2 size={20} />
                              مشاركة
                            </button>
                          </div>
                        )}
                    </div>
                  )}
                  {/* 🛍️ المنتجات */}
                  <div className="invoice-items-section">
                    <h4>المنتجات</h4>
                    {invoiceData.items.map((item) => (
                      <div key={item._id} className="invoice-item">
                        <img
  src={
    item.product?.mainImage?.startsWith("http")
      ? item.product.mainImage
      : `${API_BASE}${item.product?.mainImage || item.mainImage}`
  }
  alt={item.product?.name || "منتج"}
  className="product-img"
/>

                        <div className="product-details">
                          <strong>{item.product?.name || item.name}</strong>
                          <p>
                            الكمية: {item.quantity} × السعر:{" "}
                            {item.product?.price || item.price} ر.س
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* 💰 المجموع */}
                  <div className="invoice-summary">
                    <p>مجموع المنتجات: <strong>{invoiceData.subtotal} ر.س</strong></p>
                    <p>سعر التوصيل: <strong>{invoiceData.delivery} ر.س</strong></p>
                    <h4>
                      الإجمالي: <strong className="total">{invoiceData.total} ر.س</strong>
                    </h4>
                  </div>
                  {/* 📎 الإيصال */}
                  {invoiceData.paymentProof && (
                    <div className="receipt-box">
                      <p><strong>الإيصال المرفق:</strong></p>
                      {/* 🟢 مربع اسم الملف مع نقر لفتح في تبويب جديد */}
                      <div
                        className="receipt-file"
                        onClick={() => openReceipt(invoiceData.paymentProof)}
                        style={{ cursor: "pointer" }}
                      >
                        {invoiceData.paymentProof.split("/").pop()}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminOrders;