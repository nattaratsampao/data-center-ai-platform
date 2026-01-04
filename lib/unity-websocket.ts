// WebSocket server for real-time Unity communication
// Note: In production, use a proper WebSocket server (Socket.io, ws, etc.)

export interface UnityMessage {
  type: "SENSOR_UPDATE" | "AI_DECISION" | "COMMAND" | "METRICS" | "HEARTBEAT"
  data: any
  timestamp: string
}

export class UnityWebSocketManager {
  private static instance: UnityWebSocketManager
  private connections: Set<WebSocket> = new Set()
  private messageQueue: UnityMessage[] = []

  private constructor() {}

  static getInstance(): UnityWebSocketManager {
    if (!UnityWebSocketManager.instance) {
      UnityWebSocketManager.instance = new UnityWebSocketManager()
    }
    return UnityWebSocketManager.instance
  }

  // Add connection
  addConnection(ws: WebSocket) {
    this.connections.add(ws)
    console.log("[v0] Unity WebSocket connected. Total connections:", this.connections.size)
  }

  // Remove connection
  removeConnection(ws: WebSocket) {
    this.connections.delete(ws)
    console.log("[v0] Unity WebSocket disconnected. Total connections:", this.connections.size)
  }

  // Broadcast to all Unity clients
  broadcast(message: UnityMessage) {
    const payload = JSON.stringify(message)
    this.connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload)
      }
    })
  }

  // Send to specific client (if we implement client IDs)
  sendToClient(clientId: string, message: UnityMessage) {
    // Implementation depends on how you track client IDs
    console.log("[v0] Sending message to client:", clientId, message)
  }

  // Queue messages when no clients connected
  queueMessage(message: UnityMessage) {
    this.messageQueue.push(message)
    if (this.messageQueue.length > 100) {
      this.messageQueue.shift() // Keep only last 100 messages
    }
  }

  // Get queued messages (for new connections)
  getQueuedMessages(): UnityMessage[] {
    return [...this.messageQueue]
  }
}

// Helper functions for creating typed messages
export function createSensorUpdateMessage(data: any): UnityMessage {
  return {
    type: "SENSOR_UPDATE",
    data,
    timestamp: new Date().toISOString(),
  }
}

export function createAIDecisionMessage(data: any): UnityMessage {
  return {
    type: "AI_DECISION",
    data,
    timestamp: new Date().toISOString(),
  }
}

export function createCommandMessage(data: any): UnityMessage {
  return {
    type: "COMMAND",
    data,
    timestamp: new Date().toISOString(),
  }
}
