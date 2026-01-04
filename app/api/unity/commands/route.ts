import { type NextRequest, NextResponse } from "next/server"

// POST - Web dashboard sends commands to Unity
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { command, targetId, parameters } = data

    if (!command) {
      return NextResponse.json({ error: "Missing required field: command" }, { status: 400 })
    }

    // Validate command types
    const validCommands = [
      "START_SIMULATION",
      "STOP_SIMULATION",
      "RESET_SIMULATION",
      "ADJUST_COOLING",
      "MIGRATE_WORKLOAD",
      "SHUTDOWN_SERVER",
      "RESTART_SERVER",
    ]

    if (!validCommands.includes(command)) {
      return NextResponse.json({ error: "Invalid command type" }, { status: 400 })
    }

    // In production, push to message queue or WebSocket
    console.log("[v0] Command sent to Unity:", { command, targetId, parameters })

    return NextResponse.json({
      success: true,
      message: "Command queued for Unity",
      commandId: `CMD-${Date.now()}`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Unity commands error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
