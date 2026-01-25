const { db } = require('../config/firebase');
const ADMIN_COLLECTION = 'addresses';

class Address {
    /**
     * Create new address
     */
    static async create(addressData) {
        const docRef = db.collection(ADMIN_COLLECTION).doc();
        const now = new Date().toISOString();

        const newAddress = {
            id: docRef.id,
            ...addressData,
            createdAt: now,
            updatedAt: now,
        };

        await docRef.set(newAddress);
        return new Address(newAddress);
    }

    /**
     * Get Address by ID
     */
    static async getById(id) {
        const doc = await db.collection(ADMIN_COLLECTION).doc(id).get();
        if (!doc.exists) return null;
        return new Address(doc.data());
    }

    /**
     * Get All Addresses by User ID
     */
    static async getByUserId(userId) {
        // Remove orderBy to avoid 'FAILED_PRECONDITION' index error
        const snapshot = await db.collection(ADMIN_COLLECTION)
            .where('userId', '==', userId)
            .get();

        if (snapshot.empty) return [];

        const addresses = snapshot.docs.map(doc => new Address(doc.data()));

        // In-memory sort (desc)
        return addresses.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }

    /**
     * Update Address
     */
    static async update(id, updateData) {
        const docRef = db.collection(ADMIN_COLLECTION).doc(id);
        const updatePayload = {
            ...updateData,
            updatedAt: new Date().toISOString(),
        };

        await docRef.update(updatePayload);

        // Return updated data
        const doc = await docRef.get();
        return new Address(doc.data());
    }

    /**
     * Delete Address
     */
    static async delete(id) {
        await db.collection(ADMIN_COLLECTION).doc(id).delete();
        return true;
    }

    /**
     * Set Default Address Logic (Batch Write)
     */
    static async setDefault(userId, addressId) {
        const batch = db.batch();
        const collectionRef = db.collection(ADMIN_COLLECTION);

        // 1. Get all user addresses
        const snapshot = await collectionRef.where('userId', '==', userId).get();

        // 2. Set all to isDefault = false
        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, { isDefault: false });
        });

        // 3. Set target to isDefault = true
        const targetRef = collectionRef.doc(addressId);
        batch.update(targetRef, { isDefault: true });

        await batch.commit();
        return true;
    }

    constructor(data) {
        this.id = data.id;
        this.userId = data.userId;
        this.label = data.label || 'Rumah';
        this.recipientName = data.recipientName;
        this.phoneNumber = data.phoneNumber;
        this.fullAddress = data.fullAddress;
        this.city = data.city;
        this.province = data.province;
        this.postalCode = data.postalCode;
        this.note = data.note;
        this.latitude = data.latitude;
        this.longitude = data.longitude;
        this.isDefault = data.isDefault || false;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            label: this.label,
            recipientName: this.recipientName,
            phoneNumber: this.phoneNumber,
            fullAddress: this.fullAddress,
            city: this.city,
            province: this.province,
            postalCode: this.postalCode,
            note: this.note,
            coordinates: {
                lat: this.latitude,
                lng: this.longitude
            },
            isDefault: this.isDefault,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}

module.exports = Address;
