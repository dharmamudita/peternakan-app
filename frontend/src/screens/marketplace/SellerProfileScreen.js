/**
 * Seller Profile Screen (Public View)
 * Halaman profil toko yang dilihat oleh pembeli
 */

import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, Dimensions, FlatList, Platform, Alert, StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { COLORS, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;

const SellerProfileScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { sellerId, asAdmin, sellerData } = route.params || {};

    // Dummy Data Toko (Default fallback)
    const defaultSeller = {
        name: 'Toko Peternak Jaya',
        location: 'Blitar, Jawa Timur',
        rating: 4.8,
        joined: 'Jan 2023',
        followers: 1250,
        description: 'Menyediakan segala kebutuhan peternakan sapi dan kambing dengan kualitas terbaik. Pakan, obat, dan vitamin tersedia.',
        online: true,
        status: 'verified',
        owner: 'Budi Santoso',
        joinedAt: 'Jan 2023'
    };

    // Merge dengan data yang dipassing dari Dashboard
    const seller = { ...defaultSeller, ...(sellerData || {}) };

    // Dummy Data Produk Toko
    const sellerProducts = [
        { id: '1', name: 'Sapi Limosin Dewasa', price: 25000000, image: null, sold: 12 },
        { id: '2', name: 'Pakan Konsentrat', price: 350000, image: null, sold: 154 },
        { id: '3', name: 'Vitamin Ternak', price: 75000, image: null, sold: 89 },
        { id: '4', name: 'Obat Cacing', price: 25000, image: null, sold: 200 },
    ];

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(price);
    };

    const handleVerify = () => {
        if (Platform.OS === 'web') {
            window.alert('Toko Berhasil Diverifikasi!\nPenjual sekarang dapat mulai berjualan.');
        } else {
            Alert.alert('Berhasil Verifikasi', 'Toko berhasil diverifikasi. Status sekarang aktif.');
        }
        navigation.goBack();
    };

    const handleReject = () => {
        if (Platform.OS === 'web') {
            window.alert('Pengajuan Toko Ditolak.');
        } else {
            Alert.alert('Ditolak', 'Pengajuan verifikasi toko ditolak.');
        }
        navigation.goBack();
    };

    const renderProduct = ({ item, index }) => (
        <Animated.View entering={FadeInUp.delay(index * 100).duration(500)} style={styles.productCardWrapper}>
            <TouchableOpacity
                style={styles.productCard}
                activeOpacity={0.9}
                onPress={() => navigation.push('ProductDetail', { product: { ...item, category: 'Toko', rating: 4.8, isNew: true, location: seller.location } })}
            >
                <View style={styles.productImage}>
                    <Ionicons name="image-outline" size={32} color="#d1d5db" />
                </View>
                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
                    <Text style={styles.productSold}>{item.sold} Terjual</Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={[styles.container, Platform.OS === 'web' && styles.webContainer]}>
            <StatusBar barStyle="light-content" backgroundColor="#964b00" />

            {/* Header / Cover dengan Gradient */}
            <LinearGradient
                colors={['#964b00', '#b45309']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    styles.header,
                    {
                        paddingTop: insets.top + (Platform.OS === 'web' ? 20 : 0),
                        zIndex: 1
                    }
                ]}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>

                    {!asAdmin && (
                        <TouchableOpacity style={styles.searchButton}>
                            <Ionicons name="search" size={20} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Toko Background Pattern/Icon Decorative */}
                <View style={styles.decorativeIcon}>
                    <Ionicons name="storefront" size={120} color="rgba(255,255,255,0.05)" />
                </View>
            </LinearGradient>

            {/* ScrollView container diberi zIndex tinggi agar kontennya (Profile Card) merender DI ATAS Header */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                style={{ flex: 1, zIndex: 10 }}
            >
                {/* Profile Info Card - Overlap Header */}
                <View style={styles.profileSection}>
                    <View style={styles.profileCard}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>{seller.name.charAt(0)}</Text>
                            {seller.online && <View style={styles.onlineStatus} />}
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.shopName}>{seller.name}</Text>
                            <View style={styles.locationRow}>
                                <Ionicons name="location-outline" size={14} color="#6b7280" />
                                <Text style={styles.locationText}>{seller.location}</Text>
                            </View>
                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <Ionicons name="star" size={14} color="#f59e0b" />
                                    <Text style={styles.statText}>{seller.rating}</Text>
                                </View>
                                <View style={styles.divider} />
                                <Text style={styles.statText}>{seller.followers} Pengikut</Text>
                            </View>
                        </View>

                        {!asAdmin && (
                            <TouchableOpacity style={styles.followButton}>
                                <Text style={styles.followButtonText}>Ikuti</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Admin Actions Panel */}
                    {asAdmin && (
                        <View style={styles.adminPanel}>
                            <View style={styles.adminHeader}>
                                <Ionicons name="shield-checkmark" size={20} color="#b45309" />
                                <Text style={styles.adminPanelTitle}>Verifikasi Toko</Text>
                            </View>

                            <View style={styles.adminInfoRow}>
                                <Text style={[styles.adminLabel, { width: 100 }]}>Pemilik</Text>
                                <Text style={styles.adminValue}>: {seller.owner || 'Tidak Diketahui'}</Text>
                            </View>
                            <View style={styles.adminInfoRow}>
                                <Text style={[styles.adminLabel, { width: 100 }]}>Bergabung</Text>
                                <Text style={styles.adminValue}>: {seller.joinedAt || 'Baru Saja'}</Text>
                            </View>
                            <View style={styles.adminInfoRow}>
                                <Text style={[styles.adminLabel, { width: 100 }]}>Status</Text>
                                <View style={[styles.statusPill, { backgroundColor: seller.status === 'verified' ? '#dcfce7' : '#fff7ed' }]}>
                                    <Text style={[styles.statusTextPill, { color: seller.status === 'verified' ? '#166534' : '#c2410c' }]}>
                                        {seller.status === 'verified' ? 'Terverifikasi' : 'Menunggu Verifikasi'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.adminActions}>
                                {seller.status !== 'verified' ? (
                                    <>
                                        <TouchableOpacity style={[styles.adminBtn, styles.rejectBtn]} onPress={handleReject}>
                                            <Ionicons name="close-circle-outline" size={20} color="#ef4444" />
                                            <Text style={[styles.adminBtnText, { color: '#ef4444' }]}>Tolak</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.adminBtn, styles.approveBtn]} onPress={handleVerify}>
                                            <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                            <Text style={styles.adminBtnText}>Setujui</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <TouchableOpacity style={[styles.adminBtn, styles.suspendBtn]} onPress={handleReject}>
                                        <Ionicons name="warning-outline" size={20} color="#fff" />
                                        <Text style={styles.adminBtnText}>Suspend Toko</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}

                    <Text style={styles.description} numberOfLines={3}>
                        {seller.description}
                    </Text>

                    {!asAdmin && (
                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.chatButton}>
                                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#964b00" />
                                <Text style={styles.chatButtonText}>Chat Penjual</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.chatButton, styles.shareButton]}>
                                <Ionicons name="share-social-outline" size={20} color="#374151" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Products Grid */}
                <View style={styles.productsSection}>
                    <Text style={styles.sectionTitle}>Produk Toko</Text>
                    <View style={styles.gridContainer}>
                        {sellerProducts.map((item, index) => (
                            <View key={item.id} style={{ width: '48%' }}>
                                {renderProduct({ item, index })}
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    webContainer: {
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
        // Optional: add borders or shadow for "app" feel on desktop
        ...(Platform.OS === 'web' ? { minHeight: '100vh', boxShadow: '0 0 20px rgba(0,0,0,0.1)' } : {})
    },

    header: {
        height: 180, // Sedikit lebih tinggi untuk proporsi
        width: '100%',
        position: 'relative',
        justifyContent: 'flex-start',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10, // Tambahan padding aman
        zIndex: 10,
    },
    decorativeIcon: {
        position: 'absolute',
        right: -20,
        bottom: -20,
        opacity: 0.5,
        transform: [{ rotate: '-15deg' }]
    },

    // Buttons
    backButton: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center', justifyContent: 'center'
    },
    searchButton: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center', justifyContent: 'center'
    },

    profileSection: { paddingHorizontal: 20, marginTop: -50, zIndex: 20 },
    profileCard: {
        backgroundColor: '#fff', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center',
        ...SHADOWS.medium, marginBottom: 16,
        // Shadow improvement
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    avatarContainer: {
        width: 64, height: 64, borderRadius: 32, backgroundColor: '#fed7aa', alignItems: 'center', justifyContent: 'center', marginRight: 16,
        position: 'relative', borderWidth: 2, borderColor: '#fff'
    },
    avatarText: { fontSize: 24, fontWeight: '800', color: '#9a3412' },
    onlineStatus: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10b981', borderWidth: 2, borderColor: '#fff' },

    profileInfo: { flex: 1 },
    shopName: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
    locationText: { fontSize: 13, color: '#6b7280' },
    statsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statText: { fontSize: 13, fontWeight: '600', color: '#374151' },
    divider: { width: 1, height: 12, backgroundColor: '#d1d5db' },

    followButton: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#964b00', borderRadius: 20 },
    followButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },

    description: { fontSize: 14, color: '#4b5563', lineHeight: 22, marginBottom: 20, marginHorizontal: 4 },

    actionButtons: { flexDirection: 'row', gap: 12 },
    chatButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: '#964b00', backgroundColor: '#fff' },
    chatButtonText: { color: '#964b00', fontWeight: '600', fontSize: 15 },
    shareButton: { flex: 0, width: 52, borderColor: '#e5e7eb' },

    productsSection: { padding: 20, paddingTop: 0 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 16 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },

    productCardWrapper: { width: '100%' },
    productCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', ...SHADOWS.small, width: '100%', borderWidth: 1, borderColor: '#f3f4f6' },
    productImage: { height: COLUMN_WIDTH - 20, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' },
    productInfo: { padding: 12 },
    productName: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 6, height: 40 },
    productPrice: { fontSize: 15, fontWeight: '800', color: '#964b00', marginBottom: 4 },
    productSold: { fontSize: 11, color: '#9ca3af' },

    // Admin Styles Re-polished
    adminPanel: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        padding: 16,
        ...SHADOWS.small
    },
    adminHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    adminPanelTitle: { fontSize: 16, fontWeight: 'bold', color: '#9a3412' },

    adminInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    adminLabel: { fontSize: 14, color: '#6b7280' },
    adminValue: { fontSize: 14, color: '#111827', fontWeight: '500' },

    statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginLeft: 4 },
    statusTextPill: { fontSize: 12, fontWeight: 'bold' },

    adminActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
    adminBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12 },
    approveBtn: { backgroundColor: '#16a34a', shadowColor: '#16a34a', shadowOpacity: 0.3, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
    rejectBtn: { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fca5a5' },
    suspendBtn: { backgroundColor: '#ea580c' },
    adminBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});

export default SellerProfileScreen;
