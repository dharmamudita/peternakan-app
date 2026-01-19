/**
 * Animal Model
 * Model untuk data hewan ternak
 */

const { db } = require('../config/firebase');
const { COLLECTIONS, ANIMAL_TYPES, HEALTH_STATUS } = require('../config/constants');

class Animal {
    constructor(data) {
        this.id = data.id || null;
        this.farmId = data.farmId || '';
        this.tagNumber = data.tagNumber || ''; // Nomor identifikasi hewan
        this.name = data.name || '';
        this.type = data.type || ANIMAL_TYPES.OTHER; // Jenis hewan
        this.breed = data.breed || ''; // Ras/jenis khusus
        this.gender = data.gender || 'unknown'; // male, female, unknown
        this.birthDate = data.birthDate || null;
        this.weight = data.weight || 0; // Berat dalam kg
        this.color = data.color || '';
        this.images = data.images || [];
        this.parentInfo = data.parentInfo || {
            fatherId: null,
            motherId: null,
            fatherTagNumber: '',
            motherTagNumber: '',
        };
        this.healthStatus = data.healthStatus || HEALTH_STATUS.HEALTHY;
        this.lastHealthCheck = data.lastHealthCheck || null;
        this.vaccinations = data.vaccinations || []; // Riwayat vaksinasi
        this.purchaseInfo = data.purchaseInfo || {
            purchaseDate: null,
            purchasePrice: 0,
            supplier: '',
        };
        this.notes = data.notes || '';
        this.isForSale = data.isForSale || false;
        this.salePrice = data.salePrice || 0;
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    toJSON() {
        return {
            id: this.id,
            farmId: this.farmId,
            tagNumber: this.tagNumber,
            name: this.name,
            type: this.type,
            breed: this.breed,
            gender: this.gender,
            birthDate: this.birthDate,
            weight: this.weight,
            color: this.color,
            images: this.images,
            parentInfo: this.parentInfo,
            healthStatus: this.healthStatus,
            lastHealthCheck: this.lastHealthCheck,
            vaccinations: this.vaccinations,
            purchaseInfo: this.purchaseInfo,
            notes: this.notes,
            isForSale: this.isForSale,
            salePrice: this.salePrice,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    toFirestore() {
        const data = this.toJSON();
        delete data.id;
        return data;
    }

    static async create(animalData) {
        const animal = new Animal(animalData);
        const docRef = await db.collection(COLLECTIONS.ANIMALS).add(animal.toFirestore());
        animal.id = docRef.id;
        return animal;
    }

    static async getById(id) {
        const doc = await db.collection(COLLECTIONS.ANIMALS).doc(id).get();
        if (!doc.exists) return null;
        return new Animal({ id: doc.id, ...doc.data() });
    }

    static async getByFarmId(farmId, page = 1, limit = 10, filters = {}) {
        let query = db.collection(COLLECTIONS.ANIMALS)
            .where('farmId', '==', farmId)
            .where('isActive', '==', true);

        if (filters.type) {
            query = query.where('type', '==', filters.type);
        }
        if (filters.healthStatus) {
            query = query.where('healthStatus', '==', filters.healthStatus);
        }
        if (filters.gender) {
            query = query.where('gender', '==', filters.gender);
        }
        if (filters.isForSale !== undefined) {
            query = query.where('isForSale', '==', filters.isForSale);
        }

        const countSnapshot = await query.get();
        const total = countSnapshot.size;

        query = query.orderBy('createdAt', 'desc')
            .offset((page - 1) * limit)
            .limit(limit);

        const snapshot = await query.get();
        const animals = snapshot.docs.map(doc => new Animal({ id: doc.id, ...doc.data() }));

        return {
            data: animals,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    static async getByTagNumber(tagNumber, farmId) {
        const snapshot = await db.collection(COLLECTIONS.ANIMALS)
            .where('farmId', '==', farmId)
            .where('tagNumber', '==', tagNumber)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return new Animal({ id: doc.id, ...doc.data() });
    }

    static async update(id, updateData) {
        updateData.updatedAt = new Date();
        await db.collection(COLLECTIONS.ANIMALS).doc(id).update(updateData);
        return await Animal.getById(id);
    }

    static async delete(id) {
        await db.collection(COLLECTIONS.ANIMALS).doc(id).update({
            isActive: false,
            updatedAt: new Date(),
        });
        return true;
    }

    static async getAnimalStats(farmId) {
        const snapshot = await db.collection(COLLECTIONS.ANIMALS)
            .where('farmId', '==', farmId)
            .where('isActive', '==', true)
            .get();

        const stats = {
            total: snapshot.size,
            byType: {},
            byGender: { male: 0, female: 0, unknown: 0 },
            byHealthStatus: {},
            forSale: 0,
        };

        snapshot.docs.forEach(doc => {
            const animal = doc.data();

            // Count by type
            stats.byType[animal.type] = (stats.byType[animal.type] || 0) + 1;

            // Count by gender
            stats.byGender[animal.gender] = (stats.byGender[animal.gender] || 0) + 1;

            // Count by health status
            stats.byHealthStatus[animal.healthStatus] = (stats.byHealthStatus[animal.healthStatus] || 0) + 1;

            // Count for sale
            if (animal.isForSale) stats.forSale++;
        });

        return stats;
    }
}

module.exports = Animal;
