"use client"

import type { Subject } from "@/hooks/use-subjects"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, BookOpen } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SubjectsListProps {
  subjects: Subject[]
  onEdit: (subject: Subject) => void
  onDelete: (id: string) => Promise<void>
  isDeleting?: string | null
  lockedIds?: string[]
}

export function SubjectsList({ subjects, onEdit, onDelete, isDeleting, lockedIds }: SubjectsListProps) {
  if (subjects.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Chưa có môn học nào</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {subjects.map((subject) => (
        <Card key={subject.id}>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-lg">{subject.name}</h3>
              </div>
              {subject.createdAt && (
                <p className="text-xs text-muted-foreground">
                  {format(new Date(subject.createdAt), "dd/MM/yyyy", { locale: vi })}
                </p>
              )}
            </div>
            <Badge variant="outline" className="ml-2">
              {subject.code}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Description */}
            {subject.description && <p className="text-sm text-muted-foreground line-clamp-2">{subject.description}</p>}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => onEdit(subject)}>
                <Edit className="w-4 h-4 mr-2" />
                Sửa
              </Button>
              {(() => {
                const inUse = (subject as any)?.isInUse
                const locked = lockedIds?.includes(subject.id)
                const disabled = inUse || locked || isDeleting === subject.id
                const buttonClass = `${disabled ? "w-full opacity-60 cursor-not-allowed" : "flex-1"}`

                const deleteBtn = (
                  <Button
                    variant="destructive"
                    size="sm"
                    className={buttonClass}
                    onClick={() => !disabled && onDelete(subject.id)}
                    disabled={disabled}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting === subject.id ? "Đang xóa..." : "Xóa"}
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
                        Môn học này hiện đang được dùng bạn không thể xoá
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
