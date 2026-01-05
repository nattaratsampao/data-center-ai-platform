// lib/line-bot.ts
import { getServerStates, getSensorStates } from "@/lib/event-simulator"

// --- Interfaces ---
export interface LineBotConfig {
  channelAccessToken: string
  channelSecret: string
  enabled: boolean
}

export interface LineBotAlert {
  type: string
  severity: string
  title: string
  description: string
  aiConfidence?: number // เปลี่ยนเป็น Optional
  aiResponse?: string   // ✅ เพิ่ม field นี้
  timestamp?: string | Date
}

// --- Functions ---

// 1. ส่งการแจ้งเตือนไปยังผู้ใช้ LINE คนใดคนหนึ่ง (Push)
export async function sendLineBotAlert(userId: string, alert: LineBotAlert): Promise<boolean> {
  try {
    const message = formatAlertForLineBot(alert)

    // เรียก API Route ที่เราสร้างไว้
    const response = await fetch("/api/line/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        message,
      }),
    })

    return response.ok
  } catch (error) {
    console.error("ไม่สามารถส่งการแจ้งเตือนทาง LINE Bot:", error)
    return false
  }
}

// 2. ส่งการแจ้งเตือนไปยังเพื่อนทั้งหมด (Broadcast)
export async function broadcastLineBotAlert(alert: LineBotAlert): Promise<boolean> {
  try {
    const message = formatAlertForLineBot(alert)

    const response = await fetch("/api/line/broadcast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
      }),
    })

    return response.ok
  } catch (error) {
    console.error("ไม่สามารถส่งการแจ้งเตือนแบบ broadcast:", error)
    return false
  }
}

// 3. จัดรูปแบบข้อความ Alert
export function formatAlertForLineBot(alert: LineBotAlert): string {
  const severityEmoji: Record<string, string> = {
    critical: "🚨",
    high: "⚠️",
    medium: "⚡",
    low: "ℹ️",
  }

  const typeText: Record<string, string> = {
    anomaly: "ตรวจพบความผิดปกติ",
    prediction: "การทำนายจาก AI",
    optimization: "คำแนะนำการปรับปรุง",
    cpu_spike: "CPU ใช้งานสูงผิดปกติ",
    memory_leak: "ตรวจพบ Memory Leak",
    cooling_failure: "ระบบทำความเย็นขัดข้อง",
    temperature_spike: "อุณหภูมิสูงเกินกำหนด",
  }

  const emoji = severityEmoji[alert.severity] || "📢"
  const title = typeText[alert.type] || alert.type
  const time = alert.timestamp 
    ? new Date(alert.timestamp).toLocaleString("th-TH") 
    : new Date().toLocaleString("th-TH")

  // ✅ เพิ่มส่วนแสดง AI Response (ถ้ามี)
  const aiSection = alert.aiResponse 
    ? `\n🤖 AI Action: ${alert.aiResponse}` 
    : (alert.aiConfidence ? `\n🤖 ความมั่นใจ AI: ${alert.aiConfidence}%` : "")

  return `${emoji} ${title}

📌 ${alert.title}

${alert.description}
${aiSection}

⏰ ${time}

(พิมพ์ "สถานะ" เพื่อดูภาพรวมระบบ)`
}

// 4. จัดรูปแบบสถานะระบบ (✅ แก้ให้ดึงสดจาก Memory ไม่ต้อง fetch)
export async function formatSystemStatusForLine(): Promise<string> {
  try {
    // ดึงข้อมูลตรงๆ จาก Simulator (เร็วและชัวร์กว่า fetch)
    const servers = getServerStates()
    const sensors = getSensorStates()

    const totalServers = servers.length
    const onlineServers = servers.filter(s => s.status === 'online' || s.status === 'warning').length
    
    // ดึงค่า Temp (หาค่าเฉลี่ยจาก sensor ทั้งหมดที่เป็น temp)
    const tempSensors = sensors.filter(s => s.type === 'temperature')
    const avgTemp = tempSensors.length > 0
      ? (tempSensors.reduce((sum, s) => sum + s.value, 0) / tempSensors.length).toFixed(1)
      : "N/A"
    
    // ดึงค่า Power
    const powerSensor = sensors.find(s => s.type === 'power')
    const powerVal = powerSensor ? powerSensor.value.toFixed(1) : "N/A"

    // Mock Uptime (หรือคำนวณจริงถ้ามีเก็บไว้)
    const uptime = "99.98"

    return `📊 รายงานสถานะ Data Center

🖥️ เซิร์ฟเวอร์: ${onlineServers}/${totalServers} ออนไลน์
🌡️ อุณหภูมิเฉลี่ย: ${avgTemp}°C
⚡ การใช้พลังงาน: ${powerVal} kW
🔄 Uptime: ${uptime}%

${onlineServers === totalServers ? "✅ ระบบทั้งหมดทำงานปกติ" : "⚠️ มีเซิร์ฟเวอร์ผิดปกติ ตรวจสอบด่วน!"}

พิมพ์ "แจ้งเตือน" เพื่อดู alerts ล่าสุด
พิมพ์ "ช่วยเหลือ" เพื่อดูคำสั่งทั้งหมด`
  } catch (error) {
    console.error("Error fetching system status:", error)
    return "❌ ไม่สามารถดึงข้อมูลได้ในขณะนี้"
  }
}