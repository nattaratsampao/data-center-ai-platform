import { NextResponse } from "next/server"
import { 
  initializeServers, 
  updateSimulation, 
  getServerStates, 
  getActiveEvents,
  getSensorStates // ✅ อย่าลืม import อันใหม่เข้ามา
} from "@/lib/event-simulator"

// Initialize on first load
let initialized = false
if (!initialized) {
  initializeServers()
  initialized = true
}

export async function GET() {
  updateSimulation() // อัปเดต state กลาง

  const data = generateRealtimeData()
  return NextResponse.json(data)
}

function generateRealtimeData() {
  const now = new Date()
  const timestamp = now.toISOString()
  
  const serverStates = getServerStates()
  const activeEvents = getActiveEvents()
  // ✅ ดึงค่า Sensors จาก State กลาง (ค่าเดิมที่ถูกเปลี่ยนทีละนิด)
  const sensorStates = getSensorStates() 

  // Map Server Data (เหมือนเดิม)
  const servers = serverStates.map((server) => ({
    ...server,
    cpu: Math.round(server.cpu),
    memory: Math.round(server.memory),
    temperature: Math.round(server.temperature * 10) / 10,
    network: Math.round(server.network),
    healthScore: Math.round(server.healthScore),
    location: server.id.includes("1") || server.id.includes("2") ? "Zone A" : "Zone B",
    activeEvents: server.activeEvents.length,
  }))

  // Map Sensor Data (เพื่อเติม timestamp หรือ format ทศนิยม)
  const sensors = sensorStates.map(s => ({
    ...s,
    value: Math.round(s.value * 10) / 10, // ปัดเศษให้สวยงาม
    lastUpdated: timestamp
  }))

  // Calculate Stats
  const onlineServers = servers.filter((s) => s.status === "online" || s.status === "warning").length
  const avgTemp = Math.round((servers.reduce((sum, s) => sum + s.temperature, 0) / servers.length) * 10) / 10
  
  // หา Power รวมจาก Sensor จริงๆ (ไม่ใช่สุ่ม)
  const totalPower = sensors.find(s => s.type === "power")?.value || 0;

  return {
    timestamp: timestamp,
    servers,
    sensors: sensors, // ✅ ส่ง sensors ที่เหมือนกันทุกหน้า
    activeEvents: activeEvents.map((event) => ({
      ...event,
      timestamp: event.timestamp || timestamp,
    })),
    stats: {
      totalServers: servers.length,
      onlineServers,
      avgTemperature: avgTemp,
      avgCPU: Math.round(servers.reduce((sum, s) => sum + s.cpu, 0) / servers.length),
      powerUsage: Math.round(totalPower * 1.5), // คำนวณจากค่าจริง
      pue: 1.45,
    },
    aiInsights: {
      anomalyDetected: activeEvents.some((e: any) => e.severity === "critical"),
      predictiveAlerts: activeEvents.filter((e: any) => e.type?.includes("prediction")).length,
      optimizationsSuggested: 3,
      confidenceScore: 92.5,
    },
  }
}