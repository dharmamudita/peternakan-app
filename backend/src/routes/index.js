/**
 * Routes Index
 * Menggabungkan semua routes
 */

const express = require('express');
const router = express.Router();

// Import all routes
const authRoutes = require('./authRoutes');
const farmRoutes = require('./farmRoutes');
const animalRoutes = require('./animalRoutes');
const productRoutes = require('./productRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const courseRoutes = require('./courseRoutes');
const materialRoutes = require('./materialRoutes');
const educationRoutes = require('./educationRoutes');
const uploadRoutes = require('./uploadRoutes');
const notificationRoutes = require('./notificationRoutes');

// Health check
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// API info
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Peternakan App API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            farms: '/api/farms',
            animals: '/api/animals',
            products: '/api/products',
            cart: '/api/cart',
            orders: '/api/orders',
            courses: '/api/courses',
            materials: '/api/materials',
            education: '/api/education',
            upload: '/api/upload',
            ai: '/api/ai',
        },
    });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/farms', farmRoutes);
router.use('/animals', animalRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/courses', courseRoutes);
router.use('/materials', materialRoutes);
router.use('/education', educationRoutes);
router.use('/upload', uploadRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', require('./reportRoutes'));
router.use('/shops', require('./shopRoutes'));
router.use('/seller', require('./sellerRoutes'));
router.use('/stats', require('./statsRoutes'));
router.use('/ai', require('./aiRoutes'));
router.use('/addresses', require('./addressRoutes'));

module.exports = router;
