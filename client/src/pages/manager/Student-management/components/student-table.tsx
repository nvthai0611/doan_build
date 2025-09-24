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
    <div className="border border-border rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="w-12 text-center text-muted-foreground font-medium">STT</TableHead>
            <TableHead className="text-muted-foreground font-medium">Tài khoản học viên</TableHead>
            <TableHead className="text-muted-foreground font-medium">Thông tin liên hệ</TableHead>
            <TableHead className="text-center text-muted-foreground font-medium">Trạng thái</TableHead>
            <TableHead className="text-center text-muted-foreground font-medium">Khóa học</TableHead>
            <TableHead className="text-center text-muted-foreground font-medium">Lớp học</TableHead>
            <TableHead className="text-center text-muted-foreground font-medium">Điểm trung bình</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => (
            <TableRow key={student.id} className="border-border hover:bg-muted/50">
              <TableCell className="text-center text-sm text-muted-foreground">{index + 1}</TableCell>

              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {getInitials(student.user.fullName || student.user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">{student.user.fullName || student.user.username}</div>
                    <div className="text-xs text-muted-foreground">{student.user.username}</div>
                    {student.studentCode && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {student.studentCode}
                        <Button variant="ghost" size="icon" className="w-4 h-4 p-0">
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="space-y-1">
                  {student.user.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{student.user.email}</span>
                    </div>
                  )}
                  {student.user.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{student.user.phone}</span>
                    </div>
                  )}
                  {student.dateOfBirth && (
                    <div className="text-xs text-muted-foreground">
                      {student.dateOfBirth.toLocaleDateString("vi-VN")} - {student.gender || "Khác"}
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell className="text-center">{getStatusBadge(student.status, student.statusCount)}</TableCell>

              <TableCell className="text-center">
                <span className="text-foreground font-medium">{student.totalCourses}</span>
              </TableCell>

              <TableCell className="text-center">
                <span className="text-foreground font-medium">{student.totalClasses}</span>
              </TableCell>

              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  {student.averageGrade > 0 && (
                    <div className="w-12 h-6 bg-muted rounded flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">{formatGrade(student.averageGrade)}</span>
                    </div>
                  )}
                  <span className="text-foreground font-medium">{formatGrade(student.averageGrade)}</span>
                </div>
              </TableCell>

              

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-8 h-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Xem
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2">
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

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          Số bảng mới trong: <span className="font-medium">10</span> trong <span className="font-medium">44</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            ‹
          </Button>
          <Button variant="outline" size="sm">
            ›
          </Button>
        </div>
      </div>
    </div>
  )
}
