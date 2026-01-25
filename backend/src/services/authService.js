/**
 * Auth Service
 * Service untuk autentikasi dan manajemen user
 */

const { auth, db } = require('../config/firebase');
const { COLLECTIONS, USER_ROLES, MESSAGES } = require('../config/constants');
const User = require('../models/User');
const Mailer = require('../utils/mailer');

class AuthService {
    /**
     * Verifikasi token Firebase
     */
    static async verifyToken(idToken) {
        try {
            const decodedToken = await auth.verifyIdToken(idToken);
            return decodedToken;
        } catch (error) {
            console.error('Verify Token Error:', error.code, error.message);
            throw new Error('Token tidak valid: ' + error.message);
        }
    }

    /**
     * Mendapatkan user dari token
     */
    static async getUserFromToken(idToken) {
        try {
            const decodedToken = await this.verifyToken(idToken);

            // Try getById first (if document ID = UID)
            let user = await User.getById(decodedToken.uid);

            // Fallback to getByUid (if document has different ID but stores UID as field)
            if (!user) {
                user = await User.getByUid(decodedToken.uid);
            }

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
            console.error('[AuthService] Register Error:', error.code, error.message);
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
     * Facebook Sign-In / Login
     * Menerima data dari Facebook OAuth dan membuat/login user
     */
    static async facebookLogin(facebookData) {
        try {
            const { facebookId, email, displayName, photoURL, accessToken } = facebookData;

            // Cari user berdasarkan email atau facebookId
            const usersRef = db.collection(COLLECTIONS.USERS);
            let snapshot = await usersRef.where('email', '==', email).limit(1).get();

            // Jika tidak ditemukan via email, coba cari via facebookId
            if (snapshot.empty) {
                snapshot = await usersRef.where('facebookId', '==', facebookId).limit(1).get();
            }

            let user;
            let userUid;

            if (snapshot.empty) {
                // User belum ada, buat baru
                try {
                    // Coba buat user di Firebase Auth
                    const userRecord = await auth.createUser({
                        uid: `fb_${facebookId}`,
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
                        userUid = `fb_${facebookId}`;
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
                    facebookId,
                    role: USER_ROLES.USER,
                    isVerified: true,
                    isActive: true,
                    authProvider: 'facebook',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            } else {
                // User sudah ada, update info jika perlu
                const doc = snapshot.docs[0];
                user = new User({ id: doc.id, ...doc.data() });
                userUid = user.id;

                // ONLY update facebookId and updatedAt
                // DO NOT overwrite displayName and photoURL if user has customized them
                const updateData = {
                    facebookId: facebookId,
                    updatedAt: new Date(),
                };

                // Only update displayName if user hasn't set one yet
                if (!user.displayName) {
                    updateData.displayName = displayName;
                }

                // Only update photoURL if user hasn't set a custom one (non-Facebook URL)
                const isFacebookPhoto = user.photoURL && user.photoURL.includes('facebook.com');
                if (!user.photoURL || isFacebookPhoto) {
                    updateData.photoURL = photoURL;
                }

                await User.update(userUid, updateData);

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
            console.error('Facebook login error:', error);
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

                // ONLY update googleId and updatedAt
                // DO NOT overwrite displayName and photoURL if user has customized them
                // (We preserve user's custom profile settings)
                const updateData = {
                    googleId: googleId,
                    updatedAt: new Date(),
                };

                // Only update displayName if user hasn't set one yet
                if (!user.displayName) {
                    updateData.displayName = displayName;
                }

                // Only update photoURL if user hasn't set a custom one (non-Google URL)
                const isGooglePhoto = user.photoURL && user.photoURL.includes('googleusercontent.com');
                if (!user.photoURL || isGooglePhoto) {
                    // User either has no photo or still has Google photo, update with latest Google photo
                    updateData.photoURL = photoURL;
                }
                // If user has custom photo (non-Google), preserve it

                await User.update(userUid, updateData);

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
     * Kirim email reset password dengan Rate Limiting (Maks 3x/hari)
     */
    static async forgotPassword(email) {
        try {
            // 1. Cek User & Rate Limit di Firestore
            const usersRef = db.collection(COLLECTIONS.USERS);
            const snapshot = await usersRef.where('email', '==', email).limit(1).get();

            if (snapshot.empty) {
                // Return error agar user tahu email salah (bisa diubah return true palsu untuk security thd enumerasi)
                // Tapi untuk UX saat ini kita kasih feedback jujur dulu.
                throw new Error('Email tidak terdaftar');
            }

            const userDoc = snapshot.docs[0];
            const userData = userDoc.data();
            const uid = userDoc.id;

            const now = new Date();
            // Handle Firestore Timestamp atau Date
            const lastRequest = userData.lastResetRequest && userData.lastResetRequest.toDate
                ? userData.lastResetRequest.toDate()
                : (userData.lastResetRequest ? new Date(userData.lastResetRequest) : null);

            let dailyCount = userData.resetRequestCount || 0;

            // Reset counter jika hari sudah berganti (dibandingkan request terakhir)
            if (lastRequest && lastRequest.toDateString() !== now.toDateString()) {
                dailyCount = 0;
            }

            if (dailyCount >= 3) {
                throw new Error('Anda telah mencapai batas reset password (3x). Silakan coba lagi besok.');
            }

            // 2. Kirim Email via Firebase API
            const apiKey = process.env.FIREBASE_WEB_API_KEY;
            if (!apiKey) {
                throw new Error("Server Error: Konfigurasi API Key belum lengkap");
            }

            const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestType: 'PASSWORD_RESET',
                    email: email
                })
            });

            const data = await response.json();

            if (!response.ok) {
                const msg = data.error?.message || 'Gagal mengirim email reset password';
                if (msg.includes('EMAIL_NOT_FOUND')) {
                    // Inkonsistensi data DB vs Auth
                    throw new Error('Email tidak terdaftar di Auth Provider');
                }
                throw new Error('Gagal memproses permintaan reset password');
            }

            // 3. Update limit di Database (Increment counter)
            await usersRef.doc(uid).update({
                lastResetRequest: now,
                resetRequestCount: dailyCount + 1
            });

            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Ganti Password
     */
    static async changePassword(uid, email, oldPassword, newPassword) {
        try {
            if (!oldPassword || !newPassword) {
                throw new Error('Password lama dan baru wajib diisi');
            }

            if (newPassword.length < 6) {
                throw new Error('Password baru minimal 6 karakter');
            }

            // 1. Validasi Password Lama dengan mencoba login
            console.log('[ChangePassword] Verifying old password for email:', email);
            const apiKey = process.env.FIREBASE_WEB_API_KEY;

            if (!apiKey) {
                throw new Error('Konfigurasi server belum lengkap (API Key missing)');
            }

            const verifyResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    password: oldPassword,
                    returnSecureToken: false
                })
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
                const msg = verifyData.error?.message || '';
                console.error('[ChangePassword] Verify failed:', msg);
                if (msg.includes('INVALID_PASSWORD') || msg.includes('INVALID_LOGIN_CREDENTIALS')) {
                    throw new Error('Password lama salah');
                }
                throw new Error('Gagal memverifikasi password lama');
            }

            const verifiedUid = verifyData.localId;
            console.log(`[ChangePassword] Verified UID: ${verifiedUid}`);
            console.log(`[ChangePassword] Target UID from request: ${uid}`);

            // 2. Update Password di Firebase Auth using VERIFIED UID
            // Use verifiedUid to be absolutely sure we update the correct Auth account
            await auth.updateUser(verifiedUid, {
                password: newPassword
            });
            console.log('[ChangePassword] Password updated successfully for UID:', verifiedUid);

            return true;
        } catch (error) {
            console.error('Change Password Error:', error.message);
            throw error;
        }
    }

    /**
     * Update profil user
     */
    static async updateProfile(uid, updateData) {
        try {
            console.log('[DEBUG] updateProfile called with uid:', uid);
            console.log('[DEBUG] updateProfile received data:', updateData);

            const allowedFields = ['displayName', 'phoneNumber', 'photoURL', 'address'];
            const filteredData = {};

            Object.keys(updateData).forEach(key => {
                // Only include allowed fields AND exclude undefined values
                if (allowedFields.includes(key) && updateData[key] !== undefined) {
                    filteredData[key] = updateData[key];
                }
            });

            console.log('[DEBUG] Filtered data to save:', filteredData);

            const user = await User.update(uid, filteredData);
            console.log('[DEBUG] User after update:', user?.toJSON());
            return user;
        } catch (error) {
            console.error('[DEBUG] updateProfile error:', error);
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

    /**
     * Request OTP untuk mendaftar sebagai Penjual
     */
    static async requestSellerOtp(uid, password) {
        try {
            // 1. Ambil data user
            const user = await User.getById(uid);
            if (!user) throw new Error('User tidak ditemukan');

            // 2. Verifikasi Password user (Double check security)
            await this.login(user.email, password);

            // 3. Generate OTP 4 Digit
            const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
            // Expire dalam 10 menit
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

            // 4. Simpan OTP di database user
            await User.update(uid, {
                sellerVerification: {
                    otp: otpCode,
                    expiresAt: expiresAt,
                    status: 'pending'
                }
            });

            // 5. Kirim OTP via Email
            await Mailer.sendSellerOtp(user.email, otpCode, user.displayName);

            // Log Backup (untuk development)
            console.log(`[SELLER OTP DEV] To: ${user.email} | OTP: ${otpCode}`);

            return true;
        } catch (error) {
            if (error.message.includes('Email atau password salah') || error.message.includes('INVALID_PASSWORD')) {
                throw new Error('Password yang Anda masukkan salah.');
            }
            throw error;
        }
    }

    /**
     * Verifikasi OTP dan Upgrade jadi Penjual
     */
    static async verifySellerOtp(uid, otp) {
        try {
            const user = await User.getById(uid);
            if (!user) throw new Error('User tidak ditemukan');

            const verificationData = user.sellerVerification;

            if (!verificationData || !verificationData.otp) {
                throw new Error('Belum ada permintaan verifikasi OTP');
            }

            // Cek Expired (Handle Timestamp Firestore)
            const now = new Date();
            const expiresAt = verificationData.expiresAt && verificationData.expiresAt.toDate
                ? verificationData.expiresAt.toDate()
                : new Date(verificationData.expiresAt);

            if (now > expiresAt) {
                throw new Error('Kode OTP sudah kadaluarsa. Silakan request ulang.');
            }

            // Cek Kode
            if (verificationData.otp !== otp.toString()) {
                throw new Error('Kode OTP salah');
            }

            // Sukses! Upgrade Role
            await User.update(uid, {
                role: USER_ROLES.SELLER,
                sellerVerification: null, // Bersihkan OTP
                updatedAt: new Date()
            });

            // Set custom claim auth
            await auth.setCustomUserClaims(uid, { role: USER_ROLES.SELLER });

            // Return user baru
            const updatedUser = await User.getById(uid);
            return updatedUser;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AuthService;
