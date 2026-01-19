/**
 * Marketplace Screen
 * Halaman jual beli produk peternakan
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, SIZES, SHADOWS } from '../../constants/theme';
import { Header, Card, Input, Button } from '../../components/common';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - SIZES.padding * 2 - 16) / 2;

const MarketplaceScreen = ({ navigation }) => {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');

    const categories = ['Semua', 'Hewan', 'Pakan', 'Obat', 'Peralatan', 'Lainnya'];

    const products = [
        {
            id: '1',
            name: 'Sapi Limosin Dewasa',
            price: 'Rp 25.000.000',
            category: 'Hewan',
            location: 'Blitar, Jatim',
            rating: 4.8,
            sold: 12,
            image: 'https://via.placeholder.com/300', // Placeholder
            isNew: true,
        },
        {
            id: '2',
            name: 'Pakan Konsentrat Comfeed',
            price: 'Rp 350.000',
            category: 'Pakan',
            location: 'Sidoarjo, Jatim',
            rating: 4.9,
            sold: 154,
            image: 'https://via.placeholder.com/300',
            isNew: false,
        },
        {
            id: '3',
            name: 'Vitamin Ternak Organik',
            price: 'Rp 75.000',
            category: 'Obat',
            location: 'Malang, Jatim',
            rating: 4.7,
            sold: 89,
            image: 'https://via.placeholder.com/300',
            isNew: true,
        },
        {
            id: '4',
            name: 'Mesin Chopper Rumput',
            price: 'Rp 3.500.000',
            category: 'Peralatan',
            location: 'Kediri, Jatim',
            rating: 5.0,
            sold: 5,
            image: 'https://via.placeholder.com/300',
            isNew: false,
        },
    ];

    const renderCategoryItem = ({ item, index }) => {
        const isSelected = item === selectedCategory;
        return (
            <TouchableOpacity
                onPress={() => setSelectedCategory(item)}
                style={[
                    styles.categoryItem,
                    isSelected && styles.categoryItemSelected,
                    { marginRight: index === categories.length - 1 ? SIZES.padding : 12 }
                ]}
            >
                <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                    {item}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderProductCard = ({ item, index }) => (
        <Animated.View entering={FadeInUp.delay(index * 100).duration(500)}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => { }}>
                <Card style={styles.productCard}>
                    <View style={styles.imageContainer}>
                        {/* Placeholder Image Overlay */}
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="image-outline" size={32} color={COLORS.gray} />
                        </View>
                        {item.isNew && (
                            <View style={styles.newBadge}>
                                <Text style={styles.newText}>Baru</Text>
                            </View>
                        )}
                        <TouchableOpacity style={styles.favoriteBtn}>
                            <Ionicons name="heart-outline" size={20} color={COLORS.error} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.productInfo}>
                        <Text style={styles.categoryLabel}>{item.category}</Text>
                        <Text numberOfLines={2} style={styles.productName}>{item.name}</Text>
                        <Text style={styles.productPrice}>{item.price}</Text>

                        <View style={styles.locationRow}>
                            <Ionicons name="location-sharp" size={12} color={COLORS.gray} />
                            <Text numberOfLines={1} style={styles.locationText}>{item.location}</Text>
                        </View>

                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={12} color={COLORS.warning} />
                            <Text style={styles.ratingText}>{item.rating}</Text>
                            <Text style={styles.soldText}>• Terjual {item.sold}</Text>
                        </View>
                    </View>
                </Card>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <Header
                title="Marketplace"
                rightIcon={<Ionicons name="cart-outline" size={24} color={COLORS.text} />}
                onRightPress={() => { }} // Go to Cart
                showBack={false}
            />

            {/* Search Bar Fixed */}
            <View style={styles.searchContainer}>
                <Input
                    placeholder="Cari produk..."
                    value={search}
                    onChangeText={setSearch}
                    leftIcon={<Ionicons name="search" size={20} color={COLORS.gray} />}
                    style={{ marginBottom: 0 }}
                />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Categories */}
                <View style={styles.categoriesContainer}>
                    <FlatList
                        data={categories}
                        renderItem={renderCategoryItem}
                        keyExtractor={item => item}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: SIZES.padding }}
                    />
                </View>

                {/* Banner Promo using Horizontal Scroll */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bannerContainer}>
                    <LinearGradient
                        colors={GRADIENTS.primary}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.banner}
                    >
                        <View>
                            <Text style={styles.bannerTitle}>Diskon Spesial!</Text>
                            <Text style={styles.bannerSubtitle}>Hingga 50% untuk Pakan Ternak</Text>
                            <Button title="Cek Sekarang" size="small" variant="secondary" style={styles.bannerBtn} />
                        </View>
                        <Ionicons name="pricetag" size={80} color="rgba(255,255,255,0.2)" style={styles.bannerIcon} />
                    </LinearGradient>
                    <LinearGradient
                        colors={GRADIENTS.secondary}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.banner}
                    >
                        <View>
                            <Text style={styles.bannerTitle}>Sapi Unggulan</Text>
                            <Text style={styles.bannerSubtitle}>Kualitas Terbaik untuk Qurban</Text>
                            <Button title="Lihat Koleksi" size="small" variant="secondary" style={styles.bannerBtn} />
                        </View>
                        <Ionicons name="trophy" size={80} color="rgba(255,255,255,0.2)" style={styles.bannerIcon} />
                    </LinearGradient>
                </ScrollView>

                {/* Products Grid */}
                <View style={styles.productsGrid}>
                    {products.map((item, index) => (
                        <View key={item.id} style={{ width: COLUMN_WIDTH }}>
                            {renderProductCard({ item, index })}
                        </View>
                    ))}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floating Action Button for Selling */}
            <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
                <LinearGradient
                    colors={GRADIENTS.primary}
                    style={styles.fabGradient}
                >
                    <Ionicons name="camera" size={24} color={COLORS.white} />
                    <Text style={styles.fabText}>Jual</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    searchContainer: {
        paddingHorizontal: SIZES.padding,
        paddingBottom: 12,
        backgroundColor: COLORS.background, // Ensure background covers list when scrolling if simulating sticky header in future
    },
    categoriesContainer: {
        marginBottom: 16,
    },
    categoryItem: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    categoryItemSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    categoryText: {
        fontSize: SIZES.bodySmall,
        color: COLORS.textLight,
        fontWeight: '600',
    },
    categoryTextSelected: {
        color: COLORS.white,
    },
    bannerContainer: {
        paddingHorizontal: SIZES.padding,
        marginBottom: 24,
        gap: 16,
    },
    banner: {
        width: width - 80,
        height: 150,
        borderRadius: SIZES.radiusLarge,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        overflow: 'hidden',
    },
    bannerTitle: {
        fontSize: SIZES.h3,
        fontWeight: '800',
        color: COLORS.white,
        marginBottom: 4,
    },
    bannerSubtitle: {
        fontSize: SIZES.bodySmall,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 16,
        width: 180,
    },
    bannerBtn: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.white,
    },
    bannerIcon: {
        position: 'absolute',
        right: -10,
        bottom: -10,
    },
    productsGrid: {
        paddingHorizontal: SIZES.padding,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'space-between',
    },
    productCard: {
        padding: 0,
        marginBottom: 8,
    },
    imageContainer: {
        height: COLUMN_WIDTH,
        backgroundColor: COLORS.lightGray,
        position: 'relative',
    },
    imagePlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    newBadge: { // Using styles used in FarmDashboard
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: COLORS.accent,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    newText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700',
    },
    favoriteBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.small,
    },
    productInfo: {
        padding: 12,
    },
    categoryLabel: {
        fontSize: 10,
        color: COLORS.primary,
        fontWeight: '600',
        marginBottom: 2,
    },
    productName: {
        fontSize: SIZES.bodySmall,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 6,
        height: 36,
    },
    productPrice: {
        fontSize: SIZES.body,
        fontWeight: '700',
        color: COLORS.primaryDark,
        marginBottom: 8,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    locationText: {
        fontSize: 10,
        color: COLORS.gray,
        flex: 1,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.text,
    },
    soldText: {
        fontSize: 10,
        color: COLORS.gray,
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        ...SHADOWS.large,
    },
    fabGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
    },
    fabText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: SIZES.body,
    },
});

export default MarketplaceScreen;
