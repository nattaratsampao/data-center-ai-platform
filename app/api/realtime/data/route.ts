import { NextResponse } from "next/server"
import { 
  initializeServers, 
  updateSimulation, 
  getServerStates, 
  getSensorStates, 
  getActiveEvents 
} from "@/lib/event-simulator"

let initialized = false
if (!initialized) {
  initializeServers()
  initialized = true
}

export async function GET(request: Request) {
  updateSimulation()

  // เตรียมข้อมูล Server ที่จะส่งไป Python
  let servers = getServerStates().map(s => ({
    ...s,
    // แปลงข้อมูลให้เป็นตัวเลขล้วนๆ
    cpu: Math.round(s.cpu),
    memory: Math.round(s.memory),
    temperature: Math.round(s.temperature),
    disk: Math.round(s.disk),
    network: Math.round(s.network)
  }))

  const sensors = getSensorStates()
  const activeEvents = getActiveEvents()

  // -------------------------------------------------------
  // 🔗 ส่วนเชื่อมต่อ Python API (รองรับ Local & Vercel)
  // -------------------------------------------------------
  
  // หา Base URL อัตโนมัติ
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const host = request.headers.get('host') || 'localhost:3000';
  const PYTHON_API_URL = `${protocol}://${host}/api/python`;

  try {
    const aiResponse = await fetch(`${PYTHON_API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ servers }),
      cache: "no-store"
    })

    if (aiResponse.ok) {
      const aiResult = await aiResponse.json()
      
      if (aiResult.status === 'success') {
        // อัปเดตข้อมูล Server ด้วยผลจาก AI
        servers = servers.map(server => {
          const pred = aiResult.predictions.find((p: any) => p.id === server.id)
          
          if (pred) {
            return {
              ...server,
              healthScore: Math.round(pred.newHealthScore),
              
              // เพิ่ม Field พิเศษเพื่อนำไปแสดงผล
              predictionInfo: {
                isAnomaly: pred.isAnomaly,
                failureType: pred.failureType || "None",
                maintenanceDays: Math.round(pred.maintenanceDays || 0)
              }
            }
          }
          return server
        })
      }
    } else {
        // กรณีเชื่อมต่อได้แต่ Python ตอบกลับมาว่า Error
        console.error("⚠️ AI Server Error Status:", aiResponse.status);
    }
  } catch (error) {
    // 🔴 เปิด Error Log ให้เห็นชัดๆ ใน Vercel Dashboard
    console.error("🔥 AI CONNECTION FAILED:", error);
  }
  // -------------------------------------------------------

  // คำนวณ Stats
  const avgTemp = Math.round((servers.reduce((sum, s) => sum + s.temperature, 0) / servers.length) * 10) / 10
  const totalPower = sensors.find(s => s.type === "power")?.value || 0;
  const predictiveCount = servers.filter((s: any) => s.predictionInfo && s.predictionInfo.maintenanceDays < 14).length

  // ✅ เช็คว่า AI ทำงานจริงไหม? (ดูจากว่า Server ตัวแรกมี predictionInfo แปะมาไหม)
  const isAIActive = servers.length > 0 && servers[0].hasOwnProperty('predictionInfo');

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    servers, 
    sensors,
    activeEvents,
    stats: {
        totalServers: servers.length,
        onlineServers: servers.filter(s => s.status === 'online').length,
        avgTemperature: avgTemp,
        avgCPU: Math.round(servers.reduce((sum, s) => sum + s.cpu, 0) / servers.length),
        powerUsage: Math.round(totalPower * 1.5),
        pue: 1.45,
    },
    aiInsights: {
        anomalyDetected: servers.some((s: any) => s.predictionInfo?.isAnomaly),
        predictiveAlerts: predictiveCount, 
        optimizationsSuggested: Math.floor(Math.random() * 5) + 1,
        
        // ✨ ถ้า AI ทำงานโชว์ 99.9% ถ้าไม่ทำงานโชว์ 85.5% (ดูง่าย!)
        confidenceScore: isAIActive ? 99.9 : 85.5, 
        
        maintenanceScore: 88.0,
        loadBalancingScore: 92.0
    }
  })
}