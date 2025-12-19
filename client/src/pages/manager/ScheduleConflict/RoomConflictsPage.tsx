import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRoomConflicts } from '../../../hooks/use-schedule-conflict';
import { useRooms } from '../../../hooks/use-rooms';
import { AlertTriangle, Calendar, Clock, MapPin, Plus, RefreshCw } from 'lucide-react';
import { AddSessionDialog } from './AddSessionDialog';

export const RoomConflictsPage = () => {
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [selectedRoomId, setSelectedRoomId] = useState<string>('all');
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);

  const { rooms } = useRooms();
  const { data: conflictsData, isLoading, refetch } = useRoomConflicts({
    startDate,
    endDate,
    roomId: selectedRoomId === 'all' ? undefined : selectedRoomId,
  });

  const conflicts = (conflictsData as any)?.data || [];
  const totalConflicts = (conflictsData as any)?.meta?.totalConflicts || 0;

  const handleResolveConflict = () => {
    setIsAddSessionOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      has_not_happened: 'bg-yellow-500',
      happening: 'bg-blue-500',
      end: 'bg-green-500',
      cancelled: 'bg-red-500',
      day_off: 'bg-gray-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Quản lý xung đột lịch học
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Theo dõi và giải quyết các buổi học bị trùng phòng
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddSessionOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Thêm buổi học
          </Button>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Từ ngày</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Đến ngày</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Phòng học</label>
              <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả phòng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phòng</SelectItem>
                  {rooms?.map((room: any) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => refetch()} className="w-full">
                Tìm kiếm
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="border-red-200 bg-red-50 dark:bg-red-950/10">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                {totalConflicts} nhóm xung đột phòng học
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400">
                Cần giải quyết để tránh trùng lịch
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conflicts List */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">Đang tải...</div>
          </CardContent>
        </Card>
      ) : conflicts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">
              Không có xung đột phòng học nào trong khoảng thời gian này
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conflicts.map((conflict: any, index: number) => (
            <Card key={index} className="border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-red-500" />
                      {conflict.roomName}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(conflict.date), 'EEEE, dd/MM/yyyy', { locale: vi })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {conflict.startTime} - {conflict.endTime}
                      </span>
                      <Badge variant="destructive" className="ml-2">
                        {conflict.conflictCount} lớp trùng
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleResolveConflict}
                  >
                    Giải quyết
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {conflict.sessions.map((session: any) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(session.status)}`} />
                        <div>
                          <div className="font-medium">{session.className}</div>
                          <div className="text-sm text-gray-500">
                            {session.teacherName}
                            {session.isSubstitute && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Dạy thay
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {session.startTime} - {session.endTime}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Session Dialog */}
      <AddSessionDialog
        open={isAddSessionOpen}
        onOpenChange={setIsAddSessionOpen}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
