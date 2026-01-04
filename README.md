# Data Center AI Optimization Platform

AI-powered autonomous data center monitoring and optimization system with predictive maintenance capabilities.

## Features

- **Real-time Monitoring**: Track temperature, humidity, power consumption, and vibration sensors
- **AI Anomaly Detection**: Machine learning-powered anomaly detection with confidence scoring
- **Predictive Maintenance**: AI predictions for server failures and maintenance scheduling
- **Server Load Balancing**: Automated server load optimization
- **LINE Notify Integration**: Real-time alerts sent directly to your LINE account

## LINE Notify Setup

1. Go to [LINE Notify](https://notify-bot.line.me/)
2. Login with your LINE account
3. Click "Generate token"
4. Select the chat room you want to receive notifications
5. Copy the token
6. Go to Settings page in the app
7. Paste the token in the "LINE Notify Token" field
8. Enable LINE notifications
9. Click "Send Test Notification" to verify

## How to Use LINE Notifications

### In Settings Page:
- Configure your LINE Notify token
- Enable/disable notification types (Critical Alerts, Predictive Maintenance, Optimization)
- Send test notifications to verify setup

### In Alerts Page:
- Click the LINE icon (green message icon) next to any alert
- The alert will be sent to your configured LINE chat
- Alerts include severity, AI confidence, and detailed descriptions

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Recharts for data visualization
- LINE Notify API for notifications

## Environment Variables

No environment variables required for the prototype. LINE tokens are stored in browser localStorage.

For production, consider using:
```env
NEXT_PUBLIC_LINE_NOTIFY_TOKEN=your_token_here
"# data-center-ai-platform" 
"# data-center-ai-platform" 
