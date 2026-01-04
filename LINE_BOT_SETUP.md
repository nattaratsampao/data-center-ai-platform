# LINE Messaging API (Chatbot) Setup Guide

## Overview

This system supports **two types** of LINE integrations:

1. **LINE Notify** - Simple one-way notifications (no chat)
2. **LINE Messaging API** - Full chatbot with two-way conversation

## LINE Messaging API Setup (Recommended for Chatbot)

### Step 1: Create LINE Developers Account

1. Go to [LINE Developers Console](https://developers.line.biz/)
2. Log in with your LINE account
3. Create a new Provider (e.g., "InNoCo School")

### Step 2: Create Messaging API Channel

1. Click "Create a new channel"
2. Select **"Messaging API"**
3. Fill in channel information:
   - Channel name: "Data Center AI Assistant"
   - Channel description: "AI-powered data center monitoring chatbot"
   - Category: Business tools
   - Subcategory: IT & Infrastructure
4. Upload channel icon (optional)
5. Accept terms and create

### Step 3: Get Credentials

1. Go to **"Basic settings"** tab
2. Copy **Channel Secret** → paste in Settings page
3. Go to **"Messaging API"** tab
4. Issue **Channel Access Token** → paste in Settings page

### Step 4: Configure Webhook

1. In "Messaging API" tab, find **Webhook URL**
2. Set to: `https://your-domain.vercel.app/api/line/webhook`
3. Enable **"Use webhook"**
4. Disable **"Auto-reply messages"** (we handle replies programmatically)
5. Disable **"Greeting messages"** (optional)

### Step 5: Add Environment Variables

Add to your Vercel project or `.env.local`:

```bash
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here
LINE_CHANNEL_SECRET=your_channel_secret_here
```

### Step 6: Test the Bot

1. In LINE Developers Console, go to "Messaging API" tab
2. Scan the **QR code** with LINE app
3. Add the bot as a friend
4. Send "help" to get started

## Available Bot Commands

Users can interact with the chatbot using these commands:

- `status` / `สถานะ` - Get overall system status
- `alert` / `แจ้งเตือน` - View recent alerts
- `temperature` / `อุณหภูมิ` - Temperature information
- `power` / `พลังงาน` - Power consumption stats
- `servers` / `เซิร์ฟเวอร์` - Server health status
- `predict` / `ทำนาย` - AI predictions
- `help` / `ช่วยเหลือ` - Show all commands

## Sending Alerts to Users

### Push to Specific User

```typescript
const response = await fetch('/api/line/push', {
  method: 'POST',
  body: JSON.stringify({
    userId: 'U1234567890abcdef...', // LINE User ID
    message: '🚨 Critical Alert: Server-03 CPU at 95%!'
  })
})
```

### Broadcast to All Followers

```typescript
const response = await fetch('/api/line/broadcast', {
  method: 'POST',
  body: JSON.stringify({
    message: '🚨 System-wide Alert: Data center temperature high!'
  })
})
```

## Features

### Automatic Alerts

When critical events occur, the system automatically:
1. Detects the anomaly
2. Formats the alert message
3. Broadcasts to all LINE Bot followers
4. Provides actionable recommendations

### AI-Powered Responses

The chatbot uses pattern matching and can be extended with:
- Natural language processing
- Integration with AI models
- Real-time data from sensors
- Personalized recommendations

### User Management

Track users who add your bot:
- `follow` event - User adds bot as friend
- `unfollow` event - User removes bot
- Store user IDs for targeted notifications

## Differences: LINE Notify vs LINE Messaging API

| Feature | LINE Notify | LINE Messaging API |
|---------|-------------|-------------------|
| Setup Complexity | Simple | Moderate |
| Message Direction | One-way (app → user) | Two-way (bidirectional) |
| User Interaction | None | Full chat capability |
| Authorization | Personal token | Channel credentials |
| Cost | Free | Free (with limits) |
| Use Case | Simple alerts | Interactive chatbot |
| Commands | Not supported | Fully supported |
| Custom Replies | No | Yes |

## Recommended Usage

- Use **LINE Notify** for simple alert notifications
- Use **LINE Messaging API** for:
  - Interactive troubleshooting
  - Status queries on-demand
  - AI-powered recommendations
  - User engagement and support

## Troubleshooting

### Webhook Not Working

1. Check webhook URL is correct and accessible
2. Verify SSL certificate (HTTPS required)
3. Check "Use webhook" is enabled
4. Test webhook from LINE Console

### Bot Not Responding

1. Verify Channel Access Token is correct
2. Check webhook endpoint logs
3. Ensure auto-reply is disabled
4. Test with simple messages first

### Broadcast Fails

1. Check you have followers (at least 1 user)
2. Verify Channel Access Token has correct permissions
3. Check rate limits (free tier: 500 messages/month)

## Rate Limits (Free Tier)

- Push messages: 500/month
- Broadcast: All followers count as separate messages
- Reply messages: Unlimited (within reason)

## Next Steps

1. Customize bot responses in `/api/line/webhook/route.ts`
2. Add natural language processing
3. Integrate with AI models for smarter responses
4. Build rich messages (images, buttons, carousels)
5. Implement user preferences and personalization
