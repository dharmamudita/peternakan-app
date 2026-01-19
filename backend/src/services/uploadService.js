/**
 * Upload Service
 * Service untuk upload file ke Firebase Storage
 */

const { storage } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

class UploadService {
    /**
     * Upload file ke Firebase Storage
     */
    static async uploadFile(file, folder = 'uploads') {
        try {
            const bucket = storage.bucket();
            const fileName = `${folder}/${uuidv4()}${path.extname(file.originalname)}`;
            const fileUpload = bucket.file(fileName);

            const blobStream = fileUpload.createWriteStream({
                metadata: {
                    contentType: file.mimetype,
                    metadata: {
                        firebaseStorageDownloadTokens: uuidv4(),
                    },
                },
            });

            return new Promise((resolve, reject) => {
                blobStream.on('error', (error) => {
                    reject(new Error(`Upload gagal: ${error.message}`));
                });

                blobStream.on('finish', async () => {
                    // Make file public
                    await fileUpload.makePublic();

                    // Get public URL
                    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

                    resolve({
                        fileName,
                        originalName: file.originalname,
                        mimeType: file.mimetype,
                        size: file.size,
                        url: publicUrl,
                    });
                });

                blobStream.end(file.buffer);
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

            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                throw new Error('Ukuran file terlalu besar. Maksimal 5MB.');
            }

            return await this.uploadFile(file, folder);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Upload video dengan validasi
     */
    static async uploadVideo(file, folder = 'videos') {
        try {
            const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];

            if (!allowedTypes.includes(file.mimetype)) {
                throw new Error('Tipe file tidak valid. Hanya MP4, WebM, dan OGG yang diizinkan.');
            }

            const maxSize = 100 * 1024 * 1024; // 100MB
            if (file.size > maxSize) {
                throw new Error('Ukuran file terlalu besar. Maksimal 100MB.');
            }

            return await this.uploadFile(file, folder);
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

            return await this.uploadFile(file, folder);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete file dari Firebase Storage
     */
    static async deleteFile(fileName) {
        try {
            const bucket = storage.bucket();
            const file = bucket.file(fileName);

            const [exists] = await file.exists();
            if (!exists) {
                throw new Error('File tidak ditemukan');
            }

            await file.delete();
            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete multiple files
     */
    static async deleteMultiple(fileNames) {
        try {
            const deletePromises = fileNames.map(fileName => this.deleteFile(fileName));
            await Promise.all(deletePromises);
            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get signed URL untuk file private
     */
    static async getSignedUrl(fileName, expiresInMinutes = 60) {
        try {
            const bucket = storage.bucket();
            const file = bucket.file(fileName);

            const [exists] = await file.exists();
            if (!exists) {
                throw new Error('File tidak ditemukan');
            }

            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + expiresInMinutes * 60 * 1000,
            });

            return url;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = UploadService;
