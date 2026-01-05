import { NextResponse } from "next/server"
import { initializeServers, updateSimulation, getServerStates, getActiveEvents } from "@/lib/event-simulator"

// Initialize on first load (ทำครั้งเดียวตอน Server Start)
let initialized = false
if (!initialized) {
  initializeServers()
  initialized = true
}

// ❌ ลบ setInterval ออก เพราะใน Serverless function มันจะทำงานไม่ต่อเนื่อง
// เราจะใช้การ updateSimulation() ทุกครั้งที่มี Request เข้ามาแทน

export async function GET() {
  // ✅ อัปเดต Simulation ทันทีที่มีคนเรียก API
  updateSimulation()

  const data = generateRealtimeData()
  return NextResponse.json(data)
}

function generateRealtimeData() {
  const now = new Date() // ใช้ Date Object เลย
  const timestamp = now.toISOString()
  
  const serverStates = getServerStates()
  const activeEvents = getActiveEvents()

  // แปลงข้อมูล Server
  const servers = serverStates.map((server) => ({
    id: server.id,
    name: server.name,
    cpu: Math.round(server.cpu),
    memory: Math.round(server.memory),
    temperature: Math.round(server.temperature * 10) / 10,
    network: Math.round(server.network),
    status: server.status,
    healthScore: Math.round(server.healthScore),
    location: server.id.includes("1") || server.id.includes("2") ? "Zone A" : "Zone B", // เพิ่ม Location ให้ตรง Frontend
    activeEvents: server.activeEvents.length,
  }))

  // --- ส่วนที่แก้: สร้าง Sensors ให้เป็น Array เดียวกัน (Flatten) ---
  const sensorList = []

  // 1. Generate Temperature Sensors
  for (let i = 1; i <= 8; i++) {
    sensorList.push({
      id: `temp-${i}`,
      type: "temperature", // ✅ ระบุ Type ให้ชัดเจน
      name: `Temp Sensor ${i}`,
      value: Math.round((23 + Math.random() * 5 + Math.sin(now.getTime() / 15000 + i) * 3) * 10) / 10,
      unit: "°C",
      status: Math.random() > 0.9 ? "warning" : "normal",
      location: i <= 4 ? "Rack A" : "Rack B",
      lastUpdated: timestamp, // ส่งเป็น String ไปก่อน Frontend จะแปลงเอง
    })
  }

  // 2. Generate Humidity Sensors
  for (let i = 1; i <= 4; i++) {
    sensorList.push({
      id: `hum-${i}`,
      type: "humidity",
      name: `Hum Sensor ${i}`,
      value: Math.round(45 + Math.random() * 10 + Math.cos(now.getTime() / 20000 + i) * 5),
      unit: "%",
      status: "normal",
      location: i <= 2 ? "Rack A" : "Rack B",
      lastUpdated: timestamp,
    })
  }

  // 3. Generate Power Sensor (Main)
  const totalPower = Math.round((28 + Math.random() * 6) * 10) / 10
  sensorList.push({
    id: "pwr-main",
    type: "power",
    name: "Main Power Input",
    value: totalPower,
    unit: "kW",
    status: totalPower > 33 ? "warning" : "normal",
    location: "Main Distribution",
    lastUpdated: timestamp,
  })

  // 4. Generate Vibration Sensor
  sensorList.push({
    id: "vib-1",
    type: "vibration",
    name: "Cooling Unit Vib",
    value: Math.round((0.5 + Math.random() * 0.4) * 10) / 10,
    unit: "mm/s",
    status: "normal",
    location: "Cooling Zone",
    lastUpdated: timestamp,
  })

  // Calculate stats
  const onlineServers = servers.filter((s) => s.status === "online" || s.status === "warning").length
  const avgTemp = Math.round((servers.reduce((sum, s) => sum + s.temperature, 0) / servers.length) * 10) / 10

  return {
    timestamp: timestamp,
    
    servers,

    // ✅ ส่ง sensors เป็น Array ตามที่ Frontend ต้องการ
    sensors: sensorList, 

    activeEvents: activeEvents.map((event) => ({
      id: event.id,
      type: event.type,
      serverId: event.serverId,
      serverName: event.serverName,
      severity: event.severity,
      title: event.title,
      description: event.description,
      timestamp: event.timestamp,
      aiResponse: event.aiResponse,
      resolved: event.resolved,
    })),

    // Stats รวม
    stats: {
      totalServers: servers.length,
      onlineServers,
      avgTemperature: avgTemp,
      avgCPU: Math.round(servers.reduce((sum, s) => sum + s.cpu, 0) / servers.length),
      powerUsage: Math.round(65 + Math.random() * 20),
      pue: Math.round((1.35 + Math.random() * 0.15) * 100) / 100,
    },

    aiInsights: {
      anomalyDetected: activeEvents.some((e) => e.type === "anomaly" || e.severity === "critical"),
      predictiveAlerts: activeEvents.filter((e) => e.type.includes("prediction")).length,
      optimizationsSuggested: Math.floor(Math.random() * 5),
      confidenceScore: Math.round((85 + Math.random() * 10) * 10) / 10,
    },
  }
}