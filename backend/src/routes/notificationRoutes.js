const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate, adminOnly } = require('../middlewares');

// All routes require authentication
router.use(authenticate);

// User Routes
router.get('/', notificationController.getMyNotifications);
router.put('/:id/read', notificationController.markAsRead);

// Admin Routes
router.post('/broadcast', adminOnly, notificationController.sendBroadcast);

module.exports = router;
