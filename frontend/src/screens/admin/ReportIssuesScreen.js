import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SHADOWS } from '../../constants/theme';
import { reportApi } from '../../services/api';

const ReportIssuesScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Response Modal State
    const [selectedReport, setSelectedReport] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchReports = async () => {
        try {
            const response = await reportApi.getAll();
            console.log('ReportIssuesScreen received response:', response);
            // Handle wrapper object { success: true, data: [...] }
            const reportsData = response.data || response;
            setReports(Array.isArray(reportsData) ? reportsData : []);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Gagal memuat laporan masalah');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchReports();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchReports();
    };

    const handleOpenResponse = (report) => {
        setSelectedReport(report);
        setModalVisible(true);
    };

    const renderHeader = () => (
        <View style={[styles.headerWhite, { paddingTop: insets.top }]}>
            <View style={styles.headerTop}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Laporan Masalah</Text>
                <View style={{ width: 40 }} />
            </View>
        </View>
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.reportCard}
            onPress={() => handleOpenResponse(item)}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: item.status === 'resolved' ? '#dcfce7' : '#fee2e2' }
                ]}>
                    <Text style={[
                        styles.statusText,
                        { color: item.status === 'resolved' ? '#166534' : '#991b1b' }
                    ]}>
                        {item.status === 'resolved' ? 'Selesai' : 'Pending'}
                    </Text>
                </View>
                <Text style={styles.dateText}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID') : '-'}
                </Text>
            </View>

            <Text style={styles.reportTitle}>{item.title}</Text>
            <Text style={styles.reportDesc} numberOfLines={2}>{item.description}</Text>

            <View style={styles.userInfo}>
                <Ionicons name="person-circle-outline" size={16} color="#6b7280" />
                <Text style={styles.userName}>{item.userName || 'User'}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={reports}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="checkmark-circle-outline" size={64} color="#d1d5db" />
                            <Text style={styles.emptyText}>Tidak ada laporan masalah</Text>
                        </View>
                    )}
                />
            )}

            {/* Detail Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Detail Laporan</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        {selectedReport && (
                            <View style={styles.selectedReportInfo}>
                                <Text style={styles.label}>Pelapor:</Text>
                                <Text style={styles.value}>{selectedReport.userName} ({selectedReport.userEmail})</Text>
                                <Text style={styles.label}>Masalah:</Text>
                                <Text style={styles.value}>{selectedReport.title}</Text>
                                <Text style={[styles.value, { color: '#4b5563', lineHeight: 20 }]}>{selectedReport.description}</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.submitBtn, { backgroundColor: '#f3f4f6' }]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={[styles.submitBtnText, { color: '#374151' }]}>Tutup</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        ...(Platform.OS === 'web' ? { flex: 0, height: 'auto', minHeight: '100vh' } : {})
    },
    headerWhite: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        ...SHADOWS.small,
        zIndex: 10,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        height: 44,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    listContainer: {
        padding: 20,
    },
    reportCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        ...SHADOWS.small,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 11,
        color: '#9ca3af',
    },
    reportTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    reportDesc: {
        fontSize: 13,
        color: '#4b5563',
        marginBottom: 8,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    userName: {
        fontSize: 12,
        color: '#6b7280',
    },
    responsePreview: {
        flexDirection: 'row',
        backgroundColor: '#f0fdf4',
        padding: 8,
        borderRadius: 8,
        gap: 6,
    },
    responseText: {
        fontSize: 12,
        color: '#166534',
        flex: 1,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 14,
        color: '#9ca3af',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    selectedReportInfo: {
        backgroundColor: '#f9fafb',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    label: {
        fontSize: 11,
        color: '#6b7280',
        fontWeight: '600',
        marginTop: 4,
    },
    value: {
        fontSize: 13,
        color: '#1f2937',
        marginBottom: 4,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    responseInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    submitBtn: {
        backgroundColor: COLORS.primary,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
});

export default ReportIssuesScreen;
