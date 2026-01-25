/**
 * Marketplace Screen
 * Halaman jual beli untuk pembeli
 */

import React, { useState, useCallback, useEffect } from 'react';
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
    RefreshControl,
    Alert,
    ToastAndroid
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInUp, FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker'; // Import ImagePicker
import axios from 'axios'; // Import axios
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { productApi, cartApi } from '../../services/api';

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
    const [visualSearchLoading, setVisualSearchLoading] = useState(false); // New state
    const [visualMatchIds, setVisualMatchIds] = useState(null); // Valid matches IDs

    // Reset visual match on search text change
    useEffect(() => {
        if (search && visualMatchIds) {
            setVisualMatchIds(null);
        }
    }, [search]);

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
        // ... (same as before)
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

    // Visual Search Logic (Clean Version)
    const handleVisualSearch = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Izin', 'Butuh izin akses galeri untuk scan foto.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled && result.assets[0]) {
                const image = result.assets[0];
                setVisualSearchLoading(true);
                setVisualMatchIds(null);

                let imageBase64 = image.base64;
                if (!imageBase64.startsWith('data:image')) {
                    imageBase64 = `data:image/jpeg;base64,${imageBase64}`;
                }

                console.log("Analyzing product similarity...");

                try {
                    const response = await axios.post('http://127.0.0.1:5001/api/analyze/product',
                        { image: imageBase64 },
                        { headers: { 'Content-Type': 'application/json' }, timeout: 20000 }
                    );

                    if (response.data.success) {
                        const { search_query, detected_features } = response.data;
                        const category = detected_features?.category || 'Umum';

                        console.log("AI Result:", category, search_query);
                        Alert.alert("Hasil Analisis AI", `Terdeteksi: ${search_query}\nMenampilkan produk yang relevan.`);

                        const filtered = products.filter(p => {
                            const name = p.name ? p.name.toLowerCase() : '';
                            const desc = p.description ? p.description.toLowerCase() : '';
                            const cat = category.toLowerCase();
                            return name.includes(cat) || desc.includes(cat);
                        });

                        if (filtered.length > 0) {
                            setVisualMatchIds(filtered.map(p => p.id));
                        } else {
                            setSearch(category);
                            Alert.alert("Info", `Tidak ditemukan produk "${category}" yang persis, namun pencarian telah disesuaikan.`);
                        }
                    } else {
                        Alert.alert("Gagal", "AI tidak dapat menganalisis gambar.");
                    }
                } catch (error) {
                    console.error("Visual Search Error:", error);
                    Alert.alert("Error", "Gagal menghubungi AI Service.");
                } finally {
                    setVisualSearchLoading(false);
                }
            }
        } catch (err) {
            console.log("Visual search setup error:", err);
        }
    };
    const onRefresh = () => {
        setRefreshing(true);
        fetchProducts();
    };

    const handleAddToCart = async (productId) => {
        try {
            await cartApi.addItem(productId, 1);
            if (Platform.OS === 'android') {
                ToastAndroid.show('Produk ditambahkan ke keranjang', ToastAndroid.SHORT);
            } else {
                Alert.alert('Sukses', 'Produk ditambahkan ke keranjang');
            }
        } catch (error) {
            Alert.alert('Gagal', error.message || 'Gagal menambahkan ke keranjang');
        }
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
        // PRIORITY 1: Visual Match result
        if (visualMatchIds !== null) {
            return visualMatchIds.includes(product.id);
        }

        const matchesCategory = selectedCategory === 'Semua' || (product.category && product.category.toLowerCase() === selectedCategory.toLowerCase()) || (product.categoryId === selectedCategory);

        const searchLower = search.toLowerCase().trim();
        if (!searchLower) return matchesCategory;

        // Smart Filtering Logic (Text)
        const searchParts = searchLower.split(' ');
        const nameLower = product.name.toLowerCase();
        const descLower = (product.description || '').toLowerCase();
        const productCategory = (product.category || '').toLowerCase();

        if (searchParts.length > 1) {
            const categoryKeyword = searchParts[0];
            const isCategoryMatch = nameLower.includes(categoryKeyword) || productCategory.includes(categoryKeyword);
            if (!isCategoryMatch) return false;
            return true;
        }

        return matchesCategory && (nameLower.includes(searchLower) || descLower.includes(searchLower));
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

                {/* Search Bar with Visual Search */}
                <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.searchContainer}>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity
                            style={[
                                styles.visualSearchBtn,
                                visualSearchLoading && { opacity: 0.7 }
                            ]}
                            onPress={handleVisualSearch}
                            disabled={visualSearchLoading}
                        >
                            {visualSearchLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Ionicons name="camera" size={22} color="#fff" />
                            )}
                        </TouchableOpacity>

                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={20} color="#9ca3af" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Cari hewan, pakan, atau alat..."
                                placeholderTextColor="#9ca3af"
                                value={search}
                                onChangeText={setSearch}
                            />
                            {search.length > 0 && (
                                <TouchableOpacity onPress={() => setSearch('')}>
                                    <Ionicons name="close-circle" size={18} color="#9ca3af" />
                                </TouchableOpacity>
                            )}
                        </View>
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
                            <Ionicons name="search-outline" size={48} color="#d1d5db" />
                            <Text style={styles.emptyText}>Produk yang Anda analisis tidak tersedia</Text>
                            <Text style={{ color: '#9ca3af', marginTop: 4, fontSize: 12 }}>
                                Kami tidak menemukan "{search}" di marketplace saat ini.
                            </Text>
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
                                                    {item.location && item.location !== 'Indonesia' ? item.location : '-'}
                                                </Text>
                                            </View>
                                            <View style={styles.productFooter}>
                                                <Text style={styles.soldText}>{item.totalSold || 0} Terjual</Text>
                                                <View style={{ flexDirection: 'row', gap: 6 }}>
                                                    <TouchableOpacity style={styles.cartBtn} onPress={() => handleAddToCart(item.id)}>
                                                        <Ionicons name="cart-outline" size={16} color="#964b00" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={styles.buyBtn} onPress={() => navigation.push('ProductDetail', { product: item })}>
                                                        <Text style={styles.buyBtnText}>Beli</Text>
                                                    </TouchableOpacity>
                                                </View>
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
        flex: 1, // Agar search bar mengambil sisa ruang
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
    visualSearchBtn: {
        width: 50,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.small,
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
    cartBtn: {
        width: 28,
        height: 28,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#964b00',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    buyBtn: {
        paddingHorizontal: 12,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#964b00',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buyBtnText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
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
