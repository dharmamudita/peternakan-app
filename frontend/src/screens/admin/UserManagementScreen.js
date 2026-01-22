import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';

const UserManagementScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');

    // Data Dummy Pengguna
    const [users, setUsers] = useState([
        { id: '1', name: 'Ahmad Dahlan', email: 'ahmad.dahlan@example.com', role: 'user', status: 'active', joinedAt: '12 Jan 2024', avatar: null },
        { id: '2', name: 'Siti Aminah', email: 'siti.aminah@example.com', role: 'seller', status: 'active', joinedAt: '10 Feb 2024', avatar: 'https://via.placeholder.com/150' },
        { id: '3', name: 'Budi Santoso', email: 'budi.santoso@gmail.com', role: 'user', status: 'suspended', joinedAt: '05 Mar 2024', avatar: null },
        { id: '4', name: 'Rahmat Hidayat', email: 'rahmat.h@yahoo.com', role: 'seller', status: 'active', joinedAt: '20 Mar 2024', avatar: null },
        { id: '5', name: 'Admin Peternakan', email: 'admin@peternakan.id', role: 'admin', status: 'active', joinedAt: '01 Jan 2024', avatar: null },
        { id: '6', name: 'Joko Widodo', email: 'jokowi@example.com', role: 'user', status: 'active', joinedAt: '15 Apr 2024', avatar: null },
    ]);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return '#ef4444'; // Merah
            case 'seller': return '#f59e0b'; // Kuning/Oranye
            default: return '#3b82f6'; // Biru (User)
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'admin': return 'Admin';
            case 'seller': return 'Penjual';
            default: return 'Pengguna';
        }
    };

    const renderHeader = () => (
        <View style={[styles.headerWhite, { paddingTop: insets.top }]}>
            <View style={styles.headerTop}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Kelola Pengguna</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#9ca3af" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Cari nama atau email..."
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
        </View>
    );

    const renderUserItem = ({ item }) => (
        <TouchableOpacity style={styles.userCard} activeOpacity={0.7}>
            <View style={styles.userInfoRow}>
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                    {item.avatar ? (
                        <Image source={{ uri: item.avatar }} style={styles.avatar} />
                    ) : (
                        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                    )}
                </View>

                {/* Info Text */}
                <View style={styles.userDetails}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <View style={styles.metaRow}>
                        <Text style={styles.joinDate}>Gabung: {item.joinedAt}</Text>
                        {item.status === 'suspended' && (
                            <View style={styles.suspendBadge}>
                                <Text style={styles.suspendText}>Suspended</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Role Badge */}
                <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '20' }]}>
                    <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>
                        {getRoleLabel(item.role)}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            {renderHeader()}

            <FlatList
                data={filteredUsers}
                renderItem={renderUserItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color="#d1d5db" />
                        <Text style={styles.emptyText}>Tidak ada pengguna ditemukan</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        ...(Platform.OS === 'web' ? { flex: 0, height: 'auto', minHeight: '100vh' } : {})
    },
    headerWhite: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        ...SHADOWS.small,
        zIndex: 10,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        height: 44,
    },
    backButton: {
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
        color: '#1f2937',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#1f2937',
    },
    listContainer: {
        padding: 20,
        paddingTop: 10,
    },
    userCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        ...SHADOWS.small,
    },
    userInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e0f2fe',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0284c7',
    },
    userDetails: {
        flex: 1,
        marginRight: 8,
    },
    userName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    joinDate: {
        fontSize: 11,
        color: '#9ca3af',
    },
    suspendBadge: {
        backgroundColor: '#fee2e2',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    suspendText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#ef4444',
    },
    roleBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    roleText: {
        fontSize: 11,
        fontWeight: '700',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 14,
        color: '#9ca3af',
    },
});

export default UserManagementScreen;
