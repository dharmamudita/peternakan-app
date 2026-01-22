const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticate, adminOnly } = require('../middlewares');

// User Stats
router.get('/user', authenticate, statsController.getUserStats);

// Admin Stats
router.get('/admin', authenticate, adminOnly, statsController.getAdminStats);

module.exports = router;
