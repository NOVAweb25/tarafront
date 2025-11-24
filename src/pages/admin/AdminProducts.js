import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "../../components/AdminSidebar";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getCategories,
  getSections,
} from "../../api/api";
import "./AdminProducts.css";
import SearchIcon from "../../assets/search.svg";
import PlusIcon from "../../assets/plus.svg";
import EditIcon from "../../assets/edit.svg";
import DeleteIcon from "../../assets/delete.svg";
import ImageIcon from "../../assets/image.svg";
import CloseIcon from "../../assets/close.svg";
const API_BASE = process.env.REACT_APP_API_BASE;


const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    section: "",
    price: 0,
    description: "",
    stock: 0,
    isActive: true,
    mainImage: null,
    images: [],
  });
  const [deletedImages, setDeletedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const modalRef = useRef(null);
  const imageModalRef = useRef(null);
  useEffect(() => {
    const loadData = async () => {
      await fetchSections();
      await fetchCategories();
      await fetchProducts();
    };
    loadData();
  }, []);
  useEffect(() => {
    if (formData.section) {
      const selectedSecId = formData.section;
      const relatedCats = categories.filter((cat) => {
        const catSectionId = typeof cat.section === 'string' ? cat.section : cat.section?._id;
        return catSectionId === selectedSecId;
      });
      setFilteredCategories(relatedCats);
    } else {
      setFilteredCategories([]);
    }
  }, [formData.section, categories]);
  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      const data = res?.data || [];
      const processedData = data.map((product) => ({
  ...product,
  mainImage: product.mainImage
    ? product.mainImage.startsWith("http")
      ? product.mainImage
      : `${API_BASE}${product.mainImage}`
    : null,
  images: product.images
    ? product.images.map((img) =>
        img.startsWith("http") ? img : `${API_BASE}${img}`
      )
    : [],
}));

      setProducts(processedData);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };
  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      const data = res?.data || [];
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };
  const fetchSections = async () => {
    try {
      const res = await getSections();
      const data = res?.data || [];
      setSections(data);
    } catch (err) {
      console.error("Error fetching sections:", err);
    }
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowModal(false);
        setSelectedProduct(null);
        resetForm();
      }
      if (imageModalRef.current && !imageModalRef.current.contains(e.target)) {
        setShowImageModal(false);
        setSelectedImageUrl(null);
      }
    };
    if (showModal || showImageModal) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showModal, showImageModal]);
  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      section: "",
      price: 0,
      description: "",
      stock: 0,
      isActive: true,
      mainImage: null,
      images: [],
    });
    setDeletedImages([]);
    setIsUploading(false);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.category.trim() ||
      !formData.section.trim() ||
      formData.price <= 0
    ) {
      alert("البيانات الأساسية مطلوبة (name, category, section, price > 0)!");
      return;
    }
    setIsUploading(true);
    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("category", formData.category);
      payload.append("section", formData.section);
      payload.append("price", formData.price.toString());
      payload.append("description", formData.description || "");
      payload.append("stock", formData.stock.toString());
      payload.append("isActive", formData.isActive.toString());
      if (formData.mainImage && formData.mainImage instanceof File) {
        payload.append("mainImage", formData.mainImage);
      }
      formData.images.forEach((img) => {
        if (img instanceof File) {
          payload.append("images", img);
        }
      });
      if (selectedProduct && deletedImages.length > 0) {
        const relativeDeleted = deletedImages.map((img) => img.replace(API_BASE, ''));
        payload.append("deletedImages", relativeDeleted.join(','));
      }
      let savedProduct;
      if (selectedProduct) {
        savedProduct = await updateProduct(selectedProduct._id, payload);
      } else {
        savedProduct = await createProduct(payload);
      }
     const updatedProduct = {
  ...savedProduct.data,
  mainImage: savedProduct.data.mainImage
    ? savedProduct.data.mainImage.startsWith("http")
      ? savedProduct.data.mainImage
      : `${API_BASE}${savedProduct.data.mainImage}`
    : null,
  images: savedProduct.data.images
    ? savedProduct.data.images.map((img) =>
        img.startsWith("http") ? img : `${API_BASE}${img}`
      )
    : [],
};

      setProducts((prev) => selectedProduct
        ? prev.map((prod) => prod._id === selectedProduct._id ? updatedProduct : prod)
        : [updatedProduct, ...prev]
      );
      resetForm();
      setShowModal(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error("Submit error:", err);
      alert(`خطأ: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      try {
        await deleteProduct(id);
        setProducts((prev) => prev.filter((prod) => prod._id !== id));
      } catch (err) {
        console.error(err);
        alert("خطأ في الحذف!");
        fetchProducts();
      }
    }
  };
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024) {
      setFormData({ ...formData, mainImage: file });
    } else if (file) {
      alert(file.type.startsWith("image/") ? "حجم الصورة كبير جدًا (أقصى 5MB)!" : "يرجى اختيار صورة فقط!");
    }
  };
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024);
    setFormData({ ...formData, images: [...formData.images, ...validFiles] });
    e.target.value = "";
  };
  const handleImageClick = (url) => {
    setSelectedImageUrl(url);
    setShowImageModal(true);
  };
  const handleRemoveOldImage = (imgPath) => {
    if (selectedProduct) {
      const updatedOldImages = selectedProduct.images.filter((img) => img !== imgPath);
      setSelectedProduct({ ...selectedProduct, images: updatedOldImages });
      setDeletedImages([...deletedImages, imgPath]);
    }
  };
  const handleRemoveNewImage = (index) => {
    const updatedNewImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedNewImages });
  };
  const handleEdit = (product) => {
    const productSectionId = product.section?._id || product.section || "";
    const productCategoryId = product.category?._id || product.category || "";
    setSelectedProduct(product);
    setFormData({
      name: product.name || "",
      category: productCategoryId,
      section: productSectionId,
      price: product.price || 0,
      description: product.description || "",
      stock: product.stock || 0,
      isActive: product.isActive !== undefined ? product.isActive : true,
      mainImage: null,
      images: [],
    });
    setDeletedImages([]);
    setShowModal(true);
  };
  const filteredProducts = products.filter((prod) =>
    prod.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const previewMainImage = formData.mainImage
    ? URL.createObjectURL(formData.mainImage)
    : selectedProduct?.mainImage;
  return (
    <div className="admin-page">
      <AdminSidebar />
      <div className="admin-products-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="ابحث عن منتج..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <img
            src={SearchIcon}
            alt="بحث"
            className="search-icon"
            onClick={() => console.log("بحث:", searchTerm)}
          />
        </div>
        <motion.button
          className="add-btn"
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setShowModal(true);
            setSelectedProduct(null);
            resetForm();
          }}
        >
          <img src={PlusIcon} alt="add" />
        </motion.button>
        <div className="products-list">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <motion.div
                key={product._id}
                className="product-card"
                whileTap={{ scale: 0.98 }}
              >
                <div className="product-actions side">
                  <motion.button
                    className="edit-btn"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEdit(product)}
                  >
                    <img src={EditIcon} alt="edit" />
                  </motion.button>
                  <motion.button
                    className="delete-btn"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(product._id)}
                  >
                    <img src={DeleteIcon} alt="delete" />
                  </motion.button>
                </div>
                <div className="product-left">
                  <img
                    src={product.mainImage || ImageIcon}
                    alt={product.name}
                    onClick={() => handleImageClick(product.mainImage)}
                    onError={(e) => (e.target.src = ImageIcon)}
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="product-right">
                  <h3>{product.name}</h3>
                  <p className="price">{product.price} ريال</p>
                  <p className="stock">
  {product.stock > 0 ? (
    <>المخزون: {product.stock}</>
  ) : (
    <span className="out-of-stock">لم يعد متوفر</span>
  )}
</p>

                </div>
                {product.images && product.images.length > 0 && (
                  <div className="product-gallery">
                    {product.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`صورة ${idx + 1}`}
                        onClick={() => handleImageClick(img)}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <p className="no-products">لا توجد منتجات</p>
          )}
        </div>
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
  onTouchMove={(e) => e.stopPropagation()} // يمنع منع التمرير
  style={{
    overflowY: "auto",            // ✅ تفعيل التمرير العمودي داخل المودال
    WebkitOverflowScrolling: "touch", // ✅ تمرير ناعم للجوال
    maxHeight: "90vh",            // ✅ يحد الارتفاع (حتى يظهر السكرول)
  }}
>

        <div className="grabber" />
        <button
  className="cancel-btn"
  onClick={() => {
    setShowModal(false);
    setSelectedProduct(null);
    resetForm();
  }}
>
  <img src={CloseIcon} alt="close" />
</button>


        <h2>{selectedProduct ? "تعديل المنتج" : "إضافة منتج جديد"}</h2>

        {/* ✅ النموذج بالكامل داخل form */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            flex: 1,
          }}
        >
          {/* صورة المنتج الرئيسية */}
          <div className="image-picker">
            <label>صورة المنتج الرئيسية (اختياري)</label>
            <div
              className="main-image-preview"
              onClick={() =>
                document.querySelector(".image-picker input").click()
              }
            >
              {previewMainImage ? (
                <img src={previewMainImage} alt="preview" />
              ) : (
                <img
                  src={ImageIcon}
                  alt="upload"
                  style={{
                    width: "48px",
                    height: "48px",
                    opacity: 0.5,
                  }}
                />
              )}
            </div>
            <input
              type="file"
              hidden
              onChange={handleMainImageChange}
              accept="image/*"
            />
          </div>

          {/* اسم المنتج */}
          <div>
            <label htmlFor="product-name">اسم المنتج</label>
            <input
              id="product-name"
              type="text"
              placeholder="اسم المنتج"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          {/* القسم */}
          <div>
            <label htmlFor="product-section">القسم</label>
            <select
              id="product-section"
              value={formData.section}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  section: e.target.value,
                  category: "",
                })
              }
              required
            >
              <option value="">اختر القسم</option>
              {sections.length > 0 ? (
                sections.map((sec) => (
                  <option key={sec._id} value={sec._id}>
                    {sec.name}
                  </option>
                ))
              ) : (
                <option disabled>جاري تحميل الأقسام...</option>
              )}
            </select>
          </div>

          {/* الفئة */}
          <div>
            <label htmlFor="product-category">الفئة</label>
            <select
              id="product-category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
              disabled={!formData.section}
            >
              <option value="">اختر الفئة</option>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))
              ) : (
                <option disabled>لا توجد فئات للقسم المحدد</option>
              )}
            </select>
          </div>

          {/* المخزون */}
          <div>
            <label htmlFor="product-stock">المخزون</label>
            <input
              id="product-stock"
              type="number"
              placeholder="المخزون"
              value={formData.stock}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stock: parseInt(e.target.value) || 0,
                })
              }
              min="0"
            />
          </div>

          {/* السعر */}
          <div>
            <label htmlFor="product-price">السعر</label>
            <input
              id="product-price"
              type="number"
              placeholder="السعر"
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: parseFloat(e.target.value) || 0,
                })
              }
              required
              min="0"
              step="0.01"
            />
          </div>

          {/* الوصف */}
          <div>
            <label htmlFor="product-description">الوصف</label>
            <textarea
              id="product-description"
              placeholder="الوصف"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          {/* ✅ صور المنتج */}
<div className="images-section">
  <h3>صور المنتج</h3>

  {/* زر الإضافة */}
  <div className="images-actions">
    <input
      type="file"
      multiple
      hidden
      id="add-product-images"
      onChange={handleImagesChange}
      accept="image/*"
    />
    <button
      type="button"
      onClick={() =>
        document.getElementById("add-product-images").click()
      }
    >
      <img src={PlusIcon} alt="إضافة صور" />
    </button>
  </div>

  {/* ✅ صور المنتج القديمة (في التعديل فقط) */}
  {selectedProduct?.images?.length > 0 && (
    <div className="images-preview">
      {selectedProduct.images.map((img, idx) => (
        <div key={`old-${idx}`} className="image-wrapper">
          <img
            src={img}
            alt={`صورة ${idx + 1}`}
            onClick={() => handleImageClick(img)}
          />
          <button
            type="button"
            className="remove-btn"
            onClick={() => handleRemoveOldImage(img)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )}

  {/* ✅ صور جديدة قبل الحفظ */}
  {formData.images.length > 0 && (
    <div className="images-preview">
      {formData.images.map((img, idx) => (
        <div key={`new-${idx}`} className="image-wrapper">
          <img
            src={URL.createObjectURL(img)}
            alt={`صورة جديدة ${idx + 1}`}
          />
          <button
            type="button"
            className="remove-btn"
            onClick={() => handleRemoveNewImage(idx)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )}
</div>



          {/* ✅ زر الحفظ في النهاية */}
          <button
  type="submit"
  className="save-btn"
  disabled={isUploading}
>
  {isUploading ? "جاري الحفظ..." : "حفظ"}
</button>

        </form>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

        <AnimatePresence>
          {showImageModal && (
            <motion.div
              className="image-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowImageModal(false)}
            >
              <motion.div
                ref={imageModalRef}
                className="image-modal"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <button
                  className="image-close-btn"
                  onClick={() => {
                    setShowImageModal(false);
                    setSelectedImageUrl(null);
                  }}
                >
                  <img src={CloseIcon} alt="close" />
                </button>
                <img src={selectedImageUrl} alt="معاينة كبيرة" className="enlarged-image" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default AdminProducts;