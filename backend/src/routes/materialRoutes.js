/**
 * Material Routes
 * Routes untuk materi edukasi
 */

const express = require('express');
const router = express.Router();
const { educationController } = require('../controllers');
const { authenticate, instructorOnly, optionalAuth, validate, schemas } = require('../middlewares');

// Public routes
router.get('/', educationController.getAllMaterials);
router.get('/featured', educationController.getFeaturedMaterials);
router.get('/popular', educationController.getPopularMaterials);
router.get('/animal/:animalType', educationController.getMaterialsByAnimalType);
router.get('/slug/:slug', educationController.getMaterialBySlug);
router.get('/:id', educationController.getMaterialById);

// Protected routes - Instructor/Author
router.post('/', authenticate, validate(schemas.createMaterial), educationController.createMaterial);
router.put('/:id', authenticate, educationController.updateMaterial);
router.put('/:id/publish', authenticate, educationController.publishMaterial);
router.delete('/:id', authenticate, educationController.deleteMaterial);

// Protected routes - User interactions
router.post('/:id/like', authenticate, educationController.likeMaterial);
router.delete('/:id/like', authenticate, educationController.unlikeMaterial);

module.exports = router;
