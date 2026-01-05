/**
 * Script to generate synthetic training data for Data Center AI models
 * VERSION: Realistic Production Edition (Target Accuracy ~92-96%)
 * Run: npx ts-node scripts/generate-training-data.ts
 */

import { writeFileSync, existsSync, mkdirSync } from "fs";
import * as path from "path";

// ==========================================
// ⚙️ CONFIGURATION
// ==========================================
const CONFIG = {
  DAYS_HISTORY: 90,          // ย้อนหลัง 90 วัน
  ANOMALY_RATE: 0.15,        // 15% Anomaly Rate
  MAINTENANCE_RATE: 0.25,    // 25% Maintenance Needed
  SERVER_COUNT: 50,          // 50 Servers
  FAILURE_EVENT_COUNT: 3000, // จำนวนข้อมูล Failure (เยอะพอให้เรียนรู้)
};

// Ensure data directory exists
const dataDir = path.join(process.cwd(), "data");
if (!existsSync(dataDir)) {
  mkdirSync(dataDir);
}

// Helper: Calculate Statistics
function calculateStats(data: any[], key: string, valueToCheck: any) {
  const count = data.filter((item) => item[key] === valueToCheck).length;
  const percentage = ((count / data.length) * 100).toFixed(2);
  return { count, percentage };
}

// ==========================================
// 1. GENERATE SENSOR DATA (Anomaly Detection)
// ==========================================
function generateSensorData(days = 30) {
  const data: any[] = [];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  console.log(`...Generating Sensor Data (${days} days)`);

  for (let i = 0; i < days * 24 * 12; i++) { // Every 5 mins
    const timestamp = new Date(startDate.getTime() + i * 5 * 60 * 1000);
    const hour = timestamp.getHours();
    
    // Anomaly Logic
    const isAnomaly = Math.random() < CONFIG.ANOMALY_RATE; 

    // Base Patterns (Sine Wave)
    const baseTemp = 22 + Math.sin((hour / 24) * Math.PI * 2) * 3;
    const baseHumidity = 45 + Math.sin((hour / 24) * Math.PI * 2) * 5;
    const basePower = 5000 + Math.sin((hour / 24) * Math.PI * 2) * 1000;

    let temp, humid, power, vib;

    if (isAnomaly) {
      // ⚠️ Abnormal
      temp = baseTemp + 15 + Math.random() * 20;
      humid = baseHumidity + Math.random() * 30;
      power = basePower * (1.5 + Math.random());
      vib = 2.0 + Math.random() * 5.0;
    } else {
      // ✅ Normal (With Noise)
      temp = baseTemp + (Math.random() - 0.5) * 2;
      humid = baseHumidity + (Math.random() - 0.5) * 5;
      power = basePower + (Math.random() - 0.5) * 200;
      vib = 0.1 + Math.random() * 0.5;
    }

    data.push({
      timestamp: timestamp.toISOString(),
      server_rack: `R${Math.floor(Math.random() * 10) + 1}`,
      temperature: parseFloat(temp.toFixed(2)),
      humidity: parseFloat(humid.toFixed(2)),
      power_consumption: parseFloat(power.toFixed(2)),
      vibration: parseFloat(vib.toFixed(4)),
      is_anomaly: isAnomaly ? 1 : 0,
    });
  }
  return data;
}

// ==========================================
// 2. GENERATE SERVER PERFORMANCE
// ==========================================
function generateServerPerformanceData(days = 30) {
  const data: any[] = [];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  console.log(`...Generating Server Performance (${CONFIG.SERVER_COUNT} servers)`);

  for (let serverId = 1; serverId <= CONFIG.SERVER_COUNT; serverId++) {
    for (let i = 0; i < days * 24; i++) { // Hourly
      const timestamp = new Date(startDate.getTime() + i * 60 * 60 * 1000);
      const hour = timestamp.getHours();
      
      const isCritical = Math.random() < 0.10; 
      
      const baseCPU = 30 + Math.sin((hour / 24) * Math.PI * 2) * 20;
      const baseMem = 40 + Math.sin((hour / 24) * Math.PI * 2) * 10;

      data.push({
        timestamp: timestamp.toISOString(),
        server_id: `SRV-${serverId.toString().padStart(3, "0")}`,
        cpu_usage: isCritical ? 90 + Math.random() * 10 : baseCPU + (Math.random() - 0.5) * 10, 
        memory_usage: isCritical ? 85 + Math.random() * 15 : baseMem + (Math.random() - 0.5) * 10,
        disk_io: Math.random() * 100,
        network_throughput: Math.random() * 1000,
        response_time: isCritical ? 500 + Math.random() * 1000 : 20 + Math.random() * 50,
        error_rate: isCritical ? 0.05 + Math.random() * 0.2 : Math.random() * 0.005,
        health_score: isCritical ? 20 + Math.random() * 30 : 85 + Math.random() * 15,
        status: isCritical ? "Critical" : "Healthy"
      });
    }
  }
  return data;
}

// ==========================================
// 3. GENERATE MAINTENANCE LABELS
// ==========================================
function generateMaintenanceLabels(count = 2000) {
  const data: any[] = [];
  console.log(`...Generating Maintenance Labels (${count} samples)`);

  for (let i = 0; i < count; i++) {
    const needsMaintenance = Math.random() < CONFIG.MAINTENANCE_RATE;
    const noise = Math.random() * 10; 

    data.push({
      sample_id: i,
      cpu_usage: needsMaintenance ? 70 + Math.random() * 30 : 20 + Math.random() * 40 + noise,
      memory_usage: needsMaintenance ? 75 + Math.random() * 25 : 30 + Math.random() * 40,
      temperature: needsMaintenance ? 35 + Math.random() * 15 : 20 + Math.random() * 10,
      vibration: needsMaintenance ? 3.5 + Math.random() * 5.0 : 0.2 + Math.random() * 2.0,
      power_consumption: needsMaintenance ? 7000 + Math.random() * 2000 : 4000 + Math.random() * 1500,
      error_rate: needsMaintenance ? 0.05 + Math.random() * 0.1 : 0.001 + Math.random() * 0.02,
      uptime_days: needsMaintenance ? Math.random() * 60 : 10 + Math.random() * 200,
      needs_maintenance: needsMaintenance ? 1 : 0,
    });
  }
  return data;
}

// ==========================================
// 4. GENERATE FAILURE EVENTS (REALISTIC EDITION)
// ==========================================
function generateFailureEvents(count = 3000) {
  const data: any[] = [];
  const failureTypes = [
    "CPU Overload", "Memory Leak", "Disk Failure", 
    "Network Timeout", "Power Spike", "Cooling Failure", 
    "Hardware Error", "Software Crash"
  ];
  console.log(`...Generating Failure Events (With realistic noise & overlap)`);

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.random() * 90;
    const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const type = failureTypes[Math.floor(Math.random() * failureTypes.length)];

    // Initialize Base Values (Normal Baseline)
    let preCPU = 40 + Math.random() * 20;
    let preMem = 40 + Math.random() * 20;
    let preTemp = 22 + Math.random() * 5;
    let preVib = 0.5 + Math.random() * 1;
    let preError = 0.001;
    let preNetworkLatency = 20 + Math.random() * 30; // ms
    let preVoltageFluct = 0.1 + Math.random() * 0.5; // %
    let preDiskWait = 5 + Math.random() * 10; // ms

    // 🎲 CONFUSION FACTOR (15% Chance)
    // สร้างเคสที่อาการไม่ชัดเจน หรือ ขัดแย้งกับทฤษฎี (Noise) เพื่อดึง Accuracy ลงมา
    const isAmbiguous = Math.random() < 0.15; 

    if (isAmbiguous) {
        // --- AMBIGUOUS CASES (Hard for AI) ---
        switch (type) {
            case "Software Crash":
                // Crash โดยที่ resource ปกติทุกอย่าง (เกิดขึ้นจริงบ่อย)
                break; 
            case "Network Timeout":
                // เน็ตหลุด แต่ Latency ไม่สูง (อาจเป็นที่ Firewall/DNS)
                preNetworkLatency = 40 + Math.random() * 20; 
                break;
            case "Cooling Failure":
                // แอร์เสีย แต่ Sensor ยังจับความร้อนไม่ได้ทันที
                preTemp = 28 + Math.random() * 5; 
                break;
            case "CPU Overload":
                 // CPU สูงแต่ไม่มาก (คาบเส้น)
                 preCPU = 75 + Math.random() * 5;
                 break;
        }
    } else {
        // --- CLEAR CASES (With some overlaps) ---
        switch (type) {
            case "CPU Overload":
                preCPU = 85 + Math.random() * 15; 
                preTemp = 35 + Math.random() * 10;
                // [Overlap] ใส่ Noise ให้คล้าย Cooling Failure บ้าง
                if(Math.random() > 0.5) preVib += 1; 
                break;

            case "Cooling Failure":
                preTemp = 45 + Math.random() * 20; 
                // [Overlap] Cooling เสีย ทำให้ CPU ร้อนจนทำงานหนักได้เหมือนกัน
                preCPU = 75 + Math.random() * 15; 
                break;

            case "Memory Leak":
                preMem = 90 + Math.random() * 10; 
                // [Overlap] แรมเต็ม -> Swap -> Disk Wait สูง (คล้าย Disk Failure)
                if(Math.random() > 0.7) preDiskWait = 100 + Math.random() * 200;
                break;

            case "Disk Failure":
                preDiskWait = 500 + Math.random() * 1000; // Distinct Feature
                preError = 0.1 + Math.random() * 0.1;
                break;

            case "Network Timeout":
                preNetworkLatency = 1000 + Math.random() * 3000; // Distinct Feature
                preError = 0.2 + Math.random() * 0.3;
                break;

            case "Power Spike":
                preVoltageFluct = 3.0 + Math.random() * 10.0; // Distinct Feature
                // [Overlap] ไฟกระชาก อาจทำ Network หลุด
                if(Math.random() > 0.8) preNetworkLatency += 200;
                break;

            case "Hardware Error":
                preVib = 4.0 + Math.random() * 5.0; // Distinct Feature
                preError = 0.05 + Math.random() * 0.1;
                break;

            case "Software Crash":
                preError = 0.5 + Math.random() * 0.5; 
                preMem = 60 + Math.random() * 30; // บางที Memory Spike ก่อนดับ
                break;
        }
    }

    data.push({
      event_id: `EVT-${i.toString().padStart(5, "0")}`,
      timestamp: timestamp.toISOString(),
      server_id: `SRV-${Math.floor(Math.random() * 50 + 1)}`,
      failure_type: type,
      severity: ["Critical", "Warning", "Error"][Math.floor(Math.random() * 3)],
      
      // Standard Features
      pre_cpu_avg: parseFloat(preCPU.toFixed(2)),
      pre_memory_avg: parseFloat(preMem.toFixed(2)),
      pre_temperature_avg: parseFloat(preTemp.toFixed(2)),
      pre_vibration_avg: parseFloat(preVib.toFixed(2)),
      pre_error_rate: parseFloat(preError.toFixed(4)),

      // [NEW] Advanced Features for Precision
      pre_network_latency: parseFloat(preNetworkLatency.toFixed(2)),
      pre_voltage_fluctuation: parseFloat(preVoltageFluct.toFixed(2)),
      pre_disk_io_wait: parseFloat(preDiskWait.toFixed(2))
    });
  }
  return data;
}

// ==========================================
// 5. GENERATE WORKLOAD PATTERNS
// ==========================================
function generateWorkloadPatterns(days = 30) {
  const data: any[] = [];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  console.log(`...Generating Workload Patterns (${days} days)`);

  for (let i = 0; i < days * 24; i++) {
    const timestamp = new Date(startDate.getTime() + i * 60 * 60 * 1000);
    const hour = timestamp.getHours();
    const dayOfWeek = timestamp.getDay();

    const isBusinessHours = hour >= 9 && hour <= 18;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let baseLoad = 30;
    if (isBusinessHours && !isWeekend) baseLoad = 80;
    else if (isBusinessHours && isWeekend) baseLoad = 50;

    if (Math.random() < 0.02) baseLoad = 120; // Flash Crowd

    data.push({
      timestamp: timestamp.toISOString(),
      total_requests: Math.floor(baseLoad * 1000 + (Math.random() - 0.5) * 2000),
      active_connections: Math.floor(baseLoad * 50 + (Math.random() - 0.5) * 200),
      cpu_utilization: Math.min(100, baseLoad + (Math.random() - 0.5) * 10),
      memory_utilization: Math.min(100, baseLoad * 0.8 + (Math.random() - 0.5) * 10),
    });
  }
  return data;
}

// =========================================
// MAIN EXECUTION
// =========================================
console.log("\n============================================");
console.log("🏭  GENERATING DATA CENTER SYNTHETIC DATA  ");
console.log("    Version: Realistic Edition (Noise Added)");
console.log("============================================\n");

// 1. Run Generators
const sensorData = generateSensorData(CONFIG.DAYS_HISTORY);
const serverData = generateServerPerformanceData(CONFIG.DAYS_HISTORY);
const maintData = generateMaintenanceLabels(2000);
const failureEvents = generateFailureEvents(CONFIG.FAILURE_EVENT_COUNT);
const workloadPatterns = generateWorkloadPatterns(CONFIG.DAYS_HISTORY);

// 2. Calculate Stats
const sensorStats = calculateStats(sensorData, 'is_anomaly', 1);
const serverStats = calculateStats(serverData, 'status', 'Critical');
const maintStats = calculateStats(maintData, 'needs_maintenance', 1);

// 3. Print Report
console.log("\n--------------------------------------------");
console.log("📊  DATASET STATISTICS REPORT");
console.log("--------------------------------------------");

console.log(`[1] Sensor Data (Anomaly Detection)`);
console.log(`    - Total Records: ${sensorData.length.toLocaleString()}`);
console.log(`    - 🔴 Anomalies: ${sensorStats.count.toLocaleString()} (${sensorStats.percentage}%)`);

console.log(`\n[2] Server Performance (Health)`);
console.log(`    - Total Records: ${serverData.length.toLocaleString()}`);
console.log(`    - 🔴 Critical State: ${serverStats.count.toLocaleString()} (${serverStats.percentage}%)`);

console.log(`\n[3] Maintenance Labels (Classification)`);
console.log(`    - Total Samples: ${maintData.length.toLocaleString()}`);
console.log(`    - 🔧 Need Repair: ${maintStats.count.toLocaleString()} (${maintStats.percentage}%)`);

console.log(`\n[4] Failure Events (Target Optimization)`);
console.log(`    - Total Records: ${failureEvents.length.toLocaleString()}`);
console.log(`    - Mode: Realistic (Includes ambigous/noisy data)`);

console.log(`\n[5] Workload History`);
console.log(`    - Total Records: ${workloadPatterns.length.toLocaleString()}`);

// 4. Save Files
function toCSV(data: any[]) {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((h) => JSON.stringify(row[h])).join(","));
  return [headers.join(","), ...rows].join("\n");
}

console.log("\n--------------------------------------------");
console.log("💾 Saving files to ./data folder...");

writeFileSync("data/sensor_timeseries.csv", toCSV(sensorData));
writeFileSync("data/server_performance.csv", toCSV(serverData));
writeFileSync("data/maintenance_labels.csv", toCSV(maintData));
writeFileSync("data/failure_events.csv", toCSV(failureEvents));
writeFileSync("data/workload_patterns.csv", toCSV(workloadPatterns));

console.log("✅ All files saved successfully!");
console.log("============================================\n");