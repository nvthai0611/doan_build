"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, MapPin, Phone, Users, GraduationCap } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { School } from "../../../../hooks/use-schools"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SchoolsListProps {
  schools: School[]
  onEdit: (school: School) => void
  onDelete: (id: string) => void
  isDeleting: string | null
  lockedIds?: string[]
}

export function SchoolsList({ schools, onEdit, onDelete, isDeleting, lockedIds }: SchoolsListProps) {
  if (schools.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Chưa có trường học nào</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {schools.map((school) => (
        <Card key={school.id}>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{school.name}</h3>
              <p className="text-xs text-muted-foreground">
                {format(new Date(school.createdAt), "dd/MM/yyyy", { locale: vi })}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Địa chỉ */}
            {school.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-sm">{school.address}</span>
              </div>
            )}

            {/* Số điện thoại */}
            {school.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{school.phone}</span>
              </div>
            )}

            {/* Thống kê */}
            <div className="flex items-center gap-4 pt-2 border-t">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">{school.studentCount ?? 0}</span>
                <span className="text-xs text-muted-foreground">HS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">{school.teacherCount ?? 0}</span>
                <span className="text-xs text-muted-foreground">GV</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onEdit(school)}
                disabled={isDeleting === school.id}
              >
                <Edit className="w-4 h-4 mr-1" />
                Sửa
              </Button>
              {(() => {
                const inUse = (school as any)?.studentCount > 0 || (school as any)?.teacherCount > 0
                const locked = lockedIds?.includes(school.id)
                const disabled = inUse || locked || isDeleting === school.id

                const buttonClass = `${disabled ? "w-full opacity-60 cursor-not-allowed" : "flex-1"}`
                
                const deleteBtn = (
                  <Button
                    variant="destructive"
                    size="sm"
                    className={buttonClass}
                    onClick={() => !disabled && onDelete(school.id)}
                    disabled={disabled}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {isDeleting === school.id ? "Đang xóa..." : "Xóa"}
                  </Button>
                )

                if (!inUse && !locked) return deleteBtn

                return (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex-1">{deleteBtn}</div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Không thể xóa trường học đang có học sinh hoặc giáo viên
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              })()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
