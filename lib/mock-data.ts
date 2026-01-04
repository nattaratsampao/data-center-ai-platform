// Mock data generator for Data Center AI Platform

export interface SensorData {
  id: string
  name: string
  type: "temperature" | "humidity" | "power" | "vibration"
  value: number
  unit: string
  status: "normal" | "warning" | "critical"
  location: string
  lastUpdated: Date
}

export interface ServerData {
  id: string
  name: string
  rack: string
  cpu: number
  memory: number
  disk: number
  network: number
  status: "online" | "warning" | "offline"
  healthScore: number
  predictedFailure: number | null // days until predicted failure
}

export interface AlertData {
  id: string
  type: "anomaly" | "prediction" | "optimization"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  timestamp: Date
  aiConfidence: number
}

export interface HistoricalDataPoint {
  timestamp: string
  value: number
}

// Generate sensor data
export function generateSensorData(): SensorData[] {
  return [
    {
      id: "s1",
      name: "Temp Sensor A1",
      type: "temperature",
      value: 23.5,
      unit: "°C",
      status: "normal",
      location: "Rack A",
      lastUpdated: new Date(),
    },
    {
      id: "s2",
      name: "Temp Sensor A2",
      type: "temperature",
      value: 28.2,
      unit: "°C",
      status: "warning",
      location: "Rack A",
      lastUpdated: new Date(),
    },
    {
      id: "s3",
      name: "Temp Sensor B1",
      type: "temperature",
      value: 22.1,
      unit: "°C",
      status: "normal",
      location: "Rack B",
      lastUpdated: new Date(),
    },
    {
      id: "s4",
      name: "Temp Sensor B2",
      type: "temperature",
      value: 35.8,
      unit: "°C",
      status: "critical",
      location: "Rack B",
      lastUpdated: new Date(),
    },
    {
      id: "s5",
      name: "Humidity A",
      type: "humidity",
      value: 45,
      unit: "%",
      status: "normal",
      location: "Zone A",
      lastUpdated: new Date(),
    },
    {
      id: "s6",
      name: "Humidity B",
      type: "humidity",
      value: 62,
      unit: "%",
      status: "warning",
      location: "Zone B",
      lastUpdated: new Date(),
    },
    {
      id: "s7",
      name: "Power Meter 1",
      type: "power",
      value: 12.5,
      unit: "kW",
      status: "normal",
      location: "Main",
      lastUpdated: new Date(),
    },
    {
      id: "s8",
      name: "Power Meter 2",
      type: "power",
      value: 18.2,
      unit: "kW",
      status: "warning",
      location: "Backup",
      lastUpdated: new Date(),
    },
    {
      id: "s9",
      name: "Vibration A1",
      type: "vibration",
      value: 0.5,
      unit: "mm/s",
      status: "normal",
      location: "Rack A",
      lastUpdated: new Date(),
    },
    {
      id: "s10",
      name: "Vibration B2",
      type: "vibration",
      value: 2.8,
      unit: "mm/s",
      status: "critical",
      location: "Rack B",
      lastUpdated: new Date(),
    },
  ]
}

// Generate server data
export function generateServerData(): ServerData[] {
  return [
    {
      id: "srv1",
      name: "Server-001",
      rack: "Rack A",
      cpu: 45,
      memory: 62,
      disk: 38,
      network: 120,
      status: "online",
      healthScore: 92,
      predictedFailure: null,
    },
    {
      id: "srv2",
      name: "Server-002",
      rack: "Rack A",
      cpu: 78,
      memory: 85,
      disk: 55,
      network: 250,
      status: "warning",
      healthScore: 68,
      predictedFailure: 14,
    },
    {
      id: "srv3",
      name: "Server-003",
      rack: "Rack A",
      cpu: 32,
      memory: 41,
      disk: 22,
      network: 80,
      status: "online",
      healthScore: 95,
      predictedFailure: null,
    },
    {
      id: "srv4",
      name: "Server-004",
      rack: "Rack B",
      cpu: 91,
      memory: 94,
      disk: 78,
      network: 380,
      status: "warning",
      healthScore: 45,
      predictedFailure: 7,
    },
    {
      id: "srv5",
      name: "Server-005",
      rack: "Rack B",
      cpu: 55,
      memory: 58,
      disk: 42,
      network: 150,
      status: "online",
      healthScore: 88,
      predictedFailure: null,
    },
    {
      id: "srv6",
      name: "Server-006",
      rack: "Rack B",
      cpu: 12,
      memory: 25,
      disk: 15,
      network: 45,
      status: "offline",
      healthScore: 0,
      predictedFailure: null,
    },
    {
      id: "srv7",
      name: "Server-007",
      rack: "Rack C",
      cpu: 67,
      memory: 72,
      disk: 61,
      network: 200,
      status: "online",
      healthScore: 78,
      predictedFailure: 21,
    },
    {
      id: "srv8",
      name: "Server-008",
      rack: "Rack C",
      cpu: 38,
      memory: 45,
      disk: 28,
      network: 95,
      status: "online",
      healthScore: 91,
      predictedFailure: null,
    },
  ]
}

// Generate alerts
export function generateAlerts(): AlertData[] {
  return [
    {
      id: "a1",
      type: "anomaly",
      severity: "critical",
      title: "Temperature Anomaly Detected",
      description: "Rack B Sensor B2 showing abnormal temperature spike (35.8°C)",
      timestamp: new Date(Date.now() - 5 * 60000),
      aiConfidence: 94,
    },
    {
      id: "a2",
      type: "prediction",
      severity: "high",
      title: "Server-004 Failure Predicted",
      description: "AI predicts hardware failure within 7 days. Recommend immediate maintenance.",
      timestamp: new Date(Date.now() - 15 * 60000),
      aiConfidence: 87,
    },
    {
      id: "a3",
      type: "optimization",
      severity: "medium",
      title: "Load Balancing Opportunity",
      description: "Server-004 overloaded. Suggest migrating 3 VMs to Server-003.",
      timestamp: new Date(Date.now() - 30 * 60000),
      aiConfidence: 82,
    },
    {
      id: "a4",
      type: "anomaly",
      severity: "medium",
      title: "Vibration Alert",
      description: "Unusual vibration pattern detected at Rack B2 sensor.",
      timestamp: new Date(Date.now() - 45 * 60000),
      aiConfidence: 76,
    },
    {
      id: "a5",
      type: "prediction",
      severity: "medium",
      title: "Server-002 Maintenance Due",
      description: "Predictive analysis suggests maintenance in 14 days.",
      timestamp: new Date(Date.now() - 60 * 60000),
      aiConfidence: 79,
    },
    {
      id: "a6",
      type: "optimization",
      severity: "low",
      title: "Energy Optimization Available",
      description: "Reducing cooling in Zone A could save 12% energy.",
      timestamp: new Date(Date.now() - 90 * 60000),
      aiConfidence: 91,
    },
  ]
}

// Generate historical data for charts
export function generateHistoricalData(hours = 24): HistoricalDataPoint[] {
  const data: HistoricalDataPoint[] = []
  const now = Date.now()

  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now - i * 3600000)
    data.push({
      timestamp: timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      value: 20 + Math.random() * 10 + Math.sin(i / 4) * 3,
    })
  }

  return data
}

// Generate power consumption data
export function generatePowerData(hours = 24): { timestamp: string; consumption: number; cooling: number }[] {
  const data = []
  const now = Date.now()

  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now - i * 3600000)
    data.push({
      timestamp: timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      consumption: 25 + Math.random() * 15 + Math.sin(i / 6) * 5,
      cooling: 8 + Math.random() * 6 + Math.cos(i / 6) * 2,
    })
  }

  return data
}

// System stats
export function getSystemStats() {
  return {
    totalServers: 8,
    onlineServers: 7,
    totalPower: 30.7,
    avgTemperature: 27.4,
    aiOptimizations: 156,
    energySaved: 23.5,
    uptime: 99.7,
    alertsToday: 6,
  }
}

export const mockSensors = generateSensorData()
export const mockServers = generateServerData()
