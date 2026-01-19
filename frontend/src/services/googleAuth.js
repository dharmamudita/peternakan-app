/**
 * Google Authentication Service
 * Service untuk Google Sign-In menggunakan Expo Auth Session
 */

import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';
import { EXPO_CLIENT_ID, ANDROID_CLIENT_ID, IOS_CLIENT_ID, FIREBASE_CONFIG } from '../config/firebase';
import { authApi } from './api';

// Complete auth session untuk web browser
WebBrowser.maybeCompleteAuthSession();

/**
 * Hook untuk Google Auth
 * Gunakan di component:
 * 
 * const { request, promptAsync, loading } = useGoogleAuth({
 *     onSuccess: (result) => { ... },
 *     onError: (error) => { ... }
 * });
 */
export const useGoogleAuth = () => {
    const redirectUri = makeRedirectUri({
        scheme: 'peternakan-app',
        preferLocalhost: Platform.OS === 'web',
    });

    const [request, response, promptAsync] = Google.useAuthRequest({
        expoClientId: EXPO_CLIENT_ID,
        webClientId: FIREBASE_CONFIG.webClientId,
        androidClientId: ANDROID_CLIENT_ID,
        iosClientId: IOS_CLIENT_ID,
        scopes: ['profile', 'email'],
        redirectUri,
    });

    return {
        request,
        response,
        promptAsync,
        loading: !request,
    };
};

/**
 * Verify Google token dengan backend
 * Backend akan memverifikasi token dan membuat/login user di Firestore
 */
export const verifyGoogleToken = async (accessToken, idToken) => {
    try {
        // Ambil info user dari Google
        const userInfoResponse = await fetch(
            'https://www.googleapis.com/userinfo/v2/me',
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );

        if (!userInfoResponse.ok) {
            throw new Error('Gagal mengambil data dari Google');
        }

        const googleUser = await userInfoResponse.json();

        // Kirim ke backend untuk register/login
        const response = await authApi.googleAuth({
            googleId: googleUser.id,
            email: googleUser.email,
            displayName: googleUser.name,
            photoURL: googleUser.picture,
            idToken: idToken,
        });

        return response;
    } catch (error) {
        console.error('Google verification error:', error);
        throw error;
    }
};

/**
 * Proses response dari Google Auth
 */
export const processGoogleAuthResponse = async (response) => {
    if (response?.type === 'success') {
        const { authentication } = response;

        if (authentication?.accessToken) {
            const result = await verifyGoogleToken(
                authentication.accessToken,
                authentication.idToken
            );
            return result;
        }
    } else if (response?.type === 'cancel') {
        throw new Error('Login dibatalkan');
    } else if (response?.type === 'error') {
        throw new Error(response.error?.message || 'Terjadi kesalahan saat login Google');
    }

    return null;
};
