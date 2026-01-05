"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Server, RefreshCw, AlertTriangle, ArrowUpDown, Play, Pause, RotateCcw } from "lucide-react"
import { generateServerData, type ServerData } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function getStatusBadge(status: ServerData["status"]) {
  switch (status) {
    case "online":
      return <Badge className="bg-success/20 text-success border-success/30">Online</Badge>
    case "warning":
      return <Badge className="bg-warning/20 text-warning border-warning/30">Warning</Badge>
    case "offline":
      return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Offline</Badge>
  }
}

function getHealthColor(score: number) {
  if (score >= 80) return "text-success"
  if (score >= 50) return "text-warning"
  return "text-destructive"
}

function getProgressColor(value: number) {
  if (value >= 80) return "bg-destructive"
  if (value >= 60) return "bg-warning"
  return "bg-success"
}

export function ServersPage() {
  const [servers, setServers] = useState<ServerData[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [sortBy, setSortBy] = useState<keyof ServerData>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    const fetchRealtimeData = async () => {
      try {
        const response = await fetch("/api/realtime/data")
        const data = await response.json()
        setServers(data.servers)
      } catch (error) {
        console.error("[v0] Failed to fetch realtime server data:", error)
        setServers(generateServerData())
      }
    }

    fetchRealtimeData()
    const interval = setInterval(fetchRealtimeData, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/realtime/data")
      const data = await response.json()
      setServers(data.servers)
    } catch (error) {
      console.error("[v0] Failed to refresh server data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleSort = (column: keyof ServerData) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const sortedServers = [...servers].sort((a, b) => {
    const aVal = a[sortBy]
    const bVal = b[sortBy]
    const modifier = sortOrder === "asc" ? 1 : -1
    if (typeof aVal === "string" && typeof bVal === "string") {
      return aVal.localeCompare(bVal) * modifier
    }
    return ((aVal as number) - (bVal as number)) * modifier
  })

  const totalServers = servers.length
  const onlineServers = servers.filter((s) => s.status === "online").length
  const warningServers = servers.filter((s) => s.status === "warning").length
  const atRiskServers = servers.filter((s) => s.predictedFailure !== null).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Server Management</h1>
          <p className="text-muted-foreground">Monitor and control all servers in the data center</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Servers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Online</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{onlineServers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{warningServers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-chart-4" />
              At Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4">{atRiskServers}</div>
            <p className="text-xs text-muted-foreground">Predicted failure</p>
          </CardContent>
        </Card>
      </div>

      {/* Server Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            All Servers
          </CardTitle>
          <CardDescription>Click column headers to sort</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-accent" onClick={() => handleSort("name")}>
                    <div className="flex items-center gap-1">
                      Server <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Rack</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="cursor-pointer hover:bg-accent" onClick={() => handleSort("cpu")}>
                    <div className="flex items-center gap-1">
                      CPU <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-accent" onClick={() => handleSort("memory")}>
                    <div className="flex items-center gap-1">
                      Memory <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-accent" onClick={() => handleSort("healthScore")}>
                    <div className="flex items-center gap-1">
                      Health <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>AI Prediction</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedServers.map((server) => (
                  <TableRow key={server.id}>
                    <TableCell className="font-medium">{server.name}</TableCell>
                    <TableCell className="text-muted-foreground">{server.rack}</TableCell>
                    <TableCell>{getStatusBadge(server.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={server.cpu} className={cn("h-2 w-16", getProgressColor(server.cpu))} />
                        <span className="text-sm text-muted-foreground w-10">{server.cpu}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={server.memory} className={cn("h-2 w-16", getProgressColor(server.memory))} />
                        <span className="text-sm text-muted-foreground w-10">{server.memory}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={cn("font-bold", getHealthColor(server.healthScore))}>{server.healthScore}%</span>
                    </TableCell>
                    <TableCell>
                      {server.predictedFailure ? (
                        <div className="flex items-center gap-1 text-warning">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm">{server.predictedFailure}d</span>
                        </div>
                      ) : (
                        <span className="text-success text-sm">Healthy</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {server.status === "offline" ? (
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Play className="h-4 w-4 text-success" />
                          </Button>
                        ) : (
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Pause className="h-4 w-4 text-warning" />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
