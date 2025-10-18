import { ArrowLeft, Edit, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface ClassHeaderProps {
  classData: any;
}

const statusColors: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

export function ClassHeader({ classData }: ClassHeaderProps) {
  const navigate = useNavigate();

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      draft: "Chưa diễn ra",
      active: "Đang diễn ra",
      completed: "Đã kết thúc",
      cancelled: "Đã Hủy",
    };
    return statusMap[status] ?? status;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/teacher/classes")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="w-4 h-4" />
              Sửa
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Copy className="w-4 h-4" />
              Sao chép
            </Button>
            <Button variant="destructive" size="sm" className="gap-2">
              <Trash2 className="w-4 h-4" />
              Xóa
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {classData?.name ?? "N/A"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {classData?.description ?? "Không có mô tả"}
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Trạng thái:
              </span>
              <Badge
                className={`${
                  statusColors[classData?.status as keyof typeof statusColors] ??
                  "bg-gray-100"
                }`}
              >
                {getStatusLabel(classData?.status ?? "")}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Năm học:
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {classData?.academicYear ?? "N/A"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Sức chứa:
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {classData?.studentCount ?? 0}/{classData?.maxStudents ?? 0} học
                sinh
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Khối:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {classData?.grade?.name ?? "N/A"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Môn học:
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {classData?.subject?.name ?? "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
