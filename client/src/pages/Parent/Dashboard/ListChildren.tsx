"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, MoreVertical, Phone, CalendarIcon, ChevronRight } from "lucide-react"
import { ChildDetailView } from "./ChildDetailView"

export interface Child {
  id: string
  name: string
  avatar: string
  class: string
  studentId: string
  dateOfBirth: string
  gender: string
  phone: string
  email: string
  gpa: number
  rank: number
  totalStudents: number
  attendance: number
  status: string
}

const mockChildren: Child[] = [
  {
    id: "1",
    name: "Trần Minh Khang",
    avatar: "/placeholder.svg?height=80&width=80",
    class: "Lớp 10A",
    studentId: "HS2025001",
    dateOfBirth: "15/03/2010",
    gender: "Nam",
    phone: "0386828929",
    email: "khang.tran@student.edu.vn",
    gpa: 7.8,
    rank: 5,
    totalStudents: 32,
    attendance: 95,
    status: "active",
  },
  {
    id: "2",
    name: "Trần Minh Anh",
    avatar: "/placeholder.svg?height=80&width=80",
    class: "Lớp 8B",
    studentId: "HS2025002",
    dateOfBirth: "20/08/2012",
    gender: "Nữ",
    phone: "0386828930",
    email: "anh.tran@student.edu.vn",
    gpa: 8.5,
    rank: 2,
    totalStudents: 28,
    attendance: 98,
    status: "active",
  },
]

export function ParentDashboard() {
  const [selectedChild, setSelectedChild] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const child = mockChildren.find((c) => c.id === selectedChild)

  if (child) {
    return <ChildDetailView child={child} onBack={() => setSelectedChild(null)} />
  }

  const filteredChildren = mockChildren.filter(
    (child) =>
      child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.class.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-balance">Danh sách con em</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <span>Dashboard</span>
          <ChevronRight className="w-4 h-4" />
          <span>Danh sách con em</span>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, email, mã học sinh"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
        </CardContent>
      </Card>

      {/* Stats Tabs */}
      <div className="flex items-center gap-6 border-b">
        <button className="pb-3 border-b-2 border-primary text-primary font-medium">
          Tất cả
          <Badge variant="secondary" className="ml-2">
            {mockChildren.length}
          </Badge>
        </button>
      </div>

      {/* Children Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">STT</th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">TÀI KHOẢN HỌC SINH</th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">THÔNG TIN</th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">LỚP HỌC</th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">ĐIỂM TB</th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">TRẠNG THÁI</th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {filteredChildren.map((child, index) => (
                  <tr
                    key={child.id}
                    className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => setSelectedChild(child.id)}
                  >
                    <td className="p-4 text-sm">{index + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={child.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-primary hover:underline">{child.name}</p>
                          <p className="text-xs text-muted-foreground">{child.studentId}</p>
                          <p className="text-xs text-muted-foreground">***{child.studentId.slice(-4)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span>📧</span>
                          <span>{child.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{child.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CalendarIcon className="w-3 h-3" />
                          <span>
                            {child.dateOfBirth} - {child.gender}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">{child.class}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">{child.gpa}</div>
                        <div className="text-xs text-muted-foreground">
                          Hạng {child.rank}/{child.totalStudents}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm">Đang học</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              1-{filteredChildren.length} trong {mockChildren.length}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Trước
              </Button>
              <Button variant="outline" size="sm">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                Sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
