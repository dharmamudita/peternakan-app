"""
Health Predictor Model - Data Mining
Menggunakan Decision Tree / Random Forest untuk prediksi kesehatan hewan
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

class HealthPredictor:
    def __init__(self):
        self.model = None
        self.label_encoders = {}
        self.target_encoder = None
        self.model_path = os.path.join(os.path.dirname(__file__), '..', 'saved_models', 'health_model.pkl')
        self.encoders_path = os.path.join(os.path.dirname(__file__), '..', 'saved_models', 'health_encoders.pkl')
        
        # Mapping untuk output
        self.result_mapping = {
            'sehat': {
                'label': 'Sehat',
                'risk_score': 1,
                'color': '#10b981',
                'recommendations': [
                    'Pertahankan pola makan dan perawatan saat ini',
                    'Lakukan pemeriksaan rutin setiap 3 bulan',
                    'Pastikan vaksinasi tetap up-to-date'
                ]
            },
            'risiko_rendah': {
                'label': 'Risiko Rendah',
                'risk_score': 3,
                'color': '#84cc16',
                'recommendations': [
                    'Monitor kondisi hewan setiap hari',
                    'Perhatikan perubahan nafsu makan',
                    'Pastikan hewan mendapat nutrisi yang cukup'
                ]
            },
            'risiko_sedang': {
                'label': 'Risiko Sedang',
                'risk_score': 6,
                'color': '#f59e0b',
                'recommendations': [
                    'Segera periksa ke dokter hewan dalam 2-3 hari',
                    'Isolasi dari hewan lain untuk sementara',
                    'Monitor suhu tubuh setiap 4 jam',
                    'Berikan pakan yang mudah dicerna'
                ]
            },
            'risiko_tinggi': {
                'label': 'Risiko Tinggi',
                'risk_score': 8,
                'color': '#ef4444',
                'recommendations': [
                    'SEGERA hubungi dokter hewan!',
                    'Isolasi hewan dari yang lain',
                    'Monitor suhu tubuh setiap 2 jam',
                    'Jangan beri makan berlebihan',
                    'Siapkan catatan gejala untuk dokter'
                ]
            },
            'sakit': {
                'label': 'Sakit - Butuh Penanganan',
                'risk_score': 10,
                'color': '#dc2626',
                'recommendations': [
                    'DARURAT! Hubungi dokter hewan SEKARANG!',
                    'Isolasi hewan segera',
                    'Jaga hewan tetap hangat dan nyaman',
                    'Berikan air minum yang cukup',
                    'Dokumentasikan semua gejala'
                ]
            }
        }
    
    def train(self, data_path=None):
        """Train the model with training data"""
        if data_path is None:
            data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'health_training_data.csv')
        
        # Load data
        df = pd.read_csv(data_path)
        
        # Encode categorical variables
        categorical_cols = ['nafsu_makan', 'aktivitas', 'riwayat_sakit', 'vaksinasi_lengkap', 'jenis_hewan']
        
        for col in categorical_cols:
            self.label_encoders[col] = LabelEncoder()
            df[col] = self.label_encoders[col].fit_transform(df[col])
        
        # Encode target
        self.target_encoder = LabelEncoder()
        df['hasil'] = self.target_encoder.fit_transform(df['hasil'])
        
        # Features and target
        X = df.drop('hasil', axis=1)
        y = df['hasil']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Train Random Forest
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"Model trained with accuracy: {accuracy:.2%}")
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred, target_names=self.target_encoder.classes_))
        
        # Save model
        self.save_model()
        
        return accuracy
    
    def save_model(self):
        """Save the trained model and encoders"""
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(self.model, self.model_path)
        joblib.dump({
            'label_encoders': self.label_encoders,
            'target_encoder': self.target_encoder
        }, self.encoders_path)
        print(f"Model saved to {self.model_path}")
    
    def load_model(self):
        """Load the trained model and encoders"""
        if os.path.exists(self.model_path) and os.path.exists(self.encoders_path):
            self.model = joblib.load(self.model_path)
            encoders = joblib.load(self.encoders_path)
            self.label_encoders = encoders['label_encoders']
            self.target_encoder = encoders['target_encoder']
            return True
        return False
    
    def predict(self, data):
        """
        Predict health status from input data
        
        Args:
            data: dict with keys:
                - umur_bulan: int
                - berat_kg: float
                - suhu_celcius: float
                - nafsu_makan: str ('normal', 'sedikit_menurun', 'menurun', 'tidak_mau')
                - aktivitas: str ('aktif', 'normal', 'lesu', 'sangat_lesu')
                - riwayat_sakit: str ('ya', 'tidak')
                - vaksinasi_lengkap: str ('ya', 'tidak')
                - jenis_hewan: str ('sapi', 'kambing', 'ayam')
        
        Returns:
            dict with prediction results
        """
        if self.model is None:
            if not self.load_model():
                # Train if no model exists
                self.train()
        
        # Prepare input
        input_data = {
            'umur_bulan': data.get('umur_bulan', 12),
            'berat_kg': data.get('berat_kg', 100),
            'suhu_celcius': data.get('suhu_celcius', 38.5),
            'nafsu_makan': data.get('nafsu_makan', 'normal'),
            'aktivitas': data.get('aktivitas', 'aktif'),
            'riwayat_sakit': data.get('riwayat_sakit', 'tidak'),
            'vaksinasi_lengkap': data.get('vaksinasi_lengkap', 'ya'),
            'jenis_hewan': data.get('jenis_hewan', 'sapi')
        }
        
        # Encode categorical variables
        encoded_data = input_data.copy()
        for col in ['nafsu_makan', 'aktivitas', 'riwayat_sakit', 'vaksinasi_lengkap', 'jenis_hewan']:
            try:
                encoded_data[col] = self.label_encoders[col].transform([input_data[col]])[0]
            except ValueError:
                # Handle unknown categories
                encoded_data[col] = 0
        
        # Create feature array
        features = np.array([[
            encoded_data['umur_bulan'],
            encoded_data['berat_kg'],
            encoded_data['suhu_celcius'],
            encoded_data['nafsu_makan'],
            encoded_data['aktivitas'],
            encoded_data['riwayat_sakit'],
            encoded_data['vaksinasi_lengkap'],
            encoded_data['jenis_hewan']
        ]])
        
        # Predict
        prediction = self.model.predict(features)[0]
        probabilities = self.model.predict_proba(features)[0]
        
        # Get result
        result_key = self.target_encoder.inverse_transform([prediction])[0]
        result_info = self.result_mapping.get(result_key, self.result_mapping['sehat'])
        
        # Get confidence
        confidence = float(max(probabilities))
        
        # Identify risk factors
        risk_factors = self._identify_risk_factors(input_data)
        
        return {
            'status': result_info['label'],
            'status_key': result_key,
            'confidence': round(confidence * 100, 1),
            'risk_score': result_info['risk_score'],
            'color': result_info['color'],
            'recommendations': result_info['recommendations'],
            'risk_factors': risk_factors,
            'input_summary': {
                'jenis_hewan': input_data['jenis_hewan'].capitalize(),
                'umur': f"{input_data['umur_bulan']} bulan",
                'berat': f"{input_data['berat_kg']} kg",
                'suhu': f"{input_data['suhu_celcius']}°C"
            }
        }
    
    def _identify_risk_factors(self, data):
        """Identify risk factors from input data"""
        factors = []
        
        # Check temperature
        jenis = data.get('jenis_hewan', 'sapi')
        suhu = data.get('suhu_celcius', 38.5)
        
        normal_temp = {
            'sapi': (38.0, 39.5),
            'kambing': (38.5, 40.0),
            'ayam': (40.5, 42.0)
        }
        
        temp_range = normal_temp.get(jenis, (38.0, 40.0))
        if suhu < temp_range[0]:
            factors.append(f"Suhu tubuh rendah ({suhu}°C, normal: {temp_range[0]}-{temp_range[1]}°C)")
        elif suhu > temp_range[1]:
            factors.append(f"Suhu tubuh tinggi ({suhu}°C, normal: {temp_range[0]}-{temp_range[1]}°C)")
        
        # Check appetite
        if data.get('nafsu_makan') in ['menurun', 'tidak_mau']:
            factors.append(f"Nafsu makan {data.get('nafsu_makan').replace('_', ' ')}")
        
        # Check activity
        if data.get('aktivitas') in ['lesu', 'sangat_lesu']:
            factors.append(f"Aktivitas {data.get('aktivitas').replace('_', ' ')}")
        
        # Check vaccination
        if data.get('vaksinasi_lengkap') == 'tidak':
            factors.append("Vaksinasi tidak lengkap")
        
        # Check history
        if data.get('riwayat_sakit') == 'ya':
            factors.append("Ada riwayat sakit sebelumnya")
        
        return factors if factors else ["Tidak ada faktor risiko yang teridentifikasi"]


# For testing
if __name__ == "__main__":
    predictor = HealthPredictor()
    
    # Train model
    print("Training model...")
    predictor.train()
    
    # Test prediction
    print("\n--- Test Prediction ---")
    test_data = {
        'umur_bulan': 24,
        'berat_kg': 350,
        'suhu_celcius': 40.5,
        'nafsu_makan': 'menurun',
        'aktivitas': 'lesu',
        'riwayat_sakit': 'ya',
        'vaksinasi_lengkap': 'tidak',
        'jenis_hewan': 'sapi'
    }
    
    result = predictor.predict(test_data)
    print(f"\nResult: {result['status']}")
    print(f"Confidence: {result['confidence']}%")
    print(f"Risk Score: {result['risk_score']}/10")
    print(f"Risk Factors: {result['risk_factors']}")
    print(f"Recommendations: {result['recommendations']}")
