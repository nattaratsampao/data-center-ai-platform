import { NextResponse } from "next/server"

// API สำหรับดึงข้อมูล real-time ที่เปลี่ยนแปลงตลอดเวลา
export async function GET() {
  const data = generateRealtimeData()
  return NextResponse.json(data)
}

function generateRealtimeData() {
  const now = Date.now()
  const timeOfDay = new Date().getHours()

  // จำลองข้อมูลที่เปลี่ยนแปลงตาม workload pattern จริง
  const workloadMultiplier = timeOfDay >= 9 && timeOfDay <= 17 ? 1.3 : 0.7

  return {
    timestamp: new Date().toISOString(),

    // ข้อมูลเซิร์ฟเวอร์ที่เปลี่ยนแปลง
    servers: Array.from({ length: 8 }, (_, i) => {
      const baseLoad = 30 + Math.random() * 40
      const load = Math.min(95, baseLoad * workloadMultiplier + Math.sin(now / 10000) * 10)

      return {
        id: `srv${i + 1}`,
        name: `Server-00${i + 1}`,
        cpu: Math.round(load),
        memory: Math.round(load * 0.8 + Math.random() * 10),
        temperature: Math.round(22 + (load / 100) * 15 + Math.random() * 3),
        network: Math.round(load * 2.5 + Math.random() * 50),
        status: load > 85 ? "warning" : load > 95 ? "critical" : "online",
        healthScore: Math.round(100 - (load / 100) * 20 - Math.random() * 10),
      }
    }),

    // ข้อมูล sensors ที่เปลี่ยนแปลง
    sensors: {
      temperature: Array.from({ length: 8 }, (_, i) => ({
        id: `temp${i + 1}`,
        value: Math.round((23 + Math.random() * 8 + Math.sin(now / 15000 + i) * 3) * 10) / 10,
        status: Math.random() > 0.8 ? "warning" : "normal",
      })),
      humidity: Array.from({ length: 4 }, (_, i) => ({
        id: `hum${i + 1}`,
        value: Math.round(45 + Math.random() * 15 + Math.cos(now / 20000 + i) * 5),
        status: "normal",
      })),
      power: {
        total: Math.round((28 + Math.random() * 6 + Math.sin(now / 12000) * 4) * 10) / 10,
        servers: Math.round((20 + Math.random() * 4) * 10) / 10,
        cooling: Math.round((6 + Math.random() * 2) * 10) / 10,
      },
    },

    // สถิติรวม
    stats: {
      totalServers: 8,
      onlineServers: 7 + (Math.random() > 0.9 ? -1 : 0),
      avgTemperature: Math.round((25 + Math.random() * 4 + Math.sin(now / 18000) * 2) * 10) / 10,
      avgCPU: Math.round(35 + Math.random() * 25 + Math.sin(now / 15000) * 15),
      powerUsage: Math.round(65 + Math.random() * 20 + Math.cos(now / 12000) * 10),
      pue: Math.round((1.35 + Math.random() * 0.15) * 100) / 100,
      uptime: 99.7 + Math.random() * 0.2,
    },

    // AI Insights แบบ real-time
    aiInsights: {
      anomalyDetected: Math.random() > 0.85,
      predictiveAlerts: Math.floor(Math.random() * 3),
      optimizationsSuggested: Math.floor(Math.random() * 5),
      confidenceScore: Math.round((85 + Math.random() * 10) * 10) / 10,
    },
  }
}
