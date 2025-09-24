"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FileSpreadsheet, MoreHorizontal } from "lucide-react"

interface ExportDropdownProps {
  onExportPage: () => void
  onExportAll: () => void
}

export function ExportDropdown({ onExportPage, onExportAll }: ExportDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onExportPage} className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4" />
          Xuất trang hiện tại
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportAll} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Xuất tất cả
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
