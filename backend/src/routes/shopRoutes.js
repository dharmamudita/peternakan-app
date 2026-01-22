/**
 * Shop Routes
 */
const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const { authenticate, adminOnly } = require('../middlewares');

// User Routes
router.post('/register', authenticate, shopController.registerShop);
router.get('/my', authenticate, shopController.getMyShop);

// Admin Routes
router.get('/pending', authenticate, adminOnly, shopController.getPendingShops);
router.put('/:id/verify', authenticate, adminOnly, shopController.verifyShop);

// Public Routes (Authenticated)
router.get('/:id/reviews', authenticate, shopController.getShopReviews);
router.get('/user/:userId', authenticate, shopController.getShopByUserId);
router.get('/:id', authenticate, shopController.getShopById);

module.exports = router;
