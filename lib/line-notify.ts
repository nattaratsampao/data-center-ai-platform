export interface LineNotifyConfig {
  token: string
  enabled: boolean
}

export async function sendLineNotification(message: string, token: string): Promise<boolean> {
  try {
    const response = await fetch("/api/line-notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        token,
      }),
    })

    return response.ok
  } catch (error) {
    console.error("Failed to send LINE notification:", error)
    return false
  }
}

export async function formatAlertForLine(alert: {
  type: string
  severity: string
  title: string
  description: string
  aiConfidence: number
}): Promise<string> {
  const severityEmoji =
    {
      critical: "🚨",
      high: "⚠️",
      medium: "⚡",
      low: "ℹ️",
    }[alert.severity] || "📢"

  const typeText =
    {
      anomaly: "Anomaly Detection",
      prediction: "Predictive Alert",
      optimization: "Optimization",
    }[alert.type] || alert.type

  // Fetch real-time data
  let realtimeData
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/realtime/data`)
    realtimeData = await response.json()
  } catch (error) {
    console.error("Failed to fetch realtime data:", error)
    realtimeData = null
  }

  // Calculate temperature stats
  let tempStats = ""
  if (realtimeData?.sensors) {
    const tempSensors = realtimeData.sensors.filter((s: any) => s.type === "temperature")
    if (tempSensors.length > 0) {
      const temps = tempSensors.map((s: any) => s.value)
      const avgTemp = (temps.reduce((a: number, b: number) => a + b, 0) / temps.length).toFixed(1)
      const maxTemp = Math.max(...temps).toFixed(1)
      const minTemp = Math.min(...temps).toFixed(1)

      tempStats = `
🌡️ สถานะอุณหภูมิ
อุณหภูมิเฉลี่ย: ${avgTemp}°C
อุณหภูมิสูงสุด: ${maxTemp}°C
อุณหภูมิต่ำสุด: ${minTemp}°C
${Number.parseFloat(avgTemp) > 30 ? "⚠️ อุณหภูมิสูงกว่าปกติ" : "✅ อุณหภูมิปกติ"}
`
    }
  }

  // Calculate server stats
  let serverStats = ""
  if (realtimeData?.servers) {
    const onlineServers = realtimeData.servers.filter((s: any) => s.status === "online").length
    const totalServers = realtimeData.servers.length
    const avgCPU = (realtimeData.servers.reduce((sum: number, s: any) => sum + s.cpuUsage, 0) / totalServers).toFixed(1)

    serverStats = `
💻 สถานะเซิร์ฟเวอร์
ออนไลน์: ${onlineServers}/${totalServers} เครื่อง
CPU เฉลี่ย: ${avgCPU}%
${Number.parseFloat(avgCPU) > 80 ? "⚠️ CPU ใช้งานสูง" : "✅ CPU ปกติ"}
`
  }

  return `${severityEmoji} แจ้งเตือนจาก Data Center AI

📌 ${alert.title}

🔍 ประเภท: ${typeText}
⚡ ระดับ: ${alert.severity.toUpperCase()}
🤖 ความมั่นใจของ AI: ${alert.aiConfidence}%

📝 รายละเอียด:
${alert.description}
${tempStats}
${serverStats}
⏰ เวลา: ${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}
`
}
