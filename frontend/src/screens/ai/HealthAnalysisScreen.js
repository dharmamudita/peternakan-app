/**
 * Health Analysis Screen
 * Layar untuk prediksi kesehatan hewan menggunakan Data Mining
 * Tema: Coklat (sesuai dengan tema aplikasi)
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { aiApi } from '../../services/api';

// Brown color palette
const COLORS = {
    primary: '#964b00',
    primaryDark: '#7c3f06',
    primaryLight: '#b87333',
    accent: '#5d3a1a',
    background: '#faf8f5',
    cardBg: '#fff9f0',
    text: '#3d2510',
    textLight: '#8b7355',
    border: '#e8ddd0',
    success: '#10b981',
    danger: '#dc2626',
};

const ANIMAL_TYPES = [
    { label: 'Sapi', value: 'sapi', icon: '🐄' },
    { label: 'Kambing', value: 'kambing', icon: '🐐' },
    { label: 'Ayam', value: 'ayam', icon: '🐔' },
];

const APPETITE_OPTIONS = [
    { label: 'Normal', value: 'normal' },
    { label: 'Sedikit Menurun', value: 'sedikit_menurun' },
    { label: 'Menurun', value: 'menurun' },
    { label: 'Tidak Mau Makan', value: 'tidak_mau' },
];

const ACTIVITY_OPTIONS = [
    { label: 'Aktif', value: 'aktif' },
    { label: 'Normal', value: 'normal' },
    { label: 'Lesu', value: 'lesu' },
    { label: 'Sangat Lesu', value: 'sangat_lesu' },
];

const HealthAnalysisScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        jenis_hewan: 'sapi',
        umur_bulan: '',
        berat_kg: '',
        suhu_celcius: '',
        nafsu_makan: 'normal',
        aktivitas: 'aktif',
        riwayat_sakit: 'tidak',
        vaksinasi_lengkap: 'ya',
    });

    const handleAnalyze = async () => {
        // Validate inputs
        if (!formData.umur_bulan || !formData.berat_kg || !formData.suhu_celcius) {
            Alert.alert('Data Tidak Lengkap', 'Mohon isi semua field yang diperlukan');
            return;
        }

        setLoading(true);
        try {
            const data = {
                ...formData,
                umur_bulan: parseInt(formData.umur_bulan),
                berat_kg: parseFloat(formData.berat_kg),
                suhu_celcius: parseFloat(formData.suhu_celcius),
            };

            const response = await aiApi.predictHealth(data);

            if (response.success) {
                navigation.navigate('AIResult', {
                    type: 'health',
                    result: response.data,
                });
            } else {
                Alert.alert('Error', response.error || 'Gagal melakukan analisis');
            }
        } catch (error) {
            Alert.alert('Error', error.message || 'Terjadi kesalahan saat menganalisis');
        } finally {
            setLoading(false);
        }
    };

    const renderOptionButtons = (options, selected, onSelect) => (
        <View style={styles.optionContainer}>
            {options.map((option) => (
                <TouchableOpacity
                    key={option.value}
                    style={[
                        styles.optionButton,
                        selected === option.value && styles.optionButtonActive,
                    ]}
                    onPress={() => onSelect(option.value)}
                >
                    <Text
                        style={[
                            styles.optionText,
                            selected === option.value && styles.optionTextActive,
                        ]}
                    >
                        {option.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Analisis Kesehatan</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Info Card */}
                <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.infoCard}
                >
                    <View style={styles.infoIconContainer}>
                        <Ionicons name="analytics" size={32} color="#fff" />
                    </View>
                    <Text style={styles.infoTitle}>Prediksi Kesehatan Hewan</Text>
                    <Text style={styles.infoText}>
                        Menggunakan teknologi Data Mining untuk menganalisis kondisi kesehatan hewan berdasarkan parameter yang dimasukkan
                    </Text>
                </LinearGradient>

                {/* Animal Type Selection */}
                <Text style={styles.sectionTitle}>Jenis Hewan</Text>
                <View style={styles.animalTypeContainer}>
                    {ANIMAL_TYPES.map((type) => (
                        <TouchableOpacity
                            key={type.value}
                            style={[
                                styles.animalTypeButton,
                                formData.jenis_hewan === type.value && styles.animalTypeButtonActive,
                            ]}
                            onPress={() => setFormData({ ...formData, jenis_hewan: type.value })}
                        >
                            <Text style={styles.animalIcon}>{type.icon}</Text>
                            <Text
                                style={[
                                    styles.animalTypeText,
                                    formData.jenis_hewan === type.value && styles.animalTypeTextActive,
                                ]}
                            >
                                {type.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Basic Information */}
                <Text style={styles.sectionTitle}>Informasi Dasar</Text>
                <View style={styles.inputGroup}>
                    <View style={styles.inputRow}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Umur (bulan)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="24"
                                placeholderTextColor={COLORS.textLight}
                                keyboardType="numeric"
                                value={formData.umur_bulan}
                                onChangeText={(value) => setFormData({ ...formData, umur_bulan: value })}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Berat (kg)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="350"
                                placeholderTextColor={COLORS.textLight}
                                keyboardType="numeric"
                                value={formData.berat_kg}
                                onChangeText={(value) => setFormData({ ...formData, berat_kg: value })}
                            />
                        </View>
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Suhu Tubuh (°C)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="38.5"
                            placeholderTextColor={COLORS.textLight}
                            keyboardType="numeric"
                            value={formData.suhu_celcius}
                            onChangeText={(value) => setFormData({ ...formData, suhu_celcius: value })}
                        />
                    </View>
                </View>

                {/* Appetite */}
                <Text style={styles.sectionTitle}>Nafsu Makan</Text>
                {renderOptionButtons(APPETITE_OPTIONS, formData.nafsu_makan, (value) =>
                    setFormData({ ...formData, nafsu_makan: value })
                )}

                {/* Activity */}
                <Text style={styles.sectionTitle}>Tingkat Aktivitas</Text>
                {renderOptionButtons(ACTIVITY_OPTIONS, formData.aktivitas, (value) =>
                    setFormData({ ...formData, aktivitas: value })
                )}

                {/* History & Vaccination */}
                <Text style={styles.sectionTitle}>Riwayat & Vaksinasi</Text>
                <View style={styles.toggleContainer}>
                    <View style={styles.toggleRow}>
                        <Text style={styles.toggleLabel}>Riwayat Sakit Sebelumnya</Text>
                        <View style={styles.toggleButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.toggleButton,
                                    formData.riwayat_sakit === 'tidak' && styles.toggleButtonActive,
                                ]}
                                onPress={() => setFormData({ ...formData, riwayat_sakit: 'tidak' })}
                            >
                                <Text style={[
                                    styles.toggleButtonText,
                                    formData.riwayat_sakit === 'tidak' && styles.toggleButtonTextActive,
                                ]}>Tidak</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.toggleButton,
                                    formData.riwayat_sakit === 'ya' && styles.toggleButtonActiveRed,
                                ]}
                                onPress={() => setFormData({ ...formData, riwayat_sakit: 'ya' })}
                            >
                                <Text style={[
                                    styles.toggleButtonText,
                                    formData.riwayat_sakit === 'ya' && styles.toggleButtonTextActive,
                                ]}>Ya</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.toggleRow}>
                        <Text style={styles.toggleLabel}>Vaksinasi Lengkap</Text>
                        <View style={styles.toggleButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.toggleButton,
                                    formData.vaksinasi_lengkap === 'ya' && styles.toggleButtonActive,
                                ]}
                                onPress={() => setFormData({ ...formData, vaksinasi_lengkap: 'ya' })}
                            >
                                <Text style={[
                                    styles.toggleButtonText,
                                    formData.vaksinasi_lengkap === 'ya' && styles.toggleButtonTextActive,
                                ]}>Ya</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.toggleButton,
                                    formData.vaksinasi_lengkap === 'tidak' && styles.toggleButtonActiveRed,
                                ]}
                                onPress={() => setFormData({ ...formData, vaksinasi_lengkap: 'tidak' })}
                            >
                                <Text style={[
                                    styles.toggleButtonText,
                                    formData.vaksinasi_lengkap === 'tidak' && styles.toggleButtonTextActive,
                                ]}>Tidak</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Analyze Button */}
                <TouchableOpacity
                    style={[styles.analyzeButton, loading && styles.analyzeButtonDisabled]}
                    onPress={handleAnalyze}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={loading ? ['#a19182', '#8b7d6b'] : [COLORS.primary, COLORS.primaryDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.analyzeButtonGradient}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="pulse" size={24} color="#fff" />
                                <Text style={styles.analyzeButtonText}>Analisis Kesehatan</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
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
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    infoCard: {
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
    },
    infoIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    infoTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 12,
        marginTop: 8,
    },
    animalTypeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    animalTypeButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 4,
        borderWidth: 2,
        borderColor: COLORS.border,
    },
    animalTypeButtonActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.cardBg,
    },
    animalIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    animalTypeText: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textLight,
    },
    animalTypeTextActive: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    inputGroup: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    inputContainer: {
        flex: 1,
        marginHorizontal: 4,
        marginBottom: 12,
    },
    inputLabel: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    optionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    optionButton: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    optionButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    optionText: {
        fontSize: 14,
        color: COLORS.textLight,
    },
    optionTextActive: {
        color: '#fff',
        fontWeight: '500',
    },
    toggleContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    toggleLabel: {
        fontSize: 14,
        color: COLORS.text,
        flex: 1,
    },
    toggleButtons: {
        flexDirection: 'row',
    },
    toggleButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: COLORS.cardBg,
        marginLeft: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    toggleButtonActive: {
        backgroundColor: COLORS.success,
        borderColor: COLORS.success,
    },
    toggleButtonActiveRed: {
        backgroundColor: COLORS.danger,
        borderColor: COLORS.danger,
    },
    toggleButtonText: {
        fontSize: 14,
        color: COLORS.textLight,
        fontWeight: '500',
    },
    toggleButtonTextActive: {
        color: '#fff',
    },
    analyzeButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    analyzeButtonGradient: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    analyzeButtonDisabled: {
        opacity: 0.7,
    },
    analyzeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    bottomPadding: {
        height: 40,
    },
});

export default HealthAnalysisScreen;
