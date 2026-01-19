/**
 * Profile Screen
 * Halaman profil pengguna dengan desain modern
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, SIZES, SHADOWS } from '../../constants/theme';
import { Header, Button, Card } from '../../components/common';
import { useAuth } from '../../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const [notifications, setNotifications] = React.useState(true);
    const [darkMode, setDarkMode] = React.useState(false);

    const handleLogout = () => {
        logout();
        // Navigation will be handled by AppNavigator automatically via auth state
    };

    const menuItems = [
        {
            title: 'Pengaturan Akun',
            items: [
                { icon: 'person-outline', label: 'Edit Profil', action: () => { } },
                { icon: 'lock-closed-outline', label: 'Ubah Password', action: () => { } },
                { icon: 'location-outline', label: 'Alamat Tersimpan', action: () => { } },
            ],
        },
        {
            title: 'Preferensi',
            items: [
                {
                    icon: 'notifications-outline',
                    label: 'Notifikasi',
                    type: 'switch',
                    value: notifications,
                    onValueChange: setNotifications,
                },
                { icon: 'globe-outline', label: 'Bahasa', value: 'Indonesia', action: () => { } },
            ],
        },
        {
            title: 'Bantuan & Lainnya',
            items: [
                { icon: 'help-circle-outline', label: 'Pusat Bantuan', action: () => { } },
                { icon: 'document-text-outline', label: 'Syarat & Ketentuan', action: () => { } },
                { icon: 'information-circle-outline', label: 'Tentang Aplikasi', action: () => { } },
            ],
        },
    ];

    return (
        <View style={styles.container}>
            <Header title="Profil Saya" showBack={false} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Profile Card */}
                <Animated.View entering={FadeInDown.duration(500)}>
                    <LinearGradient
                        colors={GRADIENTS.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.profileCard, SHADOWS.medium]}
                    >
                        <View style={styles.profileHeader}>
                            <View style={styles.avatarContainer}>
                                {user?.photoURL ? (
                                    <Image source={{ uri: user.photoURL }} style={styles.avatar} />
                                ) : (
                                    <Text style={styles.avatarPlaceholder}>
                                        {user?.displayName?.charAt(0) || 'U'}
                                    </Text>
                                )}
                                <View style={styles.editAvatarButton}>
                                    <Ionicons name="camera" size={16} color={COLORS.primary} />
                                </View>
                            </View>
                            <View style={styles.profileInfo}>
                                <Text style={styles.name}>{user?.displayName || 'Pengguna'}</Text>
                                <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
                                <View style={styles.roleBadge}>
                                    <Text style={styles.roleText}>{user?.role || 'Peternak'}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>12</Text>
                                <Text style={styles.statLabel}>Hewan</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>5</Text>
                                <Text style={styles.statLabel}>Pesanan</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>3</Text>
                                <Text style={styles.statLabel}>Kursus</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Menu Items */}
                {menuItems.map((section, sectionIndex) => (
                    <Animated.View
                        key={sectionIndex}
                        entering={FadeInUp.duration(500).delay(sectionIndex * 100 + 200)}
                        style={styles.section}
                    >
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <Card style={styles.menuCard}>
                            {section.items.map((item, index) => (
                                <View key={index}>
                                    <TouchableOpacity
                                        style={styles.menuItem}
                                        onPress={item.action}
                                        disabled={item.type === 'switch'}
                                    >
                                        <View style={[styles.menuIcon, { backgroundColor: COLORS.primary + '10' }]}>
                                            <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                                        </View>
                                        <Text style={styles.menuLabel}>{item.label}</Text>
                                        {item.type === 'switch' ? (
                                            <Switch
                                                value={item.value}
                                                onValueChange={item.onValueChange}
                                                trackColor={{ true: COLORS.primary, false: COLORS.gray }}
                                                thumbColor={COLORS.white}
                                            />
                                        ) : (
                                            <View style={styles.menuRight}>
                                                {item.value && (
                                                    <Text style={styles.menuValue}>{item.value}</Text>
                                                )}
                                                <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                    {index < section.items.length - 1 && <View style={styles.divider} />}
                                </View>
                            ))}
                        </Card>
                    </Animated.View>
                ))}

                {/* Logout Button */}
                <Animated.View
                    entering={FadeInUp.duration(500).delay(600)}
                    style={styles.logoutContainer}
                >
                    <Button
                        title="Keluar"
                        variant="outline"
                        icon={<Ionicons name="log-out-outline" size={20} color={COLORS.error} />}
                        onPress={handleLogout}
                        style={styles.logoutButton}
                        textStyle={{ color: COLORS.error }}
                    />
                    <Text style={styles.version}>Versi 1.0.0</Text>
                </Animated.View>
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
        paddingBottom: 40,
    },
    profileCard: {
        borderRadius: SIZES.radiusLarge,
        padding: 20,
        marginBottom: 24,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatar: {
        width: 74,
        height: 74,
        borderRadius: 37,
    },
    avatarPlaceholder: {
        fontSize: 32,
        fontWeight: '700',
        color: COLORS.primary,
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.small,
    },
    profileInfo: {
        flex: 1,
    },
    name: {
        fontSize: SIZES.h3,
        fontWeight: '700',
        color: COLORS.white,
        marginBottom: 4,
    },
    email: {
        fontSize: SIZES.bodySmall,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 8,
    },
    roleBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    roleText: {
        fontSize: SIZES.caption,
        fontWeight: '600',
        color: COLORS.white,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: SIZES.radius,
        padding: 16,
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: SIZES.h3,
        fontWeight: '700',
        color: COLORS.white,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: SIZES.caption,
        color: 'rgba(255,255,255,0.8)',
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: SIZES.h4,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 12,
        marginLeft: 4,
    },
    menuCard: {
        padding: 0,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    menuLabel: {
        flex: 1,
        fontSize: SIZES.body,
        fontWeight: '500',
        color: COLORS.text,
    },
    menuRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    menuValue: {
        fontSize: SIZES.bodySmall,
        color: COLORS.textMuted,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.lightGray,
        marginLeft: 64,
    },
    logoutContainer: {
        marginBottom: 30,
        alignItems: 'center',
        gap: 16,
    },
    logoutButton: {
        width: '100%',
        borderColor: COLORS.error,
    },
    version: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
    },
});

export default ProfileScreen;
