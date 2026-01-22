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

            // 2. Fetch Reviews
            try {
                const reviewRes = await shopApi.getReviews(currentShopId);
                if (reviewRes.data) {
                    const revs = reviewRes.data;
                    setReviews(revs);
                    if (revs.length > 0) {
                        const total = revs.reduce((acc, r) => acc + Number(r.rating), 0);
                        setAvgRating((total / revs.length).toFixed(1));
                    }
                }
            } catch (e) {
                console.log('Error fetching reviews:', e);
            }

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

    const renderReviews = () => {
        if (reviews.length === 0) {
            return (
                <View style={{ padding: 40, alignItems: 'center' }}>
                    <Ionicons name="chatbubble-outline" size={48} color="#d1d5db" />
                    <Text style={{ color: '#9ca3af', marginTop: 10 }}>Belum ada ulasan</Text>
                </View>
            );
        }
        return (
            <View style={styles.reviewsList}>
                {reviews.map((review) => (
                    <View key={review.id} style={styles.reviewCard}>
                        <View style={styles.reviewHeader}>
                            <View style={styles.reviewerInfo}>
                                <View style={styles.reviewerAvatar}>
                                    <Text style={styles.reviewerInitial}>{review.buyerName ? review.buyerName.charAt(0).toUpperCase() : 'U'}</Text>
                                </View>
                                <View>
                                    <Text style={styles.reviewerName}>{review.buyerName || 'User'}</Text>
                                    <View style={{ flexDirection: 'row' }}>
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Ionicons key={i} name="star" size={12} color={i <= review.rating ? "#f59e0b" : "#e5e7eb"} />
                                        ))}
                                    </View>
                                </View>
                            </View>
                            <Text style={styles.reviewDate}>
                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                            </Text>
                        </View>
                        {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
                    </View>
                ))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={[styles.headerWhite, { paddingTop: insets.top }]}>
                <TouchableOpacity style={styles.backButtonSimple} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detail Toko</Text>
                {!asAdmin ? (
                    <TouchableOpacity style={styles.backButtonSimple}>
                        <Ionicons name="search" size={24} color="#111827" />
                    </TouchableOpacity>
                ) : <View style={{ width: 40 }} />}
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Profile Info Card */}
                <View style={styles.profileSection}>
                    <View style={styles.profileCard}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>{displaySeller.name.charAt(0)}</Text>
                            {displaySeller.online && <View style={styles.onlineStatus} />}
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.shopName}>{displaySeller.name}</Text>
                            <View style={styles.locationRow}>
                                <Ionicons name="location-outline" size={14} color="#6b7280" />
                                <Text style={styles.locationText}>{displaySeller.location}</Text>
                            </View>
                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <Ionicons name="star" size={14} color="#f59e0b" />
                                    <Text style={styles.statText}>{displaySeller.rating}</Text>
                                    <Text style={styles.statLabel}>({reviews.length} Ulasan)</Text>
                                </View>
                                <View style={styles.divider} />
                                <Text style={styles.statText}>{displaySeller.followers} Pengikut</Text>
                            </View>
                        </View>
                    </View>
                    {/* Admin Actions */}
                    {asAdmin && sellerData?.status === 'PENDING' && (
                        <View style={styles.adminActions}>
                            <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
                                <Text style={styles.verifyButtonText}>Verifikasi Toko</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
                                <Text style={styles.rejectButtonText}>Tolak</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tabItem, activeTab === 'products' && styles.activeTabItem]}
                        onPress={() => setActiveTab('products')}
                    >
                        <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>Produk</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabItem, activeTab === 'reviews' && styles.activeTabItem]}
                        onPress={() => setActiveTab('reviews')}
                    >
                        <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>Ulasan</Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.productsSection}>
                    {activeTab === 'products' ? (
                        loading ? (
                            <ActivityIndicator style={{ marginTop: 20 }} color={COLORS.primary} />
                        ) : products.length === 0 ? (
                            <View style={{ padding: 20, alignItems: 'center' }}>
                                <Text style={{ color: '#9ca3af' }}>Belum ada produk di etalase</Text>
                            </View>
                        ) : (
                            <View style={styles.productGrid}>
                                {products.map((item) => (
                                    <View key={item.id} style={styles.productCardWrapper}>
                                        <TouchableOpacity
                                            style={styles.productCard}
                                            activeOpacity={0.9}
                                            onPress={() => navigation.push('ProductDetail', { product: item })}
                                        >
                                            <Image
                                                source={{ uri: item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/150' }}
                                                style={styles.productImage}
                                                resizeMode="cover"
                                            />
                                            <View style={styles.productInfo}>
                                                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                                                <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
                                                <View style={styles.productMeta}>
                                                    <View style={styles.ratingRow}>
                                                        <Ionicons name="star" size={12} color="#f59e0b" />
                                                        <Text style={styles.ratingValue}>{item.rating || '4.0'}</Text>
                                                    </View>
                                                    <Text style={styles.soldValue}>{item.sold || '0'} Terjual</Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )
                    ) : (
                        renderReviews()
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#faf5f0',
        ...(Platform.OS === 'web' ? { flex: 0, height: 'auto', minHeight: '100vh' } : {})
    },
    headerWhite: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        ...SHADOWS.small,
        zIndex: 10,
    },
    backButtonSimple: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    profileSection: {
        padding: 20,
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    avatarContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#fef3c7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        position: 'relative',
    },
    avatarText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#b45309',
    },
    onlineStatus: {
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
    profileInfo: {
        flex: 1,
    },
    shopName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    locationText: {
        fontSize: 14,
        color: '#6b7280',
        marginLeft: 4,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
        marginLeft: 4,
        marginRight: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
    },
    divider: {
        width: 1,
        height: 14,
        backgroundColor: '#d1d5db',
        marginHorizontal: 10,
    },
    adminActions: {
        flexDirection: 'row',
        marginTop: 15,
        gap: 10,
    },
    verifyButton: {
        flex: 1,
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    verifyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    rejectButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ef4444',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    rejectButtonText: {
        color: '#ef4444',
        fontWeight: 'bold',
    },
    productsSection: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 15,
    },
    productGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
    },
    productCardWrapper: {
        width: COLUMN_WIDTH,
        paddingHorizontal: 8,
        marginBottom: 16,
    },
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        ...SHADOWS.small,
    },
    productImage: {
        width: '100%',
        height: 150,
        backgroundColor: '#f3f4f6',
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
        height: 40,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        borderWidth: 1,
        borderColor: '#86efac',
    },
    rejectText: {
        color: '#b91c1c',
        fontWeight: '600',
        fontSize: 15,
    },
    verifyText: {
        color: '#15803d',
        fontWeight: '600',
        fontSize: 15,
    },
});

export default SellerProfileScreen;
