/**
 * Auth Context
 * Context untuk manajemen autentikasi
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { STORAGE_KEYS } from '../constants';
import * as storage from '../utils/storage';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check for existing token on app start
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
            if (token) {
                const response = await authApi.getProfile();
                if (response.success) {
                    setUser(response.data);
                    setIsAuthenticated(true);
                }
            }
        } catch (error) {
            console.log('Auth check failed:', error.message);
            await logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (token, userData) => {
        try {
            await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
            await storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
            setUser(userData);
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authApi.register(userData);
            if (response.success) {
                return { success: true, data: response.data };
            }
            return { success: false, error: response.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await storage.deleteItem(STORAGE_KEYS.AUTH_TOKEN);
            await storage.deleteItem(STORAGE_KEYS.USER_DATA);
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.log('Logout error:', error);
        }
    };

    const updateUser = async (userData) => {
        try {
            console.log('[AuthContext] Calling updateProfile API with:', userData);
            const response = await authApi.updateProfile(userData);
            console.log('[AuthContext] API Response:', response);

            if (response.success) {
                console.log('[AuthContext] Update successful, setting user:', response.data);
                setUser(response.data);
                await storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
                return { success: true };
            }
            console.log('[AuthContext] Update failed, response.success is false');
            return { success: false, error: response.message };
        } catch (error) {
            console.error('[AuthContext] Update error:', error);
            return { success: false, error: error.message };
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
