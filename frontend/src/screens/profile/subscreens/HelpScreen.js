import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';

const HelpScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { title, type } = route.params || { title: 'Bantuan', type: 'help' };

    const renderContent = () => {
        switch (type) {
            case 'help_center':
                return (
                    <View>
                        <Text style={styles.sectionHeader}>Pertanyaan Umum (FAQ)</Text>
                        <FaqItem q="Bagaimana cara menambah hewan?" a="Pergi ke tab Peternakan, lalu tekan tombol (+) di pojok kanan bawah atau 'Tambah Hewan' di dashboard." />
                        <FaqItem q="Apakah data tersimpan aman?" a="Ya, semua data tersimpan di server cloud yang aman." />
                        <FaqItem q="Bagaimana cara menghubungi admin?" a="Anda dapat mengirim email ke support@peternakanapp.com" />
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
    answer: { fontSize: 14, color: '#4b5563', lineHeight: 20 }
});

export default HelpScreen;
