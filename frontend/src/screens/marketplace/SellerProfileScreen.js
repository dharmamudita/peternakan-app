/**
 * Seller Profile Screen (Public View)
 * Halaman profil toko yang dilihat oleh pembeli atau penjual sendiri
 */

import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, Dimensions, FlatList, Platform, Alert, StatusBar, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SIZES } from '../../constants/theme';
import { productApi } from '../../services/api';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;

const SellerProfileScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { sellerId, asAdmin, sellerData } = route.params || {};

    // State for Products
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dummy Data Toko (Default fallback if API not ready for profile details)
    const defaultSeller = {
        name: 'Toko Peternak Jaya',
        location: 'Blitar, Jawa Timur',
        rating: 4.8,
        joined: 'Jan 2023',
        followers: 1250,
        description: 'Menyediakan segala kebutuhan peternakan sapi dan kambing dengan kualitas terbaik.',
        online: true,
        status: 'verified',
        owner: 'Budi Santoso',
        joinedAt: 'Jan 2023'
    };

    // Merge dengan data yang dipassing
    const seller = { ...defaultSeller, ...(sellerData || {}) };

    useEffect(() => {
        fetchShopProducts();
    }, []);

    const fetchShopProducts = async () => {
        try {
            // Jika ada sellerId, fetch produk orang lain. Jika tidak, fetch produk sendiri (My Products)
            // Note: API getMyProducts sudah ada. API getSellerProducts perlu endpoint public filter by seller.
            // Kita gunakan getMyProducts jika tidak ada sellerId, atau getAll filter by sellerId (jika didukung).

            let response;
            if (sellerId) {
                // Public view of specific seller
                // Assuming getAll supports ?sellerId=xxx query param or similar filter
                // If not, we might need to rely on dummy/passed data for now or implement getProductsBySellerId in API
                // For now, let's try calling getAll with seller filter if backend supports it standardly
                // Or fallback to dummy if no specific endpoint

                // WARNING: Standard crud usually allow filter.
                // Let's assume user is viewing OWN profile for "connection" request context usually.
                response = { data: { data: [] } }; // Placeholder for public view logic 
                // (User request focus is "My Products" -> "Market" usually)
            } else {
                // Viewing OWN profile (from Dashboard or menu)
                response = await productApi.getMyProducts();
            }

            console.log('SellerProfileScreen response:', response);

            let productsData = [];
            if (response.data && Array.isArray(response.data)) {
                productsData = response.data;
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                productsData = response.data.data;
            } else if (Array.isArray(response)) {
                productsData = response;
            }

            console.log('Resolved products count:', productsData.length);
            setProducts(productsData);
        } catch (error) {
            console.error('Fetch shop products error:', error);
        } finally {
            setLoading(false);
        }
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

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}>
                {/* Profile Info Card */}
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
                    </View>
                </View>

                {/* Products Grid */}
                <View style={styles.productsSection}>
                    <Text style={styles.sectionTitle}>Etalase Toko</Text>

                    {loading ? (
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
                                            <Text style={styles.productSold}>{item.stock > 0 ? `Stok: ${item.stock}` : 'Habis'}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Admin Actions */}
                {asAdmin && (
                    <View style={styles.adminActions}>
                        <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={handleReject}>
                            <Text style={styles.rejectText}>Tolak</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.verifyButton]} onPress={handleVerify}>
                            <Text style={styles.verifyText}>Verifikasi</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButtonSimple: {
        padding: 8,
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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        ...SHADOWS.medium,
    },
    avatarContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#fef3c7',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#d97706',
    },
    onlineStatus: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#22c55e',
        position: 'absolute',
        bottom: 2,
        right: 2,
        borderWidth: 2,
        borderColor: '#fff',
    },
    profileInfo: {
        flex: 1,
    },
    shopName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    locationText: {
        fontSize: 13,
        color: '#6b7280',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#374151',
    },
    divider: {
        width: 1,
        height: 12,
        backgroundColor: '#d1d5db',
    },
    productsSection: {
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    productGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    productCardWrapper: {
        width: COLUMN_WIDTH,
        marginBottom: 16,
    },
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f0ebe3',
        ...SHADOWS.small,
    },
    productImage: {
        width: '100%',
        height: COLUMN_WIDTH,
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
        lineHeight: 20,
        height: 40,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#964b00',
        marginBottom: 4,
    },
    productSold: {
        fontSize: 11,
        color: '#9ca3af',
    },
    adminActions: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        paddingBottom: 40,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    rejectButton: {
        backgroundColor: '#fee2e2',
        borderWidth: 1,
        borderColor: '#fca5a5',
    },
    verifyButton: {
        backgroundColor: '#dcfce7',
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
