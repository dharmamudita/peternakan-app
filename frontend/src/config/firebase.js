/**
 * Firebase Configuration for Frontend
 * Konfigurasi Firebase untuk client-side authentication
 */

// Firebase Web Config
export const FIREBASE_CONFIG = {
    // Google OAuth Web Client ID
    webClientId: '967552027700-f92njk2ho22b90gmlhumhpc2r35jdb5t.apps.googleusercontent.com',

    // Firebase Config
    apiKey: 'AIzaSyADdXgRSuf5jH8_8Hw0_y1iGNK67tRygNo',
    authDomain: 'peternakan-b3e94.firebaseapp.com',
    projectId: 'peternakan-b3e94',
    storageBucket: 'peternakan-b3e94.firebasestorage.app',
    databaseURL: 'https://peternakan-b3e94.firebaseio.com',
};

// Google OAuth Client IDs
// Web Client ID - Digunakan untuk semua platform di Expo
export const EXPO_CLIENT_ID = '967552027700-f92njk2ho22b90gmlhumhpc2r35jdb5t.apps.googleusercontent.com';

// Android Client ID (sama dengan Web untuk Expo managed workflow)
export const ANDROID_CLIENT_ID = '967552027700-f92njk2ho22b90gmlhumhpc2r35jdb5t.apps.googleusercontent.com';

// iOS Client ID (sama dengan Web untuk Expo managed workflow)
export const IOS_CLIENT_ID = '967552027700-f92njk2ho22b90gmlhumhpc2r35jdb5t.apps.googleusercontent.com';

// Facebook App ID - Dari Meta Developer Console
export const FACEBOOK_APP_ID = '817973851255832';

// Firebase Auth Handler untuk OAuth redirect
export const FIREBASE_AUTH_HANDLER = 'https://peternakan-b3e94.firebaseapp.com/__/auth/handler';

