import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SIZES } from '../../constants/theme';
import { shopApi } from '../../services/api';

const SellerRegistrationScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [form, setForm] = useState({
        name: '',
        description: '',
        address: '',
        phoneNumber: '',
        nik: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!form.name || !form.address || !form.phoneNumber || !form.nik) {
            Alert.alert('Error', 'Mohon lengkapi semua data wajib (Nama, Alamat, No HP, NIK)');
            return;
        }

        setLoading(true);
        try {
            await shopApi.register(form);
            Alert.alert(
                'Berhasil',
                'Pendaftaran toko berhasil dikirim! Mohon tunggu verifikasi admin.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            Alert.alert('Gagal', error.message || 'Terjadi kesalahan saat mendaftar toko');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.mainContainer}>
            {/* Fixed Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Daftar Penjual</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Scrollable Content */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={true}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.illustrationContainer}>
                        <Ionicons name="storefront-outline" size={80} color={COLORS.primary} />
                        <Text style={styles.illustrationTitle}>Data Toko</Text>
                        <Text style={styles.illustrationText}>
                            Lengkapi profil toko Anda untuk mulai berjualan. Data ini akan diverifikasi oleh Admin.
                        </Text>
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Informasi Toko</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nama Toko <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Contoh: Peternakan Maju Jaya"
                                placeholderTextColor="#9ca3af"
                                value={form.name}
                                onChangeText={(text) => setForm({ ...form, name: text })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Deskripsi Singkat</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Jelaskan apa yang Anda jual..."
                                placeholderTextColor="#9ca3af"
                                multiline
                                numberOfLines={3}
                                value={form.description}
                                onChangeText={(text) => setForm({ ...form, description: text })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Alamat Lengkap <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Alamat lokasi peternakan/toko"
                                placeholderTextColor="#9ca3af"
                                multiline
                                numberOfLines={3}
                                value={form.address}
                                onChangeText={(text) => setForm({ ...form, address: text })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nomor WhatsApp <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="08xxxxxxxxxx"
                                placeholderTextColor="#9ca3af"
                                keyboardType="phone-pad"
                                value={form.phoneNumber}
                                onChangeText={(text) => setForm({ ...form, phoneNumber: text })}
                            />
                        </View>
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Verifikasi Identitas</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>NIK (KTP) <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nomor Induk Kependudukan"
                                placeholderTextColor="#9ca3af"
                                keyboardType="numeric"
                                value={form.nik}
                                onChangeText={(text) => setForm({ ...form, nik: text.replace(/[^0-9]/g, '') })}
                            />
                            <Text style={styles.helperText}>Digunakan untuk validasi keamanan.</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Kirim Pendaftaran</Text>
                        )}
                    </TouchableOpacity>

                    {/* Bottom spacer for scroll */}
                    <View style={{ height: 60 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        ...(Platform.OS === 'web' ? { flex: 0, height: 'auto', minHeight: '100vh' } : {})
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    illustrationContainer: {
        alignItems: 'center',
        marginBottom: 30,
        padding: 24,
        backgroundColor: '#fff',
        borderRadius: 16,
        ...SHADOWS.small,
    },
    illustrationTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
        color: COLORS.primary,
    },
    illustrationText: {
        textAlign: 'center',
        color: '#6b7280',
        fontSize: 14,
        lineHeight: 22,
    },
    formSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
        color: COLORS.text,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
        color: COLORS.text,
        fontWeight: '500',
    },
    required: {
        color: '#ef4444',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: COLORS.text,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    helperText: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 6,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        ...SHADOWS.medium,
    },
    submitButtonDisabled: {
        backgroundColor: '#9ca3af',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SellerRegistrationScreen;
