const Address = require('../models/Address');
const { asyncHandler } = require('../middlewares');
const { success, created, badRequest, notFound, forbidden } = require('../utils/responseHelper');

/**
 * Get All My Addresses
 * GET /api/addresses
 */
const getAddresses = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const addresses = await Address.getByUserId(userId);

    return success(res, addresses.map(a => a.toJSON()), 'Daftar alamat berhasil diambil');
});

/**
 * Add New Address
 * POST /api/addresses
 */
const addAddress = async (req, res) => {
    try {
        console.log('[Address] Add Address Request START');

        if (!req.user) {
            throw new Error('Req.user is missing! Middleware Failed?');
        }

        console.log('[Address] User Data:', req.user);

        // Fallback ID extraction
        const userId = req.user.uid || req.user.id || req.user.user_id;

        if (!userId) {
            throw new Error('User ID missing from req.user object');
        }

        const {
            label, recipientName, phoneNumber, fullAddress,
            city, province, postalCode, note, latitude, longitude, isDefault
        } = req.body;

        // Validation
        if (!recipientName || !phoneNumber || !fullAddress || !city) {
            return badRequest(res, 'Nama penerima, No HP, Alamat, dan Kota wajib diisi');
        }

        // Jika ini alamat pertama, otomatis set default
        const existing = await Address.getByUserId(userId);
        const shouldBeDefault = isDefault || existing.length === 0;

        const newAddress = await Address.create({
            userId,
            label,
            recipientName,
            phoneNumber,
            fullAddress,
            city,
            province,
            postalCode,
            note,
            latitude: latitude || null,
            longitude: longitude || null,
            isDefault: shouldBeDefault
        });

        if (shouldBeDefault && existing.length > 0) {
            await Address.setDefault(userId, newAddress.id);
        }

        return created(res, newAddress.toJSON(), 'Alamat berhasil ditambahkan');
    } catch (err) {
        console.error('[Address] CRASH:', err);
        return res.status(500).json({
            success: false,
            message: 'CRITICAL ADD ADDRESS ERROR',
            error: err.toString(),
            stack: err.stack
        });
    }
};

/**
 * Update Address
 * PUT /api/addresses/:id
 */
const updateAddress = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.uid;
    const updateData = req.body;

    // Check Ownership
    const addr = await Address.getById(id);
    if (!addr) return notFound(res, 'Alamat tidak ditemukan');
    if (addr.userId !== userId) return forbidden(res, 'Akses ditolak');

    // Remove immutable fields
    delete updateData.id;
    delete updateData.userId;
    delete updateData.createdAt;

    const updated = await Address.update(id, updateData);

    // If setting as default
    if (updateData.isDefault) {
        await Address.setDefault(userId, id);
        // Re-fetch to get correct status (implied true)
        updated.isDefault = true;
    }

    return success(res, updated.toJSON(), 'Alamat berhasil diperbarui');
});

/**
 * Delete Address
 * DELETE /api/addresses/:id
 */
const deleteAddress = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.uid;

    const addr = await Address.getById(id);
    if (!addr) return notFound(res, 'Alamat tidak ditemukan');
    if (addr.userId !== userId) return forbidden(res, 'Akses ditolak');

    await Address.delete(id);

    return success(res, null, 'Alamat berhasil dihapus');
});

/**
 * Set Default Address
 * PUT /api/addresses/:id/default
 */
const setDefaultAddress = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.uid;

    const addr = await Address.getById(id);
    if (!addr) return notFound(res, 'Alamat tidak ditemukan');
    if (addr.userId !== userId) return forbidden(res, 'Akses ditolak');

    await Address.setDefault(userId, id);

    return success(res, { id, isDefault: true }, 'Alamat utama berhasil diubah');
});

module.exports = {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};
