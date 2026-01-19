/**
 * Education Screen
 * Halaman edukasi dengan kursus dan materi
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, SIZES, SHADOWS } from '../../constants/theme';
import { Header, Card, Input } from '../../components/common';

const { width } = Dimensions.get('window');

const EducationScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('courses'); // courses | library

    const progressData = {
        watched: 12,
        total: 48,
        percentage: 25,
    };

    const courses = [
        {
            id: '1',
            title: 'Manajemen Pakan Ternak Efisien',
            instructor: 'Dr. Budi Santoso',
            lessons: 12,
            duration: '4 Jam',
            rating: 4.8,
            level: 'Pemula',
            image: null,
            color: COLORS.primary,
        },
        {
            id: '2',
            title: 'Teknik Pembibitan Sapi Potong',
            instructor: 'Insinyur Pertanian',
            lessons: 8,
            duration: '3 Jam',
            rating: 4.9,
            level: 'Lanjutan',
            image: null,
            color: COLORS.accent,
        },
        {
            id: '3',
            title: 'Kesehatan Hewan Dasar',
            instructor: 'Drh. Siti Aminah',
            lessons: 15,
            duration: '5 Jam',
            rating: 4.7,
            level: 'Menengah',
            image: null,
            color: COLORS.secondary,
        },
    ];

    const articles = [
        {
            id: '1',
            title: '5 Tips Mencegah Penyakit Kuku dan Mulut',
            category: 'Kesehatan',
            readTime: '5 min baca',
            date: '12 Jan 2026',
        },
        {
            id: '2',
            title: 'Panduan Memilih Bibit Unggul',
            category: 'Pembibitan',
            readTime: '8 min baca',
            date: '10 Jan 2026',
        },
        {
            id: '3',
            title: 'Analisa Usaha Ternak Kambing',
            category: 'Bisnis',
            readTime: '10 min baca',
            date: '08 Jan 2026',
        },
    ];

    const renderCourseCard = ({ item, index }) => (
        <Animated.View entering={FadeInRight.delay(index * 200).duration(500)}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => { }}>
                <Card style={styles.courseCard}>
                    <View style={[styles.courseImage, { backgroundColor: item.color }]}>
                        <Ionicons name="play-circle" size={40} color="rgba(255,255,255,0.5)" />
                        <View style={styles.levelBadge}>
                            <Text style={styles.levelText}>{item.level}</Text>
                        </View>
                    </View>
                    <View style={styles.courseContent}>
                        <Text numberOfLines={2} style={styles.courseTitle}>{item.title}</Text>
                        <Text style={styles.instructor}>Oleh {item.instructor}</Text>

                        <View style={styles.courseMeta}>
                            <View style={styles.metaItem}>
                                <Ionicons name="book-outline" size={12} color={COLORS.gray} />
                                <Text style={styles.metaText}>{item.lessons} Modul</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Ionicons name="time-outline" size={12} color={COLORS.gray} />
                                <Text style={styles.metaText}>{item.duration}</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Ionicons name="star" size={12} color={COLORS.warning} />
                                <Text style={styles.metaText}>{item.rating}</Text>
                            </View>
                        </View>
                    </View>
                </Card>
            </TouchableOpacity>
        </Animated.View>
    );

    const renderArticleItem = ({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(index * 100).duration(500)}>
            <TouchableOpacity onPress={() => { }}>
                <View style={styles.articleItem}>
                    <View style={styles.articleIcon}>
                        <Ionicons name="document-text" size={24} color={COLORS.primary} />
                    </View>
                    <View style={styles.articleContent}>
                        <Text style={styles.articleCategory}>{item.category}</Text>
                        <Text style={styles.articleTitle}>{item.title}</Text>
                        <View style={styles.articleMeta}>
                            <Text style={styles.articleDate}>{item.date}</Text>
                            <Text style={styles.dot}>•</Text>
                            <Text style={styles.readTime}>{item.readTime}</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.lightGray} />
                </View>
                {index < articles.length - 1 && <View style={styles.divider} />}
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <Header
                title="Pusat Edukasi"
                subtitle="Tingkatkan ilmu beternakmu"
                showBack={false}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Progress Card */}
                <Animated.View entering={FadeInDown.duration(600)}>
                    <LinearGradient
                        colors={GRADIENTS.primary}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.progressCard}
                    >
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressTitle}>Progress Belajar</Text>
                            <Text style={styles.progressPercentage}>{progressData.percentage}%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${progressData.percentage}%` }]} />
                        </View>
                        <Text style={styles.progressText}>
                            Kamu telah menyelesaikan {progressData.watched} dari {progressData.total} materi
                        </Text>
                    </LinearGradient>
                </Animated.View>

                {/* Tabs */}
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

                {/* Content based on Tab */}
                {activeTab === 'courses' ? (
                    <View style={styles.coursesList}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Rekomendasi Kursus</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAll}>Lihat Semua</Text>
                            </TouchableOpacity>
                        </View>
                        {courses.map((item, index) => (
                            <View key={item.id} style={{ marginBottom: 16 }}>
                                {renderCourseCard({ item, index })}
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.articlesList}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Artikel Terbaru</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAll}>Lihat Semua</Text>
                            </TouchableOpacity>
                        </View>
                        <Card style={styles.articlesCard}>
                            {articles.map((item, index) => (
                                <View key={item.id}>
                                    {renderArticleItem({ item, index })}
                                </View>
                            ))}
                        </Card>
                    </View>
                )}

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
    },
    progressCard: {
        padding: 20,
        borderRadius: SIZES.radiusLarge,
        marginBottom: 24,
        ...SHADOWS.medium,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressTitle: {
        fontSize: SIZES.h4,
        fontWeight: '700',
        color: COLORS.white,
    },
    progressPercentage: {
        fontSize: SIZES.h3,
        fontWeight: '800',
        color: COLORS.white,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 4,
        marginBottom: 12,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.white,
        borderRadius: 4,
    },
    progressText: {
        fontSize: SIZES.caption,
        color: 'rgba(255,255,255,0.9)',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        padding: 4,
        borderRadius: SIZES.radiusLarge,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: SIZES.radius,
    },
    activeTab: {
        backgroundColor: COLORS.primary,
    },
    tabText: {
        fontSize: SIZES.bodySmall,
        fontWeight: '600',
        color: COLORS.textMuted,
    },
    activeTabText: {
        color: COLORS.white,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: SIZES.h4,
        fontWeight: '700',
        color: COLORS.text,
    },
    seeAll: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: SIZES.bodySmall,
    },
    courseCard: {
        flexDirection: 'row',
        padding: 12,
    },
    courseImage: {
        width: 100,
        height: 100,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        position: 'relative',
    },
    levelBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    levelText: {
        color: COLORS.white,
        fontSize: 8,
        fontWeight: '700',
    },
    courseContent: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    courseTitle: {
        fontSize: SIZES.body,
        fontWeight: '700',
        color: COLORS.text,
        lineHeight: 22,
    },
    instructor: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        marginBottom: 8,
    },
    courseMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 10,
        color: COLORS.gray,
        fontWeight: '500',
    },
    articlesCard: {
        padding: 0,
    },
    articleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    articleIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary + '10',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    articleContent: {
        flex: 1,
    },
    articleCategory: {
        fontSize: 10,
        color: COLORS.primary,
        fontWeight: '700',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    articleTitle: {
        fontSize: SIZES.bodySmall,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
    },
    articleMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    articleDate: {
        fontSize: 10,
        color: COLORS.textMuted,
    },
    dot: {
        fontSize: 10,
        color: COLORS.textMuted,
        marginHorizontal: 6,
    },
    readTime: {
        fontSize: 10,
        color: COLORS.textMuted,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.lightGray,
        marginLeft: 68,
    },
});

export default EducationScreen;
