/**
 * Order Routes
 * Routes untuk pesanan
 */

const express = require('express');
const router = express.Router();
const { marketplaceController } = require('../controllers');
const { authenticate, sellerOnly, validate, schemas } = require('../middlewares');

// All order routes require authentication
router.use(authenticate);

// Buyer routes
router.get('/my', marketplaceController.getMyOrders);
router.post('/', validate(schemas.createOrder), marketplaceController.createOrder);
router.get('/number/:orderNumber', marketplaceController.getOrderByNumber);
router.put('/:id/cancel', marketplaceController.cancelOrder);

// Seller routes
router.get('/seller', sellerOnly, marketplaceController.getSellerOrders);
router.get('/stats', sellerOnly, marketplaceController.getOrderStats);
router.put('/:id/status', sellerOnly, marketplaceController.updateOrderStatus);
router.put('/:id/confirm-payment', sellerOnly, marketplaceController.confirmPayment);

// Get order by ID (buyer or seller)
router.get('/:id', marketplaceController.getOrderById);

module.exports = router;
