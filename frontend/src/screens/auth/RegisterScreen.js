/**
 * Register Screen
 * Screen registrasi dengan animasi
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
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeInDown,
    FadeInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, SIZES, SHADOWS } from '../../constants/theme';
import { Button, Input } from '../../components/common';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [acceptTerms, setAcceptTerms] = useState(false);

    const { register } = useAuth();

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.displayName) {
            newErrors.displayName = 'Nama wajib diisi';
        }

        if (!formData.email) {
            newErrors.email = 'Email wajib diisi';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Format email tidak valid';
        }

        if (!formData.phoneNumber) {
            newErrors.phoneNumber = 'Nomor telepon wajib diisi';
        }

        if (!formData.password) {
            newErrors.password = 'Password wajib diisi';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password minimal 6 karakter';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Password tidak cocok';
        }

        if (!acceptTerms) {
            newErrors.terms = 'Anda harus menyetujui syarat dan ketentuan';
        }

        return newErrors;
    };

    const handleRegister = async () => {
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await register(formData);

            if (response.success) {
                // Di React Native Web, Alert mungkin standard browser alert
                if (Platform.OS === 'web') {
                    window.alert('Registrasi berhasil! Silakan login.');
                    navigation.replace('Login');
                } else {
                    Alert.alert(
                        'Registrasi Berhasil',
                        'Akun Anda telah dibuat. Silakan login untuk melanjutkan.',
                        [{ text: 'OK', onPress: () => navigation.replace('Login') }]
                    );
                }
            } else {
                throw new Error(response.error || 'Gagal membuat akun');
            }
        } catch (error) {
            console.error('Register error:', error);
            setErrors({ general: error.message || 'Terjadi kesalahan saat registrasi' });
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
                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={28} color={COLORS.text} />
                    </TouchableOpacity>

                    {/* Header */}
                    <Animated.View
                        entering={FadeInUp.duration(600).delay(100)}
                        style={styles.header}
                    >
                        <Text style={styles.title}>Buat Akun Baru</Text>
                        <Text style={styles.subtitle}>Daftar untuk memulai</Text>
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
                            label="Nama Lengkap"
                            value={formData.displayName}
                            onChangeText={(value) => handleChange('displayName', value)}
                            placeholder="Masukkan nama lengkap"
                            error={errors.displayName}
                            leftIcon={<Ionicons name="person-outline" size={20} color={COLORS.gray} />}
                        />

                        <Input
                            label="Email"
                            value={formData.email}
                            onChangeText={(value) => handleChange('email', value)}
                            placeholder="Masukkan email"
                            keyboardType="email-address"
                            error={errors.email}
                            leftIcon={<Ionicons name="mail-outline" size={20} color={COLORS.gray} />}
                        />

                        <Input
                            label="Nomor Telepon"
                            value={formData.phoneNumber}
                            onChangeText={(value) => handleChange('phoneNumber', value)}
                            placeholder="Masukkan nomor telepon"
                            keyboardType="phone-pad"
                            error={errors.phoneNumber}
                            leftIcon={<Ionicons name="call-outline" size={20} color={COLORS.gray} />}
                        />

                        <Input
                            label="Password"
                            value={formData.password}
                            onChangeText={(value) => handleChange('password', value)}
                            placeholder="Minimal 6 karakter"
                            secureTextEntry
                            error={errors.password}
                            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} />}
                        />

                        <Input
                            label="Konfirmasi Password"
                            value={formData.confirmPassword}
                            onChangeText={(value) => handleChange('confirmPassword', value)}
                            placeholder="Masukkan ulang password"
                            secureTextEntry
                            error={errors.confirmPassword}
                            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} />}
                        />

                        {/* Terms */}
                        <TouchableOpacity
                            style={styles.termsContainer}
                            onPress={() => setAcceptTerms(!acceptTerms)}
                        >
                            <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                                {acceptTerms && (
                                    <Ionicons name="checkmark" size={16} color={COLORS.white} />
                                )}
                            </View>
                            <Text style={styles.termsText}>
                                Saya menyetujui{' '}
                                <Text style={styles.termsLink}>Syarat & Ketentuan</Text>
                                {' '}dan{' '}
                                <Text style={styles.termsLink}>Kebijakan Privasi</Text>
                            </Text>
                        </TouchableOpacity>
                        {errors.terms && <Text style={styles.errorTextSmall}>{errors.terms}</Text>}

                        <Button
                            title="Daftar"
                            onPress={handleRegister}
                            loading={loading}
                            fullWidth
                            size="large"
                            style={styles.registerButton}
                        />
                    </Animated.View>

                    {/* Footer */}
                    <Animated.View
                        entering={FadeInUp.duration(600).delay(500)}
                        style={styles.footer}
                    >
                        <Text style={styles.footerText}>Sudah punya akun? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.footerLink}>Masuk</Text>
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
        paddingTop: 60,
        paddingBottom: 40,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        ...SHADOWS.small,
    },
    header: {
        marginBottom: 32,
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
    errorTextSmall: {
        color: COLORS.error,
        fontSize: SIZES.caption,
        marginTop: -8,
        marginBottom: 16,
        marginLeft: 4,
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 24,
        gap: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: COLORS.primary,
    },
    termsText: {
        flex: 1,
        fontSize: SIZES.bodySmall,
        color: COLORS.textLight,
        lineHeight: 22,
    },
    termsLink: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    registerButton: {
        marginBottom: 24,
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

export default RegisterScreen;
