const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, adminOnly } = require('../middlewares');

// All routes require authentication
router.use(authenticate);

// User Routes
router.post('/', reportController.createReport);
router.get('/my', reportController.getMyReports);

// Admin Routes
router.get('/admin/all', adminOnly, reportController.getAllReports);
router.put('/:id/respond', adminOnly, reportController.respondToReport);

module.exports = router;
