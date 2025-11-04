'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ReplacementTeacherSectionProps {
  replacementTeacher: string;
  setReplacementTeacher: (value: string) => void;
}

export function ReplacementTeacherSection({
  replacementTeacher,
  setReplacementTeacher,
}: ReplacementTeacherSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg shadow-md">
          4
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Giáo Viên Thay Thế
        </h2>
      </div>

      <div className="space-y-2 pl-0 md:pl-13">
        <Label htmlFor="replacementTeacher" className="text-sm font-medium">
          Đề Xuất Giáo Viên Dạy Thay
        </Label>
        <Select
          value={replacementTeacher}
          onValueChange={setReplacementTeacher}
        >
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Chọn giáo viên thay thế (không bắt buộc)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="teacher1">Trần Thị B - Toán học</SelectItem>
            <SelectItem value="teacher2">Lê Văn C - Toán học</SelectItem>
            <SelectItem value="teacher3">Phạm Thị D - Toán học</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Tùy chọn: Đề xuất giáo viên cùng bộ môn để dạy thay. Quản lý sẽ phân
          công cuối cùng.
        </p>
      </div>
    </div>
  );
}
