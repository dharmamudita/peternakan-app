/**
 * Seller Statistics Controller
 * Endpoint untuk statistik dashboard penjual
 */

const { asyncHandler } = require('../middlewares');
const { success } = require('../utils/responseHelper');
const { db } = require('../config/firebase');
const Product = require('../models/Product');
const Shop = require('../models/Shop');

/**
 * Get seller dashboard statistics
 * GET /api/seller/stats
 */
const getSellerStats = asyncHandler(async (req, res) => {
    const sellerId = req.user.id;

    try {
        // 1. Get active products count
        const productsSnapshot = await db.collection('products')
            .where('sellerId', '==', sellerId)
            .where('status', '==', 'active')
            .get();
        const activeProducts = productsSnapshot.size;

        // 2. Get orders stats (placeholder - will be synced with payment gateway later)
        const ordersSnapshot = await db.collection('orders')
            .where('sellerId', '==', sellerId)
            .get();

        let newOrders = 0;
        let pendingShipment = 0;
        let completed = 0;
        let totalRevenue = 0;
        let monthlyRevenue = 0;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        ordersSnapshot.docs.forEach(doc => {
            const order = doc.data();
            const orderStatus = order.status?.toLowerCase();

            if (orderStatus === 'pending' || orderStatus === 'new') {
                newOrders++;
            } else if (orderStatus === 'processing' || orderStatus === 'paid') {
                pendingShipment++;
            } else if (orderStatus === 'completed' || orderStatus === 'delivered') {
                completed++;
                totalRevenue += order.totalAmount || 0;

                // Check if order is this month
                const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
                if (orderDate >= startOfMonth) {
                    monthlyRevenue += order.totalAmount || 0;
                }
            }
        });

        // 3. Get reviews count
        const reviewsSnapshot = await db.collection('reviews')
            .where('sellerId', '==', sellerId)
            .get();
        const totalReviews = reviewsSnapshot.size;

        // 4. Get shop data
        const shop = await Shop.getByUserId(sellerId);

        return success(res, {
            activeProducts,
            newOrders,
            pendingShipment,
            completed,
            totalRevenue,
            monthlyRevenue,
            totalReviews,
            shop: shop ? shop.toJSON() : null,
            // Placeholder for future payment gateway sync
            revenueGrowth: 0, // Will calculate from previous month
        }, 'Statistik berhasil diambil');

    } catch (error) {
        console.error('Error getting seller stats:', error);
        return success(res, {
            activeProducts: 0,
            newOrders: 0,
            pendingShipment: 0,
            completed: 0,
            totalRevenue: 0,
            monthlyRevenue: 0,
            totalReviews: 0,
            shop: null,
            revenueGrowth: 0,
        }, 'Statistik berhasil diambil');
    }
});

/**
 * Get recent orders for seller
 * GET /api/seller/orders/recent
 */
const getRecentOrders = asyncHandler(async (req, res) => {
    const sellerId = req.user.id;
    const limit = parseInt(req.query.limit) || 5;

    try {
        const snapshot = await db.collection('orders')
            .where('sellerId', '==', sellerId)
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();

        const orders = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                buyerName: data.buyerName || data.shippingAddress?.name || 'Pembeli',
                productName: data.items?.[0]?.name || 'Produk',
                totalAmount: data.totalAmount || 0,
                status: data.status || 'pending',
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
            };
        });

        return success(res, orders, 'Pesanan terbaru berhasil diambil');
    } catch (error) {
        console.error('Error getting recent orders:', error);
        return success(res, [], 'Tidak ada pesanan');
    }
});

/**
 * Get seller orders by status
 * GET /api/seller/orders?status=pending
 */
const getSellerOrders = asyncHandler(async (req, res) => {
    const sellerId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    try {
        let query = db.collection('orders').where('sellerId', '==', sellerId);

        if (status && status !== 'all') {
            query = query.where('status', '==', status);
        }

        const snapshot = await query.orderBy('createdAt', 'desc').get();

        const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt,
        }));

        return success(res, orders, 'Daftar pesanan berhasil diambil');
    } catch (error) {
        console.error('Error getting seller orders:', error);
        return success(res, [], 'Gagal mengambil pesanan');
    }
});

/**
 * Get seller revenue summary
 * GET /api/seller/revenue
 */
const getRevenueSummary = asyncHandler(async (req, res) => {
    const sellerId = req.user.id;

    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const snapshot = await db.collection('orders')
            .where('sellerId', '==', sellerId)
            .where('status', 'in', ['completed', 'delivered'])
            .get();

        let thisMonthRevenue = 0;
        let lastMonthRevenue = 0;
        let totalRevenue = 0;

        snapshot.docs.forEach(doc => {
            const order = doc.data();
            const amount = order.totalAmount || 0;
            const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);

            totalRevenue += amount;

            if (orderDate >= startOfMonth) {
                thisMonthRevenue += amount;
            } else if (orderDate >= startOfLastMonth && orderDate <= endOfLastMonth) {
                lastMonthRevenue += amount;
            }
        });

        const growth = lastMonthRevenue > 0
            ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
            : 0;

        return success(res, {
            thisMonth: thisMonthRevenue,
            lastMonth: lastMonthRevenue,
            total: totalRevenue,
            growth: growth,
        }, 'Ringkasan pendapatan berhasil diambil');
    } catch (error) {
        console.error('Error getting revenue:', error);
        return success(res, {
            thisMonth: 0,
            lastMonth: 0,
            total: 0,
            growth: 0,
        }, 'Ringkasan pendapatan berhasil diambil');
    }
});

/**
 * Get seller reviews
 * GET /api/seller/reviews
 */
const getSellerReviews = asyncHandler(async (req, res) => {
    const sellerId = req.user.id;

    try {
        const snapshot = await db.collection('reviews')
            .where('sellerId', '==', sellerId)
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        const reviews = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt,
        }));

        return success(res, reviews, 'Ulasan berhasil diambil');
    } catch (error) {
        console.error('Error getting reviews:', error);
        return success(res, [], 'Tidak ada ulasan');
    }
});

module.exports = {
    getSellerStats,
    getRecentOrders,
    getSellerOrders,
    getRevenueSummary,
    getSellerReviews,
};
