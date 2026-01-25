/**
 * AI Controller
 * Controller untuk fitur AI/ML (prediksi kesehatan & deteksi penyakit)
 */

const AIService = require('../services/aiService');

class AIController {
    /**
     * Health check untuk ML Service
     * GET /api/ai/health
     */
    static async checkHealth(req, res) {
        try {
            const status = await AIService.checkHealth();
            res.status(200).json({
                success: true,
                data: status
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Prediksi kesehatan hewan (Data Mining Enhanced)
     * POST /api/ai/predict/health
     */
    static async predictHealth(req, res) {
        try {
            const data = req.body;
            const HealthRecord = require('../models/HealthRecord');

            // Validate required field
            if (!data.jenis_hewan) {
                return res.status(400).json({
                    success: false,
                    error: 'Jenis hewan wajib diisi'
                });
            }

            // --- DATA MINING: Historical Context ---
            // Kita mengambil data histori untuk mencari pola/tren (Data Mining)
            let history = [];
            if (data.animalId) {
                console.log(`[Data Mining] Analyzing history for animal: ${data.animalId}`);
                const historyRes = await HealthRecord.getByAnimalId(data.animalId, 1, 10);
                if (historyRes && historyRes.data) {
                    history = historyRes.data.map(h => ({
                        date: h.recordDate,
                        temperature: h.temperature,
                        weight: h.weight
                    })).reverse(); // Dari terlama ke terbaru
                    console.log(`[Data Mining] Extracted ${history.length} data points for trend analysis`);
                }
            }

            // --- DATA MINING: Environmental Context ---
            // Integrasi variabel lingkungan yang mempengaruhi kesehatan (Heat Stress analysis)
            const environment = {
                lingkungan_temp: 31.5, // Mock data, bisa diintegrasikan dengan API cuaca
                kelembapan: 78
            };

            // Panggil ML Service dengan payload yang diperkaya
            const result = await AIService.predictHealth({
                ...data,
                ...environment,
                history: history
            });

            res.status(200).json({
                success: true,
                data: result.data || result
            });
        } catch (error) {
            console.error('[AI Controller] Error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Deteksi penyakit dari gambar (Hybrid AI Analysis)
     * POST /api/ai/predict/disease
     */
    static async detectDisease(req, res) {
        try {
            let imageData;
            let mimeType = 'image/jpeg';

            // Check for file upload (multer)
            if (req.file) {
                imageData = req.file.buffer;
                mimeType = req.file.mimetype;
            }
            // Check for base64 in body
            else if (req.body.image) {
                imageData = req.body.image;
            }
            else {
                return res.status(400).json({
                    success: false,
                    error: 'Gambar tidak ditemukan. Upload gambar untuk analisis.'
                });
            }

            // Call ML Service
            const result = await AIService.detectDisease(imageData, mimeType);

            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get status model ML
     * GET /api/ai/model/status
     */
    static async getModelStatus(req, res) {
        try {
            const status = await AIService.getModelStatus();
            res.status(200).json({
                success: true,
                data: status
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Train health model (Admin only)
     * POST /api/ai/train/health
     */
    static async trainHealthModel(req, res) {
        try {
            const { dataPath } = req.body;
            const result = await AIService.trainHealthModel(dataPath);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Train disease model (Admin only)
     * POST /api/ai/train/disease
     */
    static async trainDiseaseModel(req, res) {
        try {
            const options = req.body;
            const result = await AIService.trainDiseaseModel(options);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = AIController;
