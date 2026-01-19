/**
 * Upload Service
 * Service untuk upload file ke Cloudinary (Free Cloud Storage)
 */

const cloudinary = require('cloudinary').v2;
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

class UploadService {
    /**
     * Upload file ke Cloudinary dari buffer
     */
    static async uploadFile(file, folder = 'uploads') {
        try {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: `peternakan-app/${folder}`,
                        public_id: uuidv4(),
                        resource_type: 'auto',
                    },
                    (error, result) => {
                        if (error) {
                            reject(new Error(`Upload gagal: ${error.message}`));
                        } else {
                            resolve({
                                publicId: result.public_id,
                                fileName: result.original_filename,
                                originalName: file.originalname,
                                mimeType: file.mimetype || result.format,
                                size: result.bytes,
                                url: result.secure_url,
                                width: result.width,
                                height: result.height,
                                format: result.format,
                            });
                        }
                    }
                );

                // Pipe buffer ke upload stream
                const bufferStream = require('stream').Readable.from(file.buffer);
                bufferStream.pipe(uploadStream);
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Upload multiple files
     */
    static async uploadMultiple(files, folder = 'uploads') {
        try {
            const uploadPromises = files.map(file => this.uploadFile(file, folder));
            return await Promise.all(uploadPromises);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Upload image dengan validasi
     */
    static async uploadImage(file, folder = 'images') {
        try {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

            if (!allowedTypes.includes(file.mimetype)) {
                throw new Error('Tipe file tidak valid. Hanya JPEG, PNG, GIF, dan WebP yang diizinkan.');
            }

            const maxSize = 10 * 1024 * 1024; // 10MB (Cloudinary free tier)
            if (file.size > maxSize) {
                throw new Error('Ukuran file terlalu besar. Maksimal 10MB.');
            }

            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: `peternakan-app/${folder}`,
                        public_id: uuidv4(),
                        resource_type: 'image',
                        transformation: [
                            { quality: 'auto:good' },
                            { fetch_format: 'auto' }
                        ]
                    },
                    (error, result) => {
                        if (error) {
                            reject(new Error(`Upload gagal: ${error.message}`));
                        } else {
                            resolve({
                                publicId: result.public_id,
                                fileName: result.original_filename,
                                originalName: file.originalname,
                                mimeType: file.mimetype,
                                size: result.bytes,
                                url: result.secure_url,
                                width: result.width,
                                height: result.height,
                                format: result.format,
                                thumbnail: cloudinary.url(result.public_id, {
                                    width: 200,
                                    height: 200,
                                    crop: 'thumb',
                                    quality: 'auto',
                                }),
                            });
                        }
                    }
                );

                const bufferStream = require('stream').Readable.from(file.buffer);
                bufferStream.pipe(uploadStream);
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Upload video dengan validasi
     */
    static async uploadVideo(file, folder = 'videos') {
        try {
            const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

            if (!allowedTypes.includes(file.mimetype)) {
                throw new Error('Tipe file tidak valid. Hanya MP4, WebM, OGG, dan MOV yang diizinkan.');
            }

            const maxSize = 100 * 1024 * 1024; // 100MB
            if (file.size > maxSize) {
                throw new Error('Ukuran file terlalu besar. Maksimal 100MB.');
            }

            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: `peternakan-app/${folder}`,
                        public_id: uuidv4(),
                        resource_type: 'video',
                        eager: [
                            { format: 'mp4', quality: 'auto' }
                        ],
                        eager_async: true,
                    },
                    (error, result) => {
                        if (error) {
                            reject(new Error(`Upload gagal: ${error.message}`));
                        } else {
                            resolve({
                                publicId: result.public_id,
                                fileName: result.original_filename,
                                originalName: file.originalname,
                                mimeType: file.mimetype,
                                size: result.bytes,
                                url: result.secure_url,
                                duration: result.duration,
                                width: result.width,
                                height: result.height,
                                format: result.format,
                                thumbnail: cloudinary.url(result.public_id, {
                                    resource_type: 'video',
                                    format: 'jpg',
                                    transformation: [{ width: 300, crop: 'scale' }]
                                }),
                            });
                        }
                    }
                );

                const bufferStream = require('stream').Readable.from(file.buffer);
                bufferStream.pipe(uploadStream);
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Upload document dengan validasi
     */
    static async uploadDocument(file, folder = 'documents') {
        try {
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ];

            if (!allowedTypes.includes(file.mimetype)) {
                throw new Error('Tipe file tidak valid. Hanya PDF, DOC, DOCX, XLS, dan XLSX yang diizinkan.');
            }

            const maxSize = 20 * 1024 * 1024; // 20MB
            if (file.size > maxSize) {
                throw new Error('Ukuran file terlalu besar. Maksimal 20MB.');
            }

            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: `peternakan-app/${folder}`,
                        public_id: uuidv4(),
                        resource_type: 'raw',
                    },
                    (error, result) => {
                        if (error) {
                            reject(new Error(`Upload gagal: ${error.message}`));
                        } else {
                            resolve({
                                publicId: result.public_id,
                                fileName: result.original_filename,
                                originalName: file.originalname,
                                mimeType: file.mimetype,
                                size: result.bytes,
                                url: result.secure_url,
                                format: result.format,
                            });
                        }
                    }
                );

                const bufferStream = require('stream').Readable.from(file.buffer);
                bufferStream.pipe(uploadStream);
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete file dari Cloudinary
     */
    static async deleteFile(publicId, resourceType = 'image') {
        try {
            const result = await cloudinary.uploader.destroy(publicId, {
                resource_type: resourceType,
            });

            if (result.result !== 'ok' && result.result !== 'not found') {
                throw new Error('Gagal menghapus file');
            }

            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete multiple files
     */
    static async deleteMultiple(publicIds, resourceType = 'image') {
        try {
            const result = await cloudinary.api.delete_resources(publicIds, {
                resource_type: resourceType,
            });
            return result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get optimized URL dengan transformasi
     */
    static getOptimizedUrl(publicId, options = {}) {
        const defaultOptions = {
            quality: 'auto',
            fetch_format: 'auto',
            ...options,
        };
        return cloudinary.url(publicId, defaultOptions);
    }

    /**
     * Get thumbnail URL
     */
    static getThumbnailUrl(publicId, width = 200, height = 200) {
        return cloudinary.url(publicId, {
            width,
            height,
            crop: 'thumb',
            quality: 'auto',
        });
    }

    /**
     * Upload dari URL
     */
    static async uploadFromUrl(url, folder = 'uploads') {
        try {
            const result = await cloudinary.uploader.upload(url, {
                folder: `peternakan-app/${folder}`,
                public_id: uuidv4(),
            });

            return {
                publicId: result.public_id,
                url: result.secure_url,
                width: result.width,
                height: result.height,
                format: result.format,
                size: result.bytes,
            };
        } catch (error) {
            throw new Error(`Upload dari URL gagal: ${error.message}`);
        }
    }
}

module.exports = UploadService;
