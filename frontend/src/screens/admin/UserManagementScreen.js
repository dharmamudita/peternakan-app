import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar, Image, Platform, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SHADOWS } from '../../constants/theme';
import { userApi } from '../../services/api';

const UserManagementScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userApi.getAll({
                page: 1,
                limit: 100 // Fetch 100 for now to simplify instead of pagination
            });
            setUsers(response.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Gagal memuat data pengguna');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUsers();
        }, [])
    );

    const filteredUsers = users.filter(user =>
        (user.displayName || user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchQuery.toLowerCase())
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
                    {item.photoURL ? (
                        <Image source={{ uri: item.photoURL }} style={styles.avatar} />
                    ) : (
                        <Text style={styles.avatarText}>
                            {(item.displayName || item.name || 'U').charAt(0).toUpperCase()}
                        </Text>
                    )}
                </View>

                {/* Info Text */}
                <View style={styles.userDetails}>
                    <Text style={styles.userName}>{item.displayName || item.name || 'Tanpa Nama'}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <View style={styles.metaRow}>
                        <Text style={styles.joinDate}>
                            Gabung: {item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID') : '-'}
                        </Text>
                        {!item.isActive && (
                            <View style={styles.suspendBadge}>
                                <Text style={styles.suspendText}>Nonaktif</Text>
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

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={filteredUsers}
                    renderItem={renderUserItem}
                    keyExtractor={item => item.id || item.uid}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={64} color="#d1d5db" />
                            <Text style={styles.emptyText}>Tidak ada pengguna ditemukan</Text>
                        </View>
                    )}
                />
            )}
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
