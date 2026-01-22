import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../../constants/theme';
import { reportApi } from '../../../services/api';

const HelpScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { title, type } = route.params || { title: 'Bantuan', type: 'help' };

    const [reportTitle, setReportTitle] = useState('');
    const [reportDesc, setReportDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);

    const handleSubmitReport = async () => {
        if (!reportTitle || !reportDesc) {
            Alert.alert('Validasi', 'Judul dan deskripsi masalah wajib diisi');
            return;
        }

        console.log('Submitting report...', { title: reportTitle, description: reportDesc });
        setLoading(true);
        try {
            const response = await reportApi.create({
                title: reportTitle,
                description: reportDesc
            });
            console.log('Report submitted response:', response);
            console.log('Report submitted response:', response);
            setSuccessModalVisible(true);
            setReportTitle('');
            setReportDesc('');
        } catch (error) {
            console.error('Report submission error:', error);
            const errorMessage = error.message || 'Gagal mengirim laporan';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        switch (type) {
            case 'help_center':
                return (
                    <View>
                        <Text style={styles.sectionHeader}>Pertanyaan Umum (FAQ)</Text>
                        <FaqItem q="Bagaimana cara menambah hewan?" a="Pergi ke tab Peternakan, lalu tekan tombol (+) di pojok kanan bawah atau 'Tambah Hewan' di dashboard." />
                        <FaqItem q="Apakah data tersimpan aman?" a="Ya, semua data tersimpan di server cloud yang aman." />
                        <FaqItem q="Bagaimana cara menghubungi admin?" a="Anda dapat mengirim email ke support@peternakanapp.com atau gunakan fitur lapor masalah di bawah." />

                        <TouchableOpacity
                            style={styles.reportBtn}
                            onPress={() => navigation.push('Help', { type: 'report_problem', title: 'Laporkan Masalah' })}
                        >
                            <Ionicons name="warning-outline" size={20} color="#fff" />
                            <Text style={styles.reportBtnText}>Laporkan Masalah Aplikasi</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 'privacy':
                return (
                    <View>
                        <Text style={styles.paragraph}>Kami menghargai privasi Anda.</Text>
                        <Text style={styles.paragraph}>1. Data yang kami kumpulkan meliputi nama, email, dan data peternakan Anda.</Text>
                        <Text style={styles.paragraph}>2. Kami tidak membagikan data Anda ke pihak ketiga tanpa izin.</Text>
                    </View>
                );
            case 'community':
                return (
                    <View>
                        <Text style={styles.paragraph}>Ketentuan Komunitas:</Text>
                        <Text style={styles.paragraph}>1. Hormati sesama pengguna dalam forum marketplace.</Text>
                        <Text style={styles.paragraph}>2. Dilarang memposting konten ilegal atau hewan dilindungi tanpa izin.</Text>
                    </View>
                );
            case 'about':
                return (
                    <View style={{ alignItems: 'center', marginTop: 20 }}>
                        <View style={{ width: 80, height: 80, backgroundColor: COLORS.primary, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <Ionicons name="paw" size={40} color="white" />
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Peternakan App</Text>
                        <Text style={{ color: '#6b7280', marginBottom: 20 }}>Versi 1.0.0</Text>
                        <Text style={{ textAlign: 'center', lineHeight: 22 }}>Aplikasi manajemen peternakan modern untuk membantu peternak Indonesia mengelola bisnis lebih efisien.</Text>
                    </View>
                );
            case 'report_problem':
                return (
                    <View>
                        <View style={styles.infoCard}>
                            <Ionicons name="information-circle" size={24} color={COLORS.primary} />
                            <Text style={styles.infoText}>
                                Jelaskan masalah yang Anda alami secara detail. Tim kami akan segera meninjaunya.
                            </Text>
                        </View>

                        <Text style={styles.label}>Judul Masalah</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Contoh: Aplikasi crash saat buka kamera"
                            value={reportTitle}
                            onChangeText={setReportTitle}
                        />

                        <Text style={styles.label}>Deskripsi Detail</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Jelaskan langkah-langkah kejadiannya..."
                            value={reportDesc}
                            onChangeText={setReportDesc}
                            multiline
                            textAlignVertical="top"
                        />

                        <TouchableOpacity
                            style={styles.submitBtn}
                            onPress={handleSubmitReport}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitBtnText}>Kirim Laporan</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                );
            default:
                return <Text>Konten tidak tersedia.</Text>;
        }
    };

    const FaqItem = ({ q, a }) => (
        <View style={styles.faqItem}>
            <Text style={styles.question}>{q}</Text>
            <Text style={styles.answer}>{a}</Text>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
                <View style={{ width: 40 }} />
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                {renderContent()}
            </ScrollView>
            {/* Success Modal */}
            <Modal
                transparent={true}
                visible={successModalVisible}
                animationType="fade"
                onRequestClose={() => setSuccessModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.successIcon}>
                            <Ionicons name="checkmark" size={40} color="#fff" />
                        </View>
                        <Text style={styles.modalTitle}>Laporan Terkirim!</Text>
                        <Text style={styles.modalText}>
                            Terima kasih atas laporan Anda. Tim kami akan segera menindaklanjutinya.
                        </Text>
                        <TouchableOpacity
                            style={styles.modalBtn}
                            onPress={() => {
                                setSuccessModalVisible(false);
                                navigation.goBack();
                            }}
                        >
                            <Text style={styles.modalBtnText}>OK, Mengerti</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#ffffff',
        borderBottomWidth: 1, borderBottomColor: '#f3f4f6'
    },
    backBtn: { padding: 8, marginLeft: -8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    content: { padding: 20 },
    sectionHeader: { fontSize: 16, fontWeight: '700', marginBottom: 16, color: COLORS.primary },
    paragraph: { fontSize: 15, lineHeight: 24, color: '#374151', marginBottom: 16 },
    faqItem: { marginBottom: 20, backgroundColor: '#f9fafb', padding: 16, borderRadius: 12 },
    question: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 8 },
    answer: { fontSize: 14, color: '#4b5563', lineHeight: 20 },

    // Form Styles
    infoCard: {
        flexDirection: 'row', backgroundColor: '#e0f2fe', padding: 12, borderRadius: 8,
        marginBottom: 20, alignItems: 'center', gap: 10
    },
    infoText: { flex: 1, color: '#0369a1', fontSize: 13 },
    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
    input: {
        borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12,
        marginBottom: 16, fontSize: 14
    },
    textArea: { height: 120 },
    submitBtn: {
        backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center',
        marginTop: 8
    },
    submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    reportBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: COLORS.secondary, padding: 12, borderRadius: 8, marginTop: 10,
        gap: 8
    },
    reportBtnText: { color: '#fff', fontWeight: '600' },

    // Modal Styles
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20
    },
    modalContent: {
        backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center', width: '100%', maxWidth: 320,
        ...SHADOWS.large
    },
    successIcon: {
        width: 72, height: 72, borderRadius: 36, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 8, textAlign: 'center' },
    modalText: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    modalBtn: { backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, width: '100%' },
    modalBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }
});

export default HelpScreen;
