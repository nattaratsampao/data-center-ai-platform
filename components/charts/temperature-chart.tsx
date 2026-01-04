"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { generateHistoricalData } from "@/lib/mock-data"

export function TemperatureChart() {
  const [data, setData] = useState<{ timestamp: string; value: number }[]>([])

  useEffect(() => {
    setData(generateHistoricalData(24))
  }, [])

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.6 0.2 25)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="oklch(0.6 0.2 25)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="timestamp" stroke="oklch(0.65 0 0)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="oklch(0.65 0 0)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[15, 35]}
            tickFormatter={(value) => `${value}°C`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border border-border bg-card p-2 shadow-lg">
                    <p className="text-sm text-foreground">{payload[0].payload.timestamp}</p>
                    <p className="text-sm font-bold text-chart-4">{Number(payload[0].value).toFixed(1)}°C</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Area type="monotone" dataKey="value" stroke="oklch(0.6 0.2 25)" strokeWidth={2} fill="url(#tempGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
