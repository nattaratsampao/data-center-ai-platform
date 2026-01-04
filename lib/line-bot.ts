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

// Send alert to specific LINE user
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
    console.error("Failed to send LINE Bot alert:", error)
    return false
  }
}

// Broadcast alert to all followers
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
    console.error("Failed to broadcast LINE Bot alert:", error)
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
      anomaly: "Anomaly Detected",
      prediction: "Predictive Alert",
      optimization: "Optimization Suggestion",
    }[alert.type] || alert.type

  return `${severityEmoji} ${typeText}

📌 ${alert.title}

${alert.description}

🤖 AI Confidence: ${alert.aiConfidence}%
⏰ ${alert.timestamp || new Date().toLocaleString("th-TH")}

Type "status" to check system status
Type "help" for more commands`
}

// Format system status for LINE
export function formatSystemStatusForLine(data: {
  totalServers: number
  onlineServers: number
  avgTemperature: number
  powerUsage: number
  uptime: number
}): string {
  return `📊 Data Center Status Report

🖥️ Servers: ${data.onlineServers}/${data.totalServers} online
🌡️ Temperature: ${data.avgTemperature.toFixed(1)}°C
⚡ Power Usage: ${data.powerUsage}%
🔄 Uptime: ${data.uptime}%

${data.onlineServers === data.totalServers ? "✅ All systems operational" : "⚠️ Some servers offline"}

Type "alert" to see recent alerts
Type "help" for more commands`
}
