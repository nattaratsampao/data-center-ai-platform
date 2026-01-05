from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# --- 1. โหลด Models (โหลดแบบนี้เพื่อรองรับ Serverless) ---
# ใน Vercel ไฟล์จะถูกเก็บ path แปลกๆ เราต้องหา path ปัจจุบันก่อน
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'models')

# ตัวแปร Global เพื่อ Cache model (ช่วยลดเวลา Cold Start)
loaded_models = {}

def load_models():
    if not loaded_models:
        try:
            print("⏳ Loading models...")
            loaded_models['anomaly'] = joblib.load(os.path.join(MODEL_DIR, 'anomaly_model.pkl'))
            # ... โหลดตัวอื่นๆ ที่เหลือตรงนี้
            print("✅ Models loaded")
        except Exception as e:
            print(f"❌ Error: {e}")

@app.route('/api/predict', methods=['POST'])
def predict():
    load_models() # เช็คว่าโหลดรึยัง ถ้ายังให้โหลด
    
    if 'anomaly' not in loaded_models:
        return jsonify({'status': 'error', 'message': 'Models missing'}), 500

    try:
        data = request.json
        servers = data.get('servers', [])
        results = []

        model = loaded_models['anomaly']

        for server in servers:
            features = [[
                server['cpu'],
                server['memory'],
                server['temperature'],
                server.get('disk', 0),
                server.get('network', 0)
            ]]
            
            # ทำนาย
            is_anomaly = model.predict(features)[0]
            
            # (ใส่ Logic เดิมของคุณตรงนี้) ...
            
            results.append({
                'id': server['id'],
                'isAnomaly': bool(is_anomaly == 1),
                'newHealthScore': 80 # (Mockup)
            })

        return jsonify({'status': 'success', 'predictions': results})

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Vercel ต้องการบรรทัดนี้
if __name__ == '__main__':
    app.run(debug=True)