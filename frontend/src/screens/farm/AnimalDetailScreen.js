/**
 * Animal Detail Screen
 * Detail hewan dan riwayat kesehatan
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, Modal, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { animalApi } from '../../services/api';

const AnimalDetailScreen = ({ navigation, route }) => {
    const { animal: initialAnimal } = route.params;
    const insets = useSafeAreaInsets();
    const [animal, setAnimal] = useState(initialAnimal);
    const [healthRecords, setHealthRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [newRecord, setNewRecord] = useState({
        recordType: 'checkup', diagnosis: '', treatment: '', notes: '', cost: '', nextVisitDate: '', healthStatus: 'healthy'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [animalRes, recordsRes] = await Promise.all([
                animalApi.getById(animal.id),
                animalApi.getHealthRecords(animal.id)
            ]);
            setAnimal(animalRes.data || animalRes);
            setHealthRecords(recordsRes.data || recordsRes || []);
        } catch (error) {
            console.error('Error loading detail:', error);
        }
    };

    const handleAddRecord = async () => {
        if (!newRecord.diagnosis) {
            Alert.alert('Error', 'Diagnosa/Keterangan wajib diisi');
            return;
        }

        try {
            setLoading(true);
            await animalApi.addHealthRecord(animal.id, {
                ...newRecord,
                cost: parseFloat(newRecord.cost) || 0,
                date: new Date(),
            });
            setModalVisible(false);
            setNewRecord({ recordType: 'checkup', diagnosis: '', treatment: '', notes: '', cost: '', nextVisitDate: '', healthStatus: animal.healthStatus });
            loadData();
            Alert.alert('Sukses', 'Catatan kesehatan ditambahkan');
        } catch (error) {
            Alert.alert('Gagal', error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';
        // Handle Firestore Timestamp (seconds)
        if (date.seconds) {
            return new Date(date.seconds * 1000).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric'
            });
        }
        // Handle standard Date string/object
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';

        return d.toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    const calculateAge = (birthDateString) => {
        // ... (kode calculateAge yang sudah ada, biarkan atau copy paste ulang jika perlu konsistensi)
        if (!birthDateString) return '-';
        const birthDate = new Date(birthDateString);
        const today = new Date();
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        if (months < 0) { years--; months += 12; }
        if (years > 0) return `${years} thn ${months} bln`;
        return `${months} bulan`;
    };

    // Helper untuk status UI
    const getStatusInfo = (status) => {
        switch (status) {
            case 'sick': return { label: 'Sakit', bg: '#fee2e2', color: '#dc2626' };
            case 'pregnant': return { label: 'Hamil', bg: '#ffedd5', color: '#9a3412' };
            default: return { label: 'Sehat', bg: '#dcfce7', color: '#10b981' };
        }
    };

    const statusInfo = getStatusInfo(animal.healthStatus);

    // ... (lanjut ke handleDeathReport dsb)


    const handleDeathReport = () => {
        const confirmMessage = 'Laporkan Kematian\n\nApakah hewan ini mati? Status akan diubah menjadi mati dan populasi aktif berkurang.';

        if (Platform.OS === 'web') {
            if (window.confirm(confirmMessage)) {
                processDeathReport();
            }
        } else {
            Alert.alert(
                'Laporkan Kematian',
                'Apakah hewan ini mati? Status akan diubah menjadi mati dan populasi aktif berkurang.',
                [
                    { text: 'Batal', style: 'cancel' },
                    { text: 'Ya, Laporkan', style: 'destructive', onPress: processDeathReport }
                ]
            );
        }
    };

    const processDeathReport = async () => {
        try {
            setLoading(true);
            await animalApi.update(animal.id, {
                isActive: false,
                deathDate: new Date(),
                healthStatus: 'dead'
            });

            if (Platform.OS === 'web') {
                alert('Tercatat: Hewan telah dilaporkan mati.');
            } else {
                Alert.alert('Tercatat', 'Hewan telah dilaporkan mati.');
            }
            navigation.goBack();
        } catch (error) {
            const userId = animal.userId || 'unknown'; // Debugging
            console.error('Death report error:', error);
            if (Platform.OS === 'web') {
                alert(`Gagal: ${error.message}`);
            } else {
                Alert.alert('Gagal', error.message);
            }
            setLoading(false);
        }
    };

    const handleEdit = () => {
        // Implementasi Edit Nanti (misal buka Modal Edit)
        if (Platform.OS === 'web') {
            alert('Fitur Edit akan segera hadir!');
        } else {
            Alert.alert('Info', 'Fitur Edit akan segera hadir!');
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detail Hewan</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity style={styles.editButton} onPress={handleDeathReport}>
                        <Ionicons name="skull-outline" size={24} color="#dc2626" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                        <Ionicons name="create-outline" size={24} color="#964b00" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarEmoji}>
                                {animal.type === 'CATTLE' ? '🐄' :
                                    animal.type === 'GOAT' ? '🐐' :
                                        animal.type === 'SHEEP' ? '🐑' :
                                            animal.type === 'CHICKEN' ? '🐔' : '🐾'}
                            </Text>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.name}>{animal.name}</Text>
                            <Text style={styles.breed}>{animal.breed || 'Tidak ada ras'}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                                <Text style={[styles.statusText, { color: statusInfo.color }]}>
                                    {statusInfo.label}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Berat</Text>
                            <Text style={styles.statValue}>{animal.weight} kg</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Gender</Text>
                            <Text style={styles.statValue}>{animal.gender === 'male' ? 'Jantan' : 'Betina'}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Umur</Text>
                            <Text style={styles.statValue}>{calculateAge(animal.birthDate)}</Text>
                        </View>
                    </View>
                </View>

                {/* Health Records Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Riwayat Kesehatan</Text>
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                            <Text style={styles.actionText}>+ Tambah</Text>
                        </TouchableOpacity>
                    </View>

                    {healthRecords.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Belum ada riwayat kesehatan</Text>
                        </View>
                    ) : (
                        <View style={styles.timeline}>
                            {healthRecords.map((record, index) => (
                                <View key={record.id || index} style={styles.timelineItem}>
                                    <View style={styles.timelineLeft}>
                                        <View style={styles.timelineLine} />
                                        <View style={styles.timelineDot} />
                                    </View>
                                    <View style={styles.timelineContent}>
                                        <Text style={styles.recordDate}>{formatDate(record.createdAt)}</Text>
                                        <Text style={styles.recordTitle}>{record.diagnosis}</Text>
                                        <Text style={styles.recordDesc}>{record.treatment}</Text>
                                        {record.notes && <Text style={styles.recordNotes}>"{record.notes}"</Text>}
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Modal Tambah Record */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Catatan Kesehatan Baru</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Diagnosa / Kondisi</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Contoh: Demam, Vaksinasi Rutin"
                                value={newRecord.diagnosis}
                                onChangeText={(text) => setNewRecord({ ...newRecord, diagnosis: text })}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Penanganan / Obat</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Contoh: Paracetamol, Vitamin B"
                                value={newRecord.treatment}
                                onChangeText={(text) => setNewRecord({ ...newRecord, treatment: text })}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Status Kesehatan Sekarang</Text>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                {['healthy', 'sick', 'pregnant'].map((status) => (
                                    <TouchableOpacity
                                        key={status}
                                        style={[
                                            styles.statusOption,
                                            newRecord.healthStatus === status && styles.statusOptionActive,
                                            status === 'sick' && newRecord.healthStatus === 'sick' && { backgroundColor: '#fee2e2', borderColor: '#ef4444' },
                                            status === 'healthy' && newRecord.healthStatus === 'healthy' && { backgroundColor: '#dcfce7', borderColor: '#22c55e' },
                                            status === 'pregnant' && newRecord.healthStatus === 'pregnant' && { backgroundColor: '#fef3c7', borderColor: '#f59e0b' }
                                        ]}
                                        onPress={() => setNewRecord({ ...newRecord, healthStatus: status })}
                                    >
                                        <Text style={[
                                            styles.statusOptionText,
                                            newRecord.healthStatus === status && { fontWeight: '700' },
                                            status === 'sick' && newRecord.healthStatus === 'sick' && { color: '#b91c1c' },
                                            status === 'healthy' && newRecord.healthStatus === 'healthy' && { color: '#15803d' },
                                        ]}>
                                            {status === 'healthy' ? 'Sehat' : status === 'sick' ? 'Sakit' : 'Hamil'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Biaya (Rp)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                keyboardType="numeric"
                                value={newRecord.cost}
                                onChangeText={(text) => setNewRecord({ ...newRecord, cost: text })}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleAddRecord}
                            disabled={loading}
                        >
                            <LinearGradient colors={['#964b00', '#7c3f06']} style={styles.saveGradient}>
                                <Text style={styles.saveButtonText}>{loading ? 'Menyimpan...' : 'Simpan Catatan'}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    profileCard: { margin: 20, padding: 20, backgroundColor: '#fff', borderRadius: 20, ...SHADOWS.small },
    profileHeader: { flexDirection: 'row', marginBottom: 24 },
    avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#faf8f5', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    avatarEmoji: { fontSize: 40 },
    profileInfo: { justifyContent: 'center' },
    name: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 4 },
    breed: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 12, fontWeight: '600' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
    statItem: { alignItems: 'center', flex: 1 },
    statLabel: { fontSize: 12, color: '#9ca3af', marginBottom: 4 },
    statValue: { fontSize: 16, fontWeight: '700', color: '#374151' },
    statDivider: { width: 1, height: 30, backgroundColor: '#f3f4f6' },
    section: { paddingHorizontal: 20 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    actionText: { color: '#964b00', fontWeight: '600', fontSize: 14 },
    timeline: { paddingLeft: 10 },
    timelineItem: { flexDirection: 'row', marginBottom: 24, minHeight: 80 },
    timelineLeft: { width: 20, alignItems: 'center', marginRight: 16 },
    timelineLine: { width: 2, flex: 1, backgroundColor: '#e5e7eb', position: 'absolute', top: 0, bottom: -24 },
    timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#964b00', borderWidth: 2, borderColor: '#fff', zIndex: 1 },
    timelineContent: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12, ...SHADOWS.small },
    recordDate: { fontSize: 12, color: '#9ca3af', marginBottom: 4 },
    recordTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
    recordDesc: { fontSize: 14, color: '#4b5563', marginBottom: 6 },
    recordNotes: { fontSize: 13, fontStyle: 'italic', color: '#6b7280' },
    emptyState: { alignItems: 'center', padding: 40, backgroundColor: '#fff', borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: '#d1d5db' },
    emptyText: { color: '#9ca3af' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 18, fontWeight: '700' },
    formGroup: { marginBottom: 16 },
    formLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15 },
    saveButton: { marginTop: 8, borderRadius: 14, overflow: 'hidden' },
    saveGradient: { paddingVertical: 16, alignItems: 'center' },
    saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    statusOption: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#f9fafb' },
    statusOptionActive: { borderColor: '#964b00', backgroundColor: '#fff7ed' },
    statusOptionText: { fontSize: 13, color: '#4b5563' },
});

export default AnimalDetailScreen;
