/**
 * Cart Routes
 * Routes untuk keranjang belanja
 */

const express = require('express');
const router = express.Router();
const { marketplaceController } = require('../controllers');
const { authenticate } = require('../middlewares');

// All cart routes require authentication
router.use(authenticate);

router.get('/', marketplaceController.getCart);
router.post('/items', marketplaceController.addToCart);
router.put('/items/:productId', marketplaceController.updateCartItem);
router.delete('/items/:productId', marketplaceController.removeFromCart);
router.delete('/', marketplaceController.clearCart);

module.exports = router;
