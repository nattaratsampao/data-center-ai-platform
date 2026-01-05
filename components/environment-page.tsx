"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Thermometer, Droplets, Zap, Vibrate, RefreshCw, AlertTriangle } from "lucide-react"
import { generateSensorData, type SensorData } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function getStatusColor(status: SensorData["status"]) {
  switch (status) {
    case "normal":
      return "text-success"
    case "warning":
      return "text-warning"
    case "critical":
      return "text-destructive"
  }
}

function getStatusBg(status: SensorData["status"]) {
  switch (status) {
    case "normal":
      return "bg-success/10 border-success/30"
    case "warning":
      return "bg-warning/10 border-warning/30"
    case "critical":
      return "bg-destructive/10 border-destructive/30"
  }
}

function getSensorIcon(type: SensorData["type"]) {
  switch (type) {
    case "temperature":
      return <Thermometer className="h-5 w-5" />
    case "humidity":
      return <Droplets className="h-5 w-5" />
    case "power":
      return <Zap className="h-5 w-5" />
    case "vibration":
      return <Vibrate className="h-5 w-5" />
  }
}

export function EnvironmentPage() {
  const [sensors, setSensors] = useState<SensorData[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedType, setSelectedType] = useState<string>("all")

  useEffect(() => {
    const fetchRealtimeData = async () => {
      try {
        const response = await fetch("/api/realtime/data")
        const data = await response.json()
        setSensors(data.sensors)
      } catch (error) {
        console.error("[v0] Failed to fetch realtime sensor data:", error)
        setSensors(generateSensorData())
      }
    }

    fetchRealtimeData()
    const interval = setInterval(fetchRealtimeData, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/realtime/data")
      const data = await response.json()
      setSensors(data.sensors)
    } catch (error) {
      console.error("[v0] Failed to refresh sensor data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const filteredSensors = selectedType === "all" ? sensors : sensors.filter((s) => s.type === selectedType)

  const criticalCount = sensors.filter((s) => s.status === "critical").length
  const warningCount = sensors.filter((s) => s.status === "warning").length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Environment Monitoring</h1>
          <p className="text-muted-foreground">Real-time sensor data from all zones</p>
        </div>
        <div className="flex items-center gap-3">
          {criticalCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {criticalCount} Critical
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge className="gap-1 bg-warning text-warning-foreground">{warningCount} Warning</Badge>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-chart-4" />
              Temperature
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                sensors.filter((s) => s.type === "temperature").reduce((a, b) => a + b.value, 0) /
                Math.max(sensors.filter((s) => s.type === "temperature").length, 1)
              ).toFixed(1)}
              °C
            </div>
            <p className="text-xs text-muted-foreground">Average across all sensors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Droplets className="h-4 w-4 text-chart-5" />
              Humidity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                sensors.filter((s) => s.type === "humidity").reduce((a, b) => a + b.value, 0) /
                Math.max(sensors.filter((s) => s.type === "humidity").length, 1)
              ).toFixed(0)}
              %
            </div>
            <p className="text-xs text-muted-foreground">Optimal: 40-60%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-chart-3" />
              Power
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sensors
                .filter((s) => s.type === "power")
                .reduce((a, b) => a + b.value, 0)
                .toFixed(1)}{" "}
              kW
            </div>
            <p className="text-xs text-muted-foreground">Total consumption</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Vibrate className="h-4 w-4 text-primary" />
              Vibration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                sensors.filter((s) => s.type === "vibration").reduce((a, b) => a + b.value, 0) /
                Math.max(sensors.filter((s) => s.type === "vibration").length, 1)
              ).toFixed(1)}{" "}
              mm/s
            </div>
            <p className="text-xs text-muted-foreground">Average vibration level</p>
          </CardContent>
        </Card>
      </div>

      {/* Sensor Grid */}
      <Card>
        <CardHeader>
          <CardTitle>All Sensors</CardTitle>
          <CardDescription>Click on a sensor for detailed view</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedType}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="temperature">Temperature</TabsTrigger>
              <TabsTrigger value="humidity">Humidity</TabsTrigger>
              <TabsTrigger value="power">Power</TabsTrigger>
              <TabsTrigger value="vibration">Vibration</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedType} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSensors.map((sensor) => (
                  <div
                    key={sensor.id}
                    className={cn(
                      "rounded-lg border p-4 transition-all hover:scale-102 cursor-pointer",
                      getStatusBg(sensor.status),
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className={cn("p-2 rounded-lg bg-background", getStatusColor(sensor.status))}>
                        {getSensorIcon(sensor.type)}
                      </div>
                      <Badge variant="outline" className={cn("capitalize", getStatusColor(sensor.status))}>
                        {sensor.status}
                      </Badge>
                    </div>
                    <div className="mt-3">
                      <h4 className="font-medium text-foreground">{sensor.name}</h4>
                      <p className="text-xs text-muted-foreground">{sensor.location}</p>
                    </div>
                    <div className="mt-2">
                      <span className={cn("text-2xl font-bold", getStatusColor(sensor.status))}>{sensor.value}</span>
                      <span className="text-sm text-muted-foreground ml-1">{sensor.unit}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Updated: {sensor.lastUpdated.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
