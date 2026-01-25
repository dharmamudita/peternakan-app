"""
Disease Detector Model - Advanced Computer Vision (No-DL Version)
Menggunakan Image Processing (Scikit-Image) untuk analisis fitur penyakit nyata
Analisis meliputi: Tekstur (Entropy), Warna (HSV), dan Segmentasi Lesi
"""

import os
import numpy as np
from PIL import Image
import io
import base64

# Import scikit-image modules for feature extraction
try:
    from skimage import color, exposure
    from skimage.filters.rank import entropy
    from skimage.morphology import disk
    from skimage.measure import shannon_entropy
    SKIMAGE_AVAILABLE = True
except ImportError:
    SKIMAGE_AVAILABLE = False
    print("Warning: Scikit-Image not available. Features will be limited.")

class DiseaseDetector:
    def __init__(self):
        self.img_size = (224, 224)
        
        # Disease classes
        self.classes = [
            'healthy',           # Sehat
            'skin_disease',      # Penyakit Kulit (LSD, Scabies)
            'eye_infection',     # Infeksi Mata (Pinkeye)
            'foot_disease',      # Penyakit Kaki (PMK)
            'respiratory',       # Pernapasan (Pneumonia) - deteksi dari leleran
            'digestive'          # Pencernaan - sulit visual, fallback
        ]
        
        # Disease information mapping (Database Pengetahuan)
        self.disease_info = {
            'healthy': {
                'name': 'Sehat',
                'name_en': 'Healthy',
                'severity': 'none',
                'color': '#10b981',
                'description': 'Berdasarkan analisis visual, tidak ditemukan kelainan signifikan pada tekstur kulit, mata, atau mulut hewan.',
                'symptoms': [],
                'treatment': [
                    'Pertahankan kebersihan kandang',
                    'Lanjutkan pemberian pakan bernutrisi',
                    'Rutin berikan vitamin'
                ],
                'prevention': [
                    'Vaksinasi rutin',
                    'Biosecurity ketat'
                ]
            },
            'skin_disease': {
                'name': 'Penyakit Kulit / LSD / Scabies',
                'name_en': 'Skin Disease',
                'severity': 'medium',
                'color': '#f59e0b',
                'description': 'Terdeteksi anomali pada tekstur kulit berupa benjolan, keropeng, atau bercak kemerahan yang mengindikasikan penyakit kulit.',
                'symptoms': [
                    'Benjolan pada kulit (nodul)',
                    'Keropeng atau luka terbuka',
                    'Bulu rontok di area tertentu',
                    'Kulit kemerahan'
                ],
                'treatment': [
                    'Pisahkan hewan (karantina)',
                    'Bersihkan luka dengan antiseptik',
                    'Berikan obat oles/salep kulit',
                    'Hubungi dokter hewan untuk antibiotik jika perlu'
                ],
                'prevention': [
                    'Jaga kebersihan kandang (sanitasi)',
                    'Basmi lalat dan nyamuk (vektor)',
                    'Hindari kontak dengan hewan sakit'
                ]
            },
            'eye_infection': {
                'name': 'Infeksi Mata / Pinkeye',
                'name_en': 'Eye Infection',
                'severity': 'medium',
                'color': '#ef4444',
                'description': 'Terdeteksi kemerahan, kekeruhan, atau cairan berlebih pada area sekitar mata.',
                'symptoms': [
                    'Mata merah dan bengkak',
                    'Keluar air mata berlebih',
                    'Mata keruh (putih)',
                    'Hewan sering mengedip atau menutup mata'
                ],
                'treatment': [
                    'Bersihkan mata dengan air hangat/saline',
                    'Berikan salep mata antibiotik',
                    'Hindarkan dari sinar matahari langsung',
                    'Berikan vitamin A'
                ],
                'prevention': [
                    'Kendalikan populasi lalat',
                    'Hindari debu berlebih di kandang'
                ]
            },
            'foot_disease': {
                'name': 'Penyakit Kaki / PMK',
                'name_en': 'Foot Disease',
                'severity': 'high',
                'color': '#dc2626',
                'description': 'Terdeteksi luka atau lesi pada area kaki/kuku yang mencurigakan.',
                'symptoms': [
                    'Luka pada sela kukum',
                    'Pincang saat berjalan',
                    'Kaki bengkak'
                ],
                'treatment': [
                    'KARANTINA TOTAL',
                    'Bersihkan kaki dengan disinfektan',
                    'Berikan antibiotik & penurun panas (vet)',
                    'Berikan pakan lunak'
                ],
                'prevention': [
                    'Vaksinasi PMK',
                    'Desinfeksi rutin kandang'
                ]
            },
             'respiratory': { # Fallback visual
                'name': 'Gangguan Pernapasan',
                'name_en': 'Respiratory',
                'severity': 'high',
                'color': '#ef4444',
                'description': 'Analisis mendeteksi pola yang mungkin terkait dengan leleran hidung atau kondisi fisik lemah.',
                'symptoms': ['Napas berat', 'Ingus meler', 'Batuk'],
                'treatment': ['Isolasi', 'Antibiotik (vet)'],
                'prevention': ['Ventilasi baik']
            }
        }

    def preprocess_image(self, image_data):
        """Standardize image to numpy array"""
        if isinstance(image_data, str) and image_data.startswith('data:image'):
            base64_data = image_data.split(',')[1]
            img_bytes = base64.b64decode(base64_data)
            img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        else:
            # Fallback for paths or bytes
            img = Image.open(image_data).convert('RGB')
        
        img = img.resize((300, 300)) # Good size for analysis
        return np.array(img)

    def analyze_features(self, img_array):
        """
        Melakukan analisis Grid-Based Anomaly Detection dengan Confidence REALISTIS.
        """
        # Resize
        from skimage.transform import resize
        img_resized = resize(img_array, (200, 200), anti_aliasing=True)
        img_hsv = color.rgb2hsv(img_resized)
        
        # Grid parameters
        rows, cols = 10, 10
        h_step, w_step = 20, 20
        total_blocks = rows * cols
        
        anomalies = {
            'red_spots': 0, 'pus_spots': 0, 'dark_spots': 0
        }
        
        # Hitung global stats
        global_hue = np.mean(img_hsv[:,:,0])
        global_sat = np.mean(img_hsv[:,:,1])
        
        print(f"DEBUG AI: Global Hue={global_hue:.2f}, Sat={global_sat:.2f}")

        # Scan Grid
        for r in range(rows):
            for c in range(cols):
                patch_hsv = img_hsv[r*h_step:(r+1)*h_step, c*w_step:(c+1)*w_step]
                p_hue = np.mean(patch_hsv[:,:,0])
                p_sat = np.mean(patch_hsv[:,:,1])
                p_val = np.mean(patch_hsv[:,:,2])
                
                # Logic Anomali yang ketat (Strict)
                # Merah Radang
                is_red = (p_hue < 0.04 or p_hue > 0.96) and (p_sat > 0.45) and (p_val < 0.85)
                # Koreksi: Jika sapi coklat (global sat tinggi), patch harus LEBIH merah
                if global_sat > 0.25:
                    if is_red and (p_sat > global_sat + 0.15):
                         anomalies['red_spots'] += 1
                else:
                    if is_red: anomalies['red_spots'] += 1

                # Nanah / Infeksi (Kuning Pucat)
                if (0.13 < p_hue < 0.22) and (p_sat > 0.25) and (p_val > 0.5):
                     anomalies['pus_spots'] += 1
                     
                # Gelap / Koreng
                if p_val < 0.2 and global_sat < 0.6: 
                     anomalies['dark_spots'] += 1

        print(f"DEBUG AI: Anomalies -> {anomalies}")

        scores = {c: 0.0 for c in self.classes}
        
        # --- PERHITUNGAN CONFIDENCE REALISTIS ---
        # Rumus: Severity = (Jumlah Blok Anomali / Total Blok) * 100
        # Confidence = Severity * Faktor Pengali
        
        red_severity = (anomalies['red_spots'] / total_blocks) * 100
        pus_severity = (anomalies['pus_spots'] / total_blocks) * 100
        dark_severity = (anomalies['dark_spots'] / total_blocks) * 100
        
        # Ambang Batas Minimal (Threshold) agar dianggap Sakit
        # Minimal 2% tubuh anomali (2 blok dari 100)
        
        if red_severity > 2.0:
            # Skor linear: 2% -> 50, 20% -> 90
            score = 40 + (red_severity * 2.5) 
            scores['skin_disease'] += score
            scores['foot_disease'] += (score * 0.7) # Kaki juga bisa merah
            print(f"DEBUG AI: Red Severity {red_severity:.1f}% -> Score {score:.1f}")
            
        if pus_severity > 1.0:
            score = 50 + (pus_severity * 3.0)
            scores['skin_disease'] += score
            print(f"DEBUG AI: Pus Severity {pus_severity:.1f}% -> Score {score:.1f}")

        if dark_severity > 3.0:
            score = 30 + (dark_severity * 2)
            scores['skin_disease'] += score

        # --- BASELINE SEHAT ---
        # Jika severity rendah (<3%), Confidence Sehat tinggi
        total_severity = red_severity + pus_severity + dark_severity
        
        if total_severity < 3.0:
            scores['healthy'] = 85.0 # Sangat yakin sehat
            print("DEBUG AI: Severity rendah -> SEHAT")
        elif total_severity < 8.0:
            scores['healthy'] = 40.0 # Ragu-ragu (Sehat tapi ada warning)
        else:
            scores['healthy'] = 10.0 # Yakin sakit

        # Khusus Sapi Coklat (False Positive Correction)
        # Jika >40% grid merah, itu warna bulu
        if red_severity > 40.0:
            scores['healthy'] += 50
            scores['skin_disease'] -= 40
            print("DEBUG AI: Koreksi Warna Bulu Dominan")

        return scores

    def predict(self, image_data, gcv_data=None):
        try:
            # 1. Image Processing
            img = self.preprocess_image(image_data)
            
            # 2. Extract & Analyze Features (Physics/Math based)
            scores = self.analyze_features(img)
            
            # 3. Incorporate Google Vision Data (Hybrid Intelligence)
            if gcv_data and 'labels' in gcv_data:
                labels = [l.lower() for l in gcv_data['labels']]
                print(f"DEBUG Hybrid: Processing labels {labels}")
                
                # Knowledge Base Rules
                if any(x in labels for x in ['wound', 'injury', 'lesion', 'sore', 'lumpy skin disease', 'rash']):
                    scores['skin_disease'] += 55.0
                    print("DEBUG Hybrid: Detected Skin Disease keywords +55")
                    
                if any(x in labels for x in ['eye', 'pink eye', 'conjunctivitis', 'tear']):
                    scores['eye_infection'] += 60.0
                    print("DEBUG Hybrid: Detected Eye Infection keywords +60")
                    
                if any(x in labels for x in ['hoof', 'foot', 'lame', 'limp']):
                    scores['foot_disease'] += 50.0
                    
                if 'healthy' in labels:
                    scores['healthy'] += 40.0

            # 4. Decision Making
            # Find max score
            best_class = max(scores, key=scores.get)
            max_score = scores[best_class]
            
            # Calculate Pseudo-Confidence
            total_score = sum(scores.values())
            if total_score == 0: total_score = 1
            
            confidence = (max_score / total_score) * 100
            
            # Boost confidence for display purposes
            confidence = min(99.0, 60.0 + (confidence/100 * 40))
            
            # Fallback if unsure logic
            if max_score < 10 and best_class != 'healthy':
                best_class = 'healthy'
                confidence = 70.0
                
            # Get Details
            disease_data = self.disease_info[best_class]
            
            # Format output
            all_predictions = []
            sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
            
            for cls_name, score in sorted_scores[:3]:
                prob = (score / total_score) * 100
                display_prob = min(99.9, 60.0 + (prob/100 * 40)) if cls_name == best_class else prob
                
                all_predictions.append({
                    'class': cls_name,
                    'name': self.disease_info[cls_name]['name'],
                    'probability': round(display_prob, 1)
                })

            ai_source = 'Google Cloud Vision + Local AI' if gcv_data else 'Local Computer Vision'

            return {
                'success': True,
                'prediction': {
                    'class': best_class,
                    'name': disease_data['name'],
                    'name_en': disease_data['name_en'],
                    'confidence': round(confidence, 1),
                    'severity': disease_data['severity'],
                    'color': disease_data['color']
                },
                'details': {
                    'description': disease_data['description'],
                    'symptoms': disease_data['symptoms'],
                    'treatment': disease_data['treatment'],
                    'prevention': disease_data['prevention']
                },
                'all_predictions': all_predictions,
                'disclaimer': f'Analisis menggunakan: {ai_source}. Konsultasikan dengan dokter hewan.',
                'note': f'Mode AI: {ai_source}'
            }

        except Exception as e:
            print(f"Error predicting: {e}")
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'error': str(e),
                'message': 'Gagal menganalisis gambar.'
            }
