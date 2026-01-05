from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# --- 1. ตั้งค่า Path สำหรับ Vercel ---
# Vercel Serverless จะรันใน path ที่ลึกและซับซ้อน ต้องใช้ os.path หา path ปัจจุบันเสมอ
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'models')

# ตัวแปร Global เพื่อ Cache model (ช่วยลดเวลา Cold Start)
loaded_models = {}

def load_models():
    """โหลดโมเดลทั้ง 5 ตัวเข้า Memory ถ้ายังไม่มี"""
    if not loaded_models:
        try:
            print("⏳ Loading models...")
            
            # 1. Anomaly Detection (ตรวจสอบความผิดปกติ)
            loaded_models['anomaly'] = joblib.load(os.path.join(MODEL_DIR, 'anomaly_model.pkl'))
            
            # 2. Failure Classification (ระบุประเภทความเสียหาย)
            loaded_models['failure'] = joblib.load(os.path.join(MODEL_DIR, 'failure_model.pkl'))
            loaded_models['failure_encoder'] = joblib.load(os.path.join(MODEL_DIR, 'failure_label_encoder.pkl'))
            
            # 3. Predictive Maintenance (ทำนายวันซ่อม)
            loaded_models['maintenance'] = joblib.load(os.path.join(MODEL_DIR, 'maintenance_model.pkl'))
            loaded_models['scaler'] = joblib.load(os.path.join(MODEL_DIR, 'maintenance_scaler.pkl'))
            
            print("✅ All 5 Models loaded successfully")
        except Exception as e:
            print(f"❌ Error loading models: {e}")
            # (Optional) อาจจะโหลด Mock model กันตายไว้ตรงนี้ถ้าจำเป็น

# ใช้ Route นี้เพื่อให้ตรงกับ next.config.mjs ที่ Rewrite มา
@app.route('/api/predict', methods=['POST'])
def predict():
    load_models() # เรียกโหลดโมเดล (ถ้ามีแล้วมันจะข้าม function นี้ไปเอง)
    
    # เช็คความพร้อมของโมเดลหลัก
    if 'anomaly' not in loaded_models:
        return jsonify({'status': 'error', 'message': 'Models failed to load'}), 500

    try:
        data = request.json
        servers = data.get('servers', [])
        results = []

        # ดึงโมเดลออกจาก Dictionary เพื่อให้เรียกใช้ง่ายๆ
        anomaly_model = loaded_models['anomaly']
        failure_model = loaded_models['failure']
        failure_encoder = loaded_models['failure_encoder']
        maintenance_model = loaded_models['maintenance']
        scaler = loaded_models['scaler']

        for server in servers:
            # ---------------------------------------------------------
            # ⚠️ STEP 1: เตรียม Features (ต้องเรียงตามตอน Train เป๊ะๆ)
            # สมมติลำดับเป็น: [CPU, Memory, Temperature, Disk, Network]
            # ---------------------------------------------------------
            features = [
                server['cpu'],
                server['memory'],
                server['temperature'],
                server.get('disk', 0),
                server.get('network', 0)
            ]
            
            # แปลงเป็น Numpy Array 2D (Model ต้องการแบบ [[x, y, z]])
            input_data = np.array([features])

            # ---------------------------------------------------------
            # ⚠️ STEP 2: Anomaly Detection (ปกติ/ผิดปกติ)
            # ---------------------------------------------------------
            # ส่วนใหญ่ 1 = ผิดปกติ, 0 = ปกติ (เช็ค Model คุณอีกทีว่า output เป็นอะไร)
            is_anomaly_pred = anomaly_model.predict(input_data)[0]
            is_anomaly = True if is_anomaly_pred == 1 else False

            # ---------------------------------------------------------
            # ⚠️ STEP 3: Failure Type (ถ้าผิดปกติ มันคืออะไร?)
            # ---------------------------------------------------------
            failure_type = "None"
            if is_anomaly:
                try:
                    fail_pred_index = failure_model.predict(input_data)[0]
                    # แปลงตัวเลขกลับเป็นชื่อ (เช่น 0 -> "Fan Failure")
                    failure_type = failure_encoder.inverse_transform([fail_pred_index])[0]
                except:
                    failure_type = "Unknown Error"

            # ---------------------------------------------------------
            # ⚠️ STEP 4: Predictive Maintenance (อีกกี่วันพัง?)
            # ---------------------------------------------------------
            # ต้อง Scale ข้อมูลก่อนส่งเข้า Model เสมอ (ถ้าตอนเทรนมีการ Scale)
            try:
                scaled_data = scaler.transform(input_data)
                days_until = maintenance_model.predict(scaled_data)[0]
            except:
                days_until = 365 # ค่า Default กรณี error

            # ---------------------------------------------------------
            # ⚠️ STEP 5: คำนวณ Health Score ใหม่
            # ---------------------------------------------------------
            new_health_score = server.get('healthScore', 100)
            
            if is_anomaly:
                new_health_score -= 20
            
            if days_until < 7:
                new_health_score -= 15
            elif days_until < 30:
                new_health_score -= 5
                
            # จำกัดค่าให้อยู่ในช่วง 0-100
            new_health_score = max(0, min(100, new_health_score))

            # เก็บผลลัพธ์
            results.append({
                'id': server['id'],
                'isAnomaly': bool(is_anomaly),
                'failureType': str(failure_type),
                'maintenanceDays': float(days_until),
                'newHealthScore': int(new_health_score)
            })

        return jsonify({'status': 'success', 'predictions': results})

    except Exception as e:
        print(f"Prediction logic error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Vercel ต้องการบรรทัดนี้
if __name__ == '__main__':
    app.run(debug=True)