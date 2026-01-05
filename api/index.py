from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# --- Config Path ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'models')
loaded_models = {}

def load_models():
    if not loaded_models:
        try:
            # โหลดเฉพาะตัวจำเป็น (เอา Pandas ออกแล้วตามที่คุณบอก)
            loaded_models['anomaly'] = joblib.load(os.path.join(MODEL_DIR, 'anomaly_model.pkl'))
            loaded_models['failure'] = joblib.load(os.path.join(MODEL_DIR, 'failure_model.pkl'))
            loaded_models['failure_encoder'] = joblib.load(os.path.join(MODEL_DIR, 'failure_label_encoder.pkl'))
            loaded_models['maintenance'] = joblib.load(os.path.join(MODEL_DIR, 'maintenance_model.pkl'))
            loaded_models['scaler'] = joblib.load(os.path.join(MODEL_DIR, 'maintenance_scaler.pkl'))
            print("✅ Models loaded")
        except Exception as e:
            print(f"❌ Error loading models: {e}")

# 🔥 แก้ไขตรงนี้: ใช้ Catch-All Route เพื่อดักทุก Request ที่เข้ามาไฟล์นี้
# ไม่ว่าจะเข้ามาทาง /api/predict หรือ /api/python/predict หรือมี / ปิดท้าย ก็จะเข้าฟังก์ชันนี้หมด
@app.route('/', defaults={'path': ''}, methods=['GET', 'POST', 'OPTIONS'])
@app.route('/<path:path>', methods=['GET', 'POST', 'OPTIONS'])
def predict_handler(path):
    # 1. ถ้าเป็น GET หรือ OPTIONS (Browser เข้ามาดู หรือ CORS Preflight)
    if request.method == 'GET' or request.method == 'OPTIONS':
        return jsonify({
            "status": "alive",
            "message": "Python Vercel is running!",
            "path_accessed": path,
            "models_loaded": 'anomaly' in loaded_models
        })

    # 2. ถ้าเป็น POST (การใช้งานจริง)
    load_models()
    if 'anomaly' not in loaded_models:
        return jsonify({'status': 'error', 'message': 'Models missing'}), 500

    try:
        data = request.json
        servers = data.get('servers', [])
        results = []
        
        # ดึง Model
        anomaly_model = loaded_models['anomaly']
        failure_model = loaded_models['failure']
        failure_encoder = loaded_models['failure_encoder']
        maintenance_model = loaded_models['maintenance']
        scaler = loaded_models['scaler']

        for server in servers:
            features = [
                server['cpu'],
                server['memory'],
                server['temperature'],
                server.get('disk', 0),
                server.get('network', 0)
            ]
            input_data = np.array([features])

            # Anomaly
            is_anomaly = anomaly_model.predict(input_data)[0] == 1

            # Failure Type
            failure_type = "None"
            if is_anomaly:
                try:
                    fail_pred = failure_model.predict(input_data)[0]
                    failure_type = failure_encoder.inverse_transform([fail_pred])[0]
                except:
                    failure_type = "Unknown Error"

            # Maintenance
            try:
                scaled_data = scaler.transform(input_data)
                days = maintenance_model.predict(scaled_data)[0]
            except:
                days = 365

            results.append({
                'id': server['id'],
                'isAnomaly': bool(is_anomaly),
                'failureType': str(failure_type),
                'maintenanceDays': float(days),
                'newHealthScore': 80 if is_anomaly else 100 # Mock score logic
            })

        return jsonify({'status': 'success', 'predictions': results})

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)