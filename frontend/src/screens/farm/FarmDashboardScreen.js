/**
 * Farm Dashboard Screen
 * Halaman manajemen peternakan dengan tema putih + coklat
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { ANIMAL_TYPES } from '../../constants';

const { width } = Dimensions.get('window');

const FarmDashboardScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [selectedFilter, setSelectedFilter] = useState('all');

    const stats = [
        { title: 'Total Hewan', value: '24', icon: 'paw', color: '#964b00', bgColor: '#faf8f5', trend: '+3' },
        { title: 'Kondisi Sakit', value: '2', icon: 'medkit', color: '#dc2626', bgColor: '#fef2f2', trend: '-1' },
        { title: 'Sedang Hamil', value: '4', icon: 'heart', color: '#7c3f06', bgColor: '#faf8f5', trend: '+2' },
        { title: 'Anakan Baru', value: '8', icon: 'egg', color: '#b87333', bgColor: '#fdf5ef', trend: '+5' },
    ];

    const quickActions = [
        { id: 1, title: 'Catat Kesehatan', icon: 'medical', gradient: ['#964b00', '#7c3f06'] },
        { id: 2, title: 'Jadwal Pakan', icon: 'time', gradient: ['#7c3f06', '#5d3a1a'] },
        { id: 3, title: 'Panen', icon: 'basket', gradient: ['#b87333', '#964b00'] },
    ];

    const animals = [
        { id: '1', name: 'Brahma 01', type: 'CATTLE', status: 'Sehat', age: '2 Tahun', weight: '450kg', lastCheck: '2 hari lalu' },
        { id: '2', name: 'Etawa 05', type: 'GOAT', status: 'Sakit', age: '1 Tahun', weight: '45kg', lastCheck: '1 hari lalu' },
        { id: '3', name: 'Petelur 100', type: 'CHICKEN', status: 'Sehat', age: '6 Bulan', weight: '2kg', lastCheck: '3 hari lalu' },
    ];

    const filters = [
        { id: 'all', label: 'Semua' },
        { id: 'healthy', label: 'Sehat' },
        { id: 'sick', label: 'Sakit' },
        { id: 'pregnant', label: 'Hamil' },
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
                    <View style={styles.headerTop}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.headerSubtitle}>Manajemen Ternak 🐄</Text>
                            <Text style={styles.headerTitle}>Peternakan Saya</Text>
                        </View>
                        <View style={styles.headerRight}>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="search-outline" size={22} color="#374151" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="add" size={24} color="#374151" />
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

                        <View style={styles.summaryContent}>
                            <View style={styles.summaryLeft}>
                                <Text style={styles.summaryLabel}>Total Hewan Ternak</Text>
                                <Text style={styles.summaryValue}>24</Text>
                                <View style={styles.trendBadge}>
                                    <Ionicons name="trending-up" size={14} color="#ffffff" />
                                    <Text style={styles.trendText}>+12% dari bulan lalu</Text>
                                </View>
                            </View>
                            <View style={styles.summaryIcon}>
                                <Text style={styles.summaryEmoji}>🐄</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Stats Grid */}
                <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.section}>
                    <Text style={styles.sectionTitle}>Statistik</Text>
                    <View style={styles.statsGrid}>
                        {stats.map((stat, index) => (
                            <Animated.View
                                key={index}
                                entering={FadeInUp.delay(index * 80).duration(400)}
                                style={styles.statCard}
                            >
                                <View style={[styles.statIconContainer, { backgroundColor: stat.bgColor }]}>
                                    <Ionicons name={stat.icon} size={20} color={stat.color} />
                                </View>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statTitle}>{stat.title}</Text>
                                <View style={[
                                    styles.statTrend,
                                    { backgroundColor: stat.trend.startsWith('+') ? '#ecfdf5' : '#fef2f2' }
                                ]}>
                                    <Ionicons
                                        name={stat.trend.startsWith('+') ? 'trending-up' : 'trending-down'}
                                        size={10}
                                        color={stat.trend.startsWith('+') ? '#10b981' : '#ef4444'}
                                    />
                                    <Text style={[
                                        styles.statTrendText,
                                        { color: stat.trend.startsWith('+') ? '#10b981' : '#ef4444' }
                                    ]}>{stat.trend}</Text>
                                </View>
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
                                <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
                                    <LinearGradient
                                        colors={action.gradient}
                                        style={styles.actionGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <Ionicons name={action.icon} size={24} color="#ffffff" />
                                    </LinearGradient>
                                    <Text style={styles.actionTitle}>{action.title}</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>

                {/* Animal List */}
                <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Daftar Hewan</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>Lihat Semua</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Filter Pills */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.filterScroll}
                        contentContainerStyle={styles.filterContainer}
                    >
                        {filters.map((filter) => (
                            <TouchableOpacity
                                key={filter.id}
                                style={[
                                    styles.filterPill,
                                    selectedFilter === filter.id && styles.filterPillActive
                                ]}
                                onPress={() => setSelectedFilter(filter.id)}
                            >
                                <Text style={[
                                    styles.filterText,
                                    selectedFilter === filter.id && styles.filterTextActive
                                ]}>{filter.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Animal Cards */}
                    <View style={styles.animalList}>
                        {animals.map((animal, index) => (
                            <AnimalCard key={animal.id} animal={animal} index={index} />
                        ))}
                    </View>
                </Animated.View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const AnimalCard = ({ animal, index }) => {
    const animalType = ANIMAL_TYPES[animal.type] || ANIMAL_TYPES.OTHER;
    const isHealthy = animal.status === 'Sehat';

    return (
        <Animated.View entering={FadeInUp.delay(index * 100).duration(400)}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => { }}>
                <View style={styles.animalCard}>
                    <View style={styles.animalLeft}>
                        <View style={styles.animalImageContainer}>
                            <Text style={styles.animalEmoji}>{animalType.icon}</Text>
                            <View style={[
                                styles.statusDot,
                                { backgroundColor: isHealthy ? '#10b981' : '#ef4444' }
                            ]} />
                        </View>
                    </View>
                    <View style={styles.animalContent}>
                        <View style={styles.animalHeader}>
                            <Text style={styles.animalName}>{animal.name}</Text>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: isHealthy ? '#ecfdf5' : '#fef2f2' }
                            ]}>
                                <Text style={[
                                    styles.statusText,
                                    { color: isHealthy ? '#059669' : '#dc2626' }
                                ]}>{animal.status}</Text>
                            </View>
                        </View>
                        <Text style={styles.animalType}>{animalType.label}</Text>
                        <View style={styles.animalMeta}>
                            <View style={styles.metaItem}>
                                <Ionicons name="calendar-outline" size={12} color="#9ca3af" />
                                <Text style={styles.metaText}>{animal.age}</Text>
                            </View>
                            <View style={styles.metaDot} />
                            <View style={styles.metaItem}>
                                <Ionicons name="scale-outline" size={12} color="#9ca3af" />
                                <Text style={styles.metaText}>{animal.weight}</Text>
                            </View>
                            <View style={styles.metaDot} />
                            <View style={styles.metaItem}>
                                <Ionicons name="time-outline" size={12} color="#9ca3af" />
                                <Text style={styles.metaText}>{animal.lastCheck}</Text>
                            </View>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
                </View>
            </TouchableOpacity>
        </Animated.View>
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
    headerSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 2,
    },
    headerTitle: {
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
    summarySection: {
        paddingHorizontal: SIZES.padding,
        marginBottom: 24,
    },
    summaryCard: {
        borderRadius: 24,
        padding: 24,
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
    summaryContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLeft: {},
    summaryLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 48,
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: 8,
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    trendText: {
        fontSize: 12,
        color: '#ffffff',
        fontWeight: '500',
    },
    summaryIcon: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    summaryEmoji: {
        fontSize: 48,
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
        color: '#964b00',
        fontWeight: '600',
        fontSize: 14,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        width: (width - SIZES.padding * 2 - 12) / 2,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f0ebe3',
        ...SHADOWS.small,
    },
    statIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },
    statTitle: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 8,
    },
    statTrend: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    statTrendText: {
        fontSize: 10,
        fontWeight: '600',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionWrapper: {
        flex: 1,
    },
    actionButton: {
        alignItems: 'center',
        gap: 10,
    },
    actionGradient: {
        width: '100%',
        paddingVertical: 18,
        borderRadius: 18,
        alignItems: 'center',
        ...SHADOWS.small,
    },
    actionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
    },
    filterScroll: {
        marginBottom: 16,
        marginLeft: -SIZES.padding,
        marginRight: -SIZES.padding,
        marginTop: -8,
    },
    filterContainer: {
        paddingHorizontal: SIZES.padding,
        gap: 8,
    },
    filterPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#faf8f5',
        borderWidth: 1,
        borderColor: '#f0ebe3',
    },
    filterPillActive: {
        backgroundColor: '#964b00',
        borderColor: '#964b00',
    },
    filterText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#6b7280',
    },
    filterTextActive: {
        color: '#ffffff',
    },
    animalList: {
        gap: 12,
    },
    animalCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f0ebe3',
        ...SHADOWS.small,
    },
    animalLeft: {
        marginRight: 14,
    },
    animalImageContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#faf8f5',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    animalEmoji: {
        fontSize: 28,
    },
    statusDot: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        bottom: -2,
        right: -2,
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    animalContent: {
        flex: 1,
    },
    animalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 2,
    },
    animalName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
    },
    animalType: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 6,
    },
    animalMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    metaText: {
        fontSize: 11,
        color: '#9ca3af',
    },
    metaDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#d1d5db',
        marginHorizontal: 6,
    },
});

export default FarmDashboardScreen;
