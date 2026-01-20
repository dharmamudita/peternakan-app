/**
 * Education Screen - Tema Putih + Coklat
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');

const EducationScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('courses');

    const courses = [
        { id: '1', title: 'Manajemen Pakan Ternak', instructor: 'Dr. Budi', lessons: 12, rating: 4.8 },
        { id: '2', title: 'Teknik Pembibitan Sapi', instructor: 'Ir. Ahmad', lessons: 8, rating: 4.9 },
        { id: '3', title: 'Kesehatan Hewan Dasar', instructor: 'Drh. Siti', lessons: 15, rating: 4.7 },
    ];

    const articles = [
        { id: '1', title: '5 Tips Mencegah Penyakit Ternak', category: 'Kesehatan', date: '12 Jan 2026' },
        { id: '2', title: 'Panduan Memilih Bibit Unggul', category: 'Pembibitan', date: '10 Jan 2026' },
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.headerSubtitle}>Tingkatkan Ilmu 📚</Text>
                            <Text style={styles.headerTitle}>Pusat Edukasi</Text>
                        </View>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="search-outline" size={22} color="#374151" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.progressSection}>
                    <LinearGradient colors={['#964b00', '#7c3f06']} style={styles.progressCard}>
                        <View style={styles.progressDecor1} />
                        <View>
                            <Text style={styles.progressLabel}>Progress Belajar</Text>
                            <Text style={styles.progressValue}>25%</Text>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: '25%' }]} />
                            </View>
                            <Text style={styles.progressText}>12 dari 48 materi selesai</Text>
                        </View>
                    </LinearGradient>
                </Animated.View>

                <View style={styles.tabSection}>
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'courses' && styles.activeTab]}
                            onPress={() => setActiveTab('courses')}
                        >
                            <Text style={[styles.tabText, activeTab === 'courses' && styles.activeTabText]}>Kursus</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'library' && styles.activeTab]}
                            onPress={() => setActiveTab('library')}
                        >
                            <Text style={[styles.tabText, activeTab === 'library' && styles.activeTabText]}>Pustaka</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{activeTab === 'courses' ? 'Kursus' : 'Artikel'}</Text>
                    {activeTab === 'courses' ? (
                        courses.map((course, i) => (
                            <Animated.View key={course.id} entering={FadeInUp.delay(i * 100)}>
                                <TouchableOpacity style={styles.card}>
                                    <LinearGradient colors={['#964b00', '#7c3f06']} style={styles.cardIcon}>
                                        <Ionicons name="play-circle" size={24} color="#fff" />
                                    </LinearGradient>
                                    <View style={styles.cardContent}>
                                        <Text style={styles.cardTitle}>{course.title}</Text>
                                        <Text style={styles.cardMeta}>{course.instructor} • {course.lessons} Modul</Text>
                                    </View>
                                    <View style={styles.ratingBadge}>
                                        <Ionicons name="star" size={12} color="#f59e0b" />
                                        <Text style={styles.ratingText}>{course.rating}</Text>
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        ))
                    ) : (
                        articles.map((article, i) => (
                            <Animated.View key={article.id} entering={FadeInUp.delay(i * 100)}>
                                <TouchableOpacity style={styles.card}>
                                    <View style={[styles.cardIcon, { backgroundColor: '#faf8f5' }]}>
                                        <Ionicons name="document-text" size={22} color="#964b00" />
                                    </View>
                                    <View style={styles.cardContent}>
                                        <Text style={styles.cardTitle}>{article.title}</Text>
                                        <Text style={styles.cardMeta}>{article.category} • {article.date}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
                                </TouchableOpacity>
                            </Animated.View>
                        ))
                    )}
                </View>
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
    progressSection: { paddingHorizontal: SIZES.padding, marginBottom: 24 },
    progressCard: { borderRadius: 24, padding: 24, overflow: 'hidden', ...SHADOWS.large },
    progressDecor1: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)', top: -30, right: -20 },
    progressLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
    progressValue: { fontSize: 36, fontWeight: '800', color: '#ffffff', marginBottom: 8 },
    progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, marginBottom: 8, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#ffffff', borderRadius: 4 },
    progressText: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
    tabSection: { paddingHorizontal: SIZES.padding, marginBottom: 20 },
    tabContainer: { flexDirection: 'row', backgroundColor: '#faf8f5', padding: 4, borderRadius: 16, borderWidth: 1, borderColor: '#f0ebe3' },
    tabButton: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12 },
    activeTab: { backgroundColor: '#964b00' },
    tabText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
    activeTabText: { color: '#ffffff' },
    section: { paddingHorizontal: SIZES.padding },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
    card: { backgroundColor: '#ffffff', borderRadius: 20, flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f0ebe3', ...SHADOWS.small },
    cardIcon: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 },
    cardMeta: { fontSize: 12, color: '#9ca3af' },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    ratingText: { fontSize: 12, fontWeight: '600', color: '#92400e' },
});

export default EducationScreen;
