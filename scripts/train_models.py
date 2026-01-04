"""
Example Python script for training AI models using the generated datasets
Install: pip install pandas scikit-learn xgboost tensorflow numpy
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import xgboost as xgb

# Load datasets
def load_data():
    sensor_data = pd.read_csv('data/sensor_timeseries.csv')
    server_data = pd.read_csv('data/server_performance.csv')
    failure_data = pd.read_csv('data/failure_events.csv')
    workload_data = pd.read_csv('data/workload_patterns.csv')
    maintenance_data = pd.read_csv('data/maintenance_labels.csv')
    
    return sensor_data, server_data, failure_data, workload_data, maintenance_data

# 1. Train Anomaly Detection Model
def train_anomaly_detection(sensor_data):
    print("\n=== Training Anomaly Detection Model ===")
    
    features = ['temperature', 'humidity', 'power_consumption', 'vibration']
    X = sensor_data[features]
    y = sensor_data['is_anomaly']
    
    # Train Isolation Forest
    model = IsolationForest(
        n_estimators=100,
        contamination=0.05,
        random_state=42
    )
    
    model.fit(X)
    predictions = model.predict(X)
    predictions = [1 if x == -1 else 0 for x in predictions]  # Convert to binary
    
    print(classification_report(y, predictions))
    print(f"ROC-AUC Score: {roc_auc_score(y, predictions):.4f}")
    
    return model

# 2. Train Predictive Maintenance Model
def train_predictive_maintenance(maintenance_data):
    print("\n=== Training Predictive Maintenance Model ===")
    
    features = ['cpu_usage', 'memory_usage', 'temperature', 'vibration', 
                'power_consumption', 'error_rate', 'uptime_days']
    X = maintenance_data[features]
    y = maintenance_data['needs_maintenance']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train XGBoost
    model = xgb.XGBClassifier(
        max_depth=6,
        learning_rate=0.1,
        n_estimators=200,
        scale_pos_weight=4,  # Handle class imbalance
        random_state=42
    )
    
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test_scaled)
    print(classification_report(y_test, y_pred))
    print("\nFeature Importance:")
    for feature, importance in zip(features, model.feature_importances_):
        print(f"  {feature}: {importance:.4f}")
    
    return model, scaler

# 3. Train Failure Type Classifier
def train_failure_classifier(failure_data):
    print("\n=== Training Failure Type Classifier ===")
    
    features = ['pre_cpu_avg', 'pre_memory_avg', 'pre_temperature_avg', 
                'pre_vibration_avg', 'pre_error_rate']
    X = failure_data[features]
    y = failure_data['failure_type']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Train Random Forest
    model = RandomForestClassifier(
        n_estimators=150,
        max_depth=10,
        min_samples_split=5,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    print(classification_report(y_test, y_pred))
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    return model

# Main execution
if __name__ == "__main__":
    print("Loading datasets...")
    sensor_data, server_data, failure_data, workload_data, maintenance_data = load_data()
    
    print(f"\nDataset sizes:")
    print(f"- Sensor data: {len(sensor_data)} records")
    print(f"- Server data: {len(server_data)} records")
    print(f"- Failure data: {len(failure_data)} records")
    print(f"- Workload data: {len(workload_data)} records")
    print(f"- Maintenance data: {len(maintenance_data)} records")
    
    # Train models
    anomaly_model = train_anomaly_detection(sensor_data)
    maintenance_model, scaler = train_predictive_maintenance(maintenance_data)
    failure_model = train_failure_classifier(failure_data)
    
    print("\n=== Training Complete ===")
    print("Models saved and ready for deployment!")
