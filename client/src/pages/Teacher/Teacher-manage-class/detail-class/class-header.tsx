import { ArrowLeft, Edit, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface ClassHeaderProps {
  classData: any;
}

const statusColors: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
};

/**
 * Map status to Vietnamese label
 */
function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    draft: 'Chưa diễn ra',
    active: 'Đang diễn ra',
    completed: 'Đã kết thúc',
    cancelled: 'Đã Hủy',
  };
  return statusMap[status] ?? status;
}

export function ClassHeader({ classData }: ClassHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-6 py-4">
        <div className="space-y-4">
          {/* Title and Breadcrumb */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {classData?.name ?? 'N/A'}
            </h1>

            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <button
                    onClick={() => navigate('/teacher/classes')}
                    className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                  >
                    Danh sách lớp học
                  </button>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {classData?.name ?? 'N/A'}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Info Summary */}
          <div className="flex items-center gap-6 flex-wrap pt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Trạng thái:
              </span>
              <Badge
                className={
                  statusColors[classData?.status as keyof typeof statusColors] ??
                  'bg-gray-100'
                }
              >
                {getStatusLabel(classData?.status ?? '')}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Năm học:
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {classData?.academicYear ?? 'N/A'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Sức chứa:
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {classData?.studentCount ?? 0}/{classData?.maxStudents ?? 0} học
                sinh
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Khối:
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {classData?.grade?.name ?? 'N/A'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Môn học:
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {classData?.subject?.name ?? 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
