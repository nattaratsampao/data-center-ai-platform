import { type NextRequest, NextResponse } from "next/server"

// POST - Unity sends AI agent decisions
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { agentId, decision, confidence, parameters, reward } = data

    if (!agentId || !decision) {
      return NextResponse.json({ error: "Missing required fields: agentId, decision" }, { status: 400 })
    }

    // Log AI decision for tracking
    console.log("[v0] Unity AI Decision:", {
      agentId,
      decision,
      confidence,
      parameters,
      reward,
      timestamp: new Date().toISOString(),
    })

    // In production, save to database for training data collection
    return NextResponse.json({
      success: true,
      message: "AI decision logged",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Unity AI decisions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET - Unity requests optimal actions (from pre-trained model)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serverId = searchParams.get("serverId")
    const scenario = searchParams.get("scenario")

    // Mock AI recommendation
    const recommendation = {
      action: "REBALANCE_LOAD",
      targetServer: "SERVER-002",
      confidence: 0.89,
      expectedImprovement: "12% efficiency gain",
      reasoning: "Current server overloaded, detected optimal migration path",
    }

    return NextResponse.json({
      success: true,
      recommendation,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Unity AI decisions GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
