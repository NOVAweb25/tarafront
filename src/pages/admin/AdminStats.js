// src/pages/admin/AdminStats.jsx
import React, { useEffect, useState } from "react";
import { getStats, getReviews } from "../../api/api";
import { colors, fonts, fontSizes } from "../../utils/theme";
import { motion } from "framer-motion";
import AdminSidebar from "../../components/AdminSidebar";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AdminStats = () => {
  const [stats, setStats] = useState({
    users: 0,
    deliveredOrders: 0,
    confirmedBookings: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    userGrowth: [],
  });
  const [reviews, setReviews] = useState([]);

  const fetchStats = async () => {
    const res = await getStats();
    setStats(res.data);
  };
const dashboardIcon= "https://res.cloudinary.com/dp1bxbice/image/upload/v1763968567/close_mcygjs.svg";

  const fetchReviews = async () => {
    const res = await getReviews();
    setReviews(res.data);
  };

  useEffect(() => {
    fetchStats();
    fetchReviews();
  }, []);

const orderData = [
  { name: "تم التسليم", value: stats.deliveredPercentage },
  { name: "تم الإلغاء", value: stats.cancelledPercentage },
];

  const pieColors = ["#6b7f4f", "#493c33", "#d15c1d"];

  return (
  <>
    {/* ✅ الشريط الجانبي العائم (خارج تدفق الصفحة) */}
    <AdminSidebar />

    {/* ✅ محتوى الصفحة الأساسي */}
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <div style={styles.container}>

  {/* أيقونة لوحة الإحصائيات */}
  <div style={styles.headerIconContainer}>
    <img src={dashboardIcon} alt="Dashboard" style={styles.headerIcon} />
  </div>
        {/* --- الكروت الدائرية --- */}
        <div style={styles.statsContainer}>
          <motion.div style={{ ...styles.statCard, background: "#6b7f4f" }} whileHover={{ scale: 1.1 }}>
            <h3 style={styles.statValue}>{stats.users}</h3>
            <p style={styles.statLabel}>عدد المستخدمين</p>
          </motion.div>
          <motion.div style={{ ...styles.statCard, background: "#493c33" }} whileHover={{ scale: 1.1 }}>
            <h3 style={styles.statValue}>{stats.deliveredOrders}</h3>
            <p style={styles.statLabel}>الطلبات المنفذة</p>
          </motion.div>
          <motion.div style={{ ...styles.statCard, background: "#d15c1d" }} whileHover={{ scale: 1.1 }}>
            <h3 style={styles.statValue}>{stats.confirmedBookings}</h3>
            <p style={styles.statLabel}>الحجوزات المؤكدة</p>
          </motion.div>
        </div>

        {/* --- الرسوم البيانية --- */}
        <div style={styles.chartsContainer}>
          {/* LineChart */}
          <div style={styles.chartBox}>
            <h3 style={styles.chartTitle}> نمو المستخدمين</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.userGrowth}>
                <CartesianGrid stroke="#f2a72d" strokeDasharray="5 5" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke={"#f2a72d"} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* PieChart */}
          <div style={styles.chartBox}>
            <h3 style={styles.chartTitle}> حالة الطلبات</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
  data={orderData}
  dataKey="value"
  nameKey="name"
  cx="50%"
  cy="50%"
  outerRadius={80}
  label={({ name, value }) => `${name}: ${value}%`}
>
  {orderData.map((entry, index) => (
    <Cell key={index} fill={pieColors[index]} />
  ))}
</Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- آراء العملاء --- */}
        <h2 style={{ ...styles.title, marginTop: "40px" }}>آراء العملاء</h2>
        <div style={styles.reviewsContainer}>
          {reviews.length > 0 ? (
            reviews.map((r, index) => (
              <motion.div
                key={r._id || index}
                style={styles.reviewCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <h4 style={styles.reviewUser}>{r.userName}</h4>
                <p style={styles.reviewContent}>{r.content}</p>
                <div style={styles.reviewRatingContainer}>
  {Array.from({ length: 5 }).map((_, i) => (
    <span
      key={i}
      style={{
        ...styles.star,
        ...(i < r.rating ? styles.starActive : {}),
      }}
    >
      ★
    </span>
  ))}
</div>

              </motion.div>
            ))
          ) : (
            <p style={styles.noReviews}>لا توجد آراء بعد</p>
          )}
        </div>
      </div>
    </div>
  </>
);
};

export default AdminStats;

const styles = {
  container: {
    flex: 1,
    background: "#f1ebcc",
    padding: "15px",
    fontFamily: fonts.primary,
  },

reviewRatingContainer: {
  display: "flex",
  gap: "3px",
  marginTop: "5px",
},

star: {
  fontSize: "18px",
  color: "#6b7f4f", // خلفية النجم غير المفعّل
},

starActive: {
  background: "linear-gradient(45deg, #d15c1d, #f2a72d)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: "bold",
  transform: "scale(1.1)",
},

  title: {
    fontFamily: fonts.secondary,
    color: "#d15c1d",
    fontSize: "20px",
    marginBottom: "15px",
    textAlign: "center",
  },
  statsContainer: {
    display: "flex",
    flexWrap: "wrap", // يسمح بالتقليص على الشاشات الصغيرة
    gap: "15px",
    justifyContent: "center",
    marginBottom: "25px",
  },
  statCard: {
    width: "120px", // أصغر شوي عشان يناسب الجوال
    height: "120px",
    borderRadius: "50%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#f1ebcc",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  statValue: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: "13px",
    marginTop: "4px",
    textAlign: "center",
  },
  chartsContainer: {
    display: "flex",
    flexDirection: "column", // عمودي للشاشات الصغيرة
    gap: "20px",
    marginBottom: "25px",
  },
  chartBox: {
    width: "100%", // يشغل العرض كامل
    background: "#fff",
    borderRadius: "30px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    padding: "10px",
  },
  chartTitle: {
    fontSize: "15px",
    marginBottom: "10px",
    color: "#d15c1d",
    textAlign: "center",
  },
  reviewsContainer: {
    marginTop: "15px",
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
  },
  reviewCard: {
    background: "#fff",
    padding: "12px 15px",
    borderRadius: "30px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
  },
  reviewUser: {
    margin: 0,
    fontWeight: "bold",
    color: "#6b7f4f",
    fontSize: "15px",
  },
  reviewContent: {
    margin: "6px 0",
    fontSize: "14px",
    lineHeight: "1.4",
    color: "#493c33",
  },
  reviewRating: {
    fontSize: "14px",
    color: colors.highlight,
    fontWeight: "bold",
  },

headerIconContainer: {
  display: "flex",
  justifyContent: "center",
  marginBottom: "20px",
},

headerIcon: {
  width: "80px", // حجم الأيقونة في الأعلى
  height: "80px",
},

  noReviews: {
    textAlign: "center",
    color: "#a0bebf",
    fontSize: "14px",
  },
};
