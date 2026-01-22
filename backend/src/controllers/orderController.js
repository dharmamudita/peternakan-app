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

// Create order (Buy now - langsung PAID untuk testing tanpa payment gateway)
const createOrder = asyncHandler(async (req, res) => {
    const buyerId = req.user.id;
    const { productId, quantity = 1, shippingAddress, shippingMethod, notes } = req.body;

    if (!productId) {
        return badRequest(res, 'Product ID wajib diisi');
    }

    // Get product details
    const product = await Product.getById(productId);
    if (!product) {
        return notFound(res, 'Produk tidak ditemukan');
    }

    console.log('Creating order for product:', productId);
    console.log('Product sellerId:', product.sellerId);

    // Ensure sellerId exists
    if (!product.sellerId) {
        return badRequest(res, 'Produk tidak memiliki penjual yang valid');
    }

    // Check stock
    if (product.stock < quantity) {
        return badRequest(res, 'Stok tidak mencukupi');
    }

    // Calculate total
    const itemTotal = product.price * quantity;
    const shippingCost = 0; // Free shipping for now
    const totalAmount = itemTotal + shippingCost;

    // Create order with PAID status (skip payment gateway for testing)
    const order = await Order.create({
        buyerId,
        sellerId: product.sellerId, // Ensure this is set correctly
        shopId: product.shopId || '',
        items: [{
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity,
            image: product.images?.[0] || ''
        }],
        totalAmount,
        shippingAddress: shippingAddress || {
            name: req.user.displayName,
            phone: req.user.phoneNumber || '',
            address: req.user.address || 'Alamat belum diisi'
        },
        shippingMethod: shippingMethod || 'Reguler',
        shippingCost,
        status: ORDER_STATUS.PAID, // Langsung PAID untuk testing
        buyerName: req.user.displayName || 'Pembeli',
        buyerPhone: req.user.phoneNumber || '',
        notes: notes || '',
    });

    console.log('Order created with sellerId:', order.sellerId);

    // Update product stock
    await Product.update(productId, {
        stock: product.stock - quantity
    });

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
