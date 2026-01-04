import { type NextRequest, NextResponse } from "next/server"

// Broadcast to all followers
export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN

    if (!channelAccessToken) {
      return NextResponse.json({ error: "LINE_CHANNEL_ACCESS_TOKEN not configured" }, { status: 500 })
    }

    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 })
    }

    // Broadcast to all followers
    const response = await fetch("https://api.line.me/v2/bot/message/broadcast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
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
      return NextResponse.json({ error: "Failed to broadcast message", details: error }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Broadcast sent successfully" })
  } catch (error) {
    console.error("LINE broadcast error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
