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
        this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
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
        // Cek apakah user sudah punya toko
        const existing = await this.getByUserId(shopData.userId);
        if (existing) {
            throw new Error('User sudah memiliki toko');
        }

        const shop = new Shop(shopData);
        const data = shop.toJSON();
        delete data.id; // Biarkan Firestore generate ID

        const docRef = await db.collection('shops').add(data);
        shop.id = docRef.id;
        return shop;
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

    static async updateStatus(id, status) {
        await db.collection('shops').doc(id).update({
            status,
            updatedAt: new Date()
        });
        return await this.getById(id);
    }
}

module.exports = Shop;
