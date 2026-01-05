"use client"

import { useMemo } from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

// กำหนด Interface ให้ตรงกับข้อมูลที่ส่งมาจาก API Route
interface Server {
  id: string
  name: string
  rack: string
  status: string
  cpu: number
  temperature: number
  healthScore: number
}

interface ServerHeatmapProps {
  servers: Server[]
}

export function ServerHeatmap({ servers = [] }: ServerHeatmapProps) {
  // ✅ แก้ไข 1: ใช้ชื่อ Rack เป็น "A", "B", "C" เพื่อให้นำไปเช็คได้ครอบคลุม
  const racks = ["A", "B", "C"]

  // ฟังก์ชันเลือกสีตามความร้อนแรงของ CPU
  const getCellColor = (server: Server) => {
    if (server.status !== "online" && server.status !== "warning") return "bg-slate-800 border-slate-700" // Offline
    
    const cpu = server.cpu
    // ไล่เฉดสี: เขียว -> เหลือง -> ส้ม -> แดง
    if (cpu >= 90) return "bg-red-500 hover:bg-red-400"
    if (cpu >= 70) return "bg-orange-500 hover:bg-orange-400"
    if (cpu >= 50) return "bg-yellow-500 hover:bg-yellow-400"
    if (cpu >= 30) return "bg-emerald-500 hover:bg-emerald-400"
    return "bg-emerald-600 hover:bg-emerald-500"
  }

  return (
    <div className="space-y-6">
      {racks.map((rackId) => {
        // ✅ แก้ไข 2: กรองข้อมูลแบบยืดหยุ่น (รับได้ทั้ง "A" และ "Rack A")
        const rackServers = servers.filter(
          (s) => s.rack === rackId || s.rack === `Rack ${rackId}`
        )

        return (
          <div key={rackId} className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* ชื่อ Rack */}
            <div className="w-20 shrink-0 font-medium text-sm text-muted-foreground">
              Rack {rackId}
            </div>

            {/* Grid แสดง Server เป็นช่องๆ (Heatmap) */}
            <div className="flex-1 grid grid-cols-10 gap-1.5 p-2 bg-secondary/20 rounded-lg border border-border/50">
              {rackServers.length > 0 ? (
                rackServers.map((server) => (
                  <HoverCard key={server.id} openDelay={0} closeDelay={0}>
                    <HoverCardTrigger asChild>
                      <div
                        className={`
                          aspect-square rounded-sm border cursor-pointer transition-all duration-200
                          ${getCellColor(server)}
                          ${server.status === 'warning' ? 'animate-pulse ring-2 ring-yellow-500/50' : ''}
                          ${server.status === 'critical' ? 'animate-pulse ring-2 ring-red-500/50' : ''}
                        `}
                      />
                    </HoverCardTrigger>
                    
                    {/* Tooltip ตอนเอาเมาส์ชี้ */}
                    <HoverCardContent className="w-64 p-3 z-50" side="top">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">{server.name}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            server.status === 'online' ? 'bg-emerald-500/20 text-emerald-500' : 
                            server.status === 'warning' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'
                          }`}>
                            {server.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>CPU: <span className="text-foreground">{server.cpu}%</span></div>
                          <div>Temp: <span className="text-foreground">{server.temperature}°C</span></div>
                          <div>Health: <span className="text-foreground">{server.healthScore}%</span></div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))
              ) : (
                // กรณีไม่มี Server
                <div className="col-span-10 text-xs text-muted-foreground text-center py-2">
                  No servers found in Rack {rackId}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* คำอธิบายสี */}
      <div className="flex items-center justify-end gap-4 text-xs text-muted-foreground mt-4 pt-4 border-t">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-600"></div>Idle</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500"></div>Normal</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-yellow-500"></div>Load</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-orange-500"></div>High</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div>Critical</div>
      </div>
    </div>
  )
}