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
     * Prediksi kesehatan hewan
     * POST /api/ai/predict/health
     * 
     * Body:
     * {
     *   umur_bulan: number,
     *   berat_kg: number,
     *   suhu_celcius: number,
     *   nafsu_makan: 'normal' | 'sedikit_menurun' | 'menurun' | 'tidak_mau',
     *   aktivitas: 'aktif' | 'normal' | 'lesu' | 'sangat_lesu',
     *   riwayat_sakit: 'ya' | 'tidak',
     *   vaksinasi_lengkap: 'ya' | 'tidak',
     *   jenis_hewan: 'sapi' | 'kambing' | 'ayam'
     * }
     */
    static async predictHealth(req, res) {
        try {
            const data = req.body;

            // Validate required field
            if (!data.jenis_hewan) {
                return res.status(400).json({
                    success: false,
                    error: 'Jenis hewan wajib diisi'
                });
            }

            // Call ML Service
            const result = await AIService.predictHealth(data);

            res.status(200).json({
                success: true,
                data: result.data || result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Deteksi penyakit dari gambar
     * POST /api/ai/predict/disease
     * 
     * Body (multipart/form-data):
     * - image: File
     * 
     * OR Body (JSON):
     * {
     *   image: base64_string
     * }
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
