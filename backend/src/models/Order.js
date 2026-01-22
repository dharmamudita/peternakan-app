/**
 * Order Model
 * Model untuk pesanan
 */

const { db } = require('../config/firebase');

const ORDER_STATUS = {
    PENDING: 'pending',       // Menunggu pembayaran
    PAID: 'paid',             // Sudah bayar, menunggu konfirmasi seller
    PROCESSING: 'processing', // Seller konfirmasi, sedang dikemas
    SHIPPED: 'shipped',       // Sudah dikirim
    DELIVERED: 'delivered',   // Sampai, menunggu konfirmasi pembeli
    COMPLETED: 'completed',   // Selesai + sudah dikonfirmasi pembeli
    CANCELLED: 'cancelled',   // Dibatalkan
};

class Order {
    constructor(data) {
        this.id = data.id || null;
        this.buyerId = data.buyerId || '';
        this.sellerId = data.sellerId || '';
        this.shopId = data.shopId || '';
        this.items = data.items || []; // [{productId, name, price, quantity, image}]
        this.totalAmount = data.totalAmount || 0;
        this.shippingAddress = data.shippingAddress || {};
        this.shippingMethod = data.shippingMethod || '';
        this.shippingCost = data.shippingCost || 0;
        this.trackingNumber = data.trackingNumber || '';
        this.status = data.status || ORDER_STATUS.PENDING;
        this.buyerName = data.buyerName || '';
        this.buyerPhone = data.buyerPhone || '';
        this.notes = data.notes || '';
        this.review = data.review || null; // {rating, comment, createdAt}
        this.statusHistory = data.statusHistory || [];
        this.createdAt = this.parseDate(data.createdAt) || new Date();
        this.updatedAt = this.parseDate(data.updatedAt) || new Date();
        this.paidAt = this.parseDate(data.paidAt) || null;
        this.shippedAt = this.parseDate(data.shippedAt) || null;
        this.completedAt = this.parseDate(data.completedAt) || null;
    }

    parseDate(dateVal) {
        if (!dateVal) return null;
        if (dateVal instanceof Date) return dateVal;
        if (dateVal.toDate && typeof dateVal.toDate === 'function') return dateVal.toDate();
        if (typeof dateVal === 'string' || typeof dateVal === 'number') return new Date(dateVal);
        if (dateVal._seconds) return new Date(dateVal._seconds * 1000);
        return null;
    }

    toJSON() {
        return {
            id: this.id,
            buyerId: this.buyerId,
            sellerId: this.sellerId,
            shopId: this.shopId,
            items: this.items,
            totalAmount: this.totalAmount,
            shippingAddress: this.shippingAddress,
            shippingMethod: this.shippingMethod,
            shippingCost: this.shippingCost,
            trackingNumber: this.trackingNumber,
            status: this.status,
            buyerName: this.buyerName,
            buyerPhone: this.buyerPhone,
            notes: this.notes,
            review: this.review,
            statusHistory: this.statusHistory,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            paidAt: this.paidAt,
            shippedAt: this.shippedAt,
            completedAt: this.completedAt,
        };
    }

    // Create new order
    static async create(orderData) {
        const order = new Order({
            ...orderData,
            statusHistory: [{
                status: orderData.status || ORDER_STATUS.PAID,
                timestamp: new Date(),
                note: 'Pesanan dibuat'
            }],
            createdAt: new Date(),
            updatedAt: new Date(),
            paidAt: orderData.status === ORDER_STATUS.PAID ? new Date() : null,
        });

        const data = order.toJSON();
        delete data.id;

        const docRef = await db.collection('orders').add(data);
        order.id = docRef.id;
        return order;
    }

    // Get order by ID
    static async getById(id) {
        const doc = await db.collection('orders').doc(id).get();
        if (!doc.exists) return null;
        return new Order({ id: doc.id, ...doc.data() });
    }

    // Get orders by buyer
    static async getByBuyerId(buyerId, status = null) {
        let query = db.collection('orders').where('buyerId', '==', buyerId);
        if (status && status !== 'all') {
            query = query.where('status', '==', status);
        }
        const snapshot = await query.orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => new Order({ id: doc.id, ...doc.data() }));
    }

    // Get orders by seller
    static async getBySellerId(sellerId, status = null) {
        let query = db.collection('orders').where('sellerId', '==', sellerId);
        if (status && status !== 'all') {
            query = query.where('status', '==', status);
        }
        const snapshot = await query.orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => new Order({ id: doc.id, ...doc.data() }));
    }

    // Update order status
    static async updateStatus(orderId, newStatus, note = '') {
        const order = await this.getById(orderId);
        if (!order) return null;

        const updateData = {
            status: newStatus,
            updatedAt: new Date(),
            statusHistory: [...order.statusHistory, {
                status: newStatus,
                timestamp: new Date(),
                note: note || `Status diubah ke ${newStatus}`
            }]
        };

        // Add specific timestamps
        if (newStatus === ORDER_STATUS.PAID) updateData.paidAt = new Date();
        if (newStatus === ORDER_STATUS.SHIPPED) updateData.shippedAt = new Date();
        if (newStatus === ORDER_STATUS.COMPLETED) updateData.completedAt = new Date();

        await db.collection('orders').doc(orderId).update(updateData);
        return await this.getById(orderId);
    }

    // Add tracking number
    static async addTrackingNumber(orderId, trackingNumber) {
        await db.collection('orders').doc(orderId).update({
            trackingNumber,
            updatedAt: new Date()
        });
        return await this.getById(orderId);
    }

    // Add review
    static async addReview(orderId, rating, comment) {
        const review = {
            rating,
            comment,
            createdAt: new Date()
        };

        await db.collection('orders').doc(orderId).update({
            review,
            updatedAt: new Date()
        });

        // Also add to reviews collection for product/seller
        const order = await this.getById(orderId);
        if (order) {
            await db.collection('reviews').add({
                orderId,
                productId: order.items[0]?.productId,
                sellerId: order.sellerId,
                buyerId: order.buyerId,
                buyerName: order.buyerName,
                rating,
                comment,
                createdAt: new Date()
            });
        }

        return order;
    }
}

module.exports = { Order, ORDER_STATUS };
