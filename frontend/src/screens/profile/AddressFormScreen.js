import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SIZES } from '../../constants/theme';
import { addressApi } from '../../services/api';

const AddressFormScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const addressToEdit = route.params?.address;
    const isEdit = !!addressToEdit;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        label: 'Rumah',
        recipientName: '',
        phoneNumber: '',
        fullAddress: '',
        city: '',
        province: '',
        postalCode: '',
        note: '',
        isDefault: false,
    });

    useEffect(() => {
        if (isEdit) {
            setFormData({
                label: addressToEdit.label,
                recipientName: addressToEdit.recipientName,
                phoneNumber: addressToEdit.phoneNumber,
                fullAddress: addressToEdit.fullAddress,
                city: addressToEdit.city,
                province: addressToEdit.province,
                postalCode: addressToEdit.postalCode,
                note: addressToEdit.note || '',
                isDefault: addressToEdit.isDefault,
            });
        }
    }, [isEdit]);

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        // Validation
        if (!formData.recipientName || !formData.phoneNumber || !formData.fullAddress || !formData.city) {
            Alert.alert('Eror', 'Mohon lengkapi data wajib (*) wajb diisi.');
            return;
        }

        try {
            setLoading(true);
            if (isEdit) {
                await addressApi.update(addressToEdit.id, formData);
                Alert.alert('Sukses', 'Alamat berhasil diperbarui');
            } else {
                await addressApi.add(formData);
                Alert.alert('Sukses', 'Alamat baru berhasil ditambahkan');
            }
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Gagal', error.message || 'Terjadi kesalahan saat menyimpan alamat');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEdit ? 'Edit Alamat' : 'Tambah Alamat Baru'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Kontak</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nama Penerima *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Contoh: Budi Santoso"
                        value={formData.recipientName}
                        onChangeText={t => handleChange('recipientName', t)}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nomor Telepon *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Contoh: 08123456789"
                        keyboardType="phone-pad"
                        value={formData.phoneNumber}
                        onChangeText={t => handleChange('phoneNumber', t)}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Label Alamat</Text>
                    <View style={styles.labelOptions}>
                        {['Rumah', 'Kantor', 'Gudang'].map(l => (
                            <TouchableOpacity
                                key={l}
                                style={[styles.chip, formData.label === l && styles.chipActive]}
                                onPress={() => handleChange('label', l)}
                            >
                                <Text style={[styles.chipText, formData.label === l && styles.chipTextActive]}>{l}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Detail Lokasi</Text>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Provinsi</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Jawa Barat"
                            value={formData.province}
                            onChangeText={t => handleChange('province', t)}
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Kota/Kabupaten *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Bandung"
                            value={formData.city}
                            onChangeText={t => handleChange('city', t)}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Kode Pos</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="40115"
                        keyboardType="number-pad"
                        value={formData.postalCode}
                        onChangeText={t => handleChange('postalCode', t)}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Alamat Lengkap *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Nama Jalan, No Rumah, RT/RW, Kelurahan, Kecamatan"
                        multiline
                        textAlignVertical="top"
                        value={formData.fullAddress}
                        onChangeText={t => handleChange('fullAddress', t)}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Catatan (Opsional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Warna pagar, patokan, dll."
                        value={formData.note}
                        onChangeText={t => handleChange('note', t)}
                    />
                </View>

                {!isEdit && (
                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Jadikan Alamat Utama</Text>
                        <Switch
                            value={formData.isDefault}
                            onValueChange={v => handleChange('isDefault', v)}
                            trackColor={{ true: COLORS.primary, false: '#e5e7eb' }}
                        />
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.saveBtnText}>Simpan Alamat</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    formContent: { padding: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '500', color: '#4b5563', marginBottom: 6 },
    input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827', backgroundColor: '#fafafa' },
    textArea: { height: 100 },
    row: { flexDirection: 'row', gap: 12 },
    labelOptions: { flexDirection: 'row', gap: 8 },
    chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#ffffff' },
    chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    chipText: { fontSize: 14, color: '#6b7280' },
    chipTextActive: { color: '#ffffff', fontWeight: '600' },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 24, padding: 16, backgroundColor: '#f9fafb', borderRadius: 12 },
    switchLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
    saveBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 24, ...SHADOWS.medium },
    saveBtnDisabled: { opacity: 0.7 },
    saveBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});

export default AddressFormScreen;
