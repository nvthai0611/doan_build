import React from 'react'

export interface SimpleColumn<T> {
  key: string
  header: string
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (item: T, index: number) => React.ReactNode
}

export interface SimpleTableProps<T> {
  data: T[]
  columns: SimpleColumn<T>[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  emptyMessage?: string
  className?: string
  rowKey?: keyof T | ((item: T, index: number) => string | number)
  onRowClick?: (item: T, index: number) => void
  hoverable?: boolean
  striped?: boolean
}

export function SimpleTable<T>({
  data,
  columns,
  loading = false,
  error = null,
  onRetry,
  emptyMessage = "Không có dữ liệu",
  className = "",
  rowKey,
  onRowClick,
  hoverable = true,
  striped = false
}: SimpleTableProps<T>) {
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
            <button 
              className="mt-2 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              onClick={onRetry}
            >
              Thử lại
            </button>
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
    </div>
  )
}
