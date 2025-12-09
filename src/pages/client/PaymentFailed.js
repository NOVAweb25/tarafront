import React from "react";
import { Link } from "react-router-dom";

const PaymentFailed = () => {
  return (
    <div style={styles.page}>
      <h1 style={{ ...styles.title, color: "#6b7f4f" }}> فشل الدفع!</h1>
      <p style={styles.msg}>
        لم يتم تنفيذ العملية. تأكد من بطاقة الدفع أو أعد المحاولة.
      </p>

      <Link to="/checkout" style={styles.btn}>
        إعادة المحاولة
      </Link>
    </div>
  );
};

export default PaymentFailed;

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
  title: { fontSize: "28px", marginBottom: "10px" },
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
