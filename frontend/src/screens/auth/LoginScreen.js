/**
 * Login Screen
 * Screen login dengan animasi menarik
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Dimensions,
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
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

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
            // TODO: Integrate with Firebase Auth
            // For now, simulate login
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock successful login
            const mockToken = 'mock-token-123';
            const mockUser = {
                id: '1',
                email,
                displayName: 'User Demo',
                role: 'farmer',
            };

            await login(mockToken, mockUser);
            navigation.replace('MainTabs');
        } catch (error) {
            setErrors({ general: error.message });
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
                            <TouchableOpacity style={styles.socialButton}>
                                <Text style={styles.socialIcon}>🇬</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                                <Ionicons name="logo-apple" size={24} color={COLORS.text} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                                <Ionicons name="logo-facebook" size={24} color="#1877F2" />
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
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
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
