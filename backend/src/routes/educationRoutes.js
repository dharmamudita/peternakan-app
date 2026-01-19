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

router.get('/dashboard', educationController.getDashboard);
router.get('/stats', educationController.getUserStats);

module.exports = router;
