/**
 * AI Service
 * Service untuk berkomunikasi dengan ML Service Python
 */

const axios = require('axios');
const FormData = require('form-data');

// ML Service configuration
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

class AIService {
    /**
     * Check ML Service health
     */
    static async checkHealth() {
        try {
            const response = await axios.get(`${ML_SERVICE_URL}/`, {
                timeout: 5000
            });
            return {
                available: true,
                ...response.data
            };
        } catch (error) {
            return {
                available: false,
                error: 'ML Service tidak tersedia'
            };
        }
    }

    /**
     * Predict animal health status
     * @param {Object} data - Health parameters
     * @param {number} data.umur_bulan - Animal age in months
     * @param {number} data.berat_kg - Animal weight in kg
     * @param {number} data.suhu_celcius - Body temperature
     * @param {string} data.nafsu_makan - Appetite level
     * @param {string} data.aktivitas - Activity level
     * @param {string} data.riwayat_sakit - Previous illness history
     * @param {string} data.vaksinasi_lengkap - Vaccination status
     * @param {string} data.jenis_hewan - Animal type
     */
    static async predictHealth(data) {
        try {
            const response = await axios.post(
                `${ML_SERVICE_URL}/api/predict/health`,
                data,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 5000 // Short timeout to fallback quickly
                }
            );

            return response.data;
        } catch (error) {
            console.log('ML Service unavailable, using mock/fallback logic.');

            // --- FALLBACK LOGIC ---
            // Simple rule-based prediction so the app remains functional for demo

            const temp = parseFloat(data.suhu_celcius);
            const appetite = data.nafsu_makan; // normal, sedikit_menurun, menurun, tidak_mau
            const activity = data.aktivitas; // aktif, normal, lesu, sangat_lesu
            const history = data.riwayat_sakit; // ya, tidak

            let status = 'Sehat';
            let confidence = 0.95;
            let risk_score = 1;
            let color = '#10b981'; // Green
            let recommendations = [
                'Pertahankan pemberian pakan yang bergizi',
                'Pastikan akses air bersih selalu tersedia',
                'Lakukan pemeriksaan rutin mingguan'
            ];

            // Rule 1: Temperature check
            if (temp > 39.5) {
                status = 'Sakit (Demam)';
                confidence = 0.88;
                risk_score = 8;
                color = '#dc2626'; // Red
                recommendations = [
                    'Pisahkan hewan dari kawanan (karantina)',
                    'Kompres atau dinginkan tubuh hewan',
                    'Hubungi dokter hewan jika suhu tidak turun dalam 24 jam'
                ];
            } else if (temp < 37.5) {
                status = 'Sakit (Hipotermia)';
                confidence = 0.85;
                risk_score = 9;
                color = '#dc2626'; // Red
                recommendations = [
                    'Berikan selimut atau penghangat',
                    'Pastikan kandang kering dan hangat',
                    'Berikan minuman hangat'
                ];
            }

            // Rule 2: Appetite & Activity check
            if (status === 'Sehat' && (appetite === 'menurun' || appetite === 'tidak_mau')) {
                status = 'Kurang Sehat (Masalah Pencernaan)';
                confidence = 0.75;
                risk_score = 5;
                color = '#f59e0b'; // Orange
                recommendations = [
                    'Cek kualitas pakan',
                    'Berikan suplemen vitamin',
                    'Observasi feses ternak'
                ];
            }

            if (status === 'Sehat' && (activity === 'lesu' || activity === 'sangat_lesu')) {
                status = 'Kurang Sehat (Kelelahan/Stres)';
                confidence = 0.70;
                risk_score = 4;
                color = '#f59e0b'; // Orange
                recommendations = [
                    'Cek kondisi ventilasi kandang',
                    'Kurangi kepadatan kandang',
                    'Pastikan hewan cukup istirahat'
                ];
            }

            return {
                success: true,
                data: {
                    status: status,
                    confidence: Math.round(confidence * 100), // Convert to percentage
                    risk_score: risk_score,
                    color: color,
                    prediction: status === 'Sehat' ? 0 : 1,
                    recommendations: recommendations,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }

    /**
     * Detect disease from image
     * @param {Buffer|string} imageData - Image buffer or base64 string
     * @param {string} mimeType - Image MIME type (e.g., 'image/jpeg')
     */
    static async detectDisease(imageData, mimeType = 'image/jpeg') {
        try {
            let response;

            // If imageData is a Buffer, send as form data
            if (Buffer.isBuffer(imageData)) {
                const formData = new FormData();
                formData.append('image', imageData, {
                    filename: 'image.jpg',
                    contentType: mimeType
                });

                response = await axios.post(
                    `${ML_SERVICE_URL}/api/predict/disease`,
                    formData,
                    {
                        headers: formData.getHeaders(),
                        timeout: 60000
                    }
                );
            } else {
                // If imageData is base64 string
                response = await axios.post(
                    `${ML_SERVICE_URL}/api/predict/disease`,
                    { image: imageData },
                    {
                        headers: { 'Content-Type': 'application/json' },
                        timeout: 60000
                    }
                );
            }

            return response.data;
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                throw new Error('ML Service tidak dapat dihubungi. Pastikan service berjalan.');
            }
            throw new Error(error.response?.data?.message || 'Gagal mendeteksi penyakit dari gambar');
        }
    }

    /**
     * Get current model status
     */
    static async getModelStatus() {
        try {
            const response = await axios.get(`${ML_SERVICE_URL}/api/model/status`, {
                timeout: 5000
            });
            return response.data;
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                throw new Error('ML Service tidak dapat dihubungi');
            }
            throw new Error(error.response?.data?.message || 'Gagal mendapatkan status model');
        }
    }

    /**
     * Trigger health model training
     * @param {string} dataPath - Optional custom data path
     */
    static async trainHealthModel(dataPath = null) {
        try {
            const response = await axios.post(
                `${ML_SERVICE_URL}/api/train/health`,
                { data_path: dataPath },
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 300000 // 5 minutes for training
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Gagal melatih model kesehatan');
        }
    }

    /**
     * Trigger disease model training
     * @param {Object} options - Training options
     */
    static async trainDiseaseModel(options = {}) {
        try {
            const response = await axios.post(
                `${ML_SERVICE_URL}/api/train/disease`,
                options,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 1800000 // 30 minutes for CNN training
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Gagal melatih model deteksi penyakit');
        }
    }
}

module.exports = AIService;
