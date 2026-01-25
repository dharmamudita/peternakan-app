import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    SafeAreaView,
    ActivityIndicator,
    ScrollView,
    Dimensions,
    Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_URL } from '../../services/api';

const { width } = Dimensions.get('window');

// Direct connection to ML Service (Python)
// Backend Main (Node) tidak mem-proxy rute ini, jadi kita tembak langsung.
const ML_API_URL = 'http://localhost:5001/api';

const COLORS = {
    primary: '#964b00',
    primaryDark: '#5d2f00',
    primaryLight: '#b87333',
    background: '#f8f5f2',
    surface: '#ffffff',
    text: '#4a3728',
    textLight: '#8c7b70',
    border: '#e6dace',
    success: '#10b981',
    error: '#ef4444'
};

const DiseaseScanScreen = ({ navigation }) => {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Izin Diperlukan', 'Aplikasi membutuhkan izin untuk mengakses galeri');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                base64: true,
                presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
            });

            if (!result.canceled && result.assets[0]) {
                setImage(result.assets[0]);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Gagal membuka galeri: ' + error.message);
        }
    };

    const handleAnalyze = async () => {
        if (!image) {
            Alert.alert('Error', 'Silakan pilih gambar terlebih dahulu');
            return;
        }

        console.log('Starting analysis...');
        setLoading(true);
        try {
            // SOLUSI UNTUK WEB: Gunakan Base64 JSON
            // FormData di Web JS sering bermasalah mengubah URI blobl menjadi File
            // Backend Python kita sudah support input JSON Base64, jadi kita pakai itu saja.

            let imageBase64 = image.base64;

            // Pastikan format base64 header ada (atau tidak, tergantung backend.
            // Backend disease_detector.py decode menggunakan:
            // if isinstance(image_data, str) and ',' in image_data:
            //    image_data = image_data.split(',')[1]
            // Jadi kita kirim lengkap dengan prefix data:image biar aman.

            if (!imageBase64.startsWith('data:image')) {
                imageBase64 = `data:image/jpeg;base64,${imageBase64}`;
            }

            console.log('Sending JSON Base64 request to Python Service...');

            // GUNAKAN 127.0.0.1 dan PORT 5001 SECARA EKSPLISIT
            const response = await axios.post('http://127.0.0.1:5001/api/predict/disease',
                {
                    image: imageBase64
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 30000,
                }
            );

            console.log('Response received:', response.status);
            console.log('Data RAW:', JSON.stringify(response.data).substring(0, 200) + '...'); // Log first 200 chars

            // Cek berbagai kemungkinan format response
            // Kadang response.data langsung isinya, kadang terbungkus 'data' lagi
            const data = response.data;
            const isSuccess = data.success === true || data.success === 'true' || (data.prediction && data.prediction.confidence);

            if (isSuccess) {
                console.log('Navigating to Result with data keys:', Object.keys(data));

                // Pastikan navigasi berjalan di Next Tick agar UI tidak freeze
                setTimeout(() => {
                    navigation.navigate('AIResult', {
                        result: data,
                        type: 'disease',
                        imageUri: image.uri
                    });
                }, 100);
            } else {
                console.warn('Success flag missing or false');
                Alert.alert('Gagal', 'Respons server tidak valid: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('FULL ERROR:', error);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', JSON.stringify(error.response.data));
                Alert.alert('Server Error', `Error ${error.response.status}`);
            } else if (error.request) {
                console.error('No Response');
                Alert.alert('Koneksi Gagal', 'Tidak dapat menghubungi http://127.0.0.1:5001. Cek terminal python.');
            } else {
                Alert.alert('Error', error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Scan Penyakit</Text>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.content}
            >
                <View style={styles.bannerContainer}>
                    <LinearGradient
                        colors={[COLORS.primaryLight, COLORS.primaryDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.banner}
                    >
                        <MaterialCommunityIcons name="line-scan" size={40} color="#fff" />
                        <Text style={styles.bannerTitle}>Deteksi Penyakit Visual</Text>
                        <Text style={styles.bannerSubtitle}>
                            Analisis luka, penyakit kulit, atau infeksi mata pada hewan ternak menggunakan AI.
                        </Text>
                    </LinearGradient>
                </View>

                <View style={styles.uploadContainer}>
                    <View style={styles.imagePreviewContainer}>
                        {image ? (
                            <Image source={{ uri: image.uri }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.placeholderContainer}>
                                <Ionicons name="image-outline" size={60} color={COLORS.textLight} />
                                <Text style={styles.placeholderText}>
                                    Pilih foto hewan yang ingin diperiksa
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.uploadButton}
                            onPress={pickImage}
                        >
                            <Ionicons name="images" size={24} color="#fff" style={styles.btnIcon} />
                            <Text style={styles.btnText}>Pilih Foto dari Galeri</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.tipsContainer}>
                    <Text style={styles.tipsTitle}>Tips untuk hasil terbaik:</Text>
                    <View style={styles.tipItem}>
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                        <Text style={styles.tipText}>Pastikan area luka/sakit terlihat jelas</Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                        <Text style={styles.tipText}>Gunakan pencahayaan yang cukup</Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Ionicons name="information-circle" size={20} color={COLORS.primaryLight} />
                        <Text style={styles.tipText}>Hanya deteksi penyakit fisik (kulit/mata/luka)</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.analyzeButton, (!image || loading) && styles.disabledButton]}
                    onPress={handleAnalyze}
                    disabled={!image || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="search" size={24} color="#fff" style={styles.btnIcon} />
                            <Text style={styles.analyzeBtnText}>Analisis Gambar</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        ...(Platform.OS === 'web' ? { flex: 0, height: 'auto', minHeight: '100vh' } : {})
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        padding: 5,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    content: {
        padding: 20,
    },
    bannerContainer: {
        marginBottom: 25,
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    banner: {
        padding: 20,
        alignItems: 'center',
    },
    bannerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
    },
    bannerSubtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    uploadContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    imagePreviewContainer: {
        width: '100%',
        height: 250,
        borderRadius: 10,
        backgroundColor: '#f0e6dd',
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderContainer: {
        alignItems: 'center',
        padding: 20,
    },
    placeholderText: {
        color: COLORS.textLight,
        fontSize: 14,
        marginTop: 10,
        textAlign: 'center',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryLight,
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        elevation: 2,
    },
    btnIcon: {
        marginRight: 10,
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    tipsContainer: {
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    tipText: {
        fontSize: 13,
        color: COLORS.textLight,
        marginLeft: 10,
        flex: 1,
    },
    footer: {
        padding: 20,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    analyzeButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 30,
        elevation: 3,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    disabledButton: {
        backgroundColor: '#ccc',
        elevation: 0,
        shadowOpacity: 0,
    },
    analyzeBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default DiseaseScanScreen;
