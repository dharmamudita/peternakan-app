/**
 * Material Detail Screen
 * Halaman untuk membaca detail materi edukasi
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { materialApi } from '../../services/api';

const MaterialDetailScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { materialId } = route.params || {};
    const [material, setMaterial] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMaterial();
    }, [materialId]);

    const fetchMaterial = async () => {
        try {
            setLoading(true);
            const response = await materialApi.getById(materialId);
            setMaterial(response.data || response);
        } catch (err) {
            console.error('Error fetching material:', err);
            setError(err.message || 'Gagal memuat materi');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        } catch {
            return '';
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Memuat materi...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
                <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchMaterial}>
                    <Text style={styles.retryText}>Coba Lagi</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {material?.title || 'Detail Materi'}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Thumbnail */}
                {material?.thumbnail && (
                    <Image
                        source={{ uri: material.thumbnail }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                    />
                )}

                {/* Meta Info */}
                <View style={styles.metaContainer}>
                    <View style={styles.typeBadge}>
                        <Ionicons
                            name={material?.type === 'video' ? 'videocam' : 'document-text'}
                            size={14}
                            color="#964b00"
                        />
                        <Text style={styles.typeText}>
                            {material?.type === 'video' ? 'Video' : 'Artikel'}
                        </Text>
                    </View>
                    {material?.category && (
                        <Text style={styles.categoryText}>{material.category}</Text>
                    )}
                </View>

                {/* Title */}
                <Text style={styles.title}>{material?.title}</Text>

                {/* Date & Views */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Ionicons name="calendar-outline" size={16} color="#9ca3af" />
                        <Text style={styles.statText}>{formatDate(material?.createdAt)}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="eye-outline" size={16} color="#9ca3af" />
                        <Text style={styles.statText}>{material?.viewsCount || 0} views</Text>
                    </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Content */}
                <View style={styles.contentContainer}>
                    <Text style={styles.sectionTitle}>Konten Materi</Text>
                    <Text style={styles.contentText}>
                        {material?.content || material?.description || 'Tidak ada konten tersedia.'}
                    </Text>
                </View>

                {/* Video Player Placeholder */}
                {material?.type === 'video' && material?.videoUrl && (
                    <View style={styles.videoContainer}>
                        <View style={styles.videoPlaceholder}>
                            <Ionicons name="play-circle" size={64} color="#964b00" />
                            <Text style={styles.videoText}>Video akan diputar di sini</Text>
                        </View>
                    </View>
                )}

                {/* Extra padding for bottom */}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6b7280',
    },
    errorText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.error,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    retryButton: {
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
    },
    retryText: {
        color: '#fff',
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.padding,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#faf8f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center',
        marginHorizontal: 8,
    },
    scrollContent: {
        padding: SIZES.padding,
    },
    thumbnail: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        marginBottom: 16,
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#fef3c7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    typeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#92400e',
    },
    categoryText: {
        fontSize: 12,
        color: '#6b7280',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 12,
        lineHeight: 32,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginBottom: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 13,
        color: '#9ca3af',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 20,
    },
    contentContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },
    contentText: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 26,
    },
    videoContainer: {
        marginTop: 16,
    },
    videoPlaceholder: {
        width: '100%',
        height: 200,
        backgroundColor: '#faf8f5',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#f0ebe3',
        borderStyle: 'dashed',
    },
    videoText: {
        marginTop: 8,
        fontSize: 14,
        color: '#9ca3af',
    },
});

export default MaterialDetailScreen;
