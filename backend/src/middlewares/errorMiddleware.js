/**
 * Error Handler Middleware
 * Middleware untuk menangani error secara global
 */

const { MESSAGES } = require('../config/constants');

/**
 * Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: MESSAGES.ERROR.NOT_FOUND,
        error: `Route ${req.originalUrl} tidak ditemukan`,
    });
};

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Default error
    let statusCode = err.statusCode || 500;
    let message = err.message || MESSAGES.ERROR.SERVER;
    let error = err.error || null;

    // Firebase Auth Errors
    if (err.code && err.code.startsWith('auth/')) {
        statusCode = 401;
        switch (err.code) {
            case 'auth/id-token-expired':
                message = 'Token sudah kadaluarsa';
                break;
            case 'auth/id-token-revoked':
                message = 'Token sudah dicabut';
                break;
            case 'auth/invalid-id-token':
                message = 'Token tidak valid';
                break;
            case 'auth/user-not-found':
                message = 'User tidak ditemukan';
                break;
            default:
                message = 'Authentication error';
        }
    }

    // Firestore Errors
    if (err.code && (err.code.startsWith('firestore/') || err.code >= 1 && err.code <= 16)) {
        statusCode = 500;
        message = 'Database error';
    }

    // Validation Errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = MESSAGES.ERROR.VALIDATION;
        error = err.details || err.message;
    }

    // Multer Errors (file upload)
    if (err.code === 'LIMIT_FILE_SIZE') {
        statusCode = 400;
        message = 'Ukuran file terlalu besar';
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        statusCode = 400;
        message = 'Terlalu banyak file yang diupload';
    }

    res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? error || err.stack : error,
    });
};

/**
 * Async Handler Wrapper
 * Untuk menangkap error dari async function
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    notFoundHandler,
    errorHandler,
    asyncHandler,
};
