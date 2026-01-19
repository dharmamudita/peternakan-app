const admin = require('firebase-admin');
require('dotenv').config();

console.log('🔥 Initializing Firebase (Simple Mode)...');

// Coba metode paling dasar: require file JSON
let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
  console.log('✅ Loaded serviceAccountKey.json');
} catch (e) {
  console.log('⚠️ serviceAccountKey.json not found, verifying ENV...');
}

// Fallback ENV
if (!serviceAccount) {
  const envKey = process.env.FIREBASE_PRIVATE_KEY;
  if (envKey) {
    serviceAccount = {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: envKey.replace(/\\n/g, '\n')
    };
  }
}

if (!serviceAccount) {
  throw new Error('Firebase credentials missing');
}

if (admin.apps.length === 0) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    console.log('🚀 Firebase Admin Initialized Successfully');
  } catch (error) {
    console.error('❌ Firebase Init Error:', error.message);
    throw error;
  }
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = {
  admin,
  db,
  auth,
};
