/**
 * User Model
 * Model untuk data pengguna
 */

const { db } = require('../config/firebase');
const { COLLECTIONS, USER_ROLES } = require('../config/constants');

class User {
    constructor(data) {
        this.id = data.id || null;
        this.uid = data.uid || null; // Firebase Auth UID
        this.email = data.email || '';
        this.displayName = data.displayName || '';
        this.phoneNumber = data.phoneNumber || '';
        this.photoURL = data.photoURL || '';
        this.role = data.role || USER_ROLES.USER;
        this.address = data.address || {
            street: '',
            city: '',
            province: '',
            postalCode: '',
            country: 'Indonesia',
        };
        this.farmId = data.farmId || null; // ID peternakan jika user adalah peternak
        this.isVerified = data.isVerified || false;
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
        this.lastLoginAt = data.lastLoginAt || null;
        this.sellerVerification = data.sellerVerification || null;
    }

    // Konversi ke objek biasa
    toJSON() {
        return {
            id: this.id,
            uid: this.uid,
            email: this.email,
            displayName: this.displayName,
            phoneNumber: this.phoneNumber,
            photoURL: this.photoURL,
            role: this.role,
            address: this.address,
            farmId: this.farmId,
            isVerified: this.isVerified,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            lastLoginAt: this.lastLoginAt,
            sellerVerification: this.sellerVerification,
        };
    }

    // Konversi untuk Firestore
    toFirestore() {
        const data = this.toJSON();
        delete data.id;
        // Opsional: Validasi atau filter sellerVerification jika tidak ingin disimpan permanen
        // Namun untuk kasus ini kita butuh simpan di Firestore
        return data;
    }

    // Create user
    static async create(userData) {
        const user = new User(userData);
        const docRef = await db.collection(COLLECTIONS.USERS).add(user.toFirestore());
        user.id = docRef.id;
        return user;
    }

    // Create user dengan ID spesifik (menggunakan UID dari Firebase Auth)
    static async createWithId(uid, userData) {
        const user = new User({ ...userData, uid });
        await db.collection(COLLECTIONS.USERS).doc(uid).set(user.toFirestore());
        user.id = uid;
        return user;
    }

    // Get user by ID
    static async getById(id) {
        const doc = await db.collection(COLLECTIONS.USERS).doc(id).get();
        if (!doc.exists) return null;
        return new User({ id: doc.id, ...doc.data() });
    }

    // Get user by UID
    static async getByUid(uid) {
        const snapshot = await db.collection(COLLECTIONS.USERS)
            .where('uid', '==', uid)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return new User({ id: doc.id, ...doc.data() });
    }

    // Get user by email
    static async getByEmail(email) {
        const snapshot = await db.collection(COLLECTIONS.USERS)
            .where('email', '==', email)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return new User({ id: doc.id, ...doc.data() });
    }

    // Get all users dengan pagination
    static async getAll(page = 1, limit = 10, filters = {}) {
        let query = db.collection(COLLECTIONS.USERS);

        // Apply filters
        if (filters.role) {
            query = query.where('role', '==', filters.role);
        }
        if (filters.isActive !== undefined) {
            query = query.where('isActive', '==', filters.isActive);
        }

        // Get total count
        const countSnapshot = await query.get();
        const total = countSnapshot.size;

        // Apply pagination
        query = query.orderBy('createdAt', 'desc')
            .offset((page - 1) * limit)
            .limit(limit);

        const snapshot = await query.get();
        const users = snapshot.docs.map(doc => new User({ id: doc.id, ...doc.data() }));

        return {
            data: users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // Update user
    static async update(id, updateData) {
        updateData.updatedAt = new Date();
        await db.collection(COLLECTIONS.USERS).doc(id).update(updateData);
        return await User.getById(id);
    }

    // Delete user (soft delete)
    static async delete(id) {
        await db.collection(COLLECTIONS.USERS).doc(id).update({
            isActive: false,
            updatedAt: new Date(),
        });
        return true;
    }

    // Hard delete
    static async hardDelete(id) {
        await db.collection(COLLECTIONS.USERS).doc(id).delete();
        return true;
    }

    // Update last login
    static async updateLastLogin(id) {
        await db.collection(COLLECTIONS.USERS).doc(id).update({
            lastLoginAt: new Date(),
        });
    }
}

module.exports = User;
