// Client library สำหรับเรียกใช้ AI APIs

export interface AnomalyInput {
  temperature: number
  humidity: number
  power: number
  vibration: number
  cpu_usage: number
  memory_usage: number
}

export interface MaintenanceInput {
  server_id: string
  uptime_hours: number
  error_count: number
  temperature_avg: number
  cpu_usage_avg: number
  memory_usage_avg: number
}

export interface OptimizationInput {
  servers: Array<{
    name: string
    cpu_usage: number
    memory_usage: number
    temperature: number
  }>
}

// เรียก Anomaly Detection Model
export async function predictAnomaly(input: AnomalyInput) {
  const response = await fetch("/api/ai/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      modelType: "anomaly",
      inputData: input,
    }),
  })
  return response.json()
}

// เรียก Predictive Maintenance Model
export async function predictMaintenance(input: MaintenanceInput) {
  const response = await fetch("/api/ai/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      modelType: "maintenance",
      inputData: input,
    }),
  })
  return response.json()
}

// เรียก Optimization Model
export async function predictOptimization(input: OptimizationInput) {
  const response = await fetch("/api/ai/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      modelType: "optimization",
      inputData: input,
    }),
  })
  return response.json()
}

// ดึงข้อมูล real-time
export async function fetchRealtimeData() {
  const response = await fetch("/api/realtime/data")
  return response.json()
}
