import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SHADOWS, SIZES } from '../../constants/theme';
import { addressApi } from '../../services/api';

const AddressListScreen = ({ navigation, route }) => {
    const { onSelectAddress } = route.params || {};

    const insets = useSafeAreaInsets();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // ... (fetchAddresses tetap sama)

    const fetchAddresses = async () => {
        try {
            const response = await addressApi.getAll();
            // Sort: Default di atas
            let sorted = (response.data || []).sort((a, b) => b.isDefault - a.isDefault);
            setAddresses(sorted);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Gagal memuat alamat');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAddresses();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchAddresses();
    };

    const handleSelect = (item) => {
        if (onSelectAddress) {
            onSelectAddress(item);
            navigation.goBack();
        }
    };

    const handleDelete = (id, label) => {
        // ... (tetap sama)
        Alert.alert(
            'Hapus Alamat',
            `Apakah Anda yakin ingin menghapus alamat "${label}"?`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await addressApi.delete(id);
                            fetchAddresses();
                        } catch (error) {
                            Alert.alert('Gagal', error.message || 'Gagal menghapus alamat');
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleSetDefault = async (id) => {
        // ... (tetap sama)
        try {
            setLoading(true);
            await addressApi.setDefault(id);
            fetchAddresses();
            if (!onSelectAddress) Alert.alert('Sukses', 'Alamat utama berhasil diubah');
        } catch (error) {
            Alert.alert('Gagal', error.message);
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, item.isDefault && styles.cardDefault]}
            activeOpacity={onSelectAddress ? 0.7 : 1}
            onPress={() => onSelectAddress ? handleSelect(item) : null}
        >
            <View style={styles.cardHeader}>
                <View style={styles.labelParams}>
                    <Text style={styles.label}>{item.label}</Text>
                    {item.isDefault && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Utama</Text>
                        </View>
                    )}
                </View>
                {/* Actions (Hanya tampil jika bukan mode select, atau opsi edit tetap ada) */}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={() => navigation.navigate('AddressForm', { address: item })}>
                        <Ionicons name="create-outline" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                    {!item.isDefault && (
                        <TouchableOpacity onPress={() => handleDelete(item.id, item.label)}>
                            <Ionicons name="trash-outline" size={20} color="#dc2626" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <Text style={styles.recipient}>{item.recipientName} • {item.phoneNumber}</Text>
            <Text style={styles.address}>{item.fullAddress}</Text>
            <Text style={styles.city}>{item.city}, {item.province} {item.postalCode}</Text>
            {item.note && <Text style={styles.note}>Catatan: {item.note}</Text>}

            {!item.isDefault && !onSelectAddress && (
                <TouchableOpacity style={styles.setDefaultBtn} onPress={() => handleSetDefault(item.id)}>
                    <Text style={styles.setDefaultText}>Jadikan Utama</Text>
                </TouchableOpacity>
            )}

            {onSelectAddress && (
                <View style={styles.selectHint}>
                    <Text style={{ color: COLORS.primary, fontSize: 12 }}>Ketuk untuk memilih</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{onSelectAddress ? 'Pilih Alamat Pengiriman' : 'Alamat Tersimpan'}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AddressForm')} style={styles.addBtn}>
                    <Ionicons name="add" size={24} color="#ffffff" />
                </TouchableOpacity>
            </View>

            {loading && !refreshing ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={addresses}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="location-outline" size={64} color="#d1d5db" />
                            <Text style={styles.emptyText}>Belum ada alamat tersimpan</Text>
                            <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('AddressForm')}>
                                <Text style={styles.emptyBtnText}>Tambah Alamat Baru</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOWS.small },
    listContent: { padding: 16, gap: 16 },
    card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, ...SHADOWS.small, borderWidth: 1, borderColor: '#f3f4f6' },
    cardDefault: { borderColor: COLORS.primary, borderWidth: 1.5, backgroundColor: '#fffaf5' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    labelParams: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    label: { fontSize: 16, fontWeight: '700', color: '#111827' },
    badge: { backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeText: { fontSize: 10, fontWeight: '700', color: '#ffffff' },
    recipient: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 },
    address: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
    city: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
    note: { fontSize: 13, color: '#9ca3af', fontStyle: 'italic', marginBottom: 8 },
    setDefaultBtn: { marginTop: 8, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#f3f4f6', alignItems: 'center' },
    setDefaultText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { marginTop: 16, fontSize: 16, color: '#6b7280', marginBottom: 24 },
    emptyBtn: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: COLORS.primary, borderRadius: 24 },
    emptyBtnText: { color: '#ffffff', fontWeight: '600' },
});

export default AddressListScreen;
