"use client"

import { cn } from "@/lib/utils"
import type { StudentStatus } from "../types/database"

interface StatusTabsProps {
  activeStatus: StudentStatus
  onStatusChange: (status: StudentStatus) => void
  statusCounts: Record<string, number>
}

const statusLabels: Record<StudentStatus, string> = {
  all: "Tất cả",
  pending: "Chờ xếp lớp",
  upcoming: "Sắp học",
  studying: "Đang học",
  reserved: "Bảo lưu",
  stopped: "Dừng học",
  graduated: "Tốt nghiệp",
}

const statusColors: Record<StudentStatus, string> = {
  all: "border-blue-500 text-blue-700 bg-blue-50",
  pending: "border-orange-500 text-orange-700 bg-orange-50",
  upcoming: "border-purple-500 text-purple-700 bg-purple-50",
  studying: "border-green-500 text-green-700 bg-green-50",
  reserved: "border-yellow-500 text-yellow-700 bg-yellow-50",
  stopped: "border-red-500 text-red-700 bg-red-50",
  graduated: "border-emerald-500 text-emerald-700 bg-emerald-50",
}

const countColors: Record<StudentStatus, string> = {
  all: "bg-blue-100 text-blue-800",
  pending: "bg-orange-100 text-orange-800",
  upcoming: "bg-purple-100 text-purple-800",
  studying: "bg-green-100 text-green-800",
  reserved: "bg-yellow-100 text-yellow-800",
  stopped: "bg-red-100 text-red-800",
  graduated: "bg-emerald-100 text-emerald-800",
}

export function StatusTabs({ activeStatus, onStatusChange, statusCounts }: StatusTabsProps) {
  const tabs: { key: StudentStatus; count: number }[] = [
    { key: "all", count: statusCounts.all },
    { key: "pending", count: statusCounts.pending },
    { key: "upcoming", count: statusCounts.upcoming },
    { key: "studying", count: statusCounts.studying },
    { key: "reserved", count: statusCounts.reserved },
    { key: "stopped", count: statusCounts.stopped },
    { key: "graduated", count: statusCounts.graduated },
  ]

  return (
    <div className="flex items-center gap-1 border-b border-border">
      {tabs.map(({ key, count }) => (
        <button
          key={key}
          onClick={() => onStatusChange(key)}
          className={cn(
            "px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 rounded-t-lg",
            "hover:text-foreground hover:border-border hover:bg-muted/50",
            activeStatus === key
              ? cn("border-b-2", statusColors[key])
              : "border-transparent text-muted-foreground bg-transparent",
          )}
        >
          <div className="flex items-center gap-2">
            <span>{statusLabels[key]}</span>
            <span
              className={cn(
                "px-2 py-0.5 text-xs font-semibold rounded-full",
                activeStatus === key ? countColors[key] : "bg-muted text-muted-foreground",
              )}
            >
              {count}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}
