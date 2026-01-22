/**
 * Shop Controller
 */
const Shop = require('../models/Shop');
const { User } = require('../models'); // Assuming User model exists
const { asyncHandler } = require('../middlewares');
const { success, created, badRequest, notFound } = require('../utils/responseHelper');

// Daftarkan Toko Baru
const registerShop = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { name, description, address, phoneNumber, nik } = req.body;

    if (!name || !address || !phoneNumber) {
        return badRequest(res, 'Nama toko, alamat, dan nomor HP wajib diisi');
    }

    const shop = await Shop.create({
        userId,
        name,
        description,
        address,
        phoneNumber,
        nik
    });

    return created(res, shop.toJSON(), 'Pendaftaran toko berhasil. Menunggu verifikasi admin.');
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

module.exports = {
    registerShop,
    getMyShop,
    getPendingShops,
    verifyShop,
    getShopById
};
