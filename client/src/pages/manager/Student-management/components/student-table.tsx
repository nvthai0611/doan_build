"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Mail, Phone, Eye, Download, Copy } from "lucide-react"
import type { StudentWithDetails, StudentFilters } from "../types/database"
import { cn } from "@/lib/utils"

interface StudentTableProps {
  students: StudentWithDetails[]
  filters: StudentFilters
  onFilterChange: (key: keyof StudentFilters, value: any) => void
}

export function StudentTable({ students, filters }: StudentTableProps) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  const getStatusBadge = (status: string, count?: number) => {
    const statusConfig = {
      "Chờ xếp lớp": { color: "bg-orange-100 text-orange-700 border-orange-200", textColor: "text-orange-700" },
      "Đang học": { color: "bg-green-100 text-green-700 border-green-200", textColor: "text-green-700" },
      "Bảo lưu": { color: "bg-yellow-100 text-yellow-700 border-yellow-200", textColor: "text-yellow-700" },
      "Dừng học": { color: "bg-red-100 text-red-700 border-red-200", textColor: "text-red-700" },
      "Tốt nghiệp": { color: "bg-emerald-100 text-emerald-700 border-emerald-200", textColor: "text-emerald-700" },
      "Sắp học": { color: "bg-purple-100 text-purple-700 border-purple-200", textColor: "text-purple-700" },
      "Chưa cấp nhật lịch học": { color: "bg-blue-100 text-blue-700 border-blue-200", textColor: "text-blue-700" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["Chờ xếp lớp"]

    return (
      <div className="space-y-1">
        <Badge variant="outline" className={cn("text-xs font-medium border", config.color)}>
          {status} {count ? `(${count})` : ""}
        </Badge>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " đ"
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatGrade = (grade: number) => {
    if (grade === 0) return ""
    return `${grade}/10`
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-gray-50 dark:bg-gray-900">
            <TableHead className="w-12 text-left text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs">STT</TableHead>
            <TableHead className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs">Tài khoản học viên</TableHead>
            <TableHead className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs">Thông tin</TableHead>
            <TableHead className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs text-center">Trạng thái</TableHead>
            <TableHead className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs text-center">Khóa học</TableHead>
            <TableHead className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs text-center">Lớp học</TableHead>
            <TableHead className="text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs text-center">Điểm trung bình</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => (
            <TableRow key={student.id} className="hover:bg-gray-50 dark:bg-gray-900">
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {index + 1}
              </TableCell>

              <TableCell className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gray-200">
                      <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white dark:bg-gray-800 rounded-full"></div>
                      </div>
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium text-blue-600">{student.user.fullName || student.user.username}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{student.user.username}</div>
                    {student.studentCode && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <span>{student.studentCode}</span>
                        <Copy className="w-3 h-3 cursor-pointer hover:text-gray-600 dark:text-gray-300" />
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>

              <TableCell className="px-6 py-4 whitespace-nowrap">
                <div className="space-y-1">
                  {student.user.email && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                      <Mail className="w-3 h-3" />
                      {student.user.email}
                    </div>
                  )}
                  {student.user.phone && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                      <Phone className="w-3 h-3" />
                      {student.user.phone}
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                {getStatusBadge(student.status, student.statusCount)}
              </TableCell>

              <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                <span className="text-gray-900 dark:text-white text-sm">{student.totalCourses}</span>
              </TableCell>

              <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                <span className="text-gray-900 dark:text-white text-sm">{student.totalClasses}</span>
              </TableCell>

              <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                <div className="inline-flex items-center gap-2">
                  {student.averageGrade > 0 && (
                    <div className="w-12 h-6 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-600 dark:text-gray-300">{formatGrade(student.averageGrade)}</span>
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem className="gap-2">
                      <Eye className="w-4 h-4" />
                      Xem
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Download className="w-4 h-4" />
                      Tải xuống
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
