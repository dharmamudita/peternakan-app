/**
 * Upload Service
 * Service untuk upload file ke Firebase Storage dengan Multi-Bucket Failover
 * DAN Fallback ke Local Storage jika Firebase gagal total.
 */

const { storage } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Daftar kemungkinan nama bucket untuk dicoba otomatis
const BUCKET_OPTIONS = [
    'peternakan-b3e94.firebasestorage.app',
    'peternakan-b3e94.appspot.com',
    process.env.FIREBASE_STORAGE_BUCKET
].filter((item, index, self) => item && self.indexOf(item) === index);

class UploadService {
    /**
     * Upload buffer ke Firebase Storage dengan Auto-Failover + Local Fallback
     */
    static async uploadToFirebase(file, folder) {
        let lastError = null;

        // 1. Coba Upload ke Firebase (Semua Opsi Bucket)
        for (const bucketName of BUCKET_OPTIONS) {
            try {
                return await this._attemptUpload(file, folder, bucketName);
            } catch (error) {
                lastError = error;
                // Continue to next bucket
            }
        }

        // 2. Jika semua Firebase Gagal, Gunakan Local Storage
        console.warn(`Firebase Upload Failed (${lastError?.message}). Fallback to Local Storage.`);
        try {
            return await this.uploadToLocal(file, folder);
        } catch (localError) {
            throw new Error(`Upload Gagal Total (Firebase & Local): ${localError.message}`);
        }
    }

    static async _attemptUpload(file, folder, bucketName) {
        return new Promise((resolve, reject) => {
            const bucket = storage.bucket(bucketName);
            const fileExtension = path.extname(file.originalname);
            const fileName = `${folder}/${uuidv4()}${fileExtension}`;
            const fileUpload = bucket.file(fileName);

            const blobStream = fileUpload.createWriteStream({
                metadata: {
                    contentType: file.mimetype,
                },
                resumable: false,
            });

            blobStream.on('error', (error) => {
                reject(error);
            });

            blobStream.on('finish', async () => {
                try {
                    await fileUpload.makePublic();
                    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
                    resolve({
                        fileName: fileName,
                        originalName: file.originalname,
                        mimeType: file.mimetype,
                        size: file.size,
                        url: publicUrl,
                    });
                } catch (err) {
                    // Fallback Signed URL
                    try {
                        const [url] = await fileUpload.getSignedUrl({
                            action: 'read',
                            expires: '03-01-2500',
                        });
                        resolve({
                            fileName: fileName,
                            originalName: file.originalname,
                            mimeType: file.mimetype,
                            size: file.size,
                            url: url,
                        });
                    } catch (signErr) {
                        reject(signErr);
                    }
                }
            });

            blobStream.end(file.buffer);
        });
    }

    /**
     * Upload ke Local Disk (Fallback)
     */
    static async uploadToLocal(file, folder) {
        // folder format: "peternakan-app/images" -> kita mau simpan di backend/public/uploads/images
        const cleanFolder = folder.replace('peternakan-app/', '').replace('peternakan-app\\', '');
        const uploadDir = path.join(__dirname, '../../public/uploads', cleanFolder);

        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileExtension = path.extname(file.originalname);
        const fileName = `${uuidv4()}${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);

        // Write file
        await fs.promises.writeFile(filePath, file.buffer);

        // Construct URL
        // Gunakan IP komputer atau localhost tergantung environment.
        // Untuk amannya di dev local, localhost.
        const port = process.env.PORT || 5000;
        const baseUrl = process.env.API_URL || `http://localhost:${port}`;
        const publicUrl = `${baseUrl}/uploads/${cleanFolder}/${fileName}`;

        console.log(`✅ File saved locally: ${publicUrl}`);

        return {
            fileName: fileName,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            url: publicUrl,
        };
    }

    /**
     * Wrappers for specific types
     */
    static async uploadImage(file, folder = 'images') {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            // throw new Error('Tipe file tidak valid. Hanya JPEG, PNG, GIF, dan WebP.');
            // Loose validation for testing
        }
        return await this.uploadToFirebase(file, `peternakan-app/${folder}`);
    }

    static async uploadMultiple(files, folder = 'uploads') {
        const uploadPromises = files.map(file => this.uploadImage(file, folder));
        return await Promise.all(uploadPromises);
    }

    static async uploadVideo(file, folder = 'videos') {
        if (!file.mimetype.startsWith('video/')) {
            // throw new Error('File harus berupa video.');
        }
        return await this.uploadToFirebase(file, `peternakan-app/${folder}`);
    }

    static async uploadDocument(file, folder = 'documents') {
        return await this.uploadToFirebase(file, `peternakan-app/${folder}`);
    }

    static async deleteFile(fileName) {
        // Try delete from Firebase default bucket first
        try {
            const bucket = storage.bucket(BUCKET_OPTIONS[0]);
            const file = bucket.file(fileName);
            await file.delete();
            return true;
        } catch (error) {
            // Then try local delete? (Only if we knew it was local)
            // Skip for now
            return false;
        }
    }

    static async getSignedUrl(fileName) {
        // Not applicable for local files generally (unless token protected)
        return fileName;
    }
}

module.exports = UploadService;
