import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userId, message } = await request.json()
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN

    if (!channelAccessToken) {
      return NextResponse.json({ error: "LINE_CHANNEL_ACCESS_TOKEN not configured" }, { status: 500 })
    }

    if (!userId || !message) {
      return NextResponse.json({ error: "Missing userId or message" }, { status: 400 })
    }

    // Send push message to specific user
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        to: userId,
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
      return NextResponse.json({ error: "Failed to send push message", details: error }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Push message sent successfully" })
  } catch (error) {
    console.error("LINE push error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
