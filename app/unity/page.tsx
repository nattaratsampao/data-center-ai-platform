import { UnityViewer } from "@/components/unity-viewer"

export default function UnityPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-6 py-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Unity ML-Agents Integration</h1>
            <p className="text-sm text-muted-foreground">
              Connect your Unity simulation for AI-powered data center optimization
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-background">
        <div className="container mx-auto px-6 py-6">
          <UnityViewer />
        </div>
      </div>
    </div>
  )
}
