/**
 * AI Result Screen
 * Layar untuk menampilkan hasil analisis AI
 * Tema: Coklat (sesuai dengan tema aplikasi)
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

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
    warning: '#f59e0b',
    danger: '#dc2626',
};

const AIResultScreen = ({ route, navigation }) => {
    const { type, result, imageUri } = route.params;

    const isHealthResult = type === 'health';

    const renderHealthResult = () => {
        const data = result.data || result;

        return (
            <>
                {/* Status Card */}
                <View style={[styles.statusCard, { backgroundColor: (data.color || (data.status.includes('Sakit') ? '#dc2626' : '#10b981')) + '15' }]}>
                    <View style={[styles.statusBadge, { backgroundColor: data.color || (data.status.includes('Sakit') ? '#dc2626' : '#10b981') }]}>
                        <Text style={styles.statusBadgeText}>{data.status}</Text>
                    </View>
                    <Text style={styles.confidenceText}>
                        Tingkat Keyakinan: {data.confidence}%
                    </Text>
                    <View style={styles.riskScoreContainer}>
                        <Text style={styles.riskScoreLabel}>Skor Risiko</Text>
                        <View style={styles.riskScoreBar}>
                            <View
                                style={[
                                    styles.riskScoreFill,
                                    {
                                        width: `${(data.risk_score || (data.status.includes('Sehat') ? 1 : 8)) * 10}%`,
                                        backgroundColor: data.color || (data.status.includes('Sakit') ? '#dc2626' : '#10b981'),
                                    },
                                ]}
                            />
                        </View>
                        <Text style={[styles.riskScoreValue, { color: data.color || (data.status.includes('Sakit') ? '#dc2626' : '#10b981') }]}>
                            {data.risk_score || (data.status.includes('Sehat') ? 1 : 8)}/10
                        </Text>
                    </View>
                </View>

                {/* Input Summary */}
                {data.input_summary && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Ringkasan Input</Text>
                        <View style={styles.summaryGrid}>
                            <View style={styles.summaryItem}>
                                <Ionicons name="paw" size={20} color={COLORS.primary} />
                                <Text style={styles.summaryLabel}>Jenis</Text>
                                <Text style={styles.summaryValue}>{data.input_summary.jenis_hewan}</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Ionicons name="calendar" size={20} color={COLORS.primary} />
                                <Text style={styles.summaryLabel}>Umur</Text>
                                <Text style={styles.summaryValue}>{data.input_summary.umur}</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Ionicons name="barbell" size={20} color={COLORS.primary} />
                                <Text style={styles.summaryLabel}>Berat</Text>
                                <Text style={styles.summaryValue}>{data.input_summary.berat}</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Ionicons name="thermometer" size={20} color={COLORS.primary} />
                                <Text style={styles.summaryLabel}>Suhu</Text>
                                <Text style={styles.summaryValue}>{data.input_summary.suhu}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Risk Factors */}
                {data.risk_factors && data.risk_factors.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Faktor Risiko</Text>
                        {data.risk_factors.map((factor, index) => (
                            <View key={index} style={styles.riskFactorItem}>
                                <Ionicons name="warning" size={18} color={COLORS.warning} />
                                <Text style={styles.riskFactorText}>{factor}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Recommendations */}
                {data.recommendations && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Rekomendasi</Text>
                        {data.recommendations.map((rec, index) => (
                            <View key={index} style={styles.recommendationItem}>
                                <LinearGradient
                                    colors={[COLORS.primary, COLORS.primaryDark]}
                                    style={styles.recommendationNumber}
                                >
                                    <Text style={styles.recommendationNumberText}>{index + 1}</Text>
                                </LinearGradient>
                                <Text style={styles.recommendationText}>{rec}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </>
        );
    };

    const renderDiseaseResult = () => {
        const { prediction, details, all_predictions, disclaimer, note } = result;

        return (
            <>
                {/* Image Preview */}
                {imageUri && (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: imageUri }} style={styles.resultImage} />
                    </View>
                )}

                {/* Status Card */}
                <View style={[styles.statusCard, { backgroundColor: prediction.color + '15' }]}>
                    <View style={[styles.statusBadge, { backgroundColor: prediction.color }]}>
                        <Text style={styles.statusBadgeText}>{prediction.name}</Text>
                    </View>
                    <Text style={styles.confidenceText}>
                        Tingkat Keyakinan: {prediction.confidence}%
                    </Text>
                    {prediction.severity !== 'none' && (
                        <View style={[styles.severityBadge, { borderColor: prediction.color }]}>
                            <Text style={[styles.severityText, { color: prediction.color }]}>
                                Tingkat Keparahan: {prediction.severity === 'high' ? 'Tinggi' : 'Sedang'}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Description */}
                {details && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Deskripsi</Text>
                        <Text style={styles.descriptionText}>{details.description}</Text>
                    </View>
                )}

                {/* Symptoms */}
                {details?.symptoms && details.symptoms.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Gejala yang Mungkin</Text>
                        {details.symptoms.map((symptom, index) => (
                            <View key={index} style={styles.symptomItem}>
                                <Ionicons name="medical" size={18} color={COLORS.danger} />
                                <Text style={styles.symptomText}>{symptom}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Treatment */}
                {details?.treatment && details.treatment.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Penanganan</Text>
                        {details.treatment.map((treatment, index) => (
                            <View key={index} style={styles.recommendationItem}>
                                <View style={[styles.recommendationNumber, { backgroundColor: COLORS.success }]}>
                                    <Text style={styles.recommendationNumberText}>{index + 1}</Text>
                                </View>
                                <Text style={styles.recommendationText}>{treatment}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Prevention */}
                {details?.prevention && details.prevention.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Pencegahan</Text>
                        {details.prevention.map((prev, index) => (
                            <View key={index} style={styles.preventionItem}>
                                <Ionicons name="shield-checkmark" size={18} color={COLORS.primary} />
                                <Text style={styles.preventionText}>{prev}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Other Predictions */}
                {all_predictions && all_predictions.length > 1 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Kemungkinan Lain</Text>
                        {all_predictions.slice(1).map((pred, index) => (
                            <View key={index} style={styles.otherPredictionItem}>
                                <Text style={styles.otherPredictionName}>{pred.name}</Text>
                                <View style={styles.otherPredictionBar}>
                                    <View
                                        style={[
                                            styles.otherPredictionFill,
                                            { width: `${pred.probability}%` },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.otherPredictionProb}>{pred.probability}%</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Disclaimer */}
                <View style={styles.disclaimerCard}>
                    <Ionicons name="information-circle" size={24} color={COLORS.textLight} />
                    <Text style={styles.disclaimerText}>{disclaimer}</Text>
                    {note && <Text style={styles.noteText}>{note}</Text>}
                </View>
            </>
        );
    };

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
                <Text style={styles.headerTitle}>
                    {isHealthResult ? 'Hasil Analisis Kesehatan' : 'Hasil Deteksi Penyakit'}
                </Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {isHealthResult ? renderHealthResult() : renderDiseaseResult()}

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="refresh" size={20} color={COLORS.primary} />
                        <Text style={styles.actionButtonText}>Analisis Ulang</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButtonPrimary}
                        onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
                    >
                        <LinearGradient
                            colors={[COLORS.primary, COLORS.primaryDark]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.actionButtonGradient}
                        >
                            <Ionicons name="home" size={20} color="#fff" />
                            <Text style={styles.actionButtonTextPrimary}>Kembali ke Home</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        ...(Platform.OS === 'web' ? { flex: 0, height: 'auto', minHeight: '100vh' } : {})
    },
    // ... rest of styles
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
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        flex: 1,
        textAlign: 'center',
    },
    placeholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    imageContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    resultImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    statusCard: {
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statusBadge: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginBottom: 12,
    },
    statusBadgeText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    confidenceText: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 12,
    },
    riskScoreContainer: {
        width: '100%',
        alignItems: 'center',
    },
    riskScoreLabel: {
        fontSize: 12,
        color: COLORS.textLight,
        marginBottom: 8,
    },
    riskScoreBar: {
        width: '80%',
        height: 8,
        backgroundColor: COLORS.border,
        borderRadius: 4,
        overflow: 'hidden',
    },
    riskScoreFill: {
        height: '100%',
        borderRadius: 4,
    },
    riskScoreValue: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 8,
    },
    severityBadge: {
        marginTop: 8,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
    },
    severityText: {
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 14,
        color: COLORS.textLight,
        lineHeight: 22,
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    summaryItem: {
        width: '48%',
        backgroundColor: COLORS.cardBg,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 4,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: 2,
    },
    riskFactorItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: '#fffbeb',
        padding: 12,
        borderRadius: 8,
    },
    riskFactorText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#92400e',
        flex: 1,
    },
    recommendationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    recommendationNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    recommendationNumberText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    recommendationText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.text,
        lineHeight: 22,
    },
    symptomItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        padding: 10,
        backgroundColor: '#fef2f2',
        borderRadius: 8,
    },
    symptomText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#991b1b',
        flex: 1,
    },
    preventionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        padding: 10,
        backgroundColor: COLORS.cardBg,
        borderRadius: 8,
    },
    preventionText: {
        marginLeft: 8,
        fontSize: 14,
        color: COLORS.primary,
        flex: 1,
    },
    otherPredictionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    otherPredictionName: {
        width: 120,
        fontSize: 14,
        color: COLORS.text,
    },
    otherPredictionBar: {
        flex: 1,
        height: 8,
        backgroundColor: COLORS.border,
        borderRadius: 4,
        marginHorizontal: 12,
        overflow: 'hidden',
    },
    otherPredictionFill: {
        height: '100%',
        backgroundColor: COLORS.primaryLight,
        borderRadius: 4,
    },
    otherPredictionProb: {
        width: 40,
        textAlign: 'right',
        fontSize: 12,
        color: COLORS.textLight,
    },
    disclaimerCard: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    disclaimerText: {
        fontSize: 12,
        color: COLORS.textLight,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 18,
    },
    noteText: {
        fontSize: 11,
        color: COLORS.textLight,
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        marginRight: 8,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    actionButtonPrimary: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
        marginLeft: 8,
    },
    actionButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
    },
    actionButtonText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
    },
    actionButtonTextPrimary: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    bottomPadding: {
        height: 40,
    },
});

export default AIResultScreen;
