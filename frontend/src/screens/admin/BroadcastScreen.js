import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { notificationApi } from '../../services/api';

const BroadcastScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!title || !message) {
            Alert.alert('Validasi', 'Judul dan pesan wajib diisi');
            return;
        }

        setLoading(true);
        try {
            await notificationApi.sendBroadcast({ title, message });
            Alert.alert('Sukses', 'Broadcast berhasil dikirim ke semua pengguna');
            setTitle('');
            setMessage('');
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Gagal mengirim broadcast');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#5d3a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Broadcast Pesan</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.infoCard}>
                    <Ionicons name="information-circle" size={24} color={COLORS.primary} />
                    <Text style={styles.infoText}>
                        Pesan broadcast akan dikirimkan ke <Text style={styles.bold}>semua pengguna</Text> aplikasi dan muncul di halaman notifikasi mereka.
                    </Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Judul Pesan</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Contoh: Promo Spesial Bulan Ini!"
                        placeholderTextColor="#9ca3af"
                    />

                    <Text style={styles.label}>Isi Pesan</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Tulis pesan lengkap di sini..."
                        placeholderTextColor="#9ca3af"
                        multiline
                        textAlignVertical="top"
                    />

                    <TouchableOpacity
                        style={styles.sendBtn}
                        onPress={handleSend}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="paper-plane" size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.sendText}>Kirim Broadcast</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#faf8f5' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 20, paddingTop: 50, backgroundColor: '#fff', ...SHADOWS.small
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#5d3a1a' },
    backBtn: { padding: 5 },

    content: { padding: 20 },

    infoCard: {
        flexDirection: 'row', backgroundColor: '#fff4e5', padding: 15, borderRadius: 12,
        marginBottom: 25, alignItems: 'center', gap: 10
    },
    infoText: { flex: 1, color: '#9a5b13', fontSize: 13, lineHeight: 20 },
    bold: { fontWeight: 'bold' },

    form: { gap: 8 },
    label: { fontSize: 14, fontWeight: '600', color: '#4b3621', marginBottom: 4 },
    input: {
        backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12,
        padding: 15, fontSize: 15, color: '#333', marginBottom: 15
    },
    textArea: { height: 150 },

    sendBtn: {
        flexDirection: 'row', backgroundColor: COLORS.primary, padding: 16, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center', marginTop: 10, ...SHADOWS.small
    },
    sendText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default BroadcastScreen;
