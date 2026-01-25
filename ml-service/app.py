"""
Flask API for ML Service
Menyediakan endpoint untuk prediksi kesehatan dan deteksi penyakit
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models.health_predictor import HealthPredictor
from models.disease_detector import DiseaseDetector
from models.product_analyzer import ProductAnalyzer
from models.google_vision_client import GoogleVisionClient

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# SETUP LOGGING TO FILE
import logging
logging.basicConfig(
    filename='debug_log.txt',
    level=logging.DEBUG,
    format='%(asctime)s %(levelname)s: %(message)s',
    filemode='w' # Overwrite tiap restart
)
# Console handler juga
console = logging.StreamHandler()
console.setLevel(logging.DEBUG)
logging.getLogger('').addHandler(console)

logging.info("ML Service Started with File Logging")

# Initialize models
health_predictor = HealthPredictor()
disease_detector = DiseaseDetector()
product_analyzer = ProductAnalyzer()
google_vision = GoogleVisionClient(credential_path="credentials.json")

# Configuration
PORT = int(os.environ.get('ML_SERVICE_PORT', 5001))
DEBUG = os.environ.get('ML_SERVICE_DEBUG', 'true').lower() == 'true'

@app.route('/api/analyze/product', methods=['POST'])
def analyze_product():
    """
    Analyze product using Google Vision (if available) or Local AI
    """
    try:
        image_data = None
        candidates = []
        
        # DEBUG: Print Raw Request Info
        print(f"DEBUG REQ: Headers: {request.headers}")
        # ... (Parsing image_data sama seperti sebelumnya) ...
        # Copas logic parsing image dari kode sebelumnya (baris 38-67)
        if request.is_json:
            data = request.get_json()
            print(f"DEBUG REQ: JSON Keys received: {data.keys()}")
            
            if 'image' in data:
                image_data = data['image']
                print("DEBUG REQ: Image data found in JSON")
                
            if 'candidates' in data:
                candidates = data['candidates']
                print(f"DEBUG REQ: Candidates received: {len(candidates)} items")
                print(f"DEBUG REQ: First Candidate Sample: {candidates[0] if len(candidates)>0 else 'None'}")
            else:
                print("DEBUG REQ: No 'candidates' key in JSON")
                
        elif 'image' in request.files:
            file = request.files['image']
            image_data = file.read()
            print("DEBUG REQ: File upload received")
        elif 'image' in request.form:
             image_data = request.form['image']

        if not image_data:
            return jsonify({'success': False, 'error': 'No image provided'}), 400

        # Decode Base64 (sama seperti sebelumnya)
        import base64
        from skimage import io
        from io import BytesIO
        if isinstance(image_data, str) and 'base64' in image_data:
            image_data = image_data.split(',')[1]
            image_data = base64.b64decode(image_data)
        elif isinstance(image_data, str):
             try:
                 image_data = base64.b64decode(image_data)
             except: pass

        # 1. VISUAL MATCHING (Prioritas Utama untuk Marketplace)
        img_array = io.imread(BytesIO(image_data))
        if img_array.shape[-1] == 4: img_array = img_array[:,:,:3]

        if candidates and len(candidates) > 0:
            try:
                print(f"INFO: Attempting visual match with {len(candidates)} candidates")
                matches = product_analyzer.find_matches(img_array, candidates)
                return jsonify({'success': True, 'mode': 'match', 'matches': matches})
            except Exception as match_err:
                print(f"WAR: Match failed: {match_err}")
                pass # Lanjut ke analisis teks

        # 2. ANALYSIS (Google Vision vs Local)
        
        # Coba Google Vision dulu
        gcv_result = google_vision.analyze_image(image_data)
        
        if gcv_result:
            # Mapping GCV result to our format
            labels = gcv_result['labels'] # e.g. ['Cattle', 'Snout']
            
            # Simple Logic mapping
            category = "Umum"
            if "Cattle" in labels or "Cow" in labels: category = "Sapi"
            elif "Goat" in labels or "Sheep" in labels: category = "Kambing"
            elif "Chicken" in labels or "Bird" in labels: category = "Ayam"
            elif "Grass" in labels or "Plant" in labels: category = "Pakan"
            elif "Bottle" in labels or "Medicine" in labels: category = "Obat"
            elif "Tool" in labels: category = "Alat"
            
            search_query = f"{category} {' '.join(labels[:2])}"
            
            return jsonify({
                'success': True,
                'search_query': search_query,
                'detected_features': {
                    'category': category,
                    'color': gcv_result.get('color', 'Unknown'),
                    'is_man_made': "Product" in labels
                },
                'source': 'Google Cloud Vision'
            })
            
        else:
            # Fallback ke Local AI
            print("INFO: Using Local AI Analysis")
            result = product_analyzer.analyze(img_array)
            result['source'] = 'Local AI'
            return jsonify(result)
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

# ... (sisa endpoint lain dipertahankan)
@app.route('/api/predict/health', methods=['POST'])
def predict_health():
    """
    Predict animal health status based on input parameters
    
    Expected JSON body:
    {
        "umur_bulan": 24,
        "berat_kg": 350,
        "suhu_celcius": 39.0,
        "nafsu_makan": "normal",  // normal, sedikit_menurun, menurun, tidak_mau
        "aktivitas": "aktif",     // aktif, normal, lesu, sangat_lesu
        "riwayat_sakit": "tidak", // ya, tidak
        "vaksinasi_lengkap": "ya", // ya, tidak
        "jenis_hewan": "sapi"     // sapi, kambing, ayam
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided',
                'message': 'Mohon kirim data parameter kesehatan hewan'
            }), 400
        
        # Validate required fields
        required_fields = ['jenis_hewan']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}',
                    'message': f'Field {field} wajib diisi'
                }), 400
        
        # Make prediction
        result = health_predictor.predict(data)
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Terjadi kesalahan saat memproses prediksi'
        }), 500


@app.route('/api/predict/disease', methods=['POST'])
def predict_disease():
    """
    Detect disease from animal image using Hybrid AI (GCV + Local CV)
    """
    try:
        image_data = None
        
        # Check for file upload
        if 'image' in request.files:
            file = request.files['image']
            if file.filename != '':
                image_data = file.read()
        
        # Check for base64 in JSON
        elif request.is_json:
            data = request.get_json()
            if 'image' in data:
                image_data = data['image']
        
        # Check for base64 in form data
        elif 'image' in request.form:
            image_data = request.form['image']
        
        if not image_data:
            return jsonify({
                'success': False,
                'error': 'No image provided',
                'message': 'Mohon upload gambar hewan untuk dianalisis'
            }), 400
        
        # 1. Google Vision Analysis (Optional)
        gcv_result = None
        try:
            gcv_result = google_vision.analyze_image(image_data)
            if gcv_result:
                print(f"INFO: GCV Labels: {gcv_result.get('labels')}")
        except Exception as e:
            print(f"WARN: GCV Disease analysis failed: {e}")

        # 2. Hybrid Prediction (Local + GCV info)
        # Kita kirim data GCV ke detector agar bisa digabung dengan analisis lokal
        result = disease_detector.predict(image_data, gcv_data=gcv_result)
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error predict disease: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Terjadi kesalahan saat memproses gambar'
        }), 500


@app.route('/api/train/health', methods=['POST'])
def train_health_model():
    """
    Train the health prediction model
    Optional: Provide custom data path in JSON body
    """
    try:
        data = request.get_json() or {}
        data_path = data.get('data_path', None)
        
        accuracy = health_predictor.train(data_path)
        
        return jsonify({
            'success': True,
            'message': 'Health prediction model trained successfully',
            'accuracy': accuracy
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to train health model'
        }), 500


@app.route('/api/train/disease', methods=['POST'])
def train_disease_model():
    """
    Train the disease detection model
    Requires training data directory with images organized by class
    """
    try:
        data = request.get_json() or {}
        data_dir = data.get('data_dir', None)
        epochs = data.get('epochs', 50)
        batch_size = data.get('batch_size', 32)
        
        history = disease_detector.train(data_dir, epochs, batch_size)
        
        if history is None:
            return jsonify({
                'success': False,
                'message': 'Training failed. Make sure training data is available.'
            }), 400
        
        return jsonify({
            'success': True,
            'message': 'Disease detection model trained successfully',
            'final_accuracy': float(history.history['accuracy'][-1]),
            'final_val_accuracy': float(history.history['val_accuracy'][-1])
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to train disease model'
        }), 500


@app.route('/api/model/status', methods=['GET'])
def model_status():
    """Check status of loaded models"""
    return jsonify({
        'success': True,
        'models': {
            'health_predictor': {
                'loaded': health_predictor.model is not None,
                'model_path': health_predictor.model_path,
                'model_exists': os.path.exists(health_predictor.model_path)
            },
            'disease_detector': {
                'loaded': disease_detector.model is not None,
                'model_path': disease_detector.model_path,
                'model_exists': os.path.exists(disease_detector.model_path),
                'classes': disease_detector.classes
            }
        }
    })


@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Not found',
        'message': 'Endpoint tidak ditemukan'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'message': 'Terjadi kesalahan pada server'
    }), 500


if __name__ == '__main__':
    print(f"""
╔════════════════════════════════════════════════════════════╗
║           🐄 Peternakan App - ML Service 🐄                ║
║════════════════════════════════════════════════════════════║
║  Service running on port: {PORT}                             ║
║  Debug mode: {DEBUG}                                        ║
║                                                            ║
║  Endpoints:                                                ║
║  - GET  /                      Health check                ║
║  - POST /api/predict/health    Predict animal health       ║
║  - POST /api/predict/disease   Detect disease from image   ║
║  - POST /api/train/health      Train health model          ║
║  - POST /api/train/disease     Train disease model         ║
║  - GET  /api/model/status      Check model status          ║
╚════════════════════════════════════════════════════════════╝
    """)
    
    # Auto-train health model if not exists
    if not os.path.exists(health_predictor.model_path):
        print("Training health prediction model...")
        health_predictor.train()
    
    app.run(host='0.0.0.0', port=PORT, debug=DEBUG)
