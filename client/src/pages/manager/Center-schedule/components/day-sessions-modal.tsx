'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
} from 'lucide-react';
import { ClassSessions } from '../../Teacher-management/types/session';
interface DaySessionsModalProps {
  date: Date | null;
  sessions: ClassSessions[];
  isOpen: boolean;
  onClose: () => void;
  onSessionClick: (session: ClassSessions) => void;
}

export function DaySessionsModal({
  date,
  sessions,
  isOpen,
  onClose,
  onSessionClick,
}: DaySessionsModalProps) {
  if (!date) return null;

  const weekDays = [
    'Chủ Nhật',
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
  ];

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day} tháng ${month}, ${year}`;
  };

  const getDayName = (date: Date) => {
    return weekDays[date.getDay()];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {getDayName(date)}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{formatDate(date)}</p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Không có buổi học nào trong ngày này
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => {
                  onSessionClick(session);
                  onClose();
                }}
                className="bg-indigo-500 text-secondary-foreground p-4 rounded-lg cursor-pointer hover:bg-indigo-500/90 transition-colors group text-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{session.name || "Chưa phân lớp"}</span>
                    {session.hasAlert && (
                      <Badge
                        variant="default"
                        className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Cảnh báo
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs opacity-90">
                    <Clock className="h-3 w-3" />
                    {session.startTime.slice(0, 5)} -{' '}
                    {session.endTime.slice(0, 5)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs opacity-90">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {session.roomName || "Chưa phân phòng"}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {session.teacherName || "Chưa phân giáo viên"}
                  </div>
                  <div className="flex items-center gap-1 col-span-2">
                    <Users className="h-3 w-3" />
                    {session.studentCount}/{session.maxStudents} học sinh
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {sessions.length > 0 && (
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
