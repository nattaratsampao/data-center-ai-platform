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

export function formatAlertForLine(alert: {
  type: string
  severity: string
  title: string
  description: string
  aiConfidence: number
}): string {
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

  return `${severityEmoji} Data Center Alert

📌 ${alert.title}

🔍 Type: ${typeText}
⚡ Severity: ${alert.severity.toUpperCase()}
🤖 AI Confidence: ${alert.aiConfidence}%

📝 Details:
${alert.description}

⏰ Time: ${new Date().toLocaleString("th-TH")}
`
}
