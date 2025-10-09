import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2,
  X
} from 'lucide-react'
import { toast } from 'sonner'

interface ExcelImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportSuccess?: () => void
  downloadTemplate: () => Promise<void>
  uploadFile: (file: File) => Promise<ImportResult>
}

interface ImportResult {
  successCount: number
  errorCount: number
  errors: ImportError[]
  warnings: ImportWarning[]
}

interface ImportError {
  row: number
  field: string
  message: string
  value?: string
}

interface ImportWarning {
  row: number
  field: string
  message: string
  value?: string
}

interface ParsedData {
  name: string
  email: string
  username: string
  phone: string
  gender: string
  birthDate: string
  role: string
  schoolName?: string
  schoolAddress?: string
  contractImage?: string
  notes?: string
}

export default function ExcelImportDialog({
  open,
  onOpenChange,
  onImportSuccess,
  downloadTemplate,
  uploadFile
}: ExcelImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [previewData, setPreviewData] = useState<ParsedData[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ]
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Chỉ được upload file Excel (.xlsx, .xls) hoặc CSV')
        return
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (selectedFile.size > maxSize) {
        toast.error('Kích thước file không được vượt quá 10MB')
        return
      }

      setFile(selectedFile)
      setImportResult(null)
      setPreviewData([])
      setShowPreview(false)
      
      // Parse file for preview
      parseFileForPreview(selectedFile)
    }
  }

  const parseFileForPreview = async (file: File) => {
    try {
      // This is a simplified preview - in real implementation, you'd use a library like xlsx
      // For now, we'll just show a placeholder
      setShowPreview(true)
      toast.success('File đã được chọn và sẵn sàng để import')
    } catch (error) {
      console.error('Error parsing file:', error)
      toast.error('Không thể đọc file Excel')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Vui lòng chọn file để upload')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const result = await uploadFile(file)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      setImportResult(result)

      if (result.successCount > 0) {
        toast.success(`Import thành công ${result.successCount} giáo viên`)
        if (onImportSuccess) {
          onImportSuccess()
        }
      }

      if (result.errorCount > 0) {
        toast.error(`Có ${result.errorCount} lỗi trong quá trình import`)
      }

    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Có lỗi xảy ra khi upload file')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDownloadTemplate = async () => {
    setIsDownloading(true)
    try {
      await downloadTemplate()
      toast.success('Đã tải xuống template Excel')
    } catch (error: any) {
      console.error('Download error:', error)
      toast.error(error.message || 'Có lỗi xảy ra khi tải template')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setImportResult(null)
    setPreviewData([])
    setShowPreview(false)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onOpenChange(false)
  }

  const getStatusIcon = (type: 'success' | 'error' | 'warning') => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (type: 'success' | 'error' | 'warning') => {
    switch (type) {
      case 'success':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Thành công</Badge>
      case 'error':
        return <Badge variant="destructive">Lỗi</Badge>
      case 'warning':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Cảnh báo</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import danh sách giáo viên từ Excel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleDownloadTemplate}
                disabled={isDownloading}
                className="flex items-center gap-2"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Tải template Excel
              </Button>
              
              <div className="text-sm text-gray-600">
                Tải template để biết định dạng dữ liệu chuẩn
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {file ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <FileSpreadsheet className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFile(null)
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ''
                          }
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <div>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Chọn file Excel
                      </Button>
                      <p className="text-sm text-gray-500 mt-1">
                        Hỗ trợ .xlsx, .xls, .csv (tối đa 10MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Đang xử lý file...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Preview Data */}
          {showPreview && previewData.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Dữ liệu preview (5 dòng đầu):</h3>
              <ScrollArea className="h-32 border rounded-md p-2">
                <div className="space-y-1">
                  {previewData.slice(0, 5).map((row, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      {index + 1}. {row.name} - {row.email} - {row.phone}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Import Results */}
          {importResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <h3 className="font-medium">Kết quả import:</h3>
                <div className="flex gap-2">
                  {getStatusBadge('success')}
                  <span className="text-sm text-gray-600">
                    {importResult.successCount} thành công
                  </span>
                </div>
                {importResult.errorCount > 0 && (
                  <div className="flex gap-2">
                    {getStatusBadge('error')}
                    <span className="text-sm text-gray-600">
                      {importResult.errorCount} lỗi
                    </span>
                  </div>
                )}
                {importResult.warnings.length > 0 && (
                  <div className="flex gap-2">
                    {getStatusBadge('warning')}
                    <span className="text-sm text-gray-600">
                      {importResult.warnings.length} cảnh báo
                    </span>
                  </div>
                )}
              </div>

              {/* Errors */}
              {importResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">Các lỗi cần sửa:</p>
                      <ScrollArea className="h-24">
                        {importResult.errors.map((error, index) => (
                          <div key={index} className="text-sm">
                            Dòng {error.row}: {error.field} - {error.message}
                            {error.value && ` (Giá trị: ${error.value})`}
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Warnings */}
              {importResult.warnings.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">Các cảnh báo:</p>
                      <ScrollArea className="h-24">
                        {importResult.warnings.map((warning, index) => (
                          <div key={index} className="text-sm">
                            Dòng {warning.row}: {warning.field} - {warning.message}
                            {warning.value && ` (Giá trị: ${warning.value})`}
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Instructions */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Hướng dẫn:</p>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Tải template Excel để biết định dạng chuẩn</li>
                  <li>Điền đầy đủ thông tin bắt buộc: Tên, Email, Username, Số điện thoại</li>
                  <li>Email và Username phải là duy nhất trong hệ thống</li>
                  <li>Giới tính: Nam/Nữ/Khác</li>
                  <li>Ngày sinh: DD/MM/YYYY</li>
                  <li>Nhóm quyền: Giáo viên/Chủ trung tâm</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose}>
            Đóng
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Import dữ liệu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
