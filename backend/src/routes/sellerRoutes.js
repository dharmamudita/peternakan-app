/**
 * Seller Routes
 * Routes untuk fitur penjual
 */
const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const { authenticate, sellerOnly } = require('../middlewares');

// All routes require authentication and seller role
router.use(authenticate);
router.use(sellerOnly);

// Statistics
router.get('/stats', sellerController.getSellerStats);

// Orders
router.get('/orders', sellerController.getSellerOrders);
router.get('/orders/recent', sellerController.getRecentOrders);

// Revenue
router.get('/revenue', sellerController.getRevenueSummary);

// Reviews
router.get('/reviews', sellerController.getSellerReviews);

module.exports = router;
