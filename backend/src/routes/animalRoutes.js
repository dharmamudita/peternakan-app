/**
 * Animal Routes
 * Routes untuk manajemen hewan
 */

const express = require('express');
const router = express.Router();
const { farmController } = require('../controllers');
const { authenticate } = require('../middlewares');

// Protected routes - require authentication
router.use(authenticate);

// Get my animals (user's animals)
router.get('/my', farmController.getMyAnimals);

// Get my animal stats
router.get('/stats', farmController.getMyAnimalStats);
router.get('/debug', farmController.debugAnimals);

// Create animal
router.post('/', farmController.createAnimal);

// Get animal by ID
router.get('/:id', farmController.getAnimalById);

// Update animal
router.put('/:id', farmController.updateAnimal);

// Delete animal
router.delete('/:id', farmController.deleteAnimal);

// Health records for animal
router.get('/:animalId/health-records', farmController.getHealthRecords);
router.post('/:animalId/health-records', farmController.addHealthRecord);

module.exports = router;
