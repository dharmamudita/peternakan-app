/**
 * Login Screen
 * Screen login dengan animasi menarik
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeInDown,
    FadeInUp,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, SIZES, SHADOWS } from '../../constants/theme';
import { Button, Input } from '../../components/common';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useGoogleAuth, processGoogleAuthResponse } from '../../services/googleAuth';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Google Auth Hook
    const { request, response, promptAsync, loading: googleAuthLoading } = useGoogleAuth();

    // Handle Google Auth Response
    useEffect(() => {
        if (response) {
            handleGoogleResponse(response);
        }
    }, [response]);

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
            Alert.alert(
                'Konfigurasi Diperlukan',
                'Google Sign-In belum dikonfigurasi. Silakan isi Google Client ID di file firebase.js',
                [{ text: 'OK' }]
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
                // Handle different response structures (just in case)
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
        <View style={styles.container}>
            <LinearGradient
                colors={GRADIENTS.light}
                style={StyleSheet.absoluteFill}
            />

            {/* Decorative circles */}
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />

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
                                colors={GRADIENTS.primary}
                                style={styles.logoGradient}
                            >
                                <Text style={styles.logoEmoji}>🐄</Text>
                            </LinearGradient>
                        </View>
                        <Text style={styles.title}>Selamat Datang!</Text>
                        <Text style={styles.subtitle}>Masuk ke akun Anda</Text>
                    </Animated.View>

                    {/* Form */}
                    <Animated.View
                        entering={FadeInDown.duration(600).delay(300)}
                        style={styles.form}
                    >
                        {errors.general && (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                                <Text style={styles.errorText}>{errors.general}</Text>
                            </View>
                        )}

                        <Input
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Masukkan email"
                            keyboardType="email-address"
                            error={errors.email}
                            leftIcon={<Ionicons name="mail-outline" size={20} color={COLORS.gray} />}
                        />

                        <Input
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Masukkan password"
                            secureTextEntry
                            error={errors.password}
                            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} />}
                        />

                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>Lupa Password?</Text>
                        </TouchableOpacity>

                        <Button
                            title="Masuk"
                            onPress={handleLogin}
                            loading={loading}
                            fullWidth
                            size="large"
                            style={styles.loginButton}
                        />

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>atau</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Login */}
                        <View style={styles.socialButtons}>
                            <TouchableOpacity
                                style={[styles.googleButton, (googleLoading || googleAuthLoading) && styles.disabledButton]}
                                onPress={handleGoogleLogin}
                                disabled={googleLoading || googleAuthLoading}
                            >
                                {googleLoading ? (
                                    <Text style={styles.googleButtonText}>Loading...</Text>
                                ) : (
                                    <>
                                        <View style={styles.googleIconContainer}>
                                            <Text style={styles.googleIcon}>G</Text>
                                        </View>
                                        <Text style={styles.googleButtonText}>Masuk dengan Google</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    {/* Footer */}
                    <Animated.View
                        entering={FadeInUp.duration(600).delay(500)}
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
        backgroundColor: COLORS.background,
    },
    circle: {
        position: 'absolute',
        borderRadius: 1000,
        backgroundColor: COLORS.primary,
        opacity: 0.1,
    },
    circle1: {
        width: width * 0.8,
        height: width * 0.8,
        top: -width * 0.4,
        right: -width * 0.2,
    },
    circle2: {
        width: width * 0.6,
        height: width * 0.6,
        bottom: -width * 0.2,
        left: -width * 0.3,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: SIZES.paddingLarge,
        paddingTop: 80,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        marginBottom: 24,
    },
    logoGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.large,
    },
    logoEmoji: {
        fontSize: 40,
    },
    title: {
        fontSize: SIZES.h1,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: SIZES.body,
        color: COLORS.textLight,
    },
    form: {
        marginBottom: 24,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.error + '10',
        padding: 12,
        borderRadius: SIZES.radius,
        marginBottom: 16,
        gap: 8,
    },
    errorText: {
        color: COLORS.error,
        fontSize: SIZES.bodySmall,
        flex: 1,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: COLORS.primary,
        fontSize: SIZES.bodySmall,
        fontWeight: '600',
    },
    loginButton: {
        marginBottom: 24,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.lightGray,
    },
    dividerText: {
        color: COLORS.textMuted,
        paddingHorizontal: 16,
        fontSize: SIZES.bodySmall,
    },
    socialButtons: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: SIZES.radius,
        width: '100%',
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        ...SHADOWS.small,
    },
    googleIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    googleIcon: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4285F4',
    },
    googleButtonText: {
        fontSize: SIZES.body,
        fontWeight: '600',
        color: COLORS.text,
    },
    disabledButton: {
        opacity: 0.6,
    },
    socialButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.small,
    },
    socialIcon: {
        fontSize: 24,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: COLORS.textLight,
        fontSize: SIZES.body,
    },
    footerLink: {
        color: COLORS.primary,
        fontSize: SIZES.body,
        fontWeight: '700',
    },
});

export default LoginScreen;
