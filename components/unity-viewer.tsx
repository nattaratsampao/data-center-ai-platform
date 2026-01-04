"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Zap, Server, Thermometer, Activity } from "lucide-react"

export function UnityViewer() {
  const [isRunning, setIsRunning] = useState(false)
  const [metrics, setMetrics] = useState({
    avgTemperature: 24.5,
    totalPower: 4500,
    pue: 1.42,
    activeServers: 8,
  })

  return (
    <div className="space-y-6">
      {/* Unity WebGL Container */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">3D Data Center Simulation</h2>
              <p className="text-sm text-muted-foreground">Unity ML-Agents powered visualization</p>
            </div>
            <Badge variant={isRunning ? "default" : "secondary"} className="gap-1">
              <Activity className="w-3 h-3" />
              {isRunning ? "Running" : "Stopped"}
            </Badge>
          </div>

          {/* Unity Canvas Placeholder */}
          <div className="relative aspect-video bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden">
            <div className="text-center text-white space-y-4">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center animate-pulse">
                <Zap className="w-12 h-12" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Unity Build Required</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Place your Unity WebGL build files in the <code className="text-teal-400">public/unity/Build/</code>{" "}
                  directory
                </p>
              </div>
              <div className="flex gap-2 justify-center text-sm text-gray-400">
                <span>datacenter.data</span>
                <span>•</span>
                <span>datacenter.framework.js</span>
                <span>•</span>
                <span>datacenter.wasm</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              className="gap-2"
              variant={isRunning ? "secondary" : "default"}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause Simulation
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Simulation
                </>
              )}
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Thermometer className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Temperature</p>
              <p className="text-2xl font-bold text-foreground">{metrics.avgTemperature}°C</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Power</p>
              <p className="text-2xl font-bold text-foreground">{metrics.totalPower}W</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">PUE Score</p>
              <p className="text-2xl font-bold text-foreground">{metrics.pue}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
              <Server className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Servers</p>
              <p className="text-2xl font-bold text-foreground">{metrics.activeServers}/8</p>
            </div>
          </div>
        </Card>
      </div>

      {/* API Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">API Connection Status</h3>
        <div className="space-y-2">
          {[
            { endpoint: "/api/unity/sensors", status: "Ready" },
            { endpoint: "/api/unity/servers", status: "Ready" },
            { endpoint: "/api/unity/ai-decisions", status: "Ready" },
            { endpoint: "/api/unity/commands", status: "Ready" },
          ].map((api) => (
            <div
              key={api.endpoint}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <code className="text-sm text-muted-foreground">{api.endpoint}</code>
              <Badge variant="secondary" className="gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                {api.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Setup Instructions</h3>
        <ol className="space-y-2 text-sm text-blue-800">
          <li className="flex gap-2">
            <span className="font-semibold">1.</span>
            <span>Build your Unity project as WebGL (File → Build Settings → WebGL → Build)</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">2.</span>
            <span>Copy the Build folder contents to public/unity/Build/ in this project</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">3.</span>
            <span>Ensure your Unity scripts use the API endpoints shown above</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">4.</span>
            <span>Reload this page to see your 3D simulation</span>
          </li>
        </ol>
      </Card>
    </div>
  )
}
