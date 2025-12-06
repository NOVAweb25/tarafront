// src/api/api.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "https://poiseback.onrender.com/api";



console.log("API BASE URL:", API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor للتوكن
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
/* ---------------------- Auth ---------------------- */
export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);
export const logoutUser = () => api.post("/auth/logout");
export const getCurrentUser = () => api.get("/auth/me");
export const verifyPassword = (data) => api.post("/auth/verify-password", data);
export const updateUsername = (data) => api.put("/auth/update-username", data);
export const updatePassword = (data) => api.put("/auth/update-password", data);

/* ---------------------- Users ---------------------- */
export const getAllUsers = () => api.get("/users");
export const getUserById = (id) => api.get(`/users/${id}`);
export const updateUser = (id, data) => api.put(`/users/${id}`, data, {
  headers: { "Content-Type": "multipart/form-data" },
});
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Favorites
export const addFavorite = (userId, data) => api.post(`/users/${userId}/favorites`, data);
export const removeFavorite = (userId, productId) => api.delete(`/users/${userId}/favorites/${productId}`);

// Cart
export const addToCart = (userId, data) => api.post(`/users/${userId}/cart`, data);
export const updateCartItem = (userId, itemId, data) => api.put(`/users/${userId}/cart/${itemId}`, data);
export const removeFromCart = (userId, itemId) => api.delete(`/users/${userId}/cart/${itemId}`);
/* ---------------------- Sections ---------------------- */
export const createSection = (formData) =>
  api.post("/sections", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getSections = () => api.get("/sections");

export const getSectionById = (id) => api.get(`/sections/${id}`);

export const updateSection = async (id, data) => {
  // لو data FormData، أرسلها كما هي؛ وإلا بنِ FormData أو JSON
  if (data instanceof FormData) {
    return await api.put(`/sections/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } else if (data.mainImage instanceof File) {
    const formData = new FormData();
    for (const key in data) {
      if (data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    }
    return await api.put(`/sections/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } else {
    return await api.put(`/sections/${id}`, data);
  }
};
export const deleteSection = (id) => api.delete(`/sections/${id}`);

/* ---------------------- Categories ---------------------- */
export const createCategory = (data) => api.post("/categories", data);
export const getCategories = () => api.get("/categories");
export const getCategoryById = (id) => api.get(`/categories/${id}`);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

/* ---------------------- Products ---------------------- */
/* ---------------------- Products ---------------------- */
export const createProduct = async (formData) => {
  return await api.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const getProducts = (filters = {}) =>
  api.get("/products", { params: filters });
export const getProductById = (id) => api.get(`/products/${id}`);
export const updateProduct = async (id, formData) => {
  return await api.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const deleteProduct = (id) => api.delete(`/products/${id}`);
// 🔔 تسجيل الرغبة في المنتج (جديد)
export const notifyInterest = async (productId, userId) => {
  return await api.post(`/products/${productId}/notify-interest`, { userId });
};
/* ---------------------- Sessions ---------------------- */
export const createSession = (data) => api.post("/sessions", data);
export const getSessions = () => api.get("/sessions");
export const getSessionById = (id) => api.get(`/sessions/${id}`);
export const updateSession = (id, data) => api.put(`/sessions/${id}`, data);
export const deleteSession = (id) => api.delete(`/sessions/${id}`);

/* ---------------------- Locations ---------------------- */
export const createLocation = (data) => api.post("/locations", data);
export const getLocations = () => api.get("/locations");
export const getLocationById = (id) => api.get(`/locations/${id}`);
export const updateLocation = (id, data) => api.put(`/locations/${id}`, data);
export const deleteLocation = (id) => api.delete(`/locations/${id}`);

/* ---------------------- Times ---------------------- */
export const createTimeSlot = (data) => api.post("/times", data);
export const getTimeSlots = () => api.get("/times");
export const getTimeSlotById = (id) => api.get(`/times/${id}`);
export const updateTimeSlot = (id, data) => api.put(`/times/${id}`, data);
export const deleteTimeSlot = (id) => api.delete(`/times/${id}`);

/* ---------------------- Unavailable Dates ---------------------- */
export const createUnavailableDate = (data) => api.post("/unavailable-dates", data);
export const getUnavailableDates = () => api.get("/unavailable-dates");
export const getUnavailableDateById = (id) => api.get(`/unavailable-dates/${id}`);
export const updateUnavailableDate = (id, data) => api.put(`/unavailable-dates/${id}`, data);
export const deleteUnavailableDate = (id) => api.delete(`/unavailable-dates/${id}`);

/* ---------------------- Surveys ---------------------- */
export const createSurvey = (data) => api.post("/surveys", data);
export const getSurveys = () => api.get("/surveys");
export const getSurveyById = (id) => api.get(`/surveys/${id}`);
export const updateSurvey = (id, data) => api.put(`/surveys/${id}`, data);
export const deleteSurvey = (id) => api.delete(`/surveys/${id}`);

/* ---------------------- Bookings ---------------------- */
export const createBooking = (data) => api.post("/bookings", data);
export const getBookings = () => api.get("/bookings");
export const getBookingById = (id) => api.get(`/bookings/${id}`);
export const updateBooking = (id, data) => api.put(`/bookings/${id}`, data);
export const deleteBooking = (id) => api.delete(`/bookings/${id}`);

// Reschedule
export const requestReschedule = (id, data) => api.post(`/bookings/${id}/reschedule`, data);
export const respondReschedule = (id, data) => api.put(`/bookings/${id}/reschedule/respond`, data);

/* ---------------------- Orders ---------------------- */
export const createOrder = (data) => api.post("/orders", data);
export const getMyOrders = (userId, params = {}) => api.get(`/orders/user/${userId}`, { params });
export const getOrders = (params = {}) => api.get("/orders", { params });
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const updateOrder = (id, data) => api.put(`/orders/${id}`, data);
export const createOrderWithProof = (formData) =>
  api.post("/orders/with-proof", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteOrder = (id) => api.delete(`/orders/${id}`);
export const uploadPaymentProof = (id, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/orders/${id}/payment-proof`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

};
/* ---------------------- Banks ---------------------- */
export const createBankDetail = (data) =>
  api.post("/banks", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getBankDetails = () => api.get("/banks");
export const getBankDetailById = (id) => api.get(`/banks/${id}`);
export const updateBankDetail = (id, data) =>
  api.put(`/banks/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteBankDetail = (id) => api.delete(`/banks/${id}`);
/* ---------------------- Notifications ---------------------- */
export const createNotification = (data) => api.post("/notifications", data);
export const getNotifications = () => api.get("/notifications");
export const getNotificationById = (id) => api.get(`/notifications/${id}`);
export const markNotificationAsRead = (id) => api.put(`/notifications/${id}/read`, {});
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);

/* ---------------------- Settings ---------------------- */
export const createSetting = (data) => api.post("/settings", data);
export const getSettings = () => api.get("/settings");
export const getSettingById = (id) => api.get(`/settings/${id}`);
export const updateSetting = (id, data) => api.put(`/settings/${id}`, data);
export const deleteSetting = (id) => api.delete(`/settings/${id}`);

/* ---------------------- Reviews ---------------------- */
export const addReview = (data) => api.post("/reviews", data);
export const getReviews = () => api.get("/reviews");

/* ---------------------- Stats ---------------------- */
export const getStats = () => api.get("/stats");

export default api;

/*----------------------Pyment------------------------*/
export const createCardPayment = (data) =>
  api.post("/payment/create-payment", data);

export const chargeSavedCard = (data) =>
  api.post("/payment/charge-saved-card", data);

