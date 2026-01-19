/**
 * Farm Dashboard Screen
 * Halaman utama manajemen peternakan
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, SIZES, SHADOWS } from '../../constants/theme';
import { ANIMAL_TYPES } from '../../constants';
import { Header, Card, Button } from '../../components/common';

const FarmDashboardScreen = ({ navigation }) => {
    const [selectedFilter, setSelectedFilter] = useState('all');

    const stats = [
        { title: 'Total Hewan', value: '24', icon: 'paw', color: COLORS.primary },
        { title: 'Sakit', value: '2', icon: 'medkit', color: COLORS.error },
        { title: 'Hamil', value: '4', icon: 'heart', color: COLORS.accent },
        { title: 'Anakan', value: '8', icon: 'egg', color: COLORS.warning },
    ];

    const animals = [
        { id: '1', name: 'Sapi Brahma 01', type: 'CATTLE', status: 'Sehat', age: '2 Tahun', weight: '450kg', image: null },
        { id: '2', name: 'Kambing Etawa 05', type: 'GOAT', status: 'Sakit', age: '1 Tahun', weight: '45kg', image: null },
        { id: '3', name: 'Ayam Petelur 100', type: 'CHICKEN', status: 'Sehat', age: '6 Bulan', weight: '2kg', image: null },
    ];

    const renderStatCard = (item, index) => (
        <Animated.View
            entering={FadeInDown.delay(index * 100).duration(500)}
            style={[styles.statWrapper, { width: '48%' }]}
            key={index}
        >
            <Card style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statTitle}>{item.title}</Text>
            </Card>
        </Animated.View>
    );

    const renderAnimalCard = ({ item, index }) => {
        const animalType = ANIMAL_TYPES[item.type] || ANIMAL_TYPES.OTHER;

        return (
            <Animated.View entering={FadeInDown.delay(index * 100 + 400).duration(500)}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => { }} // Navigate to detail
                >
                    <Card style={styles.animalCard}>
                        <View style={styles.animalImageContainer}>
                            <Text style={styles.animalEmoji}>{animalType.icon}</Text>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: item.status === 'Sehat' ? COLORS.success : COLORS.error }
                            ]}>
                                <Text style={styles.statusText}>{item.status}</Text>
                            </View>
                        </View>
                        <View style={styles.animalInfo}>
                            <View>
                                <Text style={styles.animalName}>{item.name}</Text>
                                <Text style={styles.animalType}>{animalType.label}</Text>
                            </View>
                            <View style={styles.animalDetails}>
                                <View style={styles.detailItem}>
                                    <Ionicons name="calendar-outline" size={14} color={COLORS.textLight} />
                                    <Text style={styles.detailText}>{item.age}</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Ionicons name="scale-outline" size={14} color={COLORS.textLight} />
                                    <Text style={styles.detailText}>{item.weight}</Text>
                                </View>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={COLORS.gray} />
                    </Card>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <Header
                title="Manajemen Ternak"
                subtitle="Pantau kondisi hewan ternakmu"
                rightIcon={<Ionicons name="add" size={24} color={COLORS.text} />}
                onRightPress={() => { }} // Navigate to Add Animal
                showBack={false}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {stats.map((stat, index) => renderStatCard(stat, index))}
                </View>

                {/* Quick Actions */}
                <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
                    <Text style={styles.sectionTitle}>Aksi Cepat</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionScroll}>
                        <Button
                            title="Catat Kesehatan"
                            icon={<Ionicons name="medical" size={18} color={COLORS.white} />}
                            size="small"
                            style={{ marginRight: 12 }}
                            onPress={() => { }}
                        />
                        <Button
                            title="Jadwal Pakan"
                            icon={<Ionicons name="time" size={18} color={COLORS.white} />}
                            size="small"
                            variant="secondary"
                            style={{ marginRight: 12 }}
                            onPress={() => { }}
                        />
                        <Button
                            title="Panen"
                            icon={<Ionicons name="basket" size={18} color={COLORS.white} />}
                            size="small"
                            variant="primary" // Changed to primary to utilize accent color logic if needed or just differ
                            style={{ backgroundColor: COLORS.success }}
                            onPress={() => { }}
                        />
                    </ScrollView>
                </Animated.View>

                {/* Animal List Header */}
                <View style={styles.listHeader}>
                    <Text style={styles.sectionTitle}>Daftar Hewan</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAll}>Lihat Semua</Text>
                    </TouchableOpacity>
                </View>

                {/* Animal List */}
                <View style={styles.animalList}>
                    {animals.map((item, index) => renderAnimalCard({ item, index }))}
                </View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: SIZES.padding,
        paddingBottom: 40,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statWrapper: {
        marginBottom: 16,
    },
    statCard: {
        alignItems: 'center',
        padding: 16,
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: SIZES.h2,
        fontWeight: '700',
        color: COLORS.text,
    },
    statTitle: {
        fontSize: SIZES.caption,
        color: COLORS.textLight,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: SIZES.h4,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 16,
    },
    actionScroll: {
        paddingRight: 20,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    seeAll: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: SIZES.bodySmall,
    },
    animalList: {
        gap: 12,
    },
    animalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    animalImageContainer: {
        width: 60,
        height: 60,
        borderRadius: SIZES.radius,
        backgroundColor: COLORS.lightGray,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        position: 'relative',
    },
    animalEmoji: {
        fontSize: 32,
    },
    statusBadge: {
        position: 'absolute',
        bottom: -6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    statusText: {
        color: COLORS.white,
        fontSize: 8,
        fontWeight: '700',
    },
    animalInfo: {
        flex: 1,
    },
    animalName: {
        fontSize: SIZES.body,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 2,
    },
    animalType: {
        fontSize: SIZES.caption,
        color: COLORS.textLight,
        marginBottom: 6,
    },
    animalDetails: {
        flexDirection: 'row',
        gap: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
    },
});

export default FarmDashboardScreen;
