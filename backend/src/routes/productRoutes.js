/**
 * Product Routes
 * Routes untuk produk marketplace
 */

const express = require('express');
const router = express.Router();
const { marketplaceController } = require('../controllers');
const { authenticate, sellerOnly, optionalAuth, validate, schemas } = require('../middlewares');

// Public routes
router.get('/', marketplaceController.getAllProducts);
router.get('/featured', marketplaceController.getFeaturedProducts);
router.get('/best-sellers', marketplaceController.getBestSellers);
router.get('/search', marketplaceController.searchProducts);
router.get('/slug/:slug', marketplaceController.getProductBySlug);
router.get('/:id', marketplaceController.getProductById);

// Protected routes - Seller
router.get('/seller/my', authenticate, sellerOnly, marketplaceController.getMyProducts);
router.post('/', authenticate, validate(schemas.createProduct), marketplaceController.createProduct);
router.put('/:id', authenticate, sellerOnly, marketplaceController.updateProduct);
router.put('/:id/publish', authenticate, sellerOnly, marketplaceController.publishProduct);
router.put('/:id/stock', authenticate, sellerOnly, marketplaceController.updateStock);
router.delete('/:id', authenticate, sellerOnly, marketplaceController.deleteProduct);

module.exports = router;
