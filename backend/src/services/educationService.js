/**
 * Education Service
 * Service untuk fitur edukasi (kursus, materi, progress)
 */

const Course = require('../models/Course');
const Material = require('../models/Material');
const UserProgress = require('../models/UserProgress');
const User = require('../models/User');
const { COURSE_STATUS, USER_ROLES } = require('../config/constants');

class EducationService {
    // ==================== COURSES ====================

    /**
     * Membuat kursus baru
     */
    static async createCourse(instructorId, courseData) {
        try {
            // Update role user menjadi instructor jika belum
            const user = await User.getById(instructorId);
            if (user && user.role === USER_ROLES.USER) {
                await User.update(instructorId, { role: USER_ROLES.INSTRUCTOR });
            }

            const course = await Course.create({
                ...courseData,
                instructorId,
                status: COURSE_STATUS.PUBLISHED, // Auto-publish for admin
            });

            return course;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan kursus berdasarkan ID
     */
    static async getCourseById(courseId) {
        try {
            const course = await Course.getById(courseId);
            if (!course) {
                throw new Error('Kursus tidak ditemukan');
            }
            return course;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan kursus berdasarkan slug
     */
    static async getCourseBySlug(slug) {
        try {
            const course = await Course.getBySlug(slug);
            if (!course) {
                throw new Error('Kursus tidak ditemukan');
            }
            return course;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan semua kursus
     */
    static async getAllCourses(page = 1, limit = 10, filters = {}) {
        try {
            return await Course.getAll(page, limit, filters);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan kursus featured
     */
    static async getFeaturedCourses(limit = 6) {
        try {
            return await Course.getFeaturedCourses(limit);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan kursus populer
     */
    static async getPopularCourses(limit = 6) {
        try {
            return await Course.getPopularCourses(limit);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update kursus
     */
    static async updateCourse(courseId, instructorId, updateData) {
        try {
            const course = await Course.getById(courseId);

            if (!course) {
                throw new Error('Kursus tidak ditemukan');
            }

            if (course.instructorId !== instructorId) {
                throw new Error('Anda tidak memiliki akses ke kursus ini');
            }

            return await Course.update(courseId, updateData);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Publish kursus
     */
    static async publishCourse(courseId, instructorId) {
        try {
            const course = await Course.getById(courseId);

            if (!course) {
                throw new Error('Kursus tidak ditemukan');
            }

            if (course.instructorId !== instructorId) {
                throw new Error('Anda tidak memiliki akses ke kursus ini');
            }

            return await Course.publish(courseId);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Archive kursus
     */
    static async archiveCourse(courseId, instructorId) {
        try {
            const course = await Course.getById(courseId);

            if (!course) {
                throw new Error('Kursus tidak ditemukan');
            }

            if (course.instructorId !== instructorId) {
                throw new Error('Anda tidak memiliki akses ke kursus ini');
            }

            return await Course.archive(courseId);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Hapus kursus
     */
    static async deleteCourse(courseId, instructorId) {
        try {
            const course = await Course.getById(courseId);

            if (!course) {
                throw new Error('Kursus tidak ditemukan');
            }

            if (course.instructorId !== instructorId) {
                throw new Error('Anda tidak memiliki akses ke kursus ini');
            }

            await Course.delete(courseId);
            return true;
        } catch (error) {
            throw error;
        }
    }

    // ==================== MATERIALS ====================

    /**
     * Membuat materi baru
     */
    static async createMaterial(authorId, materialData) {
        try {
            const material = await Material.create({
                ...materialData,
                authorId,
                isPublished: true, // Auto-publish for admin
            });

            return material;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan materi berdasarkan ID
     */
    static async getMaterialById(materialId, incrementViews = false) {
        try {
            const material = await Material.getById(materialId);
            if (!material) {
                throw new Error('Materi tidak ditemukan');
            }

            if (incrementViews) {
                await Material.incrementViews(materialId);
            }

            return material;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan materi berdasarkan slug
     */
    static async getMaterialBySlug(slug) {
        try {
            const material = await Material.getBySlug(slug);
            if (!material) {
                throw new Error('Materi tidak ditemukan');
            }

            await Material.incrementViews(material.id);
            return material;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan semua materi
     */
    static async getAllMaterials(page = 1, limit = 10, filters = {}) {
        try {
            return await Material.getAll(page, limit, filters);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan materi berdasarkan jenis hewan
     */
    static async getMaterialsByAnimalType(animalType, page = 1, limit = 10) {
        try {
            return await Material.getByAnimalType(animalType, page, limit);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan materi featured
     */
    static async getFeaturedMaterials(limit = 6) {
        try {
            return await Material.getFeaturedMaterials(limit);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan materi populer
     */
    static async getPopularMaterials(limit = 6) {
        try {
            return await Material.getPopularMaterials(limit);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update materi
     */
    static async updateMaterial(materialId, authorId, updateData) {
        try {
            const material = await Material.getById(materialId);

            if (!material) {
                throw new Error('Materi tidak ditemukan');
            }

            if (material.authorId !== authorId) {
                throw new Error('Anda tidak memiliki akses ke materi ini');
            }

            return await Material.update(materialId, updateData);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Publish materi
     */
    static async publishMaterial(materialId, authorId) {
        try {
            const material = await Material.getById(materialId);

            if (!material) {
                throw new Error('Materi tidak ditemukan');
            }

            if (material.authorId !== authorId) {
                throw new Error('Anda tidak memiliki akses ke materi ini');
            }

            return await Material.publish(materialId);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Like materi
     */
    static async likeMaterial(materialId) {
        try {
            await Material.incrementLikes(materialId);
            return await Material.getById(materialId);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Unlike materi
     */
    static async unlikeMaterial(materialId) {
        try {
            await Material.decrementLikes(materialId);
            return await Material.getById(materialId);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Hapus materi
     */
    static async deleteMaterial(materialId, authorId) {
        try {
            const material = await Material.getById(materialId);

            if (!material) {
                throw new Error('Materi tidak ditemukan');
            }

            if (material.authorId !== authorId) {
                throw new Error('Anda tidak memiliki akses ke materi ini');
            }

            await Material.delete(materialId);
            return true;
        } catch (error) {
            throw error;
        }
    }

    // ==================== USER PROGRESS ====================

    /**
     * Enroll ke kursus
     */
    static async enrollCourse(userId, courseId) {
        try {
            const course = await Course.getById(courseId);

            if (!course) {
                throw new Error('Kursus tidak ditemukan');
            }

            if (course.status !== COURSE_STATUS.PUBLISHED) {
                throw new Error('Kursus tidak tersedia');
            }

            // TODO: Cek pembayaran jika kursus berbayar

            return await UserProgress.enroll(userId, courseId);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan progress user di kursus
     */
    static async getUserProgress(userId, courseId) {
        try {
            const progress = await UserProgress.getByUserAndCourse(userId, courseId);

            // If not found, return a default "not enrolled" object instead of error
            // This prevents 500 errors in frontend when checking status
            if (!progress) {
                return {
                    userId,
                    courseId,
                    enrolled: false,
                    progress: 0,
                    completedLessons: [],
                    isCompleted: false
                };
            }

            return { ...progress.toJSON(), enrolled: true };
        } catch (error) {
            console.error('Get progress error:', error);
            // Return safe default instead of crashing
            return {
                userId,
                courseId,
                enrolled: false,
                progress: 0
            };
        }
    }

    /**
     * Mendapatkan semua kursus yang diikuti user
     */
    static async getUserCourses(userId, page = 1, limit = 10) {
        try {
            return await UserProgress.getByUserId(userId, page, limit);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Menyelesaikan lesson
     */
    static async completeLesson(userId, courseId, lessonId, timeSpent = 0) {
        try {
            return await UserProgress.completeLesson(userId, courseId, lessonId, timeSpent);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Menyimpan skor quiz
     */
    static async saveQuizScore(userId, courseId, quizId, score) {
        try {
            return await UserProgress.saveQuizScore(userId, courseId, quizId, score);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Menambah catatan
     */
    static async addNote(userId, courseId, lessonId, note) {
        try {
            return await UserProgress.addNote(userId, courseId, lessonId, note);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Toggle bookmark lesson
     */
    static async toggleBookmark(userId, courseId, lessonId) {
        try {
            return await UserProgress.toggleBookmark(userId, courseId, lessonId);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan statistik belajar user
     */
    static async getUserStats(userId) {
        try {
            return await UserProgress.getUserStats(userId);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mendapatkan data dashboard edukasi
     */
    static async getDashboardData(userId) {
        try {
            const userStats = await UserProgress.getUserStats(userId);
            const featuredCourses = await Course.getFeaturedCourses(4);
            const popularMaterials = await Material.getPopularMaterials(4);
            const userCourses = await UserProgress.getByUserId(userId, 1, 4);

            return {
                stats: userStats,
                featuredCourses,
                popularMaterials,
                enrolledCourses: userCourses.data,
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = EducationService;
