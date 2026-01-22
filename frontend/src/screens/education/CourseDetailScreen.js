/**
 * Course Detail Screen
 * Halaman untuk melihat detail kursus dan mengerjakan quiz
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Modal,
    Alert,
    Platform,
    RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { courseApi } from '../../services/api';

const CourseDetailScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { courseId } = route.params || {};
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Quiz State
    const [quizModalVisible, setQuizModalVisible] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [userProgress, setUserProgress] = useState(null);
    const [savingQuiz, setSavingQuiz] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const [courseRes, progressRes] = await Promise.all([
                courseApi.getById(courseId),
                courseApi.getProgress(courseId).catch(() => ({ data: null }))
            ]);

            setCourse(courseRes.data || courseRes);
            setUserProgress(progressRes.data || null);
        } catch (err) {
            console.error('Error fetching course:', err);
            setError(err.message || 'Gagal memuat kursus');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        try {
            let dateObj;
            if (date._seconds) {
                dateObj = new Date(date._seconds * 1000);
            } else {
                dateObj = new Date(date);
            }
            if (isNaN(dateObj.getTime())) return '';

            return dateObj.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        } catch {
            return '';
        }
    };

    const showAlert = (title, message) => {
        if (Platform.OS === 'web') {
            window.alert(`${title}\n\n${message}`);
        } else {
            Alert.alert(title, message);
        }
    };

    // Quiz Functions
    const startQuiz = () => {
        if (!course?.quiz || course.quiz.length === 0) {
            showAlert('Info', 'Kursus ini belum memiliki soal kuis');
            return;
        }
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setQuizSubmitted(false);
        setQuizScore(0);
        setQuizModalVisible(true);
    };

    const selectAnswer = (questionIndex, optionIndex) => {
        if (quizSubmitted) return;
        setSelectedAnswers(prev => ({
            ...prev,
            [questionIndex]: optionIndex,
        }));
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < course.quiz.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchCourse();
        setRefreshing(false);
    }, [courseId]);

    const submitQuiz = async () => {
        let correctCount = 0;
        course.quiz.forEach((question, index) => {
            // Convert both to numbers to ensure proper comparison
            // Admin saves as 'answer', check both 'answer' and 'correctAnswer' for compatibility
            const userAnswer = Number(selectedAnswers[index]);
            const correctAnswer = Number(question.answer ?? question.correctAnswer);
            if (userAnswer === correctAnswer) {
                correctCount++;
            }
        });

        const score = Math.round((correctCount / course.quiz.length) * 100);
        setQuizScore(score);
        setQuizSubmitted(true);

        // Optimistic Update: Update UI immediately
        if (score >= 70) {
            setUserProgress(prev => ({
                ...prev,
                quizScores: {
                    ...(prev?.quizScores || {}),
                    'main_quiz': { score, completedAt: new Date().toISOString() }
                },
                progressPercentage: 100
            }));
        }

        // Save to backend
        try {
            setSavingQuiz(true);
            // Use a specific ID for the course quiz, e.g., 'main_quiz'
            await courseApi.saveQuizScore(courseId, 'main_quiz', score);

            // Refresh real data silently
            const progressRes = await courseApi.getProgress(courseId);
            setUserProgress(progressRes.data || null);

            if (score >= 70) {
                showAlert('Selamat!', 'Anda telah lulus kuis ini.');
            }
        } catch (err) {
            console.error('Error saving quiz score:', err);
            showAlert('Info', 'Nilai tersimpan lokal, tapi gagal sinkron ke server.');
        } finally {
            setSavingQuiz(false);
        }
    };

    const closeQuiz = () => {
        setQuizModalVisible(false);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setQuizSubmitted(false);
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Memuat kursus...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
                <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchCourse}>
                    <Text style={styles.retryText}>Coba Lagi</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const currentQuestion = course?.quiz?.[currentQuestionIndex];
    const answeredCount = Object.keys(selectedAnswers).length;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {course?.title || 'Detail Kursus'}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                }
            >
                {/* Thumbnail */}
                {course?.thumbnail ? (
                    <Image
                        source={{ uri: course.thumbnail }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                    />
                ) : (
                    <LinearGradient
                        colors={['#964b00', '#7c3f06']}
                        style={styles.thumbnailPlaceholder}
                    >
                        <Ionicons name="school" size={48} color="#fff" />
                    </LinearGradient>
                )}

                {/* Meta Info */}
                <View style={styles.metaContainer}>
                    <View style={styles.freeBadge}>
                        <Text style={styles.freeText}>Gratis</Text>
                    </View>
                    {course?.category && (
                        <Text style={styles.categoryText}>{course.category}</Text>
                    )}
                    {course?.difficulty && (
                        <Text style={styles.difficultyText}>{course.difficulty}</Text>
                    )}
                </View>

                {/* Title */}
                <Text style={styles.title}>{course?.title}</Text>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Ionicons name="calendar-outline" size={16} color="#9ca3af" />
                        <Text style={styles.statText}>{formatDate(course?.createdAt)}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="people-outline" size={16} color="#9ca3af" />
                        <Text style={styles.statText}>{course?.enrolledCount || 0} peserta</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="book-outline" size={16} color="#9ca3af" />
                        <Text style={styles.statText}>{course?.lessons?.length || 0} modul</Text>
                    </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Deskripsi</Text>
                    <Text style={styles.descriptionText}>
                        {course?.description || 'Tidak ada deskripsi tersedia.'}
                    </Text>
                </View>

                {/* Lessons */}
                {course?.lessons && course.lessons.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Modul Pembelajaran</Text>
                        {course.lessons.map((lesson, index) => (
                            <View key={index} style={styles.lessonCard}>
                                <View style={styles.lessonNumber}>
                                    <Text style={styles.lessonNumberText}>{index + 1}</Text>
                                </View>
                                <View style={styles.lessonContent}>
                                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                                    {lesson.duration && (
                                        <Text style={styles.lessonDuration}>{lesson.duration} menit</Text>
                                    )}
                                </View>
                                <Ionicons name="play-circle-outline" size={24} color="#964b00" />
                            </View>
                        ))}
                    </View>
                )}

                {/* Quiz Section */}
                {course?.quiz && course.quiz.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Kuis</Text>
                        <View style={styles.quizCard}>
                            <View style={styles.quizInfo}>
                                <Ionicons
                                    name={userProgress?.quizScores?.['main_quiz']?.score >= 70 ? "checkmark-circle" : "help-circle"}
                                    size={32}
                                    color={userProgress?.quizScores?.['main_quiz']?.score >= 70 ? "#10b981" : "#964b00"}
                                />
                                <View style={styles.quizTextContainer}>
                                    <Text style={styles.quizTitle}>Uji Pemahaman Anda</Text>
                                    <Text style={styles.quizSubtitle}>
                                        {course.quiz.length} soal tersedia
                                        {userProgress?.quizScores?.['main_quiz'] && (
                                            <Text style={{ color: userProgress.quizScores['main_quiz'].score >= 70 ? '#10b981' : '#f59e0b' }}>
                                                {' • '}Nilai: {userProgress.quizScores['main_quiz'].score}
                                            </Text>
                                        )}
                                    </Text>
                                </View>
                            </View>

                            {userProgress?.quizScores?.['main_quiz']?.score >= 70 ? (
                                <View style={styles.completedBadge}>
                                    <Text style={styles.completedText}>Selesai</Text>
                                    <Ionicons name="checkmark" size={16} color="#059669" />
                                </View>
                            ) : (
                                <TouchableOpacity style={styles.startQuizButton} onPress={startQuiz}>
                                    <Text style={styles.startQuizText}>
                                        {userProgress?.quizScores?.['main_quiz'] ? 'Ulangi Kuis' : 'Mulai Kuis'}
                                    </Text>
                                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}

                {/* Extra padding */}
                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Quiz Modal */}
            <Modal
                visible={quizModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={closeQuiz}
            >
                <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
                    {/* Modal Header */}
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={closeQuiz}>
                            <Ionicons name="close" size={28} color="#374151" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>
                            {quizSubmitted ? 'Hasil Kuis' : `Soal ${currentQuestionIndex + 1}/${course?.quiz?.length || 0}`}
                        </Text>
                        <View style={{ width: 28 }} />
                    </View>

                    {quizSubmitted ? (
                        /* Quiz Results */
                        <View style={styles.resultContainer}>
                            <View style={[
                                styles.scoreCircle,
                                { backgroundColor: quizScore >= 70 ? '#10b981' : '#ef4444' }
                            ]}>
                                <Text style={styles.scoreText}>{quizScore}%</Text>
                            </View>
                            <Text style={styles.resultTitle}>
                                {quizScore >= 70 ? 'Selamat! 🎉' : 'Perlu Belajar Lagi'}
                            </Text>
                            <Text style={styles.resultSubtitle}>
                                Anda menjawab benar {Math.round(quizScore * (course?.quiz?.length || 0) / 100)} dari {course?.quiz?.length || 0} soal
                            </Text>
                            <TouchableOpacity style={styles.closeResultButton} onPress={closeQuiz}>
                                <Text style={styles.closeResultText}>Tutup</Text>
                            </TouchableOpacity>
                        </View>
                    ) : currentQuestion ? (
                        /* Quiz Question */
                        <ScrollView style={styles.quizContent}>
                            {/* Progress */}
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${((currentQuestionIndex + 1) / (course?.quiz?.length || 1)) * 100}%` }
                                    ]}
                                />
                            </View>

                            {/* Question */}
                            <Text style={styles.questionText}>{currentQuestion.question}</Text>

                            {/* Options */}
                            <View style={styles.optionsContainer}>
                                {currentQuestion.options?.map((option, optIndex) => (
                                    <TouchableOpacity
                                        key={optIndex}
                                        style={[
                                            styles.optionButton,
                                            selectedAnswers[currentQuestionIndex] === optIndex && styles.optionSelected
                                        ]}
                                        onPress={() => selectAnswer(currentQuestionIndex, optIndex)}
                                    >
                                        <View style={[
                                            styles.optionRadio,
                                            selectedAnswers[currentQuestionIndex] === optIndex && styles.optionRadioSelected
                                        ]}>
                                            {selectedAnswers[currentQuestionIndex] === optIndex && (
                                                <View style={styles.radioInner} />
                                            )}
                                        </View>
                                        <Text style={[
                                            styles.optionText,
                                            selectedAnswers[currentQuestionIndex] === optIndex && styles.optionTextSelected
                                        ]}>
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Navigation */}
                            <View style={styles.quizNavigation}>
                                <TouchableOpacity
                                    style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
                                    onPress={prevQuestion}
                                    disabled={currentQuestionIndex === 0}
                                >
                                    <Ionicons name="chevron-back" size={20} color={currentQuestionIndex === 0 ? '#ccc' : '#374151'} />
                                    <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.navButtonTextDisabled]}>
                                        Sebelumnya
                                    </Text>
                                </TouchableOpacity>

                                {currentQuestionIndex === (course?.quiz?.length || 0) - 1 ? (
                                    <TouchableOpacity
                                        style={[styles.submitButton, answeredCount < (course?.quiz?.length || 0) && styles.submitButtonDisabled]}
                                        onPress={submitQuiz}
                                        disabled={answeredCount < (course?.quiz?.length || 0)}
                                    >
                                        <Text style={styles.submitButtonText}>Selesai</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity style={styles.navButton} onPress={nextQuestion}>
                                        <Text style={styles.navButtonText}>Selanjutnya</Text>
                                        <Ionicons name="chevron-forward" size={20} color="#374151" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </ScrollView>
                    ) : null}
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6b7280',
    },
    errorText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.error,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    retryButton: {
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
    },
    retryText: {
        color: '#fff',
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.padding,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#faf8f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center',
        marginHorizontal: 8,
    },
    scrollContent: {
        padding: SIZES.padding,
    },
    thumbnail: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        marginBottom: 16,
    },
    thumbnailPlaceholder: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    freeBadge: {
        backgroundColor: '#d1fae5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    freeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#059669',
    },
    categoryText: {
        fontSize: 12,
        color: '#6b7280',
    },
    difficultyText: {
        fontSize: 12,
        color: '#9ca3af',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 12,
        lineHeight: 32,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 13,
        color: '#9ca3af',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 26,
    },
    lessonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#faf8f5',
        borderRadius: 12,
        marginBottom: 8,
    },
    lessonNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#964b00',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    lessonNumberText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    lessonContent: {
        flex: 1,
    },
    lessonTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    lessonDuration: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 2,
    },
    quizCard: {
        backgroundColor: '#fef3c7',
        borderRadius: 16,
        padding: 20,
    },
    quizInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    quizTextContainer: {
        marginLeft: 12,
    },
    quizTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#92400e',
    },
    quizSubtitle: {
        fontSize: 13,
        color: '#b45309',
        marginTop: 2,
    },
    startQuizButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#964b00',
        paddingVertical: 14,
        borderRadius: 12,
    },
    startQuizText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    quizContent: {
        flex: 1,
        padding: 20,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#f0f0f0',
        borderRadius: 3,
        marginBottom: 24,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#964b00',
        borderRadius: 3,
    },
    questionText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 24,
        lineHeight: 28,
    },
    optionsContainer: {
        gap: 12,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderRadius: 12,
    },
    optionSelected: {
        borderColor: '#964b00',
        backgroundColor: '#fef3c7',
    },
    optionRadio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#d1d5db',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionRadioSelected: {
        borderColor: '#964b00',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#964b00',
    },
    optionText: {
        flex: 1,
        fontSize: 15,
        color: '#374151',
    },
    optionTextSelected: {
        color: '#92400e',
        fontWeight: '600',
    },
    quizNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 32,
        paddingBottom: 20,
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 4,
    },
    navButtonDisabled: {
        opacity: 0.5,
    },
    navButtonText: {
        fontSize: 15,
        color: '#374151',
        fontWeight: '600',
    },
    navButtonTextDisabled: {
        color: '#ccc',
    },
    submitButton: {
        backgroundColor: '#964b00',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 12,
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#d1fae5',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    completedText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#059669',
    },
    submitButtonDisabled: {
        backgroundColor: '#d1d5db',
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
    // Result Styles
    resultContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    scoreCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    scoreText: {
        fontSize: 40,
        fontWeight: '800',
        color: '#fff',
    },
    resultTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    resultSubtitle: {
        fontSize: 15,
        color: '#6b7280',
        textAlign: 'center',
    },
    closeResultButton: {
        marginTop: 32,
        backgroundColor: '#964b00',
        paddingVertical: 14,
        paddingHorizontal: 48,
        borderRadius: 12,
    },
    closeResultText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
});

export default CourseDetailScreen;
