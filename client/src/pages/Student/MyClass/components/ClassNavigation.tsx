"use client"

import { useEffect, useRef, useState } from "react"

interface ClassNavigationProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function ClassNavigation({ activeTab, onTabChange }: ClassNavigationProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const tabsRef = useRef<{ [key: string]: HTMLButtonElement | null }>({})

  const tabs = [
    { id: "thong-tin-chung", label: "Thông tin chung" },
    { id: "hoc-vien", label: "Học viên" },
    { id: "buoi-hoc", label: "Buổi học" },
    { id: "tai-lieu", label: "Tài liệu" },
  ]

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
    <div className="border-b bg-card relative">
      <div className="container mx-auto px-6">
        <div className="flex gap-2 overflow-x-auto relative">
          <div
            className="absolute bottom-0 h-0.5 bg-blue-700 transition-all duration-300 ease-in-out"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
            }}
          />
          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => (tabsRef.current[tab.id] = el)}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-2 text-sm font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${
                activeTab === tab.id
                  ? "text-blue-700 transform scale-105"
                  : "text-muted-foreground hover:text-blue-700 hover:scale-102"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
