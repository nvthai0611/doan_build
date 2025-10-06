"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Search, X, ChevronUp, ChevronDown } from "lucide-react"

export interface Column<T> {
  key: string
  header: string
  width?: string
  align?: "left" | "center" | "right"
  render?: (item: T, index: number) => React.ReactNode
  sortable?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  sortKey?: string // Key để sort (có thể khác với key hiển thị)
  sortDirection?: "asc" | "desc" | null
  onSort?: (key: string, direction: "asc" | "desc" | null) => void
}

export interface PaginationConfig {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number) => void
  showItemsPerPage?: boolean
  showPageInfo?: boolean
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  emptyMessage?: string
  pagination?: PaginationConfig
  className?: string
  rowKey?: keyof T | ((item: T, index: number) => string | number)
  onRowClick?: (item: T, index: number) => void
  hoverable?: boolean
  striped?: boolean
  enableSearch?: boolean
  searchPlaceholder?: string
  enableSort?: boolean
  onSortChange?: (sortBy: string, sortOrder: "asc" | "desc" | null) => void
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  error = null,
  onRetry,
  emptyMessage = "Không có dữ liệu",
  pagination,
  className = "",
  rowKey,
  onRowClick,
  hoverable = true,
  striped = false,
  enableSearch = true,
  searchPlaceholder = "Tìm kiếm...",
  enableSort = true,
  onSortChange,
}: DataTableProps<T>) {
  // State cho search filters
  const [searchFilters, setSearchFilters] = useState<Record<string, string>>({})
  // State cho sort
  const [sortState, setSortState] = useState<{ key: string; direction: "asc" | "desc" | null }>({
    key: "",
    direction: null
  })

  // Hàm xử lý thay đổi search filter
  const handleSearchChange = (columnKey: string, value: string) => {
    setSearchFilters(prev => ({
      ...prev,
      [columnKey]: value
    }))
  }

  // Hàm clear search filter
  const clearSearchFilter = (columnKey: string) => {
    setSearchFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[columnKey]
      return newFilters
    })
  }

  // Hàm clear tất cả search filters
  const clearAllSearchFilters = () => {
    setSearchFilters({})
  }

  // Hàm xử lý sort
  const handleSort = (columnKey: string) => {
    if (!enableSort) return

    const column = columns.find(col => col.key === columnKey)
    if (!column?.sortable) return

    const sortKey = column.sortKey || columnKey
    let newDirection: "asc" | "desc" | null = "asc"

    if (sortState.key === sortKey) {
      if (sortState.direction === "asc") {
        newDirection = "desc"
      } else if (sortState.direction === "desc") {
        newDirection = null
      } else {
        newDirection = "asc"
      }
    }

    setSortState({ key: sortKey, direction: newDirection })
    
    // Gọi callback nếu có
    if (onSortChange) {
      onSortChange(sortKey, newDirection)
    }
  }

  // Logic lọc dữ liệu dựa trên search filters
  const filteredData = useMemo(() => {
    if (!enableSearch || Object.keys(searchFilters).length === 0) {
      return data
    }

    return data.filter(item => {
      return Object.entries(searchFilters).every(([columnKey, searchValue]) => {
        if (!searchValue.trim()) return true
        
        const column = columns.find(col => col.key === columnKey)
        if (!column) return true

        // Nếu có custom render function, sử dụng nó để lấy giá trị hiển thị
        let cellValue: string
        if (column.render) {
          const rendered = column.render(item, 0)
          cellValue = typeof rendered === 'string' ? rendered : String(rendered)
        } else {
          cellValue = String((item as any)[columnKey] || '')
        }

        return cellValue.toLowerCase().includes(searchValue.toLowerCase())
      })
    })
  }, [data, searchFilters, columns, enableSearch])

  const getRowKey = (item: T, index: number): string | number => {
    if (rowKey) {
      if (typeof rowKey === "function") {
        return `${rowKey(item, index)}-${index}`
      }
      return `${item[rowKey]}-${index}`
    }
    return index
  }

  const renderLoadingRow = () => (
    <tr>
      <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
        </div>
      </td>
    </tr>
  )

  const renderErrorRow = () => (
    <tr>
      <td colSpan={columns.length} className="px-6 py-8 text-center text-red-500">
        <div className="flex flex-col items-center justify-center">
          <p>{error}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="mt-2 bg-transparent">
              Thử lại
            </Button>
          )}
        </div>
      </td>
    </tr>
  )

  const renderEmptyRow = () => (
    <tr>
      <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
        {emptyMessage}
      </td>
    </tr>
  )

  const renderDataRows = () => {
    if (loading) return renderLoadingRow()
    if (error) return renderErrorRow()
    if (filteredData.length === 0) return renderEmptyRow()

    return filteredData.map((item, index) => (
      <tr
        key={getRowKey(item, index)}
        className={`
          ${hoverable ? "hover:bg-gray-50" : ""}
          ${striped && index % 2 === 1 ? "bg-gray-50" : ""}
          ${onRowClick ? "cursor-pointer" : ""}
        `}
        onClick={() => onRowClick?.(item, index)}
      >
        {columns.map((column) => (
          <td
            key={column.key}
            className={`
              px-6 py-4 whitespace-nowrap text-sm text-gray-900
              ${column.align === "center" ? "text-center" : ""}
              ${column.align === "right" ? "text-right" : ""}
            `}
            style={{ width: column.width }}
          >
            {column.render ? column.render(item, index) : (item as any)[column.key]}
          </td>
        ))}
      </tr>
    ))
  }

  // Render search input cho header
  const renderSearchInput = (column: Column<T>) => {
    if (!enableSearch || !column.searchable) return null

    const searchValue = searchFilters[column.key] || ''
    const hasSearchValue = searchValue.trim() !== ''

    return (
      <div className="mt-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          <Input
            type="text"
            placeholder={column.searchPlaceholder || searchPlaceholder}
            value={searchValue}
            onChange={(e) => handleSearchChange(column.key, e.target.value)}
            className="pl-7 pr-8 h-7 text-xs"
          />
          {hasSearchValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearSearchFilter(column.key)}
              className="absolute right-0 top-0 h-7 w-7 p-0 hover:bg-gray-200"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Render sort button cho header
  const renderSortButton = (column: Column<T>) => {
    if (!enableSort || !column.sortable) return null

    const sortKey = column.sortKey || column.key
    const isActive = sortState.key === sortKey
    const direction = isActive ? sortState.direction : null

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleSort(column.key)}
        className="ml-2 h-6 w-6 p-0 hover:bg-gray-200"
      >
        {direction === "asc" ? (
          <ChevronUp className="w-3 h-3 text-blue-600" />
        ) : direction === "desc" ? (
          <ChevronDown className="w-3 h-3 text-blue-600" />
        ) : (
          <div className="flex flex-col">
            <ChevronUp className="w-2 h-2 -mb-1 text-gray-400" />
            <ChevronDown className="w-2 h-2 text-gray-400" />
          </div>
        )}
      </Button>
    )
  }

  const renderPagination = () => {
    if (!pagination) return null

    const {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      onPageChange,
      onItemsPerPageChange,
      showItemsPerPage = true,
      showPageInfo = true,
    } = pagination

    return (
      <div className="px-6 py-4 border-t bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showItemsPerPage && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Số hàng mỗi trang:</span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(Number(value))}>
                  <SelectTrigger className="w-16 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {enableSearch && Object.keys(searchFilters).length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllSearchFilters}
                className="text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Xóa tất cả bộ lọc
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4">
            {showPageInfo && (
              <div className="text-sm text-gray-600">
                {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} trong{" "}
                {totalItems}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600 px-2">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                    ${column.align === "center" ? "text-center" : ""}
                    ${column.align === "right" ? "text-right" : ""}
                  `}
                  style={{ width: column.width }}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <span>{column.header}</span>
                      {renderSortButton(column)}
                    </div>
                    {renderSearchInput(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">{renderDataRows()}</tbody>
        </table>
      </div>
      {renderPagination()}
    </div>
  )
}
