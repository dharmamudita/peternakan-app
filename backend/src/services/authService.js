/**
 * Auth Service
 * Service untuk autentikasi dan manajemen user
 */

const { auth, db } = require('../config/firebase');
const { COLLECTIONS, USER_ROLES, MESSAGES } = require('../config/constants');
const User = require('../models/User');

class AuthService {
    /**
     * Verifikasi token Firebase
     */
    static async verifyToken(idToken) {
        try {
            const decodedToken = await auth.verifyIdToken(idToken);
            return decodedToken;
        } catch (error) {
            throw new Error('Token tidak valid');
        }
    }

    /**
     * Mendapatkan user dari token
     */
    static async getUserFromToken(idToken) {
        try {
            const decodedToken = await this.verifyToken(idToken);
            const user = await User.getById(decodedToken.uid);

            if (!user) {
                throw new Error('User tidak ditemukan');
            }

            return user;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Registrasi user baru
     * Note: User dibuat di Firebase Auth dari client, ini hanya untuk menyimpan data tambahan di Firestore
     */
    static async registerUser(userData) {
        try {
            const { uid, email, displayName, phoneNumber, role = USER_ROLES.USER } = userData;

            // Cek apakah user sudah ada
            const existingUser = await User.getById(uid);
            if (existingUser) {
                throw new Error('User sudah terdaftar');
            }

            // Buat user baru di Firestore
            const user = await User.createWithId(uid, {
                uid,
                email,
                displayName,
                phoneNumber,
                role,
                isVerified: false,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            return user;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Login - Simpan last login time
     */
    static async login(uid) {
        try {
            const user = await User.getById(uid);

            if (!user) {
                throw new Error('User tidak ditemukan');
            }

            if (!user.isActive) {
                throw new Error('Akun tidak aktif');
            }

            // Update last login
            await User.updateLastLogin(uid);

            return user;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update profil user
     */
    static async updateProfile(uid, updateData) {
        try {
            const allowedFields = ['displayName', 'phoneNumber', 'photoURL', 'address'];
            const filteredData = {};

            Object.keys(updateData).forEach(key => {
                if (allowedFields.includes(key)) {
                    filteredData[key] = updateData[key];
                }
            });

            const user = await User.update(uid, filteredData);
            return user;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update role user (admin only)
     */
    static async updateUserRole(uid, newRole) {
        try {
            if (!Object.values(USER_ROLES).includes(newRole)) {
                throw new Error('Role tidak valid');
            }

            const user = await User.update(uid, { role: newRole });

            // Set custom claims di Firebase Auth
            await auth.setCustomUserClaims(uid, { role: newRole });

            return user;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Deaktivasi akun user
     */
    static async deactivateUser(uid) {
        try {
            await User.update(uid, { isActive: false });

            // Disable user di Firebase Auth
            await auth.updateUser(uid, { disabled: true });

            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Aktivasi akun user
     */
    static async activateUser(uid) {
        try {
            await User.update(uid, { isActive: true });

            // Enable user di Firebase Auth
            await auth.updateUser(uid, { disabled: false });

            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Verifikasi email user
     */
    static async verifyEmail(uid) {
        try {
            await User.update(uid, { isVerified: true });
            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all users (admin)
     */
    static async getAllUsers(page = 1, limit = 10, filters = {}) {
        try {
            return await User.getAll(page, limit, filters);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete user (admin)
     */
    static async deleteUser(uid) {
        try {
            // Soft delete di Firestore
            await User.delete(uid);

            // Delete di Firebase Auth
            await auth.deleteUser(uid);

            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AuthService;
