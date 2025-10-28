"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload } from "lucide-react"
import { Contract } from "../ContractsManage"
import { contractsService } from "../../../../services/teacher/contracts-management/contracts.service"


interface ContractUploadDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onAddContract: (contract: Contract) => void
}

export function ContractUploadDialog({ isOpen, onOpenChange, onAddContract }: ContractUploadDialogProps) {
  const [fileName, setFileName] = useState("")
  const [contractType, setContractType] = useState("employment")
  const [expiryDate, setExpiryDate] = useState("")
  const [notes, setNotes] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      alert("Vui lòng chọn file hợp đồng")
      return
    }

    if (!expiryDate) {
      alert("Vui lòng nhập ngày hết hạn")
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('file', file as Blob)
      formData.append('contractType', contractType)
      formData.append('expiryDate', expiryDate)
      if (notes.trim()) {
        formData.append('notes', notes.trim())
      }

      const res: any = await contractsService.upload(formData)
      const created = res.data || res

      // Map to local contract shape expected by parent (best-effort)
      const newContract: any = {
        id: created.id,
        uploadedImageName: created.uploadedImageName,
        fileName: created.uploadedImageName,
        uploadedAt: created.uploadedAt,
        uploadDate: created.uploadedAt,
        uploadedImageUrl: created.uploadedImageUrl,
        contractType: created.contractType,
        type: created.contractType,
        expiryDate: created.expiryDate || expiryDate || null,
        fileSize: undefined,
        notes: created.notes || notes || null,
         status: created.status || 'active',
        url: created.uploadedImageUrl,
      }

      onAddContract(newContract)

      // Reset form
      setFileName("")
      setContractType("employment")
      setExpiryDate("")
      setNotes("")
      setFile(null)
      setPreviewUrl(null)
      
      // Close dialog
      onOpenChange(false)
    } catch (e) {
      console.error('Upload failed', e)
      alert('Không thể tải lên hợp đồng')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <style>{`        
        .contract-upload-dialog-content {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .contract-upload-dialog-content::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Tải lên hợp đồng mới</DialogTitle>
            <DialogDescription>Thêm hợp đồng mới vào hệ thống quản lý của bạn</DialogDescription>
          </DialogHeader>

          <div className="max-h-[calc(90vh-10rem)] overflow-auto contract-upload-dialog-content">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
            <Label htmlFor="fileName">Tên tệp hợp đồng</Label>
            <Input
              id="fileName"
              placeholder="Ví dụ: Hợp đồng lao động 2024.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              disabled={isSubmitting}
            />
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] || null
                setFile(f)
                if (f && !fileName) setFileName(f.name)
                
                // Create preview URL
                if (f) {
                  // Revoke old preview URL to avoid memory leaks
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl)
                  }
                  const url = URL.createObjectURL(f)
                  setPreviewUrl(url)
                } else {
                  setPreviewUrl(null)
                }
              }}
              className="mt-2"
            />
          </div>

          {/* Preview Section */}
          {previewUrl && (
            <div className="space-y-2">
              <Label>Xem trước</Label>
              <div className="border rounded-lg p-2 max-h-[300px] overflow-auto contract-upload-preview">
                {file?.type.startsWith('image/') ? (
                  <img
                    src={previewUrl}
                    alt="Contract preview"
                    className="w-full h-auto object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center p-8 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">
                      PDF được chọn: {file?.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="contractType">Loại hợp đồng</Label>
            <Select value={contractType} onValueChange={setContractType} disabled={isSubmitting}>
              <SelectTrigger id="contractType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employment">Hợp đồng lao động</SelectItem>
                <SelectItem value="probation">Hợp đồng thử việc</SelectItem>
                <SelectItem value="renewal">Hợp đồng gia hạn</SelectItem>
                <SelectItem value="other">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Ngày hết hạn <span className="text-red-500">*</span></Label>
            <Input
              id="expiryDate"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              disabled={isSubmitting}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
            <Textarea
              id="notes"
              placeholder="Thêm ghi chú về hợp đồng này..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  <Upload className="w-4 h-4" />
                  {isSubmitting ? "Đang tải..." : "Tải lên"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
      </>
    )
  }
