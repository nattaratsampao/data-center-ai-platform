import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "LINE Notify token is required" }, { status: 400 })
    }

    const response = await fetch("https://notify-api.line.me/api/notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
      },
      body: new URLSearchParams({
        message: message,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json({ success: true, data })
    } else {
      return NextResponse.json(
        { error: "Failed to send LINE notification", details: data },
        { status: response.status },
      )
    }
  } catch (error) {
    console.error("LINE Notify error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
