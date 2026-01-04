import { type NextRequest, NextResponse } from "next/server"

// API สำหรับรับ predictions จาก AI model ที่เทรนมา
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { modelType, inputData } = body

    // ตรวจสอบ input
    if (!modelType || !inputData) {
      return NextResponse.json({ error: "ต้องระบุ modelType และ inputData" }, { status: 400 })
    }

    // รองรับ 3 ประเภท AI models
    let prediction
    switch (modelType) {
      case "anomaly":
        prediction = await predictAnomaly(inputData)
        break
      case "maintenance":
        prediction = await predictMaintenance(inputData)
        break
      case "optimization":
        prediction = await predictOptimization(inputData)
        break
      default:
        return NextResponse.json(
          { error: "modelType ไม่ถูกต้อง ต้องเป็น: anomaly, maintenance, optimization" },
          { status: 400 },
        )
    }

    return NextResponse.json(prediction)
  } catch (error) {
    console.error("[AI Predict Error]:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการทำนาย" }, { status: 500 })
  }
}

// Anomaly Detection Model
async function predictAnomaly(data: any) {
  // TODO: เชื่อมกับ model จริงที่เทรนมา
  // ตอนนี้เป็น simulation แต่โครงสร้างพร้อมรับ model จริง

  const { temperature, humidity, power, vibration, cpu_usage, memory_usage } = data

  // จำลองการทำนาย (แทนที่ด้วย model จริง)
  const isAnomaly = temperature > 30 || vibration > 2.0 || cpu_usage > 90
  const confidence = 0.75 + Math.random() * 0.2 // 75-95%

  return {
    modelType: "anomaly",
    isAnomaly,
    confidence: Math.round(confidence * 100),
    severity: isAnomaly ? (temperature > 35 ? "critical" : "warning") : "normal",
    details: {
      temperature: temperature > 30 ? "ผิดปกติ" : "ปกติ",
      vibration: vibration > 2.0 ? "ผิดปกติ" : "ปกติ",
      cpu: cpu_usage > 90 ? "ผิดปกติ" : "ปกติ",
    },
    recommendation: isAnomaly ? "ควรตรวจสอบระบบทำความเย็นและ workload distribution" : "ระบบทำงานปกติ",
    timestamp: new Date().toISOString(),
  }
}

// Predictive Maintenance Model
async function predictMaintenance(data: any) {
  // TODO: เชื่อมกับ model จริงที่เทรนมา

  const { server_id, uptime_hours, error_count, temperature_avg, cpu_usage_avg, memory_usage_avg } = data

  // จำลองการทำนาย
  const failureRisk = error_count * 0.3 + (uptime_hours / 8760) * 0.4 + (temperature_avg / 50) * 0.3
  const daysUntilMaintenance = failureRisk > 0.7 ? 7 : failureRisk > 0.5 ? 14 : 30
  const confidence = 0.8 + Math.random() * 0.15

  return {
    modelType: "maintenance",
    server_id,
    needsMaintenance: failureRisk > 0.5,
    daysUntilMaintenance,
    riskLevel: failureRisk > 0.7 ? "สูง" : failureRisk > 0.5 ? "ปานกลาง" : "ต่ำ",
    confidence: Math.round(confidence * 100),
    predictedIssues: [
      failureRisk > 0.7 ? "การล้มเหลวของ Hard Drive" : null,
      error_count > 10 ? "ปัญหา Memory" : null,
      temperature_avg > 35 ? "ปัญหาระบายความร้อน" : null,
    ].filter(Boolean),
    recommendation:
      failureRisk > 0.5 ? `ควรกำหนดตารางซ่อมบำรุงภายใน ${daysUntilMaintenance} วัน` : "ไม่จำเป็นต้องซ่อมบำรุงในขณะนี้",
    timestamp: new Date().toISOString(),
  }
}

// Optimization Model
async function predictOptimization(data: any) {
  // TODO: เชื่อมกับ model จริงที่เทรนมา

  const { servers } = data

  // จำลองการทำนาย
  const overloadedServers = servers.filter((s: any) => s.cpu_usage > 80)
  const idleServers = servers.filter((s: any) => s.cpu_usage < 20)

  const canOptimize = overloadedServers.length > 0 && idleServers.length > 0
  const confidence = 0.85 + Math.random() * 0.1

  return {
    modelType: "optimization",
    canOptimize,
    confidence: Math.round(confidence * 100),
    suggestions: canOptimize
      ? [
          {
            type: "load_balancing",
            action: `ย้าย workload จาก ${overloadedServers[0].name} ไปยัง ${idleServers[0].name}`,
            expectedSaving: "15-20% CPU utilization",
            priority: "สูง",
          },
          {
            type: "cooling_optimization",
            action: "ลดกำลัง CRAC Unit ใน Zone A ลง 10%",
            expectedSaving: "8% energy consumption",
            priority: "ปานกลาง",
          },
          {
            type: "consolidation",
            action: `ปิด ${idleServers.length} เซิร์ฟเวอร์ที่ไม่ได้ใช้งาน`,
            expectedSaving: "12% power usage",
            priority: "ปานกลาง",
          },
        ]
      : [],
    currentPUE: 1.42,
    optimizedPUE: canOptimize ? 1.28 : 1.42,
    energySavingPercent: canOptimize ? 18 : 0,
    timestamp: new Date().toISOString(),
  }
}

// GET endpoint สำหรับ health check
export async function GET() {
  return NextResponse.json({
    status: "online",
    models: ["anomaly", "maintenance", "optimization"],
    message: "AI Prediction API พร้อมใช้งาน",
  })
}
