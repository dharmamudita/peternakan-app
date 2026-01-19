/**
 * Course Routes
 * Routes untuk kursus edukasi
 */

const express = require('express');
const router = express.Router();
const { educationController } = require('../controllers');
const { authenticate, instructorOnly, optionalAuth, validate, schemas } = require('../middlewares');

// Public routes
router.get('/', educationController.getAllCourses);
router.get('/featured', educationController.getFeaturedCourses);
router.get('/popular', educationController.getPopularCourses);
router.get('/slug/:slug', educationController.getCourseBySlug);
router.get('/:id', educationController.getCourseById);

// Protected routes - Instructor
router.get('/instructor/my', authenticate, instructorOnly, educationController.getMyCourses);
router.post('/', authenticate, validate(schemas.createCourse), educationController.createCourse);
router.put('/:id', authenticate, instructorOnly, educationController.updateCourse);
router.put('/:id/publish', authenticate, instructorOnly, educationController.publishCourse);
router.put('/:id/archive', authenticate, instructorOnly, educationController.archiveCourse);
router.delete('/:id', authenticate, instructorOnly, educationController.deleteCourse);

// Protected routes - User (enrollment & progress)
router.get('/user/enrolled', authenticate, educationController.getEnrolledCourses);
router.post('/:courseId/enroll', authenticate, educationController.enrollCourse);
router.get('/:courseId/progress', authenticate, educationController.getCourseProgress);
router.post('/:courseId/lessons/:lessonId/complete', authenticate, educationController.completeLesson);
router.post('/:courseId/lessons/:lessonId/notes', authenticate, educationController.addNote);
router.post('/:courseId/lessons/:lessonId/bookmark', authenticate, educationController.toggleBookmark);
router.post('/:courseId/quizzes/:quizId/score', authenticate, educationController.saveQuizScore);

module.exports = router;
