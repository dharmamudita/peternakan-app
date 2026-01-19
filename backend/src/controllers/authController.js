/**
 * Auth Controller
 * Controller untuk autentikasi dan manajemen user
 */

const { AuthService } = require('../services');
const { asyncHandler } = require('../middlewares');
const { success, created, badRequest, serverError } = require('../utils/responseHelper');
const { parsePagination, parseFilters } = require('../utils/helpers');

/**
 * Register user baru
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
    const { uid, email, displayName, phoneNumber, role } = req.body;

    if (!uid || !email) {
        return badRequest(res, 'UID dan email wajib diisi');
    }

    const user = await AuthService.registerUser({
        uid,
        email,
        displayName,
        phoneNumber,
        role,
    });

    return created(res, user.toJSON(), 'Registrasi berhasil');
});

/**
 * Login - update last login
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
    const { uid } = req.body;

    if (!uid) {
        return badRequest(res, 'UID wajib diisi');
    }

    const user = await AuthService.login(uid);
    return success(res, user.toJSON(), 'Login berhasil');
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getProfile = asyncHandler(async (req, res) => {
    return success(res, req.user.toJSON(), 'Profil berhasil diambil');
});

/**
 * Update current user profile
 * PUT /api/auth/me
 */
const updateProfile = asyncHandler(async (req, res) => {
    const { displayName, phoneNumber, photoURL, address } = req.body;

    const user = await AuthService.updateProfile(req.user.id, {
        displayName,
        phoneNumber,
        photoURL,
        address,
    });

    return success(res, user.toJSON(), 'Profil berhasil diperbarui');
});

/**
 * Get all users (admin only)
 * GET /api/auth/users
 */
const getAllUsers = asyncHandler(async (req, res) => {
    const { page, limit } = parsePagination(req.query);
    const filters = parseFilters(req.query, ['role', 'isActive']);

    const result = await AuthService.getAllUsers(page, limit, filters);

    return res.status(200).json({
        success: true,
        message: 'Data user berhasil diambil',
        data: result.data.map(u => u.toJSON()),
        pagination: result.pagination,
    });
});

/**
 * Get user by ID (admin only)
 * GET /api/auth/users/:id
 */
const getUserById = asyncHandler(async (req, res) => {
    const User = require('../models/User');
    const user = await User.getById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User tidak ditemukan',
        });
    }

    return success(res, user.toJSON(), 'User berhasil diambil');
});

/**
 * Update user role (admin only)
 * PUT /api/auth/users/:id/role
 */
const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;

    if (!role) {
        return badRequest(res, 'Role wajib diisi');
    }

    const user = await AuthService.updateUserRole(req.params.id, role);
    return success(res, user.toJSON(), 'Role berhasil diperbarui');
});

/**
 * Deactivate user (admin only)
 * PUT /api/auth/users/:id/deactivate
 */
const deactivateUser = asyncHandler(async (req, res) => {
    await AuthService.deactivateUser(req.params.id);
    return success(res, null, 'User berhasil dinonaktifkan');
});

/**
 * Activate user (admin only)
 * PUT /api/auth/users/:id/activate
 */
const activateUser = asyncHandler(async (req, res) => {
    await AuthService.activateUser(req.params.id);
    return success(res, null, 'User berhasil diaktifkan');
});

/**
 * Delete user (admin only)
 * DELETE /api/auth/users/:id
 */
const deleteUser = asyncHandler(async (req, res) => {
    await AuthService.deleteUser(req.params.id);
    return success(res, null, 'User berhasil dihapus');
});

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    getAllUsers,
    getUserById,
    updateUserRole,
    deactivateUser,
    activateUser,
    deleteUser,
};
