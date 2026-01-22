const Notification = require('../models/Notification');
const { asyncHandler } = require('../middlewares');
const { success, created } = require('../utils/responseHelper');

/**
 * Send Broadcast (Admin Only)
 * POST /api/notifications/broadcast
 */
const sendBroadcast = asyncHandler(async (req, res) => {
    const { title, message } = req.body;
    console.log('[NotificationController] Sending broadcast:', { title, message });

    if (!title || !message) {
        throw new Error('Judul dan pesan wajib diisi');
    }

    const notification = await Notification.create({
        title,
        message,
        type: 'broadcast',
        senderId: req.user.id,
        senderName: req.user.displayName || 'Admin',
    });

    return created(res, notification, 'Broadcast berhasil dikirim');
});

/**
 * Get My Notifications
 * GET /api/notifications
 */
const getMyNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.getByUser(req.user.id);
    return success(res, notifications, 'Notifikasi berhasil diambil');
});

/**
 * Mark as Read
 * PUT /api/notifications/:id/read
 */
const markAsRead = asyncHandler(async (req, res) => {
    await Notification.markAsRead(req.params.id, req.user.id);
    return success(res, null, 'Notifikasi ditandai sudah dibaca');
});

module.exports = {
    sendBroadcast,
    getMyNotifications,
    markAsRead,
};
