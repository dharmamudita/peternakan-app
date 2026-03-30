/**
 * App Constants
 */

export const API_URL = 'http://192.168.1.7:5000/api';

export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    THEME: 'app_theme',
    ONBOARDING: 'onboarding_complete',
};

export const USER_ROLES = {
    ADMIN: 'admin',
    FARMER: 'farmer',
    SELLER: 'seller',
    BUYER: 'buyer',
    INSTRUCTOR: 'instructor',
    USER: 'user',
};

export const ANIMAL_TYPES = {
    CATTLE: { id: 'sapi', label: 'Sapi', icon: '🐄' },
    GOAT: { id: 'kambing', label: 'Kambing', icon: '🐐' },
    SHEEP: { id: 'domba', label: 'Domba', icon: '🐑' },
    CHICKEN: { id: 'ayam', label: 'Ayam', icon: '🐔' },
    DUCK: { id: 'bebek', label: 'Bebek', icon: '🦆' },
    RABBIT: { id: 'kelinci', label: 'Kelinci', icon: '🐰' },
    PIG: { id: 'babi', label: 'Babi', icon: '🐷' },
    FISH: { id: 'ikan', label: 'Ikan', icon: '🐟' },
    OTHER: { id: 'lainnya', label: 'Lainnya', icon: '🐾' },
};

export const ORDER_STATUS = {
    PENDING: { id: 'pending', label: 'Menunggu', color: '#FF9800' },
    CONFIRMED: { id: 'confirmed', label: 'Dikonfirmasi', color: '#2196F3' },
    PROCESSING: { id: 'processing', label: 'Diproses', color: '#9C27B0' },
    SHIPPED: { id: 'shipped', label: 'Dikirim', color: '#00BCD4' },
    DELIVERED: { id: 'delivered', label: 'Diterima', color: '#4CAF50' },
    COMPLETED: { id: 'completed', label: 'Selesai', color: '#4CAF50' },
    CANCELLED: { id: 'cancelled', label: 'Dibatalkan', color: '#F44336' },
};

export const DIFFICULTY_LEVELS = {
    BEGINNER: { id: 'pemula', label: 'Pemula', color: '#4CAF50' },
    INTERMEDIATE: { id: 'menengah', label: 'Menengah', color: '#FF9800' },
    ADVANCED: { id: 'lanjutan', label: 'Lanjutan', color: '#F44336' },
};

export const MATERIAL_TYPES = {
    ARTICLE: { id: 'artikel', label: 'Artikel', icon: 'document-text' },
    VIDEO: { id: 'video', label: 'Video', icon: 'play-circle' },
    PDF: { id: 'pdf', label: 'PDF', icon: 'document' },
    INFOGRAPHIC: { id: 'infografis', label: 'Infografis', icon: 'image' },
    AUDIO: { id: 'audio', label: 'Audio', icon: 'musical-notes' },
};

export default {
    API_URL,
    STORAGE_KEYS,
    USER_ROLES,
    ANIMAL_TYPES,
    ORDER_STATUS,
    DIFFICULTY_LEVELS,
    MATERIAL_TYPES,
};
