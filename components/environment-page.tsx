"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Thermometer, 
  Droplets, 
  Zap, 
  Vibrate, 
  RefreshCw, 
  AlertTriangle, 
  Loader2, 
  Activity // <--- เพิ่มตรงนี้แล้วครับ
} from "lucide-react"
import { generateSensorData, type SensorData } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

// --- Helper Functions ---

function getStatusColor(status: SensorData["status"]) {
  switch (status) {
    case "normal":
      return "text-success"
    case "warning":
      return "text-warning"
    case "critical":
      return "text-destructive"
    default:
      return "text-muted-foreground"
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
    default:
      return "bg-muted/10 border-muted/30"
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
    default:
      return <Activity className="h-5 w-5" />
  }
}

// --- Main Component ---

export function EnvironmentPage() {
  const [sensors, setSensors] = useState<SensorData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedType, setSelectedType] = useState<string>("all")

  // ฟังก์ชันโหลดข้อมูลที่ปลอดภัย (Robust Fetching)
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/realtime/data")
      
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      const data = await response.json()
      
      // ⚠️ จุดสำคัญ: แปลง String Date กลับเป็น Object Date ทันที
      const safeSensors = (data.sensors || []).map((s: any) => ({
        ...s,
        lastUpdated: s.lastUpdated ? new Date(s.lastUpdated) : new Date(),
      }))

      setSensors(safeSensors)
    } catch (error) {
      console.error("[Environment] Fetch failed, using mock data:", error)
      setSensors(generateSensorData()) // Fallback ไปใช้ Mock Data ถ้า API พัง
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auto-refresh logic
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [fetchData])

  // Handle Manual Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchData()
    // หน่วงเวลานิดนึงให้ user รู้สึกว่าโหลดเสร็จแล้ว
    setTimeout(() => setIsRefreshing(false), 500)
  }

  // คำนวณ Stats ด้วย useMemo (ไม่คำนวณซ้ำถ้ารายการ sensors ไม่เปลี่ยน)
  const stats = useMemo(() => {
    const getAvg = (type: string) => {
      const list = sensors.filter((s) => s.type === type)
      if (!list.length) return 0
      return list.reduce((acc, curr) => acc + curr.value, 0) / list.length
    }

    const getTotal = (type: string) => {
      return sensors.filter((s) => s.type === type).reduce((acc, curr) => acc + curr.value, 0)
    }

    return {
      avgTemp: getAvg("temperature"),
      avgHumidity: getAvg("humidity"),
      totalPower: getTotal("power"),
      avgVibration: getAvg("vibration"),
      critical: sensors.filter((s) => s.status === "critical").length,
      warning: sensors.filter((s) => s.status === "warning").length,
    }
  }, [sensors])

  const filteredSensors = selectedType === "all" 
    ? sensors 
    : sensors.filter((s) => s.type === selectedType)

  // Loading State
  if (isLoading && sensors.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading environment data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Environment Monitoring</h1>
          <p className="text-muted-foreground">Real-time sensor data from all zones</p>
        </div>
        <div className="flex items-center gap-3">
          {stats.critical > 0 && (
            <Badge variant="destructive" className="gap-1 animate-pulse">
              <AlertTriangle className="h-3 w-3" />
              {stats.critical} Critical
            </Badge>
          )}
          {stats.warning > 0 && (
            <Badge className="gap-1 bg-warning text-warning-foreground">
              {stats.warning} Warning
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
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
            <div className="text-2xl font-bold">{stats.avgTemp.toFixed(1)} °C</div>
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
            <div className="text-2xl font-bold">{stats.avgHumidity.toFixed(0)} %</div>
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
            <div className="text-2xl font-bold">{stats.totalPower.toFixed(1)} kW</div>
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
            <div className="text-2xl font-bold">{stats.avgVibration.toFixed(1)} mm/s</div>
            <p className="text-xs text-muted-foreground">Average vibration level</p>
          </CardContent>
        </Card>
      </div>

      {/* Sensor Grid with Tabs */}
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
                {filteredSensors.length > 0 ? (
                  filteredSensors.map((sensor) => (
                    <div
                      key={sensor.id}
                      className={cn(
                        "rounded-lg border p-4 transition-all hover:scale-102 cursor-pointer",
                        getStatusBg(sensor.status)
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
                        <span className={cn("text-2xl font-bold", getStatusColor(sensor.status))}>
                          {sensor.value}
                        </span>
                        <span className="text-sm text-muted-foreground ml-1">{sensor.unit}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Updated: {sensor.lastUpdated.toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <p>No sensors found in this category.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}