/**
 * AI Routes
 * Routes untuk fitur AI/ML
 */

const express = require('express');
const router = express.Router();
const AIController = require('../controllers/aiController');
const { authenticate } = require('../middlewares/authMiddleware');
const multer = require('multer');

// Configure multer for image upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('File harus berupa gambar'), false);
        }
    }
});

// Public routes
// GET /api/ai/health - Check ML service status
router.get('/health', AIController.checkHealth);

// Protected routes (require authentication)
// POST /api/ai/predict/health - Predict animal health
router.post('/predict/health', authenticate, AIController.predictHealth);

// POST /api/ai/predict/disease - Detect disease from image
router.post('/predict/disease', authenticate, upload.single('image'), AIController.detectDisease);

// GET /api/ai/model/status - Get model status
router.get('/model/status', authenticate, AIController.getModelStatus);

// Admin routes (for training models)
// POST /api/ai/train/health - Train health model
router.post('/train/health', authenticate, AIController.trainHealthModel);

// POST /api/ai/train/disease - Train disease model
router.post('/train/disease', authenticate, AIController.trainDiseaseModel);

module.exports = router;
