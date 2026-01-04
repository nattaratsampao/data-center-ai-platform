"use client"

import { cn } from "@/lib/utils"
import type { ServerData } from "@/lib/mock-data"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface ServerHeatmapProps {
  servers: ServerData[]
}

function getHeatColor(value: number): string {
  if (value >= 80) return "bg-destructive"
  if (value >= 60) return "bg-warning"
  if (value >= 40) return "bg-chart-3"
  return "bg-success"
}

function getStatusBadge(status: ServerData["status"]) {
  switch (status) {
    case "online":
      return (
        <Badge variant="outline" className="bg-success/20 text-success border-success/30">
          Online
        </Badge>
      )
    case "warning":
      return (
        <Badge variant="outline" className="bg-warning/20 text-warning border-warning/30">
          Warning
        </Badge>
      )
    case "offline":
      return (
        <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/30">
          Offline
        </Badge>
      )
  }
}

export function ServerHeatmap({ servers }: ServerHeatmapProps) {
  const racks = ["Rack A", "Rack B", "Rack C"]

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {racks.map((rack) => {
          const rackServers = servers.filter((s) => s.rack === rack)
          return (
            <div key={rack} className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">{rack}</h4>
              <div className="grid grid-cols-4 gap-2">
                {rackServers.map((server) => (
                  <Tooltip key={server.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "relative h-20 rounded-lg border border-border p-2 cursor-pointer transition-all hover:scale-105",
                          server.status === "offline" ? "bg-muted opacity-50" : "bg-card",
                        )}
                      >
                        <div className="text-xs font-medium truncate">{server.name}</div>
                        {server.status !== "offline" && (
                          <>
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-muted-foreground w-8">CPU</span>
                                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                                  <div
                                    className={cn("h-full rounded-full transition-all", getHeatColor(server.cpu))}
                                    style={{ width: `${server.cpu}%` }}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-muted-foreground w-8">MEM</span>
                                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                                  <div
                                    className={cn("h-full rounded-full transition-all", getHeatColor(server.memory))}
                                    style={{ width: `${server.memory}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                            {server.predictedFailure && (
                              <div className="absolute top-1 right-1">
                                <div className="h-2 w-2 rounded-full bg-warning animate-pulse" />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="w-48">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{server.name}</span>
                          {getStatusBadge(server.status)}
                        </div>
                        {server.status !== "offline" && (
                          <>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">CPU:</span>{" "}
                                <span className="font-medium">{server.cpu}%</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Memory:</span>{" "}
                                <span className="font-medium">{server.memory}%</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Disk:</span>{" "}
                                <span className="font-medium">{server.disk}%</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Health:</span>{" "}
                                <span className="font-medium">{server.healthScore}%</span>
                              </div>
                            </div>
                            {server.predictedFailure && (
                              <div className="text-xs text-warning">
                                ⚠️ Predicted failure in {server.predictedFailure} days
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
