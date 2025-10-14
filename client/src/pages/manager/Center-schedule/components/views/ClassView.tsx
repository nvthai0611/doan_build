'use client';

import { Card } from '@/components/ui/card';
import { ClassSessions } from '../../../Teacher-management/types/session';

interface ClassViewProps {
  currentDate: Date;
  sessions: ClassSessions[];
}

export function ClassView({ currentDate, sessions }: ClassViewProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Lịch theo Lớp</h3>
      <p className="text-muted-foreground">
        Chế độ xem lịch theo lớp học đang được phát triển...
      </p>
    </Card>
  );
}
