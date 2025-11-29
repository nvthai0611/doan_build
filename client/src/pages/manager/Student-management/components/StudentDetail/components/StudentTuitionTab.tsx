import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, X } from "lucide-react"
import { DataTable, Column, PaginationConfig } from "../../../../../../components/common/Table/DataTable"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  paidAmount: number
  createdAt: string
  dueDate: string
  classId: string
  feeStructure?: {
    name: string
  }
}

interface StudentTuitionTabProps {
  student: {
    feeRecords?: FeeRecord[]
    enrollments?: Enrollment[]
  }
}

enum FeeStatus {
  Pending = "pending",
  PartiallyPaid = "partially_paid",
  Completed = "completed",
}

const ITEMS_PER_PAGE = 10

export const StudentTuitionTab: React.FC<StudentTuitionTabProps> = ({ student }) => {
  const feeRecords = student?.feeRecords || []
  const enrollments = student?.enrollments || []
  
  // State management
  const [statusFilter, setStatusFilter] = useState<FeeStatus | "all">("all")
  const [month, setMonth] = useState("")
  const [classFilter, setClassFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)

  /**
   * Tạo Map classId -> Class từ enrollments để lookup nhanh
   */
  const classMap = useMemo(() => {
    const map = new Map<string, Class>()
    
    const arrayFeeRecordsClassIds = feeRecords.map(fee => fee.classId)
    console.log(arrayFeeRecordsClassIds);
    
    const arrayEnrollmentsClassIds = enrollments.map(enrollment => enrollment.classId)
    console.log(arrayEnrollmentsClassIds);
    const filterClassIds = arrayEnrollmentsClassIds.filter(classId =>{
      if(arrayFeeRecordsClassIds.includes(classId)){
        return classId   
      }
    })

    enrollments.forEach((enrollment) => {
      if (filterClassIds.includes(enrollment.classId)) {
        map.set(enrollment.classId, enrollment.class)
      }
    })
    
    return map
  }, [enrollments])
  console.log(feeRecords);
  console.log(enrollments);
  console.log(classMap);
  
  
  
  /**
   * Lấy danh sách các lớp từ enrollments (chỉ lấy lớp có status !== 'deleted')
   */
  const availableClasses = useMemo(() => {
    return Array.from(classMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name, 'vi')
    )
  }, [classMap])
  console.log(feeRecords);
  
  /**
   * Tính trạng thái thanh toán của hóa đơn
   */
  const getFeeStatus = (fee: FeeRecord): FeeStatus => {
    const paidAmount = fee.paidAmount || 0
    
    if (paidAmount === 0) return FeeStatus.Pending
    if (paidAmount >= fee.amount) return FeeStatus.Completed
    return FeeStatus.PartiallyPaid
  }

  /**
   * Kiểm tra hóa đơn có quá hạn không
   */
  const isOverdue = (fee: FeeRecord): boolean => {
    const dueDate = new Date(fee.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return dueDate < today && getFeeStatus(fee) !== FeeStatus.Completed
  }

  /**
   * Filter records theo các điều kiện
   */
  const filteredRecords = useMemo(() => {
    let filtered = feeRecords
    
    // // Bỏ qua fee records của lớp đã deleted
    // filtered = filtered.filter((fee) => {
    //   const classInfo = classMap.get(fee.classId)
    //   return classInfo && classInfo.status !== 'deleted'
    // })
    
    // Filter theo status
    if (statusFilter !== "all") {
      filtered = filtered.filter((fee) => getFeeStatus(fee) === statusFilter)
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
  }, [feeRecords, classMap, statusFilter, month, classFilter])

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
   * Thống kê học phí (dựa trên dữ liệu đã lọc)
   */
  const tuitionStats = useMemo(() => {
    const stats = {
      totalAmount: 0,
      paidAmount: 0,
      pendingCount: 0,
      partiallyPaidCount: 0,
      overdueCount: 0
    }

    filteredRecords.forEach((fee) => {
      const status = getFeeStatus(fee)
      
      stats.totalAmount += fee.amount
      stats.paidAmount += fee.paidAmount || 0
      
      if (status === FeeStatus.Pending) stats.pendingCount++
      if (status === FeeStatus.PartiallyPaid) stats.partiallyPaidCount++
      if (isOverdue(fee)) stats.overdueCount++
    })

    return stats
  }, [filteredRecords])

  /**
   * Handle filter change với reset page
   */
  const handleFilterChange = (type: 'status' | 'class', value: string) => {
    setCurrentPage(1)
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
          {formatCurrency(fee.amount)}
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
        
        if (status === FeeStatus.Completed) {
          label = "Đã thanh toán"
          className = "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-100"
        } else if (status === FeeStatus.PartiallyPaid) {
          label = "Trả 1 phần"
          variant = "secondary"
        } else {
          label = overdue ? "Quá hạn" : "Chưa thanh toán"
          variant = overdue ? "destructive" : "secondary"
          if (!overdue) {
            className = "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100"
          }
        }
        
        return <Badge className={className} variant={variant}>{label}</Badge>
      },
      width: "140px"
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
      <div className={
        tuitionStats.partiallyPaidCount > 0
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      }>
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
        
        {tuitionStats.partiallyPaidCount > 0 && (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {tuitionStats.partiallyPaidCount}
              </p>
              <p className="text-sm text-muted-foreground">Hóa đơn trả 1 phần</p>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {tuitionStats.pendingCount}
            </p>
            <p className="text-sm text-muted-foreground">Chưa thanh toán</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {tuitionStats.overdueCount}
            </p>
            <p className="text-sm text-muted-foreground">Quá hạn</p>
          </CardContent>
        </Card>
      </div>

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
              Chưa thanh toán
            </Button>
            {tuitionStats.partiallyPaidCount > 0 && (
              <Button
                variant={statusFilter === FeeStatus.PartiallyPaid ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('status', FeeStatus.PartiallyPaid)}
              >
                Trả 1 phần
              </Button>
            )}
            <Button
              variant={statusFilter === FeeStatus.Completed ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange('status', FeeStatus.Completed)}
            >
              Đã thanh toán
            </Button>
          </div>

          {/* Lọc theo tháng và lớp */}
          <div className="flex gap-4 items-end flex-wrap">
            {/* Filter tháng */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-1">
                Tháng
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                <Input
                  type="month"
                  value={month}
                  onChange={(e) => {
                    setMonth(e.target.value)
                    setCurrentPage(1)
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
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 z-10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Filter lớp */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-1">
                Lớp
              </label>
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

            {/* Nút reset filter */}
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
          <h3 className="text-lg font-semibold mb-4">Chi tiết học phí</h3>
          <DataTable
            data={pagedRecords}
            columns={columns}
            emptyMessage="Chưa có thông tin học phí"
            className="rounded-none border-0"
            enableSearch={false}
            striped
            pagination={paginationConfig}
          />
        </CardContent>
      </Card>
    </div>
  )
}