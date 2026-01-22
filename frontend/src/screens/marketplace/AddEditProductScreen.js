import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    Platform,
    ActivityIndicator,
    Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SHADOWS, SIZES } from '../../constants/theme';
import { productApi, uploadApi } from '../../services/api';

const CATEGORIES = [
    { id: 'sapi', name: 'Sapi' },
    { id: 'kambing', name: 'Kambing' },
    { id: 'domba', name: 'Domba' },
    { id: 'ayam', name: 'Ayam' },
    { id: 'pakan', name: 'Pakan Ternak' },
    { id: 'obat', name: 'Obat & Vitamin' },
    { id: 'alat', name: 'Alat Peternakan' },
];

const AddEditProductScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { mode = 'add', product } = route.params || {};

    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        weight: '',
        age: '',
        unit: 'ekor', // default unit
        categoryId: 'sapi',
        condition: 'new',
        images: [], // Array of objects { uri, type, name } or URL strings
    });

    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        if (mode === 'edit' && product) {
            setForm({
                name: product.name,
                description: product.description,
                price: product.price.toString(),
                stock: product.stock.toString(),
                weight: product.weight ? product.weight.toString() : '',
                age: product.specifications?.age || '',
                unit: product.unit || 'ekor',
                categoryId: product.category || 'sapi',
                condition: product.condition || 'new',
                images: product.images || [],
            });
        }
    }, [mode, product]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            if (form.images.length >= 5) {
                Alert.alert('Batas Maksimum', 'Anda hanya dapat mengunggah maksimal 5 gambar.');
                return;
            }
            setForm({ ...form, images: [...form.images, asset] });
        }
    };

    const removeImage = (index) => {
        const newImages = [...form.images];
        newImages.splice(index, 1);
        setForm({ ...form, images: newImages });
    };

    const validate = () => {
        if (!form.name.trim()) { Alert.alert('Error', 'Nama produk wajib diisi'); return false; }
        if (!form.price.trim()) { Alert.alert('Error', 'Harga wajib diisi'); return false; }
        if (!form.stock.trim()) { Alert.alert('Error', 'Stok wajib diisi'); return false; }
        if (form.images.length === 0) { Alert.alert('Error', 'Minimal upload 1 gambar produk'); return false; }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);

        try {
            // 1. Upload Images First (if any are local URIs)
            const imageUrls = [];
            for (const img of form.images) {
                if (img.uri && !img.uri.startsWith('http')) {
                    const formData = new FormData();
                    if (Platform.OS === 'web') {
                        const response = await fetch(img.uri);
                        const blob = await response.blob();
                        formData.append('file', blob, 'upload.jpg');
                    } else {
                        formData.append('file', {
                            uri: img.uri,
                            name: 'upload.jpg',
                            type: 'image/jpeg',
                        });
                    }

                    const uploadRes = await uploadApi.uploadImage(formData);
                    if (uploadRes.data && uploadRes.data.url) {
                        imageUrls.push(uploadRes.data.url);
                    } else {
                        throw new Error('Gagal mengupload gambar');
                    }
                } else {
                    imageUrls.push(img.uri || img);
                }
            }

            // 2. Prepare Product Data
            const productData = {
                ...form,
                price: parseInt(form.price),
                stock: parseInt(form.stock),
                weight: form.weight ? parseInt(form.weight) : 0,
                specifications: {
                    age: form.age
                },
                images: imageUrls,
                category: form.categoryId
            };

            // 3. Call Create or Update API
            if (mode === 'edit') {
                await productApi.update(product.id, productData);
            } else {
                await productApi.create(productData);
            }

            // Show Success Modal
            setShowSuccessModal(true);

            // Auto navigate back after 2 seconds
            setTimeout(() => {
                setShowSuccessModal(false);
                navigation.goBack();
            }, 2000);

        } catch (error) {
            console.error('Submit Product Error:', error);
            if (error.message && (error.message.includes('500') || error.message.includes('bucket') || error.message.includes('Upload'))) {
                Alert.alert(
                    'Gagal Upload',
                    'Terjadi kesalahan konfigurasi server. \n\nMOHON RESTART TERMINAL BACKEND:\n1. Buka terminal backend\n2. Tekan Ctrl+C\n3. Jalankan "npm run dev" lagi.'
                );
            } else {
                Alert.alert('Gagal', error.message || 'Terjadi kesalahan saat menyimpan produk');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.mainContainer}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{mode === 'edit' ? 'Edit Produk' : 'Tambah Produk'}</Text>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSubmit} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveButtonText}>Simpan</Text>}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content Form Scroll - Web Safe */}
            <ScrollView
                style={styles.contentScroll}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Image Upload Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Foto Produk ({form.images.length}/5)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                        {/* Add Button */}
                        {form.images.length < 5 && (
                            <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
                                <Ionicons name="camera-outline" size={28} color="#964b00" />
                                <Text style={styles.addImageText}>Tambah</Text>
                            </TouchableOpacity>
                        )}

                        {/* Image List */}
                        {form.images.map((img, index) => (
                            <View key={index} style={styles.imagePreview}>
                                <Image source={{ uri: img.uri || img }} style={styles.thumbImage} />
                                <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                                    <Ionicons name="close" size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Info Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Informasi Produk</Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Nama Produk</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Contoh: Sapi Limosin Jantan Bobot 500kg"
                            value={form.name}
                            onChangeText={(text) => setForm({ ...form, name: text })}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Deskripsi</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Jelaskan detail produk, kondisi, umur, dll..."
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            value={form.description}
                            onChangeText={(text) => setForm({ ...form, description: text })}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Kategori</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                            {CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryChip,
                                        form.categoryId === cat.id && styles.categoryChipActive
                                    ]}
                                    onPress={() => setForm({ ...form, categoryId: cat.id })}
                                >
                                    <Text style={[
                                        styles.categoryText,
                                        form.categoryId === cat.id && styles.categoryTextActive
                                    ]}>{cat.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Weight and Age */}
                    <View style={styles.row}>
                        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>Bobot (Kg)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                keyboardType="numeric"
                                value={form.weight}
                                onChangeText={(text) => setForm({ ...form, weight: text.replace(/[^0-9]/g, '') })}
                            />
                        </View>
                        <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Umur (Bln/Thn)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Contoh: 2 Tahun"
                                value={form.age}
                                onChangeText={(text) => setForm({ ...form, age: text })}
                            />
                        </View>
                    </View>
                </View>

                {/* Price & Stock Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Harga & Stok</Text>

                    <View style={styles.row}>
                        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>Harga (Rp)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                keyboardType="numeric"
                                value={form.price}
                                onChangeText={(text) => setForm({ ...form, price: text.replace(/[^0-9]/g, '') })}
                            />
                        </View>
                        <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Satuan</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ekor/Kg/Pcs"
                                value={form.unit}
                                onChangeText={(text) => setForm({ ...form, unit: text })}
                            />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Stok Tersedia</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0"
                            keyboardType="numeric"
                            value={form.stock}
                            onChangeText={(text) => setForm({ ...form, stock: text.replace(/[^0-9]/g, '') })}
                        />
                    </View>
                </View>

                {/* Bottom Spacer */}
                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Success Modal */}
            <Modal
                transparent={true}
                visible={showSuccessModal}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIconCircle}>
                            <Ionicons name="checkmark" size={36} color="#22c55e" />
                        </View>
                        <Text style={styles.modalTitle}>Berhasil!</Text>
                        <Text style={styles.modalMessage}>
                            {mode === 'edit' ? 'Produk berhasil diperbarui.' : 'Produk berhasil ditambahkan ke toko Anda.'}
                        </Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#f9fafb',
        ...(Platform.OS === 'web' ? { flex: 0, height: 'auto', minHeight: '100vh' } : {})
    },
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        zIndex: 10,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 44,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    saveButton: {
        backgroundColor: '#964b00',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        minWidth: 80,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    contentScroll: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        ...SHADOWS.small,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    imageScroll: {
        flexDirection: 'row',
    },
    addImageBtn: {
        width: 100,
        height: 100,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#964b00',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff7ed',
        marginRight: 12,
    },
    addImageText: {
        color: '#964b00',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
    imagePreview: {
        width: 100,
        height: 100,
        borderRadius: 12,
        marginRight: 12,
        position: 'relative',
    },
    thumbImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    removeImageBtn: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#ef4444',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#111827',
    },
    textArea: {
        minHeight: 100,
    },
    row: {
        flexDirection: 'row',
    },
    categoryScroll: {
        flexDirection: 'row',
        marginTop: 4,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    categoryChipActive: {
        backgroundColor: '#964b00',
        borderColor: '#964b00',
    },
    categoryText: {
        fontSize: 13,
        color: '#4b5563',
        fontWeight: '500',
    },
    categoryTextActive: {
        color: '#ffffff',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        width: '70%',
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    modalIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#dcfce7',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 8,
    },
    modalMessage: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
    },
});

export default AddEditProductScreen;
