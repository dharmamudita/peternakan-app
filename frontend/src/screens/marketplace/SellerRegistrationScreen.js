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
    Image,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SIZES } from '../../constants/theme';
import { shopApi } from '../../services/api';

const SellerRegistrationScreen = ({ navigation }) => {
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
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Daftar Penjual</Text>
            </View>

            <View style={styles.content}>
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
                            value={form.name}
                            onChangeText={(text) => setForm({ ...form, name: text })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Deskripsi Singkat</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Jelaskan apa yang Anda jual..."
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
            </View>
        </ScrollView>
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
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    content: {
        padding: 20,
    },
    illustrationContainer: {
        alignItems: 'center',
        marginBottom: 30,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        ...SHADOWS.small,
    },
    illustrationTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 12,
        marginBottom: 8,
        color: COLORS.primary,
    },
    illustrationText: {
        textAlign: 'center',
        color: COLORS.gray,
        fontSize: 14,
        lineHeight: 20,
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
        color: 'red',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: COLORS.text,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    helperText: {
        fontSize: 12,
        color: COLORS.gray,
        marginTop: 4,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 40,
        ...SHADOWS.medium,
    },
    submitButtonDisabled: {
        backgroundColor: COLORS.gray,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SellerRegistrationScreen;
