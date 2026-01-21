import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar, Alert, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

// --- Komponen Card Minimalis ---
const MenuCard = ({ title, subtitle, icon, onPress }) => {
    return (
        <TouchableOpacity
            style={styles.menuCardContainer}
            activeOpacity={0.7}
            onPress={onPress}
        >
            <View style={styles.menuCard}>
                <View style={[styles.iconContainer]}>
                    <Ionicons name={icon} size={24} color={COLORS.primary} />
                </View>
                <View style={styles.menuContent}>
                    <Text style={styles.menuTitle}>{title}</Text>
                    <Text style={styles.menuSubtitle}>{subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </View>
        </TouchableOpacity>
    );
};

// --- Stat Card ---
const StatCard = ({ label, value, icon, color }) => (
    <View style={styles.statCardContainer}>
        <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={22} color={color} />
            </View>
            <View>
                <Text style={[styles.statValue, { color: color }]}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
            </View>
        </View>
    </View>
);

const AdminDashboardScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    // Data dummy
    const stats = [
        { label: 'Total User', value: '1.2k', icon: 'people', color: '#964b00' },
        { label: 'Toko Baru', value: '5', icon: 'storefront', color: '#10b981' },
        { label: 'Verifikasi', value: '12', icon: 'checkmark-circle', color: '#b45309' },
        { label: 'Laporan', value: '3', icon: 'alert-circle', color: '#ef4444' },
    ];

    const showFeatureAlert = (featureName) => {
        if (Platform.OS === 'web') {
            window.alert(`Fitur ${featureName} akan segera hadir!`);
        } else {
            Alert.alert('Segera Hadir', `Fitur ${featureName} sedang dalam pengembangan.`);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#964b00" />

            {/* Header Standar + Tombol Back Kiri Atas */}
            <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
                <LinearGradient
                    colors={['#964b00', '#7c3f06']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />

                {/* Baris Navigasi Atas */}
                <View style={styles.navBar}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.navTitle}>Dashboard</Text>

                    <View style={styles.avatarContainer}>
                        {user?.photoURL ? (
                            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
                        ) : (
                            <Text style={styles.avatarText}>{user?.displayName?.charAt(0) || 'A'}</Text>
                        )}
                    </View>
                </View>

                {/* Greeting Section */}
                <View style={styles.greetingSection}>
                    <Text style={styles.greeting}>Administrator</Text>
                    <Text style={styles.username}>{user?.displayName || 'Super Admin'}</Text>
                </View>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 50, paddingTop: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {stats.map((stat, i) => (
                        <StatCard key={i} {...stat} />
                    ))}
                </View>

                {/* Section Menu */}
                <Text style={styles.sectionTitle}>Menu Kontrol</Text>

                <View style={styles.menuList}>
                    <MenuCard
                        title="Manajemen Edukasi"
                        subtitle="Upload materi & kelola kursus"
                        icon="school-outline"
                        onPress={() => navigation.navigate('EducationManagement')}
                    />
                    <MenuCard
                        title="Verifikasi Produk"
                        subtitle="Persetujuan produk penjual"
                        icon="checkmark-done-circle-outline"
                        onPress={() => showFeatureAlert('Verifikasi Produk')}
                    />
                    <MenuCard
                        title="Kelola Pengguna"
                        subtitle="Database user & perizinan"
                        icon="people-outline"
                        onPress={() => showFeatureAlert('Kelola Pengguna')}
                    />
                    <MenuCard
                        title="Laporan Masalah"
                        subtitle="Feedback & pelaporan user"
                        icon="warning-outline"
                        onPress={() => showFeatureAlert('Laporan')}
                    />
                </View>

                {/* Banner Broadcast */}
                <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Aksi Cepat</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Broadcast')} activeOpacity={0.8}>
                    <LinearGradient
                        colors={['#b87333', '#964b00']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.banner}
                    >
                        <View>
                            <Text style={styles.bannerTitle}>Broadcast Pesan</Text>
                            <Text style={styles.bannerDesc}>Kirim notifikasi masal</Text>
                        </View>
                        <View style={styles.bannerIconBox}>
                            <Ionicons name="megaphone" size={24} color="#964b00" />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#faf8f5',
    },
    // Header
    headerContainer: {
        paddingHorizontal: 20,
        paddingBottom: 25,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    navTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatar: { width: '100%', height: '100%', borderRadius: 20 },
    avatarText: { fontSize: 16, fontWeight: 'bold', color: '#964b00' },

    greetingSection: {
        paddingHorizontal: 4,
    },
    greeting: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginBottom: 2 },
    username: { fontSize: 22, fontWeight: 'bold', color: '#fff' },

    // Content
    content: { flex: 1, paddingHorizontal: 20 },
    sectionTitle: {
        fontSize: 16, fontWeight: 'bold', color: '#5d3a1a',
        marginBottom: 12, marginLeft: 4,
    },

    // Stats Grid
    statsGrid: {
        flexDirection: 'row', flexWrap: 'wrap',
        justifyContent: 'space-between', marginBottom: 24,
    },
    statCardContainer: { width: '48%', marginBottom: 16 },
    statCard: {
        padding: 16, borderRadius: 16,
        backgroundColor: '#fff', ...SHADOWS.small,
        flexDirection: 'row', alignItems: 'center', gap: 12,
    },
    statIconBox: {
        width: 40, height: 40, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
    },
    statValue: { fontSize: 18, fontWeight: 'bold' },
    statLabel: { fontSize: 12, color: '#6b7280' },

    // Menu List
    menuList: { gap: 12, marginBottom: 24 },
    menuCardContainer: { ...SHADOWS.small },
    menuCard: {
        flexDirection: 'row', alignItems: 'center',
        padding: 16, backgroundColor: '#ffffff', borderRadius: 16,
    },
    iconContainer: {
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: '#f5f2ed',
        alignItems: 'center', justifyContent: 'center', marginRight: 14,
    },
    menuContent: { flex: 1 },
    menuTitle: { fontSize: 15, fontWeight: '700', color: '#4b3621' },
    menuSubtitle: { fontSize: 12, color: '#8d7861' },

    // Banner
    banner: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 20, borderRadius: 20, marginBottom: 30, ...SHADOWS.medium,
    },
    bannerTitle: { fontSize: 17, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
    bannerDesc: { fontSize: 13, color: 'rgba(255,255,255,0.9)' },
    bannerIconBox: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    },
});

export default AdminDashboardScreen;
