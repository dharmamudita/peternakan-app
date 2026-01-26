import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SIZES } from '../../constants/theme';
import { useFocusEffect } from '@react-navigation/native';
import { addressApi, orderApi, cartApi } from '../../services/api';

const CheckoutScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { cartItems, totalAmount } = route.params || { cartItems: [], totalAmount: 0 };

    const [loading, setLoading] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [shippingCost, setShippingCost] = useState(15000); // Dummy shipping cost

    useFocusEffect(
        React.useCallback(() => {
            if (!selectedAddress) {
                loadDefaultAddress();
            }
        }, [selectedAddress])
    );

    const loadDefaultAddress = async () => {
        try {
            const response = await addressApi.getAll();
            const addresses = response.data || [];
            if (addresses.length > 0) {
                // Cari yang default, atau ambil yang pertama
                const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
                setSelectedAddress(defaultAddr);
            }
        } catch (error) {
            console.error('Failed to load address', error);
        }
    };

    const handleSelectAddress = () => {
        navigation.navigate('AddressList', {
            onSelectAddress: (address) => {
                console.log('[Checkout] Selected Address:', address);
                setSelectedAddress(address);
            }
        });
    };

    const showAlert = (title, message) => {
        if (Platform.OS === 'web') {
            window.alert(`${title}\n\n${message}`);
        } else {
            Alert.alert(title, message);
        }
    };

    const handlePlaceOrder = async () => {
        console.log('[Checkout] handlePlaceOrder clicked');

        if (!selectedAddress) {
            showAlert('Alamat Kosong', 'Mohon pilih alamat pengiriman terlebih dahulu.');
            return;
        }

        try {
            console.log('[Checkout] Preparing payload...');
            setLoading(true);

            // Group items by Seller/Shop (Logic Backend usually handles this, but for now simple)
            // Asumsi: 1 Order bisa multi-item

            const orderPayload = {
                items: cartItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.product.salePrice || item.product.price,
                    name: item.product.name,
                    image: item.product.images?.[0]
                })),
                shippingAddress: selectedAddress,
                shippingCost: shippingCost,
                totalAmount: totalAmount + shippingCost,
                // Simple logic: Ambil sellerId dari item pertama (Multi-seller checkout complicated)
                sellerId: cartItems[0]?.product?.sellerId,
                shopId: cartItems[0]?.product?.shopId
            };

            console.log('[Checkout] Sending Payload:', orderPayload);

            const response = await orderApi.create(orderPayload);
            console.log('[Checkout] Order Response:', response.data);

            // Clear Cart (Backend might do this automatically based on logic, but let's be safe)
            // await cartApi.clear(); // If API exists

            showAlert(
                'Pesanan Berhasil',
                'Pesanan Anda telah dibuat. Silakan lakukan pembayaran.'
            );

            navigation.navigate('OrderHistory');

        } catch (error) {
            console.error('[Checkout] Create Order Error:', error);
            const errMsg = error.response?.data?.message || error.message || 'Terjadi kesalahan saat membuat pesanan';
            showAlert('Gagal', errMsg);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Konfirmasi Pesanan</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Section Alamat */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Alamat Pengiriman</Text>
                    {selectedAddress ? (
                        <View style={styles.addressCard}>
                            <View style={styles.addressHeader}>
                                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                                    <Ionicons name="location" size={18} color={COLORS.primary} />
                                    <Text style={styles.addressLabel}>{selectedAddress.label}</Text>
                                </View>
                                <TouchableOpacity onPress={handleSelectAddress}>
                                    <Text style={styles.changeText}>Ganti</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.recipientName}>{selectedAddress.recipientName} ({selectedAddress.phoneNumber})</Text>
                            <Text style={styles.addressText}>{selectedAddress.fullAddress}</Text>
                            <Text style={styles.addressCity}>{selectedAddress.city}, {selectedAddress.province} {selectedAddress.postalCode}</Text>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.addAddressBtn} onPress={() => navigation.navigate('AddressForm')}>
                            <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
                            <Text style={styles.addAddressText}>Tambah Alamat Pengiriman</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Section Items */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Daftar Pesanan</Text>
                    {cartItems.map((item, index) => (
                        <View key={index} style={styles.itemCard}>
                            <Image
                                source={{ uri: item.product?.images?.[0] || 'https://placehold.co/80' }}
                                style={styles.itemImage}
                            />
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName} numberOfLines={2}>{item.product?.name}</Text>
                                <Text style={styles.itemPrice}>{formatPrice(item.product?.salePrice || item.product?.price)} x {item.quantity}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Section Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ringkasan Pembayaran</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Harga ({cartItems.length} produk)</Text>
                        <Text style={styles.summaryValue}>{formatPrice(totalAmount)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Biaya Pengiriman</Text>
                        <Text style={styles.summaryValue}>{formatPrice(shippingCost)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Total Pembayaran</Text>
                        <Text style={styles.totalValue}>{formatPrice(totalAmount + shippingCost)}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.summaryLabel}>Total Tagihan</Text>
                    <Text style={styles.totalValueLarge}>{formatPrice(totalAmount + shippingCost)}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.checkoutBtn, (loading || !selectedAddress) && styles.checkoutBtnDisabled]}
                    onPress={handlePlaceOrder}
                    disabled={loading || !selectedAddress}
                >
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.checkoutBtnText}>Buat Pesanan</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        ...(Platform.OS === 'web' ? { flex: 0, height: 'auto', minHeight: '100vh' } : {})
    },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    content: { padding: 16, paddingBottom: 120 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
    addressCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 16, ...SHADOWS.small, borderWidth: 1, borderColor: '#e5e7eb' },
    addressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    addressLabel: { fontSize: 14, fontWeight: '700', color: '#111827' },
    changeText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
    recipientName: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 },
    addressText: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
    addressCity: { fontSize: 14, color: '#6b7280', marginTop: 2 },
    addAddressBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 20, backgroundColor: '#fff', borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.primary },
    addAddressText: { fontSize: 15, fontWeight: '600', color: COLORS.primary },
    itemCard: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, ...SHADOWS.small },
    itemImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#f3f4f6' },
    itemInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
    itemName: { fontSize: 14, fontWeight: '500', color: '#111827', marginBottom: 4 },
    itemPrice: { fontSize: 14, fontWeight: '700', color: '#964b00' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { fontSize: 14, color: '#6b7280' },
    summaryValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
    divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 12 },
    totalLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
    totalValue: { fontSize: 16, fontWeight: '700', color: '#964b00' },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        ...SHADOWS.medium,
        zIndex: 1000,
        elevation: 10
    },
    totalValueLarge: { fontSize: 18, fontWeight: '800', color: '#964b00' },
    checkoutBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, ...SHADOWS.small },
    checkoutBtnDisabled: { backgroundColor: '#d1d5db', elevation: 0 },
    checkoutBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});

export default CheckoutScreen;
