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
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, SIZES, SHADOWS } from '../../constants/theme';
import { Button, Input } from '../../components/common';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const SellerRegistrationScreen = ({ navigation }) => {
    const { user, checkAuth } = useAuth(); // checkAuth untuk refresh user role nanti
    const [step, setStep] = useState(1);
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const showAlert = (title, message) => {
        if (Platform.OS === 'web') {
            window.alert(`${title}\n\n${message}`);
        } else {
            Alert.alert(title, message);
        }
    };

    const handleRequestOtp = async () => {
        if (!password) {
            setError('Silakan masukkan password akun Anda untuk konfirmasi.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await authApi.requestSellerOtp(password);
            showAlert('Kode Terkirim', 'Kode OTP 4 digit telah dikirim ke email Anda (Lihat Terminal Backend).');
            setStep(2);
        } catch (err) {
            setError(err.message || 'Gagal memproses permintaan.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 4) {
            setError('Masukkan 4 digit kode OTP yang benar.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await authApi.verifySellerOtp(otp);

            // Refresh User Data (Sync Role change)
            await checkAuth();

            showAlert('Selamat!', 'Anda sekarang terdaftar sebagai Penjual.');

            // Navigate ke Seller Dashboard
            // Karena belum ada route khusus, kita replace ke Profile atau Halaman Toko nantinya
            // Untuk sekarang reset ke MainTabs dulu, lalu idealnya Profil berubah tampilan
            navigation.navigate('MainTabs', { screen: 'ProfileTab' });
        } catch (err) {
            setError(err.message || 'Verifikasi gagal. Cek kembali kode OTP Anda.');
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

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Daftar Penjual</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <View style={styles.card}>
                        <View style={styles.iconContainer}>
                            <LinearGradient
                                colors={GRADIENTS.primary}
                                style={styles.iconBackground}
                            >
                                <Ionicons name="storefront" size={40} color={COLORS.white} />
                            </LinearGradient>
                        </View>

                        <Text style={styles.title}>Mulai Berjualan!</Text>
                        <Text style={styles.subtitle}>
                            {step === 1
                                ? 'Konfirmasi identitas Anda untuk mengaktifkan fitur Toko.'
                                : 'Masukkan kode verifikasi yang telah dikirim.'}
                        </Text>

                        {error ? (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        {step === 1 ? (
                            <>
                                <View style={styles.infoRow}>
                                    <Ionicons name="person" size={20} color={COLORS.primary} />
                                    <Text style={styles.infoText}>{user?.email}</Text>
                                </View>

                                <Input
                                    label="Konfirmasi Password"
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Masukkan password akun Anda"
                                    secureTextEntry
                                    leftIcon={<Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} />}
                                />

                                <Button
                                    title="Kirim Kode Verifikasi"
                                    onPress={handleRequestOtp}
                                    loading={loading}
                                    fullWidth
                                    style={styles.button}
                                />
                            </>
                        ) : (
                            <>
                                <Input
                                    label="Kode OTP (4 Digit)"
                                    value={otp}
                                    onChangeText={setOtp}
                                    placeholder="Contoh: 1234"
                                    keyboardType="numeric"
                                    maxLength={4}
                                    leftIcon={<Ionicons name="key-outline" size={20} color={COLORS.gray} />}
                                    style={{ textAlign: 'center', letterSpacing: 5, fontSize: 24, fontWeight: 'bold' }}
                                />

                                <Button
                                    title="Verifikasi & Aktifkan Toko"
                                    onPress={handleVerifyOtp}
                                    loading={loading}
                                    fullWidth
                                    style={styles.button}
                                />

                                <TouchableOpacity
                                    onPress={() => setStep(1)}
                                    style={styles.resendLink}
                                    disabled={loading}
                                >
                                    <Text style={styles.resendText}>Kirim Ulang Kode</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.small,
    },
    headerTitle: {
        fontSize: SIZES.large,
        fontWeight: '700',
        color: COLORS.text,
        marginLeft: 16,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: SIZES.padding,
        justifyContent: 'center',
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius * 2,
        padding: SIZES.paddingLarge,
        ...SHADOWS.medium,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 24,
    },
    iconBackground: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.large,
    },
    title: {
        fontSize: SIZES.h2,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: SIZES.body,
        color: COLORS.textLight,
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary + '10',
        padding: 12,
        borderRadius: SIZES.radius,
        marginBottom: 24,
        width: '100%',
        justifyContent: 'center',
        gap: 8,
    },
    infoText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: SIZES.body,
    },
    button: {
        marginTop: 16,
    },
    resendLink: {
        marginTop: 24,
        padding: 8,
    },
    resendText: {
        color: COLORS.textLight,
        fontSize: SIZES.bodySmall,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.error + '10',
        padding: 12,
        borderRadius: SIZES.radius,
        marginBottom: 16,
        width: '100%',
        gap: 8,
    },
    errorText: {
        color: COLORS.error,
        fontSize: SIZES.bodySmall,
        flex: 1,
    },
});

export default SellerRegistrationScreen;
