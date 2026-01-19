/**
 * Farm Routes
 * Routes untuk manajemen peternakan
 */

const express = require('express');
const router = express.Router();
const { farmController } = require('../controllers');
const { authenticate, farmerOnly, validate, schemas } = require('../middlewares');

// ==================== FARMS ====================

// Public routes
router.get('/', farmController.getAllFarms);
router.get('/:id', farmController.getFarmById);
router.get('/:id/dashboard', farmController.getFarmDashboard);

// Protected routes
router.post('/', authenticate, validate(schemas.createFarm), farmController.createFarm);
router.get('/user/my', authenticate, farmController.getMyFarms);
router.put('/:id', authenticate, farmerOnly, farmController.updateFarm);
router.delete('/:id', authenticate, farmerOnly, farmController.deleteFarm);

// ==================== ANIMALS (nested under farms) ====================

router.get('/:farmId/animals', farmController.getAnimals);
router.get('/:farmId/animals/stats', farmController.getAnimalStats);
router.post('/:farmId/animals', authenticate, farmerOnly, validate(schemas.createAnimal), farmController.addAnimal);

// ==================== HEALTH RECORDS (nested under farms) ====================

router.get('/:farmId/health-records', authenticate, farmController.getFarmHealthRecords);
router.get('/:farmId/health-records/follow-ups', authenticate, farmController.getUpcomingFollowUps);

module.exports = router;
