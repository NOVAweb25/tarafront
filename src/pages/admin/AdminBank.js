import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import AdminSidebar from "../../components/AdminSidebar";
import {
  createBankDetail,
  getBankDetails,
  updateBankDetail,
} from "../../api/api";
import "./AdminBank.css";
const API_BASE = process.env.REACT_APP_API_BASE;

const bankOptions = [
  "الأهلي",
  "الراجحي",
  "الرياض",
  "ساب",
  "البنك الفرنسي",
  "البلاد",
  "الجزيرة",
  "الإنماء",
  "غير محدد",
];
const AdminBank = () => {
  const [bank, setBank] = useState(null);
  const [formData, setFormData] = useState({
    ownerName: "",
    iban: "",
    accountNumber: "",
    bankName: "",
    barcode: "",
  });
  const [originalData, setOriginalData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [barcodePreview, setBarcodePreview] = useState(null);
  const [isBarcodeChanged, setIsBarcodeChanged] = useState(false);
  const barcodeInputRef = useRef(null);
const ImageIcon= "https://res.cloudinary.com/dp1bxbice/image/upload/v1763968571/image_anmq2j.svg";
const EditIcon= "https://res.cloudinary.com/dp1bxbice/image/upload/v1763968570/edit_xmyhv0.svg";
  useEffect(() => {
    loadBank();
  }, []);
  // 🟢 تحميل بيانات البنك من السيرفر
  const loadBank = async () => {
    try {
      const res = await getBankDetails();
      if (res.data.length > 0) {
        const b = res.data[0];
        const cleanData = {
          ownerName: b.ownerName || "",
          iban: b.iban || "",
          accountNumber: b.accountNumber || "",
          bankName: b.bankName || "",
          barcode: b.barcode || "",
        };
        setBank(b);
        setFormData(cleanData);
        setOriginalData(cleanData);
        setIsBarcodeChanged(false);
        if (b.barcode) setBarcodePreview(b.barcode);

      }
    } catch (err) {
      console.error("Error loading bank details:", err);
    }
  };
  // 🖼️ تغيير صورة الباركود
  const handleBarcodeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, barcode: file });
      setBarcodePreview(URL.createObjectURL(file));
      setIsBarcodeChanged(true);
    }
  };
  // 💾 حفظ التعديلات
  const handleSave = async () => {
    try {
      const data = new FormData();
      data.append("ownerName", formData.ownerName);
      data.append("iban", formData.iban);
      data.append("accountNumber", formData.accountNumber);
      data.append("bankName", formData.bankName);
      if (isBarcodeChanged && formData.barcode) {
        data.append("barcode", formData.barcode);
      }
      if (bank) await updateBankDetail(bank._id, data);
      else await createBankDetail(data);
      await loadBank();
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving bank detail:", err);
      alert(err.response?.data?.message || "حدث خطأ أثناء الحفظ");
    }
  };
  // ❌ إلغاء التعديلات
  const handleCancel = () => {
    setFormData(originalData);
    setBarcodePreview(originalData?.barcode || null);

    setIsBarcodeChanged(false);
    setIsEditing(false);
  };
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-bank-center">
        <motion.div
          className="bank-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* 🖼️ صورة الباركود */}
          <div
            className="barcode-wrapper"
            onClick={() => barcodeInputRef.current.click()}
          >
            <div className="barcode-circle">
              <img
                src={barcodePreview || ImageIcon}
                alt="barcode"
                onError={(e) => (e.target.src = ImageIcon)}
              />
              <div className="pic-overlay">
                <img src={ImageIcon} alt="upload" />
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              hidden
              capture="environment"
              ref={barcodeInputRef}
              onChange={handleBarcodeChange}
            />
          </div>
          {/* 🧾 بيانات البنك */}
          <div className="bank-info">
            <h2 className="title">
              إعدادات الدفع{" "}
              {!isEditing && (
                <img
                  src={EditIcon}
                  alt="edit"
                  className="edit-icon"
                  onClick={() => setIsEditing(true)}
                  title="تعديل بيانات الدفع"
                />
              )}
            </h2>
            {!isEditing ? (
              <>
                <div className="bank-row">
                  <strong>الاسم:</strong> {formData.ownerName || "-"}
                </div>
                <div className="bank-row">
                  <strong>رقم الآيبان:</strong> {formData.iban || "-"}
                </div>
                <div className="bank-row">
                  <strong>رقم الحساب:</strong> {formData.accountNumber || "-"}
                </div>
                <div className="bank-row">
                  <strong>اسم البنك:</strong> {formData.bankName || "غير محدد"}
                </div>
              </>
            ) : (
              <div className="edit-fields">
                {/* 🧍‍♂️ اسم صاحب الحساب */}
                <input
                  type="text"
                  placeholder="اسم صاحب الحساب"
                  value={formData.ownerName}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerName: e.target.value })
                  }
                />
                {/* 💳 رقم الآيبان */}
                <input
                  type="text"
                  inputMode="text"
                  maxLength={24}
                  placeholder="رقم الآيبان (SA + 22 رقم)"
                  value={formData.iban || ""}
                  onChange={(e) => {
                    let value = e.target.value
                      .toUpperCase()
                      .replace(/\s+/g, "");
                    if (
                      value === "" ||
                      value === "S" ||
                      value === "SA" ||
                      (value.startsWith("SA") &&
                        /^\d*$/.test(value.slice(2)) &&
                        value.slice(2).length <= 22)
                    ) {
                      setFormData({ ...formData, iban: value });
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pasted = e.clipboardData
                      .getData("text")
                      .toUpperCase()
                      .replace(/\s+/g, "");
                    if (
                      pasted.startsWith("SA") &&
                      /^\d*$/.test(pasted.slice(2)) &&
                      pasted.slice(2).length <= 22
                    ) {
                      setFormData({ ...formData, iban: pasted });
                    }
                  }}
                />
                {/* 🏦 رقم الحساب */}
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={21}
                  placeholder="رقم الحساب (حتى 21 رقم)"
                  value={formData.accountNumber || ""}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 21) {
                      setFormData({ ...formData, accountNumber: value });
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pasted = e.clipboardData
                      .getData("text")
                      .replace(/\D/g, "");
                    if (pasted.length <= 21) {
                      setFormData({ ...formData, accountNumber: pasted });
                    }
                  }}
                />
                {/* 🏛️ اختيار البنك */}
                <select
                  value={formData.bankName}
                  onChange={(e) =>
                    setFormData({ ...formData, bankName: e.target.value })
                  }
                >
                  <option value="">اختر اسم البنك</option>
                  {bankOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                {/* الأزرار */}
                <div className="buttons-row">
                  <button className="cancel" onClick={handleCancel}>
                    إلغاء
                  </button>
                  <button className="save" onClick={handleSave}>
                    حفظ
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default AdminBank;