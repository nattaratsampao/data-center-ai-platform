"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Server, Thermometer, Zap, Activity, AlertTriangle, TrendingUp, Brain, RefreshCw } from "lucide-react"
import { fetchRealtimeData } from "@/lib/ai-client"
import { TemperatureChart } from "./charts/temperature-chart"
import { PowerChart } from "./charts/power-chart"
import { ServerHeatmap } from "./server-heatmap"
import { AlertsList } from "./alerts-list"
import { generateAlerts } from "@/lib/mock-data"

export function OverviewPage() {
  const [realtimeData, setRealtimeData] = useState<any>(null)
  const [alerts, setAlerts] = useState(generateAlerts())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    // Initial load
    loadRealtimeData()

    // Auto-refresh every 3 seconds
    const interval = setInterval(() => {
      loadRealtimeData()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const loadRealtimeData = async () => {
    try {
      const data = await fetchRealtimeData()
      setRealtimeData(data)
      setLastUpdate(new Date())
    } catch (error) {
      console.error("[v0] Failed to load realtime data:", error)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadRealtimeData()
    setAlerts(generateAlerts())
    setTimeout(() => setIsRefreshing(false), 500)
  }

  if (!realtimeData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Brain className="h-12 w-12 animate-pulse mx-auto text-primary" />
          <p className="text-muted-foreground">กำลังโหลดข้อมูล AI...</p>
        </div>
      </div>
    )
  }

  const { servers, stats, aiInsights } = realtimeData
  const criticalAlerts = alerts.filter((a) => a.severity === "critical").length
  const warningServers = servers.filter((s: any) => s.status === "warning").length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            ระบบตรวจสอบแบบ Real-time พร้อม AI • อัปเดตล่าสุด: {lastUpdate.toLocaleTimeString("th-TH")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Live
          </Badge>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            รีเฟรช
          </Button>
        </div>
      </div>

      {/* Stats Grid - แสดงค่าที่เปลี่ยนแปลง */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">เซิร์ฟเวอร์ออนไลน์</CardTitle>
            <Server className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.onlineServers}/{stats.totalServers}
            </div>
            <p className="text-xs text-muted-foreground">
              {warningServers > 0 && <span className="text-warning">{warningServers} คำเตือน</span>}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">อุณหภูมิเฉลี่ย</CardTitle>
            <Thermometer className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgTemperature}°C</div>
            <p className="text-xs text-muted-foreground">ช่วงที่เหมาะสม: 20-25°C</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">การใช้พลังงาน</CardTitle>
            <Zap className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realtimeData.sensors.power.total} kW</div>
            <div className="flex items-center text-xs text-success">
              <TrendingUp className="h-3 w-3 mr-1" />
              PUE: {stats.pue}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">การแจ้งเตือน</CardTitle>
            <AlertTriangle className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            {criticalAlerts > 0 && <p className="text-xs text-destructive">{criticalAlerts} วิกฤต</p>}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-chart-4" />
              ตรวจสอบอุณหภูมิ
            </CardTitle>
            <CardDescription>ข้อมูล 24 ชั่วโมงล่าสุด</CardDescription>
          </CardHeader>
          <CardContent>
            <TemperatureChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-chart-3" />
              การใช้พลังงาน
            </CardTitle>
            <CardDescription>เซิร์ฟเวอร์ vs ระบบทำความเย็น</CardDescription>
          </CardHeader>
          <CardContent>
            <PowerChart />
          </CardContent>
        </Card>
      </div>

      {/* Server Heatmap and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              แผนที่ความร้อนเซิร์ฟเวอร์
            </CardTitle>
            <CardDescription>การใช้ CPU แบบ Real-time ของเซิร์ฟเวอร์ทั้งหมด</CardDescription>
          </CardHeader>
          <CardContent>
            <ServerHeatmap servers={servers} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              ข้อมูลเชิงลึกจาก AI
            </CardTitle>
            <CardDescription>การแจ้งเตือนและการทำนายล่าสุด</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertsList alerts={alerts.slice(0, 4)} />
          </CardContent>
        </Card>
      </div>

      {/* AI Optimization Status - แสดงสถานะ real-time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            สถานะการทำงานของ AI
          </CardTitle>
          <CardDescription>ตัวชี้วัดประสิทธิภาพของระบบอัตโนมัติ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ตรวจจับความผิดปกติ</span>
                <span className="font-medium">{aiInsights.anomalyDetected ? "🔴 พบความผิดปกติ" : "✅ ปกติ"}</span>
              </div>
              <Progress value={aiInsights.confidenceScore} className="h-2" />
              <p className="text-xs text-muted-foreground">{aiInsights.confidenceScore}% ความมั่นใจในการรู้จำรูปแบบ</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">การบำรุงรักษาเชิงคาดการณ์</span>
                <span className="font-medium">ทำงานอยู่</span>
              </div>
              <Progress value={87} className="h-2" />
              <p className="text-xs text-muted-foreground">{aiInsights.predictiveAlerts} การแจ้งเตือนเชิงคาดการณ์</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">AI ปรับสมดุลโหลด</span>
                <span className="font-medium">ทำงานอยู่</span>
              </div>
              <Progress value={91} className="h-2" />
              <p className="text-xs text-muted-foreground">{aiInsights.optimizationsSuggested} คำแนะนำในการปรับปรุง</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
