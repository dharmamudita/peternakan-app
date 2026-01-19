/**
 * Farm Model
 * Model untuk data peternakan
 */

const { db } = require('../config/firebase');
const { COLLECTIONS } = require('../config/constants');

class Farm {
    constructor(data) {
        this.id = data.id || null;
        this.ownerId = data.ownerId || ''; // User ID pemilik
        this.name = data.name || '';
        this.description = data.description || '';
        this.type = data.type || ''; // Jenis peternakan
        this.address = data.address || {
            street: '',
            village: '',
            district: '',
            city: '',
            province: '',
            postalCode: '',
            coordinates: {
                latitude: 0,
                longitude: 0,
            },
        };
        this.contactInfo = data.contactInfo || {
            phone: '',
            email: '',
            website: '',
        };
        this.images = data.images || [];
        this.facilities = data.facilities || []; // Fasilitas yang dimiliki
        this.totalAnimals = data.totalAnimals || 0;
        this.establishedYear = data.establishedYear || null;
        this.certifications = data.certifications || []; // Sertifikasi yang dimiliki
        this.isVerified = data.isVerified || false;
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.rating = data.rating || 0;
        this.totalReviews = data.totalReviews || 0;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    toJSON() {
        return {
            id: this.id,
            ownerId: this.ownerId,
            name: this.name,
            description: this.description,
            type: this.type,
            address: this.address,
            contactInfo: this.contactInfo,
            images: this.images,
            facilities: this.facilities,
            totalAnimals: this.totalAnimals,
            establishedYear: this.establishedYear,
            certifications: this.certifications,
            isVerified: this.isVerified,
            isActive: this.isActive,
            rating: this.rating,
            totalReviews: this.totalReviews,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    toFirestore() {
        const data = this.toJSON();
        delete data.id;
        return data;
    }

    static async create(farmData) {
        const farm = new Farm(farmData);
        const docRef = await db.collection(COLLECTIONS.FARMS).add(farm.toFirestore());
        farm.id = docRef.id;
        return farm;
    }

    static async getById(id) {
        const doc = await db.collection(COLLECTIONS.FARMS).doc(id).get();
        if (!doc.exists) return null;
        return new Farm({ id: doc.id, ...doc.data() });
    }

    static async getByOwnerId(ownerId) {
        const snapshot = await db.collection(COLLECTIONS.FARMS)
            .where('ownerId', '==', ownerId)
            .get();

        return snapshot.docs.map(doc => new Farm({ id: doc.id, ...doc.data() }));
    }

    static async getAll(page = 1, limit = 10, filters = {}) {
        let query = db.collection(COLLECTIONS.FARMS);

        if (filters.type) {
            query = query.where('type', '==', filters.type);
        }
        if (filters.isVerified !== undefined) {
            query = query.where('isVerified', '==', filters.isVerified);
        }
        if (filters.isActive !== undefined) {
            query = query.where('isActive', '==', filters.isActive);
        }
        if (filters.province) {
            query = query.where('address.province', '==', filters.province);
        }

        const countSnapshot = await query.get();
        const total = countSnapshot.size;

        query = query.orderBy('createdAt', 'desc')
            .offset((page - 1) * limit)
            .limit(limit);

        const snapshot = await query.get();
        const farms = snapshot.docs.map(doc => new Farm({ id: doc.id, ...doc.data() }));

        return {
            data: farms,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    static async update(id, updateData) {
        updateData.updatedAt = new Date();
        await db.collection(COLLECTIONS.FARMS).doc(id).update(updateData);
        return await Farm.getById(id);
    }

    static async delete(id) {
        await db.collection(COLLECTIONS.FARMS).doc(id).update({
            isActive: false,
            updatedAt: new Date(),
        });
        return true;
    }

    static async updateAnimalCount(id, count) {
        await db.collection(COLLECTIONS.FARMS).doc(id).update({
            totalAnimals: count,
            updatedAt: new Date(),
        });
    }
}

module.exports = Farm;
