import { NextResponse } from "next/server"
import { 
  initializeServers, 
  updateSimulation, 
  getServerStates, 
  getSensorStates, 
  getActiveEvents 
} from "@/lib/event-simulator"

// ... (ส่วน initializeServers เหมือนเดิม) ...
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
    cpu: Math.round(s.cpu),
    memory: Math.round(s.memory),
    temperature: Math.round(s.temperature),
    disk: Math.round(s.disk),
    network: Math.round(s.network)
  }))

  const sensors = getSensorStates()
  const activeEvents = getActiveEvents()

  // -------------------------------------------------------
  // 🔗 แก้ตรงนี้: ใส่ URL ของ Render ที่คุณได้มา
  // -------------------------------------------------------
  // ตัวอย่าง: "https://my-ai-api.onrender.com"
  const RENDER_API_URL = "https://ใส่_URL_ของ_RENDER_ตรงนี้.onrender.com"; 

  try {
    // ยิงไปที่ RENDER_API_URL แทน localhost
    const aiResponse = await fetch(`${RENDER_API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ servers }),
      cache: "no-store"
    })

    if (aiResponse.ok) {
      const aiResult = await aiResponse.json()
      
      if (aiResult.status === 'success') {
        servers = servers.map(server => {
          const pred = aiResult.predictions.find((p: any) => p.id === server.id)
          
          if (pred) {
            return {
              ...server,
              healthScore: Math.round(pred.newHealthScore),
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
    }
  } catch (error) {
    console.error("🔥 AI CONNECTION FAILED:", error);
    // ถ้าต่อ AI ไม่ติด ข้อมูล servers จะยังเป็นข้อมูล Mock เดิม (Heatmap ควรจะขึ้นแต่เป็นสีปกติ)
  }
  // -------------------------------------------------------

  // ... (ส่วนคำนวณ Stats และ Return เหมือนเดิม) ...
  const avgTemp = Math.round((servers.reduce((sum, s) => sum + s.temperature, 0) / servers.length) * 10) / 10
  const totalPower = sensors.find(s => s.type === "power")?.value || 0;
  
  const predictiveCount = servers.filter((s: any) => 
    s.predictionInfo && s.predictionInfo.maintenanceDays < 14
  ).length

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
        confidenceScore: isAIActive ? 99.9 : 85.5, 
        maintenanceScore: 88.0,
        loadBalancingScore: 92.0
    }
  })
}