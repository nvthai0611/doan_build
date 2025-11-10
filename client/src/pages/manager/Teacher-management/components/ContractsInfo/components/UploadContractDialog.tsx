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
import { teacherContractsService } from "../../../../../../services/center-owner/teacher-management/teacher-contracts.service"

interface ContractUploadDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  teacherId: string
  onUploadSuccess: () => void
}

export function ContractUploadDialog({ isOpen, onOpenChange, teacherId, onUploadSuccess }: ContractUploadDialogProps) {
  const [fileName, setFileName] = useState("")
  const [contractType, setContractType] = useState("employment")
  const [customContractType, setCustomContractType] = useState("")
  const [startDate, setStartDate] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [salaryPercent, setSalaryPercent] = useState("")
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

    if (!startDate) {
      alert("Vui lòng nhập ngày bắt đầu")
      return
    }

    if (!expiryDate) {
      alert("Vui lòng nhập ngày hết hạn")
      return
    }
    
    if (contractType === "other" && !customContractType.trim()) {
      alert("Vui lòng nhập loại hợp đồng")
      return
    }

    if (!salaryPercent || isNaN(Number(salaryPercent))) {
      alert("Vui lòng nhập % lương hợp lệ")
      return
    }

    const percentValue = Number(salaryPercent)
    if (percentValue < 0 || percentValue > 100) {
      alert("% lương phải từ 0 đến 100")
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('file', file as Blob)
      formData.append('contractType', contractType === "other" ? customContractType : contractType)
      formData.append('startDate', startDate)
      formData.append('expiryDate', expiryDate)
      formData.append('teacherSalaryPercent', salaryPercent)
      if (notes.trim()) {
        formData.append('notes', notes.trim())
      }

      await teacherContractsService.uploadContract(teacherId, formData)

      // Reset form
      setFileName("")
      setContractType("employment")
      setCustomContractType("")
      setStartDate("")
      setExpiryDate("")
      setSalaryPercent("")
      setNotes("")
      setFile(null)
      setPreviewUrl(null)

      // Close dialog and notify parent
      onOpenChange(false)
      onUploadSuccess()
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
            <DialogTitle>Tải lên hợp đồng cho giáo viên</DialogTitle>
            <DialogDescription>Thêm hợp đồng mới vào hồ sơ giáo viên</DialogDescription>
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
                    <SelectItem value="indefinite">Hợp đồng Vô Thời hạn</SelectItem>
                    <SelectItem value="one_year">Hợp đồng 1 năm</SelectItem>
                    <SelectItem value="two_years">Hợp đồng 2 năm</SelectItem>
                    <SelectItem value="three_months">Hợp đồng 3 tháng</SelectItem>
                    <SelectItem value="other">Khác (nhập tay)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {contractType === "other" && (
                <div className="space-y-2">
                  <Label htmlFor="customContractType">Nhập loại hợp đồng <span className="text-red-500">*</span></Label>
                  <Input
                    id="customContractType"
                    placeholder="Ví dụ: Hợp đồng cộng tác viên"
                    value={customContractType}
                    onChange={(e) => setCustomContractType(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày bắt đầu <span className="text-red-500">*</span></Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Ngày hết hạn <span className="text-red-500">*</span></Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  disabled={isSubmitting}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryPercent">% Lương giáo viên <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="salaryPercent"
                    type="number"
                    placeholder="Ví dụ: 70"
                    value={salaryPercent}
                    onChange={(e) => setSalaryPercent(e.target.value)}
                    disabled={isSubmitting}
                    min="0"
                    max="100"
                    step="0.01"
                    required
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Phần trăm lương giáo viên nhận được (từ 0 đến 100)
                </p>
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
