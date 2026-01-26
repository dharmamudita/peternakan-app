import React, { useState, useEffect } from 'react';
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
    KeyboardAvoidingView,
    Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SHADOWS, SIZES } from '../../constants/theme';
import { shopApi, uploadApi } from '../../services/api';

const SellerRegistrationScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [form, setForm] = useState({
        name: '',
        description: '',
        address: '',
        phoneNumber: '',
        nik: '',
    });
    const [ktpImage, setKtpImage] = useState(null);
    const [ktpImageUrl, setKtpImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadingKtp, setUploadingKtp] = useState(false);

    useEffect(() => {
        checkExistingShop();
    }, []);

    const checkExistingShop = async () => {
        try {
            setLoading(true);
            const res = await shopApi.getMyShop();
            if (res.data) {
                if (Platform.OS === 'web') {
                    if (confirm('Anda sudah terdaftar sebagai penjual. Masuk ke Dashboard?')) {
                        navigation.replace('SellerDashboard');
                    } else {
                        navigation.goBack();
                    }
                } else {
                    Alert.alert(
                        'Info',
                        'Anda sudah terdaftar sebagai penjual.',
                        [
                            { text: 'Kembali', onPress: () => navigation.goBack() },
                            { text: 'Ke Dashboard', onPress: () => navigation.replace('SellerDashboard') }
                        ]
                    );
                }
            }
        } catch (error) {
            // Jika error 404/null berarti belum punya toko, aman untuk lanjut daftar
            console.log('User belum punya toko, silakan daftar.');
        } finally {
            setLoading(false);
        }
    };

    const pickKtpImage = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Izin Ditolak', 'Izin akses galeri diperlukan untuk mengupload foto KTP');
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [16, 10], // KTP aspect ratio
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                const selectedImage = result.assets[0];
                setKtpImage(selectedImage);

                // Upload the image
                await uploadKtpImage(selectedImage);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Gagal memilih gambar');
        }
    };

    const takeKtpPhoto = async () => {
        try {
            // Request camera permission
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Izin Ditolak', 'Izin akses kamera diperlukan untuk mengambil foto KTP');
                return;
            }

            // Launch camera
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [16, 10],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                const selectedImage = result.assets[0];
                setKtpImage(selectedImage);

                // Upload the image
                await uploadKtpImage(selectedImage);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Gagal mengambil foto');
        }
    };

    const uploadKtpImage = async (image) => {
        setUploadingKtp(true);
        try {
            const formData = new FormData();

            if (Platform.OS === 'web') {
                // For web, fetch the blob from the URI
                const response = await fetch(image.uri);
                const blob = await response.blob();
                const filename = `ktp_${Date.now()}.jpg`;
                formData.append('file', blob, filename);
            } else {
                // For mobile
                const uri = image.uri;
                const filename = uri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                formData.append('file', {
                    uri: uri,
                    name: filename || 'ktp.jpg',
                    type: type,
                });
            }
            formData.append('folder', 'ktp');

            const uploadResponse = await uploadApi.uploadImage(formData);
            if (uploadResponse.data && uploadResponse.data.url) {
                setKtpImageUrl(uploadResponse.data.url);
                Alert.alert('Berhasil', 'Foto KTP berhasil diupload');
            } else if (uploadResponse.url) {
                // Handle if response is directly the data
                setKtpImageUrl(uploadResponse.url);
                Alert.alert('Berhasil', 'Foto KTP berhasil diupload');
            }
        } catch (error) {
            console.error('Error uploading KTP:', error);
            Alert.alert('Gagal', 'Gagal mengupload foto KTP. Silakan coba lagi.');
            setKtpImage(null);
        } finally {
            setUploadingKtp(false);
        }
    };

    const showImageOptions = () => {
        if (Platform.OS === 'web') {
            pickKtpImage();
        } else {
            Alert.alert(
                'Upload Foto KTP',
                'Pilih sumber foto',
                [
                    { text: 'Kamera', onPress: takeKtpPhoto },
                    { text: 'Galeri', onPress: pickKtpImage },
                    { text: 'Batal', style: 'cancel' }
                ]
            );
        }
    };

    const handleSubmit = async () => {
        if (!form.name || !form.address || !form.phoneNumber || !form.nik) {
            Alert.alert('Error', 'Mohon lengkapi semua data wajib (Nama, Alamat, No HP, NIK)');
            return;
        }

        if (!ktpImageUrl) {
            Alert.alert('Error', 'Foto KTP wajib diupload untuk verifikasi identitas');
            return;
        }

        if (form.nik.length !== 16) {
            Alert.alert('Error', 'NIK harus terdiri dari 16 digit');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...form,
                ktpImageUrl
            };
            console.log('[SellerRegistration] Submitting payload:', payload);

            await shopApi.register(payload);
            Alert.alert(
                'Berhasil',
                'Pendaftaran toko berhasil dikirim! Mohon tunggu verifikasi admin.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error('[SellerRegistration] Submit error:', error);
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
                                placeholder="Nomor Induk Kependudukan (16 digit)"
                                placeholderTextColor="#9ca3af"
                                keyboardType="numeric"
                                maxLength={16}
                                value={form.nik}
                                onChangeText={(text) => setForm({ ...form, nik: text.replace(/[^0-9]/g, '') })}
                            />
                            <Text style={styles.helperText}>NIK terdiri dari 16 digit angka</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Foto KTP <Text style={styles.required}>*</Text></Text>
                            <Text style={styles.helperText}>Upload foto KTP yang jelas untuk verifikasi identitas</Text>

                            <TouchableOpacity
                                style={styles.ktpUploadContainer}
                                onPress={showImageOptions}
                                disabled={uploadingKtp}
                            >
                                {uploadingKtp ? (
                                    <View style={styles.ktpUploadPlaceholder}>
                                        <ActivityIndicator size="large" color={COLORS.primary} />
                                        <Text style={styles.ktpUploadText}>Mengupload...</Text>
                                    </View>
                                ) : ktpImage ? (
                                    <View style={styles.ktpPreviewContainer}>
                                        <Image
                                            source={{ uri: ktpImage.uri }}
                                            style={styles.ktpPreview}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.ktpOverlay}>
                                            <View style={styles.ktpStatusBadge}>
                                                {ktpImageUrl ? (
                                                    <>
                                                        <Ionicons name="checkmark-circle" size={16} color="#15803d" />
                                                        <Text style={styles.ktpStatusText}>Terupload</Text>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Ionicons name="time" size={16} color="#ea580c" />
                                                        <Text style={[styles.ktpStatusText, { color: '#ea580c' }]}>Menunggu</Text>
                                                    </>
                                                )}
                                            </View>
                                            <TouchableOpacity
                                                style={styles.ktpChangeButton}
                                                onPress={showImageOptions}
                                            >
                                                <Ionicons name="camera" size={16} color="#fff" />
                                                <Text style={styles.ktpChangeText}>Ganti</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ) : (
                                    <View style={styles.ktpUploadPlaceholder}>
                                        <View style={styles.ktpIconContainer}>
                                            <Ionicons name="card-outline" size={40} color={COLORS.primary} />
                                        </View>
                                        <Text style={styles.ktpUploadTitle}>Upload Foto KTP</Text>
                                        <Text style={styles.ktpUploadText}>Ketuk untuk memilih dari galeri atau ambil foto</Text>
                                        <View style={styles.ktpUploadHint}>
                                            <Ionicons name="information-circle-outline" size={14} color="#9ca3af" />
                                            <Text style={styles.ktpHintText}>Pastikan foto jelas dan tidak blur</Text>
                                        </View>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.primary} />
                        <View style={styles.infoBoxContent}>
                            <Text style={styles.infoBoxTitle}>Data Aman</Text>
                            <Text style={styles.infoBoxText}>
                                Data KTP Anda hanya digunakan untuk verifikasi identitas dan dijaga kerahasiaannya.
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, (loading || uploadingKtp) && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading || uploadingKtp}
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
        ...(Platform.OS === 'web' ? {} : { flex: 1 }),
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
    // KTP Upload Styles
    ktpUploadContainer: {
        marginTop: 12,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
    },
    ktpUploadPlaceholder: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ktpIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: `${COLORS.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    ktpUploadTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    ktpUploadText: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
    },
    ktpUploadHint: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        gap: 6,
    },
    ktpHintText: {
        fontSize: 12,
        color: '#9ca3af',
    },
    ktpPreviewContainer: {
        position: 'relative',
        aspectRatio: 16 / 10,
    },
    ktpPreview: {
        width: '100%',
        height: '100%',
    },
    ktpOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    ktpStatusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    ktpStatusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#15803d',
    },
    ktpChangeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 4,
    },
    ktpChangeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    // Info Box
    infoBox: {
        flexDirection: 'row',
        backgroundColor: `${COLORS.primary}10`,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        gap: 12,
        alignItems: 'flex-start',
    },
    infoBoxContent: {
        flex: 1,
    },
    infoBoxTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
        marginBottom: 4,
    },
    infoBoxText: {
        fontSize: 13,
        color: '#6b7280',
        lineHeight: 20,
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
