'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, MapPin, UserCheck, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { teacherLeaveRequestService } from '../../../services/teacher/leave-request/leave.service';
import type { ReplacementTeacher } from '../../../services/teacher/leave-request/leave.types';

interface AffectedSession {
  id: string;
  date: string;
  time: string;
  className: string;
  room: string;
  selected: boolean;
  replacementTeacherId?: string;
}

interface AffectedSessionsTableProps {
  sessions: AffectedSession[];
  setSessions: (sessions: AffectedSession[]) => void;
}

export function AffectedSessionsTable({
  sessions,
  setSessions,
}: AffectedSessionsTableProps) {
  const [bulkReplacementTeacherId, setBulkReplacementTeacherId] =
    useState<string>('');
  const [replacementTeachers, setReplacementTeachers] = useState<ReplacementTeacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState<string | null>(null);
  const [teachersCache, setTeachersCache] = useState<Map<string, ReplacementTeacher[]>>(new Map());

  // const handleCheckboxChange = (sessionId: string, checked: boolean) => {
  //   setSessions(
  //     sessions.map((s) =>
  //       s.id === sessionId ? { ...s, selected: checked } : s,
  //     ),
  //   );
  // };

  // const handleReplacementChange = (sessionId: string, teacherId: string) => {
  //   setSessions(
  //     sessions.map((s) =>
  //       s.id === sessionId ? { ...s, replacementTeacherId: teacherId } : s,
  //     ),
  //   );
  // };

  // const handleReplaceAll = () => {
  //   if (!bulkReplacementTeacherId) return;
  //   setSessions(
  //     sessions.map((s) =>
  //       s.selected
  //         ? { ...s, replacementTeacherId: bulkReplacementTeacherId }
  //         : s,
  //     ),
  //   );
  // };

  // const handleSelectAll = () => {
  //   setSessions(sessions.map((s) => ({ ...s, selected: true })));
  // };

  // Function để lấy danh sách giáo viên thay thế
  const fetchReplacementTeachers = async (sessionId: string, date: string, time: string) => {
    const cacheKey = `${sessionId}-${date}-${time}`;
    
    // Kiểm tra cache trước
    if (teachersCache.has(cacheKey)) {
      setReplacementTeachers(teachersCache.get(cacheKey)!);
      return;
    }

    setLoadingTeachers(sessionId);
    try {
      const teachers = await teacherLeaveRequestService.getReplacementTeachers({
        sessionId,
        date,
        time: time.replace(' - ', '-') // Convert "08:00 - 10:00" to "08:00-10:00"
      });
      
      setReplacementTeachers(teachers);
      // Cache kết quả
      setTeachersCache(prev => new Map(prev).set(cacheKey, teachers));
    } catch (error) {
      console.error('Failed to load replacement teachers:', error);
      setReplacementTeachers([]);
    } finally {
      setLoadingTeachers(null);
    }
  };

  // Function để handle khi user click vào dropdown
  // const handleSelectOpen = (sessionId: string, date: string, time: string) => {
  //   if (replacementTeachers.length === 0) {
  //     fetchReplacementTeachers(sessionId, date, time);
  //   }
  // };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 bg-muted rounded-xl border-2 border-dashed border-border overflow-hidden">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground font-medium">
          Không có buổi học nào trong thời gian này.
        </p>
      </div>
    );
  }

  const selectedCount = sessions.filter((s) => s.selected).length;

  return (
    <div className="space-y-4 overflow-hidden">
      {/* <div>
        <p className="text-sm text-muted-foreground">
          Hệ thống tự động liệt kê các buổi bạn có trong thời gian nghỉ. Bạn có
          thể chọn người dạy thay cho từng buổi.
        </p>
      </div> */}

      {/* <div className="bg-accent border border-border rounded-xl p-5 space-y-4 overflow-hidden">
        <div className="flex items-center gap-2 text-accent-foreground">
          <UserCheck className="w-5 h-5" />
          <h4 className="font-semibold">Thay thế hàng loạt</h4>
        </div>
        <div className="flex flex-col sm:flex-col gap-3">
          <div className="flex-1">
            <Select
              value={bulkReplacementTeacherId}
              onValueChange={setBulkReplacementTeacherId}
              onOpenChange={(open) => {
                if (
                  open &&
                  replacementTeachers.length === 0 &&
                  sessions.length > 0
                ) {
                  // Lấy giáo viên thay thế cho buổi học đầu tiên được chọn
                  const firstSelectedSession = sessions.find((s) => s.selected);
                  if (firstSelectedSession) {
                    fetchReplacementTeachers(
                      firstSelectedSession.id,
                      firstSelectedSession.date,
                      firstSelectedSession.time,
                    );
                  }
                }
              }}
            >
              <SelectTrigger className="bg-background border">
                <SelectValue placeholder="Chọn giáo viên thay thế cho tất cả" />
              </SelectTrigger>
              <SelectContent>
                {replacementTeachers.length > 0 ? (
                  replacementTeachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{teacher.fullName}</span>
                        <span className="text-xs text-muted-foreground">
                          {teacher.compatibilityReason} (Điểm:{' '}
                          {teacher.compatibilityScore}/5)
                        </span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />{' '}
                    <span className="text-sm text-muted-foreground">
                      Đang tải giáo viên thay thế...
                    </span>
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleSelectAll}>
              Chọn tất cả
            </Button>
            <Button
              type="button"
              onClick={handleReplaceAll}
              disabled={!bulkReplacementTeacherId || selectedCount === 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Áp dụng ({selectedCount})
            </Button>
          </div>
        </div>
        {selectedCount > 0 && (
          <p className="text-sm text-muted-foreground">
            Đã chọn {selectedCount} buổi học. Nhấn "Áp dụng" để gán giáo viên
            thay thế cho tất cả.
          </p>
        )}
      </div> */}

      <div className="space-y-3 overflow-hidden">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-card border rounded-xl p-5 hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="flex items-start gap-4">
              {/* <Checkbox
                id={`session-${session.id}`}
                checked={session.selected}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(session.id, checked as boolean)
                }
                className="mt-1"
              /> */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-medium text-muted-foreground">
                      Ngày:
                    </span>
                    <span className="text-foreground">
                      {new Date(session.date).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-medium text-muted-foreground">
                      Giờ học:
                    </span>
                    <span className="text-foreground">{session.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-medium text-muted-foreground">
                      Lớp:
                    </span>
                    <span className="text-foreground">{session.className}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium text-muted-foreground">
                      Phòng:
                    </span>
                    <span className="text-foreground">{session.room}</span>
                  </div>
                </div>

                {/* {session.selected && (
                  <div className="space-y-2 pt-2 border-t overflow-hidden">
                    <Label
                      htmlFor={`replacement-${session.id}`}
                      className="text-sm font-medium text-foreground"
                    >
                      Giáo viên dạy thay
                    </Label>
                    <Select
                      value={session.replacementTeacherId}
                      onValueChange={(value) =>
                        handleReplacementChange(session.id, value)
                      }
                      onOpenChange={(open) => {
                        if (open) {
                          handleSelectOpen(
                            session.id,
                            session.date,
                            session.time,
                          );
                        }
                      }}
                    >
                      <SelectTrigger
                        id={`replacement-${session.id}`}
                        className="border"
                      >
                        <SelectValue
                          placeholder={
                            loadingTeachers === session.id
                              ? 'Đang tải...'
                              : 'Chọn giáo viên thay thế'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingTeachers === session.id ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            <span className="text-sm text-muted-foreground">
                              Đang tải...
                            </span>
                          </div>
                        ) : replacementTeachers.length > 0 ? (
                          replacementTeachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {teacher.fullName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {teacher.compatibilityReason} (Điểm:{' '}
                                  {teacher.compatibilityScore}/5)
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Không có giáo viên thay thế phù hợp
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )} */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
