"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2 } from "lucide-react"

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  onFilterChange: (filters: FilterOptions) => void
  currentFilters: FilterOptions
}

export interface FilterOptions {
  gender?: string
  accountStatus?: string
  customerConnection?: string
}

export function FilterPanel({ isOpen, onClose, onFilterChange, currentFilters }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(currentFilters)

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...localFilters, [key]: value === "all" ? undefined : value }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleClearFilters = () => {
    const clearedFilters: FilterOptions = {}
    setLocalFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  if (!isOpen) return null

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Bộ lọc</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Filter Options */}
        <div className="space-y-4">
          {/* Gender Filter */}
          <div>
            <Select value={localFilters.gender || "all"} onValueChange={(value) => handleFilterChange("gender", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Giới tính" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả giới tính</SelectItem>
                <SelectItem value="Nam">Nam</SelectItem>
                <SelectItem value="Nữ">Nữ</SelectItem>
                <SelectItem value="Khác">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Account Status Filter */}
          <div>
            <Select
              value={localFilters.accountStatus || "all"}
              onValueChange={(value) => handleFilterChange("accountStatus", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Trạng thái tài khoản" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="Đang học">Đang học</SelectItem>
                <SelectItem value="Chờ xếp lớp">Chờ xếp lớp</SelectItem>
                <SelectItem value="Dừng học">Dừng học</SelectItem>
                <SelectItem value="Chưa cập nhật lịch học">Chưa cập nhật lịch học</SelectItem>
                <SelectItem value="Sắp học">Sắp học</SelectItem>
                <SelectItem value="Bảo lưu">Bảo lưu</SelectItem>
                <SelectItem value="Tốt nghiệp">Tốt nghiệp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Customer Connection Filter */}
          <div>
            <Select
              value={localFilters.customerConnection || "all"}
              onValueChange={(value) => handleFilterChange("customerConnection", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Liên kết khách hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả liên kết</SelectItem>
                <SelectItem value="linked">Đã liên kết</SelectItem>
                <SelectItem value="not-linked">Chưa liên kết</SelectItem>
                <SelectItem value="pending">Đang chờ xác nhận</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
