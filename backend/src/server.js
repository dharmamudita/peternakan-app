/**
 * Peternakan App Backend Server
 * Main entry point untuk aplikasi backend
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARES ====================

// CORS configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// Parse JSON body
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded body
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
        next();
    });
}

// ==================== ROUTES ====================

// API routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to Peternakan App API',
        version: '1.0.0',
        documentation: '/api',
    });
});

// ==================== ERROR HANDLING ====================

// 404 Handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ==================== START SERVER ====================

const startServer = async () => {
    try {
        // Initialize Firebase (already done in config/firebase.js when imported)
        require('./config/firebase');

        app.listen(PORT, () => {
            console.log('========================================');
            console.log('🐄 Peternakan App Backend Server');
            console.log('========================================');
            console.log(`📍 Server running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📅 Started at: ${new Date().toLocaleString('id-ID')}`);
            console.log('========================================');
            console.log('Available endpoints:');
            console.log('  - GET  /api              : API info');
            console.log('  - GET  /api/health       : Health check');
            console.log('  - *    /api/auth         : Authentication');
            console.log('  - *    /api/farms        : Farm management');
            console.log('  - *    /api/animals      : Animal management');
            console.log('  - *    /api/products     : Marketplace products');
            console.log('  - *    /api/cart         : Shopping cart');
            console.log('  - *    /api/orders       : Orders');
            console.log('  - *    /api/courses      : Education courses');
            console.log('  - *    /api/materials    : Education materials');
            console.log('  - *    /api/education    : Education dashboard');
            console.log('  - *    /api/upload       : File upload');
            console.log('========================================');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('👋 SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;
