import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../../constants/theme';
import { authApi } from '../../../services/api';

const ChangePasswordScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

    const toggleShow = (field) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleChange = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            if (Platform.OS === 'web') window.alert('Mohon isi semua kolom');
            else Alert.alert('Error', 'Mohon isi semua kolom');
            return;
        }
        if (newPassword !== confirmPassword) {
            if (Platform.OS === 'web') window.alert('Konfirmasi password tidak cocok');
            else Alert.alert('Error', 'Konfirmasi password tidak cocok');
            return;
        }
        if (newPassword.length < 6) {
            if (Platform.OS === 'web') window.alert('Password baru minimal 6 karakter');
            else Alert.alert('Error', 'Password baru minimal 6 karakter');
            return;
        }

        setLoading(true);
        try {
            const response = await authApi.changePassword(currentPassword, newPassword);

            if (response.success) {
                if (Platform.OS === 'web') {
                    window.alert('✅ Password berhasil diubah');
                    navigation.goBack();
                } else {
                    Alert.alert('Sukses', 'Password berhasil diubah', [
                        { text: 'OK', onPress: () => navigation.goBack() }
                    ]);
                }
            } else {
                throw new Error(response.message || 'Gagal mengubah password');
            }
        } catch (error) {
            console.error('Change password error:', error);
            const msg = error.response?.data?.message || error.message || 'Terjadi kesalahan saat mengubah password';
            if (Platform.OS === 'web') {
                window.alert(`❌ ${msg}`);
            } else {
                Alert.alert('Gagal', msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (label, value, onChange, fieldKey, placeholder) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    placeholder={placeholder}
                    secureTextEntry={!showPassword[fieldKey]}
                />
                <TouchableOpacity onPress={() => toggleShow(fieldKey)} style={styles.eyeIcon}>
                    <Ionicons name={showPassword[fieldKey] ? "eye-off-outline" : "eye-outline"} size={20} color="#6b7280" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ubah Password</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                {renderInput('Password Lama', currentPassword, setCurrentPassword, 'current', 'Msukkan password lama')}
                {renderInput('Password Baru', newPassword, setNewPassword, 'new', 'Masukkan password baru')}
                {renderInput('Konfirmasi Password', confirmPassword, setConfirmPassword, 'confirm', 'Ulangi password baru')}

                <TouchableOpacity style={styles.saveBtn} onPress={handleChange} disabled={loading}>
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>Simpan Password</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#ffffff',
    },
    backBtn: { padding: 8, marginLeft: -8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    content: { padding: 20 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12,
        backgroundColor: '#f9fafb'
    },
    input: {
        flex: 1, padding: 14, fontSize: 16, color: '#111827'
    },
    eyeIcon: { padding: 14 },
    saveBtn: {
        backgroundColor: COLORS.primary, borderRadius: 14, padding: 16,
        alignItems: 'center', marginTop: 10, ...SHADOWS.medium
    },
    saveBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});

export default ChangePasswordScreen;
