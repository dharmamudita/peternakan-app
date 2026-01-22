/**
 * Seller Management Screen (Admin)
 * Menampilkan daftar toko dan fitur verifikasi
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { shopApi } from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

const SellerManagementScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('PENDING'); // PENDING, VERIFIED, all
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchShops = async () => {
        try {
            // Untuk saat ini, kita hanya punya endpoint getPending
            // Idealnya ada endpoint getAll untuk admin
            const response = await shopApi.getPending();
            if (response.data && Array.isArray(response.data)) {
                setShops(response.data);
            } else if (Array.isArray(response)) {
                setShops(response);
            }
        } catch (error) {
            console.error('Error fetching shops:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchShops();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchShops();
    };

    const handleVerify = async (shop, status) => {
        const action = status === 'VERIFIED' ? 'menyetujui' : 'menolak';
        Alert.alert(
            'Konfirmasi',
            `Apakah Anda yakin ingin ${action} toko "${shop.name}"?`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Ya',
                    onPress: async () => {
                        try {
                            await shopApi.verify(shop.id, status);
                            Alert.alert('Berhasil', `Toko berhasil ${status === 'VERIFIED' ? 'diverifikasi' : 'ditolak'}`);
                            fetchShops(); // Refresh list
                        } catch (error) {
                            Alert.alert('Gagal', error.message || 'Terjadi kesalahan');
                        }
                    }
                }
            ]
        );
    };

    const filteredShops = shops.filter(shop => {
        const matchesSearch = shop.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shop.address?.toLowerCase().includes(searchQuery.toLowerCase());
        // Untuk filter, jika filterStatus === 'all', tampilkan semua
        const matchesFilter = filterStatus === 'all' || shop.status === filterStatus;
        return matchesSearch && matchesFilter;
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
                            onPress={() => setFilterStatus(tab.key)}
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
});

export default SellerManagementScreen;
