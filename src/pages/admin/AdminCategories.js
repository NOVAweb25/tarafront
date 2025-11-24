import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "../../components/AdminSidebar";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  getSections,
} from "../../api/api";
import "./AdminCategories.css";
import SearchIcon from "../../assets/search.svg";
import PlusIcon from "../../assets/plus.svg";
import EditIcon from "../../assets/edit.svg";
import DeleteIcon from "../../assets/delete.svg";
import CloseIcon from "../../assets/close.svg";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    section: "",
    description: "",
    slug: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    if (sections.length > 0) fetchCategories();
  }, [sections]);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      const data = res?.data || [];
      const processedData = data.map((cat) => {
        const catSectionId = typeof cat.section === 'string' ? cat.section : cat.section?._id;
        const sectionObj = sections.find(s => s._id === catSectionId);
        return {
          ...cat,
          sectionName: sectionObj ? sectionObj.name : "غير محدد",
        };
      });
      setCategories(processedData);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchSections = async () => {
    try {
      const res = await getSections();
      setSections(res?.data || []);
    } catch (err) {
      console.error("Error fetching sections:", err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        closeModal();
      }
    };
    if (showModal) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showModal]);

  const closeModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: "", section: "", description: "", slug: "" });
    setIsUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.section.trim()) {
      alert("الاسم والقسم مطلوبان!");
      return;
    }
    setIsUploading(true);
    try {
      const payload = {
        name: formData.name,
        section: formData.section,
        description: formData.description || "",
        slug: formData.slug || "",
      };
      let savedCategory;
      if (selectedCategory) {
        savedCategory = await updateCategory(selectedCategory._id, payload);
      } else {
        savedCategory = await createCategory(payload);
      }
      const savedSectionId = typeof savedCategory.data.section === 'string'
        ? savedCategory.data.section
        : savedCategory.data.section?._id;
      const sectionObj = sections.find(s => s._id === savedSectionId);
      const processed = {
        ...savedCategory.data,
        sectionName: sectionObj ? sectionObj.name : "غير محدد",
      };
      setCategories(prev =>
        selectedCategory
          ? prev.map(cat => cat._id === selectedCategory._id ? processed : cat)
          : [processed, ...prev]
      );
      closeModal();
    } catch (err) {
      alert(`خطأ: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من الحذف؟")) {
      try {
        await deleteCategory(id);
        setCategories(prev => prev.filter(cat => cat._id !== id));
      } catch (err) {
        alert("فشل الحذف");
        fetchCategories();
      }
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    const sectionId = typeof category.section === 'string' ? category.section : category.section?._id || "";
    setFormData({
      name: category.name || "",
      section: sectionId,
      description: category.description || "",
      slug: category.slug || "",
    });
    setShowModal(true);
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-categories-container">
        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="ابحث عن تصنيف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <img src={SearchIcon} alt="بحث" className="search-icon" />
        </div>

        {/* Floating Add Button */}
        <motion.button
          className="add-btn"
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setShowModal(true);
            setSelectedCategory(null);
            resetForm();
          }}
        >
          <img src={PlusIcon} alt="إضافة" />
        </motion.button>

        {/* Categories List */}
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <motion.div
              key={category._id}
              className="category-card"
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileTap={{ scale: 0.98 }}
              drag="x"
              dragConstraints={{ left: -100, right: 0 }}
              dragElastic={0.2}
            >
              <div className="category-content">
                <div className="category-info">
                  <h3>{category.name}</h3>
                  <div className="category-section">
                    القسم: {category.sectionName}
                  </div>
                  {category.description && (
                    <p className="category-desc">{category.description}</p>
                  )}
                  {category.slug && (
                    <div className="category-slug">Slug: {category.slug}</div>
                  )}
                </div>
              </div>

              <div className="category-actions">
                <motion.button
                  className="edit-btn"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEdit(category)}
                >
                  <img src={EditIcon} alt="تعديل" />
                </motion.button>
                <motion.button
                  className="delete-btn"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(category._id)}
                >
                  <img src={DeleteIcon} alt="حذف" />
                </motion.button>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="no-categories">لا توجد تصنيفات</p>
        )}

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                ref={modalRef}
                className="modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <button className="close-btn" onClick={closeModal}>
                  <img src={CloseIcon} alt="إغلاق" />
                </button>
                <h2>
                  {selectedCategory ? "تعديل التصنيف" : "إضافة تصنيف جديد"}
                </h2>
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    placeholder="اسم التصنيف"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                  <select
                    value={formData.section}
                    onChange={(e) =>
                      setFormData({ ...formData, section: e.target.value })
                    }
                    required
                  >
                    <option value="">اختر القسم</option>
                    {sections.map((sec) => (
                      <option key={sec._id} value={sec._id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                  <textarea
                    placeholder="الوصف (اختياري)"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                  />
                                    <button type="submit" className="save-btn" disabled={isUploading}>
                    {isUploading ? "جاري الحفظ..." : "حفظ"}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminCategories;