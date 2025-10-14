'use client';

import { Card } from '@/components/ui/card';
import { ClassSessions } from '../../../Teacher-management/types/session';

interface TeacherViewProps {
  currentDate: Date;
  sessions: ClassSessions[];
}

export function TeacherView({ currentDate, sessions }: TeacherViewProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Lịch Giáo viên</h3>
      <p className="text-muted-foreground">
        Chế độ xem lịch giáo viên đang được phát triển...
      </p>
    </Card>
  );
}
