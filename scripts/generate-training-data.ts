/**
 * Script to generate synthetic training data for Data Center AI models
 * Run: node scripts/generate-training-data.ts
 */

import { writeFileSync } from "fs"

// Generate time-series sensor data
function generateSensorData(days = 30) {
  const data: any[] = []
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  for (let i = 0; i < days * 24 * 12; i++) {
    // Every 5 minutes
    const timestamp = new Date(startDate.getTime() + i * 5 * 60 * 1000)

    // Normal patterns with some anomalies
    const hour = timestamp.getHours()
    const isAnomaly = Math.random() < 0.05 // 5% anomaly rate

    const baseTemp = 22 + Math.sin((hour / 24) * Math.PI * 2) * 3 // Daily cycle
    const baseHumidity = 45 + Math.sin((hour / 24) * Math.PI * 2) * 5
    const basePower = 5000 + Math.sin((hour / 24) * Math.PI * 2) * 1000 // Power usage pattern

    data.push({
      timestamp: timestamp.toISOString(),
      server_rack: `R${Math.floor(Math.random() * 10) + 1}`,
      temperature: isAnomaly ? baseTemp + Math.random() * 10 : baseTemp + (Math.random() - 0.5) * 2,
      humidity: isAnomaly ? baseHumidity + Math.random() * 15 : baseHumidity + (Math.random() - 0.5) * 3,
      power_consumption: isAnomaly ? basePower * 1.5 : basePower + (Math.random() - 0.5) * 500,
      vibration: isAnomaly ? Math.random() * 5 : Math.random() * 1.5,
      is_anomaly: isAnomaly,
      failure_within_24h: isAnomaly && Math.random() < 0.3, // 30% of anomalies lead to failure
    })
  }

  return data
}

// Generate server performance data
function generateServerPerformanceData(days = 30) {
  const data: any[] = []
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const serverCount = 50

  for (let serverId = 1; serverId <= serverCount; serverId++) {
    for (let i = 0; i < days * 24; i++) {
      // Hourly data
      const timestamp = new Date(startDate.getTime() + i * 60 * 60 * 1000)
      const hour = timestamp.getHours()

      // Simulate different server health states
      const healthState = Math.random()
      const isHealthy = healthState > 0.15

      const baseCPU = 30 + Math.sin((hour / 24) * Math.PI * 2) * 20
      const baseMemory = 40 + Math.sin((hour / 24) * Math.PI * 2) * 15

      data.push({
        timestamp: timestamp.toISOString(),
        server_id: `SRV-${serverId.toString().padStart(3, "0")}`,
        cpu_usage: isHealthy ? baseCPU + (Math.random() - 0.5) * 20 : baseCPU + Math.random() * 40,
        memory_usage: isHealthy ? baseMemory + (Math.random() - 0.5) * 15 : baseMemory + Math.random() * 35,
        disk_io: Math.random() * 100,
        network_throughput: Math.random() * 1000,
        response_time: isHealthy ? 50 + Math.random() * 50 : 200 + Math.random() * 300,
        error_rate: isHealthy ? Math.random() * 0.01 : Math.random() * 0.1,
        health_score: isHealthy ? 80 + Math.random() * 20 : 20 + Math.random() * 60,
        needs_maintenance: !isHealthy && Math.random() < 0.4,
      })
    }
  }

  return data
}

// Generate failure event data
function generateFailureEvents(count = 200) {
  const data: any[] = []
  const failureTypes = [
    "CPU Overload",
    "Memory Leak",
    "Disk Failure",
    "Network Timeout",
    "Power Spike",
    "Cooling Failure",
    "Hardware Error",
    "Software Crash",
  ]

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.random() * 90
    const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)

    // Pre-failure indicators (24 hours before)
    const preCPU = 60 + Math.random() * 35
    const preMemory = 70 + Math.random() * 25
    const preTemp = 24 + Math.random() * 6
    const preVibration = 2 + Math.random() * 3

    data.push({
      event_id: `EVT-${i.toString().padStart(5, "0")}`,
      timestamp: timestamp.toISOString(),
      server_id: `SRV-${Math.floor(Math.random() * 50 + 1)
        .toString()
        .padStart(3, "0")}`,
      failure_type: failureTypes[Math.floor(Math.random() * failureTypes.length)],
      severity: ["critical", "warning", "error"][Math.floor(Math.random() * 3)],

      // Pre-failure metrics (24h before)
      pre_cpu_avg: preCPU,
      pre_memory_avg: preMemory,
      pre_temperature_avg: preTemp,
      pre_vibration_avg: preVibration,
      pre_error_rate: Math.random() * 0.05,

      // Failure indicators
      downtime_minutes: Math.random() * 120,
      recovery_time_minutes: Math.random() * 60,
      data_loss: Math.random() < 0.1,

      // Resolution
      resolved: true,
      root_cause: ["Hardware", "Software", "Environmental", "Human Error"][Math.floor(Math.random() * 4)],
    })
  }

  return data
}

// Generate workload patterns
function generateWorkloadPatterns(days = 30) {
  const data: any[] = []
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  for (let i = 0; i < days * 24; i++) {
    const timestamp = new Date(startDate.getTime() + i * 60 * 60 * 1000)
    const hour = timestamp.getHours()
    const dayOfWeek = timestamp.getDay()

    // Business hours have higher load
    const isBusinessHours = hour >= 9 && hour <= 18
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    let baseLoad = 30
    if (isBusinessHours && !isWeekend) {
      baseLoad = 70
    } else if (isBusinessHours && isWeekend) {
      baseLoad = 45
    }

    data.push({
      timestamp: timestamp.toISOString(),
      total_requests: Math.floor(baseLoad * 1000 + (Math.random() - 0.5) * 500),
      avg_response_time: (100 / baseLoad) * 100 + (Math.random() - 0.5) * 30,
      active_connections: Math.floor(baseLoad * 50 + (Math.random() - 0.5) * 100),
      cpu_utilization: baseLoad + (Math.random() - 0.5) * 15,
      memory_utilization: baseLoad * 0.8 + (Math.random() - 0.5) * 10,
      bandwidth_usage: baseLoad * 10 + (Math.random() - 0.5) * 50,
      optimal_server_count: Math.ceil(baseLoad / 10),
    })
  }

  return data
}

// Generate predictive maintenance labels
function generateMaintenanceLabels() {
  const data: any[] = []

  for (let i = 0; i < 1000; i++) {
    const needsMaintenance = Math.random() < 0.2

    data.push({
      sample_id: i,
      cpu_usage: needsMaintenance ? 75 + Math.random() * 20 : 30 + Math.random() * 40,
      memory_usage: needsMaintenance ? 80 + Math.random() * 15 : 35 + Math.random() * 40,
      temperature: needsMaintenance ? 26 + Math.random() * 6 : 20 + Math.random() * 4,
      vibration: needsMaintenance ? 3 + Math.random() * 2 : Math.random() * 1.5,
      power_consumption: needsMaintenance ? 6000 + Math.random() * 2000 : 4000 + Math.random() * 1500,
      error_rate: needsMaintenance ? 0.02 + Math.random() * 0.05 : Math.random() * 0.01,
      uptime_days: needsMaintenance ? Math.random() * 30 : 30 + Math.random() * 300,

      // Label
      needs_maintenance: needsMaintenance,
      estimated_days_until_failure: needsMaintenance ? Math.random() * 7 : 30 + Math.random() * 60,
    })
  }

  return data
}

// Generate all datasets
console.log("Generating training datasets...")

const sensorData = generateSensorData(90) // 90 days
const serverData = generateServerPerformanceData(90)
const failureEvents = generateFailureEvents(200)
const workloadPatterns = generateWorkloadPatterns(90)
const maintenanceLabels = generateMaintenanceLabels()

// Save as JSON
writeFileSync("data/sensor_timeseries.json", JSON.stringify(sensorData, null, 2))
writeFileSync("data/server_performance.json", JSON.stringify(serverData, null, 2))
writeFileSync("data/failure_events.json", JSON.stringify(failureEvents, null, 2))
writeFileSync("data/workload_patterns.json", JSON.stringify(workloadPatterns, null, 2))
writeFileSync("data/maintenance_labels.json", JSON.stringify(maintenanceLabels, null, 2))

// Save as CSV
function toCSV(data: any[]) {
  if (data.length === 0) return ""
  const headers = Object.keys(data[0])
  const rows = data.map((row) => headers.map((h) => JSON.stringify(row[h])).join(","))
  return [headers.join(","), ...rows].join("\n")
}

writeFileSync("data/sensor_timeseries.csv", toCSV(sensorData))
writeFileSync("data/server_performance.csv", toCSV(serverData))
writeFileSync("data/failure_events.csv", toCSV(failureEvents))
writeFileSync("data/workload_patterns.csv", toCSV(workloadPatterns))
writeFileSync("data/maintenance_labels.csv", toCSV(maintenanceLabels))

console.log("✅ Generated datasets:")
console.log(`- sensor_timeseries: ${sensorData.length} records`)
console.log(`- server_performance: ${serverData.length} records`)
console.log(`- failure_events: ${failureEvents.length} records`)
console.log(`- workload_patterns: ${workloadPatterns.length} records`)
console.log(`- maintenance_labels: ${maintenanceLabels.length} records`)
console.log("\nFiles saved in /data folder as both JSON and CSV formats")
