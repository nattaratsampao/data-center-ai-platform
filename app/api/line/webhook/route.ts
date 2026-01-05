import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
// ✅ Import ฟังก์ชันดึงข้อมูลโดยตรง
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
  const userMessage = event.message.text.trim().toLowerCase() // ปรับเป็นตัวเล็กหมดเพื่อให้เช็คง่าย
  const replyToken = event.replyToken
  
  // 📥 ดึงข้อมูล Real-time
  const servers = getServerStates()
  const sensors = getSensorStates()
  const activeEvents = getActiveEvents()

  let replyMessage = ""

  // --- 🎛️ Logic 6 ฟังก์ชัน ---

  // 1. Status (สถานะระบบรวม)
  if (userMessage.includes("สถานะ") || userMessage === "status") {
    const totalServers = servers.length
    const onlineServers = servers.filter(s => s.status === 'online' || s.status === 'warning').length
    const criticalCount = servers.filter(s => s.status === 'critical').length
    
    // หา Temp เฉลี่ย
    const tempSensors = sensors.filter(s => s.type === 'temperature')
    const avgTemp = tempSensors.length > 0 
      ? (tempSensors.reduce((a, b) => a + b.value, 0) / tempSensors.length).toFixed(1) 
      : "N/A"
    
    // หา Power
    const powerSensor = sensors.find(s => s.type === 'power')
    const powerVal = powerSensor ? powerSensor.value.toFixed(2) : "N/A"

    replyMessage = `📊 รายงานสถานะ Data Center

🖥️ เซิร์ฟเวอร์: ${onlineServers}/${totalServers} เครื่อง (Online)
🌡️ อุณหภูมิเฉลี่ย: ${avgTemp}°C
⚡ การใช้พลังงาน: ${powerVal} kW

${criticalCount === 0 ? "✅ ระบบทำงานปกติ" : `🚨 มี ${criticalCount} เครื่องอยู่ในสถานะวิกฤต!`}`
  } 
  
  // 2. Servers (เช็คสุขภาพเซิร์ฟเวอร์แบบเจาะจง)
  else if (userMessage.includes("เซิร์ฟเวอร์") || userMessage.includes("server")) {
    const online = servers.filter(s => s.status === 'online').length
    const warning = servers.filter(s => s.status === 'warning').length
    const critical = servers.filter(s => s.status === 'critical').length
    
    // รายชื่อเครื่องที่มีปัญหา
    const problemServers = servers
      .filter(s => s.status !== 'online')
      .map(s => `• ${s.name}: ${s.status.toUpperCase()} (Health: ${s.healthScore.toFixed(0)}%)`)
      .join("\n")

    replyMessage = `🖥️ สุขภาพเซิร์ฟเวอร์ (${servers.length} เครื่อง)

🟢 ปกติ: ${online} เครื่อง
🟡 Warning: ${warning} เครื่อง
🔴 Critical: ${critical} เครื่อง

${problemServers ? `📋 รายการที่ต้องดูแล:\n${problemServers}` : "✅ เซิร์ฟเวอร์ทุกเครื่องสุขภาพดีเยี่ยม"}`
  }

  // 3. Alert (แจ้งเตือนล่าสุด)
  else if (userMessage.includes("แจ้งเตือน") || userMessage.includes("alert")) {
    if (activeEvents.length === 0) {
      replyMessage = "✅ ไม่มีการแจ้งเตือนในขณะนี้ ระบบทำงานปกติ"
    } else {
      const recentEvents = activeEvents.slice(-5) // เอา 5 อันล่าสุด
      const eventList = recentEvents.map(e => 
        `[${e.severity.toUpperCase()}] ${e.title}\n👉 ${e.description}`
      ).join("\n\n")

      replyMessage = `🚨 การแจ้งเตือนล่าสุด (${activeEvents.length})\n\n${eventList}`
    }
  }

  // 4. Temperature (อุณหภูมิและความชื้น)
  else if (userMessage.includes("อุณหภูมิ") || userMessage.includes("temp") || userMessage.includes("temperature")) {
    const tempSensors = sensors.filter(s => s.type === 'temperature')
    const humiditySensors = sensors.filter(s => s.type === 'humidity')
    
    if (tempSensors.length === 0) {
      replyMessage = "⚠️ ไม่พบข้อมูลเซนเซอร์อุณหภูมิ"
    } else {
      const values = tempSensors.map(t => t.value)
      const maxTemp = Math.max(...values).toFixed(1)
      const avgTemp = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
      
      const avgHumid = humiditySensors.length > 0 
        ? (humiditySensors.reduce((a,b) => a + b.value, 0) / humiditySensors.length).toFixed(0) 
        : "N/A"

      replyMessage = `🌡️ สภาพแวดล้อม Data Center

🔥 อุณหภูมิเฉลี่ย: ${avgTemp}°C
📈 สูงสุด: ${maxTemp}°C
💧 ความชื้นเฉลี่ย: ${avgHumid}%

(จากเซนเซอร์ ${tempSensors.length} จุด)`
    }
  }

  // 5. Power (พลังงาน)
  else if (userMessage.includes("พลังงาน") || userMessage.includes("power") || userMessage.includes("ไฟ")) {
    const power = sensors.find(s => s.type === 'power')
    
    if (!power) {
      replyMessage = "⚠️ ไม่พบข้อมูลการใช้พลังงาน"
    } else {
      // Mock PUE Calculation
      const pue = (1.2 + (Math.random() * 0.3)).toFixed(2)
      
      replyMessage = `⚡ สถานะพลังงาน

🔌 การใช้งานรวม: ${power.value.toFixed(2)} kW
📊 PUE Score: ${pue}
✅ ประสิทธิภาพ: ${parseFloat(pue) < 1.5 ? "ดีมาก (Good)" : "พอใช้ (Average)"}

📍 จุดวัด: ${power.location}`
    }
  }

  // 6. Predict (AI ทำนายผล)
  else if (userMessage.includes("ทำนาย") || userMessage.includes("predict") || userMessage.includes("ai")) {
    // สร้าง AI Insight จากข้อมูลที่มี
    const riskServers = servers.filter(s => s.healthScore < 85)
    const predictiveAlerts = activeEvents.filter(e => e.type.includes("prediction") || e.type.includes("trend")).length
    
    // Mock Confidence Score
    const confidence = (85 + Math.random() * 14).toFixed(1)

    replyMessage = `🔮 AI Prediction Insights

🤖 AI Confidence: ${confidence}%
${riskServers.length > 0 ? "⚠️ ตรวจพบแนวโน้มความเสี่ยง" : "✅ แนวโน้มระบบปกติ"}

📋 การคาดการณ์:
• เซิร์ฟเวอร์เสี่ยง: ${riskServers.length} เครื่อง
• แจ้งเตือนล่วงหน้า: ${predictiveAlerts} รายการ

${riskServers.length > 0 
  ? `💡 คำแนะนำ: ควรตรวจสอบ ${riskServers[0].name} ภายใน 24 ชม.` 
  : "💡 คำแนะนำ: รักษาระดับอุณหภูมิให้คงที่เพื่อยืดอายุอุปกรณ์"}`
  }

  // Help & Default
  else if (userMessage.includes("ช่วย") || userMessage.includes("help") || userMessage.includes("เมนู")) {
    replyMessage = `🤖 เมนูคำสั่ง AI Guardian:

1️⃣ "สถานะ" - ภาพรวมระบบ
2️⃣ "เซิร์ฟเวอร์" - เจาะลึกรายเครื่อง
3️⃣ "แจ้งเตือน" - ดูปัญหาที่เกิด
4️⃣ "อุณหภูมิ" - ความร้อน/ความชื้น
5️⃣ "พลังงาน" - การใช้ไฟ/PUE
6️⃣ "ทำนาย" - วิเคราะห์อนาคตด้วย AI`
  } 
  
  else {
    // ไม่ตอบกลับกรณีพิมพ์เล่น หรือจะตอบข้อความ Default ก็ได้
    return
  }

  // Send reply
  await replyToUser(replyToken, replyMessage)
}

async function handleFollow(event: any) {
  const replyToken = event.replyToken
  const welcomeMessage = `🎉 สวัสดีครับ! ผมคือ AI Guardian\n\nผมพร้อมดูแล Data Center ของคุณ 24/7\n\nพิมพ์ "ช่วยเหลือ" เพื่อดูเมนูคำสั่งทั้ง 6 อย่างได้เลยครับ!`
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