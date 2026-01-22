/**
 * Order History Screen
 * Halaman riwayat pesanan / transaksi pembelian user
 */

import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, Dimensions, FlatList, RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');

const OrderHistoryScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('Semua');
    const [refreshing, setRefreshing] = useState(false);

    // Dummy Data Pesanan
    const [orders, setOrders] = useState([
        {
            id: 'INV/20231025/MPL/001',
            date: '25 Okt 2023',
            status: 'Selesai',
            total: 350000,
            products: [
                { name: 'Pakan Konsentrat Comfeed', quantity: 1, price: 350000, image: null }
            ]
        },
        {
            id: 'INV/20231102/MPL/005',
            date: '02 Nov 2023',
            status: 'Dikirim',
            total: 75000,
            products: [
                { name: 'Vitamin Ternak Organik', quantity: 1, price: 75000, image: null }
            ]
        },
        {
            id: 'INV/20231105/MPL/008',
            date: '05 Nov 2023',
            status: 'Belum Bayar',
            total: 25000000,
            products: [
                { name: 'Sapi Limosin Dewasa', quantity: 1, price: 25000000, image: null }
            ]
        }
    ]);

    const tabs = ['Semua', 'Belum Bayar', 'Dikemas', 'Dikirim', 'Selesai', 'Dibatalkan'];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Belum Bayar': return '#f59e0b';
            case 'Dikemas': return '#3b82f6';
            case 'Dikirim': return '#8b5cf6';
            case 'Selesai': return '#10b981';
            case 'Dibatalkan': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const filteredOrders = activeTab === 'Semua'
        ? orders
        : orders.filter(o => o.status === activeTab);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(price);
    };

    const onRefresh = () => {
        setRefreshing(true);
        // Simulasi fetch data
        setTimeout(() => setRefreshing(false), 1500);
    };

    const renderOrderItem = ({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(index * 100).duration(500)}>
            <TouchableOpacity
                style={styles.orderCard}
                activeOpacity={0.9}
                onPress={() => {/* Navigate to Order Detail if needed */ }}
            >
                <View style={styles.cardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons name="bag-handle-outline" size={18} color="#964b00" />
                        <Text style={styles.orderDate}>{item.date}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                    </View>
                </View>

                <View style={styles.cardContent}>
                    {/* Gambar Produk (Placeholder) */}
                    <View style={styles.productImage}>
                        <Ionicons name="image-outline" size={24} color="#d1d5db" />
                    </View>
                    <View style={styles.productInfo}>
                        <Text style={styles.productName}>{item.products[0].name}</Text>
                        <Text style={styles.productMeta}>
                            {item.products[0].quantity} barang
                            {item.products.length > 1 ? ` (+${item.products.length - 1} lainnya)` : ''}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View>
                        <Text style={styles.totalLabel}>Total Belanja</Text>
                        <Text style={styles.totalValue}>{formatPrice(item.total)}</Text>
                    </View>
                    {item.status === 'Belum Bayar' && (
                        <TouchableOpacity style={styles.payButton}>
                            <Text style={styles.payButtonText}>Bayar Sekarang</Text>
                        </TouchableOpacity>
                    )}
                    {item.status === 'Selesai' && (
                        <TouchableOpacity style={styles.reviewButton}>
                            <Text style={styles.reviewButtonText}>Beli Lagi</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Riwayat Pembelian</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tabItem, activeTab === tab && styles.activeTab]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* List */}
            <FlatList
                data={filteredOrders}
                keyExtractor={item => item.id}
                renderItem={renderOrderItem}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#964b00']} />}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="receipt-outline" size={64} color="#d1d5db" />
                        <Text style={styles.emptyTitle}>Belum ada pesanan</Text>
                        <Text style={styles.emptyText}>Yuk mulai belanja kebutuhan ternakmu!</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingBottom: 16, paddingTop: 12,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6'
    },
    backButton: { padding: 8, marginLeft: -8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },

    tabsContainer: { backgroundColor: '#fff', paddingBottom: 12 },
    tabsContent: { paddingHorizontal: 20, gap: 8 },
    tabItem: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff',
    },
    activeTab: { backgroundColor: '#964b00', borderColor: '#964b00' },
    tabText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
    activeTabText: { color: '#fff' },

    listContainer: { padding: 20, paddingBottom: 40 },

    orderCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
        ...SHADOWS.small, borderWidth: 1, borderColor: '#f0ebe3'
    },
    cardHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingBottom: 12, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6'
    },
    orderDate: { fontSize: 12, color: '#6b7280' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 11, fontWeight: '600' },

    cardContent: { flexDirection: 'row', gap: 12, mb: 12 },
    productImage: {
        width: 60, height: 60, borderRadius: 8, backgroundColor: '#f3f4f6',
        alignItems: 'center', justifyContent: 'center'
    },
    productInfo: { flex: 1, justifyContent: 'center' },
    productName: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 },
    productMeta: { fontSize: 12, color: '#6b7280' },

    cardFooter: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 12
    },
    totalLabel: { fontSize: 11, color: '#6b7280' },
    totalValue: { fontSize: 15, fontWeight: '700', color: '#111827' },

    payButton: { backgroundColor: '#964b00', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    payButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    reviewButton: { borderWidth: 1, borderColor: '#964b00', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    reviewButtonText: { color: '#964b00', fontSize: 12, fontWeight: '600' },

    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 16, marginBottom: 8 },
    emptyText: { fontSize: 14, color: '#9ca3af' },
});

export default OrderHistoryScreen;
