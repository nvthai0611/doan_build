"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FileText, Trash2, ExternalLink } from "lucide-react"
import { useContractUploads } from "@/hooks/use-contract-uploads"
import { ContractUploadDialog } from "./Dialog/UploadStudentCommitment"
import { useQuery } from "@tanstack/react-query"

interface StudentCommitmentTabProps {
  studentId: string
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

export function StudentCommitmentTab({ studentId }: StudentCommitmentTabProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

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
      const response = await fetch('/api/shared/public/classes/subjects')
      const data = await response.json()
      return data.data || []
    },
    staleTime: 300000,
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
    window.open(url, '_blank')
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Đang tải...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Đơn xin học thêm</h3>
        <ContractUploadDialog
          studentId={studentId}
          onSubmit={handleUpload}
          isLoading={isUploading}
        />
      </div>

      {contractUploads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Chưa có đơn xin học nào được tải lên</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên file</TableHead>
                    <TableHead>Môn học</TableHead>
                    <TableHead>Ngày upload</TableHead>
                    <TableHead>Hết hạn</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ghi chú</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contractUploads.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate max-w-[200px]" title={contract.uploadedImageName}>
                            {contract.uploadedImageName || "Đơn xin học thêm"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {contract.subjectIds && contract.subjectIds.length > 0 ? (
                            contract.subjectIds.map((subjectId) => (
                              <Badge key={subjectId} variant="secondary" className="text-xs">
                                {getSubjectName(subjectId)}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(contract.uploadedAt).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell className="text-sm">
                        {contract.expiredAt ? new Date(contract.expiredAt).toLocaleDateString("vi-VN") : "—"}
                      </TableCell>
                      <TableCell>{getStatusBadge(contract.status)}</TableCell>
                      <TableCell className="text-sm max-w-xs">
                        <div className="truncate" title={contract.note || ""}>
                          {contract.note || "—"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(contract.uploadedImageUrl)}
                            title="Xem/Tải xuống"
                          >
                            <ExternalLink className="w-4 h-4" />
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

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
