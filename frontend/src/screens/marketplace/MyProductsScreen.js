import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SIZES } from '../../constants/theme';
import { productApi } from '../../services/api';

const MyProductsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMyProducts = async () => {
        try {
            const response = await productApi.getMyProducts();
            let productsData = [];
            if (response.data && Array.isArray(response.data)) {
                productsData = response.data;
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                productsData = response.data.data;
            } else if (Array.isArray(response)) {
                productsData = response;
            }
            setProducts(productsData);
        } catch (error) {
            console.error('Error fetching my products:', error);
            // Don't show alert on first load to avoid spamming if auth not ready
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchMyProducts();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchMyProducts();
    };

    const performDelete = async (id) => {
        try {
            setLoading(true);
            await productApi.delete(id);
            await fetchMyProducts();
            if (Platform.OS !== 'web') Alert.alert('Sukses', 'Produk berhasil dihapus');
        } catch (error) {
            console.error('Delete error:', error);
            if (Platform.OS !== 'web') Alert.alert('Gagal', 'Gagal menghapus produk');
            else alert('Gagal menghapus produk');
            setLoading(false);
        }
    };

    const handleDelete = (id, name) => {
        if (Platform.OS === 'web') {
            if (window.confirm(`Apakah Anda yakin ingin menghapus "${name}"?`)) {
                performDelete(id);
            }
        } else {
            Alert.alert(
                'Hapus Produk',
                `Apakah Anda yakin ingin menghapus "${name}"?`,
                [
                    { text: 'Batal', style: 'cancel' },
                    {
                        text: 'Hapus',
                        style: 'destructive',
                        onPress: () => performDelete(id)
                    }
                ]
            );
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
    };

    return (
        <View style={styles.mainContainer}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Produk Saya</Text>
                    <TouchableOpacity
                        style={styles.addButtonHeader}
                        onPress={() => navigation.navigate('AddEditProduct', { mode: 'add' })}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* List Content */}
            <ScrollView
                style={styles.contentScroll}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading && !refreshing ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#964b00" />
                    </View>
                ) : products.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cube-outline" size={64} color="#d1d5db" />
                        <Text style={styles.emptyTitle}>Belum Ada Produk</Text>
                        <Text style={styles.emptyDesc}>Mulai jual ternak Anda sekarang</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => navigation.navigate('AddEditProduct', { mode: 'add' })}
                        >
                            <Text style={styles.addButtonText}>Tambah Produk Baru</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.grid}>
                        {products.map((item) => (
                            <View key={item.id} style={styles.card}>
                                <Image
                                    source={{ uri: item.images && item.images.length > 0 ? item.images[0] : 'https://placehold.co/300' }}
                                    style={styles.cardImage}
                                />
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
                                    <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
                                    <View style={styles.metaRow}>
                                        <Text style={styles.stockText}>Stok: {item.stock} {item.unit || 'ekor'}</Text>
                                        <Text style={[styles.statusText, { color: item.status === 'active' ? '#166534' : '#9ca3af' }]}>
                                            {item.status === 'active' ? 'Aktif' : 'Arsip'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Actions Overlay or Footer */}
                                <View style={styles.cardActions}>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.editBtn]}
                                        onPress={() => navigation.navigate('AddEditProduct', { mode: 'edit', product: item })}
                                    >
                                        <Ionicons name="create-outline" size={18} color="#964b00" />
                                        <Text style={[styles.actionText, { color: '#964b00' }]}>Edit</Text>
                                    </TouchableOpacity>
                                    <View style={styles.divider} />
                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.deleteBtn]}
                                        onPress={() => handleDelete(item.id, item.name)}
                                    >
                                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                                        <Text style={[styles.actionText, { color: '#ef4444' }]}>Hapus</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Floating Action Button (Alternative) */}
            {/* {products.length > 0 && (
                <TouchableOpacity 
                    style={styles.fab} 
                    onPress={() => navigation.navigate('AddEditProduct', { mode: 'add' })}
                >
                    <Ionicons name="add" size={32} color="#fff" />
                </TouchableOpacity>
            )} */}
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#f9fafb',
        ...(Platform.OS === 'web' ? { flex: 0, height: 'auto', minHeight: '100vh' } : {})
    },
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        zIndex: 10,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 44,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    addButtonHeader: {
        width: 40,
        height: 40,
        backgroundColor: '#964b00',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        ...SHADOWS.small,
    },
    contentScroll: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    loadingContainer: {
        marginTop: 50,
        alignItems: 'center',
    },
    emptyContainer: {
        marginTop: 60,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
        marginTop: 16,
    },
    emptyDesc: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 8,
        marginBottom: 24,
    },
    addButton: {
        backgroundColor: '#964b00',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        ...SHADOWS.small,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    grid: {
        gap: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f0ebe3',
        ...SHADOWS.small,
        flexDirection: 'row', // Horizontal Card for List View
    },
    cardImage: {
        width: 100,
        height: '100%',
        backgroundColor: '#f3f4f6',
    },
    cardContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    cardPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#964b00',
        marginBottom: 6,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stockText: {
        fontSize: 12,
        color: '#6b7280',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    cardActions: {
        width: 60,
        borderLeftWidth: 1,
        borderLeftColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        backgroundColor: '#fafaf9',
    },
    actionBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
        width: '100%',
        flex: 1,
    },
    divider: {
        height: 1,
        width: '80%',
        backgroundColor: '#e5e7eb',
    },
    actionText: {
        fontSize: 9,
        fontWeight: '600',
        marginTop: 2,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#964b00',
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.large,
        zIndex: 50,
    }
});

export default MyProductsScreen;
