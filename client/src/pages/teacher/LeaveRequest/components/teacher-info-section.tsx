import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TeacherInfoSectionProps {
  teacherName: string;
  subject: string;
}

export function TeacherInfoSection({
  teacherName,
  subject,
}: TeacherInfoSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg shadow-md">
          1
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Thông Tin Giáo Viên
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 pl-0 md:pl-13">
        <div className="space-y-2">
          <Label htmlFor="teacherName" className="text-sm font-medium">
            Tên Giáo Viên
          </Label>
          <Input
            id="teacherName"
            value={teacherName}
            disabled
            className="h-11 bg-gray-100 dark:bg-gray-800"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject" className="text-sm font-medium">
            Môn Giảng Dạy
          </Label>
          <Input
            id="subject"
            value={subject}
            disabled
            className="h-11 bg-gray-100 dark:bg-gray-800"
          />
        </div>
      </div>
    </div>
  );
}
