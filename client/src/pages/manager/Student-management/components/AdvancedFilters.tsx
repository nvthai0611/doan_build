"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Filter, X } from "lucide-react"
import type { StudentFilters } from "../types/database"

interface AdvancedFiltersProps {
  filters: StudentFilters
  onFilterChange: (key: keyof StudentFilters, value: any) => void
  onClearFilters: () => void
}

export function AdvancedFilters({ filters, onFilterChange, onClearFilters }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split("-")
    onFilterChange("sortBy", sortBy)
    onFilterChange("sortOrder", sortOrder)
  }

  const getCurrentSortValue = () => {
    return `${filters.sortBy}-${filters.sortOrder}`
  }

  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.birthDay ||
      filters.birthMonth ||
      filters.birthYear ||
      filters.status !== "all" ||
      filters.sortBy !== "name" ||
      filters.sortOrder !== "asc"
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 border-border bg-transparent relative">
          <Filter className="w-4 h-4" />
          Bộ lọc
          {hasActiveFilters() && <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full" />}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Bộ lọc nâng cao</SheetTitle>
          <SheetDescription>Tùy chỉnh các bộ lọc để tìm kiếm học viên chính xác hơn</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Tìm kiếm</Label>
            <Input
              id="search"
              placeholder="Tên, email, số điện thoại, mã học viên..."
              value={filters.search}
              onChange={(e) => onFilterChange("search", e.target.value)}
            />
          </div>

          {/* Date Filters */}
          <div className="space-y-4">
            <Label>Ngày sinh</Label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="birthDay" className="text-sm text-muted-foreground">
                  Ngày
                </Label>
                <Input
                  id="birthDay"
                  type="number"
                  placeholder="DD"
                  value={filters.birthDay || ""}
                  onChange={(e) => onFilterChange("birthDay", e.target.value)}
                  min="1"
                  max="31"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthMonth" className="text-sm text-muted-foreground">
                  Tháng
                </Label>
                <Input
                  id="birthMonth"
                  type="number"
                  placeholder="MM"
                  value={filters.birthMonth || ""}
                  onChange={(e) => onFilterChange("birthMonth", e.target.value)}
                  min="1"
                  max="12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthYear" className="text-sm text-muted-foreground">
                  Năm
                </Label>
                <Input
                  id="birthYear"
                  type="number"
                  placeholder="YYYY"
                  value={filters.birthYear || ""}
                  onChange={(e) => onFilterChange("birthYear", e.target.value)}
                  min="1990"
                  max="2010"
                />
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <Label htmlFor="sort">Sắp xếp</Label>
            <Select value={getCurrentSortValue()} onValueChange={handleSortChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn cách sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Tên A-Z</SelectItem>
                <SelectItem value="name-desc">Tên Z-A</SelectItem>
                <SelectItem value="date-desc">Mới nhất</SelectItem>
                <SelectItem value="date-asc">Cũ nhất</SelectItem>
                <SelectItem value="balance-desc">Số dư cao nhất</SelectItem>
                <SelectItem value="balance-asc">Số dư thấp nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <Button onClick={() => setIsOpen(false)} className="flex-1">
              Áp dụng
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onClearFilters()
                setIsOpen(false)
              }}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
