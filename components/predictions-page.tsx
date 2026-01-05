"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, AlertTriangle, CheckCircle, Clock, TrendingUp, Wrench, Calendar } from "lucide-react"
import { generateServerData, type ServerData } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface PredictionCard {
  server: ServerData
  riskLevel: "high" | "medium" | "low"
  recommendation: string
  estimatedCost: string
  components: string[]
}

function getPredictions(servers: ServerData[]): PredictionCard[] {
  return servers
    .filter((s) => s.predictedFailure !== null)
    .map((server) => ({
      server,
      riskLevel: server.predictedFailure! <= 7 ? "high" : server.predictedFailure! <= 14 ? "medium" : "low",
      recommendation:
        server.predictedFailure! <= 7
          ? "Immediate maintenance required"
          : server.predictedFailure! <= 14
            ? "Schedule maintenance within a week"
            : "Plan maintenance in next sprint",
      estimatedCost: server.predictedFailure! <= 7 ? "฿15,000 - ฿25,000" : "฿5,000 - ฿10,000",
      components:
        server.predictedFailure! <= 7 ? ["CPU Cooling Fan", "Power Supply Unit"] : ["HDD/SSD", "Memory Module"],
    }))
}

export function PredictionsPage() {
  const [servers, setServers] = useState<ServerData[]>([])
  const [predictions, setPredictions] = useState<PredictionCard[]>([])

  useEffect(() => {
    const fetchRealtimeData = async () => {
      try {
        const response = await fetch("/api/realtime/data")
        const data = await response.json()
        setServers(data.servers)
        setPredictions(getPredictions(data.servers))
      } catch (error) {
        console.error("[v0] Failed to fetch realtime prediction data:", error)
        const fallbackData = generateServerData()
        setServers(fallbackData)
        setPredictions(getPredictions(fallbackData))
      }
    }

    fetchRealtimeData()
    const interval = setInterval(fetchRealtimeData, 3000)
    return () => clearInterval(interval)
  }, [])

  const highRiskCount = predictions.filter((p) => p.riskLevel === "high").length
  const mediumRiskCount = predictions.filter((p) => p.riskLevel === "medium").length
  const lowRiskCount = predictions.filter((p) => p.riskLevel === "low").length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Predictions</h1>
          <p className="text-muted-foreground">Predictive maintenance powered by machine learning</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Brain className="h-3 w-3" />
          87% Accuracy
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictions.length}</div>
            <p className="text-xs text-muted-foreground">Active maintenance alerts</p>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              High Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{highRiskCount}</div>
            <p className="text-xs text-muted-foreground">Within 7 days</p>
          </CardContent>
        </Card>

        <Card className="border-warning/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-warning flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Medium Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{mediumRiskCount}</div>
            <p className="text-xs text-muted-foreground">Within 14 days</p>
          </CardContent>
        </Card>

        <Card className="border-success/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-success flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Low Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{lowRiskCount}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {predictions.map((prediction) => (
            <Card
              key={prediction.server.id}
              className={cn(
                "border-l-4",
                prediction.riskLevel === "high" && "border-l-destructive",
                prediction.riskLevel === "medium" && "border-l-warning",
                prediction.riskLevel === "low" && "border-l-success",
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{prediction.server.name}</CardTitle>
                    <CardDescription>{prediction.server.rack}</CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize",
                      prediction.riskLevel === "high" && "text-destructive border-destructive/30",
                      prediction.riskLevel === "medium" && "text-warning border-warning/30",
                      prediction.riskLevel === "low" && "text-success border-success/30",
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
                    <span>{prediction.server.predictedFailure} days remaining</span>
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
                      <Badge key={component} variant="secondary" className="text-xs">
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
      </div>
    </div>
  )
}
