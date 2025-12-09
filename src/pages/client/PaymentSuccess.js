import React from "react";
import { Link } from "react-router-dom";

const PaymentSuccess = () => {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}> تم الدفع بنجاح!</h1>
      <p style={styles.msg}>شكراً لك، تم استلام دفعتك بنجاح.</p>

      <Link to="/my-orders" style={styles.btn}>
        عرض طلباتي
      </Link>
    </div>
  );
};

export default PaymentSuccess;

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f1ebcc",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Tajawal",
    padding: "20px",
  },
  title: { color: "#6b7f4f", fontSize: "28px", marginBottom: "10px" },
  msg: { color: "#a0bebf", marginBottom: "20px", fontSize: "18px" },
  btn: {
    background: "linear-gradient(90deg,#d15c1d,#f2a72d)",
    padding: "12px 25px",
    borderRadius: "30px",
    color: "#493c33",
    fontSize: "18px",
    textDecoration: "none",
  },
};
