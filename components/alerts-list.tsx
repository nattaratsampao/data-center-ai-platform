"use client"

import { cn } from "@/lib/utils"
import type { AlertData } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Brain, Zap, MessageSquare } from "lucide-react"
import { formatAlertForLine } from "@/lib/line-notify"
import { useToast } from "@/hooks/use-toast"

interface AlertsListProps {
  alerts: AlertData[]
}

function getAlertIcon(type: AlertData["type"]) {
  switch (type) {
    case "anomaly":
      return <AlertTriangle className="h-4 w-4" />
    case "prediction":
      return <Brain className="h-4 w-4" />
    case "optimization":
      return <Zap className="h-4 w-4" />
  }
}

function getSeverityColor(severity: AlertData["severity"]) {
  switch (severity) {
    case "critical":
      return "border-l-destructive bg-destructive/5"
    case "high":
      return "border-l-chart-4 bg-chart-4/5"
    case "medium":
      return "border-l-warning bg-warning/5"
    case "low":
      return "border-l-primary bg-primary/5"
  }
}

function getSeverityBadge(severity: AlertData["severity"]) {
  switch (severity) {
    case "critical":
      return (
        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
          Critical
        </Badge>
      )
    case "high":
      return <Badge className="bg-chart-4 text-chart-4-foreground text-[10px] px-1.5 py-0">High</Badge>
    case "medium":
      return <Badge className="bg-warning text-warning-foreground text-[10px] px-1.5 py-0">Medium</Badge>
    case "low":
      return (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
          Low
        </Badge>
      )
  }
}

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function AlertsList({ alerts }: AlertsListProps) {
  const { toast } = useToast()

  const sendToLine = async (alert: AlertData) => {
    const lineToken = localStorage.getItem("lineNotifyToken")

    if (!lineToken) {
      toast({
        title: "LINE Token Missing",
        description: "Please configure your LINE Notify token in Settings first",
        variant: "destructive",
      })
      return
    }

    try {
      const message = formatAlertForLine(alert)
      const response = await fetch("/api/line-notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: lineToken,
          message,
        }),
      })

      if (response.ok) {
        toast({
          title: "Sent to LINE",
          description: "Alert notification sent successfully",
        })
      } else {
        toast({
          title: "Failed to send",
          description: "Could not send notification to LINE",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={cn(
            "rounded-lg border-l-4 p-3 transition-colors hover:bg-accent/50",
            getSeverityColor(alert.severity),
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="text-muted-foreground">{getAlertIcon(alert.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{alert.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{alert.description}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 shrink-0"
              onClick={() => sendToLine(alert)}
              title="Send to LINE"
            >
              <MessageSquare className="h-3.5 w-3.5 text-[#00B900]" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {getSeverityBadge(alert.severity)}
              <span className="text-[10px] text-muted-foreground">AI: {alert.aiConfidence}%</span>
            </div>
            <span className="text-[10px] text-muted-foreground">{formatTime(alert.timestamp)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
