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
import { Calendar, Clock, Users, MapPin, UserCheck } from 'lucide-react';
import { useState } from 'react';

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

// Mock replacement teachers
const replacementTeachers = [
  { id: '1', name: 'Nguyễn Thị B' },
  { id: '2', name: 'Trần Văn C' },
  { id: '3', name: 'Lê Thị D' },
];

export function AffectedSessionsTable({
  sessions,
  setSessions,
}: AffectedSessionsTableProps) {
  const [bulkReplacementTeacherId, setBulkReplacementTeacherId] =
    useState<string>('');

  const handleCheckboxChange = (sessionId: string, checked: boolean) => {
    setSessions(
      sessions.map((s) =>
        s.id === sessionId ? { ...s, selected: checked } : s,
      ),
    );
  };

  const handleReplacementChange = (sessionId: string, teacherId: string) => {
    setSessions(
      sessions.map((s) =>
        s.id === sessionId ? { ...s, replacementTeacherId: teacherId } : s,
      ),
    );
  };

  const handleReplaceAll = () => {
    if (!bulkReplacementTeacherId) return;
    setSessions(
      sessions.map((s) =>
        s.selected
          ? { ...s, replacementTeacherId: bulkReplacementTeacherId }
          : s,
      ),
    );
  };

  const handleSelectAll = () => {
    setSessions(sessions.map((s) => ({ ...s, selected: true })));
  };

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
      <div>
        <h3 className="text-xl font-bold text-foreground mb-1">
          Các buổi học bị ảnh hưởng
        </h3>
        <p className="text-sm text-muted-foreground">
          Hệ thống tự động liệt kê các buổi bạn có trong thời gian nghỉ. Bạn có
          thể chọn người dạy thay cho từng buổi.
        </p>
      </div>

      <div className="bg-accent border border-border rounded-xl p-5 space-y-4 overflow-hidden">
        <div className="flex items-center gap-2 text-accent-foreground">
          <UserCheck className="w-5 h-5" />
          <h4 className="font-semibold">Thay thế hàng loạt</h4>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Select
              value={bulkReplacementTeacherId}
              onValueChange={setBulkReplacementTeacherId}
            >
              <SelectTrigger className="bg-background border">
                <SelectValue placeholder="Chọn giáo viên thay thế cho tất cả" />
              </SelectTrigger>
              <SelectContent>
                {replacementTeachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
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
      </div>

      <div className="space-y-3 overflow-hidden">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-card border rounded-xl p-5 hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="flex items-start gap-4">
              <Checkbox
                id={`session-${session.id}`}
                checked={session.selected}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(session.id, checked as boolean)
                }
                className="mt-1"
              />
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

                {session.selected && (
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
                    >
                      <SelectTrigger
                        id={`replacement-${session.id}`}
                        className="border"
                      >
                        <SelectValue placeholder="Chọn giáo viên thay thế" />
                      </SelectTrigger>
                      <SelectContent>
                        {replacementTeachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
