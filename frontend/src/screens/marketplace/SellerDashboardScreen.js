/**
 * Seller Dashboard Screen - Tema Putih + Coklat
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { shopApi, sellerApi } from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const SellerDashboardScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    // State for real data
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        activeProducts: 0,
        newOrders: 0,
        pendingShipment: 0,
        completed: 0,
    });
    const [revenue, setRevenue] = useState({
        thisMonth: 0,
        growth: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);

    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

    const fetchDashboardData = async () => {
        try {
            // Fetch shop status
            const shopResponse = await shopApi.getMyShop();
            if (shopResponse.data) {
                setShop(shopResponse.data);
            } else {
                setShop(null);
                return; // Stop here if no shop
            }

            // Only fetch stats if shop is verified
            if (shopResponse.data?.status === 'VERIFIED') {
                // Fetch stats
                const statsResponse = await sellerApi.getStats();
                if (statsResponse.data) {
                    setStats({
                        activeProducts: statsResponse.data.activeProducts || 0,
                        newOrders: statsResponse.data.newOrders || 0,
                        pendingShipment: statsResponse.data.pendingShipment || 0,
                        completed: statsResponse.data.completed || 0,
                    });
                    setRevenue({
                        thisMonth: statsResponse.data.monthlyRevenue || 0,
                        growth: statsResponse.data.revenueGrowth || 0,
                    });
                }

                // Fetch recent orders
                const ordersResponse = await sellerApi.getRecentOrders(5);
                if (ordersResponse.data && Array.isArray(ordersResponse.data)) {
                    setRecentOrders(ordersResponse.data);
                }
            }
        } catch (error) {
            console.log('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchDashboardData();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    // Helper function to get relative time
    const getTimeAgo = (date) => {
        const now = new Date();
        const orderDate = date instanceof Date ? date : new Date(date);
        const diff = Math.floor((now - orderDate) / 1000);

        if (diff < 60) return 'Baru saja';
        if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
        return orderDate.toLocaleDateString('id-ID');
    };

    // Dynamic stats based on real data
    const statsData = [
        { id: 1, label: 'Produk Aktif', value: stats.activeProducts.toString(), icon: 'cube', color: '#964b00', bgColor: '#faf8f5' },
        { id: 2, label: 'Pesanan Baru', value: stats.newOrders.toString(), icon: 'cart', color: '#7c3f06', bgColor: '#fdf5ef' },
        { id: 3, label: 'Menunggu Kirim', value: stats.pendingShipment.toString(), icon: 'time', color: '#b87333', bgColor: '#fef7f1' },
        { id: 4, label: 'Selesai', value: stats.completed.toString(), icon: 'checkmark-circle', color: '#5d3a1a', bgColor: '#faf5f0' },
    ];

    // Dynamic menu items
    const menuItems = [
        { id: 1, title: 'Kelola Produk', subtitle: `${stats.activeProducts} produk`, icon: 'cube', gradient: ['#964b00', '#7c3f06'], route: 'MyProducts' },
        { id: 2, title: 'Pesanan Masuk', subtitle: `${stats.newOrders} pesanan baru`, icon: 'receipt', gradient: ['#7c3f06', '#5d3a1a'], badge: stats.newOrders > 0 ? stats.newOrders : null, route: 'SellerOrders' },
    ];

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    // 1. Belum punya toko -> Redirect ke Registrasi
    if (!shop) {
        return (
            <View style={[styles.container, { paddingTop: insets.top + 60, paddingHorizontal: 20, alignItems: 'center' }]}>
                <Ionicons name="storefront-outline" size={100} color={COLORS.primary} />
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 20, marginBottom: 10 }}>Belum Ada Toko</Text>
                <Text style={{ textAlign: 'center', color: '#666', marginBottom: 30 }}>
                    Anda harus mendaftarkan toko terlebih dahulu untuk mulai berjualan.
                </Text>
                <TouchableOpacity
                    style={{ backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8 }}
                    onPress={() => navigation.navigate('SellerRegistration')}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Daftar Toko Sekarang</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // 2. Status Pending -> Menunggu Verifikasi
    if (shop.status === 'PENDING') {
        return (
            <View style={[styles.container, { paddingTop: insets.top + 60, paddingHorizontal: 20, alignItems: 'center' }]}>
                <Ionicons name="time-outline" size={100} color="#f59e0b" />
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 20, marginBottom: 10 }}>Menunggu Verifikasi</Text>
                <Text style={{ textAlign: 'center', color: '#666', marginBottom: 30 }}>
                    Pengajuan toko Anda sedang ditinjau oleh Admin. Mohon tunggu 1x24 jam.
                </Text>
                <TouchableOpacity
                    style={{ backgroundColor: '#f3f4f6', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8 }}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={{ color: '#374151', fontWeight: 'bold' }}>Kembali</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // 3. Status Rejected
    if (shop.status === 'REJECTED') {
        return (
            <View style={[styles.container, { paddingTop: insets.top + 60, paddingHorizontal: 20, alignItems: 'center' }]}>
                <Ionicons name="close-circle-outline" size={100} color={COLORS.error} />
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 20, marginBottom: 10 }}>Pengajuan Ditolak</Text>
                <Text style={{ textAlign: 'center', color: '#666', marginBottom: 30 }}>
                    Maaf, pengajuan toko Anda ditolak. Silakan hubungi admin untuk info lebih lanjut.
                </Text>
                <TouchableOpacity
                    style={{ backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8 }}
                    onPress={() => navigation.navigate('SellerRegistration')}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Ajukan Ulang</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // 4. Status VERIFIED -> Show Dashboard (Lanjut ke return di bawah)
    const getStatusColor = (status) => {
        const colors = { 'Baru': '#964b00', 'Dikemas': '#7c3f06', 'Dikirim': '#b87333', 'Selesai': '#5d3a1a' };
        return colors[status] || '#6b7280';
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#964b00']} />
                }
            >
                <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={22} color="#374151" />
                        </TouchableOpacity>
                        <View style={styles.headerCenter}>
                            <Text style={styles.headerSubtitle}>Dashboard 🏪</Text>
                            <Text style={styles.headerTitle}>{shop?.name || 'Toko Saya'}</Text>
                        </View>
                        <View style={{ width: 44 }} />
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.summarySection}>
                    <LinearGradient colors={['#964b00', '#7c3f06']} style={styles.summaryCard}>
                        <View style={styles.summaryDecor1} />
                        <View style={styles.summaryContent}>
                            <View style={styles.summaryLeft}>
                                <Text style={styles.summaryLabel}>Pendapatan Bulan Ini</Text>
                                <Text style={styles.summaryValue}>{formatPrice(revenue.thisMonth)}</Text>
                                <View style={styles.trendBadge}>
                                    <Ionicons name={revenue.growth >= 0 ? 'trending-up' : 'trending-down'} size={14} color="#ffffff" />
                                    <Text style={styles.trendText}>{revenue.growth >= 0 ? '+' : ''}{revenue.growth}% dari bulan lalu</Text>
                                </View>
                            </View>
                            <View style={styles.summaryIcon}>
                                <Ionicons name="wallet" size={36} color="rgba(255,255,255,0.3)" />
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.section}>
                    <View style={styles.statsGrid}>
                        {statsData.map((stat, index) => (
                            <Animated.View key={stat.id} entering={FadeInUp.delay(index * 80).duration(400)} style={styles.statCard}>
                                <View style={[styles.statIconContainer, { backgroundColor: stat.bgColor }]}>
                                    <Ionicons name={stat.icon} size={20} color={stat.color} />
                                </View>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.section}>
                    <Text style={styles.sectionTitle}>Menu Toko</Text>
                    <View style={styles.menuGrid}>
                        {menuItems.map((item, index) => (
                            <Animated.View key={item.id} entering={FadeInUp.delay(index * 60).duration(400)} style={styles.menuItemWrapper}>
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => item.route ? navigation.navigate(item.route) : alert(item.title + ' akan segera hadir!')}
                                    activeOpacity={0.9}
                                >
                                    <LinearGradient colors={item.gradient} style={styles.menuIconGradient}>
                                        <Ionicons name={item.icon} size={24} color="#ffffff" />
                                        {item.badge && (
                                            <View style={styles.menuBadge}><Text style={styles.menuBadgeText}>{item.badge}</Text></View>
                                        )}
                                    </LinearGradient>
                                    <Text style={styles.menuTitle}>{item.title}</Text>
                                    <Text numberOfLines={1} style={styles.menuSubtitle}>{item.subtitle}</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Pesanan Terbaru</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SellerOrders')}>
                            <Text style={styles.seeAll}>Lihat Semua</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.ordersList}>
                        {recentOrders.length === 0 ? (
                            <View style={{ padding: 20, alignItems: 'center' }}>
                                <Ionicons name="basket-outline" size={40} color="#d1d5db" />
                                <Text style={{ color: '#9ca3af', marginTop: 8 }}>Belum ada pesanan</Text>
                            </View>
                        ) : (
                            recentOrders.map((order, index) => {
                                const timeAgo = order.createdAt ? getTimeAgo(order.createdAt) : '';
                                return (
                                    <Animated.View key={order.id} entering={FadeInRight.delay(index * 100).duration(400)}>
                                        <TouchableOpacity style={styles.orderCard} activeOpacity={0.9}>
                                            <View style={[styles.orderIcon, { backgroundColor: getStatusColor(order.status) + '15' }]}>
                                                <Ionicons name="bag-handle" size={22} color={getStatusColor(order.status)} />
                                            </View>
                                            <View style={styles.orderContent}>
                                                <View style={styles.orderHeader}>
                                                    <Text style={styles.orderBuyer}>{order.buyerName || 'Pembeli'}</Text>
                                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '15' }]}>
                                                        <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{order.status}</Text>
                                                    </View>
                                                </View>
                                                <Text style={styles.orderProduct}>{order.productName || 'Produk'}</Text>
                                                <View style={styles.orderMeta}>
                                                    <Text style={styles.orderPrice}>{formatPrice(order.totalAmount || 0)}</Text>
                                                    <Text style={styles.orderTime}>• {timeAgo}</Text>
                                                </View>
                                            </View>
                                            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
                                        </TouchableOpacity>
                                    </Animated.View>
                                );
                            })
                        )}
                    </View>
                </Animated.View>

                <View style={{ height: 40 }} />
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
    header: { paddingHorizontal: SIZES.padding, paddingTop: 8, paddingBottom: 16 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#faf8f5', alignItems: 'center', justifyContent: 'center', ...SHADOWS.small },
    headerCenter: { alignItems: 'center' },
    headerSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 2 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
    iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#faf8f5', alignItems: 'center', justifyContent: 'center', ...SHADOWS.small },
    notifBadge: { position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: 8, backgroundColor: '#dc2626', alignItems: 'center', justifyContent: 'center' },
    notifBadgeText: { fontSize: 9, fontWeight: '700', color: '#ffffff' },
    summarySection: { paddingHorizontal: SIZES.padding, marginBottom: 24 },
    summaryCard: { borderRadius: 24, padding: 24, overflow: 'hidden', ...SHADOWS.large },
    summaryDecor1: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)', top: -30, right: -20 },
    summaryContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    summaryLeft: {},
    summaryLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
    summaryValue: { fontSize: 28, fontWeight: '800', color: '#ffffff', marginBottom: 8 },
    trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
    trendText: { fontSize: 12, color: '#ffffff', fontWeight: '500' },
    summaryIcon: { width: 70, height: 70, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
    section: { paddingHorizontal: SIZES.padding, marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
    seeAll: { fontSize: 14, color: '#964b00', fontWeight: '600' },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statCard: { width: (width - SIZES.padding * 2 - 12) / 2, backgroundColor: '#ffffff', borderRadius: 20, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#f0ebe3', ...SHADOWS.small },
    statIconContainer: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    statValue: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 2 },
    statLabel: { fontSize: 12, color: '#6b7280' },
    menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    menuItemWrapper: { width: (width - SIZES.padding * 2 - 24) / 3 },
    menuItem: { backgroundColor: '#ffffff', borderRadius: 20, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#f0ebe3', ...SHADOWS.small },
    menuIconGradient: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    menuBadge: { position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: '#dc2626', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#ffffff' },
    menuBadgeText: { fontSize: 10, fontWeight: '700', color: '#ffffff' },
    menuTitle: { fontSize: 12, fontWeight: '600', color: '#111827', textAlign: 'center', marginBottom: 2 },
    menuSubtitle: { fontSize: 10, color: '#9ca3af', textAlign: 'center' },
    ordersList: { gap: 12 },
    orderCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#f0ebe3', ...SHADOWS.small },
    orderIcon: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    orderContent: { flex: 1 },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
    orderBuyer: { fontSize: 15, fontWeight: '600', color: '#111827' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: '600' },
    orderProduct: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
    orderMeta: { flexDirection: 'row', alignItems: 'center' },
    orderPrice: { fontSize: 13, fontWeight: '700', color: '#964b00' },
    orderTime: { fontSize: 11, color: '#9ca3af', marginLeft: 4 },
});

export default SellerDashboardScreen;
