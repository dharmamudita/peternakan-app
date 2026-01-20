/**
 * Login Screen
 * Halaman login dengan tema putih + coklat
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Alert,
    TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    FadeInDown,
    FadeInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useGoogleAuth, processGoogleAuthResponse } from '../../services/googleAuth';
import { useFacebookAuth, processFacebookAuthResponse } from '../../services/facebookAuth';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [facebookLoading, setFacebookLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Google Auth Hook
    const { request, response, promptAsync, loading: googleAuthLoading } = useGoogleAuth();

    // Facebook Auth Hook
    const { request: fbRequest, response: fbResponse, promptAsync: fbPromptAsync, loading: facebookAuthLoading } = useFacebookAuth();

    // Helper untuk Alert yang support Web & Mobile
    const showAlert = (title, message) => {
        if (Platform.OS === 'web') {
            window.alert(`${title}\n\n${message}`);
        } else {
            Alert.alert(title, message);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            showAlert('Email Diperlukan', 'Silakan masukkan alamat email Anda di kolom email di atas, lalu tekan "Lupa Password?" lagi.');
            setErrors({ ...errors, email: 'Masukkan email untuk reset password' });
            return;
        }

        try {
            setLoading(true);
            await authApi.forgotPassword(email);
            showAlert(
                'Email Terkirim',
                `Link reset password telah dikirim ke ${email}. Silakan cek inbox atau folder spam Anda.`
            );
            setErrors({});
        } catch (error) {
            console.error('Forgot password error:', error);
            const errorMessage = error.message || 'Gagal mengirim email reset password';
            showAlert('Gagal', errorMessage);
            setErrors({ general: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    // Handle Google Auth Response
    useEffect(() => {
        if (response) {
            handleGoogleResponse(response);
        }
    }, [response]);

    // Handle Facebook Auth Response
    useEffect(() => {
        if (fbResponse) {
            handleFacebookResponse(fbResponse);
        }
    }, [fbResponse]);

    const handleGoogleResponse = async (response) => {
        if (response?.type === 'success') {
            setGoogleLoading(true);
            setErrors({});

            try {
                const result = await processGoogleAuthResponse(response);

                if (result && (result.success || result.token)) {
                    const token = result.token || result.data?.token;
                    const user = result.user || result.data?.user;

                    if (token && user) {
                        await login(token, user);
                        navigation.replace('MainTabs');
                        return;
                    }
                }

                throw new Error('Gagal login dengan Google');
            } catch (error) {
                console.error('Google login error:', error);
                setErrors({ general: error.message || 'Gagal login dengan Google' });
            } finally {
                setGoogleLoading(false);
            }
        } else if (response?.type === 'cancel') {
            // User cancelled, no error needed
        } else if (response?.type === 'error') {
            setErrors({ general: response.error?.message || 'Terjadi kesalahan saat login Google' });
        }
    };

    const handleGoogleLogin = async () => {
        if (!request) {
            showAlert(
                'Konfigurasi Diperlukan',
                'Google Sign-In belum dikonfigurasi. Silakan isi Google Client ID di file firebase.js'
            );
            return;
        }

        try {
            await promptAsync();
        } catch (error) {
            console.error('Google prompt error:', error);
            setErrors({ general: 'Gagal membuka Google Sign-In' });
        }
    };

    const handleFacebookResponse = async (response) => {
        if (response?.type === 'success') {
            setFacebookLoading(true);
            setErrors({});

            try {
                const result = await processFacebookAuthResponse(response);

                if (result && (result.success || result.token)) {
                    const token = result.token || result.data?.token;
                    const user = result.user || result.data?.user;

                    if (token && user) {
                        await login(token, user);
                        navigation.replace('MainTabs');
                        return;
                    }
                }

                throw new Error('Gagal login dengan Facebook');
            } catch (error) {
                console.error('Facebook login error:', error);
                setErrors({ general: error.message || 'Gagal login dengan Facebook' });
            } finally {
                setFacebookLoading(false);
            }
        } else if (response?.type === 'cancel') {
            // User cancelled, no error needed
        } else if (response?.type === 'error') {
            setErrors({ general: response.error?.message || 'Terjadi kesalahan saat login Facebook' });
        }
    };

    const handleFacebookLogin = async () => {
        // Khusus Web: Gunakan Popup flow
        if (Platform.OS === 'web') {
            try {
                setFacebookLoading(true);
                const { loginWithFacebookPopup } = require('../../services/facebookAuth');
                const result = await loginWithFacebookPopup();

                if (result && (result.success || result.token)) {
                    const token = result.token || result.data?.token;
                    const user = result.user || result.data?.user;

                    if (token && user) {
                        await login(token, user);
                        navigation.replace('MainTabs');
                    }
                }
            } catch (error) {
                console.error('Facebook popup error:', error);
                setErrors({ general: error.message || 'Gagal login dengan Facebook' });
            } finally {
                setFacebookLoading(false);
            }
            return;
        }

        // Native (Android/iOS): Gunakan Expo Auth Session
        if (!fbRequest) {
            showAlert(
                'Konfigurasi Diperlukan',
                'Facebook Sign-In belum dikonfigurasi. Silakan isi Facebook App ID di file firebase.js'
            );
            return;
        }

        try {
            await fbPromptAsync();
        } catch (error) {
            console.error('Facebook prompt error:', error);
            setErrors({ general: 'Gagal membuka Facebook Sign-In' });
        }
    };

    const handleLogin = async () => {
        // Validate
        const newErrors = {};
        if (!email) newErrors.email = 'Email wajib diisi';
        if (!password) newErrors.password = 'Password wajib diisi';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await authApi.login({ email, password });

            if (response.success || response.token) {
                const token = response.token || response.data?.token;
                const user = response.user || response.data?.user;

                if (token && user) {
                    await login(token, user);
                    navigation.replace('MainTabs');
                    return;
                }
            }

            throw new Error(response.message || 'Login gagal. Silakan periksa email dan password Anda.');
        } catch (error) {
            console.error('Login error:', error);
            setErrors({ general: error.message || 'Gagal terhubung ke server' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Background */}
            <View style={styles.backgroundContainer}>
                <View style={[styles.decorCircle, styles.decorCircle1]} />
                <View style={[styles.decorCircle, styles.decorCircle2]} />
                <View style={[styles.decorCircle, styles.decorCircle3]} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <Animated.View
                        entering={FadeInUp.duration(600).delay(100)}
                        style={styles.header}
                    >
                        <View style={styles.logoContainer}>
                            <LinearGradient
                                colors={['#964b00', '#7c3f06']}
                                style={styles.logoGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.logoEmoji}>🐄</Text>
                            </LinearGradient>
                        </View>
                        <Text style={styles.welcomeText}>Selamat Datang!</Text>
                        <Text style={styles.subtitleText}>Masuk ke akun Peternakan App</Text>
                    </Animated.View>

                    {/* Form Card */}
                    <Animated.View
                        entering={FadeInDown.duration(600).delay(200)}
                        style={styles.formCard}
                    >
                        {errors.general && (
                            <View style={styles.errorBanner}>
                                <Ionicons name="alert-circle" size={18} color="#dc2626" />
                                <Text style={styles.errorBannerText}>{errors.general}</Text>
                            </View>
                        )}

                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                                <Ionicons name="mail-outline" size={20} color="#9ca3af" />
                                <TextInput
                                    style={styles.textInput}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="nama@email.com"
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Password</Text>
                            <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                                <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" />
                                <TextInput
                                    style={styles.textInput}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Masukkan password"
                                    placeholderTextColor="#9ca3af"
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color="#9ca3af"
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                        </View>

                        {/* Forgot Password */}
                        <TouchableOpacity
                            style={styles.forgotButton}
                            onPress={handleForgotPassword}
                            disabled={loading}
                        >
                            <Text style={styles.forgotText}>Lupa Password?</Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.loginButton, loading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={['#964b00', '#7c3f06']}
                                style={styles.loginButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {loading ? (
                                    <Text style={styles.loginButtonText}>Memproses...</Text>
                                ) : (
                                    <>
                                        <Text style={styles.loginButtonText}>Masuk</Text>
                                        <View style={styles.loginButtonIcon}>
                                            <Ionicons name="arrow-forward" size={18} color="#964b00" />
                                        </View>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>atau lanjutkan dengan</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Login */}
                        <View style={styles.socialRow}>
                            <TouchableOpacity
                                style={[styles.socialButton, (googleLoading || googleAuthLoading) && styles.buttonDisabled]}
                                onPress={handleGoogleLogin}
                                disabled={googleLoading || googleAuthLoading}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.googleIcon}>G</Text>
                                <Text style={styles.socialButtonText}>Google</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.socialButton, (facebookLoading || facebookAuthLoading) && styles.buttonDisabled]}
                                onPress={handleFacebookLogin}
                                disabled={facebookLoading || facebookAuthLoading}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="logo-facebook" size={20} color="#1877F2" />
                                <Text style={styles.socialButtonText}>Facebook</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    {/* Footer */}
                    <Animated.View
                        entering={FadeInUp.duration(600).delay(400)}
                        style={styles.footer}
                    >
                        <Text style={styles.footerText}>Belum punya akun? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.footerLink}>Daftar Sekarang</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    backgroundContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    decorCircle: {
        position: 'absolute',
        borderRadius: 1000,
    },
    decorCircle1: {
        width: width * 0.7,
        height: width * 0.7,
        top: -width * 0.35,
        right: -width * 0.2,
        backgroundColor: '#964b00',
        opacity: 0.04,
    },
    decorCircle2: {
        width: width * 0.5,
        height: width * 0.5,
        bottom: -width * 0.2,
        left: -width * 0.2,
        backgroundColor: '#7c3f06',
        opacity: 0.03,
    },
    decorCircle3: {
        width: width * 0.3,
        height: width * 0.3,
        top: height * 0.4,
        right: -width * 0.1,
        backgroundColor: '#964b00',
        opacity: 0.02,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: SIZES.padding,
        paddingTop: 40,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        marginBottom: 20,
        ...SHADOWS.large,
    },
    logoGradient: {
        width: 90,
        height: 90,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoEmoji: {
        fontSize: 48,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    subtitleText: {
        fontSize: 15,
        color: '#6b7280',
    },
    formCard: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#f0ebe3',
        ...SHADOWS.medium,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef2f2',
        padding: 14,
        borderRadius: 14,
        marginBottom: 20,
        gap: 10,
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    errorBannerText: {
        color: '#dc2626',
        fontSize: 13,
        flex: 1,
        fontWeight: '500',
    },
    inputGroup: {
        marginBottom: 18,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#faf8f5',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#f0ebe3',
        gap: 12,
    },
    inputError: {
        borderColor: '#dc2626',
        backgroundColor: '#fef2f2',
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
    },
    errorText: {
        color: '#dc2626',
        fontSize: 12,
        marginTop: 6,
    },
    forgotButton: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotText: {
        color: '#964b00',
        fontSize: 13,
        fontWeight: '600',
    },
    loginButton: {
        marginBottom: 24,
        ...SHADOWS.medium,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    loginButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 14,
        gap: 10,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    loginButtonIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#f0ebe3',
    },
    dividerText: {
        color: '#9ca3af',
        paddingHorizontal: 14,
        fontSize: 13,
    },
    socialRow: {
        flexDirection: 'row',
        gap: 12,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#faf8f5',
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#f0ebe3',
    },
    googleIcon: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ea4335',
    },
    socialButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: '#6b7280',
        fontSize: 14,
    },
    footerLink: {
        color: '#964b00',
        fontSize: 14,
        fontWeight: '700',
    },
});

export default LoginScreen;
