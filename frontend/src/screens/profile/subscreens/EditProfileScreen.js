import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';
// import { userApi } from '../../../services/api'; // Pastikan ada API update user

const EditProfileScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const [name, setName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Nama tidak boleh kosong');
            return;
        }

        // Logika update nanti di sini
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            Alert.alert('Sukses', 'Profil berhasil diperbarui (Simulasi)');
            navigation.goBack();
        }, 1500);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profil</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        {user?.photoURL ? (
                            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
                        ) : (
                            <Text style={styles.avatarText}>{name.charAt(0)?.toUpperCase() || 'U'}</Text>
                        )}
                        <TouchableOpacity style={styles.cameraIcon}>
                            <Ionicons name="camera" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nama Lengkap</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Nama Lengkap"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            value={email}
                            editable={false}
                            placeholder="Email"
                        />
                        <Text style={styles.helperText}>Email tidak dapat diubah</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
                    )}
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
    avatarSection: { alignItems: 'center', marginBottom: 30 },
    avatarContainer: {
        width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primary + '20',
        alignItems: 'center', justifyContent: 'center', position: 'relative'
    },
    avatar: { width: 100, height: 100, borderRadius: 50 },
    avatarText: { fontSize: 40, fontWeight: '700', color: COLORS.primary },
    cameraIcon: {
        position: 'absolute', bottom: 0, right: 0,
        backgroundColor: COLORS.primary, padding: 8, borderRadius: 20,
        borderWidth: 2, borderColor: 'white'
    },
    form: { marginBottom: 30 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    input: {
        borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12,
        padding: 14, fontSize: 16, color: '#111827', backgroundColor: '#f9fafb'
    },
    disabledInput: { backgroundColor: '#f3f4f6', color: '#9ca3af' },
    helperText: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
    saveBtn: {
        backgroundColor: COLORS.primary, borderRadius: 14, padding: 16,
        alignItems: 'center', ...SHADOWS.medium
    },
    saveBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});

export default EditProfileScreen;
