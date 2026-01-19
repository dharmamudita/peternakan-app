/**
 * Facebook Authentication Service
 * Service untuk Facebook Sign-In menggunakan Expo Auth Session
 * dengan fallback ke Firebase SDK untuk web
 */

import * as Facebook from 'expo-auth-session/providers/facebook';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, ResponseType } from 'expo-auth-session';
import { Platform } from 'react-native';
import { FACEBOOK_APP_ID } from '../config/firebase';
import { authApi } from './api';

// Complete auth session untuk web browser
WebBrowser.maybeCompleteAuthSession();

/**
 * Hook untuk Facebook Auth
 * Gunakan di component:
 * 
 * const { request, promptAsync, loading } = useFacebookAuth({
 *     onSuccess: (result) => { ... },
 *     onError: (error) => { ... }
 * });
 */
export const useFacebookAuth = () => {
    // Gunakan redirect URI yang sesuai untuk platform
    const redirectUri = makeRedirectUri({
        scheme: 'peternakan-app',
        useProxy: Platform.OS !== 'web',
    });

    const [request, response, promptAsync] = Facebook.useAuthRequest({
        clientId: FACEBOOK_APP_ID,
        scopes: ['public_profile', 'email'],
        redirectUri,
        responseType: ResponseType.Token,
    });

    return {
        request,
        response,
        promptAsync: async (options) => {
            // Untuk web, buka dalam popup window bukan redirect
            if (Platform.OS === 'web') {
                return promptAsync({
                    ...options,
                    windowFeatures: { width: 500, height: 600 },
                    showInRecents: true,
                });
            }
            return promptAsync(options);
        },
        loading: !request,
    };
};

/**
 * Alternatif: Login Facebook via popup (untuk web)
 * Ini menggunakan window.open langsung untuk menghindari masalah session storage
 */
export const loginWithFacebookPopup = async () => {
    return new Promise((resolve, reject) => {
        // Gunakan root URL sebagai redirect URI
        const redirectUri = encodeURIComponent(window.location.origin + '/');
        const scope = encodeURIComponent('public_profile,email');

        const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${redirectUri}&scope=${scope}&response_type=token`;

        const width = 500;
        const height = 600;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;

        const popup = window.open(
            authUrl,
            'Facebook Login',
            `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!popup) {
            reject(new Error('Popup blocked. Please allow popups for this site.'));
            return;
        }

        // Polling untuk memantau URL popup
        const timer = setInterval(() => {
            try {
                // 1. Cek apakah popup sudah ditutup user
                if (popup.closed) {
                    clearInterval(timer);
                    reject(new Error('Login dibatalkan')); // Ini pesan yang Anda lihat tadi
                    return;
                }

                // 2. Coba baca URL popup
                // Akan error "Cross-origin" selama user masih di facebook.com
                // Akan BERHASIL saat user redirect balik ke localhost
                const popupUrl = popup.location.href;

                if (popupUrl.includes('access_token=') || popupUrl.includes('error=')) {
                    clearInterval(timer);
                    popup.close();

                    // Parse access token dari URL hash
                    // URL: http://localhost:8082/#access_token=...&expires_in=...
                    const hashIndex = popupUrl.indexOf('#');
                    if (hashIndex !== -1) {
                        const hash = popupUrl.substring(hashIndex + 1);
                        const params = {};
                        hash.split('&').forEach(hk => {
                            const temp = hk.split('=');
                            params[temp[0]] = decodeURIComponent(temp[1]);
                        });

                        if (params.access_token) {
                            // Token ditemukan, verifikasi ke backend
                            verifyFacebookToken(params.access_token)
                                .then(resolve)
                                .catch(reject);
                        } else if (params.error) {
                            reject(new Error(params.error_description || 'Login failed'));
                        } else {
                            reject(new Error('Tidak ada access token ditemukan'));
                        }
                    }
                }
            } catch (error) {
                // Ignore DOMException: Blocked a frame with origin...
                // Ini normal saat user masih di halaman Facebook
            }
        }, 500); // Cek setiap 0.5 detik
    });
};

/**
 * Verify Facebook token dengan backend
 * Backend akan memverifikasi token dan membuat/login user di Firestore
 */
export const verifyFacebookToken = async (accessToken) => {
    try {
        // Ambil info user dari Facebook Graph API
        const userInfoResponse = await fetch(
            `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`
        );

        if (!userInfoResponse.ok) {
            throw new Error('Gagal mengambil data dari Facebook');
        }

        const facebookUser = await userInfoResponse.json();

        // Handle jika email tidak tersedia (user tidak memberikan izin email)
        if (!facebookUser.email) {
            throw new Error('Email tidak tersedia. Pastikan Anda memberikan izin akses email.');
        }

        // Kirim ke backend untuk register/login
        const response = await authApi.facebookAuth({
            facebookId: facebookUser.id,
            email: facebookUser.email,
            displayName: facebookUser.name,
            photoURL: facebookUser.picture?.data?.url,
            accessToken: accessToken,
        });

        return response;
    } catch (error) {
        console.error('Facebook verification error:', error);
        throw error;
    }
};

/**
 * Proses response dari Facebook Auth
 */
export const processFacebookAuthResponse = async (response) => {
    if (response?.type === 'success') {
        const { authentication } = response;

        if (authentication?.accessToken) {
            const result = await verifyFacebookToken(authentication.accessToken);
            return result;
        }
    } else if (response?.type === 'cancel') {
        throw new Error('Login dibatalkan');
    } else if (response?.type === 'error') {
        throw new Error(response.error?.message || 'Terjadi kesalahan saat login Facebook');
    }

    return null;
};
