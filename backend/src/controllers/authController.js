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
    const { uid, email, password, displayName, phoneNumber, role } = req.body;

    // Validasi: Harus ada Email. Dan harus ada (UID ATAU Password).
    // Jika dari client SDK -> UID. Jika register murni backend -> Password.
    if (!email) {
        return badRequest(res, 'Email wajib diisi');
    }
    if (!uid && !password) {
        return badRequest(res, 'Password wajib diisi (atau UID jika via client SDK)');
    }

    const user = await AuthService.registerUser({
        uid,
        email,
        password,
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
    const { uid, email, password } = req.body;

    let loginResult;

    if (email && password) {
        // Login dengan Email & Password
        loginResult = await AuthService.login(email, password);
    } else if (uid) {
        // Login dengan UID (Legacy/Client SDK)
        loginResult = await AuthService.login(uid);
    } else {
        return badRequest(res, 'Email dan Password wajib diisi');
    }

    const { user, token } = loginResult;

    return success(res, {
        user: user.toJSON(),
        token
    }, 'Login berhasil');
});

/**
 * Google Sign-In Authentication
 * POST /api/auth/google
 */
const googleAuth = asyncHandler(async (req, res) => {
    const { googleId, email, displayName, photoURL, idToken } = req.body;

    if (!email || !googleId) {
        return badRequest(res, 'Data Google tidak valid');
    }

    const result = await AuthService.googleLogin({
        googleId,
        email,
        displayName,
        photoURL,
        idToken,
    });

    const { user, token } = result;

    return success(res, {
        user: user.toJSON(),
        token
    }, 'Login Google berhasil');
});

/**
 * Facebook Sign-In Authentication
 * POST /api/auth/facebook
 */
const facebookAuth = asyncHandler(async (req, res) => {
    const { facebookId, email, displayName, photoURL, accessToken } = req.body;

    if (!email || !facebookId) {
        return badRequest(res, 'Data Facebook tidak valid');
    }

    const result = await AuthService.facebookLogin({
        facebookId,
        email,
        displayName,
        photoURL,
        accessToken,
    });

    const { user, token } = result;

    return success(res, {
        user: user.toJSON(),
        token
    }, 'Login Facebook berhasil');
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
    console.log('========== UPDATE PROFILE START ==========');
    console.log('[Controller] req.user:', req.user?.id, req.user?.email);
    console.log('[Controller] req.body:', req.body);

    const { displayName, phoneNumber, photoURL, address } = req.body;

    console.log('[Controller] Calling AuthService.updateProfile with ID:', req.user.id);

    const user = await AuthService.updateProfile(req.user.id, {
        displayName,
        phoneNumber,
        photoURL,
        address,
    });

    console.log('[Controller] Updated user result:', user?.toJSON());
    console.log('========== UPDATE PROFILE END ==========');

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

/**
 * Forgot Password
 * POST /api/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return badRequest(res, 'Email wajib diisi');
    }

    await AuthService.forgotPassword(email);

    return success(res, null, 'Email reset password telah dikirim');
});

/**
 * Request Seller OTP
 * POST /api/auth/seller/request-otp
 */
const requestSellerOtp = asyncHandler(async (req, res) => {
    const { password } = req.body;

    // User ID dari token (middleware authenticate)
    await AuthService.requestSellerOtp(req.user.uid, password);
    return success(res, null, 'Kode verifikasi OTP telah (disimulasikan) dikirim.');
});

/**
 * Verify Seller OTP
 * POST /api/auth/seller/verify-otp
 */
const verifySellerOtp = asyncHandler(async (req, res) => {
    const { otp } = req.body;

    if (!otp) {
        return badRequest(res, 'Kode OTP wajib diisi');
    }

    const updatedUser = await AuthService.verifySellerOtp(req.user.uid, otp);

    return success(res, updatedUser.toJSON(), 'Selamat! Akun Anda telah diupgrade menjadi Penjual.');
});

module.exports = {
    register,
    login,
    googleAuth,
    facebookAuth,
    forgotPassword,
    requestSellerOtp,
    verifySellerOtp,
    getProfile,
    updateProfile,
    getAllUsers,
    getUserById,
    updateUserRole,
    deactivateUser,
    activateUser,
    deleteUser,
};
