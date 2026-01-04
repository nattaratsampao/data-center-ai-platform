# Unity ML-Agents Integration Guide

## Overview
This document explains how to integrate Unity ML-Agents with the Data Center AI Platform web dashboard.

## API Endpoints

### 1. Sensor Data
**GET** `/api/unity/sensors`
- Returns current sensor readings from all servers
- Response: `{ success: true, timestamp, sensors: [...] }`

**POST** `/api/unity/sensors`
- Update sensor readings from Unity simulation
- Body: `{ serverId, sensorType, value }`
- Example: `{ "serverId": "SERVER-001", "sensorType": "temperature", "value": 45.2 }`

### 2. Server States
**GET** `/api/unity/servers`
- Returns current state of all servers
- Response: `{ success: true, timestamp, servers: [...] }`

**POST** `/api/unity/servers`
- Update server state from Unity
- Body: `{ serverId, cpu, memory, temperature, status }`

### 3. AI Decisions
**POST** `/api/unity/ai-decisions`
- Log AI agent decisions for tracking and training
- Body: `{ agentId, decision, confidence, parameters, reward }`
- Example:
```json
{
  "agentId": "cooling-agent-1",
  "decision": "INCREASE_COOLING",
  "confidence": 0.92,
  "parameters": { "targetTemp": 22, "fanSpeed": 75 },
  "reward": 15.3
}
```

**GET** `/api/unity/ai-decisions?serverId=XXX&scenario=YYY`
- Get AI recommendations from pre-trained model
- Returns optimal action for current scenario

### 4. Commands
**POST** `/api/unity/commands`
- Send commands from web dashboard to Unity
- Body: `{ command, targetId, parameters }`
- Valid commands:
  - `START_SIMULATION`
  - `STOP_SIMULATION`
  - `RESET_SIMULATION`
  - `ADJUST_COOLING`
  - `MIGRATE_WORKLOAD`
  - `SHUTDOWN_SERVER`
  - `RESTART_SERVER`

### 5. Performance Metrics
**POST** `/api/unity/metrics`
- Submit episode performance metrics
- Body: `{ episodeId, metrics }`
- Metrics object:
```json
{
  "episodeId": "EP-001",
  "metrics": {
    "totalReward": 1250,
    "efficiency": 0.87,
    "energySaved": 340,
    "downtimeMinutes": 2,
    "avgTemperature": 22.5,
    "pue": 1.15
  }
}
```

**GET** `/api/unity/metrics?episodeId=XXX&limit=10`
- Retrieve historical metrics for analysis

## Data Structures

### Sensor Reading
```csharp
public class SensorReading {
    public string serverId;
    public string sensorType; // "temperature", "humidity", "power", "vibration"
    public float value;
    public string status; // "normal", "warning", "critical"
    public long timestamp;
}
