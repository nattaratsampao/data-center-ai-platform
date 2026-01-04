"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Bell, Brain, Thermometer, Shield, Save, MessageSquare, Send, Bot } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SettingsPage() {
  const [aiEnabled, setAiEnabled] = useState(true)
  const [autoOptimize, setAutoOptimize] = useState(true)
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [tempThreshold, setTempThreshold] = useState([30])
  const [powerThreshold, setPowerThreshold] = useState([80])
  const [lineNotifyEnabled, setLineNotifyEnabled] = useState(false)
  const [lineNotifyToken, setLineNotifyToken] = useState("")
  const [lineBotEnabled, setLineBotEnabled] = useState(false)
  const [lineChannelAccessToken, setLineChannelAccessToken] = useState("")
  const [lineChannelSecret, setLineChannelSecret] = useState("")
  const [isSendingTest, setIsSendingTest] = useState(false)
  const { toast } = useToast()

  const sendTestNotification = async () => {
    if (!lineNotifyToken) {
      toast({
        title: "Error",
        description: "Please enter LINE Notify token first",
        variant: "destructive",
      })
      return
    }

    setIsSendingTest(true)
    try {
      const response = await fetch("/api/line-notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: lineNotifyToken,
          message: `🔔 Test Alert from Data Center AI\n\nThis is a test notification from your Data Center Monitoring System.\n\nTime: ${new Date().toLocaleString("th-TH")}\nStatus: System OK ✅`,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Test notification sent to LINE successfully!",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send notification",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSendingTest(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure system parameters and AI behavior</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Configuration
            </CardTitle>
            <CardDescription>Configure AI-powered features and automation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable AI Monitoring</Label>
                <p className="text-sm text-muted-foreground">Activate anomaly detection and predictions</p>
              </div>
              <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Optimization</Label>
                <p className="text-sm text-muted-foreground">Allow AI to automatically adjust cooling and load</p>
              </div>
              <Switch checked={autoOptimize} onCheckedChange={setAutoOptimize} />
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Prediction Confidence Threshold</Label>
              <Select defaultValue="75">
                <SelectTrigger>
                  <SelectValue placeholder="Select threshold" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">60% - More alerts</SelectItem>
                  <SelectItem value="75">75% - Balanced</SelectItem>
                  <SelectItem value="85">85% - High confidence</SelectItem>
                  <SelectItem value="95">95% - Critical only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>AI Model Update Frequency</Label>
              <Select defaultValue="daily">
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Every hour</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Alert Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Alert Settings
            </CardTitle>
            <CardDescription>Configure notification and alert preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Alerts</Label>
                <p className="text-sm text-muted-foreground">Receive notifications for system events</p>
              </div>
              <Switch checked={alertsEnabled} onCheckedChange={setAlertsEnabled} />
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Notification Email</Label>
              <Input type="email" placeholder="admin@company.com" defaultValue="datacenter@innoco.th" />
            </div>

            <div className="space-y-3">
              <Label>Alert Frequency</Label>
              <Select defaultValue="realtime">
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time</SelectItem>
                  <SelectItem value="5min">Every 5 minutes</SelectItem>
                  <SelectItem value="15min">Every 15 minutes</SelectItem>
                  <SelectItem value="hourly">Hourly digest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Minimum Alert Severity</Label>
              <Select defaultValue="medium">
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">All alerts</SelectItem>
                  <SelectItem value="medium">Medium and above</SelectItem>
                  <SelectItem value="high">High and Critical</SelectItem>
                  <SelectItem value="critical">Critical only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* LINE Notify Integration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#00B900]" />
              LINE Notify Integration
            </CardTitle>
            <CardDescription>Send one-way notifications to LINE</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable LINE Notify</Label>
                <p className="text-sm text-muted-foreground">Send alerts via LINE Notify (one-way)</p>
              </div>
              <Switch checked={lineNotifyEnabled} onCheckedChange={setLineNotifyEnabled} />
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>LINE Notify Token</Label>
              <Input
                type="password"
                placeholder="Enter your LINE Notify token"
                value={lineNotifyToken}
                onChange={(e) => setLineNotifyToken(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Get your token from{" "}
                <a
                  href="https://notify-bot.line.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  notify-bot.line.me
                </a>
              </p>
            </div>

            <Button
              onClick={sendTestNotification}
              disabled={isSendingTest || !lineNotifyToken}
              className="w-full gap-2"
            >
              <Send className="h-4 w-4" />
              {isSendingTest ? "Sending..." : "Send Test Notification"}
            </Button>
          </CardContent>
        </Card>

        {/* LINE Messaging API (Chatbot) Card */}
        <Card className="border-[#00B900]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-[#00B900]" />
              LINE Messaging API (Chatbot)
            </CardTitle>
            <CardDescription>Full chatbot with two-way conversation and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable LINE Bot</Label>
                <p className="text-sm text-muted-foreground">Users can chat and receive alerts</p>
              </div>
              <Switch checked={lineBotEnabled} onCheckedChange={setLineBotEnabled} />
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Channel Access Token</Label>
              <Input
                type="password"
                placeholder="Enter Channel Access Token"
                value={lineChannelAccessToken}
                onChange={(e) => setLineChannelAccessToken(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Channel Secret</Label>
              <Input
                type="password"
                placeholder="Enter Channel Secret"
                value={lineChannelSecret}
                onChange={(e) => setLineChannelSecret(e.target.value)}
              />
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="text-sm font-medium">Setup Instructions:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Go to LINE Developers Console</li>
                <li>Create Messaging API channel</li>
                <li>Get Channel Access Token & Secret</li>
                <li>
                  Set Webhook URL:{" "}
                  <code className="text-xs bg-background px-1 py-0.5 rounded">
                    https://your-domain.com/api/line/webhook
                  </code>
                </li>
                <li>Enable "Use webhooks"</li>
              </ol>
            </div>

            <div className="space-y-3">
              <Label>Bot Features Available:</Label>
              <div className="text-sm space-y-1 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="text-[#00B900]">✓</span>
                  <span>Two-way conversation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#00B900]">✓</span>
                  <span>System status queries</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#00B900]">✓</span>
                  <span>AI-powered recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#00B900]">✓</span>
                  <span>Push notifications to users</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#00B900]">✓</span>
                  <span>Broadcast alerts to all followers</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Threshold Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-chart-4" />
              Environment Thresholds
            </CardTitle>
            <CardDescription>Set warning thresholds for environmental sensors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Temperature Warning (°C)</Label>
                <span className="text-sm font-medium">{tempThreshold[0]}°C</span>
              </div>
              <Slider value={tempThreshold} onValueChange={setTempThreshold} max={45} min={20} step={1} />
              <p className="text-xs text-muted-foreground">Recommended: 25-30°C for optimal cooling</p>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Power Usage Warning (%)</Label>
                <span className="text-sm font-medium">{powerThreshold[0]}%</span>
              </div>
              <Slider value={powerThreshold} onValueChange={setPowerThreshold} max={100} min={50} step={5} />
              <p className="text-xs text-muted-foreground">
                Alert when power usage exceeds this percentage of capacity
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Humidity Range (%)</Label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input type="number" placeholder="Min" defaultValue="40" />
                </div>
                <div className="flex-1">
                  <Input type="number" placeholder="Max" defaultValue="60" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              System Settings
            </CardTitle>
            <CardDescription>General system configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Data Center Name</Label>
              <Input placeholder="Enter name" defaultValue="InNoCo Data Center - Main" />
            </div>

            <div className="space-y-3">
              <Label>Location</Label>
              <Input placeholder="Enter location" defaultValue="Bangkok, Thailand" />
            </div>

            <div className="space-y-3">
              <Label>Data Retention Period</Label>
              <Select defaultValue="90">
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Timezone</Label>
              <Select defaultValue="asia-bangkok">
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asia-bangkok">Asia/Bangkok (UTC+7)</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="asia-singapore">Asia/Singapore (UTC+8)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg" className="gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}
