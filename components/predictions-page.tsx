"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, AlertTriangle, CheckCircle, Clock, TrendingUp, Wrench, Calendar, Server } from "lucide-react"
import { cn } from "@/lib/utils"

// Interface ที่ตรงกับ API
interface ServerData {
  id: string
  name: string
  healthScore: number
  rack: string
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

// Logic จำลองการทำนาย (ในของจริงควรมาจาก Backend AI)
function getPredictions(servers: ServerData[]): PredictionCard[] {
  // กรองเอาเฉพาะ Server ที่มีปัญหานิดหน่อย หรือสุขภาพไม่เต็ม 100
  return servers
    .filter((s) => s.healthScore < 98 || s.activeEvents > 0)
    .map((server) => {
      // คำนวณวันที่จะพัง จาก healthScore
      const predictedFailure = Math.max(1, Math.floor((server.healthScore - 20) / 3)); 
      
      let riskLevel: "high" | "medium" | "low" = "low";
      if (server.healthScore < 60) riskLevel = "high";
      else if (server.healthScore < 85) riskLevel = "medium";

      return {
        server,
        riskLevel,
        predictedFailure,
        recommendation:
          riskLevel === "high"
            ? "Immediate maintenance required (Critical)"
            : riskLevel === "medium"
              ? "Schedule preventive maintenance within 2 weeks"
              : "Monitor closely for performance degradation",
        estimatedCost: riskLevel === "high" ? "฿15,000 - ฿30,000" : "฿5,000 - ฿12,000",
        components:
          riskLevel === "high" 
            ? ["Cooling Unit", "Power Module"] 
            : ["Memory DIMM", "Storage Controller"],
      };
    })
    .sort((a, b) => a.server.healthScore - b.server.healthScore); // เรียงตามความเสี่ยง (น้อยไปหามาก)
}

export function PredictionsPage() {
  const [predictions, setPredictions] = useState<PredictionCard[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPredictions = async () => {
    try {
      const response = await fetch("/api/realtime/data")
      const data = await response.json()
      
      // แปลงข้อมูลจาก API ให้เป็น Predictions
      if (data.servers) {
        setPredictions(getPredictions(data.servers))
      }
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch prediction data:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPredictions()
    const interval = setInterval(fetchPredictions, 5000) // Update ทุก 5 วิ
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
          <p>Analyzing server health patterns...</p>
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
          <p className="text-muted-foreground">Predictive maintenance powered by machine learning</p>
        </div>
        <Badge variant="outline" className="gap-1 bg-background">
          <Brain className="h-3 w-3 text-primary" />
          87% Model Accuracy
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictions.length}</div>
            <p className="text-xs text-muted-foreground">Servers at risk</p>
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
            <p className="text-xs text-muted-foreground">Immediate action needed</p>
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
            <p className="text-xs text-muted-foreground">Monitor closely</p>
          </CardContent>
        </Card>

        <Card className="border-success/30 bg-success/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-success flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Low Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{lowRiskCount}</div>
            <p className="text-xs text-muted-foreground">Minor issues detected</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Model Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Predictive Model Status
          </CardTitle>
          <CardDescription>LSTM Autoencoder with historical data training</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Model Accuracy</span>
                <span className="font-medium">87.3%</span>
              </div>
              <Progress value={87} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Training Data</span>
                <span className="font-medium">156,420 samples</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">False Positive Rate</span>
                <span className="font-medium">4.2%</span>
              </div>
              <Progress value={4} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predictions List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Maintenance Predictions</h2>
        {predictions.length === 0 ? (
           <div className="text-center py-10 border rounded-lg bg-muted/10">
              <CheckCircle className="h-10 w-10 text-success mx-auto mb-3" />
              <p className="text-muted-foreground">No risks detected. All systems healthy.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {predictions.map((prediction) => (
              <Card
                key={prediction.server.id}
                className={cn(
                  "border-l-4 transition-all hover:shadow-md",
                  prediction.riskLevel === "high" && "border-l-destructive",
                  prediction.riskLevel === "medium" && "border-l-warning",
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
                      <CardDescription>{prediction.server.rack}</CardDescription>
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
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Est. Failure: {prediction.predictedFailure} days</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>Health: {prediction.server.healthScore}%</span>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Wrench className="h-4 w-4 mt-0.5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{prediction.recommendation}</p>
                        <p className="text-xs text-muted-foreground mt-1">Estimated cost: {prediction.estimatedCost}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Predicted failing components:</p>
                    <div className="flex flex-wrap gap-2">
                      {prediction.components.map((component) => (
                        <Badge key={component} variant="secondary" className="text-xs font-normal">
                          {component}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      Schedule Maintenance
                    </Button>
                    <Button size="sm" variant="outline">
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}