"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, MoreVertical, Phone, CalendarIcon, ChevronRight, Plus } from "lucide-react"
import { ChildDetailView } from "./ChildDetailView"
import { AddChildModal } from "./AddChildModal"
import { useQuery } from "@tanstack/react-query"
import { parentChildService } from "../../../../services"

type ChildRow = {
  id: string
  name: string
  avatar?: string
  classNames: string
  studentCode?: string
  dateOfBirth?: string
  gender?: string
  phone?: string
  email?: string
  status: 'not_been_updated' | 'studying' | 'stopped' | 'graduated' | 'withdrawn'
  enrollmentCount: number
  averageScore?: number
}

// Helper function để hiển thị trạng thái
const getStatusDisplay = (status: ChildRow['status']) => {
  switch (status) {
    case 'not_been_updated':
      return {
        text: 'Chưa cập nhật',
        color: 'bg-gray-400',
        textColor: 'text-gray-600',
      }
    case 'studying':
      return {
        text: 'Đang học',
        color: 'bg-green-500',
        textColor: 'text-green-700',
      }
    case 'stopped':
      return {
        text: 'Đã dừng học',
        color: 'bg-orange-500',
        textColor: 'text-orange-700',
      }
    case 'graduated':
      return {
        text: 'Đã tốt nghiệp',
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
      }
    case 'withdrawn':
      return {
        text: 'Đã rút',
        color: 'bg-red-500',
        textColor: 'text-red-700',
      }
    default:
      return {
        text: 'Không xác định',
        color: 'bg-gray-500',
        textColor: 'text-gray-700',
      }
  }
}

export function ListChildren() {
  const [selectedChild, setSelectedChild] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["parent-children", { search: searchQuery }],
    queryFn: () => parentChildService.getChildren({ search: searchQuery, limit: 50, page: 1 }),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })

  const rows: ChildRow[] = useMemo(() => {
    const list = Array.isArray(data) ? data : []
    return list.map((s: any) => {
      const enrollments = s.enrollments ?? []
      const activeEnrollments = enrollments.filter((e: any) => e.status === 'studying')
      
      // Xác định trạng thái học sinh dựa trên enrollments (ưu tiên: studying > graduated > stopped > withdrawn > not_been_updated)
      let status: ChildRow['status'] = 'not_been_updated'
      if (activeEnrollments.length > 0) {
        status = 'studying'
      } else if (enrollments.some((e: any) => e.status === 'graduated')) {
        status = 'graduated'
      } else if (enrollments.some((e: any) => e.status === 'stopped')) {
        status = 'stopped'
      } else if (enrollments.some((e: any) => e.status === 'withdrawn')) {
        status = 'withdrawn'
      }
      
      // Tính điểm trung bình từ tất cả grades
      const grades = s.grades ?? []
      const validGrades = grades.filter((g: any) => g.score !== null && typeof g.score === 'number')
      const averageScore = validGrades.length > 0
        ? Number((validGrades.reduce((sum: number, g: any) => sum + g.score, 0) / validGrades.length).toFixed(1))
        : undefined
      
      return {
        id: s.id,
        name: s.user?.fullName ?? s.user?.username ?? "",
        avatar: s.user?.avatar,
        // Chỉ hiển thị các enrollment active và lớp active (API đã lọc)
        classNames: activeEnrollments
          .map((e: any) => e.class?.name)
          .filter(Boolean)
          .join(", ") || "—",
        studentCode: s.studentCode,
        dateOfBirth: s.dateOfBirth?.slice(0, 10),
        gender: s.gender,
        phone: s.user?.phone,
        email: s.user?.email,
        status: status,
        enrollmentCount: activeEnrollments.length,
        averageScore: averageScore,
      }
    })
  }, [data])

  const child = rows.find((c) => c.id === selectedChild)

  if (child) {
    return <ChildDetailView childId={child.id} onBack={() => setSelectedChild(null)} />
  }

  const filteredChildren = rows

  // Subcomponent: Tính và hiển thị điểm TB theo lớp cho từng học sinh
  const AverageScoreCell = ({ childId }: { childId: string }) => {
    const { data: grades, isLoading } = useQuery({
      queryKey: ["parent-child-grades-summary", childId],
      queryFn: () => parentChildService.getChildGrades(childId),
      staleTime: 3000,
      refetchOnWindowFocus: true,
      enabled: !!childId,
    })

    if (isLoading) {
      return <span className="text-xs text-muted-foreground">—</span>
    }

    const list = Array.isArray(grades) ? grades : []
    // Nhóm điểm theo lớp (classId hoặc className hoặc assessment.class.name)
    const byClass = new Map<string, number[]>()
    for (const g of list as any[]) {
      const score = g?.score
      if (typeof score !== 'number') continue
      const key = g?.classId || g?.className || g?.assessment?.class?.name || 'unknown'
      if (!byClass.has(key)) byClass.set(key, [])
      byClass.get(key)!.push(score)
    }

    // Tính điểm TB mỗi lớp, rồi lấy TB của các lớp
    const classAverages: number[] = []
    byClass.forEach((scores) => {
      if (scores.length === 0) return
      const avg = scores.reduce((s, v) => s + v, 0) / scores.length
      classAverages.push(avg)
    })

    if (classAverages.length === 0) {
      return <span className="text-xs text-muted-foreground">—</span>
    }

    const overall = Number((classAverages.reduce((s, v) => s + v, 0) / classAverages.length).toFixed(1))
    const color = overall >= 8 ? 'text-green-600' : overall >= 6.5 ? 'text-blue-600' : overall >= 5 ? 'text-orange-600' : 'text-red-600'

    return <span className={`text-sm font-semibold ${color}`}>{overall.toFixed(1)}</span>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Danh sách con em</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span>Danh sách con em</span>
          </div>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm con
        </Button>
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
          <Badge variant="secondary" className="ml-2">{rows.length}</Badge>
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
                          {child.studentCode ? (
                            <p className="text-xs text-muted-foreground">{child.studentCode}</p>
                          ) : null}
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
                      <Badge variant="outline">{child.classNames}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-center">
                        <AverageScoreCell childId={child.id} />
                      </div>
                    </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusDisplay(child.status).color}`}></div>
                      <span className={`text-sm font-medium ${getStatusDisplay(child.status).textColor}`}>
                        {getStatusDisplay(child.status).text}
                      </span>
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
              1-{filteredChildren.length} trong {rows.length}
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

      {/* Add Child Modal */}
      <AddChildModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          refetch() // Refresh danh sách con sau khi thêm thành công
        }}
      />
    </div>
  )
}
