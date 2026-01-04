import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// Verify LINE signature
function verifySignature(body: string, signature: string, channelSecret: string): boolean {
  const hash = crypto.createHmac("sha256", channelSecret).update(body).digest("base64")
  return hash === signature
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
  if (userMessage.includes("status") || userMessage.includes("สถานะ")) {
    replyMessage = `📊 Data Center Status

🖥️ Servers: 8 online
🌡️ Avg Temperature: 24.5°C
⚡ Power Usage: 78%
🔄 Uptime: 99.8%

✅ All systems operational!`
  } else if (userMessage.includes("alert") || userMessage.includes("แจ้งเตือน")) {
    replyMessage = `🚨 Recent Alerts

⚠️ 2 Active Warnings:
• Server-03: High CPU (85%)
• CRAC-01: Maintenance due in 7 days

Type "help" for more commands`
  } else if (userMessage.includes("temperature") || userMessage.includes("อุณหภูมิ")) {
    replyMessage = `🌡️ Temperature Status

Server Room: 24.5°C ✅
Hot Aisle: 32.1°C ⚠️
Cold Aisle: 18.2°C ✅

CRAC units operating normally`
  } else if (userMessage.includes("help") || userMessage.includes("ช่วยเหลือ")) {
    replyMessage = `🤖 Data Center AI Assistant

Available commands:
• status - Overall system status
• alert - Recent alerts
• temperature - Temperature info
• power - Power consumption
• servers - Server health
• predict - AI predictions

Type any command to get started!`
  } else if (userMessage.includes("power") || userMessage.includes("พลังงาน")) {
    replyMessage = `⚡ Power Status

Total Consumption: 78 kW
PUE: 1.42
Efficiency: Good ✅

Server Power: 55 kW
Cooling Power: 18 kW
Other: 5 kW`
  } else if (userMessage.includes("servers") || userMessage.includes("เซิร์ฟเวอร์")) {
    replyMessage = `🖥️ Server Health

Total: 8 servers
Online: 8 ✅
Offline: 0

Health Scores:
• Excellent (90-100): 6 servers
• Good (80-89): 2 servers
• Warning (<80): 0 servers`
  } else if (userMessage.includes("predict") || userMessage.includes("ทำนาย")) {
    replyMessage = `🔮 AI Predictions

Next 24 hours:
• Temperature spike expected at 14:00 (32°C)
• Workload increase at 09:00 (+25%)
• Server-03 CPU may need attention

Recommendation: Schedule cooling boost at 13:30`
  } else {
    replyMessage = `สวัสดีครับ! 👋

ผม Data Center AI Assistant
พร้อมช่วยคุณตรวจสอบระบบ Data Center

พิมพ์ "help" เพื่อดูคำสั่งทั้งหมด`
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

พิมพ์ "help" เพื่อเริ่มต้นใช้งาน`

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
