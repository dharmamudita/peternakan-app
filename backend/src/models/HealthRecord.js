/**
 * HealthRecord Model
 * Model untuk catatan kesehatan hewan
 */

const { db } = require('../config/firebase');
const { COLLECTIONS } = require('../config/constants');

class HealthRecord {
    constructor(data) {
        this.id = data.id || null;
        this.animalId = data.animalId || '';
        this.farmId = data.farmId || '';
        this.recordDate = data.recordDate || new Date();
        this.recordType = data.recordType || 'checkup'; // checkup, vaccination, treatment, surgery
        this.diagnosis = data.diagnosis || '';
        this.symptoms = data.symptoms || [];
        this.treatment = data.treatment || '';
        this.medications = data.medications || []; // Array of { name, dosage, frequency, duration }
        this.veterinarian = data.veterinarian || {
            name: '',
            phone: '',
            clinic: '',
        };
        this.weight = data.weight || 0; // Berat saat pemeriksaan
        this.temperature = data.temperature || 0; // Suhu tubuh
        this.notes = data.notes || '';
        this.attachments = data.attachments || []; // Foto/dokumen
        this.followUpDate = data.followUpDate || null;
        this.cost = data.cost || 0;
        this.createdBy = data.createdBy || '';
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    toJSON() {
        return {
            id: this.id,
            animalId: this.animalId,
            farmId: this.farmId,
            recordDate: this.recordDate,
            recordType: this.recordType,
            diagnosis: this.diagnosis,
            symptoms: this.symptoms,
            treatment: this.treatment,
            medications: this.medications,
            veterinarian: this.veterinarian,
            weight: this.weight,
            temperature: this.temperature,
            notes: this.notes,
            attachments: this.attachments,
            followUpDate: this.followUpDate,
            cost: this.cost,
            createdBy: this.createdBy,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    toFirestore() {
        const data = this.toJSON();
        delete data.id;
        return data;
    }

    static async create(recordData) {
        const record = new HealthRecord(recordData);
        const docRef = await db.collection(COLLECTIONS.HEALTH_RECORDS).add(record.toFirestore());
        record.id = docRef.id;
        return record;
    }

    static async getById(id) {
        const doc = await db.collection(COLLECTIONS.HEALTH_RECORDS).doc(id).get();
        if (!doc.exists) return null;
        return new HealthRecord({ id: doc.id, ...doc.data() });
    }

    static async getByAnimalId(animalId, page = 1, limit = 10) {
        let query = db.collection(COLLECTIONS.HEALTH_RECORDS)
            .where('animalId', '==', animalId);
        // .orderBy('recordDate', 'desc');

        const countSnapshot = await query.get();
        const total = countSnapshot.size;

        query = query.offset((page - 1) * limit).limit(limit);

        const snapshot = await query.get();
        const records = snapshot.docs.map(doc => new HealthRecord({ id: doc.id, ...doc.data() }));

        return {
            data: records,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    static async getByFarmId(farmId, page = 1, limit = 10, filters = {}) {
        let query = db.collection(COLLECTIONS.HEALTH_RECORDS)
            .where('farmId', '==', farmId);

        if (filters.recordType) {
            query = query.where('recordType', '==', filters.recordType);
        }

        const countSnapshot = await query.get();
        const total = countSnapshot.size;

        query = query
            // .orderBy('recordDate', 'desc')
            .offset((page - 1) * limit)
            .limit(limit);

        const snapshot = await query.get();
        const records = snapshot.docs.map(doc => new HealthRecord({ id: doc.id, ...doc.data() }));

        return {
            data: records,
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
        await db.collection(COLLECTIONS.HEALTH_RECORDS).doc(id).update(updateData);
        return await HealthRecord.getById(id);
    }

    static async delete(id) {
        await db.collection(COLLECTIONS.HEALTH_RECORDS).doc(id).delete();
        return true;
    }

    static async getUpcomingFollowUps(farmId, days = 7) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);

        const snapshot = await db.collection(COLLECTIONS.HEALTH_RECORDS)
            .where('farmId', '==', farmId)
            .where('followUpDate', '<=', endDate)
            .where('followUpDate', '>=', new Date())
            .orderBy('followUpDate', 'asc')
            .get();

        return snapshot.docs.map(doc => new HealthRecord({ id: doc.id, ...doc.data() }));
    }
}

module.exports = HealthRecord;
