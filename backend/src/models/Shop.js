/**
 * Shop Model
 * Model untuk data toko/penjual
 */

const { db } = require('../config/firebase');
const { COLLECTIONS } = require('../config/constants');

class Shop {
    constructor(data) {
        this.id = data.id || null;
        this.userId = data.userId || ''; // ID pemilik akun
        this.name = data.name || '';
        this.description = data.description || '';
        this.address = data.address || '';
        this.phoneNumber = data.phoneNumber || '';
        this.nik = data.nik || ''; // Untuk verifikasi
        this.bankAccount = data.bankAccount || { bank: '', number: '', holder: '' };
        this.status = data.status || 'PENDING'; // PENDING, VERIFIED, REJECTED, SUSPENDED
        this.rating = data.rating || 0;
        this.totalExams = data.totalExams || 0; // if applicable

        // Handle dates robustly
        this.createdAt = this.parseDate(data.createdAt) || new Date();
        this.updatedAt = this.parseDate(data.updatedAt) || new Date();
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
            userId: this.userId,
            name: this.name,
            description: this.description,
            address: this.address,
            phoneNumber: this.phoneNumber,
            nik: this.nik,
            bankAccount: this.bankAccount,
            status: this.status,
            rating: this.rating,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    // Simpan ke Firestore
    static async create(shopData) {
        try {
            console.log('[Shop.create] Input data:', shopData);

            // Cek apakah user sudah punya toko
            const existing = await this.getByUserId(shopData.userId);
            if (existing) {
                throw new Error('User sudah memiliki toko');
            }

            const shop = new Shop(shopData);
            const data = shop.toJSON();
            delete data.id; // Biarkan Firestore generate ID

            console.log('[Shop.create] Saving to Firestore:', data);
            const docRef = await db.collection('shops').add(data);
            shop.id = docRef.id;
            console.log('[Shop.create] Success, ID:', shop.id);
            return shop;
        } catch (error) {
            console.error('[Shop.create] Error:', error.message);
            throw error;
        }
    }

    static async getByUserId(userId) {
        const snapshot = await db.collection('shops')
            .where('userId', '==', userId)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return new Shop({ id: doc.id, ...doc.data() });
    }

    static async getById(id) {
        const doc = await db.collection('shops').doc(id).get();
        if (!doc.exists) return null;
        return new Shop({ id: doc.id, ...doc.data() });
    }

    static async getAllPending() {
        const snapshot = await db.collection('shops')
            .where('status', '==', 'PENDING')
            .get();
        return snapshot.docs.map(doc => new Shop({ id: doc.id, ...doc.data() }));
    }

    static async getAllByStatus(status = null) {
        let query = db.collection('shops');

        if (status && status !== 'all') {
            query = query.where('status', '==', status);
        }

        const snapshot = await query.get();
        return snapshot.docs.map(doc => new Shop({ id: doc.id, ...doc.data() }));
    }

    static async updateStatus(id, status) {
        await db.collection('shops').doc(id).update({
            status,
            updatedAt: new Date()
        });
        return await this.getById(id);
    }

    // Get reviews for this shop (by sellerId)
    static async getReviews(sellerId) {
        const snapshot = await db.collection('reviews')
            .where('sellerId', '==', sellerId)
            .get();

        const reviews = snapshot.docs.map(doc => {
            const data = doc.data();
            // Ensure dates are parsed
            if (data.createdAt && data.createdAt.toDate) {
                data.createdAt = data.createdAt.toDate();
            }
            return { id: doc.id, ...data };
        });

        // Sort in memory (newest first)
        return reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
}

module.exports = Shop;
