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
            const { uid, email, password, displayName, phoneNumber, role = USER_ROLES.USER } = userData;

            let userUid = uid;

            // Jika UID tidak diberikan dari client (artinya register via backend), buat user di Firebase Auth
            // Jika UID sudah ada (berarti register via client SDK), gunakan UID tersebut
            if (!userUid) {
                if (!password) {
                    throw new Error('Password wajib diisi untuk registrasi baru');
                }

                // Format phone number to E.164 (wajib buat Firebase)
                // Ubah 08xxx jadi +628xxx
                let formattedPhone = phoneNumber;
                if (formattedPhone && formattedPhone.startsWith('0')) {
                    formattedPhone = '+62' + formattedPhone.slice(1);
                }

                // Create user di Firebase Auth
                const userRecord = await auth.createUser({
                    email,
                    password,
                    displayName,
                    phoneNumber: formattedPhone,
                    disabled: false,
                });
                userUid = userRecord.uid;
            }

            // Cek apakah user sudah ada di database lokal
            const existingUser = await User.getById(userUid);
            if (existingUser) {
                // Jika user sudah ada di DB tapi kita baru saja create di Auth (kasus aneh), atau retry
                // Kita bisa return existing atau throw error. 
                // Asumsikan jika register dipanggil, kita ingin data baru.
                throw new Error('User sudah terdaftar di sistem');
            }

            // Buat user baru di Firestore
            const user = await User.createWithId(userUid, {
                uid: userUid,
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
            // Mapping error Firebase Auth ke pesan yang lebih user-friendly
            if (error.code === 'auth/email-already-exists') {
                throw new Error('Email sudah terdaftar (Firebase Auth)');
            }
            if (error.code === 'auth/invalid-password') {
                throw new Error('Password terlalu lemah (min 6 karakter)');
            }
            if (error.code === 'auth/invalid-phone-number') {
                throw new Error('Nomor telepon tidak valid (Gunakan format +62...)');
            }
            throw error;
        }
    }

    /**
     * Google Sign-In / Login
     * Menerima data dari Google OAuth dan membuat/login user
     */
    static async googleLogin(googleData) {
        try {
            const { googleId, email, displayName, photoURL, idToken } = googleData;

            // Cari user berdasarkan email
            const usersRef = db.collection(COLLECTIONS.USERS);
            const snapshot = await usersRef.where('email', '==', email).limit(1).get();

            let user;
            let userUid;

            if (snapshot.empty) {
                // User belum ada, buat baru
                // Gunakan googleId sebagai UID atau buat UID baru
                try {
                    // Coba buat user di Firebase Auth
                    const userRecord = await auth.createUser({
                        uid: googleId,
                        email,
                        displayName,
                        photoURL,
                        emailVerified: true,
                        disabled: false,
                    });
                    userUid = userRecord.uid;
                } catch (authError) {
                    if (authError.code === 'auth/uid-already-exists') {
                        // UID sudah ada di Auth, gunakan itu
                        userUid = googleId;
                    } else if (authError.code === 'auth/email-already-exists') {
                        // Email sudah ada di Auth tapi tidak di Firestore
                        // Ambil user dari Auth
                        const existingUser = await auth.getUserByEmail(email);
                        userUid = existingUser.uid;
                    } else {
                        throw authError;
                    }
                }

                // Buat user di Firestore
                user = await User.createWithId(userUid, {
                    uid: userUid,
                    email,
                    displayName,
                    photoURL,
                    googleId,
                    role: USER_ROLES.USER,
                    isVerified: true,
                    isActive: true,
                    authProvider: 'google',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            } else {
                // User sudah ada, update info jika perlu
                const doc = snapshot.docs[0];
                user = new User({ id: doc.id, ...doc.data() });
                userUid = user.id;

                // Update data terbaru dari Google
                await User.update(userUid, {
                    displayName: displayName || user.displayName,
                    photoURL: photoURL || user.photoURL,
                    googleId: googleId,
                    updatedAt: new Date(),
                });

                // Refresh user data
                user = await User.getById(userUid);
            }

            if (!user.isActive) {
                throw new Error('Akun tidak aktif');
            }

            // Update last login
            await User.updateLastLogin(userUid);

            // Generate custom token untuk user
            const token = await auth.createCustomToken(userUid);

            return { user, token };
        } catch (error) {
            console.error('Google login error:', error);
            throw error;
        }
    }

    /**
     * Login - Simpan last login time
     */
    static async login(credential, password = null) {
        try {
            let uid;
            let token = null;

            if (password) {
                // Login menggunakan Email & Password via Firebase REST API
                const apiKey = process.env.FIREBASE_WEB_API_KEY;
                if (!apiKey) {
                    console.error("FIREBASE_WEB_API_KEY missing in .env");
                    throw new Error("Server Error: Konfigurasi Login belum lengkap");
                }

                const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: credential,
                        password: password,
                        returnSecureToken: true
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    const msg = data.error?.message || 'Login gagal';
                    console.error('Firebase Auth Error:', msg);

                    if (msg.includes('INVALID_PASSWORD') || msg.includes('INVALID_LOGIN_CREDENTIALS')) {
                        throw new Error('Email atau password salah');
                    }
                    if (msg.includes('EMAIL_NOT_FOUND')) {
                        throw new Error('Email belum terdaftar');
                    }
                    if (msg.includes('USER_DISABLED')) {
                        throw new Error('Akun telah dinonaktifkan');
                    }
                    throw new Error('Gagal login ke autentikasi');
                }

                token = data.idToken;
                uid = data.localId;
            } else {
                // Login menggunakan UID langsung (jika client sudah login duluan)
                uid = credential;
            }

            const user = await User.getById(uid);

            if (!user) {
                // Jika login sukses di Auth tapi tidak ada di Firestore (kasus langka/migrasi)
                // Kita bisa auto-create atau throw error.
                // Untuk keamanan ketat, throw error. Untuk user experience, auto-create?
                // Mari throw error dulu biar konsisten.
                throw new Error('Data user tidak ditemukan di database');
            }

            if (!user.isActive) {
                throw new Error('Akun tidak aktif');
            }

            // Update last login
            await User.updateLastLogin(uid);

            // Return user dan token
            return { user, token };
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
