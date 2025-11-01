import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { DataTable, Column, PaginationConfig } from "../../../../../../components/common/Table/DataTable"

interface StudentTuitionTabProps {
  student: any
}

enum FeeStatus {
  Pending = "pending",
  PartiallyPaid = "partially_paid",
  Completed = "completed"
}

export const StudentTuitionTab: React.FC<StudentTuitionTabProps> = ({ student }) => {
  const feeRecords = student?.feeRecords || []
  const [expandedPayments, setExpandedPayments] = useState<Set<number>>(new Set())
  const [statusFilter, setStatusFilter] = useState<FeeStatus | "all">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Tính trạng thái hóa đơn
  const getFeeStatus = (fee: any): FeeStatus => {
    if ((fee.paidAmount || 0) === 0) return FeeStatus.Pending
    if ((fee.paidAmount || 0) >= fee.amount) return FeeStatus.Completed
    return FeeStatus.PartiallyPaid
  }

  // Filter theo status
  const filteredRecords = useMemo(() => {
    if (statusFilter === "all") return feeRecords
    return feeRecords.filter((fee: any) => getFeeStatus(fee) === statusFilter)
  }, [feeRecords, statusFilter])

  // Paging
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
  const pagedRecords = useMemo(
    () => filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredRecords, currentPage, itemsPerPage]
  )

  // Thống kê học phí
  const tuitionStats = useMemo(() => ({
    totalAmount: feeRecords.reduce((sum: number, fee: any) => sum + fee.amount, 0),
    paidAmount: feeRecords.reduce((sum: number, fee: any) => sum + (fee.paidAmount || 0), 0),
    partiallyPaidCount: feeRecords.filter((fee: any) => getFeeStatus(fee) === FeeStatus.PartiallyPaid).length,
    overdueCount: feeRecords.filter((fee: any) =>
      new Date(fee.dueDate) < new Date() && getFeeStatus(fee) !== FeeStatus.Completed
    ).length
  }), [feeRecords])

  // Table columns
  const columns: Column<any>[] = [
    {
      key: "feeStructure",
      header: "Khoản phí",
      render: (fee) => fee.feeStructure?.name || "",
      width: "180px"
    },
    {
      key: "createdAt",
      header: "Ngày tạo",
      render: (fee) => new Date(fee.createdAt).toLocaleDateString('vi-VN'),
      width: "200px"
    },
    {
      key: "amount",
      header: "Số tiền",
      render: (fee) => (
        <span className="font-medium text-foreground">
          {fee.amount.toLocaleString('vi-VN')}đ
        </span>
      ),
      align: "left",
      width: "120px"
    },
    // {
    //   key: "paidAmount",
    //   header: "Đã trả",
    //   render: (fee) => (
    //     <span className="font-medium text-green-600">
    //       {(fee.paidAmount || 0).toLocaleString('vi-VN')}đ
    //     </span>
    //   ),
    //   sortable: true,
    //   align: "right",
    //   width: "120px"
    // },
    // {
    //   key: "partiallyPaid",
    //   header: "Hóa đơn trả 1 phần",
    //   render: (fee) =>
    //     getFeeStatus(fee) === FeeStatus.PartiallyPaid ? (
    //       <Badge variant="secondary">Trả 1 phần</Badge>
    //     ) : (
    //       <span className="text-muted-foreground text-xs">-</span>
    //     ),
    //   width: "120px"
    // },
    {
      key: "dueDate",
      header: "Hạn đóng",
      render: (fee) => new Date(fee.dueDate).toLocaleDateString('vi-VN'),
      width: "120px"
    },
    {
  key: "status",
  header: "Trạng thái",
  render: (fee) => {
    const status = getFeeStatus(fee)
    const isOverdue = new Date(fee.dueDate) < new Date() && status !== FeeStatus.Completed
    let label = ""
    let variant: "default" | "secondary" | "destructive" = "default"
    let className = ""
    if (status === FeeStatus.Completed) {
      label = "Đã thanh toán"
      variant = "default"
      className = "bg-green-100 text-green-700 border-green-200"
    } else if (status === FeeStatus.PartiallyPaid) {
      label = "Trả 1 phần"
      variant = "secondary"
      className = ""
    } else {
      label = isOverdue ? "Quá hạn" : "Chưa thanh toán"
      variant = isOverdue ? "destructive" : "secondary"
      className = !isOverdue ? "bg-yellow-100 text-yellow-700 border-yellow-200" : ""
    }
    return <Badge className={className} variant={variant}>{label}</Badge>
  },
  width: "120px"
},
    // {
    //   key: "payments",
    //   header: "Lịch sử thanh toán",
    //   render: (fee, index) =>
    //     fee.payments && fee.payments.length > 0 ? (
    //       <div>
    //         <Button
    //           variant="ghost"
    //           size="sm"
    //           onClick={e => {
    //             e.stopPropagation()
    //             setExpandedPayments(prev => {
    //               const newSet = new Set(prev)
    //               if (newSet.has(index)) newSet.delete(index)
    //               else newSet.add(index)
    //               return newSet
    //             })
    //           }}
    //           className="h-6 px-2"
    //         >
    //           {expandedPayments.has(index) ? (
    //             <>
    //               <ChevronUp className="w-3 h-3 mr-1" />
    //               Ẩn
    //             </>
    //           ) : (
    //             <>
    //               <ChevronDown className="w-3 h-3 mr-1" />
    //               Xem
    //             </>
    //           )}
    //         </Button>
    //         {expandedPayments.has(index) && (
    //           <div className="space-y-1 bg-gray-50 dark:bg-gray-800/50 rounded p-3 mt-2">
    //             {fee.payments.map((payment: any, paymentIndex: number) => (
    //               <div key={paymentIndex} className="flex justify-between items-center text-sm py-1">
    //                 <div className="flex flex-col">
    //                   <span className="text-foreground">
    //                     {new Date(payment.paymentDate).toLocaleDateString('vi-VN')}
    //                   </span>
    //                   {payment.method && (
    //                     <span className="text-xs text-muted-foreground">
    //                       {payment.method}
    //                     </span>
    //                   )}
    //                 </div>
    //                 <div className="text-right">
    //                   <span className="text-green-600 font-medium">
    //                     +{payment.amount.toLocaleString('vi-VN')}đ
    //                   </span>
    //                   {payment.note && (
    //                     <p className="text-xs text-muted-foreground mt-1">
    //                       {payment.note}
    //                     </p>
    //                   )}
    //                 </div>
    //               </div>
    //             ))}
    //           </div>
    //         )}
    //       </div>
    //     ) : (
    //       <span className="text-muted-foreground text-xs">-</span>
    //     ),
    //   width: "160px"
    // }
  ]

  // Pagination config
  const paginationConfig: PaginationConfig = {
    currentPage,
    totalPages,
    totalItems: filteredRecords.length,
    itemsPerPage,
    onPageChange: (page) => setCurrentPage(page),
    onItemsPerPageChange: () => { },
    showItemsPerPage: false,
    showPageInfo: true
  }

  return (
    <div className="space-y-6">
      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {tuitionStats.totalAmount.toLocaleString('vi-VN')}đ
            </p>
            <p className="text-sm text-muted-foreground">Tổng học phí</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {tuitionStats.paidAmount.toLocaleString('vi-VN')}đ
            </p>
            <p className="text-sm text-muted-foreground">Đã thanh toán</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {tuitionStats.partiallyPaidCount}
            </p>
            <p className="text-sm text-muted-foreground">Hóa đơn trả 1 phần</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{tuitionStats.overdueCount}</p>
            <p className="text-sm text-muted-foreground">Quá hạn</p>
          </CardContent>
        </Card>
      </div>

      {/* Bộ lọc trạng thái */}
      <div className="flex gap-2 items-center px-2">
        <span className="text-sm font-medium">Lọc theo trạng thái:</span>
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => { setStatusFilter("all"); setCurrentPage(1) }}
        >
          Tất cả
        </Button>
        <Button
          variant={statusFilter === FeeStatus.Pending ? "default" : "outline"}
          size="sm"
          onClick={() => { setStatusFilter(FeeStatus.Pending); setCurrentPage(1) }}
        >
          Chưa thanh toán
        </Button>
        <Button
          variant={statusFilter === FeeStatus.PartiallyPaid ? "default" : "outline"}
          size="sm"
          onClick={() => { setStatusFilter(FeeStatus.PartiallyPaid); setCurrentPage(1) }}
        >
          Trả 1 phần
        </Button>
        <Button
          variant={statusFilter === FeeStatus.Completed ? "default" : "outline"}
          size="sm"
          onClick={() => { setStatusFilter(FeeStatus.Completed); setCurrentPage(1) }}
        >
          Đã thanh toán
        </Button>
      </div>

      {/* Chi tiết học phí */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Chi tiết học phí</h3>
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