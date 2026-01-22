/**
 * Seller Profile Screen (Public View)
 * Halaman profil toko yang dilihat oleh pembeli atau penjual sendiri
 */

import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, Dimensions, FlatList, Platform, Alert, StatusBar, ActivityIndicator,
    RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SIZES } from '../../constants/theme';
import { productApi, shopApi } from '../../services/api';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;

const SellerProfileScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { sellerId, shopId, asAdmin, sellerData } = route.params || {};

    // State
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('products');
    const [avgRating, setAvgRating] = useState('0.0');

    // Default seller data
    const defaultSeller = {
        name: 'Toko Peternak',
        location: 'Lokasi',
        rating: 0,
        followers: 0,
        description: 'Deskripsi toko',
        online: false,
        status: 'pending',
        owner: '',
        joinedAt: '-'
    };

    // Derived seller info for display
    const displaySeller = shop ? {
        name: shop.name || defaultSeller.name,
        location: shop.address || defaultSeller.location,
        rating: avgRating > 0 ? avgRating : (shop.rating || 0), // Use calculated avg if available
        followers: 0,
        description: shop.description || '',
        online: true,
        status: shop.status?.toLowerCase() || 'pending',
        phoneNumber: shop.phoneNumber,
        joinedAt: shop.createdAt ? new Date(shop.createdAt).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : 'Baru'
    } : { ...defaultSeller, ...(sellerData || {}) };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // 1. Fetch Shop Data
            let currentShop = null;
            let currentShopId = shopId;

            if (shopId) {
                const shopResponse = await shopApi.getById(shopId);
                if (shopResponse.data) currentShop = shopResponse.data;
            } else if (!sellerId && !sellerData) {
                const shopResponse = await shopApi.getMyShop();
                if (shopResponse.data) {
                    currentShop = shopResponse.data;
                    currentShopId = currentShop.id;
                }
            } else if (sellerData) {
                currentShop = sellerData;
                currentShopId = currentShop.id;
            }

            if (currentShop) {
                setShop(currentShop);
                currentShopId = currentShop.id;
            }

            if (!currentShopId) {
                console.log('No Shop ID found');
                setLoading(false);
                return;
            }

            // 2. Fetch Reviews - Removed
            // Reviews are now only shown on Product Detail page

            // 3. Fetch Products
            let productsData = [];
            const targetSellerId = sellerId || currentShop?.userId;

            // If viewing specific seller/shop public view
            if (targetSellerId && targetSellerId !== '1') {
                const response = await productApi.getAll({ sellerId: targetSellerId });
                if (response.data && Array.isArray(response.data)) {
                    productsData = response.data;
                }
            } else {
                // My products fallback or "My Profile"
                const response = await productApi.getMyProducts();
                if (response.data) {
                    productsData = Array.isArray(response.data) ? response.data : (response.data.data || []);
                }
            }
            setProducts(productsData);

        } catch (error) {
            console.error('Fetch shop data error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(price);
    };

    const handleVerify = () => {
        Alert.alert('Berhasil Verifikasi', 'Toko berhasil diverifikasi.');
        navigation.goBack();
    };

    const handleReject = () => {
        Alert.alert('Ditolak', 'Pengajuan verifikasi toko ditolak.');
        navigation.goBack();
    };



    return (
        <View style={styles.container}>
            {/* Custom Header */}
            <View style={[styles.customHeader, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitleWhite}>Profil Penjual</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Banner */}
                <LinearGradient
                    colors={['#8B4513', '#A0522D']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.banner}
                >
                    <View style={styles.bannerOverlay} />
                </LinearGradient>

                {/* Floating Profile Card */}
                <View style={styles.profileContainer}>
                    <View style={styles.profileCard}>
                        <View style={styles.topProfileRow}>
                            <View style={styles.avatarMain}>
                                <Text style={styles.avatarText}>{displaySeller.name.charAt(0).toUpperCase()}</Text>
                                {displaySeller.online && <View style={styles.onlineIndicator} />}
                            </View>
                            <View style={styles.detailsCol}>
                                <Text style={styles.sellerName}>{displaySeller.name}</Text>
                                <View style={styles.locationBadge}>
                                    <Ionicons name="location-sharp" size={12} color="#fff" />
                                    <Text style={styles.locationBadgeText}>{displaySeller.location}</Text>
                                </View>
                                {displaySeller.status === 'verified' && (
                                    <View style={styles.verifiedRow}>
                                        <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                                        <Text style={styles.verifiedText}>Terverifikasi</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>{displaySeller.rating}</Text>
                                <Text style={styles.statLabel}>Rating</Text>
                            </View>

                            <View style={styles.statSep} />
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>{products.length}</Text>
                                <Text style={styles.statLabel}>Produk</Text>
                            </View>
                            <View style={styles.statSep} />
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>{displaySeller.joinedAt !== '-' ? '2 Thn' : 'Baru'}</Text>
                                <Text style={styles.statLabel}>Bergabung</Text>
                            </View>
                        </View>

                        {/* Admin Approvals */}
                        {asAdmin && sellerData?.status === 'PENDING' && (
                            <View style={styles.adminActions}>
                                <TouchableOpacity style={styles.btnVerify} onPress={handleVerify}>
                                    <Text style={styles.btnTextWhite}>Verifikasi Toko</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.btnReject} onPress={handleReject}>
                                    <Text style={styles.btnTextRed}>Tolak</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                {/* Products Title */}
                <View style={{ paddingHorizontal: 20, marginTop: 24, marginBottom: 0, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 16 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }}>Produk Toko</Text>
                </View>

                {/* Content */}
                <View style={styles.contentArea}>
                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
                    ) : products.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="cube-outline" size={48} color="#d1d5db" />
                            <Text style={styles.emptyText}>Belum ada produk</Text>
                        </View>
                    ) : (
                        <View style={styles.grid}>
                            {products.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.card}
                                    activeOpacity={0.9}
                                    onPress={() => navigation.push('ProductDetail', { product: item })}
                                >
                                    <Image
                                        source={{ uri: item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/150' }}
                                        style={styles.cardImg}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.cardBody}>
                                        <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
                                        <Text style={styles.cardPrice}>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price)}</Text>
                                        <View style={styles.cardFooter}>
                                            <View style={styles.ratingBadge}>
                                                <Ionicons name="star" size={10} color="#fbbf24" />
                                                <Text style={styles.ratingText}>{item.rating || 'N/A'}</Text>
                                            </View>
                                            <Text style={styles.soldText}>{item.sold || item.totalSold || 0} Terjual</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    customHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 10,
        paddingTop: 10,
    },
    headerTitleWhite: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    headerBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 20,
    },
    banner: {
        height: 220,
        width: '100%',
        position: 'relative',
    },
    bannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    profileContainer: {
        paddingHorizontal: 16,
        marginTop: -80,
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        ...SHADOWS.medium,
        elevation: 5,
    },
    topProfileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarMain: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#fef3c7',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        position: 'relative'
    },
    avatarText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#b45309',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#10b981',
        borderWidth: 2,
        borderColor: '#fff',
    },
    detailsCol: {
        marginLeft: 16,
        flex: 1,
    },
    sellerName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 6,
    },
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(107, 114, 128, 0.8)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 6,
        gap: 4
    },
    locationBadgeText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '500',
    },
    verifiedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    verifiedText: {
        fontSize: 12,
        color: '#10b981',
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginVertical: 16,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    statLabel: {
        fontSize: 11,
        color: '#6b7280',
        marginTop: 2,
    },
    statSep: {
        width: 1,
        height: 24,
        backgroundColor: '#e5e7eb',
    },
    adminActions: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 12,
    },
    btnVerify: {
        flex: 1,
        backgroundColor: COLORS.primary,
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    btnReject: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ef4444',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    btnTextWhite: {
        color: '#fff',
        fontWeight: 'bold',
    },
    btnTextRed: {
        color: '#ef4444',
        fontWeight: 'bold',
    },
    tabsContainer: {
        flexDirection: 'row',
        marginTop: 24,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    tabBtn: {
        marginRight: 24,
        paddingBottom: 12,
        position: 'relative',
    },
    tabBtnActive: {
        // active styling managed by indicator
    },
    tabText: {
        fontSize: 15,
        color: '#6b7280',
        fontWeight: '500',
    },
    tabTextActive: {
        color: '#964b00',
        fontWeight: '700',
    },
    tabIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: '#964b00',
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },
    contentArea: {
        paddingTop: 20,
        paddingHorizontal: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    card: {
        width: (width - 32 - 12) / 2,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f3f4f6',
        ...SHADOWS.small,
    },
    cardImg: {
        width: '100%',
        height: 140,
        backgroundColor: '#f3f4f6',
    },
    cardBody: {
        padding: 10,
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: '500',
        color: '#111827',
        marginBottom: 6,
        height: 36,
    },
    cardPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#964b00',
        marginBottom: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        backgroundColor: '#fef3c7',
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 4,
    },
    ratingText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#b45309',
    },
    soldText: {
        fontSize: 10,
        color: '#9ca3af',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        marginTop: 12,
        color: '#9ca3af',
        fontSize: 16,
    },
    reviewCard: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    reviewerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    reviewerInitial: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#6b7280',
    },
    reviewerName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    reviewDate: {
        fontSize: 12,
        color: '#9ca3af',
    },
    reviewComment: {
        fontSize: 14,
        color: '#4b5563',
        lineHeight: 20,
    },
});

export default SellerProfileScreen;
