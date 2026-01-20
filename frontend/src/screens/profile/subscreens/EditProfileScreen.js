import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';
import { uploadApi } from '../../../services/api';

const EditProfileScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user, updateUser } = useAuth();
    const [name, setName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Izin Diperlukan', 'Mohon izinkan akses galeri untuk mengganti foto profil.');
                }
            }
        })();
    }, []);

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled && result.assets[0].uri) {
                setSelectedImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Gagal memilih gambar');
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Nama tidak boleh kosong');
            return;
        }

        setLoading(true);
        try {
            let photoURL = user?.photoURL;

            // 1. Upload Foto jika ada
            if (selectedImage) {
                const formData = new FormData();
                const uri = selectedImage;
                const filename = uri.split('/').pop() || `profile_${Date.now()}.jpg`;

                let type = 'image/jpeg';
                if (filename.toLowerCase().endsWith('.png')) type = 'image/png';
                else if (filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg')) type = 'image/jpeg';

                // IMPORTANT: Backend expects field name 'file' (not 'image')
                if (Platform.OS === 'web') {
                    const response = await fetch(uri);
                    const blob = await response.blob();
                    formData.append('file', blob, filename);
                } else {
                    formData.append('file', {
                        uri,
                        name: filename,
                        type,
                    });
                }

                console.log('Uploading image...');
                const uploadRes = await uploadApi.uploadImage(formData);
                console.log('Upload success response:', uploadRes);

                // Parse response. uploadRes matches { success: true, data: { url: ... } }
                if (uploadRes?.data?.url) {
                    photoURL = uploadRes.data.url;
                } else if (uploadRes?.url) {
                    photoURL = uploadRes.url;
                } else {
                    console.warn('Could not find URL in upload response', uploadRes);
                }
            }

            // 2. Update Profile via Context
            const updateData = {
                displayName: name,
                photoURL: photoURL
            };

            console.log('Updating profile context with', updateData);

            const result = await updateUser(updateData);

            if (result.success) {
                Alert.alert('Sukses', 'Profil berhasil diperbarui.', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                throw new Error(result.error || 'Gagal update profil');
            }

        } catch (error) {
            console.error('Update profile error:', error);
            // Show more detailed error
            let errorMessage = error.message;
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            Alert.alert('Gagal', errorMessage || 'Terjadi kesalahan saat menyimpan');
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
                <Text style={styles.headerTitle}>Edit Profil</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={handlePickImage} style={styles.avatarContainer}>
                        {selectedImage ? (
                            <Image source={{ uri: selectedImage }} style={styles.avatar} />
                        ) : user?.photoURL ? (
                            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
                        ) : (
                            <Text style={styles.avatarText}>{name.charAt(0)?.toUpperCase() || 'U'}</Text>
                        )}
                        <View style={styles.cameraIcon}>
                            <Ionicons name="camera" size={16} color="white" />
                        </View>
                    </TouchableOpacity>
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
