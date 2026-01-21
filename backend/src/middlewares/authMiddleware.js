/**
 * Auth Middleware
 * Middleware untuk autentikasi dan otorisasi
 */

const { AuthService } = require('../services');
const { USER_ROLES, MESSAGES } = require('../config/constants');

/**
 * Middleware untuk verifikasi token Firebase
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: MESSAGES.ERROR.UNAUTHORIZED,
                error: 'Token tidak ditemukan',
            });
        }

        const token = authHeader.split('Bearer ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: MESSAGES.ERROR.UNAUTHORIZED,
                error: 'Token tidak valid',
            });
        }

        const user = await AuthService.getUserFromToken(token);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: MESSAGES.ERROR.UNAUTHORIZED,
                error: 'User tidak ditemukan',
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: MESSAGES.ERROR.UNAUTHORIZED,
                error: 'Akun tidak aktif',
            });
        }

        // Attach user ke request
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth Error:', error.message);
        return res.status(401).json({
            success: false,
            message: MESSAGES.ERROR.UNAUTHORIZED,
            error: error.message,
        });
    }
};

/**
 * Middleware opsional untuk autentikasi
 * Tidak akan error jika tidak ada token
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.user = null;
            return next();
        }

        const token = authHeader.split('Bearer ')[1];

        if (!token) {
            req.user = null;
            return next();
        }

        try {
            const user = await AuthService.getUserFromToken(token);
            req.user = user;
        } catch (error) {
            req.user = null;
        }

        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

/**
 * Middleware untuk mengecek role user
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: MESSAGES.ERROR.UNAUTHORIZED,
                error: 'User tidak terautentikasi',
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: MESSAGES.ERROR.FORBIDDEN,
                error: 'Anda tidak memiliki akses ke resource ini',
            });
        }

        next();
    };
};

/**
 * Middleware untuk admin only
 */
const adminOnly = (req, res, next) => {
    const SUPER_ADMIN_EMAIL = 'dharmamudita404@gmail.com';

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: MESSAGES.ERROR.UNAUTHORIZED,
            error: 'User tidak terautentikasi',
        });
    }

    // Bypass cek role jika email adalah SUPER ADMIN
    if (req.user.email === SUPER_ADMIN_EMAIL) {
        return next();
    }

    if (req.user.role !== USER_ROLES.ADMIN) {
        return res.status(403).json({
            success: false,
            message: MESSAGES.ERROR.FORBIDDEN,
            error: 'Hanya admin yang dapat mengakses resource ini',
        });
    }

    next();
};

/**
 * Middleware untuk farmer only
 */
const farmerOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: MESSAGES.ERROR.UNAUTHORIZED,
            error: 'User tidak terautentikasi',
        });
    }

    if (![USER_ROLES.FARMER, USER_ROLES.ADMIN].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: MESSAGES.ERROR.FORBIDDEN,
            error: 'Hanya peternak yang dapat mengakses resource ini',
        });
    }

    next();
};

/**
 * Middleware untuk seller only
 */
const sellerOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: MESSAGES.ERROR.UNAUTHORIZED,
            error: 'User tidak terautentikasi',
        });
    }

    if (![USER_ROLES.SELLER, USER_ROLES.ADMIN].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: MESSAGES.ERROR.FORBIDDEN,
            error: 'Hanya penjual yang dapat mengakses resource ini',
        });
    }

    next();
};

/**
 * Middleware untuk instructor only
 */
const instructorOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: MESSAGES.ERROR.UNAUTHORIZED,
            error: 'User tidak terautentikasi',
        });
    }

    if (![USER_ROLES.INSTRUCTOR, USER_ROLES.ADMIN].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: MESSAGES.ERROR.FORBIDDEN,
            error: 'Hanya instruktur yang dapat mengakses resource ini',
        });
    }

    next();
};

module.exports = {
    authenticate,
    optionalAuth,
    authorize,
    adminOnly,
    farmerOnly,
    sellerOnly,
    instructorOnly,
};
