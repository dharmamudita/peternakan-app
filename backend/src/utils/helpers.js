/**
 * Helper Functions
 * Berbagai fungsi utility yang sering digunakan
 */

/**
 * Parse pagination params dari query
 */
const parsePagination = (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    return { page, limit };
};

/**
 * Generate random string
 */
const generateRandomString = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Generate slug dari string
 */
const generateSlug = (text) => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

/**
 * Format tanggal ke string Indonesia
 */
const formatDate = (date, options = {}) => {
    const defaultOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options,
    };
    return new Date(date).toLocaleDateString('id-ID', defaultOptions);
};

/**
 * Format mata uang
 */
const formatCurrency = (amount, currency = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
    }).format(amount);
};

/**
 * Calculate age dari tanggal lahir
 */
const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
};

/**
 * Calculate age in months (untuk hewan)
 */
const calculateAgeInMonths = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const months = (today.getFullYear() - birth.getFullYear()) * 12;
    return months + (today.getMonth() - birth.getMonth());
};

/**
 * Sanitize object - remove undefined dan null values
 */
const sanitizeObject = (obj) => {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined && value !== null) {
            sanitized[key] = value;
        }
    }
    return sanitized;
};

/**
 * Deep merge objects
 */
const deepMerge = (target, source) => {
    const output = { ...target };
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (source[key] instanceof Object && key in target) {
                output[key] = deepMerge(target[key], source[key]);
            } else {
                output[key] = source[key];
            }
        }
    }
    return output;
};

/**
 * Truncate text
 */
const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Calculate reading time (untuk artikel)
 */
const calculateReadingTime = (text, wordsPerMinute = 200) => {
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
};

/**
 * Parse filters dari query string
 */
const parseFilters = (query, allowedFilters = []) => {
    const filters = {};
    for (const filter of allowedFilters) {
        if (query[filter] !== undefined && query[filter] !== '') {
            // Handle boolean
            if (query[filter] === 'true') {
                filters[filter] = true;
            } else if (query[filter] === 'false') {
                filters[filter] = false;
            } else {
                filters[filter] = query[filter];
            }
        }
    }
    return filters;
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate phone number format (Indonesia)
 */
const isValidPhone = (phone) => {
    const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

/**
 * Get file extension from filename
 */
const getFileExtension = (filename) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Check if file is image
 */
const isImageFile = (mimetype) => {
    return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mimetype);
};

/**
 * Check if file is video
 */
const isVideoFile = (mimetype) => {
    return ['video/mp4', 'video/webm', 'video/ogg'].includes(mimetype);
};

module.exports = {
    parsePagination,
    generateRandomString,
    generateSlug,
    formatDate,
    formatCurrency,
    calculateAge,
    calculateAgeInMonths,
    sanitizeObject,
    deepMerge,
    truncateText,
    calculateReadingTime,
    parseFilters,
    isValidEmail,
    isValidPhone,
    getFileExtension,
    isImageFile,
    isVideoFile,
};
