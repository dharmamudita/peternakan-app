/**
 * Shop Controller
 */
const Shop = require('../models/Shop');
const User = require('../models/User'); // Import directly to avoid circular dependency
const { asyncHandler } = require('../middlewares');
const { success, created, badRequest, notFound } = require('../utils/responseHelper');

// Daftarkan Toko Baru
const registerShop = asyncHandler(async (req, res) => {
    console.log('[registerShop] Request received');
    console.log('[registerShop] req.user:', req.user?.id, req.user?.email);
    console.log('[registerShop] req.body:', JSON.stringify(req.body, null, 2));

    const userId = req.user?.id;

    if (!userId) {
        console.error('[registerShop] No user ID found in request');
        return badRequest(res, 'User tidak terautentikasi dengan benar');
    }

    const { name, description, address, phoneNumber, nik, ktpImageUrl } = req.body;

    if (!name || !address || !phoneNumber || !nik) {
        console.log('[registerShop] Validation failed: missing required fields');
        return badRequest(res, 'Nama toko, alamat, nomor HP, dan NIK wajib diisi');
    }

    if (!ktpImageUrl) {
        console.log('[registerShop] Validation failed: no KTP image URL');
        return badRequest(res, 'Foto KTP wajib diupload untuk verifikasi');
    }

    console.log('[registerShop] Payload valid:', { userId, name, address, phoneNumber, nik, ktpImageUrl: ktpImageUrl ? 'present' : 'none' });

    try {
        const shop = await Shop.create({
            userId,
            name,
            description,
            address,
            phoneNumber,
            nik,
            ktpImageUrl,
            status: 'PENDING' // Default: Menunggu verifikasi admin
        });

        console.log('[registerShop] Success:', shop.id);
        return created(res, shop.toJSON(), 'Pendaftaran toko berhasil. Menunggu verifikasi admin.');
    } catch (err) {
        console.error('[registerShop] Error creating shop:', err.message);
        console.error('[registerShop] Error stack:', err.stack);

        if (err.message.includes('User sudah memiliki toko')) {
            return res.status(409).json({
                success: false,
                message: 'User sudah memiliki toko. Tidak bisa mendaftar lagi.'
            });
        }

        // Return a more detailed error message for debugging
        return res.status(500).json({
            success: false,
            message: 'Gagal mendaftarkan toko',
            error: err.message
        });
    }
});

// Get Toko Saya
const getMyShop = asyncHandler(async (req, res) => {
    const shop = await Shop.getByUserId(req.user.id);
    if (!shop) {
        // Return null data instead of 404 so frontend can decide to show register form
        return success(res, null, 'User belum memiliki toko');
    }
    return success(res, shop.toJSON(), 'Data toko berhasil diambil');
});

// Admin: Get Shops by Status (or all)
const getPendingShops = asyncHandler(async (req, res) => {
    const { status } = req.query; // Can be 'PENDING', 'VERIFIED', 'REJECTED', or undefined for all
    const shops = await Shop.getAllByStatus(status || 'PENDING');
    return success(res, shops.map(s => s.toJSON()), 'Daftar toko berhasil diambil');
});

// Admin: Approve/Reject Shop
const verifyShop = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'VERIFIED' or 'REJECTED'

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
        return badRequest(res, 'Status harus VERIFIED atau REJECTED');
    }

    const shop = await Shop.updateStatus(id, status);
    if (!shop) return notFound(res, 'Toko tidak ditemukan');

    // Jika verified, update role user jadi SELLER
    // Note: Pastikan model User dan User.update tersedia/valid
    if (status === 'VERIFIED') {
        const { db } = require('../config/firebase');
        await db.collection('users').doc(shop.userId).update({ role: 'seller' });
    }

    return success(res, shop.toJSON(), `Status toko berhasil diubah menjadi ${status}`);
});

// Get Shop by ID (Public)
const getShopById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const shop = await Shop.getById(id);

    if (!shop) {
        return notFound(res, 'Toko tidak ditemukan');
    }

    return success(res, shop.toJSON(), 'Data toko berhasil diambil');
});

// Get Shop Reviews (Public)
const getShopReviews = asyncHandler(async (req, res) => {
    const { id } = req.params; // Shop ID

    const shop = await Shop.getById(id);
    if (!shop) {
        return notFound(res, 'Toko tidak ditemukan');
    }

    const reviews = await Shop.getReviews(shop.userId);
    return success(res, reviews, 'Ulasan berhasil diambil');
});

// Get Shop by User ID (Public)
const getShopByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const shop = await Shop.getByUserId(userId);

    if (!shop) {
        return notFound(res, 'Toko tidak ditemukan');
    }

    return success(res, shop.toJSON(), 'Data toko berhasil diambil');
});

module.exports = {
    registerShop,
    getMyShop,
    getPendingShops,
    verifyShop,
    getShopById,
    getShopReviews,
    getShopByUserId
};
