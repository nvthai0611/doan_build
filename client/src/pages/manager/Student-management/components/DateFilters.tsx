"use client"

import { Input } from "@/components/ui/input"
import type { StudentFilters } from "../types/database"

interface DateFiltersProps {
  filters: StudentFilters
  onFilterChange: (key: keyof StudentFilters, value: any) => void
}

export function DateFilters({ filters, onFilterChange }: DateFiltersProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground whitespace-nowrap">Ngày sinh</label>
        <Input
          type="number"
          placeholder="DD"
          value={filters.birthDay || ""}
          onChange={(e) => onFilterChange("birthDay", e.target.value)}
          className="w-16 text-center border-border"
          min="1"
          max="31"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground whitespace-nowrap">Tháng sinh</label>
        <Input
          type="number"
          placeholder="MM"
          value={filters.birthMonth || ""}
          onChange={(e) => onFilterChange("birthMonth", e.target.value)}
          className="w-16 text-center border-border"
          min="1"
          max="12"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground whitespace-nowrap">Năm sinh</label>
        <Input
          type="number"
          placeholder="YYYY"
          value={filters.birthYear || ""}
          onChange={(e) => onFilterChange("birthYear", e.target.value)}
          className="w-20 text-center border-border"
          min="1990"
          max="2010"
        />
      </div>
    </div>
  )
}
