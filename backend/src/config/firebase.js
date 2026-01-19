/**
 * Firebase Admin SDK Configuration
 * Konfigurasi untuk menghubungkan backend dengan Firebase
 * Note: Storage menggunakan Cloudinary (gratis), bukan Firebase Storage
 */

const admin = require('firebase-admin');
require('dotenv').config();

// Inisialisasi Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Cek apakah sudah diinisialisasi
    if (admin.apps.length > 0) {
      return admin.app();
    }

    // Konfigurasi service account dari environment variables
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    };

    // Inisialisasi Firebase Admin (tanpa storage - pakai Cloudinary)
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });

    console.log('✅ Firebase Admin SDK berhasil diinisialisasi');
    console.log('📦 Storage: Cloudinary (free tier)');
    return admin.app();
  } catch (error) {
    console.error('❌ Gagal menginisialisasi Firebase:', error.message);
    throw error;
  }
};

// Inisialisasi Firebase
initializeFirebase();

// Export services
const db = admin.firestore();
const auth = admin.auth();

module.exports = {
  admin,
  db,
  auth,
  initializeFirebase,
};
