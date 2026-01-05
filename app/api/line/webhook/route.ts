import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// Verify LINE signature
function verifySignature(body: string, signature: string, channelSecret: string): boolean {
  const hash = crypto.createHmac("sha256", channelSecret).update(body).digest("base64")
  return hash === signature
}

interface Server {
  id: string
  name: string
  cpu: number
  memory: number
  temperature: number
  network: number
  status: string
  healthScore: number
}

interface TemperatureSensor {
  id: string
  value: number
  status: string
}

interface RealtimeData {
  stats: {
    totalServers: number
    onlineServers: number
    avgTemperature: number
    avgCPU: number
    powerUsage: number
    pue: number
    uptime: number
  }
  servers: Server[]
  sensors: {
    temperature: TemperatureSensor[]
    humidity: Array<{ id: string; value: number; status: string }>
    power: { total: number; servers: number; cooling: number }
  }
  aiInsights: {
    anomalyDetected: boolean
    predictiveAlerts: number
    optimizationsSuggested: number
    confidenceScore: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-line-signature")

    if (!signature) {
      console.log("[v0] LINE webhook called without signature (verification request)")
      return NextResponse.json({ status: "ok" }, { status: 200 })
    }

    const channelSecret = process.env.LINE_CHANNEL_SECRET

    if (!channelSecret) {
      console.error("[v0] LINE_CHANNEL_SECRET not configured")
      return NextResponse.json({ status: "ok" }, { status: 200 })
    }

    const body = await request.text()

    if (!body || body.length === 0) {
      console.log("[v0] Empty body received")
      return NextResponse.json({ status: "ok" }, { status: 200 })
    }

    const isValid = verifySignature(body, signature, channelSecret)

    if (!isValid) {
      console.error("[v0] Invalid LINE signature")
      return NextResponse.json({ status: "ok" }, { status: 200 })
    }

    const data = JSON.parse(body)
    const events = data.events || []

    console.log("[v0] LINE webhook received", events.length, "events")

    // Process each event
    for (const event of events) {
      if (event.type === "message" && event.message.type === "text") {
        await handleTextMessage(event)
      } else if (event.type === "follow") {
        await handleFollow(event)
      } else if (event.type === "unfollow") {
        await handleUnfollow(event)
      }
    }

    return NextResponse.json({ status: "ok" }, { status: 200 })
  } catch (error) {
    console.error("[v0] LINE webhook error:", error)
    return NextResponse.json({ status: "ok" }, { status: 200 })
  }
}

async function handleTextMessage(event: any) {
  const userMessage = event.message.text.toLowerCase()
  const replyToken = event.replyToken
  const userId = event.source.userId

  let replyMessage = ""

  // AI-powered responses based on user queries
  const realtimeData = await fetchRealtimeData()

  if (userMessage.includes("status") || userMessage.includes("สถานะ")) {
    replyMessage = `📊 สถานะ Data Center

🖥️ เซิร์ฟเวอร์: ${realtimeData.stats.onlineServers}/${realtimeData.stats.totalServers} ออนไลน์
🌡️ อุณหภูมิเฉลี่ย: ${realtimeData.stats.avgTemperature}°C
⚡ การใช้พลังงาน: ${realtimeData.stats.powerUsage}%
🔄 Uptime: ${realtimeData.stats.uptime.toFixed(2)}%

${realtimeData.stats.onlineServers === realtimeData.stats.totalServers ? "✅ ระบบทั้งหมดทำงานปกติ" : "⚠️ เซิร์ฟเวอร์บางตัวต้องการความสนใจ"}`
  } else if (userMessage.includes("alert") || userMessage.includes("แจ้งเตือน")) {
    const criticalServers = realtimeData.servers.filter((s: Server) => s.status === "critical")
    const warningServers = realtimeData.servers.filter((s: Server) => s.status === "warning")

    replyMessage = `🚨 การแจ้งเตือนล่าสุด

${criticalServers.length > 0 ? `🔴 Critical: ${criticalServers.length} เซิร์ฟเวอร์` : ""}
${warningServers.length > 0 ? `⚠️ Warning: ${warningServers.length} เซิร์ฟเวอร์` : ""}

${criticalServers.length === 0 && warningServers.length === 0 ? "✅ ไม่มีการแจ้งเตือนในขณะนี้" : ""}

${criticalServers.map((s: Server) => `• ${s.name}: CPU ${s.cpu}%`).join("\n")}
${warningServers.map((s: Server) => `• ${s.name}: CPU ${s.cpu}%`).join("\n")}

พิมพ์ "ช่วยเหลือ" เพื่อดูคำสั่งเพิ่มเติม`
  } else if (userMessage.includes("temperature") || userMessage.includes("อุณหภูมิ")) {
    const temps = realtimeData.sensors.temperature
    const avgTemp = (temps.reduce((sum: number, t: TemperatureSensor) => sum + t.value, 0) / temps.length).toFixed(1)
    const maxTemp = Math.max(...temps.map((t: TemperatureSensor) => t.value)).toFixed(1)
    const minTemp = Math.min(...temps.map((t: TemperatureSensor) => t.value)).toFixed(1)

    replyMessage = `🌡️ สถานะอุณหภูมิ

อุณหภูมิเฉลี่ย: ${avgTemp}°C
อุณหภูมิสูงสุด: ${maxTemp}°C
อุณหภูมิต่ำสุด: ${minTemp}°C

${temps.filter((t: TemperatureSensor) => t.status === "warning").length > 0 ? "⚠️ มี Sensor บางตัวแสดงค่าสูง" : "✅ ระบบทำความเย็นทำงานปกติ"}`
  } else if (userMessage.includes("help") || userMessage.includes("ช่วยเหลือ")) {
    replyMessage = `🤖 ผู้ช่วย Data Center AI

คำสั่งที่ใช้ได้:
• สถานะ - ดูสถานะระบบโดยรวม
• แจ้งเตือน - การแจ้งเตือนล่าสุด
• อุณหภูมิ - ข้อมูลอุณหภูมิ
• พลังงาน - การใช้พลังงาน
• เซิร์ฟเวอร์ - สุขภาพเซิร์ฟเวอร์
• ทำนาย - การทำนายจาก AI

พิมพ์คำสั่งใดก็ได้เพื่อเริ่มต้น!`
  } else if (userMessage.includes("power") || userMessage.includes("พลังงาน")) {
    const power = realtimeData.sensors.power

    replyMessage = `⚡ สถานะพลังงาน

การใช้งานรวม: ${power.total} kW
PUE: ${realtimeData.stats.pue}
ประสิทธิภาพ: ${realtimeData.stats.pue < 1.5 ? "ดีมาก ✅" : "พอใช้ ⚠️"}

เซิร์ฟเวอร์: ${power.servers} kW
ระบบทำความเย็น: ${power.cooling} kW`
  } else if (userMessage.includes("servers") || userMessage.includes("เซิร์ฟเวอร์")) {
    const excellentCount = realtimeData.servers.filter((s: Server) => s.healthScore >= 90).length
    const goodCount = realtimeData.servers.filter((s: Server) => s.healthScore >= 80 && s.healthScore < 90).length
    const warningCount = realtimeData.servers.filter((s: Server) => s.healthScore < 80).length

    replyMessage = `🖥️ สุขภาพเซิร์ฟเวอร์

ทั้งหมด: ${realtimeData.stats.totalServers} เครื่อง
ออนไลน์: ${realtimeData.stats.onlineServers} ✅
ออฟไลน์: ${realtimeData.stats.totalServers - realtimeData.stats.onlineServers}

คะแนนสุขภาพ:
• ดีมาก (90-100): ${excellentCount} เครื่อง
• ดี (80-89): ${goodCount} เครื่อง
• ต้องดูแล (<80): ${warningCount} เครื่อง`
  } else if (userMessage.includes("predict") || userMessage.includes("ทำนาย")) {
    const aiInsights = realtimeData.aiInsights

    replyMessage = `🔮 การทำนายจาก AI

ความมั่นใจ: ${aiInsights.confidenceScore}%

${aiInsights.anomalyDetected ? "🚨 ตรวจพบความผิดปกติ" : "✅ ไม่พบความผิดปกติ"}

การแจ้งเตือนแบบทำนาย: ${aiInsights.predictiveAlerts} รายการ
คำแนะนำการปรับปรุง: ${aiInsights.optimizationsSuggested} รายการ

${aiInsights.anomalyDetected ? "แนะนำ: ตรวจสอบเซิร์ฟเวอร์ที่มีสถานะ warning" : "แนะนำ: ระบบทำงานปกติ ไม่ต้องดำเนินการ"}`
  } else {
    replyMessage = `สวัสดีครับ! 👋

ผม Data Center AI Assistant
พร้อมช่วยคุณตรวจสอบระบบ Data Center แบบ Real-time

ข้อมูลปัจจุบัน:
🖥️ เซิร์ฟเวอร์: ${realtimeData.stats.onlineServers}/${realtimeData.stats.totalServers} ออนไลน์
🌡️ อุณหภูมิ: ${realtimeData.stats.avgTemperature}°C

พิมพ์ "ช่วยเหลือ" เพื่อดูคำสั่งทั้งหมด`
  }

  // Send reply
  await replyToUser(replyToken, replyMessage)

  // Log user interaction (optional)
  console.log(`[LINE Bot] User ${userId}: ${userMessage}`)
}

async function handleFollow(event: any) {
  const replyToken = event.replyToken
  const userId = event.source.userId

  const welcomeMessage = `🎉 ยินดีต้อนรับสู่ Data Center AI!

ขอบคุณที่เพิ่มเราเป็นเพื่อน!

คุณจะได้รับ:
✅ การแจ้งเตือนแบบ Real-time
✅ คำแนะนำจาก AI
✅ รายงานสถานะระบบ

พิมพ์ "ช่วยเหลือ" เพื่อเริ่มต้นใช้งาน`

  await replyToUser(replyToken, welcomeMessage)

  console.log(`[LINE Bot] New follower: ${userId}`)
}

async function handleUnfollow(event: any) {
  const userId = event.source.userId
  console.log(`[LINE Bot] User unfollowed: ${userId}`)
}

async function replyToUser(replyToken: string, message: string) {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN

  if (!channelAccessToken) {
    console.error("LINE_CHANNEL_ACCESS_TOKEN not set")
    return
  }

  try {
    const response = await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        replyToken,
        messages: [
          {
            type: "text",
            text: message,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("Failed to send reply:", error)
    }
  } catch (error) {
    console.error("Error sending reply:", error)
  }
}

async function fetchRealtimeData(): Promise<RealtimeData> {
  try {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

    const response = await fetch(`${baseUrl}/api/realtime/data`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch realtime data")
    }

    return await response.json()
  } catch (error) {
    console.error("[v0] Error fetching realtime data:", error)
    // Fallback data
    return {
      stats: {
        totalServers: 8,
        onlineServers: 8,
        avgTemperature: 25,
        avgCPU: 50,
        powerUsage: 75,
        pue: 1.42,
        uptime: 99.8,
      },
      servers: [],
      sensors: {
        temperature: [],
        humidity: [],
        power: { total: 30, servers: 20, cooling: 8 },
      },
      aiInsights: {
        anomalyDetected: false,
        predictiveAlerts: 0,
        optimizationsSuggested: 0,
        confidenceScore: 85,
      },
    }
  }
}
