/**
 * Storage Utility
 * Wrapper untuk menghandle penyimpanan data di Web (localStorage) dan Mobile (SecureStore)
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const isWeb = Platform.OS === 'web';

export const setItem = async (key, value) => {
    if (isWeb) {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(key, value);
            }
        } catch (e) {
            console.error('Local storage set error:', e);
        }
    } else {
        await SecureStore.setItemAsync(key, value);
    }
};

export const getItem = async (key) => {
    if (isWeb) {
        try {
            if (typeof localStorage !== 'undefined') {
                return localStorage.getItem(key);
            }
            return null;
        } catch (e) {
            console.error('Local storage get error:', e);
            return null;
        }
    } else {
        return await SecureStore.getItemAsync(key);
    }
};

export const deleteItem = async (key) => {
    if (isWeb) {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(key);
            }
        } catch (e) {
            console.error('Local storage delete error:', e);
        }
    } else {
        await SecureStore.deleteItemAsync(key);
    }
};

export default {
    setItem,
    getItem,
    deleteItem,
};
