import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar, Alert, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
const { width } = Dimensions.get('window');

// --- Komponen Card Menu ---
const MenuCard = ({ title, subtitle, icon, onPress, color = COLORS.primary }) => (
    <TouchableOpacity style={styles.menuCard} onPress={onPress}>
        <View style={[styles.menuIconBox, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>{title}</Text>
            <Text style={styles.menuSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
);

const AdminDashboardScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    const stats = [
        { label: 'Total User', value: '1.2k', icon: 'people', color: '#3b82f6', bg: '#dbeafe' },
        { label: 'Total Toko', value: '85', icon: 'storefront', color: '#f59e0b', bg: '#fef3c7' },
        { label: 'Active Ads', value: '320', icon: 'campaign', color: '#10b981', bg: '#d1fae5' },
        { label: 'Laporan', value: '3', icon: 'alert-circle', color: '#ef4444', bg: '#fee2e2' },
    ];

    const showFeatureAlert = (featureName) => {
        if (Platform.OS === 'web') {
            window.alert(`Fitur ${featureName} akan segera hadir!`);
        } else {
            // Removed Alert.alert for non-web platforms as per instruction
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#964b00" />

            {/* Header */}
            <View>
                <LinearGradient
                    colors={['#964b00', '#854d0e']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.headerContainer, { paddingTop: insets.top + 20 }]}
                >
                    <View style={styles.navBar}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.navTitle}>Admin Dashboard</Text>
                        <View style={styles.avatarContainer}>
                            {user?.photoURL ? (
                                <Image source={{ uri: user.photoURL }} style={styles.avatar} />
                            ) : (
                                <Text style={styles.avatarText}>{user?.displayName?.charAt(0) || 'A'}</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.greetingSection}>
                        <Text style={styles.greeting}>Selamat Datang,</Text>
                        <Text style={styles.username}>{user?.displayName || 'Administrator'}</Text>
                    </View>
                </LinearGradient>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* Stats Grid dengan Layout 2 Kolom Rapi */}
                <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
                    <Text style={styles.sectionTitle}>Ringkasan</Text>
                </View>

                <View style={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.statCard, { backgroundColor: stat.bg }]}
                            activeOpacity={0.9}
                        >
                            <View style={[styles.statIcon, { backgroundColor: '#fff' }]}>
                                <Ionicons name={stat.icon} size={24} color={stat.color} />
                            </View>
                            <View>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Section Menu Kontrol */}
                <View>
                    <Text style={styles.sectionTitle}>Menu Kontrol</Text>
                </View>

                <View style={styles.menuList}>
                    <MenuCard
                        title="Manajemen Edukasi"
                        subtitle="Upload materi & kelola kursus"
                        icon="school-outline"
                        color="#b87333"
                        onPress={() => navigation.navigate('EducationManagement')}
                    />
                    <MenuCard
                        title="Kelola Penjual"
                        subtitle="Verifikasi & daftar toko"
                        icon="storefront-outline"
                        color="#10b981"
                        onPress={() => navigation.navigate('SellerManagement')}
                    />
                    <MenuCard
                        title="Kelola Pengguna"
                        subtitle="Database user & perizinan"
                        icon="people-outline"
                        color="#4b5563"
                        onPress={() => navigation.navigate('UserManagement')}
                    />
                </View>

                {/* Menu Lainnya */}
                <View>
                    <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Menu Lainnya</Text>
                </View>

                <View style={styles.menuList}>
                    <MenuCard
                        title="Laporan Masalah"
                        subtitle="Feedback & pelaporan user"
                        icon="warning-outline"
                        color="#ef4444"
                        onPress={() => showFeatureAlert('Laporan')}
                    />
                </View>

                {/* Banner Broadcast */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Aksi Cepat</Text>
                </View>

                <TouchableOpacity
                    style={styles.broadcastBanner}
                    activeOpacity={0.9}
                    onPress={() => showFeatureAlert('Broadcast')}
                >
                    <View style={styles.broadcastContent}>
                        <Text style={styles.broadcastTitle}>Broadcast Pesan</Text>
                        <Text style={styles.broadcastDesc}>Kirim notifikasi masal</Text>
                    </View>
                    <View style={styles.broadcastIcon}>
                        <Ionicons name="megaphone" size={24} color="#964b00" />
                    </View>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        ...(Platform.OS === 'web' ? { flex: 0, height: 'auto', minHeight: '100vh' } : {})
    },
    headerContainer: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        ...SHADOWS.medium,
    },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#964b00',
    },
    greetingSection: {
        paddingHorizontal: 4,
    },
    greeting: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 4,
    },
    username: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
    },
    content: {
        marginTop: 10,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginLeft: 20,
        marginBottom: 12,
        marginTop: 20
    },
    // STATS GRID FIX
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        gap: 12,
    },
    statCard: {
        width: '48%', // Pastikan 2 kolom
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 0, // ditangani oleh gap, atau fallback
        flexDirection: 'row', // Icon di kiri, teks di kanan (atau ganti column kalau mau centered)
        alignItems: 'center',
        gap: 12,
        ...SHADOWS.small,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    // Menu List
    menuList: {
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 20,
    },
    menuCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        ...SHADOWS.small,
        marginBottom: 12
    },
    menuIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    menuInfo: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    menuSubtitle: {
        fontSize: 13,
        color: '#6b7280',
    },
    // Broadcast Banner
    broadcastBanner: {
        marginHorizontal: 20,
        marginBottom: 40,
        padding: 20,
        backgroundColor: '#964b00',
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...SHADOWS.medium,
    },
    broadcastContent: {
        flex: 1,
    },
    broadcastTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    broadcastDesc: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
    },
    broadcastIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default AdminDashboardScreen;
