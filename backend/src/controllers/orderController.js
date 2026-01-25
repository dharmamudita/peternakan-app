/**
 * Order Controller
 * Controller untuk pesanan (buyer dan seller)
 */

const { Order, ORDER_STATUS } = require('../models/Order');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const { asyncHandler } = require('../middlewares');
const { success, created, badRequest, notFound, forbidden } = require('../utils/responseHelper');

/**
 * BUYER ENDPOINTS
 */

// Create order (Multi-item support)
const createOrder = asyncHandler(async (req, res) => {
    const buyerId = req.user.id;
    const {
        items,
        shippingAddress,
        shippingCost,
        totalAmount,
        sellerId,
        shopId,
        notes
    } = req.body;

    if (!items || !items.length) {
        return badRequest(res, 'Daftar item pesanan wajib diisi');
    }

    if (!sellerId) {
        return badRequest(res, 'ID Penjual wajib diisi');
    }

    // Default shipping address fallback if not provided
    const finalShippingAddress = shippingAddress || {
        recipientName: req.user.displayName || 'Pembeli',
        phoneNumber: req.user.phoneNumber || '',
        fullAddress: req.user.address || 'Alamat tidak diisi',
        city: '',
        province: ''
    };

    // Create order
    const order = await Order.create({
        buyerId,
        sellerId,
        shopId: shopId || '',
        items: items.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image || ''
        })),
        totalAmount: totalAmount || items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0) + (shippingCost || 0),
        shippingAddress: finalShippingAddress,
        shippingMethod: req.body.shippingMethod || 'Reguler',
        shippingCost: shippingCost || 0,
        status: ORDER_STATUS.PAID,
        buyerName: req.user.displayName || 'Pembeli',
        buyerPhone: req.user.phoneNumber || '',
        notes: notes || '',
    });

    // Update product stock for each item (concurrently)
    try {
        await Promise.all(items.map(item =>
            Product.getById(item.productId).then(prod => {
                if (prod) return Product.update(item.productId, { stock: Math.max(0, prod.stock - item.quantity) });
            })
        ));
    } catch (err) {
        console.error('Error updating stock after order:', err);
    }

    return created(res, order.toJSON(), 'Pesanan berhasil dibuat');
});

// Get buyer's orders
const getMyOrders = asyncHandler(async (req, res) => {
    const buyerId = req.user.id;
    const { status } = req.query;

    const orders = await Order.getByBuyerId(buyerId, status);
    return success(res, orders.map(o => o.toJSON()), 'Daftar pesanan berhasil diambil');
});

// Get order detail
const getOrderDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const order = await Order.getById(id);

    if (!order) {
        return notFound(res, 'Pesanan tidak ditemukan');
    }

    // Check if user is buyer or seller
    if (order.buyerId !== req.user.id && order.sellerId !== req.user.id) {
        return forbidden(res, 'Anda tidak memiliki akses ke pesanan ini');
    }

    return success(res, order.toJSON(), 'Detail pesanan berhasil diambil');
});

// Confirm receipt (buyer confirms delivery)
const confirmReceipt = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const order = await Order.getById(id);

    if (!order) {
        return notFound(res, 'Pesanan tidak ditemukan');
    }

    if (order.buyerId !== req.user.id) {
        return forbidden(res, 'Anda tidak memiliki akses ke pesanan ini');
    }

    if (order.status !== ORDER_STATUS.SHIPPED && order.status !== ORDER_STATUS.DELIVERED) {
        return badRequest(res, 'Pesanan belum dikirim');
    }

    const updatedOrder = await Order.updateStatus(id, ORDER_STATUS.COMPLETED, 'Pesanan dikonfirmasi diterima oleh pembeli');

    // Update totalSold for each product
    if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
            await Product.incrementSold(item.productId, item.quantity);
        }
    }

    return success(res, updatedOrder.toJSON(), 'Pesanan berhasil dikonfirmasi');
});

// Add review
const addReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return badRequest(res, 'Rating harus antara 1-5');
    }

    const order = await Order.getById(id);

    if (!order) {
        return notFound(res, 'Pesanan tidak ditemukan');
    }

    if (order.buyerId !== req.user.id) {
        return forbidden(res, 'Anda tidak memiliki akses ke pesanan ini');
    }

    if (order.status !== ORDER_STATUS.COMPLETED) {
        return badRequest(res, 'Pesanan belum selesai');
    }

    if (order.review) {
        return badRequest(res, 'Anda sudah memberikan ulasan');
    }

    const updatedOrder = await Order.addReview(id, rating, comment || '');
    return success(res, updatedOrder.toJSON(), 'Ulasan berhasil ditambahkan');
});

/**
 * SELLER ENDPOINTS
 */

// Get seller's orders
const getSellerOrders = asyncHandler(async (req, res) => {
    const sellerId = req.user.id;
    const { status } = req.query;

    const orders = await Order.getBySellerId(sellerId, status);
    return success(res, orders.map(o => o.toJSON()), 'Daftar pesanan berhasil diambil');
});

// Confirm order (seller confirms and starts processing)
const confirmOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const order = await Order.getById(id);

    if (!order) {
        return notFound(res, 'Pesanan tidak ditemukan');
    }

    if (order.sellerId !== req.user.id) {
        return forbidden(res, 'Anda tidak memiliki akses ke pesanan ini');
    }

    if (order.status !== ORDER_STATUS.PAID) {
        return badRequest(res, 'Pesanan tidak dalam status menunggu konfirmasi');
    }

    const updatedOrder = await Order.updateStatus(id, ORDER_STATUS.PROCESSING, 'Pesanan dikonfirmasi oleh penjual');
    return success(res, updatedOrder.toJSON(), 'Pesanan berhasil dikonfirmasi');
});

// Ship order
const shipOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { trackingNumber } = req.body;

    const order = await Order.getById(id);

    if (!order) {
        return notFound(res, 'Pesanan tidak ditemukan');
    }

    if (order.sellerId !== req.user.id) {
        return forbidden(res, 'Anda tidak memiliki akses ke pesanan ini');
    }

    if (order.status !== ORDER_STATUS.PROCESSING) {
        return badRequest(res, 'Pesanan tidak dalam status dikemas');
    }

    // Add tracking number if provided
    if (trackingNumber) {
        await Order.addTrackingNumber(id, trackingNumber);
    }

    const updatedOrder = await Order.updateStatus(id, ORDER_STATUS.SHIPPED, 'Pesanan telah dikirim');
    return success(res, updatedOrder.toJSON(), 'Pesanan berhasil dikirim');
});

module.exports = {
    // Buyer
    createOrder,
    getMyOrders,
    getOrderDetail,
    confirmReceipt,
    addReview,
    // Seller
    getSellerOrders,
    confirmOrder,
    shipOrder,
};
