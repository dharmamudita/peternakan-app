/**
 * Product Detail Screen
 * Halaman detail produk marketplace
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, Dimensions, Platform, StatusBar, Alert, Animated, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { orderApi, shopApi } from '../../services/api';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { product } = route.params || {};

    // Animation Values (Standard RN Animated)
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    // State dummy untuk interaksi UI
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        // Start Entry Animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                // Di Web, transform translateY support native driver
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    // Dummy Reviews
    const reviews = [
        { id: '1', user: 'Budi Santoso', rating: 5, comment: 'Sapi sehat dan gemuk, mantap!', date: '2 hari lalu' },
        { id: '2', user: 'Siti Aminah', rating: 5, comment: 'Pengiriman cepat, respon penjual baik.', date: '1 minggu lalu' }
    ];

    // Fallback jika tidak ada data product
    if (!product) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text>Produk tidak ditemukan</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: COLORS.primary }}>Kembali</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(price);
    };

    // State for buying
    const [isBuying, setIsBuying] = useState(false);

    // Shop state
    const [shop, setShop] = useState(null);
    const [loadingShop, setLoadingShop] = useState(false);

    useEffect(() => {
        const fetchShop = async () => {
            if (product?.shopId) {
                setLoadingShop(true);
                try {
                    const response = await shopApi.getById(product.shopId);
                    if (response.data) {
                        setShop(response.data);
                    }
                } catch (error) {
                    console.log('Error fetching shop:', error);
                } finally {
                    setLoadingShop(false);
                }
            }
        };

        if (product) {
            fetchShop(); // Fetch shop details
        }
    }, [product]);

    const showAlert = (title, message) => {
        if (Platform.OS === 'web') {
            window.alert(`${title}\n\n${message}`);
        } else {
            Alert.alert(title, message);
        }
    };

    const handleBuyNow = async () => {
        const confirmBuy = async () => {
            setIsBuying(true);
            try {
                await orderApi.create({
                    productId: product.id,
                    quantity: 1,
                });
                showAlert('Pembelian Berhasil! 🎉', 'Pesanan Anda telah dibuat. Penjual akan segera memproses pesanan Anda.');
                navigation.navigate('OrderHistory');
            } catch (error) {
                console.error('Buy error:', error);
                showAlert('Gagal', error.message || 'Gagal membuat pesanan');
            } finally {
                setIsBuying(false);
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm(`Beli ${product.name} seharga ${formatPrice(product.price)}?`)) {
                await confirmBuy();
            }
        } else {
            Alert.alert(
                'Konfirmasi Pembelian',
                `Beli ${product.name} seharga ${formatPrice(product.price)}?`,
                [
                    { text: 'Batal', style: 'cancel' },
                    { text: 'Beli', onPress: confirmBuy }
                ]
            );
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header Floating */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>

                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="share-social-outline" size={24} color="#374151" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Cart')}>
                        <Ionicons name="cart-outline" size={24} color="#374151" />
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>2</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main Scroll Content */}
            {/* Height 100% on ScrollView is crucial for scrolling in flex containers */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
            >
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                    {/* Product Image Gallery */}
                    <View style={styles.imageContainer}>
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="image-outline" size={64} color="#d1d5db" />
                            <Text style={{ color: '#9ca3af', marginTop: 10 }}>Gambar Produk</Text>
                        </View>
                        {/* Tags */}
                        <View style={styles.tagsContainer}>
                            {product.isNew && (
                                <View style={[styles.tag, { backgroundColor: '#10b981' }]}>
                                    <Text style={styles.tagText}>Baru</Text>
                                </View>
                            )}
                            {product.promo && (
                                <View style={[styles.tag, { backgroundColor: '#ef4444' }]}>
                                    <Text style={styles.tagText}>Promo</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Product Info Section - Curved Top */}
                    <View style={styles.infoContainer}>
                        <View style={styles.section}>
                            <View style={styles.titleRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.price}>{formatPrice(product.price)}</Text>
                                    <Text style={styles.title}>{product.name}</Text>
                                </View>
                                <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
                                    <Ionicons
                                        name={isFavorite ? "heart" : "heart-outline"}
                                        size={28}
                                        color={isFavorite ? "#ef4444" : "#9ca3af"}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.metaRow}>
                                <View style={styles.ratingBox}>
                                    <Ionicons name="star" size={16} color="#f59e0b" />
                                    <Text style={styles.ratingText}>{product.rating || '4.8'} (24 ulasan)</Text>
                                </View>
                                <View style={styles.separator} />
                                <Text style={styles.soldText}>{product.sold || '0'} Terjual</Text>
                                <View style={styles.separator} />
                                <Ionicons name="location-outline" size={14} color="#6b7280" />
                                <Text style={[styles.soldText, { marginLeft: 2 }]}>{product.location || 'Jawa Timur'}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />



                        {/* Seller Info */}
                        {/* Seller Info */}
                        <TouchableOpacity
                            style={styles.sellerSection}
                            onPress={() => navigation.navigate('SellerProfile', { sellerId: product.sellerId, sellerData: shop })}
                            disabled={!shop} // Disable if no shop data
                        >
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Informasi Penjual</Text>
                            </View>
                            <View style={styles.sellerRow}>
                                <View style={styles.sellerAvatar}>
                                    <Text style={styles.sellerInitials}>
                                        {shop ? shop.name.substring(0, 2).toUpperCase() : (product.sellerName ? product.sellerName.substring(0, 2).toUpperCase() : 'TK')}
                                    </Text>
                                </View>
                                <View style={styles.sellerInfo}>
                                    <View>
                                        <Text style={styles.sellerName}>
                                            {loadingShop ? 'Memuat...' : (shop ? shop.name : (product.sellerName || 'Nama Toko'))}
                                        </Text>
                                        {shop?.status === 'VERIFIED' && <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} style={{ marginLeft: 4, marginTop: 2 }} />}
                                    </View>
                                    <View style={styles.sellerMeta}>
                                        <View style={[styles.onlineBadge, { backgroundColor: '#10b981' }]} />
                                        <Text style={styles.sellerStatus}>Online</Text>
                                        <Text style={{ color: '#d1d5db' }}>•</Text>
                                        <Text style={{ fontSize: 12, color: '#6b7280' }}>
                                            {shop ? shop.address.split(',')[0] : 'Lokasi'}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.chatButton}>
                                    <Ionicons name="chatbubble-ellipses-outline" size={16} color="#964b00" />
                                    <Text style={styles.chatButtonText}>Chat</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        {/* Product Details */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Detail Produk</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Kategori</Text>
                                <Text style={styles.infoValue}>{product.category || 'Sapi'}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Berat</Text>
                                <Text style={styles.infoValue}>350 Kg</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Umur</Text>
                                <Text style={styles.infoValue}>2.5 Tahun</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Stok</Text>
                                <Text style={styles.infoValue}>5 Ekor</Text>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Deskripsi</Text>
                            <Text style={styles.description}>
                                Sapi Limosin kualitas super, sehat dan sudah vaksin lengkap.
                                Cocok untuk penggemukan atau kurban. Pakan terjamin fermentasi dan konsentrat.
                                Siap kirim ke seluruh area Jawa Timur. Garansi kesehatan sampai tujuan.
                            </Text>
                        </View>

                        <View style={styles.divider} />

                        {/* Reviews */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Ulasan Pembeli</Text>
                                <TouchableOpacity>
                                    <Text style={styles.seeAllText}>Lihat Semua</Text>
                                </TouchableOpacity>
                            </View>
                            {reviews.map(review => (
                                <View key={review.id} style={styles.reviewCard}>
                                    <View style={styles.reviewHeader}>
                                        <View style={styles.reviewUser}>
                                            <View style={styles.reviewAvatar}>
                                                <Text style={styles.reviewAvatarText}>{review.user.charAt(0)}</Text>
                                            </View>
                                            <Text style={styles.reviewName}>{review.user}</Text>
                                        </View>
                                        <Text style={styles.reviewDate}>{review.date}</Text>
                                    </View>
                                    <View style={styles.ratingRow}>
                                        {[...Array(5)].map((_, i) => (
                                            <Ionicons key={i} name="star" size={12} color="#f59e0b" />
                                        ))}
                                    </View>
                                    <Text style={styles.reviewComment}>{review.comment}</Text>
                                </View>
                            ))}
                        </View>

                    </View>
                </Animated.View>
            </ScrollView>

            {/* Bottom Bar Fixed */}
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
                <TouchableOpacity style={styles.cartButton}>
                    <Ionicons name="chatbubbles-outline" size={24} color="#374151" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.buyButton, isBuying && { opacity: 0.7 }]}
                    onPress={handleBuyNow}
                    disabled={isBuying}
                >
                    <LinearGradient
                        colors={['#b87333', '#964b00']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.buyGradient}
                    >
                        {isBuying ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.buyText}>Beli Sekarang</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        ...(Platform.OS === 'web' ? { flex: 0, height: 'auto', minHeight: '100vh' } : {})
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.small,
    },
    cartBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#ef4444',
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    cartBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    imageContainer: {
        height: 350,
        backgroundColor: '#f3f4f6',
        position: 'relative',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tagsContainer: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        flexDirection: 'row',
        gap: 8,
    },
    tag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    infoContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -24,
        paddingTop: 24,
        ...SHADOWS.medium,
        minHeight: 500, // Ensure content has height
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    price: {
        fontSize: 24,
        fontWeight: '800',
        color: '#964b00',
    },
    title: {
        fontSize: 18,
        color: '#1f2937',
        lineHeight: 26,
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 13,
        color: '#4b5563',
    },
    separator: {
        width: 1,
        height: 12,
        backgroundColor: '#d1d5db',
        marginHorizontal: 8,
    },
    soldText: {
        fontSize: 13,
        color: '#6b7280',
    },
    divider: {
        height: 8,
        backgroundColor: '#f9fafb',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    infoLabel: {
        color: '#6b7280',
        fontSize: 14,
    },
    infoValue: {
        color: '#111827',
        fontSize: 14,
        fontWeight: '500',
    },
    description: {
        fontSize: 14,
        color: '#4b5563',
        lineHeight: 22,
    },
    // Seller
    sellerSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sellerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    sellerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fed7aa',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    sellerInitials: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#9a3412',
    },
    sellerInfo: {
        flex: 1,
    },
    sellerName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    sellerMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    onlineBadge: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10b981',
    },
    sellerStatus: {
        fontSize: 12,
        color: '#10b981',
    },
    chatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#964b00',
    },
    chatButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#964b00',
    },
    // Bottom Bar
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 12,
        ...SHADOWS.top,
    },
    cartButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    buyButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    buyGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buyText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    // Reviews
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    seeAllText: {
        fontSize: 13,
        color: '#964b00',
        fontWeight: '600',
    },
    reviewCard: {
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    reviewUser: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    reviewAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#e5e7eb',
        alignItems: 'center',
        justifyContent: 'center',
    },
    reviewAvatarText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6b7280',
    },
    reviewName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#111827',
    },
    reviewDate: {
        fontSize: 11,
        color: '#9ca3af',
    },
    ratingRow: {
        flexDirection: 'row',
        marginBottom: 6,
        gap: 2,
    },
    reviewComment: {
        fontSize: 13,
        color: '#4b5563',
        lineHeight: 20,
    },
});

export default ProductDetailScreen;
