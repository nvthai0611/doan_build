"use client"

import { useEffect, useRef, useState } from "react"
import { BookOpen, BarChart3, Users, GraduationCap, Calendar, CheckSquare, UserCheck, CalendarCheck2 } from "lucide-react"
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface ClassNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function ClassNavigation({
  tabs,
  activeTab,
  onTabChange,
}: any) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const tabsRef = useRef<{ [key: string]: HTMLButtonElement | null }>({})

  const defaultTabs = [
    { id: "thong-tin-chung", label: "Thông tin chung", icon: BookOpen },
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "hoc-vien", label: "Học viên", icon: Users },
    // { id: "giao-vien", label: "Giáo viên", icon: GraduationCap },
    { id: "buoi-hoc", label: "Buổi học", icon: Calendar },
    // { id: "cong-viec", label: "Công việc", icon: CheckSquare },
    { id: "history-attendance-class", label: "Lịch sử điểm danh", icon: CalendarCheck2 },
  ]

  // const finalTabs = tabs.length > 0 ? tabs : defaultTabs
  const finalTabs = tabs.length > 0 ? tabs : defaultTabs
  useEffect(() => {
    const activeTabElement = tabsRef.current[activeTab]
    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement
      setIndicatorStyle({
        left: offsetLeft,
        width: offsetWidth,
      })
    }
  }, [activeTab])

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700  ">
      <div className="px-6">
        <div className="flex items-center gap-8 overflow-x-auto">
          <div
            className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-in-out"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
            }}
          />
          {finalTabs.map((tab: any) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                ref={(el) => (tabsRef.current[tab.id] = el)}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'py-4 px-2 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                )}
              >
                {/* <span className="mr-2">
                  <IconComponent className="h-4 w-4" />
                </span> */}
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
