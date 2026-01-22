/**
 * Education Routes
 * Routes untuk dashboard dan statistik edukasi
 */

const express = require('express');
const router = express.Router();
const { educationController } = require('../controllers');
const { authenticate } = require('../middlewares');

// All routes require authentication
router.use(authenticate);

// Middleware
const { adminOnly } = require('../middlewares');

// ==================== DASHBOARD & STATS ====================
router.get('/dashboard', educationController.getDashboard);
router.get('/stats', educationController.getUserStats);

// ==================== MATERIALS ====================
router.get('/materials', educationController.getAllMaterials);
router.get('/materials/featured', educationController.getFeaturedMaterials);
router.get('/materials/popular', educationController.getPopularMaterials);
router.get('/materials/animal/:animalType', educationController.getMaterialsByAnimalType);
router.get('/materials/:id', educationController.getMaterialById);
router.get('/materials/slug/:slug', educationController.getMaterialBySlug);
router.post('/materials/:id/like', educationController.likeMaterial);
router.delete('/materials/:id/like', educationController.unlikeMaterial);

// Admin Only Routes for Materials
router.post('/materials', adminOnly, educationController.createMaterial);
router.put('/materials/:id', adminOnly, educationController.updateMaterial);
router.put('/materials/:id/publish', adminOnly, educationController.publishMaterial);
router.delete('/materials/:id', adminOnly, educationController.deleteMaterial);

// ==================== COURSES ====================
router.get('/courses', educationController.getAllCourses);
router.get('/courses/featured', educationController.getFeaturedCourses);
router.get('/courses/popular', educationController.getPopularCourses);
router.get('/courses/my', educationController.getMyCourses); // Enrolled or Created by me
router.get('/courses/enrolled', educationController.getEnrolledCourses);
router.get('/courses/:id', educationController.getCourseById);
router.get('/courses/slug/:slug', educationController.getCourseBySlug);

// User/Instructor Action
router.post('/courses/:courseId/enroll', educationController.enrollCourse);
router.get('/courses/:courseId/progress', educationController.getCourseProgress);
router.post('/courses/:courseId/lessons/:lessonId/complete', educationController.completeLesson);
router.post('/courses/:courseId/quizzes/:quizId/score', educationController.saveQuizScore);

// Admin/Instructor Only Routes for Courses
router.post('/courses', adminOnly, educationController.createCourse);
router.put('/courses/:id', adminOnly, educationController.updateCourse);
router.put('/courses/:id/publish', adminOnly, educationController.publishCourse);
router.put('/courses/:id/archive', adminOnly, educationController.archiveCourse);
router.delete('/courses/:id', adminOnly, educationController.deleteCourse);

module.exports = router;
