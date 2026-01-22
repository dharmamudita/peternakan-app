/**
 * Education Screen - Tema Putih + Coklat
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { educationApi, courseApi, materialApi } from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const EducationScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('courses');
    const [stats, setStats] = useState({ progress: 0, completed: 0, total: 0 });
    const [courses, setCourses] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [])
    );

    const fetchData = async () => {
        try {
            const [statsRes, coursesRes, materialsRes] = await Promise.all([
                educationApi.getDashboard(),
                courseApi.getAll(),
                materialApi.getAll()
            ]);

            const dashboard = statsRes.data || statsRes || {};
            const userStats = dashboard.stats || {};

            setStats({
                progress: userStats.averageProgress || 0,
                completed: userStats.completed || 0, // Menggunakan completed courses
                total: userStats.totalEnrolled || 0
            });

            setCourses(coursesRes.data || coursesRes || []);
            setMaterials(materialsRes.data || materialsRes || []);
        } catch (error) {
            console.error('Education Load Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        try {
            // Handle Firestore Timestamp object (has _seconds)
            let dateObj;
            if (date._seconds) {
                dateObj = new Date(date._seconds * 1000);
            } else {
                dateObj = new Date(date);
            }

            // Check if valid date
            if (isNaN(dateObj.getTime())) return '';

            return dateObj.toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', year: 'numeric'
            });
        } catch (e) {
            return '';
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.headerSubtitle}>Tingkatkan Ilmu 📚</Text>
                            <Text style={styles.headerTitle}>Pusat Edukasi</Text>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Cari materi atau kursus..."
                            placeholderTextColor="#9ca3af"
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                </Animated.View>

                {/* Progress Section */}
                <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.progressSection}>
                    <LinearGradient colors={['#964b00', '#7c3f06']} style={styles.progressCard}>
                        <View style={styles.progressDecor1} />
                        <View>
                            <Text style={styles.progressLabel}>Progress Belajar</Text>
                            <Text style={styles.progressValue}>{stats.progress}%</Text>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${stats.progress}%` }]} />
                            </View>
                            <Text style={styles.progressText}>{stats.completed} dari {stats.total} kursus selesai</Text>
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
                    <Text style={styles.sectionTitle}>{activeTab === 'courses' ? 'Kursus' : 'Materi Pustaka'}</Text>

                    {activeTab === 'courses' ? (
                        courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase())).length > 0 ? (
                            courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase())).map((course, i) => (
                                <Animated.View key={course.id} entering={FadeInUp.delay(i * 100)}>
                                    <TouchableOpacity
                                        style={styles.card}
                                        onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
                                    >
                                        <LinearGradient colors={['#964b00', '#7c3f06']} style={styles.cardIcon}>
                                            <Ionicons name="play-circle" size={24} color="#fff" />
                                        </LinearGradient>
                                        <View style={styles.cardContent}>
                                            <Text style={styles.cardTitle}>{course.title}</Text>
                                            <Text style={styles.cardMeta}>
                                                {formatDate(course.createdAt)} • {course.lessons?.length || 0} Modul
                                            </Text>
                                        </View>
                                        <View style={styles.freeBadge}>
                                            <Text style={styles.freeText}>Gratis</Text>
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>Belum ada kursus tersedia</Text>
                        )
                    ) : (
                        materials.filter(m => m.title.toLowerCase().includes(search.toLowerCase())).length > 0 ? (
                            materials.filter(m => m.title.toLowerCase().includes(search.toLowerCase())).map((item, i) => (
                                <Animated.View key={item.id} entering={FadeInUp.delay(i * 100)}>
                                    <TouchableOpacity
                                        style={styles.card}
                                        onPress={() => navigation.navigate('MaterialDetail', { materialId: item.id })}
                                    >
                                        <View style={[styles.cardIcon, { backgroundColor: '#faf8f5' }]}>
                                            <Ionicons
                                                name={item.type === 'video' ? 'videocam' : 'document-text'}
                                                size={22}
                                                color="#964b00"
                                            />
                                        </View>
                                        <View style={styles.cardContent}>
                                            <Text style={styles.cardTitle}>{item.title}</Text>
                                            <Text style={styles.cardMeta}>
                                                {item.category} • {formatDate(item.createdAt)}
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
                                    </TouchableOpacity>
                                </Animated.View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>Belum ada materi tersedia</Text>
                        )
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#faf8f5',
        marginTop: 16,
        paddingHorizontal: 16,
        height: 50,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#f0ebe3',
    },
    searchIcon: { marginRight: 10 },
    searchInput: {
        flex: 1,
        height: '100%',
        color: '#111827',
        fontSize: 15,
    },
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
    freeBadge: { backgroundColor: '#d1fae5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    freeText: { fontSize: 12, fontWeight: '600', color: '#059669' },
    emptyText: { fontSize: 14, color: '#9ca3af', textAlign: 'center', paddingVertical: 32 },
});

export default EducationScreen;
