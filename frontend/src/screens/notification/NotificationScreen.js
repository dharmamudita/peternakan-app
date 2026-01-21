import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { notificationApi } from '../../services/api'; // Pastikan path ini benar nanti

const NotificationScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await notificationApi.getAll();
            setNotifications(response.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const handlePress = async (item) => {
        if (!item.isRead) {
            try {
                // Optimistic update
                const newNotifs = notifications.map(n =>
                    n.id === item.id ? { ...n, isRead: true } : n
                );
                setNotifications(newNotifs);
                await notificationApi.markAsRead(item.id);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.item, !item.isRead && styles.unreadItem]}
            onPress={() => handlePress(item)}
            activeOpacity={0.8}
        >
            <View style={[styles.iconBox, !item.isRead && styles.unreadIconBox]}>
                <Ionicons
                    name={item.type === 'broadcast' ? 'megaphone' : 'notifications'}
                    size={24}
                    color={!item.isRead ? COLORS.primary : '#9ca3af'}
                />
            </View>
            <View style={styles.content}>
                <View style={styles.row}>
                    <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>{item.title}</Text>
                    <Text style={styles.date}>
                        {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </Text>
                </View>
                <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
            </View>
            {!item.isRead && <View style={styles.dot} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#5d3a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifikasi</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                    contentContainerStyle={{ padding: 15 }}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="notifications-off-outline" size={64} color="#d1d5db" />
                            <Text style={styles.emptyText}>Belum ada notifikasi</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: '#f3f4f6'
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
    backBtn: { padding: 5 },

    item: {
        flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
        alignItems: 'center'
    },
    unreadItem: { backgroundColor: '#fdf8f3' },
    iconBox: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: '#f3f4f6',
        alignItems: 'center', justifyContent: 'center', marginRight: 15
    },
    unreadIconBox: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#fed7aa' },
    content: { flex: 1 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    title: { fontSize: 15, fontWeight: '600', color: '#374151' },
    unreadTitle: { fontWeight: 'bold', color: '#1f2937' },
    date: { fontSize: 12, color: '#9ca3af' },
    message: { fontSize: 13, color: '#6b7280', lineHeight: 18 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginLeft: 8 },

    emptyState: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#9ca3af', marginTop: 15, fontSize: 16 },
});

export default NotificationScreen;
