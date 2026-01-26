/**
 * Education Controller
 * Controller untuk fitur edukasi
 */

const { EducationService } = require('../services');
const { asyncHandler } = require('../middlewares');
const { success, created, badRequest, notFound } = require('../utils/responseHelper');
const { parsePagination, parseFilters } = require('../utils/helpers');

// ==================== COURSES ====================

/**
 * Create course
 * POST /api/courses
 */
const createCourse = asyncHandler(async (req, res) => {
    const course = await EducationService.createCourse(req.user.id, req.body);
    return created(res, course.toJSON(), 'Kursus berhasil dibuat');
});

/**
 * Get all courses
 * GET /api/courses
 */
const getAllCourses = asyncHandler(async (req, res) => {
    const { page, limit } = parsePagination(req.query);
    const filters = parseFilters(req.query, [
        'category', 'difficulty', 'isFree', 'isFeatured',
        'instructorId', 'status', 'sortBy', 'sortOrder'
    ]);

    const result = await EducationService.getAllCourses(page, limit, filters);

    return res.status(200).json({
        success: true,
        message: 'Kursus berhasil diambil',
        data: result.data.map(c => c.toJSON()),
        pagination: result.pagination,
    });
});

/**
 * Get course by ID
 * GET /api/courses/:id
 */
const getCourseById = asyncHandler(async (req, res) => {
    const course = await EducationService.getCourseById(req.params.id);
    return success(res, course.toJSON(), 'Kursus berhasil diambil');
});

/**
 * Get course by slug
 * GET /api/courses/slug/:slug
 */
const getCourseBySlug = asyncHandler(async (req, res) => {
    const course = await EducationService.getCourseBySlug(req.params.slug);
    return success(res, course.toJSON(), 'Kursus berhasil diambil');
});

/**
 * Get featured courses
 * GET /api/courses/featured
 */
const getFeaturedCourses = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 6;
    const courses = await EducationService.getFeaturedCourses(limit);
    return success(res, courses.map(c => c.toJSON()), 'Kursus featured berhasil diambil');
});

/**
 * Get popular courses
 * GET /api/courses/popular
 */
const getPopularCourses = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 6;
    const courses = await EducationService.getPopularCourses(limit);
    return success(res, courses.map(c => c.toJSON()), 'Kursus populer berhasil diambil');
});

/**
 * Get my courses (instructor)
 * GET /api/courses/my
 */
const getMyCourses = asyncHandler(async (req, res) => {
    const { page, limit } = parsePagination(req.query);
    const filters = { ...parseFilters(req.query, ['status']), instructorId: req.user.id };

    const result = await EducationService.getAllCourses(page, limit, filters);

    return res.status(200).json({
        success: true,
        message: 'Kursus berhasil diambil',
        data: result.data.map(c => c.toJSON()),
        pagination: result.pagination,
    });
});

/**
 * Update course
 * PUT /api/courses/:id
 */
const updateCourse = asyncHandler(async (req, res) => {
    const course = await EducationService.updateCourse(req.params.id, req.user.id, req.body);
    return success(res, course.toJSON(), 'Kursus berhasil diperbarui');
});

/**
 * Publish course
 * PUT /api/courses/:id/publish
 */
const publishCourse = asyncHandler(async (req, res) => {
    const course = await EducationService.publishCourse(req.params.id, req.user.id);
    return success(res, course.toJSON(), 'Kursus berhasil dipublish');
});

/**
 * Archive course
 * PUT /api/courses/:id/archive
 */
const archiveCourse = asyncHandler(async (req, res) => {
    const course = await EducationService.archiveCourse(req.params.id, req.user.id);
    return success(res, course.toJSON(), 'Kursus berhasil diarsipkan');
});

/**
 * Delete course
 * DELETE /api/courses/:id
 */
const deleteCourse = asyncHandler(async (req, res) => {
    await EducationService.deleteCourse(req.params.id, req.user.id);
    return success(res, null, 'Kursus berhasil dihapus');
});

// ==================== MATERIALS ====================

/**
 * Create material
 * POST /api/materials
 */
const createMaterial = asyncHandler(async (req, res) => {
    const material = await EducationService.createMaterial(req.user.id, req.body);
    return created(res, material.toJSON(), 'Materi berhasil dibuat');
});

/**
 * Get all materials
 * GET /api/materials
 */
const getAllMaterials = asyncHandler(async (req, res) => {
    const { page, limit } = parsePagination(req.query);
    const filters = parseFilters(req.query, [
        'type', 'categoryId', 'difficulty', 'isFeatured',
        'isPremium', 'authorId', 'isPublished', 'sortBy', 'sortOrder'
    ]);

    const result = await EducationService.getAllMaterials(page, limit, filters);

    return res.status(200).json({
        success: true,
        message: 'Materi berhasil diambil',
        data: result.data.map(m => m.toJSON()),
        pagination: result.pagination,
    });
});

/**
 * Get material by ID
 * GET /api/materials/:id
 */
const getMaterialById = asyncHandler(async (req, res) => {
    const material = await EducationService.getMaterialById(req.params.id, true);
    return success(res, material.toJSON(), 'Materi berhasil diambil');
});

/**
 * Get material by slug
 * GET /api/materials/slug/:slug
 */
const getMaterialBySlug = asyncHandler(async (req, res) => {
    const material = await EducationService.getMaterialBySlug(req.params.slug);
    return success(res, material.toJSON(), 'Materi berhasil diambil');
});

/**
 * Get materials by animal type
 * GET /api/materials/animal/:animalType
 */
const getMaterialsByAnimalType = asyncHandler(async (req, res) => {
    const { page, limit } = parsePagination(req.query);
    const result = await EducationService.getMaterialsByAnimalType(req.params.animalType, page, limit);

    return res.status(200).json({
        success: true,
        message: 'Materi berhasil diambil',
        data: result.data.map(m => m.toJSON()),
        pagination: result.pagination,
    });
});

/**
 * Get featured materials
 * GET /api/materials/featured
 */
const getFeaturedMaterials = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 6;
    const materials = await EducationService.getFeaturedMaterials(limit);
    return success(res, materials.map(m => m.toJSON()), 'Materi featured berhasil diambil');
});

/**
 * Get popular materials
 * GET /api/materials/popular
 */
const getPopularMaterials = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 6;
    const materials = await EducationService.getPopularMaterials(limit);
    return success(res, materials.map(m => m.toJSON()), 'Materi populer berhasil diambil');
});

/**
 * Update material
 * PUT /api/materials/:id
 */
const updateMaterial = asyncHandler(async (req, res) => {
    const material = await EducationService.updateMaterial(req.params.id, req.user.id, req.body);
    return success(res, material.toJSON(), 'Materi berhasil diperbarui');
});

/**
 * Publish material
 * PUT /api/materials/:id/publish
 */
const publishMaterial = asyncHandler(async (req, res) => {
    const material = await EducationService.publishMaterial(req.params.id, req.user.id);
    return success(res, material.toJSON(), 'Materi berhasil dipublish');
});

/**
 * Like material
 * POST /api/materials/:id/like
 */
const likeMaterial = asyncHandler(async (req, res) => {
    const material = await EducationService.likeMaterial(req.params.id);
    return success(res, material.toJSON(), 'Materi berhasil dilike');
});

/**
 * Unlike material
 * DELETE /api/materials/:id/like
 */
const unlikeMaterial = asyncHandler(async (req, res) => {
    const material = await EducationService.unlikeMaterial(req.params.id);
    return success(res, material.toJSON(), 'Like berhasil dihapus');
});

/**
 * Delete material
 * DELETE /api/materials/:id
 */
const deleteMaterial = asyncHandler(async (req, res) => {
    await EducationService.deleteMaterial(req.params.id, req.user.id);
    return success(res, null, 'Materi berhasil dihapus');
});

// ==================== USER PROGRESS ====================

/**
 * Enroll to course
 * POST /api/courses/:courseId/enroll
 */
const enrollCourse = asyncHandler(async (req, res) => {
    const progress = await EducationService.enrollCourse(req.user.id, req.params.courseId);
    return created(res, progress.toJSON(), 'Berhasil mendaftar ke kursus');
});

/**
 * Get my enrolled courses
 * GET /api/courses/enrolled
 */
const getEnrolledCourses = asyncHandler(async (req, res) => {
    const { page, limit } = parsePagination(req.query);
    const result = await EducationService.getUserCourses(req.user.id, page, limit);

    return res.status(200).json({
        success: true,
        message: 'Kursus berhasil diambil',
        data: result.data.map(p => p.toJSON()),
        pagination: result.pagination,
    });
});

/**
 * Get course progress
 * GET /api/courses/:courseId/progress
 */
const getCourseProgress = asyncHandler(async (req, res) => {
    const progress = await EducationService.getUserProgress(req.user.id, req.params.courseId);
    return success(res, progress, 'Progress berhasil diambil');
});

/**
 * Complete lesson
 * POST /api/courses/:courseId/lessons/:lessonId/complete
 */
const completeLesson = asyncHandler(async (req, res) => {
    const { timeSpent } = req.body;
    const progress = await EducationService.completeLesson(
        req.user.id,
        req.params.courseId,
        req.params.lessonId,
        timeSpent || 0
    );
    return success(res, progress.toJSON(), 'Lesson berhasil diselesaikan');
});

/**
 * Save quiz score
 * POST /api/courses/:courseId/quizzes/:quizId/score
 */
const saveQuizScore = asyncHandler(async (req, res) => {
    const { score } = req.body;

    if (score === undefined) {
        return badRequest(res, 'Score wajib diisi');
    }

    const progress = await EducationService.saveQuizScore(
        req.user.id,
        req.params.courseId,
        req.params.quizId,
        score
    );
    return success(res, progress.toJSON(), 'Score berhasil disimpan');
});

/**
 * Add note
 * POST /api/courses/:courseId/lessons/:lessonId/notes
 */
const addNote = asyncHandler(async (req, res) => {
    const { note } = req.body;

    if (!note) {
        return badRequest(res, 'Note wajib diisi');
    }

    const progress = await EducationService.addNote(
        req.user.id,
        req.params.courseId,
        req.params.lessonId,
        note
    );
    return success(res, progress.toJSON(), 'Catatan berhasil ditambahkan');
});

/**
 * Toggle bookmark
 * POST /api/courses/:courseId/lessons/:lessonId/bookmark
 */
const toggleBookmark = asyncHandler(async (req, res) => {
    const progress = await EducationService.toggleBookmark(
        req.user.id,
        req.params.courseId,
        req.params.lessonId
    );
    return success(res, progress.toJSON(), 'Bookmark berhasil diubah');
});

/**
 * Get user learning stats
 * GET /api/education/stats
 */
const getUserStats = asyncHandler(async (req, res) => {
    const stats = await EducationService.getUserStats(req.user.id);
    return success(res, stats, 'Statistik berhasil diambil');
});

/**
 * Get education dashboard
 * GET /api/education/dashboard
 */
const getDashboard = asyncHandler(async (req, res) => {
    const data = await EducationService.getDashboardData(req.user.id);
    return success(res, data, 'Dashboard berhasil diambil');
});

module.exports = {
    // Courses
    createCourse,
    getAllCourses,
    getCourseById,
    getCourseBySlug,
    getFeaturedCourses,
    getPopularCourses,
    getMyCourses,
    updateCourse,
    publishCourse,
    archiveCourse,
    deleteCourse,
    // Materials
    createMaterial,
    getAllMaterials,
    getMaterialById,
    getMaterialBySlug,
    getMaterialsByAnimalType,
    getFeaturedMaterials,
    getPopularMaterials,
    updateMaterial,
    publishMaterial,
    likeMaterial,
    unlikeMaterial,
    deleteMaterial,
    // Progress
    enrollCourse,
    getEnrolledCourses,
    getCourseProgress,
    completeLesson,
    saveQuizScore,
    addNote,
    toggleBookmark,
    getUserStats,
    getDashboard,
};
