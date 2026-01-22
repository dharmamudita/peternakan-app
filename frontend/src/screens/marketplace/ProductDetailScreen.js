/**
 * Product Detail Screen
 * Halaman detail produk marketplace
 */

import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, Dimensions, Platform, StatusBar, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { product } = route.params || {};

    // State dummy untuk interaksi UI
    const [isFavorite, setIsFavorite] = useState(false);
    const [quantity, setQuantity] = useState(1);

    // Dummy Reviews
    const reviews = [
        { id: '1', user: 'Budi Santoso', rating: 5, comment: 'Sapi sehat dan gemuk, mantap!', date: '2 hari lalu' },
        { id: '2', user: 'Siti Aminah', rating: 5, comment: 'Pengiriman cepat, respon penjual baik.', date: '1 minggu lalu' }
    ];

    // Dummy Related Products
    const relatedProducts = [
        { id: 'r1', name: 'Kambing Etawa Super', price: 3500000, image: null, rating: 4.7, sold: 45 },
        { id: 'r2', name: 'Domba Garut', price: 4200000, image: null, rating: 4.9, sold: 28 },
        { id: 'r3', name: 'Sapi Brahman', price: 18500000, image: null, rating: 4.6, sold: 10 },
    ];

    // Fallback jika tidak ada data product (misal reload di dev mode)
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

    const handleBuyNow = () => {
        // Nanti diintegrasikan dengan Midtrans / Checkout flow
        Alert.alert('Fitur Pembayaran', 'Akan segera diintegrasikan dengan Midtrans');
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

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
                style={{ flex: 1 }}
            >
                {/* Product Image Gallery */}
                <View style={styles.imageContainer}>
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="image-outline" size={64} color="#d1d5db" />
                        <Text style={{ color: '#9ca3af', marginTop: 10 }}>Gambar Produk</Text>
                    </View>
                    {/* Nanti diganti dengan Image component jika ada URL gambar */}
                    {/* <Image source={{ uri: product.image }} style={styles.image} /> */}
                </View>

                <View style={styles.content}>
                    {/* Title & Price */}
                    <View style={styles.section}>
                        <View style={styles.titleRow}>
                            <Text style={styles.price}>{formatPrice(product.price)}</Text>

                        </View>
                        <Text style={styles.title}>{product.name}</Text>

                        <View style={styles.metaRow}>
                            <View style={styles.ratingBox}>
                                <Ionicons name="star" size={14} color="#f59e0b" />
                                <Text style={styles.ratingText}>{product.rating} (120 Ulasan)</Text>
                            </View>
                            <View style={styles.separator} />
                            <Text style={styles.soldText}>{product.sold} Terjual</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Variant / Info (Optional) */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Detail Produk</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Kategori</Text>
                            <Text style={styles.infoValue}>{product.category}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Kondisi</Text>
                            <Text style={styles.infoValue}>{product.isNew ? 'Baru' : 'Bekas'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Lokasi</Text>
                            <Text style={styles.infoValue}>{product.location}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Deskripsi</Text>
                        <Text style={styles.description}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            {'\n\n'}
                            Cocok untuk kebutuhan peternakan Anda dengan kualitas terbaik dan terjamin kesehatannya.
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Seller Info */}
                    <View style={styles.sellerSection}>
                        <TouchableOpacity
                            style={styles.sellerRow}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('SellerProfile', { sellerId: 'dummy-id' })}
                        >
                            <View style={styles.sellerAvatar}>
                                <Text style={styles.sellerInitials}>TP</Text>
                            </View>
                            <View style={styles.sellerInfo}>
                                <Text style={styles.sellerName}>Toko Peternak Jaya</Text>
                                <View style={styles.sellerMeta}>
                                    <View style={styles.onlineBadge} />
                                    <Text style={styles.sellerStatus}>Online 5 menit lalu</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.chatButton}>
                                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#964b00" />
                                <Text style={styles.chatButtonText}>Chat</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    {/* Reviews Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Ulasan Pembeli ({product.rating})</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAllText}>Lihat Semua</Text>
                            </TouchableOpacity>
                        </View>
                        {reviews.map((review) => (
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
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Ionicons
                                            key={star}
                                            name={star <= review.rating ? "star" : "star-outline"}
                                            size={12}
                                            color="#f59e0b"
                                        />
                                    ))}
                                </View>
                                <Text style={styles.reviewComment}>{review.comment}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.divider} />

                    {/* Related Products */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Produk Serupa</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedList}>
                            {relatedProducts.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.relatedCard}
                                    onPress={() => navigation.push('ProductDetail', { product: { ...item, category: product.category, location: product.location, isNew: true } })}
                                >
                                    <View style={styles.relatedImage}>
                                        <Ionicons name="image-outline" size={24} color="#d1d5db" />
                                    </View>
                                    <View style={styles.relatedInfo}>
                                        <Text style={styles.relatedName} numberOfLines={2}>{item.name}</Text>
                                        <Text style={styles.relatedPrice}>{formatPrice(item.price)}</Text>
                                        <View style={styles.miniRating}>
                                            <Ionicons name="star" size={10} color="#f59e0b" />
                                            <Text style={styles.miniRatingText}>{item.rating}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
                <TouchableOpacity style={styles.cartButton}>
                    <Ionicons name="cart-outline" size={24} color="#964b00" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.buyButton} onPress={handleBuyNow}>
                    <LinearGradient
                        colors={['#964b00', '#7c3f06']}
                        style={styles.buyGradient}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.buyText}>Beli Sekarang</Text>
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
        ...(Platform.OS === 'web' ? { height: '100vh' } : {})
    },
    center: { justifyContent: 'center', alignItems: 'center' },

    // Header
    header: {
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20,
    },
    headerRight: { flexDirection: 'row', gap: 12 },
    iconButton: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center', justifyContent: 'center', ...SHADOWS.small
    },
    cartBadge: {
        position: 'absolute', top: -2, right: -2, backgroundColor: '#dc2626',
        width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center'
    },
    cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

    // Image
    imageContainer: { width: '100%', aspectRatio: 1, backgroundColor: '#f3f4f6', maxHeight: 500 },
    imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    image: { width: '100%', height: '100%', resizeMode: 'cover' },

    // Content
    content: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        marginTop: -24,
        paddingTop: 24,
        ...SHADOWS.medium
    },
    section: { paddingHorizontal: 20, marginBottom: 16 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    price: { fontSize: 24, fontWeight: '800', color: '#964b00' },
    title: { fontSize: 18, color: '#1f2937', lineHeight: 26, marginBottom: 8 },
    metaRow: { flexDirection: 'row', alignItems: 'center' },
    ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { fontSize: 13, color: '#4b5563' },
    separator: { width: 1, height: 12, backgroundColor: '#d1d5db', marginHorizontal: 8 },
    soldText: { fontSize: 13, color: '#6b7280' },

    divider: { height: 8, backgroundColor: '#f9fafb', marginBottom: 16 },

    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    infoLabel: { color: '#6b7280', fontSize: 14 },
    infoValue: { color: '#111827', fontSize: 14, fontWeight: '500' },

    description: { fontSize: 14, color: '#4b5563', lineHeight: 22 },

    // Seller
    sellerSection: { paddingHorizontal: 20, marginBottom: 20 },
    sellerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
    sellerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fed7aa', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    sellerInitials: { fontSize: 18, fontWeight: 'bold', color: '#9a3412' },
    sellerInfo: { flex: 1 },
    sellerName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
    sellerMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    onlineBadge: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' },
    sellerStatus: { fontSize: 12, color: '#10b981' },
    chatButton: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 12, paddingVertical: 8,
        borderRadius: 8, borderWidth: 1, borderColor: '#964b00',
    },
    chatButtonText: { fontSize: 13, fontWeight: '600', color: '#964b00' },

    // Bottom Bar
    bottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb',
        flexDirection: 'row', paddingHorizontal: 20, paddingTop: 12,
        ...SHADOWS.top
    },
    cartButton: {
        width: 48, height: 48, borderRadius: 12,
        borderWidth: 1, borderColor: '#d1d5db',
        alignItems: 'center', justifyContent: 'center',
        marginRight: 12,
    },
    buyButton: { flex: 1, borderRadius: 12, overflow: 'hidden' },
    buyGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    buyText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    // Reviews Styling
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    seeAllText: { fontSize: 13, color: '#964b00', fontWeight: '600' },
    reviewCard: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    reviewUser: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    reviewAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
    reviewAvatarText: { fontSize: 14, fontWeight: '700', color: '#6b7280' },
    reviewName: { fontSize: 13, fontWeight: '600', color: '#111827' },
    reviewDate: { fontSize: 11, color: '#9ca3af' },
    ratingRow: { flexDirection: 'row', marginBottom: 6, gap: 2 },
    reviewComment: { fontSize: 13, color: '#4b5563', lineHeight: 20 },

    // Related Styling
    relatedList: { paddingRight: 20, gap: 12 },
    relatedCard: { width: 140, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' },
    relatedImage: { height: 100, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' },
    relatedInfo: { padding: 8 },
    relatedName: { fontSize: 12, fontWeight: '600', color: '#111827', marginBottom: 4, height: 32 },
    relatedPrice: { fontSize: 13, fontWeight: '700', color: '#964b00', marginBottom: 4 },
    miniRating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    miniRatingText: { fontSize: 10, color: '#6b7280' },
});

export default ProductDetailScreen;
