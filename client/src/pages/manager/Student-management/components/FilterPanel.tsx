"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2 } from "lucide-react"

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  onFilterChange: (filters: FilterOptions) => void
  currentFilters: FilterOptions
  onClearAll?: () => void // Thêm prop để clear tất cả
}

export interface FilterOptions {
  gender?: string
  accountStatus?: string
  customerConnection?: string
}

export function FilterPanel({ isOpen, onClose, onFilterChange, currentFilters, onClearAll }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(currentFilters)

  // Sync local filters with current filters
  useEffect(() => {
    setLocalFilters(currentFilters)
  }, [currentFilters])

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...localFilters, [key]: value === "all" ? undefined : value }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleClearFilters = () => {
    if (onClearAll) {
      // Clear tất cả bao gồm cả filters khác
      onClearAll()
    } else {
      // Chỉ clear advanced filters
      const clearedFilters: FilterOptions = {}
      setLocalFilters(clearedFilters)
      onFilterChange(clearedFilters)
    }
  }

  if (!isOpen) return null

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Bộ lọc nâng cao</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Xóa tất cả bộ lọc"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Filter Options */}
        <div className="space-y-4">
          {/* Gender Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Giới tính
            </label>
            <Select value={localFilters.gender || "all"} onValueChange={(value) => handleFilterChange("gender", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn giới tính" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả giới tính</SelectItem>
                <SelectItem value="MALE">Nam</SelectItem>
                <SelectItem value="FEMALE">Nữ</SelectItem>
                <SelectItem value="OTHER">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Account Status Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Trạng thái tài khoản
            </label>
            <Select
              value={localFilters.accountStatus || "all"}
              onValueChange={(value) => handleFilterChange("accountStatus", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Tài khoản hoạt động</SelectItem>
                <SelectItem value="inactive">Tài khoản bị khóa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Customer Connection Filter */}
          {/* <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Liên kết phụ huynh
            </label>
            <Select
              value={localFilters.customerConnection || "all"}
              onValueChange={(value) => handleFilterChange("customerConnection", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn liên kết" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="with_parent">Có phụ huynh</SelectItem>
                <SelectItem value="without_parent">Chưa có phụ huynh</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
        </div>

        {/* Show active filters count */}
        {Object.keys(localFilters).filter(key => localFilters[key as keyof FilterOptions]).length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Đã áp dụng {Object.keys(localFilters).filter(key => localFilters[key as keyof FilterOptions]).length} bộ lọc
            </div>
          </div>
        )}

        {/* Clear all button */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="w-full text-xs"
          >
            Xóa tất cả bộ lọc
          </Button>
        </div>
      </div>
    </div>
  )
}
