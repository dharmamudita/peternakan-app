/**
 * Order History Screen (Buyer)
 * Riwayat pesanan pembeli
 */

import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl, Platform, Alert, TextInput, Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { COLORS, SHADOWS, SIZES } from '../../constants/theme';
import { orderApi } from '../../services/api';

const OrderHistoryScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');

    // Review Modal State
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [rating, setRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    const statusTabs = [
        { key: 'all', label: 'Semua' },
        { key: 'paid', label: 'Dibayar' },
        { key: 'processing', label: 'Dikemas' },
        { key: 'shipped', label: 'Dikirim' },
        { key: 'completed', label: 'Selesai' },
    ];

    const fetchOrders = async (status = filterStatus) => {
        try {
            setLoading(true);
            const response = await orderApi.getMyOrders(status === 'all' ? '' : status);
            const ordersData = response.data || [];
            setOrders(ordersData);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchOrders(filterStatus);
        }, [filterStatus])
    );

    const handleFilterChange = (newStatus) => {
        setFilterStatus(newStatus);
        fetchOrders(newStatus);
    };

    const handleConfirmReceipt = async (orderId) => {
        const confirmAction = async () => {
            try {
                await orderApi.confirmReceipt(orderId);
                showAlert('Berhasil', 'Pesanan dikonfirmasi telah diterima');
                fetchOrders(filterStatus);
            } catch (error) {
                showAlert('Gagal', error.message || 'Gagal konfirmasi penerimaan');
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Konfirmasi bahwa pesanan sudah diterima?')) {
                await confirmAction();
            }
        } else {
            Alert.alert('Konfirmasi Penerimaan', 'Konfirmasi bahwa pesanan sudah diterima?', [
                { text: 'Batal', style: 'cancel' },
                { text: 'Ya, Sudah Diterima', onPress: confirmAction }
            ]);
        }
    };

    const openReviewModal = (order) => {
        setSelectedOrder(order);
        setRating(5);
        setReviewComment('');
        setReviewModalVisible(true);
    };

    const submitReview = async () => {
        if (!selectedOrder) return;

        setSubmittingReview(true);
        try {
            await orderApi.addReview(selectedOrder.id, rating, reviewComment);
            showAlert('Berhasil', 'Terima kasih atas ulasan Anda!');
            setReviewModalVisible(false);
            fetchOrders(filterStatus);
        } catch (error) {
            showAlert('Gagal', error.message || 'Gagal mengirim ulasan');
        } finally {
            setSubmittingReview(false);
        }
    };

    const showAlert = (title, message) => {
        if (Platform.OS === 'web') {
            window.alert(`${title}\n\n${message}`);
        } else {
            Alert.alert(title, message);
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(price);

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getStatusInfo = (status) => {
        const info = {
            pending: { color: '#6b7280', label: 'Menunggu Pembayaran', icon: 'time-outline' },
            paid: { color: '#f59e0b', label: 'Sudah Dibayar', icon: 'wallet-outline' },
            processing: { color: '#3b82f6', label: 'Sedang Dikemas', icon: 'cube-outline' },
            shipped: { color: '#8b5cf6', label: 'Dalam Pengiriman', icon: 'car-outline' },
            delivered: { color: '#10b981', label: 'Sampai Tujuan', icon: 'location-outline' },
            completed: { color: '#059669', label: 'Selesai', icon: 'checkmark-circle-outline' },
            cancelled: { color: '#ef4444', label: 'Dibatalkan', icon: 'close-circle-outline' },
        };
        return info[status] || info.pending;
    };

    const renderOrderItem = ({ item, index }) => {
        const statusInfo = getStatusInfo(item.status);
        const canConfirmReceipt = item.status === 'shipped' || item.status === 'delivered';
        const canReview = item.status === 'completed' && !item.review;
        const hasReview = item.status === 'completed' && item.review;

        return (
            <Animated.View
                entering={FadeInUp.delay(index * 50).duration(300)}
                style={styles.orderCard}
            >
                {/* Header */}
                <View style={styles.orderHeader}>
                    <View style={styles.orderIdContainer}>
                        <Text style={styles.orderIdLabel}>Order</Text>
                        <Text style={styles.orderId}>#{item.id?.slice(-8).toUpperCase()}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '15' }]}>
                        <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
                            {statusInfo.label}
                        </Text>
                    </View>
                </View>

                {/* Products */}
                <View style={styles.productSection}>
                    {item.items?.map((product, idx) => (
                        <View key={idx} style={styles.productRow}>
                            <View style={styles.productImagePlaceholder}>
                                <Ionicons name="cube" size={24} color="#d1d5db" />
                            </View>
                            <View style={styles.productInfo}>
                                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                                <Text style={styles.productQty}>x{product.quantity}</Text>
                            </View>
                            <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
                        </View>
                    ))}
                </View>

                {/* Footer */}
                <View style={styles.orderFooter}>
                    <View>
                        <Text style={styles.footerLabel}>Total Pembayaran</Text>
                        <Text style={styles.totalAmount}>{formatPrice(item.totalAmount)}</Text>
                    </View>
                    <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                </View>

                {/* Actions */}
                <View style={styles.actionSection}>
                    {canConfirmReceipt && (
                        <TouchableOpacity
                            style={styles.confirmBtn}
                            onPress={() => handleConfirmReceipt(item.id)}
                        >
                            <Ionicons name="checkmark-done" size={18} color="#fff" />
                            <Text style={styles.confirmBtnText}>Pesanan Diterima</Text>
                        </TouchableOpacity>
                    )}
                    {canReview && (
                        <TouchableOpacity
                            style={styles.reviewBtn}
                            onPress={() => openReviewModal(item)}
                        >
                            <Ionicons name="star" size={18} color="#fff" />
                            <Text style={styles.reviewBtnText}>Beri Ulasan</Text>
                        </TouchableOpacity>
                    )}
                    {hasReview && (
                        <View style={styles.reviewedBadge}>
                            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                            <Text style={styles.reviewedText}>Sudah Diulas ({item.review.rating}★)</Text>
                        </View>
                    )}
                </View>
            </Animated.View>
        );
    };

    const renderReviewModal = () => (
        <Modal
            visible={reviewModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setReviewModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Beri Ulasan</Text>

                    <Text style={styles.ratingLabel}>Rating</Text>
                    <View style={styles.ratingContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                <Ionicons
                                    name={star <= rating ? 'star' : 'star-outline'}
                                    size={36}
                                    color={star <= rating ? '#f59e0b' : '#d1d5db'}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.commentLabel}>Komentar (opsional)</Text>
                    <TextInput
                        style={styles.commentInput}
                        placeholder="Tulis pengalaman belanja Anda..."
                        placeholderTextColor="#9ca3af"
                        value={reviewComment}
                        onChangeText={setReviewComment}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => setReviewModalVisible(false)}
                        >
                            <Text style={styles.cancelBtnText}>Batal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.submitBtn, submittingReview && { opacity: 0.7 }]}
                            onPress={submitReview}
                            disabled={submittingReview}
                        >
                            {submittingReview ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.submitBtnText}>Kirim Ulasan</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Riwayat Pesanan</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Filter Tabs - Scrollable */}
            <View style={styles.filterWrapper}>
                <FlatList
                    horizontal
                    data={statusTabs}
                    keyExtractor={(item) => item.key}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterContainer}
                    renderItem={({ item: tab }) => (
                        <TouchableOpacity
                            style={[styles.filterTab, filterStatus === tab.key && styles.activeTab]}
                            onPress={() => handleFilterChange(tab.key)}
                        >
                            <Text style={[styles.filterText, filterStatus === tab.key && styles.activeTabText]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Orders List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id}
                    renderItem={renderOrderItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); fetchOrders(); }}
                            colors={[COLORS.primary]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="receipt-outline" size={70} color="#d1d5db" />
                            <Text style={styles.emptyTitle}>Belum ada pesanan</Text>
                            <Text style={styles.emptySubtitle}>Yuk mulai belanja!</Text>
                            <TouchableOpacity
                                style={styles.shopBtn}
                                onPress={() => navigation.navigate('Marketplace')}
                            >
                                <Text style={styles.shopBtnText}>Lihat Produk</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            {renderReviewModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        ...(Platform.OS === 'web' ? { minHeight: '100vh' } : {})
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    filterWrapper: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    filterContainer: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        gap: 8,
    },
    filterTab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        marginRight: 8,
    },
    activeTab: {
        backgroundColor: COLORS.primary,
    },
    filterText: {
        fontSize: 13,
        color: '#6b7280',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#fff',
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        ...SHADOWS.medium,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderIdContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    orderIdLabel: {
        fontSize: 12,
        color: '#9ca3af',
    },
    orderId: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    productSection: {
        paddingVertical: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f3f4f6',
        gap: 12,
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    productImagePlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    productQty: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 2,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 12,
    },
    footerLabel: {
        fontSize: 12,
        color: '#9ca3af',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.primary,
    },
    orderDate: {
        fontSize: 12,
        color: '#9ca3af',
    },
    actionSection: {
        marginTop: 16,
        flexDirection: 'row',
        gap: 8,
    },
    confirmBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10b981',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    confirmBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
    reviewBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f59e0b',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    reviewBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
    reviewedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
    },
    reviewedText: {
        color: '#10b981',
        fontSize: 13,
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#9ca3af',
        marginTop: 4,
    },
    shopBtn: {
        marginTop: 20,
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 24,
    },
    shopBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 20,
        textAlign: 'center',
    },
    ratingLabel: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 20,
    },
    commentLabel: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 8,
    },
    commentInput: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: '#111827',
        minHeight: 100,
        backgroundColor: '#f9fafb',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#6b7280',
        fontWeight: '600',
    },
    submitBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
    },
    submitBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default OrderHistoryScreen;
