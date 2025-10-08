'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';

interface LeaveDetailsSectionProps {
  leaveType: string;
  setLeaveType: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  totalDays: number;
  reason: string;
  setReason: (value: string) => void;
}

export function LeaveDetailsSection({
  leaveType,
  setLeaveType,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  totalDays,
  reason,
  setReason,
}: LeaveDetailsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg shadow-md">
          2
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Chi Tiết Nghỉ Phép
        </h2>
      </div>

      <div className="space-y-6 pl-0 md:pl-13">
        <div className="space-y-2">
          <Label htmlFor="leaveType" className="text-sm font-medium">
            Loại Nghỉ Phép <span className="text-red-600">*</span>
          </Label>
          <Select value={leaveType} onValueChange={setLeaveType} required>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Chọn loại nghỉ phép" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="with-permission">Nghỉ có phép</SelectItem>
              <SelectItem value="without-permission">
                Nghỉ không phép
              </SelectItem>
              <SelectItem value="sick-leave">Nghỉ ốm</SelectItem>
              <SelectItem value="other">Khác</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-sm font-medium">
              Ngày Bắt Đầu <span className="text-red-600">*</span>
            </Label>
            <div className="relative">
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="h-11 pr-10"
              />
              <Calendar className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm font-medium">
              Ngày Kết Thúc <span className="text-red-600">*</span>
            </Label>
            <div className="relative">
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                min={startDate}
                className="h-11 pr-10"
              />
              <Calendar className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalDays" className="text-sm font-medium">
              Tổng Số Ngày
            </Label>
            <Input
              id="totalDays"
              value={totalDays}
              disabled
              className="h-11 bg-gray-100 dark:bg-gray-800 font-semibold"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason" className="text-sm font-medium">
            Lý Do Nghỉ Phép <span className="text-red-600">*</span>
          </Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            placeholder="Nhập lý do xin nghỉ phép..."
            className="min-h-28 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
