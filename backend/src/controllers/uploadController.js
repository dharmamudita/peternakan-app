/**
 * Upload Controller
 * Controller untuk upload file
 */

const { UploadService } = require('../services');
const { asyncHandler } = require('../middlewares');
const { success, badRequest } = require('../utils/responseHelper');

/**
 * Upload single image
 * POST /api/upload/image
 */
const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        return badRequest(res, 'File wajib diupload');
    }

    const folder = req.body.folder || 'images';
    const result = await UploadService.uploadImage(req.file, folder);

    return success(res, result, 'Gambar berhasil diupload');
});

/**
 * Upload multiple images
 * POST /api/upload/images
 */
const uploadImages = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return badRequest(res, 'File wajib diupload');
    }

    const folder = req.body.folder || 'images';
    const results = await UploadService.uploadMultiple(req.files, folder);

    return success(res, results, 'Gambar berhasil diupload');
});

/**
 * Upload video
 * POST /api/upload/video
 */
const uploadVideo = asyncHandler(async (req, res) => {
    if (!req.file) {
        return badRequest(res, 'File wajib diupload');
    }

    const folder = req.body.folder || 'videos';
    const result = await UploadService.uploadVideo(req.file, folder);

    return success(res, result, 'Video berhasil diupload');
});

/**
 * Upload document
 * POST /api/upload/document
 */
const uploadDocument = asyncHandler(async (req, res) => {
    if (!req.file) {
        return badRequest(res, 'File wajib diupload');
    }

    const folder = req.body.folder || 'documents';
    const result = await UploadService.uploadDocument(req.file, folder);

    return success(res, result, 'Dokumen berhasil diupload');
});

/**
 * Delete file
 * DELETE /api/upload/:fileName
 */
const deleteFile = asyncHandler(async (req, res) => {
    const { fileName } = req.params;

    if (!fileName) {
        return badRequest(res, 'Nama file wajib diisi');
    }

    await UploadService.deleteFile(fileName);
    return success(res, null, 'File berhasil dihapus');
});

/**
 * Get signed URL
 * GET /api/upload/signed-url/:fileName
 */
const getSignedUrl = asyncHandler(async (req, res) => {
    const { fileName } = req.params;
    const { expiresIn } = req.query;

    if (!fileName) {
        return badRequest(res, 'Nama file wajib diisi');
    }

    const url = await UploadService.getSignedUrl(fileName, parseInt(expiresIn) || 60);
    return success(res, { url }, 'Signed URL berhasil dibuat');
});

module.exports = {
    uploadImage,
    uploadImages,
    uploadVideo,
    uploadDocument,
    deleteFile,
    getSignedUrl,
};
