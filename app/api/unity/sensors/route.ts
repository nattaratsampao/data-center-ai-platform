import { type NextRequest, NextResponse } from "next/server"
import { mockSensors } from "@/lib/mock-data"

// GET - Unity requests current sensor data
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      sensors: mockSensors,
    })
  } catch (error) {
    console.error("Unity sensors API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Unity sends updated sensor readings
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { serverId, sensorType, value } = data

    if (!serverId || !sensorType || value === undefined) {
      return NextResponse.json({ error: "Missing required fields: serverId, sensorType, value" }, { status: 400 })
    }

    // In production, save to database
    console.log("[v0] Unity sensor update:", { serverId, sensorType, value })

    return NextResponse.json({
      success: true,
      message: "Sensor data updated",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Unity sensors POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
