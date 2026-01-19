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
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
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
            const message = error.response.data?.message || 'Terjadi kesalahan';
            return Promise.reject(new Error(message));
        } else if (error.request) {
            // No response received
            return Promise.reject(new Error('Tidak dapat terhubung ke server'));
        } else {
            return Promise.reject(error);
        }
    }
);

// Auth endpoints
export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    googleAuth: (data) => api.post('/auth/google', data),
    facebookAuth: (data) => api.post('/auth/facebook', data),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    getProfile: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/me', data),
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
    getByFarm: (farmId, params) => api.get(`/farms/${farmId}/animals`, { params }),
    getById: (id) => api.get(`/animals/${id}`),
    create: (farmId, data) => api.post(`/farms/${farmId}/animals`, data),
    update: (id, data) => api.put(`/animals/${id}`, data),
    delete: (id) => api.delete(`/animals/${id}`),
    getStats: (farmId) => api.get(`/farms/${farmId}/animals/stats`),
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
    create: (data) => api.post('/orders', data),
    getMyOrders: (params) => api.get('/orders/my', { params }),
    getById: (id) => api.get(`/orders/${id}`),
    getByNumber: (orderNumber) => api.get(`/orders/number/${orderNumber}`),
    cancel: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
    getSellerOrders: (params) => api.get('/orders/seller', { params }),
    updateStatus: (id, status, note) => api.put(`/orders/${id}/status`, { status, note }),
    getStats: () => api.get('/orders/stats'),
};

// Course endpoints
export const courseApi = {
    getAll: (params) => api.get('/courses', { params }),
    getById: (id) => api.get(`/courses/${id}`),
    getBySlug: (slug) => api.get(`/courses/slug/${slug}`),
    getFeatured: (limit) => api.get('/courses/featured', { params: { limit } }),
    getPopular: (limit) => api.get('/courses/popular', { params: { limit } }),
    create: (data) => api.post('/courses', data),
    update: (id, data) => api.put(`/courses/${id}`, data),
    publish: (id) => api.put(`/courses/${id}/publish`),
    enroll: (courseId) => api.post(`/courses/${courseId}/enroll`),
    getProgress: (courseId) => api.get(`/courses/${courseId}/progress`),
    getEnrolled: (params) => api.get('/courses/user/enrolled', { params }),
    completeLesson: (courseId, lessonId, timeSpent) =>
        api.post(`/courses/${courseId}/lessons/${lessonId}/complete`, { timeSpent }),
};

// Material endpoints
export const materialApi = {
    getAll: (params) => api.get('/materials', { params }),
    getById: (id) => api.get(`/materials/${id}`),
    getBySlug: (slug) => api.get(`/materials/slug/${slug}`),
    getFeatured: (limit) => api.get('/materials/featured', { params: { limit } }),
    getPopular: (limit) => api.get('/materials/popular', { params: { limit } }),
    getByAnimalType: (animalType, params) => api.get(`/materials/animal/${animalType}`, { params }),
    create: (data) => api.post('/materials', data),
    update: (id, data) => api.put(`/materials/${id}`, data),
    like: (id) => api.post(`/materials/${id}/like`),
    unlike: (id) => api.delete(`/materials/${id}/like`),
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

export default api;
