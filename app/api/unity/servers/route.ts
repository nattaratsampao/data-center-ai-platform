import { type NextRequest, NextResponse } from "next/server"
import { mockServers } from "@/lib/mock-data"

// GET - Unity requests current server states
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      servers: mockServers,
    })
  } catch (error) {
    console.error("Unity servers API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Unity sends server state updates
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { serverId, cpu, memory, temperature, status } = data

    if (!serverId) {
      return NextResponse.json({ error: "Missing required field: serverId" }, { status: 400 })
    }

    // In production, save to database
    console.log("[v0] Unity server update:", { serverId, cpu, memory, temperature, status })

    return NextResponse.json({
      success: true,
      message: "Server state updated",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Unity servers POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
