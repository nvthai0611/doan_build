"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { teacherContractsService, type TeacherContract } from "../../../../../services/center-owner/teacher-management/teacher-contracts.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, Download, Trash2, Eye, AlertCircle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import Loading from "../../../../../components/Loading/LoadingPage"

interface ContractsInfoTabProps {
  teacherId: string
}

export default function ContractsInfoTab({ teacherId }: ContractsInfoTabProps) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState<TeacherContract | null>(null)
  const queryClient = useQueryClient()

  // Fetch contracts
  const { data: contracts = [], isLoading, error } = useQuery<TeacherContract[]>({
    queryKey: ['teacher-contracts', teacherId],
    queryFn: () => teacherContractsService.getTeacherContracts(teacherId),
    enabled: !!teacherId,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (contractId: string) => 
      teacherContractsService.deleteContract(teacherId, contractId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-contracts', teacherId] })
      toast.success("Xóa hợp đồng thành công")
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể xóa hợp đồng")
    },
  })

  const handleDownload = async (contract: TeacherContract) => {
    try {
      toast.loading("Đang tải xuống...")
      
      const response = await fetch(contract.uploadedImageUrl, {
        mode: 'cors',
        credentials: 'omit'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = contract.uploadedImageName || contract.fileName || 'contract'
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100)
      
      toast.dismiss()
      toast.success("Tải xuống thành công")
    } catch (error) {
      console.error('Download error:', error)
      toast.dismiss()
      toast.error("Không thể tải xuống hợp đồng")
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "employment":
        return "Hợp đồng lao động"
      case "probation":
        return "Hợp đồng thử việc"
      case "renewal":
        return "Hợp đồng gia hạn"
      case "other":
        return "Khác"
      default:
        return type
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN")
  }

  if (isLoading) {
    return <Loading />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-500 text-center">Có lỗi xảy ra khi tải danh sách hợp đồng</p>
        </CardContent>
      </Card>
    )
  }

  if (contracts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hợp đồng của giáo viên</CardTitle>
          <CardDescription>Giáo viên chưa tải lên hợp đồng nào</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">Chưa có hợp đồng nào được tải lên</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <style>{`
        /* Hide scrollbar but keep scrolling */
        .contract-preview-scroll {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .contract-preview-scroll::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
      <Card>
        <CardHeader>
          <CardTitle>Hợp đồng của giáo viên</CardTitle>
          <CardDescription>Danh sách tất cả các hợp đồng đã được tải lên</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {contracts.map((contract: TeacherContract) => (
              <div
                key={contract.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-4 flex-1">
                  <Briefcase className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium truncate">{contract.uploadedImageName || contract.fileName}</h3>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 space-y-1">
                      <p>Loại: {getTypeLabel(contract.contractType || contract.type || "")}</p>
                      <p>Tải lên: {formatDate(contract.uploadedAt || contract.uploadDate || "")}</p>
                      {contract.expiryDate && <p>Hết hạn: {formatDate(contract.expiryDate)}</p>}
                      {contract.notes && <p className="text-xs italic">Ghi chú: {contract.notes}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      setSelectedContract(contract)
                      setPreviewOpen(true)
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Xem</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleDownload(contract)}
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Tải</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Xóa</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xóa hợp đồng?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn có chắc chắn muốn xóa "{contract.uploadedImageName || contract.fileName}"? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(contract.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Xóa
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>

          {/* Preview Dialog */}
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>{selectedContract?.uploadedImageName || "Xem trước hợp đồng"}</DialogTitle>
              </DialogHeader>
              <div className="relative w-full max-h-[calc(90vh-8rem)] overflow-auto rounded-lg border contract-preview-scroll">
                <img
                  src={selectedContract?.uploadedImageUrl}
                  alt={selectedContract?.uploadedImageName || "Contract preview"}
                  className="w-full h-auto object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </>
  )
}
