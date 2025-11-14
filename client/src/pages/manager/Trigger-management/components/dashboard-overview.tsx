"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, CheckCircle2, AlertCircle, Clock } from "lucide-react"



export function DashboardOverview({ jobs }: any) {
  const stats = {
    totalJobs: jobs.length,
    completedJobs: jobs.filter((j: any ) => j.status === "completed").length,
    failedJobs: jobs.filter((j: any ) => j.status === "failed").length,
    runningJobs: jobs.filter((j: any ) => j.status === "running").length,
  }

  const statCards = [
    {
      title: "Total Jobs",
      value: stats.totalJobs,
      icon: Activity,
      color: "text-primary",
      bgGradient: "from-primary/20 to-primary/5",
    },
    {
      title: "Completed",
      value: stats.completedJobs,
      icon: CheckCircle2,
      color: "text-green-500",
      bgGradient: "from-green-500/20 to-green-500/5",
    },
    {
      title: "Failed",
      value: stats.failedJobs,
      icon: AlertCircle,
      color: "text-red-500",
      bgGradient: "from-red-500/20 to-red-500/5",
    },
    {
      title: "Running",
      value: stats.runningJobs,
      icon: Clock,
      color: "text-amber-500",
      bgGradient: "from-amber-500/20 to-amber-500/5",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card
            key={stat.title}
            className="border-border/50 bg-card/40 backdrop-blur-sm hover:bg-card/60 hover:border-border/80 transition-all duration-300"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`bg-gradient-to-br ${stat.bgGradient} rounded-lg p-2.5 border border-primary/10`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
