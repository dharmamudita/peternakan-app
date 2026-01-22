/**
 * Marketplace Screen
 * Halaman jual beli untuk pembeli (tanpa tombol jual)
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - SIZES.padding * 2 - 12) / 2;

const MarketplaceScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');

    const categories = [
        { id: 'Semua', icon: 'apps' },
        { id: 'Hewan', icon: 'paw' },
        { id: 'Pakan', icon: 'leaf' },
        { id: 'Obat', icon: 'medkit' },
        { id: 'Peralatan', icon: 'construct' },
    ];

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

    const products = [
        {
            id: '1',
            name: 'Sapi Limosin Dewasa',
            price: 25000000,
            category: 'Hewan',
            location: 'Blitar, Jatim',
            rating: 4.8,
            sold: 12,
            isNew: true,
        },
        {
            id: '2',
            name: 'Pakan Konsentrat Comfeed',
            price: 350000,
            category: 'Pakan',
            location: 'Sidoarjo, Jatim',
            rating: 4.9,
            sold: 154,
            isNew: false,
        },
        {
            id: '3',
            name: 'Vitamin Ternak Organik',
            price: 75000,
            category: 'Obat',
            location: 'Malang, Jatim',
            rating: 4.7,
            sold: 89,
            isNew: true,
        },
        {
            id: '4',
            name: 'Mesin Chopper Rumput',
            price: 3500000,
            category: 'Peralatan',
            location: 'Kediri, Jatim',
            rating: 5.0,
            sold: 5,
            isNew: false,
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
        const colors = {
            'Hewan': '#964b00',
            'Pakan': '#7c3f06',
            'Obat': '#b87333',
            'Peralatan': '#5d3a1a',
        };
        return colors[category] || COLORS.primary;
    };

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
            product.location.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
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
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="cart-outline" size={22} color="#374151" />
                                <View style={styles.cartBadge}>
                                    <Text style={styles.badgeText}>2</Text>
                                </View>
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
                            placeholder="Cari produk, hewan, pakan..."
                            placeholderTextColor="#9ca3af"
                            value={search}
                            onChangeText={setSearch}
                        />
                        <TouchableOpacity style={styles.filterButton}>
                            <Ionicons name="options-outline" size={20} color="#374151" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Categories */}
                <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesContainer}
                    >
                        {categories.map((category, index) => (
                            <TouchableOpacity
                                key={category.id}
                                style={[
                                    styles.categoryItem,
                                    selectedCategory === category.id && styles.categoryItemActive
                                ]}
                                onPress={() => setSelectedCategory(category.id)}
                            >
                                <Ionicons
                                    name={category.icon}
                                    size={18}
                                    color={selectedCategory === category.id ? '#ffffff' : '#6b7280'}
                                />
                                <Text style={[
                                    styles.categoryText,
                                    selectedCategory === category.id && styles.categoryTextActive
                                ]}>{category.id}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>

                {/* Promo Banners */}
                <Animated.View entering={FadeInDown.duration(400).delay(300)}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.bannerContainer}
                    >
                        {banners.map((banner, index) => (
                            <Animated.View
                                key={banner.id}
                                entering={FadeInRight.delay(index * 100).duration(400)}
                            >
                                <TouchableOpacity activeOpacity={0.9}>
                                    <LinearGradient
                                        colors={banner.gradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.banner}
                                    >
                                        <View style={styles.bannerDecor1} />
                                        <View style={styles.bannerDecor2} />
                                        <View style={styles.bannerContent}>
                                            <Text style={styles.bannerTitle}>{banner.title}</Text>
                                            <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                                            <View style={styles.bannerButton}>
                                                <Text style={styles.bannerButtonText}>Lihat</Text>
                                                <Ionicons name="arrow-forward" size={14} color="#ffffff" />
                                            </View>
                                        </View>
                                        <View style={styles.bannerIconContainer}>
                                            <Ionicons name={banner.icon} size={60} color="rgba(255,255,255,0.15)" />
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </ScrollView>
                </Animated.View>

                {/* Section Header */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Produk Terbaru</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAll}>Lihat Semua</Text>
                    </TouchableOpacity>
                </View>

                {/* Products Grid */}
                <View style={styles.productsGrid}>
                    {filteredProducts.map((product, index) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            index={index}
                            formatPrice={formatPrice}
                            getCategoryColor={getCategoryColor}
                            onPress={() => navigation.navigate('ProductDetail', { product })}
                        />
                    ))}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const ProductCard = ({ product, index, formatPrice, getCategoryColor, onPress }) => (
    <Animated.View
        entering={FadeInUp.delay(index * 80).duration(400)}
        style={styles.productCardWrapper}
    >
        <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
            <View style={styles.productCard}>
                {/* Image Placeholder */}
                <View style={styles.productImage}>
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="image-outline" size={32} color="#d1d5db" />
                    </View>
                    {product.isNew && (
                        <View style={styles.newBadge}>
                            <Text style={styles.newBadgeText}>Baru</Text>
                        </View>
                    )}
                    <TouchableOpacity style={styles.favoriteButton}>
                        <Ionicons name="heart-outline" size={18} color="#964b00" />
                    </TouchableOpacity>
                </View>

                {/* Product Info */}
                <View style={styles.productInfo}>
                    <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(product.category) + '15' }]}>
                        <Text style={[styles.categoryBadgeText, { color: getCategoryColor(product.category) }]}>
                            {product.category}
                        </Text>
                    </View>
                    <Text numberOfLines={2} style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>

                    <View style={styles.productMeta}>
                        <View style={styles.locationRow}>
                            <Ionicons name="location" size={11} color="#9ca3af" />
                            <Text numberOfLines={1} style={styles.locationText}>{product.location}</Text>
                        </View>
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={11} color="#f59e0b" />
                            <Text style={styles.ratingText}>{product.rating}</Text>
                            <Text style={styles.soldText}>• {product.sold} terjual</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    </Animated.View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        paddingHorizontal: SIZES.padding,
        paddingTop: 8,
        paddingBottom: 16,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {},
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
        gap: 8,
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
    filterButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
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
        backgroundColor: 'rgba(255,255,255,0.08)',
        bottom: -15,
        left: 30,
    },
    bannerContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    bannerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: 4,
    },
    bannerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        width: 160,
    },
    bannerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    bannerButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ffffff',
    },
    bannerIconContainer: {
        position: 'absolute',
        right: 16,
        bottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    seeAll: {
        fontSize: 14,
        color: '#964b00',
        fontWeight: '600',
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: SIZES.padding,
        gap: 12,
    },
    productCardWrapper: {
        width: COLUMN_WIDTH,
    },
    productCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f0ebe3',
        ...SHADOWS.small,
    },
    productImage: {
        height: COLUMN_WIDTH - 20,
        backgroundColor: '#faf8f5',
        position: 'relative',
    },
    imagePlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    newBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: '#964b00',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    newBadgeText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '700',
    },
    favoriteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.small,
    },
    productInfo: {
        padding: 14,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginBottom: 8,
    },
    categoryBadgeText: {
        fontSize: 10,
        fontWeight: '600',
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 6,
        height: 40,
        lineHeight: 20,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '800',
        color: '#964b00',
        marginBottom: 10,
    },
    productMeta: {
        gap: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 11,
        color: '#9ca3af',
        flex: 1,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#374151',
    },
    soldText: {
        fontSize: 11,
        color: '#9ca3af',
    },
});

export default MarketplaceScreen;
