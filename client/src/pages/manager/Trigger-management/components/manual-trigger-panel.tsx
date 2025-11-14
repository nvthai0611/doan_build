"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle2, Zap, Database, Mail, RefreshCw, BarChart3, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ManualTriggerPanelProps {
  availableJobTypes: string[]
}

// Map job types to icons and colors
const jobTypeConfig: Record<string, { icon: any; label: string; description: string; color: string }> = {
  backup_database: {
    icon: Database,
    label: "Database Backup",
    description: "Backup your database",
    color: "from-blue-500/20 to-blue-500/5 hover:from-blue-500/30 hover:to-blue-500/10 border-blue-500/30",
  },
  sync_cache: {
    icon: RefreshCw,
    label: "Sync Cache",
    description: "Refresh cached data",
    color: "from-purple-500/20 to-purple-500/5 hover:from-purple-500/30 hover:to-purple-500/10 border-purple-500/30",
  },
  send_emails: {
    icon: Mail,
    label: "Send Emails",
    description: "Process email queue",
    color: "from-pink-500/20 to-pink-500/5 hover:from-pink-500/30 hover:to-pink-500/10 border-pink-500/30",
  },
  generate_reports: {
    icon: BarChart3,
    label: "Generate Reports",
    description: "Create analytics reports",
    color: "from-green-500/20 to-green-500/5 hover:from-green-500/30 hover:to-green-500/10 border-green-500/30",
  },
  cleanup_temp: {
    icon: Settings,
    label: "Cleanup Temp",
    description: "Remove temporary files",
    color: "from-orange-500/20 to-orange-500/5 hover:from-orange-500/30 hover:to-orange-500/10 border-orange-500/30",
  },
  process_payments: {
    icon: Zap,
    label: "Process Payments",
    description: "Handle payment processing",
    color: "from-amber-500/20 to-amber-500/5 hover:from-amber-500/30 hover:to-amber-500/10 border-amber-500/30",
  },
}

export function ManualTriggerPanel({ availableJobTypes }: ManualTriggerPanelProps) {
  const [triggeringJob, setTriggeringJob] = useState<string | null>(null)
  const [lastTriggeredJob, setLastTriggeredJob] = useState<{ type: string; timestamp: Date } | null>(null)
  const { toast } = useToast()

  const displayJobs = availableJobTypes
    .filter((type) => jobTypeConfig[type])
    .map((type) => ({
      type,
      ...jobTypeConfig[type],
    }))

  const handleTriggerJob = async (jobType: string) => {
    setTriggeringJob(jobType)
    try {
      // Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setLastTriggeredJob({
        type: jobType,
        timestamp: new Date(),
      })

      const config = jobTypeConfig[jobType]
      toast({
        title: "Success",
        description: `${config.label} has been triggered successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to trigger job. Please try again.",
        variant: "destructive",
      })
    } finally {
      setTriggeringJob(null)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
      <CardHeader className="border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-lg p-2.5 border border-accent/10">
            <Zap className="h-4 w-4 text-accent" />
          </div>
          <div>
            <CardTitle>Kích hoạt Nhiệm vụ Nhanh</CardTitle>
            <CardDescription className="text-xs">Nhấn để chạy các công việc hệ thống ngay lập tức</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {displayJobs.map((job) => {
            const IconComponent = job.icon
            const isTriggering = triggeringJob === job.type
            const isLastTriggered = lastTriggeredJob?.type === job.type

            return (
              <button
                key={job.type}
                onClick={() => handleTriggerJob(job.type)}
                disabled={triggeringJob !== null}
                className={`group relative flex flex-col items-center justify-center gap-2 p-4 rounded-lg border transition-all duration-300 ${job.color} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="relative z-10 flex items-center justify-center h-10 w-10 rounded-full bg-background/30 group-hover:bg-background/50 transition-colors">
                  {isTriggering ? (
                    <Loader2 className="h-5 w-5 animate-spin text-accent" />
                  ) : isLastTriggered ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  ) : (
                    <IconComponent className="h-5 w-5 text-foreground/70 group-hover:text-foreground transition-colors" />
                  )}
                </div>

                <div className="relative z-10 text-center min-h-10 flex flex-col justify-center">
                  <p className="text-xs font-semibold text-foreground leading-tight">{job.label}</p>
                  <p className="text-[10px] text-foreground/50 mt-0.5 hidden sm:block">{job.description}</p>
                </div>
              </button>
            )
          })}
        </div>

        {lastTriggeredJob && (
          <div className="rounded-lg border border-green-500/30 bg-gradient-to-r from-green-500/10 to-green-500/5 p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-green-300">Lần kích hoạt cuối</p>
                <p className="text-xs text-green-300/70 mt-0.5">
                  {jobTypeConfig[lastTriggeredJob.type].label} • {formatTime(lastTriggeredJob.timestamp)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
