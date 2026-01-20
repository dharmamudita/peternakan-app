/**
 * Seller Dashboard Screen - Tema Putih + Coklat
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const SellerDashboardScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    const stats = [
        { id: 1, label: 'Produk Aktif', value: '12', icon: 'cube', color: '#964b00', bgColor: '#faf8f5' },
        { id: 2, label: 'Pesanan Baru', value: '5', icon: 'cart', color: '#7c3f06', bgColor: '#fdf5ef' },
        { id: 3, label: 'Menunggu Kirim', value: '3', icon: 'time', color: '#b87333', bgColor: '#fef7f1' },
        { id: 4, label: 'Selesai', value: '28', icon: 'checkmark-circle', color: '#5d3a1a', bgColor: '#faf5f0' },
    ];

    const menuItems = [
        { id: 1, title: 'Kelola Produk', subtitle: 'Tambah, edit produk', icon: 'cube', gradient: ['#964b00', '#7c3f06'] },
        { id: 2, title: 'Pesanan Masuk', subtitle: '5 pesanan baru', icon: 'receipt', gradient: ['#7c3f06', '#5d3a1a'], badge: 5 },
        { id: 3, title: 'Pengiriman', subtitle: '3 menunggu', icon: 'car', gradient: ['#b87333', '#964b00'], badge: 3 },
        { id: 4, title: 'Pendapatan', subtitle: 'Statistik penjualan', icon: 'wallet', gradient: ['#5d3a1a', '#3d2510'] },
        { id: 5, title: 'Ulasan', subtitle: '12 ulasan', icon: 'star', gradient: ['#964b00', '#b87333'] },
        { id: 6, title: 'Pengaturan Toko', subtitle: 'Profil toko', icon: 'settings', gradient: ['#7c3f06', '#964b00'] },
    ];

    const recentOrders = [
        { id: 1, buyer: 'Ahmad Sutan', product: 'Sapi Limosin', price: 25000000, status: 'Baru', time: '10 menit lalu' },
        { id: 2, buyer: 'Budi Raharjo', product: 'Pakan Konsentrat', price: 350000, status: 'Dikemas', time: '1 jam lalu' },
        { id: 3, buyer: 'Citra Dewi', product: 'Vitamin Ternak', price: 75000, status: 'Dikirim', time: '3 jam lalu' },
    ];

    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

    const getStatusColor = (status) => {
        const colors = { 'Baru': '#964b00', 'Dikemas': '#7c3f06', 'Dikirim': '#b87333', 'Selesai': '#5d3a1a' };
        return colors[status] || '#6b7280';
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={22} color="#374151" />
                        </TouchableOpacity>
                        <View style={styles.headerCenter}>
                            <Text style={styles.headerSubtitle}>Dashboard 🏪</Text>
                            <Text style={styles.headerTitle}>Toko Saya</Text>
                        </View>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="notifications-outline" size={22} color="#374151" />
                            <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>5</Text></View>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.summarySection}>
                    <LinearGradient colors={['#964b00', '#7c3f06']} style={styles.summaryCard}>
                        <View style={styles.summaryDecor1} />
                        <View style={styles.summaryContent}>
                            <View style={styles.summaryLeft}>
                                <Text style={styles.summaryLabel}>Pendapatan Bulan Ini</Text>
                                <Text style={styles.summaryValue}>Rp 45.500.000</Text>
                                <View style={styles.trendBadge}>
                                    <Ionicons name="trending-up" size={14} color="#ffffff" />
                                    <Text style={styles.trendText}>+23% dari bulan lalu</Text>
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
                        {stats.map((stat, index) => (
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
                                <TouchableOpacity style={styles.menuItem} onPress={() => alert(item.title + ' akan segera hadir!')} activeOpacity={0.9}>
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
                        <TouchableOpacity><Text style={styles.seeAll}>Lihat Semua</Text></TouchableOpacity>
                    </View>
                    <View style={styles.ordersList}>
                        {recentOrders.map((order, index) => (
                            <Animated.View key={order.id} entering={FadeInRight.delay(index * 100).duration(400)}>
                                <TouchableOpacity style={styles.orderCard} activeOpacity={0.9}>
                                    <View style={[styles.orderIcon, { backgroundColor: getStatusColor(order.status) + '15' }]}>
                                        <Ionicons name="bag-handle" size={22} color={getStatusColor(order.status)} />
                                    </View>
                                    <View style={styles.orderContent}>
                                        <View style={styles.orderHeader}>
                                            <Text style={styles.orderBuyer}>{order.buyer}</Text>
                                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '15' }]}>
                                                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{order.status}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.orderProduct}>{order.product}</Text>
                                        <View style={styles.orderMeta}>
                                            <Text style={styles.orderPrice}>{formatPrice(order.price)}</Text>
                                            <Text style={styles.orderTime}>• {order.time}</Text>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
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
