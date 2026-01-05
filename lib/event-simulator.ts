// lib/event-simulator.ts
// Event Simulation Engine for Data Center AI Platform

export type EventType =
  | "cpu_spike"
  | "memory_leak"
  | "disk_full"
  | "cooling_failure"
  | "power_surge"
  | "network_congestion"
  | "hardware_failure"
  | "temperature_spike"
  | "vibration_alert"
  | "maintenance_required"
  | "workload_surge"
  | "ai_optimization"
  | "anomaly" // ✅ มี Anomaly ตามที่คุณต้องการ

export interface SimulationEvent {
  id: string
  type: EventType
  serverId: string
  serverName: string
  severity: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  timestamp: Date
  duration: number // milliseconds
  impact: {
    cpu?: number
    memory?: number
    temperature?: number
    healthScore?: number
    disk?: number
    network?: number
  }
  aiResponse?: string
  resolved: boolean
}

export interface ServerState {
  id: string
  name: string
  cpu: number
  memory: number
  temperature: number
  disk: number
  network: number
  healthScore: number
  status: "online" | "warning" | "critical" | "offline"
  activeEvents: SimulationEvent[]
}

// ✅ เพิ่ม Interface สำหรับ Sensor State
export interface SensorState {
  id: string
  type: "temperature" | "humidity" | "power" | "vibration"
  name: string
  value: number
  unit: string
  status: "normal" | "warning" | "critical"
  location: string
}

// --- Global state ---
const serverStates: Map<string, ServerState> = new Map()
const sensors: SensorState[] = [] // ✅ ตัวแปรเก็บค่า Sensors ให้คงที่
let activeEvents: SimulationEvent[] = []
const eventHistory: SimulationEvent[] = []
let eventCounter = 0

// Initialize server & sensor states
export function initializeServers() {
  // 1. Init Servers
  if (serverStates.size === 0) {
    const serverNames = [
      "Server-001",
      "Server-002",
      "Server-003",
      "Server-004",
      "Server-005",
      "Server-006",
      "Server-007",
      "Server-008",
    ]

    serverNames.forEach((name, index) => {
      const id = `srv${index + 1}`
      serverStates.set(id, {
        id,
        name,
        cpu: 30 + Math.random() * 30,
        memory: 40 + Math.random() * 30,
        temperature: 22 + Math.random() * 4,
        disk: 20 + Math.random() * 40,
        network: 50 + Math.random() * 100,
        healthScore: 85 + Math.random() * 10,
        status: "online",
        activeEvents: [],
      })
    })
  }

  // 2. Init Sensors (สร้างครั้งเดียว)
  if (sensors.length === 0) {
    // Temperature Sensors
    for (let i = 1; i <= 8; i++) {
      sensors.push({
        id: `temp-${i}`,
        type: "temperature",
        name: `Temp Sensor ${i}`,
        value: 23 + Math.random() * 2,
        unit: "°C",
        status: "normal",
        location: i <= 4 ? "Rack A" : "Rack B",
      })
    }
    // Humidity Sensors
    for (let i = 1; i <= 4; i++) {
      sensors.push({
        id: `hum-${i}`,
        type: "humidity",
        name: `Hum Sensor ${i}`,
        value: 45 + Math.random() * 5,
        unit: "%",
        status: "normal",
        location: i <= 2 ? "Rack A" : "Rack B",
      })
    }
    // Power Sensor
    sensors.push({
      id: "pwr-main",
      type: "power",
      name: "Main Power",
      value: 28.5,
      unit: "kW",
      status: "normal",
      location: "Main Dist",
    })
    // Vibration Sensor
    sensors.push({
      id: "vib-1",
      type: "vibration",
      name: "Cooling Vib",
      value: 0.5,
      unit: "mm/s",
      status: "normal",
      location: "Cooling Zone",
    })
  }
}

// Event templates with Thai descriptions
const eventTemplates: Record<
  EventType,
  {
    severityRange: Array<"low" | "medium" | "high" | "critical">
    titleTH: string
    descriptionTH: (serverName: string) => string
    impact: (severity: string) => SimulationEvent["impact"]
    aiResponse: (severity: string) => string
    duration: () => number
  }
> = {
  cpu_spike: {
    severityRange: ["medium", "high", "critical"],
    titleTH: "🔥 CPU Spike ตรวจพบ",
    descriptionTH: (name) => `${name} มีการใช้ CPU เพิ่มขึ้นอย่างกะทันหัน อาจเกิดจาก workload ที่เพิ่มขึ้น`,
    impact: (sev) => ({
      cpu: sev === "critical" ? 35 : sev === "high" ? 25 : 15,
      temperature: sev === "critical" ? 8 : sev === "high" ? 5 : 3,
      healthScore: sev === "critical" ? -15 : sev === "high" ? -10 : -5,
    }),
    aiResponse: (sev) =>
      sev === "critical"
        ? "AI กำลังย้าย workload ไปยังเซิร์ฟเวอร์อื่น และเพิ่มระบบทำความเย็น"
        : "AI กำลังตรวจสอบและปรับสมดุล workload",
    duration: () => 30000 + Math.random() * 60000,
  },
  memory_leak: {
    severityRange: ["medium", "high", "critical"],
    titleTH: "💧 Memory Leak ตรวจพบ",
    descriptionTH: (name) => `${name} มี memory usage เพิ่มขึ้นอย่างผิดปกติ อาจจำเป็นต้อง restart`,
    impact: (sev) => ({
      memory: sev === "critical" ? 40 : sev === "high" ? 25 : 15,
      healthScore: sev === "critical" ? -20 : sev === "high" ? -12 : -8,
    }),
    aiResponse: (sev) =>
      sev === "critical" ? "AI แนะนำให้ restart service ทันที" : "AI กำลังติดตามและวิเคราะห์ memory usage",
    duration: () => 60000 + Math.random() * 120000,
  },
  cooling_failure: {
    severityRange: ["high", "critical"],
    titleTH: "❄️ ระบบทำความเย็นล้มเหลว",
    descriptionTH: (name) => `CRAC unit ใกล้ ${name} ทำงานไม่เต็มประสิทธิภาพ อุณหภูมิกำลังสูงขึ้น`,
    impact: (sev) => ({
      temperature: sev === "critical" ? 12 : 8,
      cpu: sev === "critical" ? -10 : -5,
      healthScore: sev === "critical" ? -25 : -15,
    }),
    aiResponse: (sev) =>
      sev === "critical"
        ? "AI กำลัง shutdown workload และส่งแจ้งเตือนให้ทีมซ่อมบำรุง"
        : "AI กำลังเพิ่มกำลังระบบทำความเย็นสำรอง",
    duration: () => 120000 + Math.random() * 180000,
  },
  power_surge: {
    severityRange: ["medium", "high", "critical"],
    titleTH: "⚡ ไฟกระชาก (Power Surge)",
    descriptionTH: (name) => `ตรวจพบไฟกระชากที่ ${name} อาจส่งผลต่อฮาร์ดแวร์`,
    impact: (sev) => ({
      healthScore: sev === "critical" ? -30 : sev === "high" ? -18 : -10,
    }),
    aiResponse: () => "AI กำลังสลับไปใช้ UPS และตรวจสอบความเสียหาย",
    duration: () => 5000 + Math.random() * 15000,
  },
  network_congestion: {
    severityRange: ["low", "medium", "high"],
    titleTH: "🌐 Network Congestion",
    descriptionTH: (name) => `${name} มี network traffic สูงผิดปกติ`,
    impact: (sev) => ({
      network: sev === "high" ? 200 : sev === "medium" ? 150 : 100,
      cpu: sev === "high" ? 15 : sev === "medium" ? 10 : 5,
    }),
    aiResponse: (sev) =>
      sev === "high" ? "AI กำลังปรับ routing และจำกัด bandwidth" : "AI กำลังตรวจสอบ traffic patterns",
    duration: () => 40000 + Math.random() * 80000,
  },
  hardware_failure: {
    severityRange: ["critical"],
    titleTH: "🔧 Hardware Failure ตรวจพบ",
    descriptionTH: (name) => `${name} มีฮาร์ดแวร์ชำรุด ต้องปิดระบบเพื่อซ่อม`,
    impact: () => ({
      cpu: -100,
      memory: -100,
      healthScore: -100,
    }),
    aiResponse: () => "AI กำลังย้าย workload ทั้งหมดและแจ้งทีมซ่อมบำรุง",
    duration: () => 300000 + Math.random() * 300000,
  },
  temperature_spike: {
    severityRange: ["medium", "high", "critical"],
    titleTH: "🌡️ อุณหภูมิสูงผิดปกติ",
    descriptionTH: (name) => `${name} มีอุณหภูมิสูงกว่าปกติ อาจเกิดจาก airflow ที่ไม่ดี`,
    impact: (sev) => ({
      temperature: sev === "critical" ? 15 : sev === "high" ? 10 : 6,
      cpu: sev === "critical" ? -15 : sev === "high" ? -8 : -5,
      healthScore: sev === "critical" ? -20 : sev === "high" ? -12 : -8,
    }),
    aiResponse: (sev) =>
      sev === "critical"
        ? "AI กำลังลด workload และเพิ่มระบบทำความเย็นสูงสุด"
        : "AI กำลังเพิ่มประสิทธิภาพ cooling",
    duration: () => 45000 + Math.random() * 90000,
  },
  vibration_alert: {
    severityRange: ["low", "medium", "high"],
    titleTH: "📳 ตรวจพบการสั่นสะเทือน",
    descriptionTH: (name) => `${name} มีการสั่นสะเทือนผิดปกติ อาจเป็นพัดลมหรือ hard disk`,
    impact: (sev) => ({
      healthScore: sev === "high" ? -15 : sev === "medium" ? -8 : -5,
    }),
    aiResponse: (sev) =>
      sev === "high"
        ? "AI แนะนำให้ตรวจสอบพัดลมและ hard disk ทันที"
        : "AI กำลังติดตามและบันทึก vibration patterns",
    duration: () => 60000 + Math.random() * 120000,
  },
  maintenance_required: {
    severityRange: ["low", "medium"],
    titleTH: "🔧 ถึงเวลาบำรุงรักษา",
    descriptionTH: (name) => `${name} ถึงกำหนดบำรุงรักษาตามแผน`,
    impact: () => ({
      healthScore: -5,
    }),
    aiResponse: () => "AI แนะนำให้กำหนดเวลาบำรุงรักษา",
    duration: () => 180000,
  },
  workload_surge: {
    severityRange: ["medium", "high"],
    titleTH: "📈 Workload เพิ่มขึ้นกระทันหัน",
    descriptionTH: (name) => `${name} ได้รับ workload เพิ่มขึ้นอย่างมาก`,
    impact: (sev) => ({
      cpu: sev === "high" ? 30 : 20,
      memory: sev === "high" ? 25 : 15,
      temperature: sev === "high" ? 6 : 4,
    }),
    aiResponse: (sev) =>
      sev === "high"
        ? "AI กำลัง scale up resources และปรับสมดุล workload"
        : "AI กำลังตรวจสอบ workload patterns",
    duration: () => 90000 + Math.random() * 120000,
  },
  disk_full: {
    severityRange: ["medium", "high", "critical"],
    titleTH: "💾 Disk เกือบเต็ม",
    descriptionTH: (name) => `${name} มีพื้นที่ disk เหลือน้อย`,
    impact: (sev) => ({
      disk: sev === "critical" ? 40 : sev === "high" ? 25 : 15,
      healthScore: sev === "critical" ? -25 : sev === "high" ? -15 : -8,
    }),
    aiResponse: (sev) =>
      sev === "critical"
        ? "AI กำลังลบ temporary files และย้ายข้อมูล"
        : "AI กำลังวิเคราะห์การใช้ disk space",
    duration: () => 120000 + Math.random() * 180000,
  },
  ai_optimization: {
    severityRange: ["low"],
    titleTH: "✨ AI กำลังปรับแต่งระบบ",
    descriptionTH: (name) => `AI กำลังปรับปรุงประสิทธิภาพของ ${name}`,
    impact: () => ({
      cpu: -5,
      temperature: -2,
      healthScore: 5,
    }),
    aiResponse: () => "AI ปรับแต่ง configuration เพื่อประสิทธิภาพที่ดีขึ้น",
    duration: () => 30000 + Math.random() * 60000,
  },
  anomaly: {
    severityRange: ["medium", "high"],
    titleTH: "⚠️ ตรวจพบความผิดปกติ (Anomaly)",
    descriptionTH: (name) => `AI ตรวจพบพฤติกรรมผิดปกติที่ไม่จัดหมวดหมู่บน ${name}`,
    impact: (sev) => ({
      healthScore: sev === "high" ? -15 : -8,
      cpu: sev === "high" ? 10 : 5,
    }),
    aiResponse: (sev) => "AI กำลังวิเคราะห์สาเหตุเชิงลึก (Root Cause Analysis) และแยกแยะประเภทปัญหา",
    duration: () => 60000 + Math.random() * 120000,
  },
}

// Generate random event
export function generateRandomEvent(): SimulationEvent | null {
  if (serverStates.size === 0) initializeServers()

  // 15% chance of event every check
  if (Math.random() > 0.15) return null

  // Select random server
  const serverIds = Array.from(serverStates.keys())
  const randomServerId = serverIds[Math.floor(Math.random() * serverIds.length)]
  const server = serverStates.get(randomServerId)!

  // Skip if server is offline or has too many active events
  if (server.status === "offline" || server.activeEvents.length >= 3) return null

  // Select random event type
  const eventTypes = Object.keys(eventTemplates) as EventType[]
  const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
  const template = eventTemplates[randomType]

  // Select random severity
  const severity = template.severityRange[Math.floor(Math.random() * template.severityRange.length)]

  // Create event
  const event: SimulationEvent = {
    id: `evt-${++eventCounter}-${Date.now()}`,
    type: randomType,
    serverId: server.id,
    serverName: server.name,
    severity,
    title: template.titleTH,
    description: template.descriptionTH(server.name),
    timestamp: new Date(),
    duration: template.duration(),
    impact: template.impact(severity),
    aiResponse: template.aiResponse(severity),
    resolved: false,
  }

  // Apply impact to server
  applyEventImpact(server, event)

  // Add to active events
  activeEvents.push(event)
  server.activeEvents.push(event)
  eventHistory.push(event)

  // Schedule event resolution
  setTimeout(() => {
    resolveEvent(event.id)
  }, event.duration)

  return event
}

// Apply event impact to server
function applyEventImpact(server: ServerState, event: SimulationEvent) {
  if (event.impact.cpu) {
    server.cpu = Math.max(0, Math.min(100, server.cpu + event.impact.cpu))
  }
  if (event.impact.memory) {
    server.memory = Math.max(0, Math.min(100, server.memory + event.impact.memory))
  }
  if (event.impact.temperature) {
    server.temperature = Math.max(18, Math.min(45, server.temperature + event.impact.temperature))
  }
  if (event.impact.healthScore) {
    server.healthScore = Math.max(0, Math.min(100, server.healthScore + event.impact.healthScore))
  }

  // Update server status based on impacts
  if (server.healthScore < 30 || server.cpu > 95 || server.temperature > 38) {
    server.status = "critical"
  } else if (server.healthScore < 60 || server.cpu > 80 || server.temperature > 32) {
    server.status = "warning"
  } else {
    server.status = "online"
  }

  // Hardware failure -> offline
  if (event.type === "hardware_failure") {
    server.status = "offline"
  }
}

// Resolve event
function resolveEvent(eventId: string) {
  const event = activeEvents.find((e) => e.id === eventId)
  if (!event) return

  event.resolved = true

  const server = serverStates.get(event.serverId)
  if (!server) return

  // Reverse impact
  if (event.impact.cpu) {
    server.cpu = Math.max(20, Math.min(100, server.cpu - event.impact.cpu))
  }
  if (event.impact.memory) {
    server.memory = Math.max(30, Math.min(100, server.memory - event.impact.memory))
  }
  if (event.impact.temperature) {
    server.temperature = Math.max(20, Math.min(35, server.temperature - event.impact.temperature))
  }
  if (event.impact.healthScore && event.impact.healthScore < 0) {
    server.healthScore = Math.min(95, server.healthScore - event.impact.healthScore * 0.5) // Recover 50% of lost health
  }

  // Remove from active events
  activeEvents = activeEvents.filter((e) => e.id !== eventId)
  server.activeEvents = server.activeEvents.filter((e) => e.id !== eventId)

  // Update status if no more critical events
  if (server.activeEvents.length === 0) {
    if (server.healthScore > 70 && server.cpu < 70 && server.temperature < 30) {
      server.status = "online"
    }
  }
}

// Get current server states
export function getServerStates(): ServerState[] {
  if (serverStates.size === 0) initializeServers()
  return Array.from(serverStates.values())
}

// ✅ Export function นี้เพื่อให้ API Route เรียกใช้ได้
export function getSensorStates(): SensorState[] {
  if (sensors.length === 0 && serverStates.size === 0) initializeServers()
  return sensors
}

// Get active events
export function getActiveEvents(): SimulationEvent[] {
  return activeEvents
}

// Get event history
export function getEventHistory(limit = 50): SimulationEvent[] {
  return eventHistory.slice(-limit)
}

// Update simulation (call this regularly)
export function updateSimulation() {
  if (serverStates.size === 0) initializeServers()

  // 1. Natural drift of Server values
  serverStates.forEach((server) => {
    if (server.status !== "offline") {
      server.cpu += (Math.random() - 0.5) * 5
      server.cpu = Math.max(15, Math.min(85, server.cpu))

      server.memory += (Math.random() - 0.5) * 2
      server.memory = Math.max(30, Math.min(90, server.memory))

      const targetTemp = 20 + (server.cpu / 100) * 12
      server.temperature += (targetTemp - server.temperature) * 0.1
      server.temperature = Math.max(18, Math.min(35, server.temperature))

      if (server.activeEvents.length === 0 && server.healthScore < 95) {
        server.healthScore += 0.5
      }
    }
  })

  // 2. ✅ Natural drift of Sensor values (เพื่อให้กราฟสวยและต่อเนื่อง)
  sensors.forEach((sensor) => {
    if (sensor.type === "temperature") {
      sensor.value += (Math.random() - 0.5) * 0.5
      sensor.value = Math.max(18, Math.min(35, sensor.value))
    } else if (sensor.type === "humidity") {
      sensor.value += (Math.random() - 0.5) * 1
      sensor.value = Math.max(30, Math.min(70, sensor.value))
    } else if (sensor.type === "power") {
      // Power แปรผันตาม Load ของ Server รวม
      const totalCpu = Array.from(serverStates.values()).reduce((sum, s) => sum + s.cpu, 0)
      const targetPower = 20 + (totalCpu / 600) * 15
      sensor.value += (targetPower - sensor.value) * 0.1
    } else if (sensor.type === "vibration") {
      sensor.value = Math.max(0, sensor.value + (Math.random() - 0.5) * 0.1)
    }
  })

  // Possibly generate new event
  return generateRandomEvent()
}