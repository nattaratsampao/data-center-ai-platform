from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# --- Config Path สำหรับ Vercel ---
# Vercel จะหาไฟล์จากตำแหน่งปัจจุบันของไฟล์ index.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'models')

# Cache ตัวแปร Global (เพื่อให้โหลดครั้งเดียว ไม่ต้องโหลดใหม่ทุกครั้งที่เรียก)
models = {}

def load_models():
    if not models:
        try:
            print("⏳ Loading models...")
            models['anomaly'] = joblib.load(os.path.join(MODEL_DIR, 'anomaly_model.pkl'))
            models['failure'] = joblib.load(os.path.join(MODEL_DIR, 'failure_model.pkl'))
            models['failure_encoder'] = joblib.load(os.path.join(MODEL_DIR, 'failure_label_encoder.pkl'))
            models['maintenance'] = joblib.load(os.path.join(MODEL_DIR, 'maintenance_model.pkl'))
            models['scaler'] = joblib.load(os.path.join(MODEL_DIR, 'maintenance_scaler.pkl'))
            print("✅ Models loaded successfully")
        except Exception as e:
            print(f"❌ Error loading models: {str(e)}")

# Route หลักสำหรับรับค่าจาก Next.js
@app.route('/api/python', methods=['POST'])
def predict():
    load_models() # เรียกโหลดโมเดล (ถ้ายังไม่มี)

    if 'anomaly' not in models:
        return jsonify({'status': 'error', 'message': 'Models failed to load'}), 500

    try:
        data = request.json
        servers = data.get('servers', [])
        results = []

        # ดึงโมเดลมาใช้
        anomaly_model = models['anomaly']
        failure_model = models['failure']
        failure_encoder = models['failure_encoder']
        maintenance_model = models['maintenance']
        scaler = models['scaler']

        for server in servers:
            # 1. เตรียมข้อมูล (เรียงตามตอน Train)
            features = [
                server['cpu'],
                server['memory'],
                server['temperature'],
                server.get('disk', 0),
                server.get('network', 0)
            ]
            input_data = np.array([features])

            # 2. ทำนาย Anomaly
            is_anomaly = anomaly_model.predict(input_data)[0] == 1

            # 3. ทำนาย Failure Type (ถ้าผิดปกติ)
            failure_type = "None"
            if is_anomaly:
                try:
                    fail_pred = failure_model.predict(input_data)[0]
                    failure_type = failure_encoder.inverse_transform([fail_pred])[0]
                except:
                    failure_type = "Unknown"

            # 4. ทำนาย Maintenance Days
            try:
                scaled_data = scaler.transform(input_data)
                days = maintenance_model.predict(scaled_data)[0]
            except:
                days = 365

            # 5. คำนวณ Health Score ใหม่
            new_score = server.get('healthScore', 100)
            if is_anomaly: new_score -= 20
            if days < 7: new_score -= 10
            
            results.append({
                'id': server['id'],
                'isAnomaly': bool(is_anomaly),
                'failureType': str(failure_type),
                'maintenanceDays': float(days),
                'newHealthScore': max(0, min(100, int(new_score)))
            })

        return jsonify({'status': 'success', 'predictions': results})

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500