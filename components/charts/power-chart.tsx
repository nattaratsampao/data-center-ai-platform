"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"
import { generatePowerData } from "@/lib/mock-data"

export function PowerChart() {
  const [data, setData] = useState<{ timestamp: string; consumption: number; cooling: number }[]>([])

  useEffect(() => {
    setData(generatePowerData(24))
  }, [])

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="consumptionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.7 0.15 180)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="oklch(0.7 0.15 180)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="coolingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.75 0.15 85)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="oklch(0.75 0.15 85)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="timestamp" stroke="oklch(0.65 0 0)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="oklch(0.65 0 0)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}kW`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border border-border bg-card p-2 shadow-lg">
                    <p className="text-sm text-foreground mb-1">{payload[0].payload.timestamp}</p>
                    <p className="text-sm text-primary">Server: {Number(payload[0].value).toFixed(1)} kW</p>
                    <p className="text-sm text-chart-3">Cooling: {Number(payload[1]?.value || 0).toFixed(1)} kW</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: "10px" }}
            formatter={(value) => <span className="text-muted-foreground text-sm">{value}</span>}
          />
          <Area
            type="monotone"
            dataKey="consumption"
            name="Server Power"
            stroke="oklch(0.7 0.15 180)"
            strokeWidth={2}
            fill="url(#consumptionGradient)"
          />
          <Area
            type="monotone"
            dataKey="cooling"
            name="Cooling"
            stroke="oklch(0.75 0.15 85)"
            strokeWidth={2}
            fill="url(#coolingGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
