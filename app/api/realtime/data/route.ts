import { NextResponse } from "next/server"
import { 
  initializeServers, 
  updateSimulation, 
  getServerStates, 
  getActiveEvents,
  getSensorStates // ✅ เราจะใช้ตัวนี้ดึงค่า Sensor รวม
} from "@/lib/event-simulator"

// --------------------------------------------------------
// 1️⃣ CONFIG: ใส่ URL ของ Python Server (Render)
// --------------------------------------------------------
const PYTHON_API_URL = "https://datacenter-api-4o3g.onrender.com"; 
// อย่าลืมแก้ URL ให้ตรงกับของจริงนะครับ!

// Initialize on first load
let initialized = false
if (!initialized) {
  initializeServers()
  initialized = true
}

// Helper Function: ยิงไปถาม AI
async function getPredictionFromPython(features: number[], endpoint: string) {
    try {
        const res = await fetch(`${PYTHON_API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ features: features }),
            cache: 'no-store'
        });

        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error(`AI Error (${endpoint}):`, error);
        return null; // ถ้า AI ล่ม ให้ return null (เว็บจะได้ไม่พัง)
    }
}

export async function GET() {
  updateSimulation() // ขยับค่าตัวเลขต่างๆ (Simulation Step)

  const serverStates = getServerStates()
  const activeEvents = getActiveEvents()
  const sensorStates = getSensorStates() 

  // เตรียมตัวแปรสำหรับสรุปภาพรวม
  let totalMaintenanceNeeded = 0;
  let criticalEvents = 0;

  // --------------------------------------------------------
  // 2️⃣ SERVER LOOP: วนลูปทุก Server เพื่อถาม AI (Model 2 & 3)
  // --------------------------------------------------------
  const serversWithAI = await Promise.all(serverStates.map(async (server) => {
    
    // จัดการเรื่อง Rack Name (ตาม Logic เดิม)
    let rackName = "Rack C";
    const idNum = parseInt(server.id.replace("srv", "")); // ตัด srv ออกเหลือแค่เลข
    if (!isNaN(idNum)) {
        if (idNum <= 3) rackName = "Rack A";
        else if (idNum <= 6) rackName = "Rack B";
    }

    // --- เตรียม Features ให้ตรงกับ Python Model (Maintenance) ---
    // Model ต้องการ: [cpu, mem, temp, vibration, power, error_rate, uptime]
    // แต่ ServerState เรามีไม่ครบ เราต้อง "Estimate" บางค่าจากข้อมูลที่มี
    
    // 1. Vibration: ถ้ามี Event สั่นสะเทือน ให้ค่าสูง, ถ้าไม่มีให้ค่าต่ำ
    const vibrationEvent = server.activeEvents.find(e => e.type === 'vibration_alert');
    const estVibration = vibrationEvent ? 0.8 : 0.02 + (Math.random() * 0.05);

    // 2. Power (Individual): ประมาณการจาก CPU (สมมติ Max 500W)
    const estPower = 100 + (server.cpu / 100) * 400; 

    // 3. Error Rate: คำนวณกลับจาก HealthScore
    const estErrorRate = (100 - server.healthScore) / 100;

    // 4. Uptime: สมมติค่าไปก่อน (หรือจะเก็บใน state ก็ได้)
    const estUptime = 120; // days

    const maintenanceFeatures = [
        server.cpu,
        server.memory,
        server.temperature,
        estVibration,
        estPower,
        estErrorRate,
        estUptime
    ];

    // --- ยิงถาม AI ---
    const maintResult = await getPredictionFromPython(maintenanceFeatures, "/predict/maintenance");

    // รับผลจาก AI
    let needsMaintenance = false;
    let breakdownProb = 0;

    if (maintResult) {
        needsMaintenance = maintResult.needs_maintenance;
        breakdownProb = maintResult.breakdown_probability; // ค่า 0.0 - 1.0
        if (needsMaintenance) totalMaintenanceNeeded++;
    }

    // ตรวจสอบ Event critical
    if (server.status === 'critical') criticalEvents++;

    return {
      ...server,
      // ปัดเศษทศนิยมให้สวยงามก่อนส่งกลับ
      cpu: Math.round(server.cpu),
      memory: Math.round(server.memory),
      temperature: Math.round(server.temperature * 10) / 10,
      network: Math.round(server.network),
      healthScore: Math.round(server.healthScore),
      rack: rackName,
      activeEvents: server.activeEvents.length,
      
      // ✅ ข้อมูลชุดใหม่จาก AI
      aiAnalysis: {
          needsMaintenance: needsMaintenance,
          breakdownProbability: Math.round(breakdownProb * 100) // แปลงเป็น %
      }
    };
  }));

  // --------------------------------------------------------
  // 3️⃣ SYSTEM ANOMALY: ถาม AI ภาพรวม (Model 1)
  // --------------------------------------------------------
  // Model ต้องการ: [avg_temp, humidity, total_power, avg_vibration]
  
  // ดึงค่าจาก Sensors จริงๆ ใน Simulator
  const avgTemp = Math.round((serversWithAI.reduce((sum, s) => sum + s.temperature, 0) / serversWithAI.length) * 10) / 10;
  const humiditySensor = sensorStates.find(s => s.type === 'humidity');
  const powerSensor = sensorStates.find(s => s.type === 'power');
  const vibSensor = sensorStates.find(s => s.type === 'vibration');

  const anomalyFeatures = [
      avgTemp, 
      humiditySensor ? humiditySensor.value : 50,  // ถ้าหาไม่เจอใช้ค่ากลาง 50
      powerSensor ? powerSensor.value : 25000,     // ถ้าหาไม่เจอใช้ค่าสมมติ
      vibSensor ? vibSensor.value : 0.5
  ];

  const anomalyResult = await getPredictionFromPython(anomalyFeatures, "/predict/anomaly");
  const isSystemAnomaly = anomalyResult ? anomalyResult.is_anomaly : false;


  // --------------------------------------------------------
  // 4️⃣ FINAL RESPONSE: ประกอบร่างส่งกลับหน้าเว็บ
  // --------------------------------------------------------
  const timestamp = new Date().toISOString();
  
  // Format Sensors ให้สวยงาม
  const formattedSensors = sensorStates.map(s => ({
    ...s,
    value: Math.round(s.value * 100) / 100, // ทศนิยม 2 ตำแหน่ง
    lastUpdated: timestamp
  }));

  const onlineServers = serversWithAI.filter((s) => s.status === "online" || s.status === "warning").length;
  const totalPowerValue = powerSensor ? powerSensor.value : 0;

  return NextResponse.json({
    timestamp: timestamp,
    servers: serversWithAI,
    sensors: formattedSensors,
    activeEvents: activeEvents.map((event) => ({
      ...event,
      timestamp: event.timestamp || timestamp,
    })),
    stats: {
      totalServers: serversWithAI.length,
      onlineServers,
      avgTemperature: avgTemp,
      avgCPU: Math.round(serversWithAI.reduce((sum, s) => sum + s.cpu, 0) / serversWithAI.length),
      powerUsage: Math.round(totalPowerValue * 10) / 10,
      pue: 1.45, // ค่า PUE คงที่ (หรือจะคำนวณจริงก็ได้)
    },
    
    // ส่วนสรุป AI Insight
    aiInsights: {
          anomalyDetected: isSystemAnomaly, // ✅ มาจาก Model 1 (Isolation Forest)
          predictiveAlerts: totalMaintenanceNeeded, // ✅ มาจาก Model 2 (XGBoost)
          
          optimizationsSuggested: Math.floor(Math.random() * 3) + 1, 
          confidenceScore: 94.5, // % ความมั่นใจ
          
          // คำนวณคะแนนสุขภาพระบบ (Maintenance Score)
          maintenanceScore: Math.max(0, 100 - (totalMaintenanceNeeded * 15) - (criticalEvents * 10)),
          loadBalancingScore: 88.5,
        },
  })
}