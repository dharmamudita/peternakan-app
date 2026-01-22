/**
 * UserProgress Model
 * Model untuk tracking progress belajar pengguna
 */

const { db } = require('../config/firebase');
const { COLLECTIONS } = require('../config/constants');

class UserProgress {
    constructor(data) {
        this.id = data.id || null;
        this.userId = data.userId || '';
        this.courseId = data.courseId || '';
        this.completedLessons = data.completedLessons || []; // Array of lesson IDs
        this.completedModules = data.completedModules || []; // Array of module IDs
        this.currentLessonId = data.currentLessonId || null;
        this.progressPercentage = data.progressPercentage || 0;
        this.totalTimeSpent = data.totalTimeSpent || 0; // dalam menit
        this.lastAccessedAt = data.lastAccessedAt || null;
        this.quizScores = data.quizScores || {}; // { quizId: score }
        this.notes = data.notes || []; // Array of { lessonId, note, createdAt }
        this.bookmarks = data.bookmarks || []; // Array of lesson IDs
        this.isCompleted = data.isCompleted || false;
        this.completedAt = data.completedAt || null;
        this.certificateId = data.certificateId || null;
        this.enrolledAt = data.enrolledAt || new Date();
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            courseId: this.courseId,
            completedLessons: this.completedLessons,
            completedModules: this.completedModules,
            currentLessonId: this.currentLessonId,
            progressPercentage: this.progressPercentage,
            totalTimeSpent: this.totalTimeSpent,
            lastAccessedAt: this.lastAccessedAt,
            quizScores: this.quizScores,
            notes: this.notes,
            bookmarks: this.bookmarks,
            isCompleted: this.isCompleted,
            completedAt: this.completedAt,
            certificateId: this.certificateId,
            enrolledAt: this.enrolledAt,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    toFirestore() {
        const data = this.toJSON();
        delete data.id;
        return data;
    }

    static async enroll(userId, courseId) {
        // Check if already enrolled
        const existing = await UserProgress.getByUserAndCourse(userId, courseId);
        if (existing) return existing;

        const progress = new UserProgress({
            userId,
            courseId,
            enrolledAt: new Date(),
        });

        const docRef = await db.collection(COLLECTIONS.USER_PROGRESS).add(progress.toFirestore());
        progress.id = docRef.id;

        // Increment course enrollment count
        const Course = require('./Course');
        await Course.incrementEnrollment(courseId);

        return progress;
    }

    static async getById(id) {
        const doc = await db.collection(COLLECTIONS.USER_PROGRESS).doc(id).get();
        if (!doc.exists) return null;
        return new UserProgress({ id: doc.id, ...doc.data() });
    }

    static async getByUserAndCourse(userId, courseId) {
        const snapshot = await db.collection(COLLECTIONS.USER_PROGRESS)
            .where('userId', '==', userId)
            .where('courseId', '==', courseId)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return new UserProgress({ id: doc.id, ...doc.data() });
    }

    static async getByUserId(userId, page = 1, limit = 10) {
        let query = db.collection(COLLECTIONS.USER_PROGRESS)
            .where('userId', '==', userId);

        const countSnapshot = await query.get();
        const total = countSnapshot.size;

        query = query
            .offset((page - 1) * limit)
            .limit(limit);

        const snapshot = await query.get();
        const progresses = snapshot.docs.map(doc => new UserProgress({ id: doc.id, ...doc.data() }));

        return {
            data: progresses,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    static async completeLesson(userId, courseId, lessonId, timeSpent = 0) {
        const progress = await UserProgress.getByUserAndCourse(userId, courseId);
        if (!progress) return null;

        const completedLessons = progress.completedLessons || [];
        if (!completedLessons.includes(lessonId)) {
            completedLessons.push(lessonId);
        }

        await db.collection(COLLECTIONS.USER_PROGRESS).doc(progress.id).update({
            completedLessons,
            currentLessonId: lessonId,
            totalTimeSpent: progress.totalTimeSpent + timeSpent,
            lastAccessedAt: new Date(),
            updatedAt: new Date(),
        });

        return await UserProgress.getByUserAndCourse(userId, courseId);
    }

    static async updateProgress(id, progressPercentage, totalLessons) {
        const progress = await UserProgress.getById(id);
        if (!progress) return null;

        const updateData = {
            progressPercentage,
            updatedAt: new Date(),
        };

        // Mark as completed if 100%
        if (progressPercentage >= 100) {
            updateData.isCompleted = true;
            updateData.completedAt = new Date();
        }

        await db.collection(COLLECTIONS.USER_PROGRESS).doc(id).update(updateData);
        return await UserProgress.getById(id);
    }

    static async saveQuizScore(userId, courseId, quizId, score) {
        let progress = await UserProgress.getByUserAndCourse(userId, courseId);

        // Auto-enroll if not enrolled yet
        if (!progress) {
            progress = await UserProgress.enroll(userId, courseId);
        }

        const quizScores = progress.quizScores || {};
        quizScores[quizId] = {
            score,
            completedAt: new Date(),
            attempts: (quizScores[quizId]?.attempts || 0) + 1,
        };

        // Calculate progress: Quiz completed = 100% for now (can be extended for multiple lessons)
        const progressPercentage = score >= 70 ? 100 : Math.max(progress.progressPercentage || 0, 50);
        const isCompleted = score >= 70;

        await db.collection(COLLECTIONS.USER_PROGRESS).doc(progress.id).update({
            quizScores,
            progressPercentage,
            isCompleted,
            completedAt: isCompleted ? new Date() : null,
            lastAccessedAt: new Date(),
            updatedAt: new Date(),
        });

        return await UserProgress.getByUserAndCourse(userId, courseId);
    }

    static async addNote(userId, courseId, lessonId, note) {
        const progress = await UserProgress.getByUserAndCourse(userId, courseId);
        if (!progress) return null;

        const notes = progress.notes || [];
        notes.push({
            lessonId,
            note,
            createdAt: new Date(),
        });

        await db.collection(COLLECTIONS.USER_PROGRESS).doc(progress.id).update({
            notes,
            updatedAt: new Date(),
        });

        return await UserProgress.getByUserAndCourse(userId, courseId);
    }

    static async toggleBookmark(userId, courseId, lessonId) {
        const progress = await UserProgress.getByUserAndCourse(userId, courseId);
        if (!progress) return null;

        let bookmarks = progress.bookmarks || [];

        if (bookmarks.includes(lessonId)) {
            bookmarks = bookmarks.filter(id => id !== lessonId);
        } else {
            bookmarks.push(lessonId);
        }

        await db.collection(COLLECTIONS.USER_PROGRESS).doc(progress.id).update({
            bookmarks,
            updatedAt: new Date(),
        });

        return await UserProgress.getByUserAndCourse(userId, courseId);
    }

    static async getUserStats(userId) {
        const snapshot = await db.collection(COLLECTIONS.USER_PROGRESS)
            .where('userId', '==', userId)
            .get();

        const stats = {
            totalEnrolled: snapshot.size,
            completed: 0,
            inProgress: 0,
            totalTimeSpent: 0,
            averageProgress: 0,
        };

        let totalProgress = 0;

        snapshot.docs.forEach(doc => {
            const progress = doc.data();
            if (progress.isCompleted) {
                stats.completed++;
            } else {
                stats.inProgress++;
            }
            stats.totalTimeSpent += progress.totalTimeSpent || 0;
            totalProgress += progress.progressPercentage || 0;
        });

        stats.averageProgress = snapshot.size > 0 ? Math.round(totalProgress / snapshot.size) : 0;

        return stats;
    }
}

module.exports = UserProgress;
