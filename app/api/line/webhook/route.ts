import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
// ✅ Import ฟังก์ชันดึงข้อมูลโดยตรง (ไม่ต้อง fetch ผ่าน HTTP)
import { getServerStates, getSensorStates, getActiveEvents } from "@/lib/event-simulator"

// Verify LINE signature
function verifySignature(body: string, signature: string, channelSecret: string): boolean {
  const hash = crypto.createHmac("sha256", channelSecret).update(body).digest("base64")
  return hash === signature
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-line-signature")
    const channelSecret = process.env.LINE_CHANNEL_SECRET

    // Validate Configuration
    if (!channelSecret) {
      console.error("LINE_CHANNEL_SECRET not configured")
      return NextResponse.json({ status: "error", message: "Config missing" }, { status: 500 })
    }

    if (!signature) {
        return NextResponse.json({ status: "error", message: "Signature missing" }, { status: 400 })
    }

    const body = await request.text()
    if (!verifySignature(body, signature, channelSecret)) {
      console.error("Invalid LINE signature")
      return NextResponse.json({ status: "error", message: "Invalid signature" }, { status: 401 })
    }

    const data = JSON.parse(body)
    const events = data.events || []

    // Process each event
    for (const event of events) {
      if (event.type === "message" && event.message.type === "text") {
        await handleTextMessage(event)
      } else if (event.type === "follow") {
        await handleFollow(event)
      }
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("LINE webhook error:", error)
    return NextResponse.json({ status: "error" }, { status: 500 })
  }
}

async function handleTextMessage(event: any) {
  const userMessage = event.message.text.trim() // ไม่ต้อง Lowercase หมด เพราะบางทีเราอยากเช็คคำเฉพาะ
  const replyToken = event.replyToken
  
  // ✅ ดึงข้อมูลสดๆ จาก Memory (รวดเร็วทันใจ)
  const servers = getServerStates()
  const sensors = getSensorStates()
  const activeEvents = getActiveEvents()

  // คำนวณ Stats พื้นฐานเตรียมไว้
  const totalServers = servers.length
  const onlineServers = servers.filter(s => s.status === 'online' || s.status === 'warning').length
  const criticalCount = servers.filter(s => s.status === 'critical').length
  
  let replyMessage = ""

  // --- Logic การตอบกลับ ---

  if (userMessage === "สถานะ" || userMessage === "status") {
    const tempSensor = sensors.find(s => s.type === 'temperature') // เอาตัวแรกเป็นตัวแทน หรือจะหาค่าเฉลี่ยก็ได้
    const avgTemp = tempSensor ? tempSensor.value.toFixed(1) : "N/A"
    const powerSensor = sensors.find(s => s.type === 'power')
    const powerVal = powerSensor ? powerSensor.value.toFixed(1) : "N/A"

    replyMessage = `📊 รายงานสถานะ Data Center

🖥️ เซิร์ฟเวอร์: ${onlineServers}/${totalServers} เครื่อง (Online)
🌡️ อุณหภูมิ: ${avgTemp}°C
⚡ การใช้พลังงาน: ${powerVal} kW

${criticalCount === 0 ? "✅ ระบบทำงานปกติ" : `⚠️ มี ${criticalCount} เครื่องอยู่ในสถานะวิกฤต!`}`

  } else if (userMessage === "แจ้งเตือน" || userMessage === "alert") {
    if (activeEvents.length === 0) {
        replyMessage = "✅ ไม่มีเหตุการณ์แจ้งเตือนในขณะนี้ ระบบทำงานปกติ"
    } else {
        // เอาแค่ 3 รายการล่าสุด
        const recentEvents = activeEvents.slice(-3)
        const eventList = recentEvents.map(e => 
            `• [${e.severity.toUpperCase()}] ${e.title}\n  ${e.description}`
        ).join("\n\n")

        replyMessage = `🚨 การแจ้งเตือนล่าสุด (${activeEvents.length} รายการ)\n\n${eventList}\n\nพิมพ์ "สถานะ" เพื่อดูภาพรวม`
    }

  } else if (userMessage === "อุณหภูมิ" || userMessage === "temp") {
    // ✅ กรองเฉพาะ sensor ที่เป็น temperature
    const temps = sensors.filter(s => s.type === 'temperature')
    
    if (temps.length === 0) {
        replyMessage = "⚠️ ไม่พบข้อมูลเซนเซอร์อุณหภูมิ"
    } else {
        const values = temps.map(t => t.value)
        const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
        const max = Math.max(...values).toFixed(1)
        
        replyMessage = `🌡️ ตรวจสอบอุณหภูมิ (จาก ${temps.length} จุด)\n\nเฉลี่ย: ${avg}°C\nสูงสุด: ${max}°C\n\n${avg > "30" ? "⚠️ อุณหภูมิค่อนข้างสูง" : "✅ อุณหภูมิอยู่ในเกณฑ์ดี"}`
    }

  } else if (userMessage === "พลังงาน" || userMessage === "power") {
    const power = sensors.find(s => s.type === 'power')
    
    if (!power) {
        replyMessage = "⚠️ ไม่พบข้อมูลการใช้พลังงาน"
    } else {
        replyMessage = `⚡ สถานะพลังงาน\n\nการใช้งานรวม: ${power.value.toFixed(2)} kW\nสถานะ: ${power.status === 'normal' ? 'ปกติ ✅' : 'สูงผิดปกติ ⚠️'}`
    }

  } else if (userMessage === "ช่วยเหลือ" || userMessage === "help") {
    replyMessage = `🤖 คำสั่งที่ใช้ได้:\n\n• "สถานะ": ดูภาพรวมระบบ\n• "แจ้งเตือน": ดูเหตุการณ์ผิดปกติ\n• "อุณหภูมิ": ดูความร้อน\n• "พลังงาน": ดูการใช้ไฟ`
  
  } else {
    // กรณีพิมพ์คำอื่น ไม่ต้องตอบอะไร (หรือจะตอบ Default ก็ได้)
    return
  }

  // Send reply
  await replyToUser(replyToken, replyMessage)
}

async function handleFollow(event: any) {
  const replyToken = event.replyToken
  const welcomeMessage = `🎉 สวัสดีครับ! ผมคือ AI Guardian\n\nผมจะคอยช่วยดูแล Data Center ของคุณ\nพิมพ์ "ช่วยเหลือ" เพื่อดูเมนูคำสั่งได้เลยครับ`
  await replyToUser(replyToken, welcomeMessage)
}

// ฟังก์ชันส่งข้อความกลับหา User
async function replyToUser(replyToken: string, message: string) {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN

  if (!channelAccessToken) return

  try {
    await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        replyToken,
        messages: [{ type: "text", text: message }],
      }),
    })
  } catch (error) {
    console.error("Error sending reply:", error)
  }
}