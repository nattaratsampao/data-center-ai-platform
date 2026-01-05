"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AlertTriangle, 
  Brain, 
  Zap, 
  Bell, 
  CheckCircle, 
  X, 
  Clock, 
  Thermometer, 
  Server, 
  Activity, 
  Wifi, 
  HardDrive 
} from "lucide-react"
import { cn } from "@/lib/utils"

// --- Interfaces ให้ตรงกับ API ใหม่ ---
interface SimulationEvent {
  id: string
  type: string
  severity: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  timestamp: Date
  aiResponse?: string
  resolved: boolean
}

// --- Helper Functions ---

function getAlertIcon(type: string) {
  switch (type) {
    case "temperature_spike":
    case "cooling_failure":
      return <Thermometer className="h-5 w-5" />
    case "power_surge":
      return <Zap className="h-5 w-5" />
    case "network_congestion":
      return <Wifi className="h-5 w-5" />
    case "disk_full":
      return <HardDrive className="h-5 w-5" />
    case "cpu_spike":
    case "memory_leak":
    case "workload_surge":
      return <Activity className="h-5 w-5" />
    case "ai_optimization":
    case "prediction":
      return <Brain className="h-5 w-5" />
    case "maintenance_required":
    case "hardware_failure":
      return <Server className="h-5 w-5" />
    default:
      return <AlertTriangle className="h-5 w-5" />
  }
}

// จัดหมวดหมู่ Event Type ใหม่ ให้เข้ากับ Tabs เดิม
function getCategory(type: string): "anomaly" | "prediction" | "optimization" {
  if (type.includes("optimization") || type.includes("maintenance")) return "optimization"
  if (type.includes("prediction") || type.includes("workload")) return "prediction"
  return "anomaly" // default for spikes, failures, etc.
}

function getSeverityStyles(severity: string) {
  switch (severity) {
    case "critical":
      return {
        bg: "bg-destructive/10",
        border: "border-destructive/30",
        text: "text-destructive",
        badge: "bg-destructive text-destructive-foreground",
      }
    case "high":
      return {
        bg: "bg-orange-500/10",
        border: "border-orange-500/30",
        text: "text-orange-500",
        badge: "bg-orange-500 text-white",
      }
    case "medium":
      return {
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/30",
        text: "text-yellow-500",
        badge: "bg-yellow-500 text-white",
      }
    case "low":
      return {
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        text: "text-blue-500",
        badge: "bg-blue-500 text-white",
      }
    default:
      return {
        bg: "bg-muted/10",
        border: "border-muted/30",
        text: "text-muted-foreground",
        badge: "bg-muted text-muted-foreground",
      }
  }
}

function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!(d instanceof Date) || isNaN(d.getTime())) return "N/A";
  
  return d.toLocaleString("th-TH", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  })
}

// --- Main Component ---

export function AlertsPage() {
  const [alerts, setAlerts] = useState<SimulationEvent[]>([])
  const [selectedType, setSelectedType] = useState<string>("all")

  // ฟังก์ชันดึงและแปลงข้อมูล
  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/realtime/data")
      const data = await response.json()
      
      // ✅ 1. ดึงจาก activeEvents แทน alerts
      const rawEvents = Array.isArray(data?.activeEvents) ? data.activeEvents : []

      // ✅ 2. แปลงข้อมูลให้ตรง Interface
      const processedEvents = rawEvents.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }))

      // เรียงลำดับเอาเหตุการณ์ล่าสุดขึ้นก่อน
      processedEvents.sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())

      setAlerts(processedEvents)
    } catch (error) {
      console.error("Failed to fetch alerts:", error)
    }
  }

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 3000)
    return () => clearInterval(interval)
  }, [])

  // Filtering Logic
  const filteredAlerts = selectedType === "all" 
    ? alerts 
    : alerts.filter((a) => getCategory(a.type) === selectedType)

  // Stats Calculation
  const criticalCount = alerts.filter((a) => a.severity === "critical").length
  const highCount = alerts.filter((a) => a.severity === "high").length
  
  const anomalyCount = alerts.filter((a) => getCategory(a.type) === "anomaly").length
  const predictionCount = alerts.filter((a) => getCategory(a.type) === "prediction").length
  const optimizationCount = alerts.filter((a) => getCategory(a.type) === "optimization").length

  // Handlers (Mock)
  const handleDismiss = (id: string) => {
    setAlerts(prev => prev.filter((a) => a.id !== id))
  }

  const handleAcknowledge = (id: string) => {
    console.log("Acknowledged Event ID:", id)
    // ในโปรเจคจริงอาจยิง API กลับไปเพื่อ update status
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alert Center</h1>
          <p className="text-muted-foreground">AI-generated alerts and notifications</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Bell className="h-3 w-3" />
            {alerts.length} Active
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-destructive">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Critical</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-500">{highCount}</div>
            <p className="text-xs text-muted-foreground">High Priority</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{anomalyCount}</div>
            <p className="text-xs text-muted-foreground">Anomalies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{predictionCount}</div>
            <p className="text-xs text-muted-foreground">Predictions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{optimizationCount}</div>
            <p className="text-xs text-muted-foreground">Optimizations</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>All Alerts</CardTitle>
          <CardDescription>Real-time alerts from AI monitoring systems</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedType}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({alerts.length})</TabsTrigger>
              <TabsTrigger value="anomaly">Anomaly ({anomalyCount})</TabsTrigger>
              <TabsTrigger value="prediction">Prediction ({predictionCount})</TabsTrigger>
              <TabsTrigger value="optimization">Optimization ({optimizationCount})</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedType} className="mt-0">
              <div className="space-y-4">
                {filteredAlerts.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No alerts in this category</p>
                    <p className="text-xs text-muted-foreground mt-1">System is running normally</p>
                  </div>
                ) : (
                  filteredAlerts.map((alert) => {
                    const styles = getSeverityStyles(alert.severity)
                    return (
                      <div
                        key={alert.id}
                        className={cn("rounded-lg border p-4 transition-all hover:bg-accent/5", styles.bg, styles.border)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn("p-2 rounded-lg bg-background shadow-sm", styles.text)}>
                            {getAlertIcon(alert.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-semibold text-foreground flex items-center gap-2">
                                  {alert.title}
                                  {alert.severity === 'critical' && (
                                     <span className="flex h-2 w-2 rounded-full bg-destructive animate-pulse" />
                                  )}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                              </div>
                              <Badge className={cn("uppercase text-[10px]", styles.badge)}>
                                {alert.severity}
                              </Badge>
                            </div>

                            {/* AI Response Section */}
                            {alert.aiResponse && (
                                <div className="mt-3 bg-background/50 p-2 rounded text-sm border border-border/50 flex gap-2">
                                    <Brain className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                    <span className="text-primary-foreground/80 text-xs md:text-sm">
                                        <span className="font-semibold text-primary">AI Action:</span> {alert.aiResponse}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatTime(alert.timestamp)}
                              </div>
                              <Badge variant="outline" className="text-xs capitalize bg-background">
                                Type: {alert.type.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex flex-col gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 hover:text-success hover:bg-success/10"
                              onClick={() => handleAcknowledge(alert.id)}
                              title="Acknowledge"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDismiss(alert.id)}
                              title="Dismiss"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}