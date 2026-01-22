/**
 * Farm Dashboard Screen - Fitur Lengkap
 * Manajemen peternakan dengan CRUD hewan
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
    RefreshControl, ActivityIndicator, Alert, Platform, Modal, TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { ANIMAL_TYPES } from '../../constants';
import { animalApi, farmApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const FarmDashboardScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [animals, setAnimals] = useState([]);
    const [stats, setStats] = useState({ total: 0, healthy: 0, sick: 0, pregnant: 0 });
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [modalVisible, setModalVisible] = useState(false);
    const [newAnimal, setNewAnimal] = useState({
        name: '', type: 'CATTLE', breed: '', gender: 'male', weight: '', notes: '', birthDate: '', quantity: '1'
    });
    const [searchQuery, setSearchQuery] = useState(''); // Search State
    const [saving, setSaving] = useState(false);

    const filters = [
        { id: 'all', label: 'Semua' },
        { id: 'healthy', label: 'Sehat' },
        { id: 'sick', label: 'Sakit' },
        { id: 'pregnant', label: 'Hamil' },
    ];

    const animalTypes = [
        { id: 'CATTLE', label: 'Sapi', icon: '🐄' },
        { id: 'GOAT', label: 'Kambing', icon: '🐐' },
        { id: 'SHEEP', label: 'Domba', icon: '🐑' },
        { id: 'CHICKEN', label: 'Ayam', icon: '🐔' },
        { id: 'DUCK', label: 'Bebek', icon: '🦆' },
        { id: 'OTHER', label: 'Lainnya', icon: '🐾' },
    ];

    const loadData = useCallback(async () => {
        try {
            const [animalsRes, statsRes] = await Promise.all([
                animalApi.getMyAnimals(),
                animalApi.getStats(),
            ]);
            setAnimals(animalsRes?.data || animalsRes || []);

            const statsData = statsRes?.data || statsRes || {};
            console.log('Stats Data:', statsData); // Debugging

            if (statsData) {
                setStats({
                    total: statsData.total || 0,
                    healthy: statsData.byHealthStatus?.healthy || 0,
                    sick: statsData.byHealthStatus?.sick || 0,
                    pregnant: statsData.byHealthStatus?.pregnant || 0,
                });
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();

            // Check for Quick Actions from Home Screen
            if (route.params?.action === 'add_animal' || route.params?.openAddModal) {
                setModalVisible(true);
                // Clear param after use
                navigation.setParams({ action: null, openAddModal: null });
            }
        }, [loadData, route.params])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const showAlert = (title, message) => {
        if (Platform.OS === 'web') { window.alert(`${title}\n\n${message}`); }
        else { Alert.alert(title, message); }
    };

    const handleAddAnimal = async () => {
        if (!newAnimal.name.trim()) {
            showAlert('Error', 'Nama hewan wajib diisi');
            return;
        }
        setSaving(true);
        try {
            await animalApi.create({
                ...newAnimal,
                weight: parseFloat(newAnimal.weight) || 0,
                healthStatus: 'healthy',
            });
            setModalVisible(false);
            setNewAnimal({ name: '', type: 'CATTLE', breed: '', gender: 'male', weight: '', notes: '', birthDate: '', quantity: '1' });
            loadData();
            showAlert('Berhasil', 'Hewan berhasil ditambahkan');
        } catch (error) {
            showAlert('Gagal', error.message || 'Gagal menambahkan hewan');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAnimal = async (id, name) => {
        if (Platform.OS === 'web') {
            if (window.confirm(`Hapus ${name}?`)) {
                try {
                    await animalApi.delete(id);
                    loadData();
                    showAlert('Berhasil', 'Hewan berhasil dihapus');
                } catch (error) {
                    showAlert('Gagal', error.message);
                }
            }
        } else {
            Alert.alert('Hapus Hewan', `Yakin ingin menghapus ${name}?`, [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus', style: 'destructive', onPress: async () => {
                        try {
                            await animalApi.delete(id);
                            loadData();
                        } catch (error) {
                            showAlert('Gagal', error.message);
                        }
                    }
                },
            ]);
        }
    };

    const filteredAnimals = animals.filter(animal => {
        const matchesStatus = selectedFilter === 'all' || animal.healthStatus === selectedFilter;
        const matchesSearch = animal.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const statCards = [
        { label: 'Total', value: stats.total, icon: 'paw', color: '#964b00', bg: '#faf8f5' },
        { label: 'Sehat', value: stats.healthy, icon: 'checkmark-circle', color: '#10b981', bg: '#ecfdf5' },
        { label: 'Sakit', value: stats.sick, icon: 'medkit', color: '#dc2626', bg: '#fef2f2' },
        { label: 'Hamil', value: stats.pregnant, icon: 'heart', color: '#7c3f06', bg: '#fdf5ef' },
    ];

    if (loading) {
        return (
            <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color="#964b00" />
                <Text style={styles.loadingText}>Memuat data...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#964b00']} />}
            >
                {/* Header */}
                <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.headerSubtitle}>Manajemen Ternak 🐄</Text>
                            <Text style={styles.headerTitle}>Peternakan Saya</Text>
                        </View>
                        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                            <LinearGradient colors={['#964b00', '#7c3f06']} style={styles.addButtonGradient}>
                                <Ionicons name="add" size={24} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Cari hewan..."
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Stats */}
                <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.statsSection}>
                    <View style={styles.statsRow}>
                        {statCards.map((stat, index) => (
                            <Animated.View key={index} entering={FadeInUp.delay(index * 80)} style={styles.statCard}>
                                <View style={[styles.statIcon, { backgroundColor: stat.bg }]}>
                                    <Ionicons name={stat.icon} size={20} color={stat.color} />
                                </View>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>

                {/* Filter Pills */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContainer}>
                    {filters.map((filter) => (
                        <TouchableOpacity
                            key={filter.id}
                            style={[styles.filterPill, selectedFilter === filter.id && styles.filterPillActive]}
                            onPress={() => setSelectedFilter(filter.id)}
                        >
                            <Text style={[styles.filterText, selectedFilter === filter.id && styles.filterTextActive]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Animal List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Daftar Hewan ({filteredAnimals.length})</Text>
                    {filteredAnimals.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>🐄</Text>
                            <Text style={styles.emptyTitle}>Belum Ada Hewan</Text>
                            <Text style={styles.emptyText}>Tambahkan hewan pertama Anda</Text>
                            <TouchableOpacity style={styles.emptyButton} onPress={() => setModalVisible(true)}>
                                <Text style={styles.emptyButtonText}>+ Tambah Hewan</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.animalList}>
                            {filteredAnimals.map((animal, index) => (
                                <AnimalCard
                                    key={animal.id}
                                    animal={animal}
                                    index={index}
                                    onDelete={() => handleDeleteAnimal(animal.id, animal.name)}
                                    onPress={() => navigation.navigate('AnimalDetail', { animal })}
                                />
                            ))}
                        </View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Add Animal Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Tambah Hewan Baru</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Nama Hewan (atau Nama Kelompok) *</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={newAnimal.name}
                                    onChangeText={(text) => setNewAnimal({ ...newAnimal, name: text })}
                                    placeholder="Contoh: Ayam Petelur"
                                    placeholderTextColor="#9ca3af"
                                />
                            </View>

                            <View style={styles.formRow}>
                                <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={styles.formLabel}>Jumlah (Ekor)</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        value={newAnimal.quantity?.toString()}
                                        onChangeText={(text) => setNewAnimal({ ...newAnimal, quantity: text })}
                                        placeholder="1"
                                        keyboardType="numeric"
                                        placeholderTextColor="#9ca3af"
                                    />
                                </View>
                                <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
                                    <Text style={styles.formLabel}>Tanggal Lahir</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        value={newAnimal.birthDate}
                                        onChangeText={(text) => setNewAnimal({ ...newAnimal, birthDate: text })}
                                        placeholder="YYYY-MM-DD"
                                        placeholderTextColor="#9ca3af"
                                    />
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Jenis Hewan</Text>
                                <View style={styles.typeGrid}>
                                    {animalTypes.map((type) => (
                                        <TouchableOpacity
                                            key={type.id}
                                            style={[styles.typeCard, newAnimal.type === type.id && styles.typeCardActive]}
                                            onPress={() => setNewAnimal({ ...newAnimal, type: type.id })}
                                        >
                                            <Text style={styles.typeIcon}>{type.icon}</Text>
                                            <Text style={[styles.typeLabel, newAnimal.type === type.id && styles.typeLabelActive]}>
                                                {type.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.formRow}>
                                <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={styles.formLabel}>Ras/Jenis</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        value={newAnimal.breed}
                                        onChangeText={(text) => setNewAnimal({ ...newAnimal, breed: text })}
                                        placeholder="Contoh: Brahman"
                                        placeholderTextColor="#9ca3af"
                                    />
                                </View>
                                <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
                                    <Text style={styles.formLabel}>Berat (kg)</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        value={newAnimal.weight}
                                        onChangeText={(text) => setNewAnimal({ ...newAnimal, weight: text })}
                                        placeholder="0"
                                        placeholderTextColor="#9ca3af"
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Jenis Kelamin</Text>
                                <View style={styles.genderRow}>
                                    {[{ id: 'male', label: 'Jantan', icon: '♂️' }, { id: 'female', label: 'Betina', icon: '♀️' }].map((g) => (
                                        <TouchableOpacity
                                            key={g.id}
                                            style={[styles.genderCard, newAnimal.gender === g.id && styles.genderCardActive]}
                                            onPress={() => setNewAnimal({ ...newAnimal, gender: g.id })}
                                        >
                                            <Text style={styles.genderIcon}>{g.icon}</Text>
                                            <Text style={[styles.genderLabel, newAnimal.gender === g.id && styles.genderLabelActive]}>
                                                {g.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Catatan</Text>
                                <TextInput
                                    style={[styles.formInput, styles.formTextarea]}
                                    value={newAnimal.notes}
                                    onChangeText={(text) => setNewAnimal({ ...newAnimal, notes: text })}
                                    placeholder="Catatan tambahan..."
                                    placeholderTextColor="#9ca3af"
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.submitButton, saving && styles.buttonDisabled]}
                            onPress={handleAddAnimal}
                            disabled={saving}
                        >
                            <LinearGradient colors={['#964b00', '#7c3f06']} style={styles.submitButtonGradient}>
                                <Text style={styles.submitButtonText}>
                                    {saving ? 'Menyimpan...' : 'Simpan Hewan'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const calculateAge = (birthDateString) => {
    if (!birthDateString) return null;
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (months < 0) { years--; months += 12; }
    if (years > 0) return `${years} thn`;
    return `${months} bln`;
};

const AnimalCard = ({ animal, index, onDelete, onPress }) => {
    const animalType = ANIMAL_TYPES[animal.type] || ANIMAL_TYPES.OTHER;
    const isHealthy = animal.healthStatus === 'healthy';
    const isSick = animal.healthStatus === 'sick';

    const getStatusColor = () => {
        if (isSick) return '#dc2626';
        if (animal.healthStatus === 'pregnant') return '#7c3f06';
        return '#10b981';
    };

    const getStatusLabel = () => {
        if (isSick) return 'Sakit';
        if (animal.healthStatus === 'pregnant') return 'Hamil';
        return 'Sehat';
    };

    const age = calculateAge(animal.birthDate);

    return (
        <Animated.View entering={FadeInRight.delay(index * 80).duration(400)}>
            <TouchableOpacity style={styles.animalCard} onPress={onPress} activeOpacity={0.9}>
                <View style={styles.animalLeft}>
                    <View style={styles.animalImageContainer}>
                        <Text style={styles.animalEmoji}>{animalType.icon}</Text>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                    </View>
                </View>
                <View style={styles.animalContent}>
                    <View style={styles.animalHeader}>
                        <Text style={styles.animalName}>{animal.name}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '15' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusLabel()}</Text>
                        </View>
                    </View>
                    <Text style={styles.animalType}>{animalType.label} {animal.breed ? `• ${animal.breed}` : ''}</Text>
                    <View style={styles.animalMeta}>
                        {animal.weight > 0 && (
                            <View style={styles.metaItem}>
                                <Ionicons name="scale-outline" size={12} color="#9ca3af" />
                                <Text style={styles.metaText}>{animal.weight} kg</Text>
                            </View>
                        )}
                        <View style={styles.metaItem}>
                            <Ionicons name="male-female-outline" size={12} color="#9ca3af" />
                            <Text style={styles.metaText}>{animal.gender === 'male' ? 'Jantan' : 'Betina'}</Text>
                        </View>
                        {age && (
                            <View style={styles.metaItem}>
                                <Ionicons name="time-outline" size={12} color="#9ca3af" />
                                <Text style={styles.metaText}>{age}</Text>
                            </View>
                        )}
                    </View>
                </View>
                <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                    <Ionicons name="trash-outline" size={18} color="#dc2626" />
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    centered: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#6b7280', fontSize: 14 },
    header: { paddingHorizontal: SIZES.padding, paddingTop: 8, paddingBottom: 16 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 2 },
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
    addButton: { borderRadius: 16, overflow: 'hidden', ...SHADOWS.medium },
    addButtonGradient: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
    statsSection: { paddingHorizontal: SIZES.padding, marginBottom: 20 },
    statsRow: { flexDirection: 'row', gap: 10 },
    statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#f0ebe3', ...SHADOWS.small },
    statIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    statValue: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 2 },
    statLabel: { fontSize: 11, color: '#6b7280' },
    filterScroll: { marginBottom: 16 },
    filterContainer: { paddingHorizontal: SIZES.padding, gap: 8 },
    filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#faf8f5', borderWidth: 1, borderColor: '#f0ebe3' },
    filterPillActive: { backgroundColor: '#964b00', borderColor: '#964b00' },
    filterText: { fontSize: 13, fontWeight: '500', color: '#6b7280' },
    filterTextActive: { color: '#fff' },
    section: { paddingHorizontal: SIZES.padding },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
    emptyState: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#faf8f5', borderRadius: 20, borderWidth: 1, borderColor: '#f0ebe3' },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
    emptyText: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
    emptyButton: { backgroundColor: '#964b00', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    emptyButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    animalList: { gap: 12 },
    animalCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#f0ebe3', ...SHADOWS.small },
    animalLeft: { marginRight: 14 },
    animalImageContainer: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#faf8f5', alignItems: 'center', justifyContent: 'center', position: 'relative' },
    animalEmoji: { fontSize: 28 },
    statusDot: { position: 'absolute', width: 12, height: 12, borderRadius: 6, bottom: -2, right: -2, borderWidth: 2, borderColor: '#fff' },
    animalContent: { flex: 1 },
    animalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
    animalName: { fontSize: 16, fontWeight: '700', color: '#111827' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: '600' },
    animalType: { fontSize: 13, color: '#6b7280', marginBottom: 6 },
    animalMeta: { flexDirection: 'row', gap: 12 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 11, color: '#9ca3af' },
    deleteButton: { padding: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
    formGroup: { marginBottom: 20 },
    formLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    formInput: { backgroundColor: '#faf8f5', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#111827', borderWidth: 1, borderColor: '#f0ebe3' },
    formTextarea: { height: 80, textAlignVertical: 'top' },
    formRow: { flexDirection: 'row' },
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    typeCard: { width: (width - 48 - 20) / 3, backgroundColor: '#faf8f5', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#f0ebe3' },
    typeCardActive: { backgroundColor: '#964b00', borderColor: '#964b00' },
    typeIcon: { fontSize: 24, marginBottom: 4 },
    typeLabel: { fontSize: 11, fontWeight: '500', color: '#374151' },
    typeLabelActive: { color: '#fff' },
    genderRow: { flexDirection: 'row', gap: 12 },
    genderCard: { flex: 1, backgroundColor: '#faf8f5', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#f0ebe3' },
    genderCardActive: { backgroundColor: '#964b00', borderColor: '#964b00' },
    genderIcon: { fontSize: 24, marginBottom: 4 },
    genderLabel: { fontSize: 13, fontWeight: '500', color: '#374151' },
    genderLabelActive: { color: '#fff' },
    submitButton: { marginTop: 8, borderRadius: 16, overflow: 'hidden', ...SHADOWS.medium },
    submitButtonGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
    submitButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
    buttonDisabled: { opacity: 0.7 },

    // Search Styles
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#faf8f5',
        marginHorizontal: SIZES.padding,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 50,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#f0ebe3',
    },
    searchIcon: { marginRight: 10 },
    searchInput: {
        flex: 1,
        height: '100%',
        color: '#111827',
        fontSize: 15,
    },
});

export default FarmDashboardScreen;
