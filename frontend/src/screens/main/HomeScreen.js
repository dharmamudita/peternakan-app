/**
 * Home Screen
 * Halaman beranda dengan tema putih + coklat
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { animalApi, productApi, courseApi } from '../../services/api';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState({
        totalAnimals: 0,
        totalProducts: 0,
        totalCourses: 0,
    });
    const [unreadCount, setUnreadCount] = useState(0);

    useFocusEffect(
        useCallback(() => {
            const loadDashboardData = async () => {
                // ... (Existing stats loading)

                // 4. Load Notifications Count
                try {
                    const notifApi = require('../../services/api').notificationApi;
                    const notifRes = await notifApi.getAll();
                    const notifs = notifRes.data || [];
                    const unread = notifs.filter(n => !n.isRead).length;
                    setUnreadCount(unread);
                } catch (error) {
                    console.log('Home - Notif Error:', error.message);
                }
            };
            loadDashboardData();
        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            const loadDashboardData = async () => {
                // 1. Load Animal Stats (Priority)
                try {
                    const statsRes = await animalApi.getStats();
                    const statsData = statsRes.data || statsRes || {};
                    setDashboardData(prev => ({
                        ...prev,
                        totalAnimals: statsData.total || 0
                    }));
                } catch (error) {
                    console.log('Home - Animal Stats Error:', error.message);
                }

                // 2. Load Products (Optional)
                try {
                    const productsRes = await productApi.getAll({ limit: 1 });
                    const productsWrapper = productsRes.data || productsRes || {};
                    setDashboardData(prev => ({
                        ...prev,
                        totalProducts: productsWrapper.pagination?.total || 0
                    }));
                } catch (error) {
                    console.log('Home - Product API Error:', error.message);
                }

                // 3. Load Courses (Optional)
                try {
                    const coursesRes = await courseApi.getAll({ limit: 1 });
                    const coursesWrapper = coursesRes.data || coursesRes || {};
                    setDashboardData(prev => ({
                        ...prev,
                        totalCourses: coursesWrapper.pagination?.total || 0
                    }));
                } catch (error) {
                    console.log('Home - Course API Error:', error.message);
                }
            };
            loadDashboardData();
        }, [])
    );

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Selamat Pagi';
        if (hour < 15) return 'Selamat Siang';
        if (hour < 18) return 'Selamat Sore';
        return 'Selamat Malam';
    };

    const getDate = () => {
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        return new Date().toLocaleDateString('id-ID', options);
    };

    const stats = [
        { label: 'Total Hewan', value: dashboardData.totalAnimals.toString(), icon: 'paw', color: '#964b00' },
        { label: 'Produk Aktif', value: dashboardData.totalProducts.toString(), icon: 'cube', color: '#7c3f06' },
        { label: 'Kursus', value: dashboardData.totalCourses.toString(), icon: 'book', color: '#b87333' },
    ];

    const menuItems = [
        {
            id: 1,
            title: 'Peternakan',
            subtitle: 'Kelola hewan',
            icon: 'paw',
            gradient: ['#964b00', '#7c3f06'],
            onPress: () => navigation.navigate('FarmTab'),
        },
        {
            id: 2,
            title: 'Marketplace',
            subtitle: 'Jual beli',
            icon: 'cart',
            gradient: ['#7c3f06', '#5d3a1a'],
            onPress: () => navigation.navigate('MarketTab'),
        },
        {
            id: 3,
            title: 'Edukasi',
            subtitle: 'Belajar',
            icon: 'school',
            gradient: ['#b87333', '#964b00'],
            onPress: () => navigation.navigate('EducationTab'),
        },
        {
            id: 4,
            title: 'Profil',
            subtitle: 'Akun saya',
            icon: 'person',
            gradient: ['#5d3a1a', '#3d2510'],
            onPress: () => navigation.navigate('ProfileTab'),
        },
    ];

    const quickActions = [
        {
            id: 1,
            title: 'Tambah Hewan',
            icon: 'add-circle',
            color: '#964b00',
            onPress: () => navigation.navigate('FarmTab', { action: 'add_animal' })
        },
        {
            id: 2,
            title: 'Catat Kesehatan',
            icon: 'medical',
            color: '#7c3f06',
            onPress: () => navigation.navigate('FarmTab')
        },
    ];

    const activities = [
        { id: 1, title: 'Sapi Brahma - Vaksinasi', time: '2 jam lalu', icon: 'medical', color: '#964b00' },
        { id: 2, title: 'Pesanan Baru dari Ahmad', time: '5 jam lalu', icon: 'cart', color: '#7c3f06' },
        { id: 3, title: 'Kambing Etawa - Lahiran', time: '1 hari lalu', icon: 'heart', color: '#b87333' },
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
                    <View style={styles.headerTop}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
                            <Text style={styles.userName}>{user?.displayName || 'Peternak'}</Text>
                        </View>
                        <View style={styles.headerRight}>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="search-outline" size={22} color="#374151" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notification')}>
                                <Ionicons name="notifications-outline" size={22} color="#374151" />
                                {unreadCount > 0 && (
                                    <View style={styles.notifBadge}>
                                        <Text style={styles.notifText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>

                {/* Summary Card */}
                <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.summarySection}>
                    <LinearGradient
                        colors={['#964b00', '#7c3f06']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.summaryCard}
                    >
                        <View style={styles.summaryDecor1} />
                        <View style={styles.summaryDecor2} />

                        <View style={styles.summaryHeader}>
                            <Text style={styles.summaryTitle}>Ringkasan Hari Ini</Text>
                            <View style={styles.dateBadge}>
                                <Text style={styles.dateText}>{getDate()}</Text>
                            </View>
                        </View>

                        <View style={styles.statsRow}>
                            {stats.map((stat, index) => (
                                <View key={index} style={styles.statItem}>
                                    <View style={styles.statIconBg}>
                                        <Ionicons name={stat.icon} size={18} color="#ffffff" />
                                    </View>
                                    <Text style={styles.statValue}>{stat.value}</Text>
                                    <Text style={styles.statLabel}>{stat.label}</Text>
                                </View>
                            ))}
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Menu Grid */}
                <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.section}>
                    <Text style={styles.sectionTitle}>Menu Utama</Text>
                    <View style={styles.menuGrid}>
                        {menuItems.map((item, index) => (
                            <Animated.View
                                key={item.id}
                                entering={FadeInUp.delay(index * 80).duration(400)}
                                style={styles.menuItemWrapper}
                            >
                                <TouchableOpacity
                                    style={styles.menuCard}
                                    onPress={item.onPress}
                                    activeOpacity={0.9}
                                >
                                    <LinearGradient
                                        colors={item.gradient}
                                        style={styles.menuIconGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <Ionicons name={item.icon} size={28} color="#ffffff" />
                                    </LinearGradient>
                                    <Text style={styles.menuTitle}>{item.title}</Text>
                                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>

                {/* Quick Actions */}
                <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.section}>
                    <Text style={styles.sectionTitle}>Aksi Cepat</Text>
                    <View style={styles.actionsRow}>
                        {quickActions.map((action, index) => (
                            <Animated.View
                                key={action.id}
                                entering={FadeInRight.delay(index * 100).duration(400)}
                                style={styles.actionWrapper}
                            >
                                <TouchableOpacity style={styles.actionCard} activeOpacity={0.9} onPress={action.onPress}>
                                    <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                                        <Ionicons name={action.icon} size={22} color={action.color} />
                                    </View>
                                    <Text style={styles.actionTitle}>{action.title}</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>

                {/* Recent Activities */}
                <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>Lihat Semua</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.activitiesList}>
                        {activities.map((activity, index) => (
                            <Animated.View
                                key={activity.id}
                                entering={FadeInUp.delay(index * 100).duration(400)}
                            >
                                <TouchableOpacity style={styles.activityCard} activeOpacity={0.9}>
                                    <View style={[styles.activityIcon, { backgroundColor: activity.color + '15' }]}>
                                        <Ionicons name={activity.icon} size={20} color={activity.color} />
                                    </View>
                                    <View style={styles.activityContent}>
                                        <Text style={styles.activityTitle}>{activity.title}</Text>
                                        <Text style={styles.activityTime}>{activity.time}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        paddingHorizontal: SIZES.padding,
        paddingTop: 8,
        paddingBottom: 16,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {},
    greeting: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 2,
    },
    userName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: -0.5,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 8,
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
    notifBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#dc2626',
    },
    summarySection: {
        paddingHorizontal: SIZES.padding,
        marginBottom: 24,
    },
    summaryCard: {
        borderRadius: 24,
        padding: 20,
        overflow: 'hidden',
        ...SHADOWS.large,
    },
    summaryDecor1: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.1)',
        top: -40,
        right: -20,
    },
    summaryDecor2: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.08)',
        bottom: -20,
        left: 20,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    dateBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    dateText: {
        fontSize: 11,
        color: '#ffffff',
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
    },
    statIconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.8)',
    },
    section: {
        paddingHorizontal: SIZES.padding,
        marginBottom: 24,
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
        marginBottom: 16,
    },
    seeAll: {
        fontSize: 14,
        color: '#964b00',
        fontWeight: '600',
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    menuItemWrapper: {
        width: (width - SIZES.padding * 2 - 12) / 2,
    },
    menuCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 18,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f0ebe3',
        ...SHADOWS.small,
    },
    menuIconGradient: {
        width: 56,
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    menuTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 12,
        color: '#9ca3af',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionWrapper: {
        flex: 1,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f0ebe3',
        ...SHADOWS.small,
    },
    actionIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        flex: 1,
    },
    activitiesList: {
        gap: 10,
    },
    activityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f0ebe3',
        ...SHADOWS.small,
    },
    activityIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    activityTime: {
        fontSize: 12,
        color: '#9ca3af',
    },
});

export default HomeScreen;
