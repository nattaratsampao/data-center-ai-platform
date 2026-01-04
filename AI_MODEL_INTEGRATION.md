# คู่มือการเชื่อมต่อ AI Models ที่เทรนเสร็จแล้ว

## ภาพรวม

ระบบนี้พร้อมรับ AI models 3 ประเภทที่คุณเทรนมา:
1. **Anomaly Detection** - ตรวจจับความผิดปกติ
2. **Predictive Maintenance** - ทำนายการบำรุงรักษา
3. **Optimization** - เพิ่มประสิทธิภาพระบบ

## วิธีเชื่อมต่อ Models ของคุณ

### ขั้นตอนที่ 1: Export Model

หลังจากเทรน model เสร็จแล้ว export เป็นรูปแบบที่รองรับ:

**Python (scikit-learn, XGBoost):**
```python
import joblib

# บันทึก model
joblib.dump(model, 'models/anomaly_model.pkl')
```

**TensorFlow/Keras:**
```python
model.save('models/maintenance_model.h5')
```

**PyTorch:**
```python
torch.save(model.state_dict(), 'models/optimization_model.pth')
```

### ขั้นตอนที่ 2: สร้าง Python API Server

สร้างไฟล์ `python_api/server.py`:

```python
from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# โหลด models
anomaly_model = joblib.load('../models/anomaly_model.pkl')
maintenance_model = joblib.load('../models/maintenance_model.pkl')
optimization_model = joblib.load('../models/optimization_model.pkl')

@app.route('/predict/anomaly', methods=['POST'])
def predict_anomaly():
    data = request.json
    
    # แปลง input เป็น format ที่ model ต้องการ
    features = np.array([[
        data['temperature'],
        data['humidity'],
        data['power'],
        data['vibration'],
        data['cpu_usage'],
        data['memory_usage']
    ]])
    
    # ทำนาย
    prediction = anomaly_model.predict(features)[0]
    confidence = anomaly_model.predict_proba(features)[0]
    
    return jsonify({
        'isAnomaly': bool(prediction),
        'confidence': float(confidence[1] * 100),
        'severity': 'critical' if confidence[1] > 0.9 else 'warning' if confidence[1] > 0.7 else 'normal'
    })

@app.route('/predict/maintenance', methods=['POST'])
def predict_maintenance():
    data = request.json
    
    features = np.array([[
        data['uptime_hours'],
        data['error_count'],
        data['temperature_avg'],
        data['cpu_usage_avg'],
        data['memory_usage_avg']
    ]])
    
    days_until = maintenance_model.predict(features)[0]
    confidence = maintenance_model.score(features)
    
    return jsonify({
        'needsMaintenance': days_until < 14,
        'daysUntilMaintenance': int(days_until),
        'confidence': float(confidence * 100)
    })

@app.route('/predict/optimization', methods=['POST'])
def predict_optimization():
    data = request.json
    servers = data['servers']
    
    # วิเคราะห์และแนะนำ
    suggestions = optimization_model.predict(servers)
    
    return jsonify({
        'suggestions': suggestions,
        'expectedSaving': calculate_savings(suggestions)
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

### ขั้นตอนที่ 3: แก้ไข Next.js API

แก้ไข `app/api/ai/predict/route.ts`:

```typescript
// แทนที่ simulation functions ด้วยการเรียก Python API
async function predictAnomaly(data: any) {
  // เรียก Python API server
  const response = await fetch('http://localhost:5000/predict/anomaly', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  return response.json()
}
```

### ขั้นตอนที่ 4: Deploy Python API

**ใช้ Docker:**
```dockerfile
FROM python:3.9

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["python", "server.py"]
```

**หรือ Deploy บน Vercel:**
ใช้ Vercel Serverless Functions (Python Runtime)

### ขั้นตอนที่ 5: อัปเดต Environment Variables

เพิ่มใน `.env.local`:
```
PYTHON_API_URL=http://localhost:5000
# หรือ production URL
# PYTHON_API_URL=https://your-python-api.vercel.app
```

## การทดสอบ Models

### ทดสอบ Anomaly Detection:
```bash
curl -X POST http://localhost:3000/api/ai/predict \
  -H "Content-Type: application/json" \
  -d '{
    "modelType": "anomaly",
    "inputData": {
      "temperature": 35,
      "humidity": 60,
      "power": 15,
      "vibration": 2.5,
      "cpu_usage": 85,
      "memory_usage": 75
    }
  }'
```

### ทดสอบ Predictive Maintenance:
```bash
curl -X POST http://localhost:3000/api/ai/predict \
  -H "Content-Type: application/json" \
  -d '{
    "modelType": "maintenance",
    "inputData": {
      "server_id": "srv1",
      "uptime_hours": 8000,
      "error_count": 15,
      "temperature_avg": 32,
      "cpu_usage_avg": 75,
      "memory_usage_avg": 80
    }
  }'
```

## Unity ML-Agents Integration

หาก models มาจาก Unity ML-Agents (.onnx):

1. วางไฟล์ `.onnx` ใน `public/models/`
2. ใช้ ONNX Runtime ใน Python API:

```python
import onnxruntime as ort

session = ort.InferenceSession("models/datacenter_agent.onnx")
input_name = session.get_inputs()[0].name

def predict_with_onnx(features):
    return session.run(None, {input_name: features})
```

## Production Checklist

- [ ] Export models ที่เทรนเสร็จแล้ว
- [ ] สร้าง Python API server
- [ ] ทดสอบ API endpoints ทั้งหมด
- [ ] อัปเดต Next.js API routes
- [ ] Deploy Python API
- [ ] ตั้งค่า Environment Variables
- [ ] ทดสอบ integration แบบ end-to-end
- [ ] Monitor model performance
- [ ] Setup logging และ error handling

## หมายเหตุ

- ตอนนี้ระบบใช้ **simulation** เพื่อแสดง prototype
- เมื่อ models พร้อมแล้ว เพียงแค่แทนที่ functions ใน `app/api/ai/predict/route.ts`
- ระบบรองรับ real-time data updates ทุก 3 วินาที
- ค่าต่างๆ จะเปลี่ยนแปลงตาม workload patterns จริง
