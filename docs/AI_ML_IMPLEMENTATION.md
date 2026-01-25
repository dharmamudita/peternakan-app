# 🤖 Implementasi AI/ML untuk Aplikasi Peternakan

## Status Implementasi: ✅ SELESAI

> **Terakhir diupdate:** 24 Januari 2026

---

## Dua Fitur Utama yang Diimplementasikan

### 1. 📊 Data Mining: Prediksi Kesehatan Hewan
### 2. 👁️ Computer Vision: Deteksi Penyakit dari Foto

---

## 📁 File yang Telah Dibuat

### ML Service (Python)
```
ml-service/
├── app.py                          ✅ Flask API server
├── requirements.txt                ✅ Python dependencies
├── models/
│   ├── __init__.py                 ✅ Package init
│   ├── health_predictor.py         ✅ Data Mining (Random Forest)
│   └── disease_detector.py         ✅ Computer Vision (CNN)
├── data/
│   └── health_training_data.csv    ✅ Training dataset
└── saved_models/                   📁 (generated after training)
    ├── health_model.pkl            
    └── disease_model.h5            
```

### Backend (Express.js)
```
backend/src/
├── controllers/
│   └── aiController.js             ✅ AI endpoints handler
├── routes/
│   └── aiRoutes.js                 ✅ AI routes with multer
└── services/
    └── aiService.js                ✅ Communicate with ML Service
```

### Frontend (React Native)
```
frontend/src/screens/ai/
├── index.js                        ✅ Exports
├── HealthAnalysisScreen.js         ✅ Form input untuk analisis
├── DiseaseScanScreen.js            ✅ Camera/Gallery untuk scan
└── AIResultScreen.js               ✅ Tampilan hasil analisis
```

---

# 📊 FITUR 1: PREDIKSI KESEHATAN HEWAN (Data Mining)

## Konsep Sistem

```
┌─────────────────────────────────────────────────────────────────┐
│                    ALUR PREDIKSI KESEHATAN                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  INPUT   │───▶│  MODEL   │───▶│ PREDIKSI │───▶│  OUTPUT  │  │
│  │  DATA    │    │   ML     │    │  ENGINE  │    │  HASIL   │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│                                                                 │
│  Input:           Model:          Proses:         Output:       │
│  - Umur           Random Forest   Analisis        - Status      │
│  - Berat          Classifier      Pattern         - Risiko %    │
│  - Suhu tubuh                     dari data       - Rekomendasi │
│  - Nafsu makan                                    - Faktor      │
│  - Aktivitas                                                    │
│  - Riwayat                                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Input Parameters

| Parameter | Tipe | Opsi |
|-----------|------|------|
| `jenis_hewan` | string | sapi, kambing, ayam |
| `umur_bulan` | number | 1-120 |
| `berat_kg` | number | 0.5-1000 |
| `suhu_celcius` | number | 35-45 |
| `nafsu_makan` | string | normal, sedikit_menurun, menurun, tidak_mau |
| `aktivitas` | string | aktif, normal, lesu, sangat_lesu |
| `riwayat_sakit` | string | ya, tidak |
| `vaksinasi_lengkap` | string | ya, tidak |

## Output yang Dihasilkan

```javascript
{
  "status": "Risiko Tinggi",
  "status_key": "risiko_tinggi",
  "confidence": 87.5,               // Persentase keyakinan
  "risk_score": 8,                  // Skala 1-10
  "color": "#ef4444",               // Warna untuk UI
  "recommendations": [
    "SEGERA hubungi dokter hewan!",
    "Isolasi hewan dari yang lain",
    "Monitor suhu tubuh setiap 2 jam"
  ],
  "risk_factors": [
    "Suhu tubuh tinggi (40.2°C, normal: 38.0-39.5°C)",
    "Nafsu makan menurun",
    "Vaksinasi tidak lengkap"
  ],
  "input_summary": {
    "jenis_hewan": "Sapi",
    "umur": "24 bulan",
    "berat": "350 kg",
    "suhu": "40.2°C"
  }
}
```

---

# 👁️ FITUR 2: DETEKSI PENYAKIT DARI FOTO (Computer Vision)

## Konsep Sistem

```
┌─────────────────────────────────────────────────────────────────┐
│                 ALUR DETEKSI PENYAKIT DARI FOTO                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  UPLOAD  │───▶│  IMAGE   │───▶│   CNN    │───▶│ DIAGNOSIS│  │
│  │  FOTO    │    │ PROCESS  │    │  MODEL   │    │  HASIL   │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│                                                                 │
│  User upload     Resize 224x224  Convolutional   Penyakit +    │
│  foto hewan      Normalize 0-1   Neural Network  Confidence    │
│  (base64)        RGB             4 Conv Layers   + Treatment   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Jenis Penyakit yang Dapat Dideteksi

| Kelas | Nama | Severity |
|-------|------|----------|
| `healthy` | Sehat | none |
| `skin_disease` | Penyakit Kulit | medium |
| `eye_infection` | Infeksi Mata | medium |
| `foot_disease` | Penyakit Kaki (PMK) | high |
| `respiratory` | Gangguan Pernapasan | high |
| `digestive` | Gangguan Pencernaan | medium |

## Output yang Dihasilkan

```javascript
{
  "success": true,
  "prediction": {
    "class": "skin_disease",
    "name": "Penyakit Kulit",
    "name_en": "Skin Disease",
    "confidence": 85.0,
    "severity": "medium",
    "color": "#f59e0b"
  },
  "details": {
    "description": "Terdeteksi kemungkinan masalah pada kulit...",
    "symptoms": [
      "Bulu rontok atau menipis",
      "Kulit kemerahan atau iritasi"
    ],
    "treatment": [
      "Konsultasikan ke dokter hewan",
      "Berikan obat topikal sesuai resep"
    ],
    "prevention": [
      "Jaga kebersihan kandang",
      "Hindari kelembaban berlebih"
    ]
  },
  "all_predictions": [
    {"class": "skin_disease", "name": "Penyakit Kulit", "probability": 85.0},
    {"class": "healthy", "name": "Sehat", "probability": 10.0}
  ],
  "disclaimer": "Hasil analisis ini hanya sebagai referensi..."
}
```

---

# 🏗️ ARSITEKTUR SISTEM

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React Native)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                      │
│  │ Health      │  │ Disease     │  │ AI Result   │                      │
│  │ Analysis    │  │ Scan        │  │ Screen      │                      │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘                      │
└─────────┼────────────────┼──────────────────────────────────────────────┘
          │                │
          ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      MAIN BACKEND (Express.js) - Port 5000               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                      │
│  │ aiRoutes.js │  │aiController │  │ aiService   │                      │
│  │ /api/ai/*   │  │   .js       │  │   .js       │                      │
│  └──────┬──────┘  └─────────────┘  └──────┬──────┘                      │
└─────────┼─────────────────────────────────┼─────────────────────────────┘
          │                                 │
          │     HTTP Request to Port 5001   │
          ▼                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    ML SERVICE (Python Flask) - Port 5001                 │
│  ┌───────────────────────┐    ┌───────────────────────┐                 │
│  │ health_predictor.py   │    │ disease_detector.py   │                 │
│  │ Random Forest         │    │ CNN TensorFlow        │                 │
│  └───────────────────────┘    └───────────────────────┘                 │
│                                                                          │
│  Endpoints:                                                              │
│  - GET  /                      Health check                              │
│  - POST /api/predict/health    Predict animal health                     │
│  - POST /api/predict/disease   Detect disease from image                 │
│  - GET  /api/model/status      Check model status                        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# 🚀 CARA MENJALANKAN

## 1. Setup ML Service (Python)

```bash
# Masuk ke folder ml-service
cd ml-service

# Buat virtual environment (opsional tapi direkomendasikan)
python -m venv venv

# Aktifkan virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Jalankan ML Service
python app.py
```

ML Service akan berjalan di `http://localhost:5001`

## 2. Jalankan Backend (Express.js)

```bash
cd backend
npm run dev
```

Backend berjalan di `http://localhost:5000`

## 3. Jalankan Frontend (React Native)

```bash
cd frontend
npx expo start --web
```

Frontend berjalan di `http://localhost:8081`

---

# 🔗 API ENDPOINTS

## Health Check
```
GET http://localhost:5000/api/ai/health
```

## Predict Animal Health
```
POST http://localhost:5000/api/ai/predict/health
Content-Type: application/json
Authorization: Bearer <token>

{
  "jenis_hewan": "sapi",
  "umur_bulan": 24,
  "berat_kg": 350,
  "suhu_celcius": 40.2,
  "nafsu_makan": "menurun",
  "aktivitas": "lesu",
  "riwayat_sakit": "ya",
  "vaksinasi_lengkap": "tidak"
}
```

## Detect Disease from Image
```
POST http://localhost:5000/api/ai/predict/disease
Content-Type: application/json
Authorization: Bearer <token>

{
  "image": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

---

# 📱 UI ENTRY POINTS

1. **Home Screen** → Quick Actions:
   - "Analisis Kesehatan" → HealthAnalysisScreen
   - "Scan Penyakit" → DiseaseScanScreen

2. **Navigation:**
   - HealthAnalysis → AIResult (type: 'health')
   - DiseaseScan → AIResult (type: 'disease')

---

# ⚠️ CATATAN PENTING

1. **Model Disease Detection dalam Mode Demo**
   - Model CNN membutuhkan dataset gambar penyakit untuk dilatih
   - Saat ini menggunakan mock prediction untuk demonstrasi
   - Untuk produksi, kumpulkan dataset dan jalankan training

2. **TensorFlow Opsional**
   - Jika TensorFlow tidak terinstall, disease detector akan menggunakan mock prediction
   - Untuk training model yang sebenarnya, pastikan TensorFlow terinstall

3. **Training Model Health Predictor**
   - Model akan otomatis di-train saat ML Service pertama kali dijalankan
   - Training data dari `data/health_training_data.csv`

---

# 📊 DEMO FLOW

## Flow 1: Prediksi Kesehatan

```
User di HomeScreen
       ↓
Klik "Analisis Kesehatan" di Quick Actions
       ↓
Masuk ke HealthAnalysisScreen
       ↓
1. Pilih jenis hewan (Sapi/Kambing/Ayam)
2. Isi umur, berat, suhu
3. Pilih nafsu makan & aktivitas
4. Toggle riwayat sakit & vaksinasi
       ↓
Klik "Analisis Kesehatan"
       ↓
Frontend → Backend → ML Service → Prediksi
       ↓
Tampil AIResultScreen dengan:
- Status kesehatan (Sehat/Risiko/Sakit)
- Confidence percentage
- Risk score (1-10)
- Faktor risiko yang teridentifikasi
- Rekomendasi penanganan
```

## Flow 2: Scan Penyakit

```
User di HomeScreen
       ↓
Klik "Scan Penyakit" di Quick Actions
       ↓
Masuk ke DiseaseScanScreen
       ↓
Pilih: Galeri atau Kamera
       ↓
Ambil/Pilih foto hewan
       ↓
Klik "Analisis Gambar"
       ↓
Frontend → Backend → ML Service → Deteksi
       ↓
Tampil AIResultScreen dengan:
- Nama penyakit terdeteksi
- Confidence percentage
- Severity level
- Deskripsi penyakit
- Gejala yang mungkin
- Penanganan yang direkomendasikan
- Tips pencegahan
```

---

> **Next Steps untuk Production:**
> 1. Kumpulkan dataset gambar penyakit hewan yang lebih banyak
> 2. Train model CNN dengan dataset tersebut
> 3. Tambahkan lebih banyak training data untuk health predictor
> 4. Implementasi caching untuk hasil prediksi
> 5. Tambahkan fitur riwayat diagnosis
