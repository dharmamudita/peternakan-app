/**
 * Seller Profile Screen (Public View)
 * Halaman profil toko yang dilihat oleh pembeli
 */

import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, Dimensions, FlatList
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { COLORS, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;

const SellerProfileScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    // const { sellerId } = route.params; // Nanti pakai ID seller

    // Dummy Data Toko
    const seller = {
        name: 'Toko Peternak Jaya',
        location: 'Blitar, Jawa Timur',
        rating: 4.8,
        joined: 'Jan 2023',
        followers: 1250,
        description: 'Menyediakan segala kebutuhan peternakan sapi dan kambing dengan kualitas terbaik. Pakan, obat, dan vitamin tersedia.',
        online: true
    };

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
        <View style={styles.container}>
            {/* Header / Cover */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <Image
                    source={{ uri: 'https://via.placeholder.com/500x200/964b00/ffffff?text=Header+Toko' }}
                    style={styles.headerImage}
                />
                <View style={styles.headerOverlay} />

                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.searchButton}>
                    <Ionicons name="search" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                style={{ flex: 1 }}
            >
                {/* Profile Info Card */}
                <View style={styles.profileSection}>
                    <View style={styles.profileCard}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>TP</Text>
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
                        <TouchableOpacity style={styles.followButton}>
                            <Text style={styles.followButtonText}>Ikuti</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.description} numberOfLines={3}>
                        {seller.description}
                    </Text>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.chatButton}>
                            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#964b00" />
                            <Text style={styles.chatButtonText}>Chat Penjual</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.chatButton, styles.shareButton]}>
                            <Ionicons name="share-social-outline" size={20} color="#374151" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Products Grid */}
                <View style={styles.productsSection}>
                    <Text style={styles.sectionTitle}>Semua Produk</Text>
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

    header: { height: 160, width: '100%', position: 'relative' },
    headerImage: { ...StyleSheet.absoluteFillObject, backgroundColor: '#964b00' },
    headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
    backButton: { position: 'absolute', top: 40, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
    searchButton: { position: 'absolute', top: 40, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },

    profileSection: { paddingHorizontal: 20, marginTop: -40 },
    profileCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center',
        ...SHADOWS.medium, marginBottom: 16
    },
    avatarContainer: {
        width: 60, height: 60, borderRadius: 30, backgroundColor: '#fed7aa', alignItems: 'center', justifyContent: 'center', marginRight: 16,
        position: 'relative'
    },
    avatarText: { fontSize: 20, fontWeight: '800', color: '#9a3412' },
    onlineStatus: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#10b981', borderWidth: 2, borderColor: '#fff' },

    profileInfo: { flex: 1 },
    shopName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
    locationText: { fontSize: 13, color: '#6b7280' },
    statsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statText: { fontSize: 13, fontWeight: '600', color: '#374151' },
    divider: { width: 1, height: 12, backgroundColor: '#d1d5db' },

    followButton: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#964b00', borderRadius: 20 },
    followButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },

    description: { fontSize: 14, color: '#4b5563', lineHeight: 20, marginBottom: 16, paddingHorizontal: 4 },

    actionButtons: { flexDirection: 'row', gap: 12 },
    chatButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#964b00', backgroundColor: '#fff' },
    chatButtonText: { color: '#964b00', fontWeight: '600', fontSize: 14 },
    shareButton: { flex: 0, width: 48, borderColor: '#d1d5db' },

    productsSection: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },

    productCardWrapper: { width: '100%' },
    productCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', ...SHADOWS.small, width: '100%' },
    productImage: { height: COLUMN_WIDTH - 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
    productInfo: { padding: 12 },
    productName: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 6, height: 40 },
    productPrice: { fontSize: 15, fontWeight: '800', color: '#964b00', marginBottom: 4 },
    productSold: { fontSize: 11, color: '#9ca3af' },
});

export default SellerProfileScreen;
