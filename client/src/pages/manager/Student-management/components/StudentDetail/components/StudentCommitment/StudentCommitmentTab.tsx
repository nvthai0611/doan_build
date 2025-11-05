"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FileText, Trash2, Eye, Search, X } from "lucide-react"
import { useContractUploads } from "../../../../../../../hooks/use-contract-uploads"
import { ContractUploadDialog } from "./Dialog/UploadStudentCommitment"
import { useQuery } from "@tanstack/react-query"
import { ApiService } from "../../../../../../../services/common"
import { DataTable, type Column } from "../../../../../../../components/common/Table/DataTable"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StudentCommitmentTabProps {
  studentId: string
  studentName?: string
  parentId?: string
}

const getStatusBadge = (status?: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
    case "expiring_soon":
      return <Badge className="bg-yellow-100 text-yellow-800">Sắp hết hạn</Badge>
    case "expired":
      return <Badge className="bg-red-100 text-red-800">Hết hạn</Badge>
    default:
      return <Badge>Không xác định</Badge>
  }
}

export function StudentCommitmentTab({ studentId, studentName, parentId }: StudentCommitmentTabProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired">("all")
  const [fileNameQuery, setFileNameQuery] = useState("")
  const [noteQuery, setNoteQuery] = useState("")

  const {
    contractUploads,
    isLoading,
    uploadContract,
    deleteContract,
    isUploading,
    isDeleting
  } = useContractUploads(studentId)

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const response = await ApiService.get("/shared/public/classes/subjects")
      return response.data || []
    },
    staleTime: 3000,
  })

  const getSubjectName = (subjectId: string) => {
    const subject = subjectsData?.find((s: any) => s.id === subjectId)
    return subject?.name || subject?.code || subjectId
  }

  const handleUpload = async (data: any) => {
    await uploadContract({ studentId, data })
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteContract(deleteId)
      setDeleteId(null)
    } catch (error) {
      console.error("Error deleting contract:", error)
    }
  }

  const handleDownload = (url: string) => {
    window.open(url, "_blank")
  }

  // Filter logic
  const filteredContracts = useMemo(() => {
    let items = contractUploads
    if (statusFilter !== "all") {
      items = items.filter((c: any) => c.status === statusFilter)
    }

    const nameQ = fileNameQuery.trim().toLowerCase()
    if (nameQ) {
      items = items.filter((c: any) => {
        const text = (c.uploadedImageName || "Đơn xin học thêm").toLowerCase()
        return text.includes(nameQ)
      })
    }

    const noteQ = noteQuery.trim().toLowerCase()
    if (noteQ) {
      items = items.filter((c: any) => {
        const text = (c.note || "").toLowerCase()
        return text.includes(noteQ)
      })
    }

    return items
  }, [contractUploads, statusFilter, fileNameQuery, noteQuery])

  // Pagination logic (uses filtered data)
  const totalItems = filteredContracts.length
  const totalPages = Math.ceil(Math.max(totalItems, 1) / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = filteredContracts.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = contractUploads.length
    const active = contractUploads.filter((c: any) => c.status === "active").length
    const expired = contractUploads.filter((c: any) => c.status === "expired").length

    return { total, active, expired }
  }, [contractUploads])

  // Define columns for DataTable
  const columns: Column<any>[] = [
    {
      key: "uploadedImageName",
      header: "Tên file",
      width: "25%",
      searchable: true,
      searchPlaceholder: "Tìm theo tên file...",

      render: (contract) => (
        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <span className="whitespace-normal break-words text-sm">
            {contract.uploadedImageName || "Đơn xin học thêm"}
          </span>
        </div>
      ),
    },
    {
      key: "subjectIds",
      header: "Môn học",
      render: (contract) => (
        <div className="flex flex-wrap gap-1">
          {contract.subjectIds && contract.subjectIds.length > 0 ? (
            contract.subjectIds.map((subjectId: string) => (
              <Badge key={subjectId} variant="secondary" className="text-xs">
                {getSubjectName(subjectId)}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </div>
      ),
    },
    {
      key: "uploadedAt",
      header: "Ngày upload",
      sortable: true,
      render: (contract) => (
        <span className="text-sm">
          {new Date(contract.uploadedAt).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      key: "expiredAt",
      header: "Hết hạn",
      sortable: true,
      render: (contract) => (
        <span className="text-sm">
          {contract.expiredAt ? new Date(contract.expiredAt).toLocaleDateString("vi-VN") : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      sortable: true,
      render: (contract) => getStatusBadge(contract.status),
    },
    {
      key: "note",
      header: "Ghi chú",
      searchable: true,
      searchPlaceholder: "Tìm theo ghi chú...",
      render: (contract) => (
        <div className="whitespace-normal break-words text-sm text-muted-foreground max-w-[200px] leading-relaxed">
          {contract.note || "—"}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      align: "right",
      render: (contract) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownload(contract.uploadedImageUrl)}
            title="Xem/Tải xuống"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteId(contract.id)}
            disabled={isDeleting}
            title="Xóa"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-2">
        <h3 className="text-lg font-semibold">Đơn xin học thêm</h3>
        <ContractUploadDialog
          studentId={studentId}
          studentName={studentName}
          parentId={parentId}
          onSubmit={handleUpload}
          isLoading={isUploading}
        />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tổng hợp đồng</p>
              <p className="text-3xl font-bold">{statistics.total}</p>
            </div>
            <FileText className="w-12 h-12 text-gray-400" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Đang hoạt động</p>
              <p className="text-3xl font-bold text-green-600">{statistics.active}</p>
            </div>
            <FileText className="w-12 h-12 text-green-400" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Đã hết hạn</p>
              <p className="text-3xl font-bold text-red-600">{statistics.expired}</p>
            </div>
            <FileText className="w-12 h-12 text-red-400" />
          </CardContent>
        </Card>
      </div>


      {/* Filters row outside the table */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <div className="flex-1 flex flex-col md:flex-row gap-3">
          <div className="relative md:w-64">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={fileNameQuery}
              onChange={(e) => { setFileNameQuery(e.target.value); setCurrentPage(1) }}
              placeholder="Tìm theo tên file..."
              className="pl-8"
            />
            {fileNameQuery && (
              <button
                type="button"
                onClick={() => { setFileNameQuery(""); setCurrentPage(1) }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear file name filter"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="relative md:w-64">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={noteQuery}
              onChange={(e) => { setNoteQuery(e.target.value); setCurrentPage(1) }}
              placeholder="Tìm theo ghi chú..."
              className="pl-8"
            />
            {noteQuery && (
              <button
                type="button"
                onClick={() => { setNoteQuery(""); setCurrentPage(1) }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear note filter"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Trạng thái:</span>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as any); setCurrentPage(1) }}>
              <SelectTrigger className="w-44 h-9">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="expired">Đã hết hạn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          {(fileNameQuery || noteQuery || statusFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setFileNameQuery(""); setNoteQuery(""); setStatusFilter("all"); setCurrentPage(1) }}
            >
              <X className="w-4 h-4 mr-1" /> Xóa lọc
            </Button>
          )}
        </div>
      </div>

      <DataTable
        data={paginatedData}
        columns={columns}
        loading={isLoading}
        emptyMessage="Chưa có đơn xin học nào được tải lên"
        rowKey="id"
        hoverable
        enableSearch={false}
        enableSort
        className="[&_td]:py-4"
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
          onPageChange: handlePageChange,
          onItemsPerPageChange: handleItemsPerPageChange,
          showItemsPerPage: true,
          showPageInfo: true,
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa đơn xin học?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Đơn xin học sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
