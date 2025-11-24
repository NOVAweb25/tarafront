import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import logo from "../assets/logo.gif";

// ⭐ استيراد الأيقونات من assets
import tiktokIcon from "../assets/tiktok.svg";
import instaIcon from "../assets/instagram.svg";
import emailIcon from "../assets/email.svg";

const Footer = () => {
  return (
    <footer className="footer-container">

      {/* ─────── 📌 القسم الأول: نبذة عنا ─────── */}
      <div className="footer-about-section">
        <div className="footer-logo-circle">
          <img src={logo} alt="الشعار" className="footer-logo" />
        </div>
        <h3 className="footer-title about-title">نبذة عنا</h3>
        <p className="footer-about">
          شركتنا تسعى لتقديم أفضل الحلول والخدمات في مجالات التطوير، البناء،
          والتقنية مع رؤية حديثة تواكب المستقبل.
        </p>
      </div>

      {/* ─────── 📌 القسم الثاني: تابعنا + روابط ─────── */}
      <div className="footer-top">

        {/* ⭐ يسار: تابعنا على */}
        <div className="footer-section social-links">
          <h4 className="footer-title">تابعنا على</h4>
          <div className="social-icons-row">

            {/* تيك توك */}
            <div
              className="social-icon-circle"
              onClick={() => window.open("https://www.tiktok.com/@wafaaworld7", "_blank")}
            >
              <img src={tiktokIcon} alt="TikTok" />
            </div>

            {/* انستغرام */}
            <div
              className="social-icon-circle"
              onClick={() => window.open("https://www.instagram.com/wafaaworld7", "_blank")}
            >
              <img src={instaIcon} alt="Instagram" />
            </div>

          </div>
        </div>

        {/* ⭐ يمين: روابط تهمك */}
        <div className="footer-section important-links">
          <h4 className="footer-title">روابط تهمك</h4>
          <ul>
            <li><Link to="/privacy-policy">سياسة الخصوصية</Link></li>
            <li><Link to="/terms">الشروط والأحكام</Link></li>
            <li><Link to="/payment-policy">سياسة الدفع</Link></li>
            <li><Link to="/return-policy">سياسة الاسترجاع والاستبدال</Link></li>
            <li><Link to="/order-policy">سياسة الطلب</Link></li>
          </ul>
        </div>
      </div>

      {/* ─────── 📌 القسم الثالث: تواصل معنا ─────── */}
      <div className="footer-contact">
        <h4 className="footer-title">تواصل معنا</h4>

        <div
          className="contact-row"
          onClick={() => window.location.href = "mailto:TaraWafaa@hotmail.com"}
        >
          <div className="contact-icon-circle">
            <img src={emailIcon} alt="Email" />
          </div>
          <span className="contact-email">TaraWafaa@hotmail.com</span>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
