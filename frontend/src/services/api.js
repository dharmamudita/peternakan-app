/**
 * API Service
 * Service untuk komunikasi dengan backend
 */

import axios from 'axios';
import * as storage from '../utils/storage';
import { API_URL, STORAGE_KEYS } from '../constants';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token
// Request interceptor - Add auth token
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                console.warn('No auth token available for request to', config.url);
            }
        } catch (error) {
            console.log('Error getting token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response) {
            // Server responded with error
            const data = error.response.data;
            const message = data?.message
                ? `${data.message}${data.error ? `: ${data.error}` : ''}`
                : 'Terjadi kesalahan';

            if (error.response.status === 401) {
                console.error('Unauthorized (401) - Token might be invalid or expired');
                // You might want to trigger a logout here via an event emitter
            }

            return Promise.reject(new Error(message));
        } else if (error.request) {
            // No response received
            return Promise.reject(new Error('Tidak dapat terhubung ke server'));
        } else {
            return Promise.reject(error);
        }
    }
);

import { FIREBASE_CONFIG } from '../config/firebase';

// Auth endpoints
export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    googleAuth: (data) => api.post('/auth/google', data),
    facebookAuth: (data) => api.post('/auth/facebook', data),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    requestSellerOtp: (password) => api.post('/auth/seller/request-otp', { password }),
    verifySellerOtp: (otp) => api.post('/auth/seller/verify-otp', { otp }),
    getProfile: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/me', data),
    changePassword: (oldPassword, newPassword) => api.post('/auth/change-password', { oldPassword, newPassword }),
    exchangeCustomToken: async (customToken) => {
        try {
            const response = await axios.post(
                `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_CONFIG.apiKey}`,
                { token: customToken, returnSecureToken: true }
            );
            return response.data.idToken;
        } catch (error) {
            console.error('Error exchanging custom token:', error.response?.data || error.message);
            throw error;
        }
    },
};

// Farm endpoints
export const farmApi = {
    getAll: (params) => api.get('/farms', { params }),
    getById: (id) => api.get(`/farms/${id}`),
    create: (data) => api.post('/farms', data),
    update: (id, data) => api.put(`/farms/${id}`, data),
    delete: (id) => api.delete(`/farms/${id}`),
    getDashboard: (id) => api.get(`/farms/${id}/dashboard`),
    getMyFarms: () => api.get('/farms/user/my'),
};

// Animal endpoints
export const animalApi = {
    getMyAnimals: (params) => api.get('/animals/my', { params }),
    getByFarm: (farmId, params) => api.get(`/farms/${farmId}/animals`, { params }),
    getById: (id) => api.get(`/animals/${id}`),
    create: (data) => api.post('/animals', data),
    update: (id, data) => api.put(`/animals/${id}`, data),
    delete: (id) => api.delete(`/animals/${id}`),
    getStats: () => api.get('/animals/stats'),
    getHealthRecords: (animalId, params) => api.get(`/animals/${animalId}/health-records`, { params }),
    addHealthRecord: (animalId, data) => api.post(`/animals/${animalId}/health-records`, data),
};

// Product endpoints
export const productApi = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    getBySlug: (slug) => api.get(`/products/slug/${slug}`),
    getFeatured: (limit) => api.get('/products/featured', { params: { limit } }),
    getBestSellers: (limit) => api.get('/products/best-sellers', { params: { limit } }),
    search: (q, params) => api.get('/products/search', { params: { q, ...params } }),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
    publish: (id) => api.put(`/products/${id}/publish`),
    getMyProducts: (params) => api.get('/products/seller/my', { params }),
};

// Shop endpoints
export const shopApi = {
    register: (data) => api.post('/shops/register', data),
    getMyShop: () => api.get('/shops/my'),
    getPending: (status) => api.get('/shops/pending', { params: { status } }),
    verify: (id, status) => api.put(`/shops/${id}/verify`, { status }),
};

// Seller Dashboard endpoints
export const sellerApi = {
    getStats: () => api.get('/seller/stats'),
    getRecentOrders: (limit = 5) => api.get('/seller/orders/recent', { params: { limit } }),
    getOrders: (status) => api.get('/seller/orders', { params: { status } }),
    getRevenue: () => api.get('/seller/revenue'),
    getReviews: () => api.get('/seller/reviews'),
};

// Cart endpoints
export const cartApi = {
    get: () => api.get('/cart'),
    addItem: (productId, quantity) => api.post('/cart/items', { productId, quantity }),
    updateItem: (productId, quantity) => api.put(`/cart/items/${productId}`, { quantity }),
    removeItem: (productId) => api.delete(`/cart/items/${productId}`),
    clear: () => api.delete('/cart'),
};

// Order endpoints
export const orderApi = {
    // Buyer
    create: (data) => api.post('/orders/create', data),
    getMyOrders: (status) => api.get('/orders/my', { params: { status } }),
    getById: (id) => api.get(`/orders/${id}`),
    confirmReceipt: (id) => api.put(`/orders/${id}/confirm-receipt`),
    addReview: (id, rating, comment) => api.post(`/orders/${id}/review`, { rating, comment }),

    // Seller
    getSellerOrders: (status) => api.get('/orders/seller/list', { params: { status } }),
    confirmOrder: (id) => api.put(`/orders/${id}/confirm`),
    shipOrder: (id, trackingNumber) => api.put(`/orders/${id}/ship`, { trackingNumber }),
};

// Course endpoints
export const courseApi = {
    getAll: (params) => api.get('/education/courses', { params }),
    getById: (id) => api.get(`/education/courses/${id}`),
    getBySlug: (slug) => api.get(`/education/courses/slug/${slug}`),
    getFeatured: (limit) => api.get('/education/courses/featured', { params: { limit } }),
    getPopular: (limit) => api.get('/education/courses/popular', { params: { limit } }),
    create: (data) => api.post('/education/courses', data),
    update: (id, data) => api.put(`/education/courses/${id}`, data),
    delete: (id) => api.delete(`/education/courses/${id}`),
    publish: (id) => api.put(`/education/courses/${id}/publish`),
    enroll: (courseId) => api.post(`/education/courses/${courseId}/enroll`),
    getProgress: (courseId) => api.get(`/education/courses/${courseId}/progress`),
    getEnrolled: (params) => api.get('/education/courses/enrolled', { params }),
    completeLesson: (courseId, lessonId, timeSpent) =>
        api.post(`/education/courses/${courseId}/lessons/${lessonId}/complete`, { timeSpent }),
    saveQuizScore: (courseId, quizId, score) =>
        api.post(`/education/courses/${courseId}/quizzes/${quizId}/score`, { score }),
};

// Material endpoints
export const materialApi = {
    getAll: (params) => api.get('/education/materials', { params }),
    getById: (id) => api.get(`/education/materials/${id}`),
    getBySlug: (slug) => api.get(`/education/materials/slug/${slug}`),
    getFeatured: (limit) => api.get('/education/materials/featured', { params: { limit } }),
    getPopular: (limit) => api.get('/education/materials/popular', { params: { limit } }),
    getByAnimalType: (animalType, params) => api.get(`/education/materials/animal/${animalType}`, { params }),
    create: (data) => api.post('/education/materials', data),
    update: (id, data) => api.put(`/education/materials/${id}`, data),
    delete: (id) => api.delete(`/education/materials/${id}`),
    like: (id) => api.post(`/education/materials/${id}/like`),
    unlike: (id) => api.delete(`/education/materials/${id}/like`),
};

// Education dashboard
export const educationApi = {
    getDashboard: () => api.get('/education/dashboard'),
    getStats: () => api.get('/education/stats'),
};

// Upload endpoints
export const uploadApi = {
    uploadImage: (formData) => api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    uploadImages: (formData) => api.post('/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    uploadVideo: (formData) => api.post('/upload/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    uploadDocument: (formData) => api.post('/upload/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    delete: (fileName) => api.delete(`/upload/${fileName}`),
};

// Notification endpoints
export const notificationApi = {
    sendBroadcast: (data) => api.post('/notifications/broadcast', data),
    getAll: () => api.get('/notifications'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
};

export default api;
