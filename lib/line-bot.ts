// lib/line-bot.ts
import { getServerStates, getSensorStates } from "@/lib/event-simulator"

// Interface สำหรับ Config
export interface LineBotConfig {
  channelAccessToken: string
  channelSecret: string
  enabled: boolean
}

// Interface สำหรับ Alert ที่จะส่งเข้า LINE
export interface LineBotAlert {
  type: string
  severity: string
  title: string
  description: string
  aiResponse?: string // เพิ่ม field นี้เพื่อให้โชว์สิ่งที่ AI ทำ
  timestamp?: Date | string
}

// 1. ส่งการแจ้งเตือนหาคนเดียว (Push)
export async function sendLineBotAlert(userId: string, alert: LineBotAlert): Promise<boolean> {
  try {
    const message = formatAlertForLineBot(alert)

    // เรียกใช้ API Route ที่เราสร้างไว้
    const response = await fetch("/api/line/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, message }),
    })

    return response.ok
  } catch (error) {
    console.error("Failed to send LINE Push:", error)
    return false
  }
}

// 2. ส่งการแจ้งเตือนหาทุกคน (Broadcast)
export async function broadcastLineBotAlert(alert: LineBotAlert): Promise<boolean> {
  try {
    const message = formatAlertForLineBot(alert)

    const response = await fetch("/api/line/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    })

    return response.ok
  } catch (error) {
    console.error("Failed to broadcast LINE:", error)
    return false
  }
}

// 3. ฟังก์ชันจัดรูปแบบข้อความ Alert ให้สวยงาม
export function formatAlertForLineBot(alert: LineBotAlert): string {
  const severityEmoji: Record<string, string> = {
    critical: "🚨",
    high: "⚠️",
    medium: "⚡",
    low: "ℹ️",
  }
  
  const icon = severityEmoji[alert.severity] || "📢"
  const time = alert.timestamp 
    ? new Date(alert.timestamp).toLocaleTimeString("th-TH") 
    : new Date().toLocaleTimeString("th-TH")

  // เพิ่มส่วน AI Response ถ้ามี
  const aiSection = alert.aiResponse 
    ? `\n🤖 AI Action: ${alert.aiResponse}` 
    : ""

  return `${icon} แจ้งเตือน: ${alert.title}

${alert.description}
${aiSection}

⏰ เวลา: ${time}
(พิมพ์ "สถานะ" เพื่อดูภาพรวม)`
}

// 4. ฟังก์ชันดึงสถานะระบบ (แก้ให้ดึงสดจาก Memory ไม่ต้อง fetch)
export async function formatSystemStatusForLine(): Promise<string> {
  try {
    // ✅ ดึงข้อมูลตรงๆ จาก Simulator (เร็วและชัวร์)
    const servers = getServerStates()
    const sensors = getSensorStates()

    const totalServers = servers.length
    const onlineServers = servers.filter(s => s.status === 'online' || s.status === 'warning').length
    
    // ดึงค่า Temp และ Power แบบปลอดภัย
    const tempSensor = sensors.find(s => s.type === 'temperature')
    const avgTemp = tempSensor ? tempSensor.value.toFixed(1) : "N/A"
    
    const powerSensor = sensors.find(s => s.type === 'power')
    const powerVal = powerSensor ? powerSensor.value.toFixed(1) : "N/A"

    return `📊 รายงานสถานะ Data Center

🖥️ Server: ${onlineServers}/${totalServers} Online
🌡️ Temp: ${avgTemp}°C
⚡ Power: ${powerVal} kW

${onlineServers === totalServers ? "✅ ระบบทำงานปกติ" : "⚠️ มีเซิร์ฟเวอร์ผิดปกติ"}

พิมพ์ "ช่วยเหลือ" เพื่อดูเมนู`
  } catch (error) {
    console.error("Error generating status:", error)
    return "❌ ไม่สามารถดึงข้อมูลได้"
  }
}