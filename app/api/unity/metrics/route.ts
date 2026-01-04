import { type NextRequest, NextResponse } from "next/server"

// POST - Unity sends performance metrics
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { episodeId, metrics } = data

    if (!episodeId || !metrics) {
      return NextResponse.json({ error: "Missing required fields: episodeId, metrics" }, { status: 400 })
    }

    // Expected metrics structure:
    // {
    //   episodeId: "EP-001",
    //   metrics: {
    //     totalReward: 1250,
    //     efficiency: 0.87,
    //     energySaved: 340,
    //     downtimeMinutes: 2,
    //     avgTemperature: 22.5,
    //     pue: 1.15
    //   }
    // }

    console.log("[v0] Unity metrics received:", { episodeId, metrics })

    return NextResponse.json({
      success: true,
      message: "Metrics saved",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Unity metrics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET - Web dashboard requests historical metrics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const episodeId = searchParams.get("episodeId")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Mock historical data
    const mockHistory = Array.from({ length: limit }, (_, i) => ({
      episodeId: `EP-${String(i + 1).padStart(3, "0")}`,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      metrics: {
        totalReward: 1000 + Math.random() * 500,
        efficiency: 0.7 + Math.random() * 0.25,
        energySaved: Math.floor(Math.random() * 500),
        downtimeMinutes: Math.floor(Math.random() * 10),
        avgTemperature: 20 + Math.random() * 5,
        pue: 1.1 + Math.random() * 0.3,
      },
    }))

    return NextResponse.json({
      success: true,
      history: mockHistory,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Unity metrics GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
