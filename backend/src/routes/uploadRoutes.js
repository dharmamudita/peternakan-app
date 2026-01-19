/**
 * Upload Routes
 * Routes untuk upload file
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadController } = require('../controllers');
const { authenticate } = require('../middlewares');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max
    },
});

// All upload routes require authentication
router.use(authenticate);

// Single file uploads
router.post('/image', upload.single('file'), uploadController.uploadImage);
router.post('/video', upload.single('file'), uploadController.uploadVideo);
router.post('/document', upload.single('file'), uploadController.uploadDocument);

// Multiple file upload
router.post('/images', upload.array('files', 10), uploadController.uploadImages);

// Delete and get signed URL
router.delete('/:fileName', uploadController.deleteFile);
router.get('/signed-url/:fileName', uploadController.getSignedUrl);

module.exports = router;
