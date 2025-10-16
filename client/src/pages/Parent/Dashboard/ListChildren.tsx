"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, MoreVertical, Phone, CalendarIcon, ChevronRight } from "lucide-react"
import { ChildDetailView } from "./ChildDetailView"
import { useQuery } from "@tanstack/react-query"
import { parentChildService } from "../../../services"

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
}

export function ParentDashboard() {
  const [selectedChild, setSelectedChild] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["parent-children", { search: searchQuery }],
    queryFn: () => parentChildService.getChildren({ search: searchQuery, limit: 50, page: 1 }),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })

  const rows: ChildRow[] = useMemo(() => {
    const list = Array.isArray(data) ? data : []
    return list.map((s: any) => ({
      id: s.id,
      name: s.user?.fullName ?? s.user?.username ?? "",
      avatar: s.user?.avatar,
      classNames: (s.enrollments ?? []).map((e: any) => e.class?.name).filter(Boolean).join(", ") || "—",
      studentCode: s.studentCode,
      dateOfBirth: s.dateOfBirth?.slice(0, 10),
      gender: s.gender,
      phone: s.user?.phone,
      email: s.user?.email,
    }))
  }, [data])

  const child = rows.find((c) => c.id === selectedChild)

  if (child) {
    return <ChildDetailView childId={child.id} onBack={() => setSelectedChild(null)} />
  }

  const filteredChildren = rows

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
                      <div className="text-center text-xs text-muted-foreground">—</div>
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
    </div>
  )
}
