# AI Training Datasets for Data Center Optimization

This folder contains synthetic training data for building AI models for the Data Center Optimization Platform.

## Datasets Overview

### 1. Sensor Time-Series Data (`sensor_timeseries.json/csv`)
**Use Case:** Anomaly detection, predictive maintenance
- **Records:** ~25,920 (90 days × 24 hours × 12 samples/hour)
- **Features:**
  - `timestamp`: ISO timestamp
  - `server_rack`: Rack identifier (R1-R10)
  - `temperature`: Temperature in °C (18-32°C)
  - `humidity`: Relative humidity % (35-65%)
  - `power_consumption`: Power in Watts (3000-8000W)
  - `vibration`: Vibration level (0-5)
  - `is_anomaly`: Boolean label (5% anomaly rate)
  - `failure_within_24h`: Boolean - whether failure occurred within 24h

**Training Suggestions:**
- Use for time-series anomaly detection (LSTM, GRU, Transformer)
- Train binary classifier for failure prediction
- Feature engineering: rolling averages, rate of change, time of day

---

### 2. Server Performance Data (`server_performance.json/csv`)
**Use Case:** Load balancing, health scoring, capacity planning
- **Records:** ~108,000 (50 servers × 90 days × 24 hours)
- **Features:**
  - `timestamp`: ISO timestamp
  - `server_id`: Server identifier (SRV-001 to SRV-050)
  - `cpu_usage`: CPU utilization % (0-100%)
  - `memory_usage`: Memory utilization % (0-100%)
  - `disk_io`: Disk I/O operations
  - `network_throughput`: Network MB/s
  - `response_time`: API response time in ms
  - `error_rate`: Error rate (0-0.1)
  - `health_score`: Overall health (0-100)
  - `needs_maintenance`: Boolean label

**Training Suggestions:**
- Predict `needs_maintenance` using ensemble models (XGBoost, Random Forest)
- Regression for `health_score` prediction
- Clustering for identifying server behavior patterns

---

### 3. Failure Events Data (`failure_events.json/csv`)
**Use Case:** Root cause analysis, failure prediction
- **Records:** 200 historical failure events
- **Features:**
  - `event_id`: Unique event identifier
  - `timestamp`: When failure occurred
  - `server_id`: Affected server
  - `failure_type`: Type of failure (8 categories)
  - `severity`: critical/warning/error
  - Pre-failure metrics (24h before):
    - `pre_cpu_avg`, `pre_memory_avg`, `pre_temperature_avg`
    - `pre_vibration_avg`, `pre_error_rate`
  - Impact metrics:
    - `downtime_minutes`, `recovery_time_minutes`, `data_loss`
  - `root_cause`: Hardware/Software/Environmental/Human Error

**Training Suggestions:**
- Multi-class classification for `failure_type` prediction
- Use pre-failure metrics as features to predict failures before they happen
- Time-to-failure regression models

---

### 4. Workload Patterns Data (`workload_patterns.json/csv`)
**Use Case:** Auto-scaling, capacity planning, cost optimization
- **Records:** 2,160 (90 days × 24 hours)
- **Features:**
  - `timestamp`: ISO timestamp
  - `total_requests`: Number of requests
  - `avg_response_time`: Average response time in ms
  - `active_connections`: Number of concurrent connections
  - `cpu_utilization`: Overall CPU usage %
  - `memory_utilization`: Overall memory usage %
  - `bandwidth_usage`: Network bandwidth in MB/s
  - `optimal_server_count`: Calculated optimal number of servers

**Training Suggestions:**
- Time-series forecasting for resource demand (ARIMA, Prophet, LSTM)
- Regression to predict `optimal_server_count`
- Pattern recognition for business hours vs off-hours

---

### 5. Maintenance Labels Data (`maintenance_labels.json/csv`)
**Use Case:** Supervised learning for predictive maintenance
- **Records:** 1,000 labeled samples
- **Features:**
  - `sample_id`: Sample identifier
  - `cpu_usage`, `memory_usage`, `temperature`, `vibration`
  - `power_consumption`, `error_rate`, `uptime_days`
  - **Labels:**
    - `needs_maintenance`: Boolean (20% positive class)
    - `estimated_days_until_failure`: Days until expected failure

**Training Suggestions:**
- Binary classification for `needs_maintenance`
- Multi-output model to predict both maintenance need and time-to-failure
- Handle class imbalance with SMOTE or weighted loss functions

---

## How to Generate Data

Run the generation script:

```bash
npx tsx scripts/generate-training-data.ts
```

This will create all datasets in both JSON and CSV formats in the `/data` folder.

---

## Model Training Recommendations

### 1. Anomaly Detection Model
**Input:** `sensor_timeseries.csv`
**Algorithm:** Isolation Forest, Autoencoder, or LSTM-based
**Target:** Detect `is_anomaly = true`
**Validation:** Use precision, recall, F1-score (imbalanced data)

### 2. Predictive Maintenance Model
**Input:** `maintenance_labels.csv` + `server_performance.csv`
**Algorithm:** XGBoost, Random Forest, or Neural Network
**Target:** Predict `needs_maintenance`
**Features:** Use rolling statistics, lag features

### 3. Failure Prediction Model
**Input:** `failure_events.csv`
**Algorithm:** Gradient Boosting, RNN
**Target:** Multi-class prediction of `failure_type`
**Features:** Pre-failure metrics (24h window)

### 4. Load Balancing Optimizer
**Input:** `workload_patterns.csv`
**Algorithm:** Time-series forecasting (Prophet, LSTM)
**Target:** Predict future workload and `optimal_server_count`
**Evaluation:** RMSE, MAE

### 5. Health Score Predictor
**Input:** `server_performance.csv`
**Algorithm:** Regression (Linear, Neural Network)
**Target:** Predict `health_score`
**Features:** All performance metrics

---

## Data Quality Notes

- **Realistic patterns:** Data includes daily/weekly cycles matching real data center behavior
- **Anomaly injection:** 5% anomaly rate with correlated failure events
- **Class balance:** Maintenance labels have 20% positive class (realistic for production)
- **Temporal consistency:** Time-series data maintains temporal ordering
- **Missing data:** No missing values in this synthetic dataset (add noise if needed)

---

## Next Steps for Real Deployment

1. **Data Collection Pipeline:**
   - Connect to actual IoT sensors and server monitoring tools
   - Set up data streaming (e.g., Apache Kafka, MQTT)
   - Store in time-series database (InfluxDB, TimescaleDB)

2. **Feature Engineering:**
   - Calculate rolling statistics (mean, std, min, max)
   - Create lag features for time-series
   - Extract time-based features (hour, day of week, holiday)

3. **Model Training:**
   - Split data: 70% train, 15% validation, 15% test
   - Use cross-validation for robust evaluation
   - Track experiments with MLflow or Weights & Biases

4. **Model Deployment:**
   - Deploy models as REST APIs or serverless functions
   - Set up model monitoring and drift detection
   - Implement A/B testing for model updates

5. **Continuous Learning:**
   - Retrain models periodically with new data
   - Implement feedback loops from operations team
   - Monitor prediction accuracy over time
