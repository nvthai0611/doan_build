"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Upload, FileText, Check, X } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { ApiService } from "../../../../../../../../services/common"
import type { CreateContractUploadDto } from "../../../../../../../../services/center-owner/contract-upload/contract-upload.types"

interface ContractUploadDialogProps {
  studentId: string
  studentName?: string 
  parentId?: string 
  onSubmit: (data: CreateContractUploadDto) => Promise<void>
  isLoading?: boolean
}

export function ContractUploadDialog({ studentId, studentName, parentId, onSubmit, isLoading = false }: ContractUploadDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [note, setNote] = useState("")

  // Fetch subjects from database
  const { data: subjectsData, isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const response = await ApiService.get('/shared/public/classes/subjects')
      return response.data || []
    },
    staleTime: 3000, 
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      alert("Vui lòng chọn file")
      return
    }

    if (selectedSubjects.length === 0) {
      alert("Vui lòng chọn ít nhất 1 môn học")
      return
    }

    // Generate default note if empty
    const defaultNote = studentName 
      ? `Đơn xin học thêm (${studentName}) - (${selectedSubjects.length} môn học)`
      : `Đơn xin học thêm (${selectedSubjects.length} môn học)`
    
    const finalNote = note.trim() || defaultNote

    try {
      await onSubmit({
        parentId: parentId,
        contractType: "student_commitment",
        subjectIds: selectedSubjects,
        note: finalNote,
        applicationFile: selectedFile
      })
      
      // Reset form
      setOpen(false)
      setSelectedSubjects([])
      setSelectedFile(null)
      setNote("")
    } catch (error) {
      console.error("Error submitting contract:", error)
    }
  }

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId],
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File không được vượt quá 5MB")
      return
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      alert("Chỉ chấp nhận file PDF, JPG hoặc PNG")
      return
    }

    setSelectedFile(file)
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Đơn xin học thêm
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>📋</span>
            Đơn xin học thêm
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">

            {/* Subject Selection */}
            <div className="space-y-2">
              <Label>
                Các môn học muốn đăng ký <span className="text-red-500">*</span>
              </Label>
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                {subjectsLoading ? (
                  <p className="text-sm text-muted-foreground">Đang tải danh sách môn học...</p>
                ) : subjectsData && subjectsData.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {subjectsData.map((subject: any) => (
                      <div
                        key={subject.id}
                        onClick={() => toggleSubject(subject.id)}
                        className={`
                          flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all
                          ${selectedSubjects.includes(subject.id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                          }
                        `}
                      >
                        <div className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                          ${selectedSubjects.includes(subject.id)
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                          }
                        `}>
                          {selectedSubjects.includes(subject.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{subject.name}</p>                          
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Không có môn học nào</p>
                )}
              </div>
              <p className="text-xs text-gray-500">
                * Chọn ít nhất 1 môn học mà học sinh muốn đăng ký
              </p>
              {selectedSubjects.length > 0 && (
                <p className="text-xs text-green-600 font-medium">
                  ✓ Đã chọn {selectedSubjects.length} môn học
                </p>
              )}
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="applicationFile">Tải lên đơn xin học <span className="text-red-500">*</span></Label>
              <div className="space-y-3">
                {!selectedFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <Input
                      id="applicationFile"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="applicationFile"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Nhấn để chọn file
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, JPG, PNG (tối đa 5MB)
                        </p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-50 border-green-200">
                    <FileText className="w-8 h-8 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-green-700">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Tải lên đơn xin học thêm của học sinh. File sẽ được lưu vào hệ thống.
              </p>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
              <Input
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  studentName 
                    ? `Đơn xin học thêm (${studentName})-(${selectedSubjects.length} môn học)`
                    : `Đơn xin học thêm (${selectedSubjects.length} môn học)`
                }
              />
              <p className="text-xs text-gray-500">
                Nếu để trống, ghi chú mặc định sẽ là: "Đơn xin học thêm cho học sinh [Tên] ([Số] môn học)"
              </p>
            </div>
          </div>

          <Button type="submit" disabled={isLoading || !selectedFile || selectedSubjects.length === 0} className="w-full">
            {isLoading ? "Đang xử lý..." : "Gửi đơn xin học"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
