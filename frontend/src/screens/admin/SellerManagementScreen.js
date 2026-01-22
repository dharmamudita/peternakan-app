
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const SellerManagementScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, pending, verified

    // Data dummy Toko Penjual
    const [sellers, setSellers] = useState([
        { id: 'seller-1', name: 'Toko Ternak Jaya', owner: 'Budi Santoso', status: 'pending', joinedAt: 'Baru saja', location: 'Blitar, Jatim' },
        { id: 'seller-3', name: 'Sapi Unggul Farm', owner: 'Joko Widodo', status: 'pending', joinedAt: '5 jam lalu', location: 'Lembang, Jabar' },
        { id: 'seller-2', name: 'Mitra Tani Sejahtera', owner: 'Siti Aminah', status: 'verified', joinedAt: '1 hari lalu', location: 'Boyolali, Jateng' },
        { id: 'seller-4', name: 'Ayam Petelur Berkah', owner: 'Rahmat Hidayat', status: 'verified', joinedAt: '3 hari lalu', location: 'Kediri, Jatim' },
        { id: 'seller-5', name: 'Kambing Etawa Super', owner: 'Ahmad Dahlan', status: 'pending', joinedAt: '4 hari lalu', location: 'Malang, Jatim' },
        { id: 'seller-6', name: 'Feed & Grow Store', owner: 'Cahyo Utomo', status: 'verified', joinedAt: '1 minggu lalu', location: 'Surabaya, Jatim' },
    ]);

    const filteredSellers = sellers.filter(seller => {
        const matchesSearch = seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            seller.owner.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || seller.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const handleSellerClick = (seller) => {
        navigation.navigate('SellerProfile', {
            sellerId: seller.id,
            asAdmin: true,
            sellerData: seller
        });
    };

    const renderHeader = () => (
        <View style={styles.headerWrapper}>
            <View style={[styles.headerWhite, { paddingTop: insets.top }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1f2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Kelola Penjual</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#9ca3af" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Cari nama toko atau pemilik..."
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterTabs}>
                    {['all', 'pending', 'verified'].map((status) => (
                        <TouchableOpacity
                            key={status}
                            style={[styles.filterTab, filterStatus === status && styles.activeFilterTab]}
                            onPress={() => setFilterStatus(status)}
                        >
                            <Text style={[styles.filterText, filterStatus === status && styles.activeFilterText]}>
                                {status === 'all' ? 'Semua' : status === 'pending' ? 'Perlu Verifikasi' : 'Terverifikasi'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );

    const renderSellerItem = ({ item }) => (
        <TouchableOpacity
            style={styles.sellerCard}
            onPress={() => handleSellerClick(item)}
            activeOpacity={0.7}
        >
            <View style={styles.sellerRow}>
                <View style={styles.sellerAvatar}>
                    <Text style={styles.sellerInitials}>{item.name.charAt(0)}</Text>
                </View>
                <View style={styles.sellerInfo}>
                    <Text style={styles.sellerName}>{item.name}</Text>
                    <View style={styles.sellerMeta}>
                        <Ionicons name="person-outline" size={12} color="#6b7280" />
                        <Text style={styles.sellerText}>{item.owner}</Text>
                        <Text style={styles.dot}>•</Text>
                        <Text style={styles.sellerText}>{item.location}</Text>
                    </View>
                    <Text style={[styles.joinDate, { color: item.status === 'pending' ? '#ea580c' : '#9ca3af' }]}>
                        {item.status === 'pending' ? 'Menunggu verifikasi' : `Bergabung: ${item.joinedAt}`}
                    </Text>
                </View>
                <View style={[styles.statusBadge, {
                    backgroundColor: item.status === 'verified' ? '#dcfce7' : '#fff7ed',
                    borderWidth: 0
                }]}>
                    {item.status === 'verified' ? (
                        <Ionicons name="checkmark-circle" size={24} color="#15803d" />
                    ) : (
                        <Ionicons name="time" size={24} color="#ea580c" />
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#964b00" />

            {renderHeader()}

            <FlatList
                data={filteredSellers}
                renderItem={renderSellerItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="storefront-outline" size={64} color="#d1d5db" />
                        <Text style={styles.emptyText}>Tidak ada toko ditemukan</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },


    // Header Styles
    headerWrapper: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', marginBottom: 10 },
    headerWhite: { paddingBottom: 16 },

    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 12,
        paddingTop: 10
    },
    backButton: {
        width: 40, height: 40,
        alignItems: 'center', justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: '#f3f4f6'
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },

    searchContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#f9fafb',
        marginHorizontal: 16, paddingHorizontal: 12, borderRadius: 12, height: 46,
        borderWidth: 1, borderColor: '#e5e7eb'
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#1f2937' },

    filterContainer: { marginTop: -20, paddingHorizontal: 16 },
    filterTabs: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 16, gap: 8 },
    filterTab: {
        paddingVertical: 8, paddingHorizontal: 16,
        borderRadius: 20, backgroundColor: '#fff',
        borderWidth: 1, borderColor: '#e5e7eb',
        alignItems: 'center'
    },
    activeFilterTab: { backgroundColor: '#964b00', borderColor: '#964b00' },
    filterText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
    activeFilterText: { color: '#fff' },

    listContainer: { padding: 16, paddingTop: 8, paddingBottom: 40 },

    sellerCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
        ...SHADOWS.small, borderWidth: 1, borderColor: '#f3f4f6',
    },
    sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    sellerAvatar: {
        width: 56, height: 56, borderRadius: 28, backgroundColor: '#fed7aa',
        alignItems: 'center', justifyContent: 'center',
    },
    sellerInitials: { fontSize: 24, fontWeight: 'bold', color: '#9a3412' },
    sellerInfo: { flex: 1 },
    sellerName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 2 },
    sellerMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
    sellerText: { fontSize: 13, color: '#4b5563' },
    dot: { fontSize: 12, color: '#d1d5db' },
    joinDate: { fontSize: 12, color: '#9ca3af' },

    statusBadge: {
        width: 36, height: 36, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1,
    },

    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
    emptyText: { marginTop: 16, color: '#9ca3af', fontSize: 16 },
});

export default SellerManagementScreen;
