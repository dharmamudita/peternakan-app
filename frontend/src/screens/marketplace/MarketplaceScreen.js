/**
 * Marketplace Screen
 * Halaman jual beli untuk pembeli
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    TextInput,
    Image,
    Platform,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInUp, FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { productApi } from '../../services/api';

const { width } = Dimensions.get('window');
// Responsive column width calculation
const COLUMN_WIDTH = width > 768
    ? (width - SIZES.padding * 2 - 24) / 4 // Desktop: 4 columns
    : (width - SIZES.padding * 2 - 12) / 2; // Mobile: 2 columns

const MarketplaceScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const categories = [
        { id: 'Semua', icon: 'apps' },
        { id: 'sapi', label: 'Sapi', icon: 'paw' },
        { id: 'kambing', label: 'Kambing', icon: 'paw' },
        { id: 'ayam', label: 'Ayam', icon: 'egg' },
        { id: 'pakan', label: 'Pakan', icon: 'leaf' },
        { id: 'obat', label: 'Obat', icon: 'medkit' },
        { id: 'alat', label: 'Alat', icon: 'construct' },
    ];

    const fetchProducts = async () => {
        try {
            // Fetch all products (active)
            const response = await productApi.getAll({ status: 'active', limit: 100 });
            let productsData = [];
            if (response.data && Array.isArray(response.data)) {
                productsData = response.data;
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                productsData = response.data.data;
            } else if (Array.isArray(response)) {
                productsData = response;
            }
            setProducts(productsData);
        } catch (error) {
            console.error('Fetch products error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProducts();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchProducts();
    };

    const banners = [
        {
            id: '1',
            title: 'Diskon Spesial!',
            subtitle: 'Hingga 50% untuk Pakan Ternak',
            gradient: ['#964b00', '#7c3f06'],
            icon: 'pricetag',
        },
        {
            id: '2',
            title: 'Sapi Unggulan',
            subtitle: 'Kualitas Terbaik untuk Qurban',
            gradient: ['#7c3f06', '#5d3a1a'],
            icon: 'trophy',
        },
    ];

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getCategoryColor = (category) => {
        // Simple hashing color or predefined
        return COLORS.primary;
    };

    // Client-side filtering
    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100, paddingTop: insets.top }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Header */}
                <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
                    <View style={styles.headerTop}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.headerSubtitle}>Jual Beli Online 🛒</Text>
                            <Text style={styles.headerTitle}>Marketplace</Text>
                        </View>
                        <View style={styles.headerRight}>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="heart-outline" size={22} color="#374151" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => navigation.navigate('Cart')}
                            >
                                <Ionicons name="cart-outline" size={22} color="#374151" />
                                {/* TODO: Cart Count Integration */}
                                {/* <View style={styles.cartBadge}>
                                    <Text style={styles.badgeText}>2</Text>
                                </View> */}
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>

                {/* Search Bar */}
                <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="#9ca3af" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Cari hewan, pakan, atau alat..."
                            placeholderTextColor="#9ca3af"
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                </Animated.View>

                {/* Categories */}
                <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesContainer}
                    >
                        {categories.map((item, index) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.categoryItem,
                                    selectedCategory === item.id && styles.categoryItemActive,
                                ]}
                                onPress={() => setSelectedCategory(item.id)}
                            >
                                <Ionicons
                                    name={item.icon}
                                    size={18}
                                    color={selectedCategory === item.id ? '#ffffff' : '#6b7280'}
                                />
                                <Text
                                    style={[
                                        styles.categoryText,
                                        selectedCategory === item.id && styles.categoryTextActive,
                                    ]}
                                >
                                    {item.label || item.id}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>

                {/* Banners */}
                <Animated.View entering={FadeInRight.duration(500).delay(300)}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.bannerContainer}
                        snapToInterval={width - 40}
                        decelerationRate="fast"
                    >
                        {banners.map((item) => (
                            <TouchableOpacity key={item.id} activeOpacity={0.9}>
                                <LinearGradient
                                    colors={item.gradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.banner}
                                >
                                    <View style={styles.bannerDecor1} />
                                    <View style={styles.bannerDecor2} />
                                    <View style={styles.bannerContent}>
                                        <View style={styles.bannerIcon}>
                                            <Ionicons name={item.icon} size={24} color="#ffffff" />
                                        </View>
                                        <View>
                                            <Text style={styles.bannerTitle}>{item.title}</Text>
                                            <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
                                        </View>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>

                {/* Products Grid */}
                <View style={styles.productsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            {search ? 'Hasil Pencarian' : selectedCategory === 'Semua' ? 'Rekomendasi' : selectedCategory}
                        </Text>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
                    ) : filteredProducts.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="cube-outline" size={48} color="#d1d5db" />
                            <Text style={styles.emptyText}>Tidak ada produk ditemukan</Text>
                        </View>
                    ) : (
                        <View style={styles.productsGrid}>
                            {filteredProducts.map((item, index) => (
                                <Animated.View key={item.id} entering={FadeInUp.delay(index * 100).duration(500)}>
                                    <TouchableOpacity
                                        style={styles.productCard}
                                        activeOpacity={0.9}
                                        onPress={() => navigation.navigate('ProductDetail', { product: item })}
                                    >
                                        <View style={styles.imageContainer}>
                                            <Image
                                                source={{
                                                    uri: item.images && item.images.length > 0
                                                        ? item.images[0]
                                                        : 'https://via.placeholder.com/300'
                                                }}
                                                style={styles.productImage}
                                                resizeMode="cover"
                                            />
                                            <View style={styles.ratingBadge}>
                                                <Ionicons name="star" size={10} color="#fbbf24" />
                                                <Text style={styles.ratingText}>{item.rating > 0 ? item.rating : 'Baru'}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.productInfo}>
                                            <Text style={styles.productName} numberOfLines={2}>
                                                {item.name}
                                            </Text>
                                            <Text style={styles.productPrice}>
                                                {formatPrice(item.price)}
                                            </Text>
                                            <View style={styles.locationRow}>
                                                <Ionicons name="location-outline" size={12} color="#9ca3af" />
                                                <Text style={styles.locationText} numberOfLines={1}>
                                                    {item.location || 'Indonesia'}
                                                </Text>
                                            </View>
                                            <View style={styles.productFooter}>
                                                <Text style={styles.soldText}>Stok: {item.stock}</Text>
                                                <TouchableOpacity style={styles.addButton}>
                                                    <Ionicons name="add" size={16} color="#ffffff" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
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
        backgroundColor: '#ffffff',
        ...(Platform.OS === 'web' ? { flex: 0, height: 'auto', minHeight: '100vh' } : {})
    },
    header: {
        paddingHorizontal: SIZES.padding,
        paddingBottom: 16,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 2,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: -0.5,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#faf8f5',
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.small,
    },
    cartBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#964b00',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#ffffff',
    },
    searchContainer: {
        paddingHorizontal: SIZES.padding,
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#faf8f5',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: '#f0ebe3',
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
    },
    categoriesContainer: {
        paddingHorizontal: SIZES.padding,
        gap: 10,
        marginBottom: 20,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: '#faf8f5',
        borderWidth: 1,
        borderColor: '#f0ebe3',
    },
    categoryItemActive: {
        backgroundColor: '#964b00',
        borderColor: '#964b00',
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6b7280',
    },
    categoryTextActive: {
        color: '#ffffff',
    },
    bannerContainer: {
        paddingHorizontal: SIZES.padding,
        gap: 12,
        marginBottom: 24,
    },
    banner: {
        width: width - 80,
        height: 140,
        borderRadius: 20,
        padding: 20,
        overflow: 'hidden',
        position: 'relative',
    },
    bannerDecor1: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.1)',
        top: -30,
        right: -20,
    },
    bannerDecor2: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.1)',
        bottom: 20,
        left: 20,
    },
    bannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        height: '100%',
    },
    bannerIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bannerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: 4,
    },
    bannerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
    },
    productsSection: {
        paddingHorizontal: SIZES.padding,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    productCard: {
        width: COLUMN_WIDTH,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f0ebe3',
        overflow: 'hidden',
        ...SHADOWS.small,
        marginBottom: 12,
    },
    imageContainer: {
        height: COLUMN_WIDTH,
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f3f4f6',
    },
    ratingBadge: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    ratingText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#ffffff',
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 6,
        height: 40,
    },
    productPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#964b00',
        marginBottom: 8,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    locationText: {
        fontSize: 11,
        color: '#9ca3af',
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    soldText: {
        fontSize: 11,
        color: '#6b7280',
    },
    addButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#964b00',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 12,
        color: '#9ca3af',
        fontWeight: '500',
    },
});

export default MarketplaceScreen;
