/**
 * Profile Screen - Tema Putih + Coklat
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, Dimensions, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { statsApi } from '../../services/api';

const ProfileScreen = ({ navigation }) => {
    // ... existing hooks
    const insets = useSafeAreaInsets();
    const { user, logout } = useAuth();
    const [notifications, setNotifications] = React.useState(true);
    const [profileStats, setProfileStats] = React.useState({
        animals: 0,
        orders: 0,
        courses: 0
    });

    useFocusEffect(
        React.useCallback(() => {
            const loadStats = async () => {
                try {
                    const response = await statsApi.getUserStats();
                    const data = response.data || response;

                    setProfileStats({
                        animals: data.totalAnimals || 0,
                        orders: data.totalOrders || 0,
                        courses: data.totalCourses || 0
                    });
                } catch (e) {
                    console.log('Profile Stats Error:', e);
                }
            };
            loadStats();
        }, [])
    );

    const handleLogout = () => { logout(); };

    // Admin juga dianggap sebagai Seller (bisa jualan)
    const isSeller = user?.role === 'seller' || user?.role === 'admin';

    const showFeatureAlert = (featureName) => {
        if (Platform.OS === 'web') {
            window.alert(`Fitur ${featureName} akan segera hadir!`);
        } else {
            Alert.alert('Segera Hadir', `Fitur ${featureName} sedang dalam pengembangan.`);
        }
    };

    const handleChangePassword = () => {
        // Check provider data for Google/Facebook
        const isSocialLogin = user?.providerData?.some(
            p => p.providerId === 'google.com' || p.providerId === 'facebook.com'
        );

        if (isSocialLogin) {
            if (Platform.OS === 'web') {
                window.alert('Akun Google/Facebook tidak dapat mengubah kata sandi di sini.');
            } else {
                Alert.alert('Akses Dibatasi', 'Anda masuk menggunakan akun sosial (Google/FB). Silakan ubah kata sandi melalui penyedia layanan tersebut.');
            }
            return;
        }

        navigation.navigate('ChangePassword');
    };

    const stats = [
        { label: 'Hewan', value: profileStats.animals.toString(), icon: 'paw', color: '#964b00' },
        { label: 'Pesanan', value: profileStats.orders.toString(), icon: 'cart', color: '#7c3f06' },
        { label: 'Kursus', value: profileStats.courses.toString(), icon: 'book', color: '#b87333' },
    ];

    const SUPER_ADMIN_EMAIL = 'dharmamudita404@gmail.com';
    const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

    const menuItems = [
        ...(isSuperAdmin ? [{
            title: 'Panel Admin',
            items: [
                { icon: 'shield-checkmark-outline', label: 'Buka Dashboard Admin', color: '#dc2626', action: () => navigation.navigate('AdminDashboard') },
            ]
        }] : []),

        // Menu Toko / Bisnis (Admin juga bisa akses)
        {
            title: isSeller ? 'Toko Saya' : 'Bisnis',
            items: isSeller ? [
                { icon: 'storefront-outline', label: 'Dashboard Toko', color: '#964b00', action: () => navigation.navigate('SellerDashboard') },
            ] : [
                { icon: 'id-card-outline', label: 'Daftar sebagai Penjual', color: '#964b00', action: () => navigation.navigate('SellerRegistration') },
            ]
        },

        {
            title: 'Aktivitas Saya',
            items: [
                { icon: 'receipt-outline', label: 'Riwayat Pembelian', color: '#964b00', action: () => navigation.navigate('OrderHistory') },
                { icon: 'cart-outline', label: 'Keranjang Saya', color: '#964b00', action: () => navigation.navigate('Cart') },
            ]
        },
        {
            title: 'Pengaturan Akun',
            items: [
                { icon: 'person-outline', label: 'Edit Profil', color: '#7c3f06', action: () => navigation.navigate('EditProfile') },
                { icon: 'lock-closed-outline', label: 'Ubah Password', color: '#b87333', action: handleChangePassword },
                { icon: 'card-outline', label: 'Metode Pembayaran', color: '#10b981', action: () => showFeatureAlert('Metode Pembayaran') },
                { icon: 'location-outline', label: 'Alamat Tersimpan', color: '#5d3a1a', action: () => showFeatureAlert('Alamat Tersimpan') },
            ],
        },

        {
            title: 'Bantuan & Informasi',
            items: [
                { icon: 'help-circle-outline', label: 'Pusat Bantuan', color: '#b87333', action: () => navigation.navigate('Help', { type: 'help_center', title: 'Pusat Bantuan' }) },
                { icon: 'people-outline', label: 'Peraturan Komunitas', color: '#7c3f06', action: () => navigation.navigate('Help', { type: 'community', title: 'Peraturan Komunitas' }) },
                { icon: 'shield-checkmark-outline', label: 'Kebijakan Privasi', color: '#10b981', action: () => navigation.navigate('Help', { type: 'privacy', title: 'Kebijakan Privasi' }) },
                { icon: 'information-circle-outline', label: 'Tentang Aplikasi', color: '#5d3a1a', action: () => navigation.navigate('Help', { type: 'about', title: 'Tentang Aplikasi' }) },
            ],
        },
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.headerSubtitle}>Akun Saya 👤</Text>
                            <Text style={styles.headerTitle}>Profil</Text>
                        </View>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.profileSection}>
                    <LinearGradient colors={['#964b00', '#7c3f06']} style={styles.profileCard}>
                        <View style={styles.profileDecor1} />
                        <View style={styles.profileContent}>
                            <View style={styles.avatarContainer}>
                                {user?.photoURL ? (
                                    <Image source={{ uri: user.photoURL }} style={styles.avatar} />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <Text style={styles.avatarText}>{user?.displayName?.charAt(0)?.toUpperCase() || 'U'}</Text>
                                    </View>
                                )}
                                <TouchableOpacity style={styles.editAvatarBtn}>
                                    <Ionicons name="camera" size={14} color="#964b00" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.userName}>{user?.displayName || 'Pengguna'}</Text>
                            <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
                            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                                {/* Badge Admin */}
                                {isSuperAdmin && (
                                    <View style={[styles.roleBadge, { backgroundColor: '#dc2626' }]}>
                                        <Ionicons name="shield-checkmark" size={12} color="#ffffff" />
                                        <Text style={styles.roleText}>Admin</Text>
                                    </View>
                                )}

                                {/* Badge Penjual */}
                                {isSeller && (
                                    <View style={[styles.roleBadge, { backgroundColor: '#d97706' }]}>
                                        <Ionicons name="storefront" size={12} color="#ffffff" />
                                        <Text style={styles.roleText}>Penjual</Text>
                                    </View>
                                )}

                                {/* Badge Pengguna (Selalu muncul) */}
                                <View style={styles.roleBadge}>
                                    <Ionicons name="person" size={12} color="#ffffff" />
                                    <Text style={styles.roleText}>Pengguna</Text>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.statsSection}>
                    <View style={styles.statsRow}>
                        {stats.map((stat, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.statCard}
                                disabled={stat.label !== 'Pesanan'}
                                onPress={() => stat.label === 'Pesanan' && navigation.navigate('OrderHistory')}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                                    <Ionicons name={stat.icon} size={20} color={stat.color} />
                                </View>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>

                {menuItems.map((section, sectionIndex) => (
                    <Animated.View key={sectionIndex} entering={FadeInUp.duration(500).delay(sectionIndex * 100 + 300)} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <View style={styles.menuCard}>
                            {section.items.map((item, index) => (
                                <View key={index}>
                                    <TouchableOpacity style={styles.menuItem} onPress={item.action} disabled={item.type === 'switch'} activeOpacity={0.7}>
                                        <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                                            <Ionicons name={item.icon} size={20} color={item.color} />
                                        </View>
                                        <Text style={styles.menuLabel}>{item.label}</Text>
                                        {item.type === 'switch' ? (
                                            <Switch value={item.value} onValueChange={item.onValueChange} trackColor={{ true: '#964b00', false: '#e5e7eb' }} thumbColor={'#ffffff'} />
                                        ) : (
                                            <View style={styles.menuRight}>
                                                {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
                                                <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                    {index < section.items.length - 1 && <View style={styles.divider} />}
                                </View>
                            ))}
                        </View>
                    </Animated.View>
                ))}

                <Animated.View entering={FadeInUp.duration(500).delay(700)} style={styles.logoutSection}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
                        <Ionicons name="log-out-outline" size={20} color="#dc2626" />
                        <Text style={styles.logoutText}>Keluar dari Akun</Text>
                    </TouchableOpacity>
                    <Text style={styles.version}>Versi 1.0.0</Text>
                </Animated.View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    header: { paddingHorizontal: SIZES.padding, paddingTop: 8, paddingBottom: 16 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 2 },
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
    iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#faf8f5', alignItems: 'center', justifyContent: 'center', ...SHADOWS.small },
    profileSection: { paddingHorizontal: SIZES.padding, marginBottom: 16 },
    profileCard: { borderRadius: 24, padding: 24, overflow: 'hidden', alignItems: 'center', ...SHADOWS.large },
    profileDecor1: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)', top: -30, right: -20 },
    profileContent: { alignItems: 'center' },
    avatarContainer: { position: 'relative', marginBottom: 16 },
    avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#ffffff' },
    avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#ffffff' },
    avatarText: { fontSize: 32, fontWeight: '700', color: '#ffffff' },
    editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', ...SHADOWS.small },
    userName: { fontSize: 22, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
    userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 12 },
    roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    roleText: { fontSize: 12, fontWeight: '600', color: '#ffffff' },
    statsSection: { paddingHorizontal: SIZES.padding, marginBottom: 24 },
    statsRow: { flexDirection: 'row', gap: 12 },
    statCard: { flex: 1, backgroundColor: '#ffffff', borderRadius: 20, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#f0ebe3', ...SHADOWS.small },
    statIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    statValue: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 2 },
    statLabel: { fontSize: 12, color: '#6b7280' },
    section: { paddingHorizontal: SIZES.padding, marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
    menuCard: { backgroundColor: '#ffffff', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#f0ebe3', ...SHADOWS.small },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
    menuIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#111827' },
    menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    menuValue: { fontSize: 13, color: '#9ca3af' },
    divider: { height: 1, backgroundColor: '#f3f4f6', marginLeft: 70 },
    logoutSection: { paddingHorizontal: SIZES.padding, alignItems: 'center', marginTop: 8 },
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', paddingVertical: 16, backgroundColor: '#fef2f2', borderRadius: 16, borderWidth: 1, borderColor: '#fecaca', marginBottom: 16 },
    logoutText: { fontSize: 15, fontWeight: '600', color: '#dc2626' },
    version: { fontSize: 12, color: '#9ca3af' },
});

export default ProfileScreen;
