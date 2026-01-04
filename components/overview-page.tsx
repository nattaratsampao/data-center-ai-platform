"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Server, Thermometer, Zap, Activity, AlertTriangle, TrendingUp, Brain, RefreshCw } from "lucide-react"
import {
  generateSensorData,
  generateServerData,
  generateAlerts,
  getSystemStats,
  type SensorData,
  type ServerData,
  type AlertData,
} from "@/lib/mock-data"
import { TemperatureChart } from "./charts/temperature-chart"
import { PowerChart } from "./charts/power-chart"
import { ServerHeatmap } from "./server-heatmap"
import { AlertsList } from "./alerts-list"

export function OverviewPage() {
  const [sensors, setSensors] = useState<SensorData[]>([])
  const [servers, setServers] = useState<ServerData[]>([])
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [stats, setStats] = useState(getSystemStats())
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    setSensors(generateSensorData())
    setServers(generateServerData())
    setAlerts(generateAlerts())
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setSensors(generateSensorData())
      setServers(generateServerData())
      setAlerts(generateAlerts())
      setStats(getSystemStats())
      setIsRefreshing(false)
    }, 1000)
  }

  const criticalAlerts = alerts.filter((a) => a.severity === "critical").length
  const warningServers = servers.filter((s) => s.status === "warning").length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground">Real-time monitoring and AI-powered insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Live
          </Badge>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Servers Online</CardTitle>
            <Server className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.onlineServers}/{stats.totalServers}
            </div>
            <p className="text-xs text-muted-foreground">
              {warningServers > 0 && <span className="text-warning">{warningServers} warnings</span>}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgTemperature}°C</div>
            <p className="text-xs text-muted-foreground">Optimal range: 20-25°C</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Power Usage</CardTitle>
            <Zap className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPower} kW</div>
            <div className="flex items-center text-xs text-success">
              <TrendingUp className="h-3 w-3 mr-1" />
              {stats.energySaved}% saved by AI
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.alertsToday}</div>
            {criticalAlerts > 0 && <p className="text-xs text-destructive">{criticalAlerts} critical</p>}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-chart-4" />
              Temperature Monitoring
            </CardTitle>
            <CardDescription>Last 24 hours temperature data</CardDescription>
          </CardHeader>
          <CardContent>
            <TemperatureChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-chart-3" />
              Power Consumption
            </CardTitle>
            <CardDescription>Server vs Cooling power usage</CardDescription>
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
              Server Load Heatmap
            </CardTitle>
            <CardDescription>Real-time CPU utilization across all servers</CardDescription>
          </CardHeader>
          <CardContent>
            <ServerHeatmap servers={servers} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Insights
            </CardTitle>
            <CardDescription>Latest alerts and predictions</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertsList alerts={alerts.slice(0, 4)} />
          </CardContent>
        </Card>
      </div>

      {/* AI Optimization Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Optimization Status
          </CardTitle>
          <CardDescription>Autonomous systems performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Anomaly Detection</span>
                <span className="font-medium">Active</span>
              </div>
              <Progress value={94} className="h-2" />
              <p className="text-xs text-muted-foreground">94% confidence in pattern recognition</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Predictive Maintenance</span>
                <span className="font-medium">Active</span>
              </div>
              <Progress value={87} className="h-2" />
              <p className="text-xs text-muted-foreground">87% accuracy in failure prediction</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Load Balancing AI</span>
                <span className="font-medium">Active</span>
              </div>
              <Progress value={91} className="h-2" />
              <p className="text-xs text-muted-foreground">{stats.aiOptimizations} optimizations performed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
