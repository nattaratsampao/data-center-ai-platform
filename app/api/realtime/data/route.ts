import { NextResponse } from "next/server"
import { initializeServers, updateSimulation, getServerStates, getActiveEvents } from "@/lib/event-simulator"

// Initialize on first load
let initialized = false
if (!initialized) {
  initializeServers()
  initialized = true
}

setInterval(() => {
  const newEvent = updateSimulation()
  if (newEvent) {
    console.log(`[v0] New event generated: ${newEvent.title} on ${newEvent.serverName}`)
  }
}, 5000) // Check every 5 seconds

export async function GET() {
  updateSimulation()

  const data = generateRealtimeData()
  return NextResponse.json(data)
}

function generateRealtimeData() {
  const now = Date.now()
  const timeOfDay = new Date().getHours()

  const serverStates = getServerStates()
  const activeEvents = getActiveEvents()

  // จำลองข้อมูลที่เปลี่ยนแปลงตาม workload pattern จริง
  const workloadMultiplier = timeOfDay >= 9 && timeOfDay <= 17 ? 1.3 : 0.7

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
    rack:
      server.id.includes("1") || server.id.includes("2") || server.id.includes("3")
        ? "Rack A"
        : server.id.includes("4") || server.id.includes("5") || server.id.includes("6")
          ? "Rack B"
          : "Rack C",
  }))

  // Calculate stats from real servers
  const onlineServers = servers.filter((s) => s.status === "online" || s.status === "warning").length
  const avgCPU = Math.round(servers.reduce((sum, s) => sum + s.cpu, 0) / servers.length)
  const avgTemp = Math.round((servers.reduce((sum, s) => sum + s.temperature, 0) / servers.length) * 10) / 10

  return {
    timestamp: new Date().toISOString(),

    // ข้อมูลเซิร์ฟเวอร์ที่เปลี่ยนแปลงจริง
    servers,

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
      totalServers: servers.length,
      onlineServers,
      avgTemperature: avgTemp,
      avgCPU,
      powerUsage: Math.round(65 + Math.random() * 20 + Math.cos(now / 12000) * 10),
      pue: Math.round((1.35 + Math.random() * 0.15) * 100) / 100,
      uptime: Math.round((99.5 + Math.random() * 0.3) * 10) / 10,
    },

    // AI Insights แบบ real-time
    aiInsights: {
      anomalyDetected: activeEvents.some((e) => e.type === "anomaly" || e.severity === "critical"),
      predictiveAlerts: activeEvents.filter((e) => e.type.includes("prediction") || e.type.includes("maintenance"))
        .length,
      optimizationsSuggested: Math.floor(Math.random() * 5),
      confidenceScore: Math.round((85 + Math.random() * 10) * 10) / 10,
      activeEventsCount: activeEvents.length,
    },
  }
}
