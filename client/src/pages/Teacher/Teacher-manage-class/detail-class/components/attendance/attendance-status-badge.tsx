import { ATTENDANCE_STATUS_CONFIG } from "../../lib/attendance-utils"
import { cn } from "@/lib/utils"

interface AttendanceStatusBadgeProps {
  status: string
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
}

export function AttendanceStatusBadge({ status, size = "md", showLabel = false }: AttendanceStatusBadgeProps) {
  const config = ATTENDANCE_STATUS_CONFIG[status as keyof typeof ATTENDANCE_STATUS_CONFIG]

  if (!config) {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center rounded border",
          "text-muted-foreground bg-muted border-border",
          size === "sm" && "h-6 w-6 text-xs",
          size === "md" && "h-8 w-8 text-sm",
          size === "lg" && "h-10 w-10 text-base",
        )}
      >
        -
      </div>
    )
  }

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded border font-medium",
        config.color,
        config.darkColor,
        size === "sm" && "h-6 text-xs",
        size === "md" && "h-8 text-sm",
        size === "lg" && "h-10 text-base",
        showLabel ? "px-3 gap-1.5" : "w-8",
      )}
    >
      <span>{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </div>
  )
}
