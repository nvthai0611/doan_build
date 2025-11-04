"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, Upload, BookTemplate as FileTemplate, MoreHorizontal } from "lucide-react"

interface ExportDropdownProps {
  onExportPage: () => void
  onExportAll: () => void
}

export function ExportDropdown({ onExportPage, onExportAll }: ExportDropdownProps) {
  const handleDownloadTemplate = () => {
    // Create a sample CSV template
    const headers = "STT,Tên,Email,Số điện thoại,Nhóm quyền,Trạng thái"
    const sampleRow = "1,Nguyễn Văn A,example@email.com,0123456789,Giáo viên,Đang hoạt động"
    const csvContent = `${headers}\n${sampleRow}`

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `mau-danh-sach-nhan-vien.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".csv,.xlsx,.xls"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // Handle file upload logic here
        console.log("File selected:", file.name)
      }
    }
    input.click()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleDownloadTemplate} className="flex items-center gap-2">
          <FileTemplate className="w-4 h-4" />
          Tải mẫu
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleUpload} className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Tải lên
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportPage} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Tải trong trang
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportAll} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Tải tất cả
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
