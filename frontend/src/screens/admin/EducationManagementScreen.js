import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, Image, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { materialApi, courseApi, uploadApi } from '../../services/api';
// ImagePicker removed

const EducationManagementScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('material'); // 'material' or 'course'
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [quizModalVisible, setQuizModalVisible] = useState(false);
    const [lessonModalVisible, setLessonModalVisible] = useState(false);

    // Form State
    const [form, setForm] = useState({
        title: '',
        description: '',
        type: 'article', // 'article' | 'video'
        thumbnail: '',
        content: '', // URL or Text
        category: 'umum',
        price: '0',
        quiz: [],
        lessons: [],
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let response;
            if (activeTab === 'material') {
                response = await materialApi.getAll();
            } else {
                response = await courseApi.getAll();
            }
            // Handle if data is wrapped in response.data.data or straight array
            const list = response.data?.data || response.data || [];
            setData(list);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            'Konfirmasi Hapus',
            'Yakin ingin menghapus item ini?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (activeTab === 'material') {
                                await materialApi.delete(id);
                            } else {
                                await courseApi.delete(id);
                            }
                            fetchData(); // Refresh list
                            Alert.alert('Sukses', 'Item berhasil dihapus');
                        } catch (error) {
                            Alert.alert('Error', 'Gagal menghapus item');
                        }
                    }
                }
            ]
        );
    };

    // Image Picker removed by user request

    const handleSave = async () => {
        if (!form.title || !form.description) {
            Alert.alert('Validasi', 'Judul dan Deskripsi wajib diisi');
            return;
        }

        setSubmitLoading(true);
        try {
            const payload = { ...form };

            // Adjust payload for Course specifically if needed
            // Adjust payload for Course specifically
            if (activeTab === 'course') {
                payload.isFree = true;
                payload.price = 0;
            }

            if (isEditing) {
                if (activeTab === 'material') {
                    await materialApi.update(editId, payload);
                } else {
                    await courseApi.update(editId, payload);
                }
            } else {
                if (activeTab === 'material') {
                    await materialApi.create(payload);
                } else {
                    await courseApi.create(payload);
                }
            }

            setModalVisible(false);
            resetForm();
            fetchData();
            Alert.alert('Sukses', isEditing ? 'Data diperbarui' : 'Data ditambahkan');
        } catch (error) {
            console.error('Save failed:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan saat menyimpan data';
            Alert.alert('Gagal', errorMessage);
        } finally {
            setSubmitLoading(false);
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setIsEditing(true);
            setEditId(item.id);
            setForm({
                title: item.title,
                description: item.description,
                type: item.type || 'article',
                thumbnail: item.thumbnail || '',
                content: item.content || '',
                category: item.category || 'umum',
                price: item.price ? item.price.toString() : '0',
                quiz: item.quiz || [],
                lessons: item.lessons || [],
            });
        } else {
            resetForm();
        }
        setModalVisible(true);
    };

    const addQuestion = () => {
        setForm(prev => ({
            ...prev,
            quiz: [...prev.quiz, { question: '', options: ['', '', '', ''], answer: 0 }]
        }));
    };

    const updateQuestion = (index, field, value) => {
        const newQuiz = [...form.quiz];
        if (field === 'question') newQuiz[index].question = value;
        else if (field === 'answer') newQuiz[index].answer = parseInt(value);
        setForm(prev => ({ ...prev, quiz: newQuiz }));
    };

    const updateOption = (qIndex, oIndex, value) => {
        const newQuiz = [...form.quiz];
        newQuiz[qIndex].options[oIndex] = value;
        setForm(prev => ({ ...prev, quiz: newQuiz }));
    };

    const removeQuestion = (index) => {
        const newQuiz = form.quiz.filter((_, i) => i !== index);
        setForm(prev => ({ ...prev, quiz: newQuiz }));
    };

    // Lesson Handlers
    const addLesson = () => {
        setForm(prev => ({
            ...prev,
            lessons: [...(prev.lessons || []), { title: '', duration: '0', content: '' }]
        }));
    };

    const updateLesson = (index, field, value) => {
        const newLessons = [...(form.lessons || [])];
        newLessons[index] = { ...newLessons[index], [field]: value };
        setForm(prev => ({ ...prev, lessons: newLessons }));
    };

    const removeLesson = (index) => {
        const newLessons = form.lessons.filter((_, i) => i !== index);
        setForm(prev => ({ ...prev, lessons: newLessons }));
    };

    const resetForm = () => {
        setIsEditing(false);
        setEditId(null);
        setForm({
            title: '',
            description: '',
            type: 'article',
            thumbnail: '',
            content: '',
            category: 'umum',
            price: '0',
            quiz: [],
            lessons: [],
        });
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Image
                source={{ uri: item.thumbnail || 'https://placehold.co/150' }}
                style={styles.cardImage}
            />
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                <Text style={styles.cardDate}>
                    {(() => {
                        if (!item.createdAt) return '-';
                        try {
                            const date = item.createdAt._seconds
                                ? new Date(item.createdAt._seconds * 1000)
                                : new Date(item.createdAt);
                            if (isNaN(date.getTime())) return '-';
                            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                        } catch { return '-'; }
                    })()}
                </Text>
                <View style={styles.cardFooter}>
                    <Text style={styles.cardBadge}>{activeTab === 'material' ? item.type : (item.isFree ? 'Gratis' : `Rp ${item.price}`)}</Text>
                    <View style={styles.actionButtons}>
                        <TouchableOpacity onPress={() => openModal(item)} style={styles.iconBtn}>
                            <Ionicons name="create-outline" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.iconBtn, { backgroundColor: '#fee2e2' }]}>
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#5d3a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Manajemen Edukasi</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'material' && styles.activeTab]}
                    onPress={() => setActiveTab('material')}
                >
                    <Text style={[styles.tabText, activeTab === 'material' && styles.activeTabText]}>Materi</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'course' && styles.activeTab]}
                    onPress={() => setActiveTab('course')}
                >
                    <Text style={[styles.tabText, activeTab === 'course' && styles.activeTabText]}>Kursus / Pelatihan</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 20 }}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="folder-open-outline" size={48} color="#ccc" />
                            <Text style={styles.emptyText}>Belum ada data</Text>
                        </View>
                    }
                />
            )}

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>

            {/* Modal Form */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{isEditing ? 'Edit' : 'Tambah'} {activeTab === 'material' ? 'Materi' : 'Kursus'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formContent}>
                            <Text style={styles.label}>Judul</Text>
                            <TextInput
                                style={styles.input}
                                value={form.title}
                                onChangeText={(t) => setForm({ ...form, title: t })}
                                placeholder="Masukkan judul..."
                            />

                            <Text style={styles.label}>Deskripsi</Text>
                            <TextInput
                                style={[styles.input, { height: 80 }]}
                                multiline
                                value={form.description}
                                onChangeText={(t) => setForm({ ...form, description: t })}
                                placeholder="Deskripsi singkat..."
                            />

                            {/* Image Picker removed */}

                            {activeTab === 'material' && (
                                <>
                                    <Text style={styles.label}>Tipe</Text>
                                    <View style={styles.row}>
                                        <TouchableOpacity
                                            style={[styles.chip, form.type === 'article' && styles.activeChip]}
                                            onPress={() => setForm({ ...form, type: 'article' })}
                                        >
                                            <Text style={[styles.chipText, form.type === 'article' && styles.activeChipText]}>Artikel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.chip, form.type === 'video' && styles.activeChip]}
                                            onPress={() => setForm({ ...form, type: 'video' })}
                                        >
                                            <Text style={[styles.chipText, form.type === 'video' && styles.activeChipText]}>Video</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}

                            {activeTab === 'course' && (
                                <View style={{ gap: 10, marginTop: 10 }}>
                                    <TouchableOpacity
                                        style={[styles.input, { backgroundColor: '#fff', borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginTop: 10 }]}
                                        onPress={() => setLessonModalVisible(true)}
                                    >
                                        <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>
                                            Kelola Modul Pelajaran ({form.lessons?.length || 0})
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.input, { backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', borderStyle: 'solid' }]}
                                        onPress={() => setQuizModalVisible(true)}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Kelola Soal Kuis ({form.quiz.length})</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.submitBtn}
                                onPress={handleSave}
                                disabled={submitLoading}
                            >
                                {submitLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitText}>Simpan</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Quiz Modal */}
            <Modal visible={quizModalVisible} animationType="slide">
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => setQuizModalVisible(false)} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color="#5d3a1a" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Kelola Kuis</Text>
                        <TouchableOpacity onPress={addQuestion} style={styles.backBtn}>
                            <Ionicons name="add" size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={{ padding: 20 }}>
                        {form.quiz.length === 0 && (
                            <Text style={styles.emptyText}>Belum ada soal kuis. Tekan + untuk menambah.</Text>
                        )}
                        {form.quiz.map((q, i) => (
                            <View key={i} style={styles.quizCard}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text style={{ fontWeight: 'bold' }}>Soal {i + 1}</Text>
                                    <TouchableOpacity onPress={() => removeQuestion(i)}>
                                        <Ionicons name="trash" size={20} color="red" />
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    style={[styles.input, { marginBottom: 10 }]}
                                    placeholder="Pertanyaan..."
                                    value={q.question}
                                    onChangeText={t => updateQuestion(i, 'question', t)}
                                />
                                {q.options.map((opt, optIndex) => (
                                    <View key={optIndex} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                        <TouchableOpacity
                                            style={[styles.radio, q.answer === optIndex && styles.radioActive]}
                                            onPress={() => updateQuestion(i, 'answer', optIndex.toString())}
                                        >
                                            {q.answer === optIndex && <View style={styles.radioInner} />}
                                        </TouchableOpacity>
                                        <TextInput
                                            style={[styles.input, { flex: 1, height: 40, marginBottom: 0 }]}
                                            placeholder={`Opsi ${String.fromCharCode(65 + optIndex)}`}
                                            value={opt}
                                            onChangeText={t => updateOption(i, optIndex, t)}
                                        />
                                    </View>
                                ))}
                            </View>
                        ))}
                        <View style={{ height: 100 }} />
                    </ScrollView>
                </View>
            </Modal>

            {/* Lesson Management Modal */}
            <Modal visible={lessonModalVisible} animationType="slide">
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => setLessonModalVisible(false)} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color="#5d3a1a" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Kelola Modul Pelajaran</Text>
                        <TouchableOpacity onPress={addLesson} style={styles.backBtn}>
                            <Ionicons name="add" size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={{ padding: 20 }}>
                        {(!form.lessons || form.lessons.length === 0) && (
                            <Text style={styles.emptyText}>Belum ada modul pelajaran. Tekan + untuk menambah.</Text>
                        )}
                        {form.lessons?.map((l, i) => (
                            <View key={i} style={styles.quizCard}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text style={{ fontWeight: 'bold' }}>Modul {i + 1}</Text>
                                    <TouchableOpacity onPress={() => removeLesson(i)}>
                                        <Ionicons name="trash" size={20} color="red" />
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    style={[styles.input, { marginBottom: 10 }]}
                                    placeholder="Judul Modul..."
                                    value={l.title}
                                    onChangeText={t => updateLesson(i, 'title', t)}
                                />
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <TextInput
                                        style={[styles.input, { flex: 1, marginBottom: 10 }]}
                                        placeholder="Durasi (menit)"
                                        keyboardType="numeric"
                                        value={l?.duration?.toString()}
                                        onChangeText={t => updateLesson(i, 'duration', t)}
                                    />
                                </View>
                                <TextInput
                                    style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                                    placeholder="Deskripsi / Konten Singkat..."
                                    multiline
                                    value={l.content}
                                    onChangeText={t => updateLesson(i, 'content', t)}
                                />
                            </View>
                        ))}
                        <View style={{ height: 100 }} />
                    </ScrollView>
                </View>
            </Modal>
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

    tabs: { flexDirection: 'row', padding: 15, gap: 10 },
    tab: {
        flex: 1, padding: 12, borderRadius: 10, alignItems: 'center',
        backgroundColor: '#f0e6dd', borderWidth: 1, borderColor: 'transparent'
    },
    activeTab: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    tabText: { fontWeight: '600', color: '#8d7861' },
    activeTabText: { color: '#fff' },

    // Card
    card: {
        flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12,
        padding: 10, marginBottom: 12, ...SHADOWS.small
    },
    cardImage: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#eee' },
    cardContent: { flex: 1, marginLeft: 12, justifyContent: 'center' },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    cardDesc: { fontSize: 12, color: '#666', marginTop: 4 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    cardBadge: { fontSize: 10, color: COLORS.primary, backgroundColor: '#f0e6dd', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    actionButtons: { flexDirection: 'row', gap: 8 },
    iconBtn: { padding: 6, borderRadius: 6, backgroundColor: '#f3f4f6' },

    // Empty
    emptyState: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#999', marginTop: 10 },

    // FAB
    fab: {
        position: 'absolute', bottom: 30, right: 30,
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: COLORS.primary,
        alignItems: 'center', justifyContent: 'center',
        ...SHADOWS.medium
    },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, minHeight: 500 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },

    formContent: { gap: 12 },
    label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 4 },
    input: {
        borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
        padding: 12, fontSize: 14, backgroundColor: '#f9f9f9'
    },
    row: { flexDirection: 'row', gap: 10 },
    chip: { padding: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
    activeChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    chipText: { color: '#666' },
    activeChipText: { color: '#fff' },

    submitBtn: {
        backgroundColor: COLORS.primary, padding: 16, borderRadius: 12,
        alignItems: 'center', marginTop: 20
    },
    submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    // Image Picker
    imagePickerBtn: {
        width: '100%', height: 150, backgroundColor: '#f9f9f9',
        borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
        borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
    },
    imagePreview: { width: '100%', height: '100%' },
    imagePlaceholder: { alignItems: 'center' },
    imagePlaceholderText: { marginTop: 8, color: '#999' },
    cardDate: { fontSize: 11, color: '#888', marginTop: 4, marginBottom: 4 },

    // Quiz Styles
    quizCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, ...SHADOWS.small },
    radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#ddd', alignItems: 'center', justifyContent: 'center' },
    radioActive: { borderColor: COLORS.primary },
    radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },
});

export default EducationManagementScreen;
