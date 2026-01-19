/**
 * Marketplace Controller
 * Controller untuk marketplace (produk, keranjang, pesanan)
 */

const { MarketplaceService } = require('../services');
const { asyncHandler } = require('../middlewares');
const { success, created, badRequest, notFound } = require('../utils/responseHelper');
const { parsePagination, parseFilters } = require('../utils/helpers');

// ==================== PRODUCTS ====================

/**
 * Create product
 * POST /api/products
 */
const createProduct = asyncHandler(async (req, res) => {
    const product = await MarketplaceService.createProduct(req.user.id, req.body);
    return created(res, product.toJSON(), 'Produk berhasil dibuat');
});

/**
 * Get all products
 * GET /api/products
 */
const getAllProducts = asyncHandler(async (req, res) => {
    const { page, limit } = parsePagination(req.query);
    const filters = parseFilters(req.query, [
        'categoryId', 'sellerId', 'status', 'isFeatured',
        'minPrice', 'maxPrice', 'sortBy', 'sortOrder'
    ]);

    const result = await MarketplaceService.getAllProducts(page, limit, filters);

    return res.status(200).json({
        success: true,
        message: 'Produk berhasil diambil',
        data: result.data.map(p => p.toJSON()),
        pagination: result.pagination,
    });
});

/**
 * Get product by ID
 * GET /api/products/:id
 */
const getProductById = asyncHandler(async (req, res) => {
    const product = await MarketplaceService.getProductById(req.params.id, true);
    return success(res, product.toJSON(), 'Produk berhasil diambil');
});

/**
 * Get product by slug
 * GET /api/products/slug/:slug
 */
const getProductBySlug = asyncHandler(async (req, res) => {
    const product = await MarketplaceService.getProductBySlug(req.params.slug);
    return success(res, product.toJSON(), 'Produk berhasil diambil');
});

/**
 * Search products
 * GET /api/products/search
 */
const searchProducts = asyncHandler(async (req, res) => {
    const { q, page, limit } = req.query;

    if (!q) {
        return badRequest(res, 'Parameter pencarian (q) wajib diisi');
    }

    const { page: p, limit: l } = parsePagination({ page, limit });
    const products = await MarketplaceService.searchProducts(q, p, l);

    return success(res, products.map(p => p.toJSON()), 'Hasil pencarian');
});

/**
 * Get featured products
 * GET /api/products/featured
 */
const getFeaturedProducts = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 8;
    const products = await MarketplaceService.getFeaturedProducts(limit);
    return success(res, products.map(p => p.toJSON()), 'Produk featured berhasil diambil');
});

/**
 * Get best sellers
 * GET /api/products/best-sellers
 */
const getBestSellers = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 8;
    const products = await MarketplaceService.getBestSellers(limit);
    return success(res, products.map(p => p.toJSON()), 'Best sellers berhasil diambil');
});

/**
 * Get my products (seller)
 * GET /api/products/my
 */
const getMyProducts = asyncHandler(async (req, res) => {
    const { page, limit } = parsePagination(req.query);
    const filters = { ...parseFilters(req.query, ['status']), sellerId: req.user.id };

    const result = await MarketplaceService.getAllProducts(page, limit, filters);

    return res.status(200).json({
        success: true,
        message: 'Produk berhasil diambil',
        data: result.data.map(p => p.toJSON()),
        pagination: result.pagination,
    });
});

/**
 * Update product
 * PUT /api/products/:id
 */
const updateProduct = asyncHandler(async (req, res) => {
    const product = await MarketplaceService.updateProduct(req.params.id, req.user.id, req.body);
    return success(res, product.toJSON(), 'Produk berhasil diperbarui');
});

/**
 * Publish product
 * PUT /api/products/:id/publish
 */
const publishProduct = asyncHandler(async (req, res) => {
    const product = await MarketplaceService.publishProduct(req.params.id, req.user.id);
    return success(res, product.toJSON(), 'Produk berhasil dipublish');
});

/**
 * Delete product
 * DELETE /api/products/:id
 */
const deleteProduct = asyncHandler(async (req, res) => {
    await MarketplaceService.deleteProduct(req.params.id, req.user.id);
    return success(res, null, 'Produk berhasil dihapus');
});

/**
 * Update stock
 * PUT /api/products/:id/stock
 */
const updateStock = asyncHandler(async (req, res) => {
    const { quantity } = req.body;

    if (quantity === undefined) {
        return badRequest(res, 'Quantity wajib diisi');
    }

    const product = await MarketplaceService.updateStock(req.params.id, req.user.id, quantity);
    return success(res, product.toJSON(), 'Stok berhasil diperbarui');
});

// ==================== CART ====================

/**
 * Get cart
 * GET /api/cart
 */
const getCart = asyncHandler(async (req, res) => {
    const cart = await MarketplaceService.getCart(req.user.id);
    return success(res, cart, 'Keranjang berhasil diambil');
});

/**
 * Add to cart
 * POST /api/cart/items
 */
const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId) {
        return badRequest(res, 'Product ID wajib diisi');
    }

    const cart = await MarketplaceService.addToCart(req.user.id, productId, quantity || 1);
    return success(res, cart.toJSON(), 'Produk ditambahkan ke keranjang');
});

/**
 * Update cart item
 * PUT /api/cart/items/:productId
 */
const updateCartItem = asyncHandler(async (req, res) => {
    const { quantity } = req.body;

    if (quantity === undefined) {
        return badRequest(res, 'Quantity wajib diisi');
    }

    const cart = await MarketplaceService.updateCartItem(req.user.id, req.params.productId, quantity);
    return success(res, cart.toJSON(), 'Keranjang berhasil diperbarui');
});

/**
 * Remove from cart
 * DELETE /api/cart/items/:productId
 */
const removeFromCart = asyncHandler(async (req, res) => {
    const cart = await MarketplaceService.removeFromCart(req.user.id, req.params.productId);
    return success(res, cart.toJSON(), 'Produk dihapus dari keranjang');
});

/**
 * Clear cart
 * DELETE /api/cart
 */
const clearCart = asyncHandler(async (req, res) => {
    const cart = await MarketplaceService.clearCart(req.user.id);
    return success(res, cart.toJSON(), 'Keranjang dikosongkan');
});

// ==================== ORDERS ====================

/**
 * Create order
 * POST /api/orders
 */
const createOrder = asyncHandler(async (req, res) => {
    const order = await MarketplaceService.createOrder(req.user.id, req.body);
    return created(res, order.toJSON(), 'Pesanan berhasil dibuat');
});

/**
 * Get my orders (buyer)
 * GET /api/orders/my
 */
const getMyOrders = asyncHandler(async (req, res) => {
    const { page, limit } = parsePagination(req.query);
    const filters = parseFilters(req.query, ['status']);

    const result = await MarketplaceService.getOrdersByBuyer(req.user.id, page, limit, filters);

    return res.status(200).json({
        success: true,
        message: 'Pesanan berhasil diambil',
        data: result.data.map(o => o.toJSON()),
        pagination: result.pagination,
    });
});

/**
 * Get seller orders
 * GET /api/orders/seller
 */
const getSellerOrders = asyncHandler(async (req, res) => {
    const { page, limit } = parsePagination(req.query);
    const filters = parseFilters(req.query, ['status']);

    const result = await MarketplaceService.getOrdersBySeller(req.user.id, page, limit, filters);

    return res.status(200).json({
        success: true,
        message: 'Pesanan berhasil diambil',
        data: result.data.map(o => o.toJSON()),
        pagination: result.pagination,
    });
});

/**
 * Get order by ID
 * GET /api/orders/:id
 */
const getOrderById = asyncHandler(async (req, res) => {
    const order = await MarketplaceService.getOrderById(req.params.id);

    // Validate access
    if (order.buyerId !== req.user.id && order.sellerId !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: 'Anda tidak memiliki akses ke pesanan ini',
        });
    }

    return success(res, order.toJSON(), 'Pesanan berhasil diambil');
});

/**
 * Get order by order number
 * GET /api/orders/number/:orderNumber
 */
const getOrderByNumber = asyncHandler(async (req, res) => {
    const order = await MarketplaceService.getOrderByNumber(req.params.orderNumber);

    // Validate access
    if (order.buyerId !== req.user.id && order.sellerId !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: 'Anda tidak memiliki akses ke pesanan ini',
        });
    }

    return success(res, order.toJSON(), 'Pesanan berhasil diambil');
});

/**
 * Update order status (seller)
 * PUT /api/orders/:id/status
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, note } = req.body;

    if (!status) {
        return badRequest(res, 'Status wajib diisi');
    }

    const order = await MarketplaceService.updateOrderStatus(req.params.id, req.user.id, status, note);
    return success(res, order.toJSON(), 'Status pesanan berhasil diperbarui');
});

/**
 * Cancel order
 * PUT /api/orders/:id/cancel
 */
const cancelOrder = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const order = await MarketplaceService.cancelOrder(req.params.id, req.user.id, reason);
    return success(res, order.toJSON(), 'Pesanan berhasil dibatalkan');
});

/**
 * Confirm payment
 * PUT /api/orders/:id/confirm-payment
 */
const confirmPayment = asyncHandler(async (req, res) => {
    const order = await MarketplaceService.confirmPayment(req.params.id, req.body);
    return success(res, order.toJSON(), 'Pembayaran berhasil dikonfirmasi');
});

/**
 * Get order statistics (seller)
 * GET /api/orders/stats
 */
const getOrderStats = asyncHandler(async (req, res) => {
    const stats = await MarketplaceService.getOrderStats(req.user.id);
    return success(res, stats, 'Statistik pesanan berhasil diambil');
});

module.exports = {
    // Products
    createProduct,
    getAllProducts,
    getProductById,
    getProductBySlug,
    searchProducts,
    getFeaturedProducts,
    getBestSellers,
    getMyProducts,
    updateProduct,
    publishProduct,
    deleteProduct,
    updateStock,
    // Cart
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    // Orders
    createOrder,
    getMyOrders,
    getSellerOrders,
    getOrderById,
    getOrderByNumber,
    updateOrderStatus,
    cancelOrder,
    confirmPayment,
    getOrderStats,
};
