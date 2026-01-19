/**
 * Order Model
 * Model untuk pesanan di marketplace
 */

const { db } = require('../config/firebase');
const { COLLECTIONS, ORDER_STATUS } = require('../config/constants');

class Order {
    constructor(data) {
        this.id = data.id || null;
        this.orderNumber = data.orderNumber || '';
        this.buyerId = data.buyerId || '';
        this.sellerId = data.sellerId || '';
        this.items = data.items || []; // Array of { productId, name, price, quantity, subtotal, image }
        this.subtotal = data.subtotal || 0;
        this.shippingCost = data.shippingCost || 0;
        this.tax = data.tax || 0;
        this.discount = data.discount || 0;
        this.total = data.total || 0;
        this.status = data.status || ORDER_STATUS.PENDING;
        this.paymentMethod = data.paymentMethod || '';
        this.paymentStatus = data.paymentStatus || 'unpaid'; // unpaid, paid, refunded
        this.paymentDetails = data.paymentDetails || {};
        this.shippingAddress = data.shippingAddress || {
            recipientName: '',
            phone: '',
            street: '',
            city: '',
            province: '',
            postalCode: '',
            notes: '',
        };
        this.shippingMethod = data.shippingMethod || '';
        this.trackingNumber = data.trackingNumber || '';
        this.notes = data.notes || '';
        this.timeline = data.timeline || []; // Array of { status, timestamp, note }
        this.estimatedDelivery = data.estimatedDelivery || null;
        this.deliveredAt = data.deliveredAt || null;
        this.cancelledAt = data.cancelledAt || null;
        this.cancelReason = data.cancelReason || '';
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    toJSON() {
        return {
            id: this.id,
            orderNumber: this.orderNumber,
            buyerId: this.buyerId,
            sellerId: this.sellerId,
            items: this.items,
            subtotal: this.subtotal,
            shippingCost: this.shippingCost,
            tax: this.tax,
            discount: this.discount,
            total: this.total,
            status: this.status,
            paymentMethod: this.paymentMethod,
            paymentStatus: this.paymentStatus,
            paymentDetails: this.paymentDetails,
            shippingAddress: this.shippingAddress,
            shippingMethod: this.shippingMethod,
            trackingNumber: this.trackingNumber,
            notes: this.notes,
            timeline: this.timeline,
            estimatedDelivery: this.estimatedDelivery,
            deliveredAt: this.deliveredAt,
            cancelledAt: this.cancelledAt,
            cancelReason: this.cancelReason,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    toFirestore() {
        const data = this.toJSON();
        delete data.id;
        return data;
    }

    static generateOrderNumber() {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `ORD${year}${month}${day}${random}`;
    }

    static async create(orderData) {
        const order = new Order(orderData);
        order.orderNumber = Order.generateOrderNumber();
        order.timeline = [{
            status: ORDER_STATUS.PENDING,
            timestamp: new Date(),
            note: 'Pesanan dibuat',
        }];

        const docRef = await db.collection(COLLECTIONS.ORDERS).add(order.toFirestore());
        order.id = docRef.id;
        return order;
    }

    static async getById(id) {
        const doc = await db.collection(COLLECTIONS.ORDERS).doc(id).get();
        if (!doc.exists) return null;
        return new Order({ id: doc.id, ...doc.data() });
    }

    static async getByOrderNumber(orderNumber) {
        const snapshot = await db.collection(COLLECTIONS.ORDERS)
            .where('orderNumber', '==', orderNumber)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return new Order({ id: doc.id, ...doc.data() });
    }

    static async getByBuyerId(buyerId, page = 1, limit = 10, filters = {}) {
        let query = db.collection(COLLECTIONS.ORDERS)
            .where('buyerId', '==', buyerId);

        if (filters.status) {
            query = query.where('status', '==', filters.status);
        }

        const countSnapshot = await query.get();
        const total = countSnapshot.size;

        query = query.orderBy('createdAt', 'desc')
            .offset((page - 1) * limit)
            .limit(limit);

        const snapshot = await query.get();
        const orders = snapshot.docs.map(doc => new Order({ id: doc.id, ...doc.data() }));

        return {
            data: orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    static async getBySellerId(sellerId, page = 1, limit = 10, filters = {}) {
        let query = db.collection(COLLECTIONS.ORDERS)
            .where('sellerId', '==', sellerId);

        if (filters.status) {
            query = query.where('status', '==', filters.status);
        }

        const countSnapshot = await query.get();
        const total = countSnapshot.size;

        query = query.orderBy('createdAt', 'desc')
            .offset((page - 1) * limit)
            .limit(limit);

        const snapshot = await query.get();
        const orders = snapshot.docs.map(doc => new Order({ id: doc.id, ...doc.data() }));

        return {
            data: orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    static async updateStatus(id, status, note = '') {
        const order = await Order.getById(id);
        if (!order) return null;

        const timeline = order.timeline || [];
        timeline.push({
            status,
            timestamp: new Date(),
            note,
        });

        const updateData = {
            status,
            timeline,
            updatedAt: new Date(),
        };

        if (status === ORDER_STATUS.DELIVERED) {
            updateData.deliveredAt = new Date();
        }
        if (status === ORDER_STATUS.CANCELLED) {
            updateData.cancelledAt = new Date();
            updateData.cancelReason = note;
        }

        await db.collection(COLLECTIONS.ORDERS).doc(id).update(updateData);
        return await Order.getById(id);
    }

    static async update(id, updateData) {
        updateData.updatedAt = new Date();
        await db.collection(COLLECTIONS.ORDERS).doc(id).update(updateData);
        return await Order.getById(id);
    }

    static async getOrderStats(sellerId) {
        const snapshot = await db.collection(COLLECTIONS.ORDERS)
            .where('sellerId', '==', sellerId)
            .get();

        const stats = {
            total: snapshot.size,
            byStatus: {},
            totalRevenue: 0,
            totalPaid: 0,
        };

        snapshot.docs.forEach(doc => {
            const order = doc.data();
            stats.byStatus[order.status] = (stats.byStatus[order.status] || 0) + 1;
            stats.totalRevenue += order.total;
            if (order.paymentStatus === 'paid') {
                stats.totalPaid += order.total;
            }
        });

        return stats;
    }
}

module.exports = Order;
