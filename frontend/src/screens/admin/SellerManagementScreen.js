/**
 * Seller Management Screen (Admin)
 * Menampilkan daftar toko dan fitur verifikasi
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    StatusBar,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Platform,
    Modal,
    Image,
    Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { shopApi } from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SellerManagementScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('PENDING'); // PENDING, VERIFIED, all
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // KTP Modal State
    const [ktpModalVisible, setKtpModalVisible] = useState(false);
    const [selectedShop, setSelectedShop] = useState(null);

    const fetchShops = async (statusFilter = filterStatus) => {
        try {
            setLoading(true);
            const response = await shopApi.getPending(statusFilter);
            if (response.data && Array.isArray(response.data)) {
                setShops(response.data);
            } else if (Array.isArray(response)) {
                setShops(response);
            } else {
                setShops([]);
            }
        } catch (error) {
            console.error('Error fetching shops:', error);
            setShops([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchShops(filterStatus);
        }, [filterStatus])
    );

    // Re-fetch when filter changes
    const handleFilterChange = (newStatus) => {
        setFilterStatus(newStatus);
        fetchShops(newStatus);
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchShops(filterStatus);
    };

    const handleVerify = async (shop, status) => {
        const action = status === 'VERIFIED' ? 'menyetujui' : 'menolak';
        const message = `Apakah Anda yakin ingin ${action} toko "${shop.name}"?`;

        const doVerify = async () => {
            try {
                await shopApi.verify(shop.id, status);
                if (Platform.OS === 'web') {
                    window.alert(`Toko berhasil ${status === 'VERIFIED' ? 'diverifikasi' : 'ditolak'}`);
                } else {
                    Alert.alert('Berhasil', `Toko berhasil ${status === 'VERIFIED' ? 'diverifikasi' : 'ditolak'}`);
                }
                setKtpModalVisible(false);
                fetchShops(); // Refresh list
            } catch (error) {
                const errMsg = error.message || 'Terjadi kesalahan';
                if (Platform.OS === 'web') {
                    window.alert(`Gagal: ${errMsg}`);
                } else {
                    Alert.alert('Gagal', errMsg);
                }
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm(message)) {
                await doVerify();
            }
        } else {
            Alert.alert(
                'Konfirmasi',
                message,
                [
                    { text: 'Batal', style: 'cancel' },
                    { text: 'Ya', onPress: doVerify }
                ]
            );
        }
    };

    const openKtpModal = (shop) => {
        setSelectedShop(shop);
        setKtpModalVisible(true);
    };

    // Client-side filter hanya untuk search (status sudah di-filter dari server)
    const filteredShops = shops.filter(shop => {
        const matchesSearch = shop.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shop.address?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const renderHeader = () => (
        <Animated.View
            style={styles.headerWrapper}
            entering={FadeInDown.duration(600).springify()}
        >
            <View style={[styles.headerWhite, { paddingTop: insets.top }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1f2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Kelola Penjual</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#9ca3af" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Cari nama toko..."
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterTabs}>
                    {[
                        { key: 'PENDING', label: 'Perlu Verifikasi' },
                        { key: 'VERIFIED', label: 'Terverifikasi' },
                        { key: 'REJECTED', label: 'Ditolak' },
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.filterTab, filterStatus === tab.key && styles.activeFilterTab]}
                            onPress={() => handleFilterChange(tab.key)}
                        >
                            <Text style={[styles.filterText, filterStatus === tab.key && styles.activeFilterText]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </Animated.View>
    );

    const renderShopItem = ({ item, index }) => (
        <Animated.View entering={FadeInUp.delay(index * 100).duration(500).springify()}>
            <View style={styles.sellerCard}>
                <View style={styles.sellerRow}>
                    <View style={styles.sellerAvatar}>
                        <Text style={styles.sellerInitials}>{item.name?.charAt(0) || 'T'}</Text>
                    </View>
                    <View style={styles.sellerInfo}>
                        <Text style={styles.sellerName}>{item.name}</Text>
                        <View style={styles.sellerMeta}>
                            <Ionicons name="location-outline" size={12} color="#6b7280" />
                            <Text style={styles.sellerText} numberOfLines={1}>{item.address}</Text>
                        </View>
                        <View style={styles.sellerMeta}>
                            <Ionicons name="call-outline" size={12} color="#6b7280" />
                            <Text style={styles.sellerText}>{item.phoneNumber}</Text>
                        </View>
                        <View style={styles.sellerMeta}>
                            <Ionicons name="card-outline" size={12} color="#6b7280" />
                            <Text style={styles.sellerText}>NIK: {item.nik}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, {
                        backgroundColor: item.status === 'VERIFIED' ? '#dcfce7' : item.status === 'REJECTED' ? '#fee2e2' : '#fff7ed',
                    }]}>
                        {item.status === 'VERIFIED' ? (
                            <Ionicons name="checkmark-circle" size={24} color="#15803d" />
                        ) : item.status === 'REJECTED' ? (
                            <Ionicons name="close-circle" size={24} color="#dc2626" />
                        ) : (
                            <Ionicons name="time" size={24} color="#ea580c" />
                        )}
                    </View>
                </View>

                {/* KTP Preview Button */}
                <TouchableOpacity
                    style={styles.ktpButton}
                    onPress={() => openKtpModal(item)}
                >
                    <View style={styles.ktpButtonContent}>
                        <Ionicons name="id-card-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.ktpButtonText}>Lihat Foto KTP</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>

                {/* Action Buttons for Pending */}
                {item.status === 'PENDING' && (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.rejectBtn]}
                            onPress={() => handleVerify(item, 'REJECTED')}
                        >
                            <Ionicons name="close" size={18} color="#dc2626" />
                            <Text style={styles.rejectBtnText}>Tolak</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.approveBtn]}
                            onPress={() => handleVerify(item, 'VERIFIED')}
                        >
                            <Ionicons name="checkmark" size={18} color="#fff" />
                            <Text style={styles.approveBtnText}>Verifikasi</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </Animated.View>
    );

    // KTP Modal Component
    const renderKtpModal = () => (
        <Modal
            visible={ktpModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setKtpModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <Animated.View
                    style={styles.modalContent}
                    entering={FadeIn.duration(300)}
                >
                    {/* Modal Header */}
                    <View style={styles.modalHeader}>
                        <View style={styles.modalTitleRow}>
                            <Ionicons name="id-card" size={24} color={COLORS.primary} />
                            <Text style={styles.modalTitle}>Verifikasi KTP</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setKtpModalVisible(false)}
                        >
                            <Ionicons name="close" size={24} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Seller Info */}
                    {selectedShop && (
                        <View style={styles.modalSellerInfo}>
                            <View style={styles.modalInfoRow}>
                                <Text style={styles.modalInfoLabel}>Nama Toko:</Text>
                                <Text style={styles.modalInfoValue}>{selectedShop.name}</Text>
                            </View>
                            <View style={styles.modalInfoRow}>
                                <Text style={styles.modalInfoLabel}>NIK:</Text>
                                <Text style={styles.modalInfoValue}>{selectedShop.nik}</Text>
                            </View>
                            <View style={styles.modalInfoRow}>
                                <Text style={styles.modalInfoLabel}>Alamat:</Text>
                                <Text style={styles.modalInfoValue} numberOfLines={2}>{selectedShop.address}</Text>
                            </View>
                            <View style={styles.modalInfoRow}>
                                <Text style={styles.modalInfoLabel}>No. HP:</Text>
                                <Text style={styles.modalInfoValue}>{selectedShop.phoneNumber}</Text>
                            </View>
                        </View>
                    )}

                    {/* KTP Image */}
                    <View style={styles.ktpImageContainer}>
                        <Text style={styles.ktpImageLabel}>Foto KTP:</Text>
                        {selectedShop?.ktpImageUrl ? (
                            <Image
                                source={{ uri: selectedShop.ktpImageUrl }}
                                style={styles.ktpImage}
                                resizeMode="contain"
                            />
                        ) : (
                            <View style={styles.noKtpContainer}>
                                <Ionicons name="image-outline" size={48} color="#d1d5db" />
                                <Text style={styles.noKtpText}>Foto KTP tidak tersedia</Text>
                            </View>
                        )}
                    </View>

                    {/* Action Buttons in Modal (for PENDING) */}
                    {selectedShop?.status === 'PENDING' && (
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalActionBtn, styles.modalRejectBtn]}
                                onPress={() => handleVerify(selectedShop, 'REJECTED')}
                            >
                                <Ionicons name="close-circle" size={20} color="#dc2626" />
                                <Text style={styles.modalRejectText}>Tolak Pendaftaran</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalActionBtn, styles.modalApproveBtn]}
                                onPress={() => handleVerify(selectedShop, 'VERIFIED')}
                            >
                                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                <Text style={styles.modalApproveText}>Setujui & Verifikasi</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Status Badge for Non-Pending */}
                    {selectedShop?.status !== 'PENDING' && (
                        <View style={[styles.modalStatusBadge, {
                            backgroundColor: selectedShop?.status === 'VERIFIED' ? '#dcfce7' : '#fee2e2',
                        }]}>
                            <Ionicons
                                name={selectedShop?.status === 'VERIFIED' ? 'checkmark-circle' : 'close-circle'}
                                size={20}
                                color={selectedShop?.status === 'VERIFIED' ? '#15803d' : '#dc2626'}
                            />
                            <Text style={[styles.modalStatusText, {
                                color: selectedShop?.status === 'VERIFIED' ? '#15803d' : '#dc2626',
                            }]}>
                                {selectedShop?.status === 'VERIFIED' ? 'Sudah Terverifikasi' : 'Ditolak'}
                            </Text>
                        </View>
                    )}
                </Animated.View>
            </View>
        </Modal>
    );

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {renderHeader()}

            <FlatList
                data={filteredShops}
                renderItem={renderShopItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="storefront-outline" size={64} color="#d1d5db" />
                        <Text style={styles.emptyText}>
                            {filterStatus === 'PENDING' ? 'Tidak ada pengajuan baru' : 'Tidak ada toko ditemukan'}
                        </Text>
                    </View>
                )}
            />

            {renderKtpModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },

    // Header Styles
    headerWrapper: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', marginBottom: 10 },
    headerWhite: { paddingBottom: 16 },

    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 12,
        paddingTop: 10
    },
    backButton: {
        width: 40, height: 40,
        alignItems: 'center', justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: '#f3f4f6'
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },

    searchContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#f9fafb',
        marginHorizontal: 16, paddingHorizontal: 12, borderRadius: 12, height: 46,
        borderWidth: 1, borderColor: '#e5e7eb'
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#1f2937' },

    filterTabs: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 16, gap: 8 },
    filterTab: {
        paddingVertical: 8, paddingHorizontal: 14,
        borderRadius: 20, backgroundColor: '#fff',
        borderWidth: 1, borderColor: '#e5e7eb',
        alignItems: 'center'
    },
    activeFilterTab: { backgroundColor: '#964b00', borderColor: '#964b00' },
    filterText: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
    activeFilterText: { color: '#fff' },

    listContainer: { padding: 16, paddingTop: 8, paddingBottom: 40 },

    sellerCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
        ...SHADOWS.small, borderWidth: 1, borderColor: '#f3f4f6',
    },
    sellerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    sellerAvatar: {
        width: 56, height: 56, borderRadius: 28, backgroundColor: '#fed7aa',
        alignItems: 'center', justifyContent: 'center',
    },
    sellerInitials: { fontSize: 24, fontWeight: 'bold', color: '#9a3412' },
    sellerInfo: { flex: 1 },
    sellerName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
    sellerMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
    sellerText: { fontSize: 12, color: '#4b5563', flex: 1 },

    statusBadge: {
        width: 36, height: 36, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
    },

    // KTP Button
    ktpButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: `${COLORS.primary}10`,
        borderRadius: 12,
        padding: 14,
        marginTop: 16,
    },
    ktpButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    ktpButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
    },

    actionButtons: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 16,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    rejectBtn: {
        backgroundColor: '#fee2e2',
    },
    approveBtn: {
        backgroundColor: '#15803d',
    },
    rejectBtnText: { color: '#dc2626', fontWeight: '600' },
    approveBtnText: { color: '#fff', fontWeight: '600' },

    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
    emptyText: { marginTop: 16, color: '#9ca3af', fontSize: 16, textAlign: 'center' },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '100%',
        maxWidth: 500,
        maxHeight: SCREEN_HEIGHT * 0.85,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    modalTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    modalCloseButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalSellerInfo: {
        padding: 16,
        backgroundColor: '#f9fafb',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    modalInfoRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    modalInfoLabel: {
        width: 80,
        fontSize: 13,
        color: '#6b7280',
    },
    modalInfoValue: {
        flex: 1,
        fontSize: 13,
        fontWeight: '500',
        color: '#111827',
    },
    ktpImageContainer: {
        padding: 16,
    },
    ktpImageLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    ktpImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
    },
    noKtpContainer: {
        height: 200,
        borderRadius: 12,
        backgroundColor: '#f9fafb',
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    noKtpText: {
        marginTop: 12,
        fontSize: 14,
        color: '#9ca3af',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    modalActionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    modalRejectBtn: {
        backgroundColor: '#fee2e2',
    },
    modalApproveBtn: {
        backgroundColor: '#15803d',
    },
    modalRejectText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#dc2626',
    },
    modalApproveText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    modalStatusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginBottom: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    modalStatusText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default SellerManagementScreen;
