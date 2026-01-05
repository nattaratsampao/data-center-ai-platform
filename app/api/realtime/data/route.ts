import { NextResponse } from "next/server"
import { initializeServers, updateSimulation, getServerStates, getActiveEvents } from "@/lib/event-simulator"

// เพิ่มส่วนนี้ไว้บนสุดของไฟล์ route.ts ต่อจาก import
declare global {
  var simulationInterval: NodeJS.Timeout | undefined;
}

// Initialize on first load
let initialized = false
if (!initialized) {
  initializeServers()
  initialized = true
}

// ใช้ Interval จำลองเหตุการณ์ใน server side (optional)
if (!global.simulationInterval) {
  global.simulationInterval = setInterval(() => {
    const newEvent = updateSimulation()
    if (newEvent) {
      console.log(`[v0] New event generated: ${newEvent.title} on ${newEvent.serverName}`)
    }
  }, 5000)
}

export async function GET() {
  updateSimulation() // อัปเดตสถานะทุกครั้งที่มีการ request
  const data = generateRealtimeData()
  return NextResponse.json(data)
}

function generateRealtimeData() {
  const now = new Date() // ใช้ Date object เพื่อส่งไปเป็น ISOString
  const timeOfDay = now.getHours()

  const serverStates = getServerStates()
  const activeEvents = getActiveEvents()

  // 1. สร้าง Array ของ Sensors (รวมทุกประเภทไว้ใน list เดียวกัน ตามที่ Frontend ต้องการ)
  const sensors = []

  // - Temperature Sensors (8 ตัว)
  for (let i = 1; i <= 8; i++) {
    const val = 23 + Math.random() * 8 + Math.sin(now.getTime() / 15000 + i) * 3
    sensors.push({
      id: `temp-${i}`,
      type: "temperature",
      name: `Temp Sensor ${i}`,
      location: i <= 4 ? "Zone A (Server Rack)" : "Zone B (Cooling)",
      value: Math.round(val * 10) / 10,
      unit: "°C",
      status: val > 32 ? "warning" : val > 35 ? "critical" : "normal",
      lastUpdated: now.toISOString(),
    })
  }

  // - Humidity Sensors (4 ตัว)
  for (let i = 1; i <= 4; i++) {
    const val = 45 + Math.random() * 15 + Math.cos(now.getTime() / 20000 + i) * 5
    sensors.push({
      id: `hum-${i}`,
      type: "humidity",
      name: `Humidity Sensor ${i}`,
      location: `Zone ${i % 2 === 0 ? "A" : "B"}`,
      value: Math.round(val),
      unit: "%",
      status: val > 80 || val < 20 ? "warning" : "normal",
      lastUpdated: now.toISOString(),
    })
  }

  // - Power Sensor (1 ตัว - รวมยอด)
  const powerVal = 28 + Math.random() * 6 + Math.sin(now.getTime() / 12000) * 4
  sensors.push({
    id: "pwr-main",
    type: "power",
    name: "Main PDU Input",
    location: "Main Breaker",
    value: Math.round(powerVal * 10) / 10,
    unit: "kW",
    status: powerVal > 35 ? "warning" : "normal",
    lastUpdated: now.toISOString(),
  })
  
  // - Vibration Sensor (1 ตัว - ตามหน้าบ้านมี)
   sensors.push({
    id: "vib-1",
    type: "vibration",
    name: "Floor Vibration",
    location: "Server Room Center",
    value: Math.round(Math.random() * 2 * 10) / 10,
    unit: "mm/s",
    status: "normal",
    lastUpdated: now.toISOString(),
  })


  // 2. แปลง Servers
  const servers = serverStates.map((server) => ({
    id: server.id,
    name: server.name,
    cpu: Math.round(server.cpu),
    memory: Math.round(server.memory),
    temperature: Math.round(server.temperature * 10) / 10,
    network: Math.round(server.network),
    status: server.status,
    healthScore: Math.round(server.healthScore),
    activeEvents: server.activeEvents.length,
    rack: server.id.includes("1") || server.id.includes("2") ? "Rack A" : "Rack B",
  }))

  const onlineServers = servers.filter((s) => s.status === "online" || s.status === "warning").length
  const avgCPU = Math.round(servers.reduce((sum, s) => sum + s.cpu, 0) / servers.length) || 0
  const avgTemp = Math.round((servers.reduce((sum, s) => sum + s.temperature, 0) / servers.length) * 10) / 10 || 0

  return {
    timestamp: now.toISOString(),
    
    servers, // List ของ Servers

    // ✅ แก้ไข: เปลี่ยนชื่อ key จาก activeEvents เป็น alerts ให้ตรงกับหน้าบ้าน
    alerts: activeEvents.map((event) => ({
      id: event.id,
      type: event.type,
      severity: event.severity,
      title: event.title,
      description: event.description,
      timestamp: event.timestamp, // Backend ส่งเป็น ISO String ถูกแล้ว หน้าบ้านเราแก้ให้รับได้แล้ว
      aiConfidence: 85 + Math.floor(Math.random() * 10), // เพิ่มค่านี้เพราะหน้าบ้านมีการเรียกใช้
      serverName: event.serverName
    })),

    // ✅ แก้ไข: ส่ง sensors เป็น Array เดียว (Flattened)
    sensors, 

    stats: {
      totalServers: servers.length,
      onlineServers,
      avgTemperature: avgTemp,
      avgCPU,
      powerUsage: Math.round(65 + Math.random() * 20 + Math.cos(now.getTime() / 12000) * 10),
      pue: Math.round((1.35 + Math.random() * 0.15) * 100) / 100,
      uptime: Math.round((99.5 + Math.random() * 0.3) * 10) / 10,
    },

    aiInsights: {
      anomalyDetected: activeEvents.some((e) => e.type === "anomaly" || e.severity === "critical"),
      predictiveAlerts: activeEvents.filter((e) => e.type.includes("prediction")).length,
      optimizationsSuggested: Math.floor(Math.random() * 5),
      confidenceScore: Math.round((85 + Math.random() * 10) * 10) / 10,
      activeEventsCount: activeEvents.length,
    },
  }
}