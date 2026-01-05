"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, AlertTriangle, CheckCircle, Clock, TrendingUp, Wrench, Calendar, Server, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

// Interface ที่ตรงกับ API
interface ServerData {
  id: string
  name: string
  healthScore: number
  rack?: string // ใส่ ? เผื่อ API เก่ายังไม่ส่งมา
  status: string
  activeEvents: number
}

interface PredictionCard {
  server: ServerData
  riskLevel: "high" | "medium" | "low"
  predictedFailure: number // days
  recommendation: string
  estimatedCost: string
  components: string[]
}

// Logic AI จำลอง (ปรับให้ Sensitive ขึ้น เพื่อให้เห็นความเปลี่ยนแปลง)
function getPredictions(servers: ServerData[]): PredictionCard[] {
  return servers
    .map((server) => {
      // คำนวณวันที่จะพัง (Mock Algorithm)
      // ยิ่ง Health น้อย วันยิ่งน้อยลง
      const predictedFailure = Math.max(1, Math.floor((server.healthScore - 40) / 2)); 
      
      let riskLevel: "high" | "medium" | "low" = "low";
      
      // ⚠️ ปรับเกณฑ์ให้โหดขึ้น: ต่ำกว่า 92% ก็เริ่มเตือน Medium แล้ว (เพื่อให้เห็นกราฟขยับ)
      if (server.healthScore < 75 || server.activeEvents > 0) riskLevel = "high";
      else if (server.healthScore < 92) riskLevel = "medium";

      return {
        server,
        riskLevel,
        predictedFailure,
        recommendation:
          riskLevel === "high"
            ? "Urgent: Hardware degradation detected"
            : riskLevel === "medium"
              ? "Plan maintenance: Efficiency dropping"
              : "System healthy: Routine check only",
        estimatedCost: riskLevel === "high" ? "฿15,000+" : riskLevel === "medium" ? "฿5,000" : "฿0",
        components:
          riskLevel === "high" 
            ? ["Cooling Unit", "Power Module"] 
            : riskLevel === "medium"
              ? ["Thermal Paste", "Fan Speed"]
              : ["None"],
      };
    })
    .sort((a, b) => a.server.healthScore - b.server.healthScore); // เอาตัวแย่สุดขึ้นก่อน
}

export function PredictionsPage() {
  const [predictions, setPredictions] = useState<PredictionCard[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchPredictions = async () => {
    try {
      const response = await fetch("/api/realtime/data")
      const data = await response.json()
      
      if (data.servers) {
        setPredictions(getPredictions(data.servers))
        setLastUpdated(new Date())
      }
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch prediction data:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPredictions()
    const interval = setInterval(fetchPredictions, 3000) // Update เร็วขึ้นเป็น 3 วิ
    return () => clearInterval(interval)
  }, [])

  const highRiskCount = predictions.filter((p) => p.riskLevel === "high").length
  const mediumRiskCount = predictions.filter((p) => p.riskLevel === "medium").length
  const lowRiskCount = predictions.filter((p) => p.riskLevel === "low").length

  if (loading && predictions.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Brain className="h-10 w-10 animate-pulse text-primary" />
          <p>AI analyzing server telemetry...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Predictions</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            Predictive maintenance engine 
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full flex items-center gap-1">
               <Clock className="h-3 w-3" /> Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </p>
        </div>
        <Badge variant="outline" className="gap-1 bg-background px-3 py-1">
          <Brain className="h-4 w-4 text-primary animate-pulse" />
          Live Inference
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monitored Servers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictions.length}</div>
            <p className="text-xs text-muted-foreground">Real-time analysis active</p>
          </CardContent>
        </Card>

        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              High Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{highRiskCount}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-warning flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Medium Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{mediumRiskCount}</div>
            <p className="text-xs text-muted-foreground">Efficiency degrading</p>
          </CardContent>
        </Card>

        <Card className="border-success/30 bg-success/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-success flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Optimal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{lowRiskCount}</div>
            <p className="text-xs text-muted-foreground">Healthy operation</p>
          </CardContent>
        </Card>
      </div>

      {/* Predictions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Maintenance Forecast</h2>
            <Button variant="ghost" size="sm" onClick={() => fetchPredictions()}>
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh Model
            </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {predictions.map((prediction) => (
            <Card
            key={prediction.server.id}
            className={cn(
                "border-l-4 transition-all hover:shadow-md",
                prediction.riskLevel === "high" && "border-l-destructive shadow-destructive/10",
                prediction.riskLevel === "medium" && "border-l-warning shadow-warning/10",
                prediction.riskLevel === "low" && "border-l-success",
            )}
            >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    {prediction.server.name}
                    </CardTitle>
                    <CardDescription>{prediction.server.rack || "Unknown Zone"}</CardDescription>
                </div>
                <Badge
                    variant="outline"
                    className={cn(
                    "capitalize",
                    prediction.riskLevel === "high" && "text-destructive border-destructive/30 bg-destructive/5",
                    prediction.riskLevel === "medium" && "text-warning border-warning/30 bg-warning/5",
                    prediction.riskLevel === "low" && "text-success border-success/30 bg-success/5",
                    )}
                >
                    {prediction.riskLevel} Risk
                </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>Health Score:</span>
                    </div>
                    <span className={cn(
                        "font-bold",
                        prediction.server.healthScore < 75 ? "text-destructive" : 
                        prediction.server.healthScore < 92 ? "text-warning" : "text-success"
                    )}>
                        {prediction.server.healthScore.toFixed(1)}%
                    </span>
                </div>
                
                {/* Progress Bar for Health */}
                <Progress 
                    value={prediction.server.healthScore} 
                    className={cn("h-2", 
                        prediction.server.healthScore < 75 ? "bg-destructive/20" : 
                        prediction.server.healthScore < 92 ? "bg-warning/20" : "bg-success/20"
                    )} 
                />

                <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-2">
                    <Wrench className="h-4 w-4 mt-0.5 text-primary" />
                    <div>
                    <p className="text-sm font-medium">{prediction.recommendation}</p>
                    <p className="text-xs text-muted-foreground mt-1">Est. Cost: {prediction.estimatedCost}</p>
                    </div>
                </div>
                </div>

                {prediction.riskLevel !== 'low' && (
                    <div>
                        <p className="text-xs text-muted-foreground mb-2">At-risk components:</p>
                        <div className="flex flex-wrap gap-2">
                            {prediction.components.map((component) => (
                            <Badge key={component} variant="secondary" className="text-xs font-normal">
                                {component}
                            </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1" variant={prediction.riskLevel === 'low' ? 'outline' : 'default'}>
                    {prediction.riskLevel === 'low' ? 'View Details' : 'Schedule Repair'}
                </Button>
                </div>
            </CardContent>
            </Card>
        ))}
        </div>
      </div>
    </div>
  )
}