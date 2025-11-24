import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import AdminSidebar from "../../components/AdminSidebar";
import "./AdminProfile.css";
import { getCurrentUser, updateUser } from "../../api/api";

const AdminProfile = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
   const [saving, setSaving] = useState(false);
 const SearchIcon = "https://res.cloudinary.com/dp1bxbice/image/upload/v1763968618/search_ke1zur.svg";
const ImageIcon= "https://res.cloudinary.com/dp1bxbice/image/upload/v1763968571/image_anmq2j.svg";
const EditIcon= "https://res.cloudinary.com/dp1bxbice/image/upload/v1763968570/edit_xmyhv0.svg";

  // 🟢 تحميل بيانات المستخدم
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const res = await getCurrentUser();
      const data = res.data;

      if (!data.displayOptions) {
        data.displayOptions = {
          showPic: true,
          showFirstName: true,
          showLastName: true,
          showNickname: true,
        };
      }

      setUser(data);
      setFormData(data);
      setPreviewUrl(data.profilePic || null);
    } catch (err) {
      console.error("❌ Error loading user data:", err);
    }
  };

  // 🟠 تغيير الصورة (قبل الحفظ)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData({ ...formData, profilePic: file });
    setPreviewUrl(URL.createObjectURL(file));
  };

  // 🟣 حفظ البيانات
  const handleSave = async () => {
  try {
    setSaving(true); // 🔵 بدء التحميل

    const data = new FormData();

    if (formData.profilePic instanceof File) {
      data.append("profilePic", formData.profilePic);
    }

    ["firstName", "lastName", "nickname"].forEach((f) => {
      if (formData[f]) data.append(f, formData[f]);
    });

    data.append("displayOptions", JSON.stringify(formData.displayOptions));

    await updateUser(user._id, data);
    await loadUserData();
    setEditing(false);
  } catch (err) {
    console.error("❌ Error saving data:", err);
  } finally {
    setSaving(false); // 🔵 انتهاء التحميل
  }
};


  // 🔁 التبديل في خيارات العرض
  const toggleDisplay = (field) => {
    setFormData({
      ...formData,
      displayOptions: {
        ...formData.displayOptions,
        [field]: !formData.displayOptions[field],
      },
    });
  };

  if (!user) return null;

  // ✅ عرض الصورة من Cloudinary أو محلية مؤقتة
  const profileImage =
    formData.profilePic instanceof File
      ? previewUrl
      : user.profilePic
      ? user.profilePic.startsWith("http")
        ? user.profilePic
        : `${window.location.origin}${user.profilePic}`
      : ImageIcon;

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-profile-center">
        <motion.div
          className="profile-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* 🖼️ صورة المستخدم */}
          <div
            className="profile-pic-wrapper"
            onClick={() => fileInputRef.current.click()}
          >
            <div className="profile-pic-circle">
              <img
                src={profileImage}
                alt="profile"
                onError={(e) => (e.target.src = ImageIcon)}
              />
              <div className="pic-overlay">
                <img src={EditIcon} alt="upload" />
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              hidden
              ref={fileInputRef}
              onChange={handleImageChange}
            />
          </div>

          {/* 🧾 بيانات المستخدم */}
          <div className="user-info">
            <h2 className="username">{user.username}</h2>

            {!editing ? (
              <>
                <div className="name-row">
                  <span>
                    {user.firstName} {user.lastName}
                  </span>
                  <img
                    src={EditIcon}
                    alt="edit"
                    className="edit-icon"
                    onClick={() => setEditing(true)}
                  />
                </div>

                <div className="toggles">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.displayOptions.showFirstName}
                      onChange={() => toggleDisplay("showFirstName")}
                    />
                    عرض الاسم الأول
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.displayOptions.showLastName}
                      onChange={() => toggleDisplay("showLastName")}
                    />
                    عرض الاسم الأخير
                  </label>
                </div>

                <div className="nickname-row">
                  <span
                    className={`nickname ${
                      !user.nickname ? "placeholder" : ""
                    }`}
                  >
                    {user.nickname || "حدد اسم الشهرة (اختياري)"}
                  </span>
                  <img
                    src={EditIcon}
                    alt="edit"
                    className="edit-icon"
                    onClick={() => setEditing(true)}
                  />
                </div>

                <label className="toggle-nickname">
                  <input
                    type="checkbox"
                    checked={formData.displayOptions.showNickname}
                    onChange={() => toggleDisplay("showNickname")}
                  />
                  عرض اسم الشهرة
                </label>
              </>
            ) : (
              <div className="edit-fields">
                <input
                  type="text"
                  value={formData.firstName || ""}
                  placeholder="الاسم الأول"
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
                <input
                  type="text"
                  value={formData.lastName || ""}
                  placeholder="الاسم الأخير"
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
                <input
                  type="text"
                  value={formData.nickname || ""}
                  placeholder="اسم الشهرة (اختياري)"
                  onChange={(e) =>
                    setFormData({ ...formData, nickname: e.target.value })
                  }
                />

                <div className="buttons-row">
                  <button className="cancel" onClick={() => setEditing(false)}>
                    إلغاء
                  </button>
                  <button className="save" onClick={handleSave} disabled={saving}>
  {saving ? "جاري الحفظ..." : "حفظ"}
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

export default AdminProfile;
