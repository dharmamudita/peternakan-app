/**
 * Animal Routes
 * Routes untuk manajemen hewan (standalone)
 */

const express = require('express');
const router = express.Router();
const { farmController } = require('../controllers');
const { authenticate, farmerOnly } = require('../middlewares');

// Get animal by ID
router.get('/:id', farmController.getAnimalById);

// Protected routes
router.put('/:id', authenticate, farmerOnly, farmController.updateAnimal);
router.delete('/:id', authenticate, farmerOnly, farmController.deleteAnimal);

// Health records for animal
router.get('/:animalId/health-records', authenticate, farmController.getHealthRecords);
router.post('/:animalId/health-records', authenticate, farmerOnly, farmController.addHealthRecord);

module.exports = router;
