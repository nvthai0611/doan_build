import { useState, useCallback } from 'react'

export interface UsePaginationProps {
  initialPage?: number
  initialItemsPerPage?: number
  totalItems?: number
}

export interface UsePaginationReturn {
  currentPage: number
  itemsPerPage: number
  totalPages: number
  setCurrentPage: (page: number) => void
  setItemsPerPage: (itemsPerPage: number) => void
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  canGoNext: boolean
  canGoPrev: boolean
  getPageInfo: () => {
    startItem: number
    endItem: number
    totalItems: number
  }
}

export const usePagination = ({
  initialPage = 1,
  initialItemsPerPage = 10,
  totalItems = 0
}: UsePaginationProps = {}): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }, [totalPages])

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }, [currentPage, totalPages])

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }, [currentPage])

  const canGoNext = currentPage < totalPages
  const canGoPrev = currentPage > 1

  const getPageInfo = useCallback(() => {
    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)
    return {
      startItem,
      endItem,
      totalItems
    }
  }, [currentPage, itemsPerPage, totalItems])

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    setCurrentPage,
    setItemsPerPage,
    goToPage,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev,
    getPageInfo
  }
}
