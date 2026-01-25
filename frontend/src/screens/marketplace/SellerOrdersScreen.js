/**
 * Seller Orders Screen
 * Halaman pesanan masuk untuk seller
 */

import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl, Platform, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { COLORS, SHADOWS, SIZES } from '../../constants/theme';
import { orderApi } from '../../services/api';

const SellerOrdersScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filterStatus, setFilterStatus] = useState('paid'); // paid = pesanan baru

    const statusTabs = [
        { key: 'paid', label: 'Pesanan Baru' },
        { key: 'processing', label: 'Dikemas' },
        { key: 'shipped', label: 'Dikirim' },
        { key: 'completed', label: 'Selesai' },
    ];

    const fetchOrders = async (status = filterStatus) => {
        try {
            setLoading(true);
            const response = await orderApi.getSellerOrders(status);
            const ordersData = response.data || [];
            setOrders(ordersData);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchOrders(filterStatus);
        }, [filterStatus])
    );

    const handleFilterChange = (newStatus) => {
        setFilterStatus(newStatus);
        fetchOrders(newStatus);
    };

    const handleConfirmOrder = async (orderId) => {
        const confirmAction = async () => {
            try {
                await orderApi.confirmOrder(orderId);
                showAlert('Berhasil', 'Pesanan dikonfirmasi untuk dikemas');
                fetchOrders(filterStatus);
            } catch (error) {
                showAlert('Gagal', error.message || 'Gagal konfirmasi pesanan');
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Konfirmasi pesanan ini untuk dikemas?')) {
                await confirmAction();
            }
        } else {
            Alert.alert('Konfirmasi', 'Konfirmasi pesanan ini untuk dikemas?', [
                { text: 'Batal', style: 'cancel' },
                { text: 'Ya', onPress: confirmAction }
            ]);
        }
    };

    const handleShipOrder = async (orderId) => {
        const shipAction = async () => {
            try {
                await orderApi.shipOrder(orderId, '');
                showAlert('Berhasil', 'Pesanan ditandai sebagai dikirim');
                fetchOrders(filterStatus);
            } catch (error) {
                showAlert('Gagal', error.message || 'Gagal mengirim pesanan');
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Kirim pesanan ini?')) {
                await shipAction();
            }
        } else {
            Alert.alert('Kirim Pesanan', 'Kirim pesanan ini?', [
                { text: 'Batal', style: 'cancel' },
                { text: 'Ya', onPress: shipAction }
            ]);
        }
    };

    const showAlert = (title, message) => {
        if (Platform.OS === 'web') {
            window.alert(`${title}\n\n${message}`);
        } else {
            Alert.alert(title, message);
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(price);

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getStatusColor = (status) => {
        const colors = {
            paid: '#f59e0b',
            processing: '#3b82f6',
            shipped: '#8b5cf6',
            delivered: '#10b981',
            completed: '#059669',
        };
        return colors[status] || '#6b7280';
    };

    const renderOrderItem = ({ item, index }) => (
        <Animated.View
            entering={FadeInUp.delay(index * 50).duration(300)}
            style={styles.orderCard}
        >
            <View style={styles.orderHeader}>
                <View>
                    <Text style={styles.orderBuyer}>{item.buyerName || 'Pembeli'}</Text>
                    <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status?.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.orderItems}>
                {item.items?.map((product, idx) => (
                    <View key={idx} style={styles.productRow}>
                        <Text style={styles.productName} numberOfLines={1}>
                            {product.name} x{product.quantity}
                        </Text>
                        <Text style={styles.productPrice}>{formatPrice(product.price * product.quantity)}</Text>
                    </View>
                ))}
            </View>

            {item.shippingAddress && (
                <View style={styles.shippingSection}>
                    <View style={styles.shippingHeader}>
                        <Ionicons name="location-sharp" size={14} color={COLORS.primary} />
                        <Text style={styles.shippingTitle}>Alamat Pengiriman:</Text>
                    </View>
                    <Text style={styles.shippingAddressText}>
                        <Text style={{ fontWeight: '700', color: '#374151' }}>{item.shippingAddress.recipientName}</Text> | {item.shippingAddress.phoneNumber}{"\n"}
                        {item.shippingAddress.fullAddress}, {item.shippingAddress.city}, {item.shippingAddress.province} {item.shippingAddress.postalCode}
                    </Text>
                </View>
            )}

            <View style={styles.orderFooter}>
                <View>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>{formatPrice(item.totalAmount)}</Text>
                </View>

                <View style={styles.actionButtons}>
                    {item.status === 'paid' && (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
                            onPress={() => handleConfirmOrder(item.id)}
                        >
                            <Ionicons name="checkmark" size={16} color="#fff" />
                            <Text style={styles.actionBtnText}>Konfirmasi</Text>
                        </TouchableOpacity>
                    )}
                    {item.status === 'processing' && (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#8b5cf6' }]}
                            onPress={() => handleShipOrder(item.id)}
                        >
                            <Ionicons name="send" size={16} color="#fff" />
                            <Text style={styles.actionBtnText}>Kirim</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Animated.View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pesanan Masuk</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                {statusTabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.filterTab, filterStatus === tab.key && styles.activeTab]}
                        onPress={() => handleFilterChange(tab.key)}
                    >
                        <Text style={[styles.filterText, filterStatus === tab.key && styles.activeTabText]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Orders List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id}
                    renderItem={renderOrderItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); fetchOrders(); }}
                            colors={[COLORS.primary]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="receipt-outline" size={60} color="#d1d5db" />
                            <Text style={styles.emptyText}>Tidak ada pesanan</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        ...(Platform.OS === 'web' ? { flex: 0, height: 'auto', minHeight: '100vh' } : {})
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    filterContainer: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#fff',
        gap: 8,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: COLORS.primary,
    },
    filterText: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#fff',
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        ...SHADOWS.small,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderBuyer: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    orderDate: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    orderItems: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f3f4f6',
        paddingVertical: 12,
        gap: 6,
    },
    productRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    productName: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    totalLabel: {
        fontSize: 12,
        color: '#9ca3af',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.primary,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    actionBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#9ca3af',
        marginTop: 12,
    },
    shippingSection: {
        backgroundColor: '#f9fafb',
        padding: 12,
        borderRadius: 10,
        marginVertical: 8,
    },
    shippingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    shippingTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6b7280',
        textTransform: 'uppercase',
    },
    shippingAddressText: {
        fontSize: 13,
        color: '#4b5563',
        lineHeight: 18,
    },
});

export default SellerOrdersScreen;
