"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Brain, Zap, Bell, CheckCircle, X, Clock } from "lucide-react"
import { generateAlerts, type AlertData } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function getAlertIcon(type: AlertData["type"]) {
  switch (type) {
    case "anomaly":
      return <AlertTriangle className="h-5 w-5" />
    case "prediction":
      return <Brain className="h-5 w-5" />
    case "optimization":
      return <Zap className="h-5 w-5" />
  }
}

function getSeverityStyles(severity: AlertData["severity"]) {
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
        bg: "bg-chart-4/10",
        border: "border-chart-4/30",
        text: "text-chart-4",
        badge: "bg-chart-4 text-foreground",
      }
    case "medium":
      return {
        bg: "bg-warning/10",
        border: "border-warning/30",
        text: "text-warning",
        badge: "bg-warning text-warning-foreground",
      }
    case "low":
      return {
        bg: "bg-primary/10",
        border: "border-primary/30",
        text: "text-primary",
        badge: "bg-primary/20 text-primary",
      }
  }
}

function formatTime(date: Date | string): string {
  // ✅ แก้ไข: รองรับทั้ง Date object และ String เพื่อความปลอดภัย
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // เช็คว่าเป็นวันที่ที่ถูกต้องหรือไม่
  if (!(d instanceof Date) || isNaN(d.getTime())) {
    return "N/A"; 
  }

  return d.toLocaleString("th-TH", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function AlertsPage() {
  // ✅ เริ่มต้นด้วย Array ว่างเสมอ
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [selectedType, setSelectedType] = useState<string>("all")

  // ✅ ฟังก์ชันแปลงข้อมูลให้ปลอดภัย (Safe Parsing)
  const processData = (rawData: any) => {
    // 1. เช็คว่าเป็น Array ไหม ถ้าไม่ให้คืนค่า Array ว่าง
    const list = Array.isArray(rawData?.alerts) ? rawData.alerts : []

    // 2. แปลง timestamp string เป็น Date object
    return list.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp)
    }))
  }

  useEffect(() => {
    const fetchRealtimeData = async () => {
      try {
        const response = await fetch("/api/realtime/data")
        const data = await response.json()
        
        // ✅ ใช้ processData ตรวจสอบและแปลงข้อมูลก่อน set state
        setAlerts(processData(data))
        
      } catch (error) {
        console.error("[v0] Failed to fetch realtime alerts:", error)
        setAlerts(generateAlerts())
      }
    }

    fetchRealtimeData()
    const interval = setInterval(fetchRealtimeData, 3000)
    return () => clearInterval(interval)
  }, [])

  // ✅ เพิ่ม || [] เพื่อป้องกันกรณี alerts หลุดเป็น undefined
  const safeAlerts = alerts || []
  const filteredAlerts = selectedType === "all" ? safeAlerts : safeAlerts.filter((a) => a.type === selectedType)

  const criticalCount = safeAlerts.filter((a) => a.severity === "critical").length
  const highCount = safeAlerts.filter((a) => a.severity === "high").length
  const anomalyCount = safeAlerts.filter((a) => a.type === "anomaly").length
  const predictionCount = safeAlerts.filter((a) => a.type === "prediction").length
  const optimizationCount = safeAlerts.filter((a) => a.type === "optimization").length

  const handleDismiss = (id: string) => {
    setAlerts(safeAlerts.filter((a) => a.id !== id))
  }

  const handleAcknowledge = (id: string) => {
    // In real app, this would update the alert status
    console.log("Acknowledged:", id)
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
            {safeAlerts.length} Active
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-destructive">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Critical</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-chart-4">{highCount}</div>
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
              <TabsTrigger value="all">All ({safeAlerts.length})</TabsTrigger>
              <TabsTrigger value="anomaly">Anomaly ({anomalyCount})</TabsTrigger>
              <TabsTrigger value="prediction">Prediction ({predictionCount})</TabsTrigger>
              <TabsTrigger value="optimization">Optimization ({optimizationCount})</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedType} className="mt-0">
              <div className="space-y-4">
                {filteredAlerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-success" />
                    <p>No alerts in this category</p>
                  </div>
                ) : (
                  filteredAlerts.map((alert) => {
                    const styles = getSeverityStyles(alert.severity)
                    return (
                      <div
                        key={alert.id}
                        className={cn("rounded-lg border p-4 transition-all", styles.bg, styles.border)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn("p-2 rounded-lg bg-background", styles.text)}>
                            {getAlertIcon(alert.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-semibold text-foreground">{alert.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                              </div>
                              <Badge className={styles.badge}>{alert.severity}</Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatTime(alert.timestamp)}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Brain className="h-3 w-3" />
                                AI Confidence: {alert.aiConfidence}%
                              </div>
                              <Badge variant="outline" className="text-xs capitalize">
                                {alert.type}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => handleAcknowledge(alert.id)}
                            >
                              <CheckCircle className="h-4 w-4 text-success" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => handleDismiss(alert.id)}
                            >
                              <X className="h-4 w-4 text-muted-foreground" />
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