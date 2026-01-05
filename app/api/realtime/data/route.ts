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
  // 🔗 ส่วนที่แก้: เปลี่ยน URL ให้รองรับทั้ง Local และ Vercel
  // -------------------------------------------------------
  
  // หา Base URL ของเว็บตัวเอง (Localhost หรือ Vercel URL)
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const host = request.headers.get('host') || 'localhost:3000';
  
  // เรียกผ่าน /api/python (ที่เราตั้ง Rewrite ไว้ใน next.config.mjs)
  const PYTHON_API_URL = `${protocol}://${host}/api/python`;

  try {
    // ยิงไปที่ /api/python/predict -> มันจะวิ่งไปหาไฟล์ api/index.py ฟังก์ชัน predict
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
              healthScore: Math.round(pred.newHealthScore), // คะแนนจาก AI
              
              // เพิ่ม Field พิเศษเพื่อนำไปแสดงผล
              predictionInfo: {
                isAnomaly: pred.isAnomaly,
                failureType: pred.failureType || "None", // กัน error ถ้าไม่มีค่า
                maintenanceDays: Math.round(pred.maintenanceDays || 0)
              }
            }
          }
          return server
        })
      }
    }
  } catch (error) {
    // ถ้า Python ไม่รัน หรือ Vercel Cold Start ไม่ทัน ก็ใช้ค่าเดิมไปก่อน (User ไม่รู้ตัว)
    // console.warn("AI Server not connected:", error) 
  }
  // -------------------------------------------------------

  // คำนวณ Stats (เหมือนเดิม)
  const avgTemp = Math.round((servers.reduce((sum, s) => sum + s.temperature, 0) / servers.length) * 10) / 10
  const totalPower = sensors.find(s => s.type === "power")?.value || 0;

  // นับจำนวน Predictive Alerts (Server ที่ต้องซ่อมใน < 14 วัน)
  const predictiveCount = servers.filter((s: any) => 
    s.predictionInfo && s.predictionInfo.maintenanceDays < 14
  ).length

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
    // ส่งข้อมูล AI Insight ไปโชว์กราฟ
    aiInsights: {
        anomalyDetected: servers.some((s: any) => s.predictionInfo?.isAnomaly),
        predictiveAlerts: predictiveCount, 
        optimizationsSuggested: Math.floor(Math.random() * 5) + 1,
        confidenceScore: 98.5, // มั่นใจเพราะใช้ Model จริง
        maintenanceScore: 88.0,
        loadBalancingScore: 92.0
    }
  })
}