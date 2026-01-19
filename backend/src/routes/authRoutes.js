/**
 * Auth Routes
 * Routes untuk autentikasi dan manajemen user
 */

const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { authenticate, adminOnly, validate, schemas } = require('../middlewares');

// Public routes
router.post('/register', validate(schemas.register), authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleAuth);
router.post('/facebook', authController.facebookAuth);
router.post('/forgot-password', authController.forgotPassword);

// Protected routes
router.get('/me', authenticate, authController.getProfile);
router.put('/me', authenticate, authController.updateProfile);

// Admin routes
router.get('/users', authenticate, adminOnly, authController.getAllUsers);
router.get('/users/:id', authenticate, adminOnly, authController.getUserById);
router.put('/users/:id/role', authenticate, adminOnly, authController.updateUserRole);
router.put('/users/:id/deactivate', authenticate, adminOnly, authController.deactivateUser);
router.put('/users/:id/activate', authenticate, adminOnly, authController.activateUser);
router.delete('/users/:id', authenticate, adminOnly, authController.deleteUser);

module.exports = router;
