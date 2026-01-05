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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newEventsCount, setNewEventsCount] = useState(0)

  useEffect(() => {
    loadRealtimeData()
    const interval = setInterval(() => {
      loadRealtimeData()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const loadRealtimeData = async () => {
    try {
      const data = await fetchRealtimeData()

      if (realtimeData?.activeEvents && data.activeEvents) {
        const newEvents = data.activeEvents.length - realtimeData.activeEvents.length
        if (newEvents > 0) {
          setNewEventsCount((prev) => prev + newEvents)
        }
      }

      setRealtimeData(data)
      setLastUpdate(new Date())
    } catch (error) {
      console.error("[Overview] Failed to load realtime data:", error)
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

  const { servers, stats, aiInsights, activeEvents } = realtimeData
  
  // ⚠️ จุดที่แก้: ดึงค่า Power จาก Array sensors (หาตัวที่มี type = 'power')
  const powerSensor = Array.isArray(realtimeData.sensors) 
    ? realtimeData.sensors.find((s: any) => s.type === 'power') 
    : { value: 0 };
    
  const totalPower = powerSensor ? powerSensor.value : 0;

  const criticalEvents = activeEvents?.filter((e: any) => e.severity === "critical").length || 0
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
            Live Simulation
          </Badge>
          {activeEvents && activeEvents.length > 0 && (
            <Badge variant="destructive" className="gap-1">
              {activeEvents.length} เหตุการณ์กำลังเกิดขึ้น
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            รีเฟรช
          </Button>
        </div>
      </div>

      {criticalEvents > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">⚠️ พบเหตุการณ์วิกฤต {criticalEvents} รายการ!</p>
                <p className="text-sm text-muted-foreground">AI กำลังดำเนินการแก้ไขอัตโนมัติ กรุณาตรวจสอบรายละเอียดด้านล่าง</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
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
            {/* ⚠️ จุดที่แก้: ใช้ตัวแปร totalPower ที่เราดึงมาข้างบน แทนการเรียก object ซ้อนๆ */}
            <div className="text-2xl font-bold">{totalPower} kW</div>
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
            <div className="text-2xl font-bold">{activeEvents?.length || alerts.length}</div>
            {criticalEvents > 0 && <p className="text-xs text-destructive">{criticalEvents} วิกฤต</p>}
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

      {/* AI Stats ... (ส่วนล่างเหมือนเดิมครับ ไม่มีการเปลี่ยนแปลงโครงสร้างข้อมูล) */}
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

      {/* Active Events Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            เหตุการณ์ที่กำลังเกิดขึ้น
          </CardTitle>
          <CardDescription>AI กำลังตรวจสอบและตอบสนองต่อเหตุการณ์เหล่านี้</CardDescription>
        </CardHeader>
        <CardContent>
          {activeEvents && activeEvents.length > 0 ? (
            <div className="space-y-3">
              {activeEvents.map((event: any) => (
                <div key={event.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            event.severity === "critical"
                              ? "destructive"
                              : event.severity === "high"
                                ? "destructive"
                                : event.severity === "medium"
                                  ? "default"
                                  : "secondary"
                          }
                        >
                          {event.severity.toUpperCase()}
                        </Badge>
                        <span className="font-semibold">{event.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      {event.aiResponse && (
                        <div className="mt-2 flex items-start gap-2 text-sm bg-primary/5 p-2 rounded">
                          <Brain className="h-4 w-4 text-primary mt-0.5" />
                          <span className="text-primary">{event.aiResponse}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {new Date(event.timestamp).toLocaleTimeString("th-TH")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">ไม่มีเหตุการณ์ที่กำลังเกิดขึ้น ระบบทำงานปกติ ✅</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}