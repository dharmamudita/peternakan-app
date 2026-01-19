/**
 * Home Screen
 * Dashboard utama dengan animasi dan stats
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    RefreshControl,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    FadeInDown,
    FadeInRight,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, SIZES, SHADOWS } from '../../constants/theme';
import { Card, Button } from '../../components/common';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRefreshing(false);
    };

    const menuItems = [
        { id: 'farm', title: 'Peternakan', icon: '🐄', color: COLORS.primary, screen: 'FarmTab' },
        { id: 'market', title: 'Marketplace', icon: '🛒', color: COLORS.accent, screen: 'MarketTab' },
        { id: 'education', title: 'Edukasi', icon: '📚', color: COLORS.success, screen: 'EducationTab' },
        { id: 'profile', title: 'Profil', icon: '👤', color: COLORS.info, screen: 'ProfileTab' },
    ];

    const quickStats = [
        { id: 1, label: 'Total Hewan', value: '24', icon: 'paw', color: COLORS.primary },
        { id: 2, label: 'Produk Aktif', value: '12', icon: 'cube', color: COLORS.accent },
        { id: 3, label: 'Kursus Diikuti', value: '3', icon: 'book', color: COLORS.success },
    ];

    const recentActivities = [
        { id: 1, type: 'health', title: 'Pemeriksaan Sapi #12', time: '2 jam lalu', icon: 'medkit' },
        { id: 2, type: 'order', title: 'Pesanan baru #ORD241019', time: '5 jam lalu', icon: 'cart' },
        { id: 3, type: 'course', title: 'Menyelesaikan Modul 3', time: '1 hari lalu', icon: 'school' },
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
            >
                {/* Header */}
                <Animated.View
                    entering={FadeInDown.duration(500)}
                    style={styles.header}
                >
                    <LinearGradient
                        colors={GRADIENTS.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.headerGradient}
                    >
                        <View style={styles.headerContent}>
                            <View style={styles.headerLeft}>
                                <Text style={styles.greeting}>Selamat Datang! 👋</Text>
                                <Text style={styles.userName}>{user?.displayName || 'Peternak'}</Text>
                            </View>
                            <TouchableOpacity style={styles.notificationBtn}>
                                <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
                                <View style={styles.notificationBadge}>
                                    <Text style={styles.badgeText}>3</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Search Bar */}
                        <TouchableOpacity style={styles.searchBar}>
                            <Ionicons name="search" size={20} color={COLORS.gray} />
                            <Text style={styles.searchPlaceholder}>Cari produk, materi, atau hewan...</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>

                {/* Quick Stats */}
                <Animated.View
                    entering={FadeInDown.duration(500).delay(100)}
                    style={styles.statsContainer}
                >
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.statsScrollContent}
                    >
                        {quickStats.map((stat, index) => (
                            <StatCard key={stat.id} stat={stat} index={index} />
                        ))}
                    </ScrollView>
                </Animated.View>

                {/* Menu Grid */}
                <Animated.View
                    entering={FadeInDown.duration(500).delay(200)}
                    style={styles.section}
                >
                    <Text style={styles.sectionTitle}>Menu Utama</Text>
                    <View style={styles.menuGrid}>
                        {menuItems.map((item, index) => (
                            <MenuItem
                                key={item.id}
                                item={item}
                                index={index}
                                onPress={() => navigation.navigate(item.screen)}
                            />
                        ))}
                    </View>
                </Animated.View>

                {/* Recent Activities */}
                <Animated.View
                    entering={FadeInDown.duration(500).delay(300)}
                    style={styles.section}
                >
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>Lihat Semua</Text>
                        </TouchableOpacity>
                    </View>
                    {recentActivities.map((activity, index) => (
                        <ActivityItem key={activity.id} activity={activity} index={index} />
                    ))}
                </Animated.View>

                {/* Quick Actions */}
                <Animated.View
                    entering={FadeInDown.duration(500).delay(400)}
                    style={styles.section}
                >
                    <Text style={styles.sectionTitle}>Aksi Cepat</Text>
                    <View style={styles.actionButtons}>
                        <Button
                            title="Tambah Hewan"
                            variant="primary"
                            size="medium"
                            icon={<Ionicons name="add-circle" size={20} color={COLORS.white} />}
                            onPress={() => { }}
                            style={styles.actionButton}
                        />
                        <Button
                            title="Jual Produk"
                            variant="secondary"
                            size="medium"
                            icon={<Ionicons name="pricetag" size={20} color={COLORS.white} />}
                            onPress={() => { }}
                            style={styles.actionButton}
                        />
                    </View>
                </Animated.View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const StatCard = ({ stat, index }) => {
    const scale = useSharedValue(0);

    useEffect(() => {
        scale.value = withSpring(1, { damping: 10, delay: index * 100 });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[styles.statCard, animatedStyle, { backgroundColor: stat.color + '15' }]}>
            <View style={[styles.statIconContainer, { backgroundColor: stat.color }]}>
                <Ionicons name={stat.icon} size={20} color={COLORS.white} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
        </Animated.View>
    );
};

const MenuItem = ({ item, index, onPress }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    return (
        <Animated.View
            entering={FadeInRight.duration(400).delay(index * 100)}
            style={animatedStyle}
        >
            <TouchableOpacity
                style={styles.menuItem}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
            >
                <View style={[styles.menuIconContainer, { backgroundColor: item.color + '20' }]}>
                    <Text style={styles.menuEmoji}>{item.icon}</Text>
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const ActivityItem = ({ activity, index }) => (
    <Animated.View entering={FadeInRight.duration(400).delay(index * 100)}>
        <Card style={styles.activityCard} animate={false}>
            <View style={styles.activityContent}>
                <View style={[styles.activityIcon, { backgroundColor: COLORS.primary + '20' }]}>
                    <Ionicons name={activity.icon} size={20} color={COLORS.primary} />
                </View>
                <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
            </View>
        </Card>
    </Animated.View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        marginBottom: 16,
    },
    headerGradient: {
        paddingHorizontal: SIZES.padding,
        paddingTop: 16,
        paddingBottom: 24,
        borderBottomLeftRadius: SIZES.radiusLarge,
        borderBottomRightRadius: SIZES.radiusLarge,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerLeft: {},
    greeting: {
        fontSize: SIZES.body,
        color: COLORS.offWhite,
        marginBottom: 4,
    },
    userName: {
        fontSize: SIZES.h2,
        fontWeight: '800',
        color: COLORS.white,
    },
    notificationBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: COLORS.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.white,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: SIZES.radius,
        gap: 12,
    },
    searchPlaceholder: {
        fontSize: SIZES.body,
        color: COLORS.gray,
    },
    statsContainer: {
        marginBottom: 24,
    },
    statsScrollContent: {
        paddingHorizontal: SIZES.padding,
        gap: 12,
    },
    statCard: {
        width: 120,
        padding: 16,
        borderRadius: SIZES.radius,
        alignItems: 'center',
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: SIZES.h2,
        fontWeight: '800',
        color: COLORS.text,
    },
    statLabel: {
        fontSize: SIZES.caption,
        color: COLORS.textLight,
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
        fontSize: SIZES.h3,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 16,
    },
    seeAll: {
        fontSize: SIZES.bodySmall,
        color: COLORS.primary,
        fontWeight: '600',
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'space-between',
    },
    menuItem: {
        width: (width - SIZES.padding * 2 - 16) / 2,
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: SIZES.radiusLarge,
        alignItems: 'center',
        ...SHADOWS.small,
    },
    menuIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    menuEmoji: {
        fontSize: 32,
    },
    menuTitle: {
        fontSize: SIZES.body,
        fontWeight: '600',
        color: COLORS.text,
    },
    activityCard: {
        marginBottom: 12,
        padding: 16,
    },
    activityContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    activityIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityInfo: {
        flex: 1,
    },
    activityTitle: {
        fontSize: SIZES.body,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 2,
    },
    activityTime: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
    },
});

export default HomeScreen;
