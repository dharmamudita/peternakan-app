/**
 * Firebase Admin SDK Configuration
 * Konfigurasi untuk menghubungkan backend dengan Firebase
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

    // Inisialisasi Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    console.log('✅ Firebase Admin SDK berhasil diinisialisasi');
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
const storage = admin.storage();

module.exports = {
  admin,
  db,
  auth,
  storage,
  initializeFirebase,
};
