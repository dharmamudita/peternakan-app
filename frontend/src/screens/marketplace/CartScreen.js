/**
 * Cart Screen
 * Halaman keranjang belanja
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, FlatList, Image,
    ActivityIndicator, Alert, RefreshControl, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SHADOWS } from '../../constants/theme';
import { cartApi } from '../../services/api';

const CartScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [updating, setUpdating] = useState(false);

    const fetchCart = async () => {
        try {
            const response = await cartApi.get();
            if (response.data) {
                setCart(response.data);
            }
        } catch (error) {
            console.error('Fetch cart error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchCart();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchCart();
    };

    // Calculate total price
    const calculateTotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => {
            const price = item.product?.salePrice || item.product?.price || 0;
            return total + (price * item.quantity);
        }, 0);
    };

    const updateQuantity = async (productId, newQuantity) => {
        if (updating) return;
        setUpdating(true);
        try {
            if (newQuantity <= 0) {
                // Confirm delete
                // Web confirm
                if (Platform.OS === 'web') {
                    if (window.confirm('Hapus item ini dari keranjang?')) {
                        await processUpdate(productId, 0);
                    } else {
                        setUpdating(false);
                    }
                } else {
                    Alert.alert(
                        'Hapus Item',
                        'Apakah Anda yakin ingin menghapus item ini?',
                        [
                            { text: 'Batal', style: 'cancel', onPress: () => setUpdating(false) },
                            { text: 'Hapus', onPress: async () => await processUpdate(productId, 0) }
                        ]
                    );
                }
            } else {
                await processUpdate(productId, newQuantity);
            }
        } catch (e) {
            setUpdating(false);
        }
    };

    const processUpdate = async (productId, qty) => {
        try {
            if (qty === 0) {
                await cartApi.removeItem(productId);
            } else {
                await cartApi.updateItem(productId, qty);
            }
            await fetchCart();
        } catch (error) {
            console.log('Update error', error);
            if (Platform.OS === 'web') alert('Gagal memperbarui item');
            else Alert.alert('Gagal', 'Gagal memperbarui item');
        } finally {
            setUpdating(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(price);
    };

    const renderItem = ({ item }) => {
        const product = item.product;
        if (!product) return null;

        return (
            <View style={styles.cartItem}>
                {/* Image */}
                <Image
                    source={{ uri: product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/100' }}
                    style={styles.itemImage}
                />

                {/* Info */}
                <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle} numberOfLines={2}>{product.name}</Text>
                    <Text style={styles.itemPrice}>{formatPrice(product.salePrice || product.price)}</Text>

                    {/* Quantity Control */}
                    <View style={styles.qtyRow}>
                        <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => updateQuantity(product.id, item.quantity - 1)}
                            disabled={updating}
                        >
                            <Ionicons name="remove" size={16} color="#964b00" />
                        </TouchableOpacity>

                        <View style={styles.qtyValue}>
                            <Text style={styles.qtyText}>{item.quantity}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => updateQuantity(product.id, item.quantity + 1)}
                            disabled={updating}
                        >
                            <Ionicons name="add" size={16} color="#964b00" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.deleteBtn, { marginLeft: 'auto' }]}
                            onPress={() => updateQuantity(product.id, 0)}
                        >
                            <Ionicons name="trash-outline" size={18} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    if (loading && !refreshing && !cart) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#964b00" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Keranjang Saya</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* List */}
            {!cart || !cart.items || cart.items.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={80} color={COLORS.gray} />
                    <Text style={styles.emptyText}>Keranjang Anda masih kosong</Text>
                    <TouchableOpacity style={styles.shopButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.shopButtonText}>Mulai Belanja</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <FlatList
                        data={cart.items}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.productId}
                        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    />

                    {/* Footer */}
                    <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total Harga</Text>
                            <Text style={styles.totalValue}>{formatPrice(calculateTotal())}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.checkoutBtn}
                            onPress={() => {
                                if (Platform.OS === 'web') alert('Fitur Checkout akan segera hadir!');
                                else Alert.alert('Checkout', 'Fitur Checkout akan segera hadir!');
                            }}
                        >
                            <Text style={styles.checkoutText}>Checkout ({cart.items.length})</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: '#f9fafb',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    cartItem: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        ...SHADOWS.small,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#964b00',
    },
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    qtyBtn: {
        width: 28,
        height: 28,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyValue: {
        width: 30,
        alignItems: 'center',
    },
    qtyText: {
        fontSize: 14,
        fontWeight: '600',
    },
    deleteBtn: {
        padding: 4,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    emptyText: {
        fontSize: 16,
        color: '#9ca3af',
        marginTop: 16,
        marginBottom: 24,
    },
    shopButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#964b00',
        borderRadius: 12,
    },
    shopButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        ...SHADOWS.top,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 14,
        color: '#6b7280',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#964b00',
    },
    checkoutBtn: {
        backgroundColor: '#964b00',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    checkoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default CartScreen;
