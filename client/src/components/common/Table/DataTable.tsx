import React from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface Column<T> {
  key: string
  header: string
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (item: T, index: number) => React.ReactNode
  sortable?: boolean
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
  striped = false
}: DataTableProps<T>) {
  const getRowKey = (item: T, index: number): string | number => {
    if (rowKey) {
      if (typeof rowKey === 'function') {
        return rowKey(item, index)
      }
      return item[rowKey] as string | number
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="mt-2"
            >
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
    if (data.length === 0) return renderEmptyRow()

    return data.map((item, index) => (
      <tr 
        key={getRowKey(item, index)}
        className={`
          ${hoverable ? 'hover:bg-gray-50' : ''}
          ${striped && index % 2 === 1 ? 'bg-gray-50' : ''}
          ${onRowClick ? 'cursor-pointer' : ''}
        `}
        onClick={() => onRowClick?.(item, index)}
      >
        {columns.map((column) => (
          <td 
            key={column.key}
            className={`
              px-6 py-4 whitespace-nowrap text-sm text-gray-900
              ${column.align === 'center' ? 'text-center' : ''}
              ${column.align === 'right' ? 'text-right' : ''}
            `}
            style={{ width: column.width }}
          >
            {column.render ? column.render(item, index) : (item as any)[column.key]}
          </td>
        ))}
      </tr>
    ))
  }

  const renderPagination = () => {
    if (!pagination) return null

    const { currentPage, totalPages, totalItems, itemsPerPage, onPageChange, onItemsPerPageChange, showItemsPerPage = true, showPageInfo = true } = pagination

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
          </div>
          <div className="flex items-center gap-4">
            {showPageInfo && (
              <div className="text-sm text-gray-600">
                {((currentPage - 1) * itemsPerPage + 1)}-{Math.min(currentPage * itemsPerPage, totalItems)}{" "}
                trong {totalItems}
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
                    ${column.align === 'center' ? 'text-center' : ''}
                    ${column.align === 'right' ? 'text-right' : ''}
                  `}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {renderDataRows()}
          </tbody>
        </table>
      </div>
      {renderPagination()}
    </div>
  )
}
