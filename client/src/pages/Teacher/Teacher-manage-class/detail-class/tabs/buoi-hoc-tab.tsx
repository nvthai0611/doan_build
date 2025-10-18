"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/format';
import { useQuery } from "@tanstack/react-query"
import { teacherCommonService } from "../../../../../services/teacher/common/common.service"

interface BuoiHocTabProps {
  onAddSession: () => void
  onViewDetailSession: (session: any) => void
  onDeleteSession: (session: any) => void
  teacherClassAssignmentId: any
}

export function BuoiHocTab({ onAddSession, onViewDetailSession, onDeleteSession, teacherClassAssignmentId }: BuoiHocTabProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['class-sessions', teacherClassAssignmentId],
    queryFn: async () => {
      return await teacherCommonService.getClassSessions(teacherClassAssignmentId)
    },
    enabled: !!teacherClassAssignmentId,
    refetchOnWindowFocus: false,
    retry: 1
  })

  const sessions = (data || []).map((s: any, idx: number) => {
    const d = new Date(s.sessionDate)
    const dateStr = isNaN(d.getTime()) ? s.sessionDate : d.toLocaleDateString('vi-VN')
    return {
      id: s.id,
      title: `Buổi ${idx + 1}`,
      date: dateStr,
      status: s.status === 'scheduled' ? 'Sắp tới' : s.status === 'completed' ? 'Hoàn thành' : s.status || "Đã hủy",
      attendance: Array.isArray(s.attendances) ? s.attendances.length : 0,
      startTime: s.startTime,
      endTime: s.endTime,
      roomName: s.room?.name
    }
  })

  const classSession = {
    total: data?.length || 0,
    completed: sessions.filter((s) => s.status === 'Hoàn thành').length,
    upcoming: sessions.filter((s) => s.status === 'Sắp tới').length,
  };

  const stats = [
    {
      label: 'Tổng buổi học',
      value: classSession.total,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Buổi đã hoàn thành',
      value: classSession.completed,
      color: 'bg-green-100 text-green-700',
    },
    {
      label: 'Buổi sắp tới',
      value: classSession.upcoming,
      color: 'bg-yellow-100 text-yellow-700',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {stat.label}
              </p>
              <p className={`text-3xl font-bold ${stat.color} p-2 rounded`}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Session Button */}
      <div className="flex justify-end">
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2" onClick={onAddSession}>
          <Plus className="w-4 h-4" />
          Thêm buổi học
        </Button>
      </div>

      {/* Sessions List */}
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Danh sách buổi học
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
                <div className="text-sm text-muted-foreground">Đang tải buổi học...</div>
              ) : isError ? (
                <div className="text-sm text-destructive">Không thể tải danh sách buổi học</div>
              ) : (
                <div className="space-y-4">
                  {sessions.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Chưa có buổi học nào</div>
                  ) : (
                    sessions.map((session: any, idx: number) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{session.title}</p>
                          <p className="text-sm text-muted-foreground">Ngày: {session.date}</p>
                          <p className="text-sm text-muted-foreground">Thời gian: {session.startTime} → {session.endTime}</p>
                          {session.roomName && (
                            <p className="text-sm text-muted-foreground">Phòng: {session.roomName}</p>
                          )}
                          {session.attendance > 0 && (
                            <p className="text-sm text-muted-foreground">Có mặt: {session.attendance} học viên</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={session.status === "Hoàn thành" ? "default" : "secondary"}>{session.status}</Badge>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => onViewDetailSession(session)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onDeleteSession(session)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
        </CardContent>
      </Card>
    </div>
  )
}
