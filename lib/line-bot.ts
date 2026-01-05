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
  aiConfidence: number
  timestamp?: string
}

// ส่งการแจ้งเตือนไปยังผู้ใช้ LINE คนใดคนหนึ่ง
export async function sendLineBotAlert(userId: string, alert: LineBotAlert): Promise<boolean> {
  try {
    const message = formatAlertForLineBot(alert)

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

// ส่งการแจ้งเตือนไปยังเพื่อนทั้งหมด
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

export function formatAlertForLineBot(alert: LineBotAlert): string {
  const severityEmoji =
    {
      critical: "🚨",
      high: "⚠️",
      medium: "⚡",
      low: "ℹ️",
    }[alert.severity] || "📢"

  const typeText =
    {
      anomaly: "ตรวจพบความผิดปกติ",
      prediction: "การทำนายจาก AI",
      optimization: "คำแนะนำการปรับปรุง",
    }[alert.type] || alert.type

  return `${severityEmoji} ${typeText}

📌 ${alert.title}

${alert.description}

🤖 ความมั่นใจของ AI: ${alert.aiConfidence}%
⏰ ${alert.timestamp || new Date().toLocaleString("th-TH")}

พิมพ์ "สถานะ" เพื่อดูสถานะระบบ
พิมพ์ "ช่วยเหลือ" เพื่อดูคำสั่งทั้งหมด`
}

// จัดรูปแบบสถานะระบบสำหรับ LINE
export async function formatSystemStatusForLine(): Promise<string> {
  try {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

    const response = await fetch(`${baseUrl}/api/realtime/data`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch data")
    }

    const data = await response.json()

    return `📊 รายงานสถานะ Data Center

🖥️ เซิร์ฟเวอร์: ${data.stats.onlineServers}/${data.stats.totalServers} ออนไลน์
🌡️ อุณหภูมิเฉลี่ย: ${data.stats.avgTemperature.toFixed(1)}°C
⚡ การใช้พลังงาน: ${data.stats.powerUsage.toFixed(1)}%
🔄 Uptime: ${data.stats.uptime.toFixed(2)}%

${data.stats.onlineServers === data.stats.totalServers ? "✅ ระบบทั้งหมดทำงานปกติ" : "⚠️ เซิร์ฟเวอร์บางตัวออฟไลน์"}

พิมพ์ "แจ้งเตือน" เพื่อดู alerts ล่าสุด
พิมพ์ "ช่วยเหลือ" เพื่อดูคำสั่งทั้งหมด`
  } catch (error) {
    console.error("Error fetching system status:", error)
    return "❌ ไม่สามารถดึงข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง"
  }
}
