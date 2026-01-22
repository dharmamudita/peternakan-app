/**
 * Order Routes
 * Routes untuk pesanan
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, sellerOnly } = require('../middlewares');

// All order routes require authentication
router.use(authenticate);

/**
 * BUYER ROUTES
 */
// Create order (buy now)
router.post('/create', orderController.createOrder);

// Get my orders
router.get('/my', orderController.getMyOrders);

// Get order detail
router.get('/:id', orderController.getOrderDetail);

// Confirm receipt
router.put('/:id/confirm-receipt', orderController.confirmReceipt);

// Add review
router.post('/:id/review', orderController.addReview);

/**
 * SELLER ROUTES
 */
// Get seller orders
router.get('/seller/list', sellerOnly, orderController.getSellerOrders);

// Confirm order (start processing)
router.put('/:id/confirm', sellerOnly, orderController.confirmOrder);

// Ship order
router.put('/:id/ship', sellerOnly, orderController.shipOrder);

module.exports = router;
