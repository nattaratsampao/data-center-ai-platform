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

// app/api/realtime/data/route.ts

// ... (ส่วน import และอื่นๆ เหมือนเดิม)

function generateRealtimeData() {
  const now = new Date()
  const timestamp = now.toISOString()
  
  const serverStates = getServerStates()
  const activeEvents = getActiveEvents()
  const sensorStates = getSensorStates() 

  // ✅ แก้ไขการ Map Server Data ตรงนี้ครับ
  const servers = serverStates.map((server) => {
    // Logic การแบ่ง Rack ให้ตรงกับที่ Heatmap ต้องการ
    let rackName = "Rack C";
    const idNum = parseInt(server.id.replace("srv", ""));
    
    if (idNum <= 3) rackName = "Rack A";      // Server 1-3 อยู่ Rack A
    else if (idNum <= 6) rackName = "Rack B"; // Server 4-6 อยู่ Rack B
    
    return {
      ...server,
      cpu: Math.round(server.cpu),
      memory: Math.round(server.memory),
      temperature: Math.round(server.temperature * 10) / 10,
      network: Math.round(server.network),
      healthScore: Math.round(server.healthScore),
      
      // ⚠️ เปลี่ยนจาก location เป็น rack และใช้ค่า "Rack X"
      rack: rackName, 
      
      activeEvents: server.activeEvents.length,
    };
  })

  // ... (ส่วน sensors และ stats เหมือนเดิม ไม่ต้องแก้)
  
  // (Copy ส่วนที่เหลือมาแปะ เพื่อความชัวร์)
  const sensors = sensorStates.map(s => ({
    ...s,
    value: Math.round(s.value * 10) / 10,
    lastUpdated: timestamp
  }))

  const onlineServers = servers.filter((s) => s.status === "online" || s.status === "warning").length
  const avgTemp = Math.round((servers.reduce((sum, s) => sum + s.temperature, 0) / servers.length) * 10) / 10
  const totalPower = sensors.find(s => s.type === "power")?.value || 0;

  return {
    timestamp: timestamp,
    servers, // ส่ง servers ที่มี field 'rack' แล้ว
    sensors: sensors, 
    activeEvents: activeEvents.map((event) => ({
      ...event,
      timestamp: event.timestamp || timestamp,
    })),
    stats: {
      totalServers: servers.length,
      onlineServers,
      avgTemperature: avgTemp,
      avgCPU: Math.round(servers.reduce((sum, s) => sum + s.cpu, 0) / servers.length),
      powerUsage: Math.round(totalPower * 1.5),
      pue: 1.45,
    },

    aiInsights: {
          anomalyDetected: activeEvents.some((e: any) => e.severity === "critical"),
          predictiveAlerts: activeEvents.filter((e: any) => e.type?.includes("prediction")).length,
          
          // ✅ แก้ตรงนี้: ให้สุ่มค่าทีละนิด เพื่อให้กราฟขยับ (Simulation)
          optimizationsSuggested: Math.floor(Math.random() * 5) + 1, 
          confidenceScore: Math.round((85 + Math.random() * 14) * 10) / 10, // สุ่มระหว่าง 85% - 99%
          
          // ✅ เพิ่มค่าใหม่สำหรับกราฟอีก 2 แท่ง
          maintenanceScore: Math.round((75 + Math.random() * 20) * 10) / 10,
          loadBalancingScore: Math.round((80 + Math.random() * 15) * 10) / 10,
        },
  }
}