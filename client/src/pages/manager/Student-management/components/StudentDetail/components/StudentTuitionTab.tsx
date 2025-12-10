import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, X, RefreshCcw, AlertCircle } from "lucide-react"
import { DataTable, Column, PaginationConfig } from "../../../../../../components/common/Table/DataTable"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { centerOwnerStudentService } from "@/services/center-owner/student-management/student.service"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"

interface Class {
  id: string
  name: string
  classCode: string
  status: string
}

interface Enrollment {
  id: string
  classId: string
  status: string
  class: Class
}

interface FeeRecord {
  id: string
  amount: number
  totalAmount: number
  paidAmount: number
  createdAt: string
  dueDate: string
  classId: string
  status: string
  feeStructure?: {
    name: string
  }
}

interface StudentTuitionTabProps {
  student: {
    id: string
    feeRecords?: FeeRecord[]
    enrollments?: Enrollment[]
  }
  onRefresh?: () => void
}

enum FeeStatus {
  Pending = "pending",
  Calculated = "calculated",
  Processing = "processing",
  PartiallyPaid = "partially_paid",
  Completed = "paid",
  Cancelled = "cancelled",
  Overdue = "overdue",
}

const ITEMS_PER_PAGE = 10

export const StudentTuitionTab: React.FC<StudentTuitionTabProps> = ({ student, onRefresh }) => {
  const feeRecords = student?.feeRecords || []
  const enrollments = student?.enrollments || []
  
  // State management
  const [statusFilter, setStatusFilter] = useState<FeeStatus | "all">("all")
  const [month, setMonth] = useState("")
  const [classFilter, setClassFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  
  // Checkbox states
  const [selectedFeeIds, setSelectedFeeIds] = useState<string[]>([])
  const [isRecalculating, setIsRecalculating] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [recalculationPreview, setRecalculationPreview] = useState<any>(null)

  /**
   * Tạo Map classId -> Class từ enrollments để lookup nhanh
   */
  const classMap = useMemo(() => {
    const map = new Map<string, Class>()
    
    const arrayFeeRecordsClassIds = feeRecords.map(fee => fee.classId)
    const arrayEnrollmentsClassIds = enrollments.map(enrollment => enrollment.classId)
    const filterClassIds = arrayEnrollmentsClassIds.filter(classId => 
      arrayFeeRecordsClassIds.includes(classId)
    )

    enrollments.forEach((enrollment) => {
      if (filterClassIds.includes(enrollment.classId)) {
        map.set(enrollment.classId, enrollment.class)
      }
    })
    
    return map
  }, [enrollments, feeRecords])
  
  /**
   * Lấy danh sách các lớp từ enrollments
   */
  const availableClasses = useMemo(() => {
    return Array.from(classMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name, 'vi')
    )
  }, [classMap])
  
  /**
   * Tính trạng thái thanh toán của hóa đơn
   */
  const getFeeStatus = (fee: FeeRecord): FeeStatus => {
    // Ưu tiên trạng thái từ server
    if (fee.status === 'cancelled') return FeeStatus.Cancelled
    if (fee.status === 'paid' || fee.status === 'completed') return FeeStatus.Completed
    if (fee.status === 'processing') return FeeStatus.Processing
    if (fee.status === 'overdue') return FeeStatus.Overdue
    if (fee.status === 'calculated') return FeeStatus.Calculated
    
    const paidAmount = fee.paidAmount || 0
    const totalAmount = fee.amount
    
    // Kiểm tra theo số tiền đã thanh toán
    if (paidAmount === 0) return FeeStatus.Pending
    if (paidAmount >= totalAmount) return FeeStatus.Completed
    if (paidAmount > 0 && paidAmount < totalAmount) return FeeStatus.PartiallyPaid
    
    return FeeStatus.Pending
  }

  /**
   * Kiểm tra hóa đơn có quá hạn không
   */
  const isOverdue = (fee: FeeRecord): boolean => {
    const status = getFeeStatus(fee)
    
    // Chỉ kiểm tra overdue cho pending, calculated và partially paid
    if (status !== FeeStatus.Pending && 
        status !== FeeStatus.Calculated && 
        status !== FeeStatus.PartiallyPaid) {
      return false
    }
    
    const dueDate = new Date(fee.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)
    
    return dueDate < today
  }

  /**
   * Kiểm tra hóa đơn có thể tính toán lại không
   */
  const canRecalculate = (fee: FeeRecord): boolean => {
    const status = getFeeStatus(fee)
    // Chỉ cho phép tính lại: pending, calculated, cancelled, hoặc overdue
    return status === FeeStatus.Pending || 
           status === FeeStatus.Calculated ||
           status === FeeStatus.Cancelled ||
           isOverdue(fee)
  }

  /**
   * Filter records theo các điều kiện
   */
  const filteredRecords = useMemo(() => {
    let filtered = feeRecords
    
    // Filter theo status
    if (statusFilter !== "all") {
      filtered = filtered.filter((fee) => {
        const feeStatus = getFeeStatus(fee)
        
        // Xử lý riêng cho Overdue
        if (statusFilter === FeeStatus.Overdue) {
          return isOverdue(fee)
        }
        
        // Các trạng thái khác
        return feeStatus === statusFilter
      })
    }
    
    // Filter theo tháng
    if (month) {
      filtered = filtered.filter((fee) => {
        const feeDate = new Date(fee.createdAt)
        const feeMonth = `${feeDate.getFullYear()}-${String(feeDate.getMonth() + 1).padStart(2, '0')}`
        return feeMonth === month
      })
    }
    
    // Filter theo lớp
    if (classFilter !== "all") {
      filtered = filtered.filter((fee) => fee.classId === classFilter)
    }
    
    return filtered
  }, [feeRecords, statusFilter, month, classFilter])

  /**
   * Lấy danh sách các hóa đơn có thể chọn để tính toán lại
   */
  const recalculatableFees = useMemo(() => {
    return filteredRecords.filter(fee => canRecalculate(fee))
  }, [filteredRecords])

  /**
   * Pagination
   */
  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE)
  const pagedRecords = useMemo(
    () => filteredRecords.slice(
      (currentPage - 1) * ITEMS_PER_PAGE, 
      currentPage * ITEMS_PER_PAGE
    ),
    [filteredRecords, currentPage]
  )

  /**
   * Thống kê học phí
   */
  const tuitionStats = useMemo(() => {
    const stats = {
      totalAmount: 0,
      paidAmount: 0,
      pendingCount: 0,
      calculatedCount: 0,
      processingCount: 0,
      partiallyPaidCount: 0,
      completedCount: 0,
      overdueCount: 0,
      cancelledCount: 0
    }

    // Tính toán dựa trên TOÀN BỘ feeRecords
    feeRecords.forEach((fee) => {
      const status = getFeeStatus(fee)
      const overdue = isOverdue(fee)
      
      // Chỉ tính tổng tiền cho các hóa đơn không bị hủy
      if (status !== FeeStatus.Cancelled) {
        stats.totalAmount += fee.totalAmount       
      }

      if(status === FeeStatus.Completed) {
        stats.paidAmount += fee.totalAmount
      }
      
      // Đếm số lượng theo từng trạng thái
      if (status === FeeStatus.Pending && !overdue) stats.pendingCount++
      if (status === FeeStatus.Calculated && !overdue) stats.calculatedCount++
      if (status === FeeStatus.Processing) stats.processingCount++
      if (status === FeeStatus.PartiallyPaid && !overdue) stats.partiallyPaidCount++
      if (status === FeeStatus.Completed) stats.completedCount++
      if (status === FeeStatus.Cancelled) stats.cancelledCount++
      
      // Đếm overdue (có thể là pending, calculated hoặc partially_paid)
      if (overdue) stats.overdueCount++
    })

    return stats
  }, [feeRecords])

  /**
   * Handle filter change với reset page
   */
  const handleFilterChange = (type: 'status' | 'class', value: string) => {
    setCurrentPage(1)
    setSelectedFeeIds([])
    if (type === 'status') {
      setStatusFilter(value as FeeStatus | "all")
    } else if (type === 'class') {
      setClassFilter(value)
    }
  }

  /**
   * Reset all filters
   */
  const handleResetFilters = () => {
    setStatusFilter("all")
    setMonth('')
    setClassFilter("all")
    setCurrentPage(1)
    setSelectedFeeIds([])
  }

  /**
   * Handle selection change
   */
  const handleSelectionChange = (selectedIds: string[]) => {
    const validIds = selectedIds.filter(id => {
      const fee = feeRecords.find(f => f.id === id)
      return fee && canRecalculate(fee)
    })
    setSelectedFeeIds(validIds)
  }

  /**
   * Xử lý tính toán lại
   */
  const handleRecalculate = async () => {
    if (selectedFeeIds.length === 0) {
      toast.error("Chưa chọn hóa đơn. Vui lòng chọn ít nhất một hóa đơn để tính toán lại.")
      return
    }
    setShowConfirmDialog(true)
  }

  /**
   * Confirm và thực hiện tính toán lại
   */
  const confirmRecalculate = async () => {
    setIsRecalculating(true)
    try {
      const response = await centerOwnerStudentService.reCreateBillingForStudent(
        student.id,
        selectedFeeIds
      )

      toast.success(response.message || "Hóa đơn đã được tính toán lại dựa trên điểm danh thực tế")

      setSelectedFeeIds([])
      setShowConfirmDialog(false)
      setRecalculationPreview(response.data)
      
      if (onRefresh) {
        onRefresh()
      }
    } catch (error: any) {
      console.error('Error recalculating billing:', error)
      toast.error(error.message || "Không thể tính toán lại hóa đơn. Vui lòng thử lại sau.")
    } finally {
      setIsRecalculating(false)
    }
  }

  /**
   * Format currency
   */
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('vi-VN') + 'đ'
  }

  /**
   * Format date
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  /**
   * Get selected fees info
   */
  const selectedFeesInfo = useMemo(() => {
    const selectedFees = feeRecords.filter(fee => selectedFeeIds.includes(fee.id))
    const totalAmount = selectedFees.reduce((sum, fee) => sum + fee.amount, 0)
    return {
      count: selectedFees.length,
      totalAmount,
      fees: selectedFees
    }
  }, [selectedFeeIds, feeRecords])

  // Table columns
  const columns: Column<FeeRecord>[] = [
    {
      key: "feeStructure",
      header: "Khoản phí",
      render: (fee) => fee.feeStructure?.name || "N/A",
      width: "180px"
    },
    {
      key: "class",
      header: "Lớp",
      render: (fee) => {
        const classInfo = classMap.get(fee.classId)
        if (!classInfo) return "N/A"
        return `${classInfo.name} (${classInfo.classCode})`
      },
      width: "150px"
    },
    {
      key: "createdAt",
      header: "Ngày tạo",
      render: (fee) => formatDate(fee.createdAt),
      width: "120px"
    },
    {
      key: "amount",
      header: "Số tiền",
      render: (fee) => (
        <span className="font-medium text-foreground">
          {formatCurrency(fee.totalAmount)}
        </span>
      ),
      align: "left",
      width: "120px"
    },
    {
      key: "dueDate",
      header: "Hạn đóng",
      render: (fee) => formatDate(fee.dueDate),
      width: "120px"
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (fee) => {
        const status = getFeeStatus(fee)
        const overdue = isOverdue(fee)
        
        let label = ""
        let variant: "default" | "secondary" | "destructive" = "default"
        let className = ""
        
        if (status === FeeStatus.Cancelled) {
          label = "Đã hủy"
          className = "bg-red-300 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300"
        } else if (status === FeeStatus.Completed) {
          label = "Đã thanh toán"
          className = "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-100"
        } else if (status === FeeStatus.Processing) {
          label = "Đang xử lý"
          className = "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-100"
        } else if (status === FeeStatus.Calculated) {
          if (overdue) {
            label = "Đã tính toán (Quá hạn)"
            variant = "destructive"
          } else {
            label = "Đã tính toán"
            className = "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900 dark:text-cyan-100"
          }
        } else if (status === FeeStatus.PartiallyPaid) {
          if (overdue) {
            label = "Trả 1 phần (Quá hạn)"
            variant = "destructive"
          } else {
            label = "Trả 1 phần"
            className = "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-100"
          }
        } else {
          // Pending
          if (overdue) {
            label = "Quá hạn"
            variant = "destructive"
          } else {
            label = "Chưa thanh toán"
            className = "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100"
          }
        }
        
        return <Badge className={className} variant={variant}>{label}</Badge>
      },
      width: "180px"
    },
  ]

  // Pagination config
  const paginationConfig: PaginationConfig = {
    currentPage,
    totalPages,
    totalItems: filteredRecords.length,
    itemsPerPage: ITEMS_PER_PAGE,
    onPageChange: setCurrentPage,
    onItemsPerPageChange: () => {},
    showItemsPerPage: false,
    showPageInfo: true
  }

  const hasActiveFilters = statusFilter !== "all" || month !== "" || classFilter !== "all"
  
  return (
    <div className="space-y-6">
      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(tuitionStats.totalAmount)}
            </p>
            <p className="text-sm text-muted-foreground">Tổng học phí</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(tuitionStats.paidAmount)}
            </p>
            <p className="text-sm text-muted-foreground">Đã thanh toán</p>
          </CardContent>
        </Card>
        
        {/* <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {tuitionStats.pendingCount}
            </p>
            <p className="text-sm text-muted-foreground">Chưa thanh toán</p>
          </CardContent>
        </Card>

        {tuitionStats.calculatedCount > 0 && (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-cyan-600">
                {tuitionStats.calculatedCount}
              </p>
              <p className="text-sm text-muted-foreground">Đã tính toán</p>
            </CardContent>
          </Card>
        )}
        
        {tuitionStats.processingCount > 0 && (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {tuitionStats.processingCount}
              </p>
              <p className="text-sm text-muted-foreground">Đang xử lý</p>
            </CardContent>
          </Card>
        )}
        
        {tuitionStats.partiallyPaidCount > 0 && (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">
                {tuitionStats.partiallyPaidCount}
              </p>
              <p className="text-sm text-muted-foreground">Trả 1 phần</p>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {tuitionStats.overdueCount}
            </p>
            <p className="text-sm text-muted-foreground">Quá hạn</p>
          </CardContent>
        </Card>

        {tuitionStats.cancelledCount > 0 && (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-600">
                {tuitionStats.cancelledCount}
              </p>
              <p className="text-sm text-muted-foreground">Đã hủy</p>
            </CardContent>
          </Card>
        )} */}
      </div>

      {/* Alert hiển thị số hóa đơn đã chọn */}
      {selectedFeeIds.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Đã chọn {selectedFeesInfo.count} hóa đơn</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Tổng số tiền: <strong>{formatCurrency(selectedFeesInfo.totalAmount)}</strong></span>
            <Button
              size="sm"
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="ml-4"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              {isRecalculating ? "Đang tính..." : "Tính toán lại"}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Bộ lọc */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Lọc theo trạng thái */}
          <div className="flex gap-2 items-center flex-wrap">
            <span className="text-sm font-medium">Trạng thái:</span>
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange('status', "all")}
            >
              Tất cả
            </Button>
            <Button
              variant={statusFilter === FeeStatus.Pending ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange('status', FeeStatus.Pending)}
            >
              Chưa thanh toán ({tuitionStats.pendingCount})
            </Button>
            {tuitionStats.calculatedCount > 0 && (
              <Button
                variant={statusFilter === FeeStatus.Calculated ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('status', FeeStatus.Calculated)}
              >
                Đã tính toán ({tuitionStats.calculatedCount})
              </Button>
            )}
            {tuitionStats.processingCount > 0 && (
              <Button
                variant={statusFilter === FeeStatus.Processing ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('status', FeeStatus.Processing)}
              >
                Đang xử lý ({tuitionStats.processingCount})
              </Button>
            )}
            {tuitionStats.partiallyPaidCount > 0 && (
              <Button
                variant={statusFilter === FeeStatus.PartiallyPaid ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('status', FeeStatus.PartiallyPaid)}
              >
                Trả 1 phần ({tuitionStats.partiallyPaidCount})
              </Button>
            )}
            {tuitionStats.overdueCount > 0 && (
              <Button
                variant={statusFilter === FeeStatus.Overdue ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('status', FeeStatus.Overdue)}
              >
                Quá hạn ({tuitionStats.overdueCount})
              </Button>
            )}
            <Button
              variant={statusFilter === FeeStatus.Completed ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange('status', FeeStatus.Completed)}
            >
              Đã thanh toán ({tuitionStats.completedCount})
            </Button>
            {tuitionStats.cancelledCount > 0 && (
              <Button
                variant={statusFilter === FeeStatus.Cancelled ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('status', FeeStatus.Cancelled)}
              >
                Đã hủy ({tuitionStats.cancelledCount})
              </Button>
            )}
          </div>

          {/* Lọc theo tháng và lớp */}
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-1">Tháng</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                <Input
                  type="month"
                  value={month}
                  onChange={(e) => {
                    setMonth(e.target.value)
                    setCurrentPage(1)
                    setSelectedFeeIds([])
                  }}
                  className="pl-10 pr-10"
                  max={new Date().toISOString().slice(0, 7)}
                />
                {month && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMonth('')
                      setCurrentPage(1)
                      setSelectedFeeIds([])
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 z-10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-1">Lớp</label>
              <Select 
                value={classFilter} 
                onValueChange={(value) => handleFilterChange('class', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lớp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {availableClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} ({cls.classCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="shrink-0"
              >
                <X className="w-4 h-4 mr-1" />
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chi tiết học phí */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Chi tiết học phí
            {recalculatableFees.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({recalculatableFees.length} hóa đơn có thể tính toán lại)
              </span>
            )}
          </h3>
          <DataTable
            data={pagedRecords}
            columns={columns}
            emptyMessage="Chưa có thông tin học phí"
            className="rounded-none border-0"
            enableSearch={false}
            striped
            pagination={paginationConfig}
            enableCheckbox={true}
            selectedItems={selectedFeeIds}
            onSelectionChange={handleSelectionChange}
            getItemId={(fee) => fee.id}
            allData={recalculatableFees}
          />
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận tính toán lại hóa đơn</DialogTitle>
            <DialogDescription>
              Bạn đang chuẩn bị tính toán lại <strong>{selectedFeesInfo.count}</strong> hóa đơn 
              với tổng số tiền <strong>{formatCurrency(selectedFeesInfo.totalAmount)}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Danh sách hóa đơn sẽ được tính toán lại:</p>
            <div className="max-h-40 overflow-y-auto space-y-1 border rounded-md p-2">
              {selectedFeesInfo.fees.map((fee) => {
                const classInfo = classMap.get(fee.classId)
                return (
                  <div key={fee.id} className="text-sm flex justify-between py-1">
                    <span>{classInfo?.name || 'N/A'}</span>
                    <span className="font-medium">{formatCurrency(fee.amount)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lưu ý</AlertTitle>
            <AlertDescription>
              • Hóa đơn cũ sẽ bị hủy<br/>
              • Hóa đơn mới sẽ được tạo dựa trên điểm danh thực tế<br/>
              • Phụ huynh sẽ nhận email thông báo về sự thay đổi
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isRecalculating}
            >
              Hủy
            </Button>
            <Button
              onClick={confirmRecalculate}
              disabled={isRecalculating}
            >
              {isRecalculating ? (
                <>
                  <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                  Đang tính toán...
                </>
              ) : (
                <>
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Xác nhận tính toán lại
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}