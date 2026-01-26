/**
 * Shop Routes
 */
const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const { authenticate, adminOnly } = require('../middlewares');
const { db } = require('../config/firebase');

// Debug endpoint to list ALL shops (temporary for debugging)
router.get('/debug/all', async (req, res) => {
    try {
        const snapshot = await db.collection('shops').get();
        const shops = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json({ success: true, count: shops.length, data: shops });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Debug: Auto Verify All Pending Shops
router.get('/debug/verify-all', async (req, res) => {
    try {
        const snapshot = await db.collection('shops').where('status', '==', 'PENDING').get();
        const batch = db.batch();
        let count = 0;

        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, { status: 'VERIFIED' });
            count++;
        });

        if (count > 0) await batch.commit();

        res.json({ success: true, message: `Verified ${count} pending shops` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Debug: Delete All Products (Clean Slate)
router.get('/debug/clear-products', async (req, res) => {
    try {
        const snapshot = await db.collection('products').get();
        const batch = db.batch();

        if (snapshot.empty) {
            return res.json({ success: true, message: 'No products to delete' });
        }

        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        res.json({ success: true, message: `Deleted ${snapshot.size} products` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Debug endpoint to delete a shop (temporary for debugging)
router.delete('/debug/:id', async (req, res) => {
    try {
        await db.collection('shops').doc(req.params.id).delete();
        res.json({ success: true, message: 'Shop deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

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
