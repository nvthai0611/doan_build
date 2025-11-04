import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Info, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CloneClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: any;
  onSubmit: (data: CloneClassData) => void;
  isLoading?: boolean;
}

export interface CloneClassData {
  name: string;
  cloneSchedule: boolean;
  cloneTeacher: boolean;
  cloneStudents: boolean;
  cloneCurriculum: boolean;
  cloneRoom: boolean;
}

export const CloneClassDialog = ({
  open,
  onOpenChange,
  classData,
  onSubmit,
  isLoading = false
}: CloneClassDialogProps) => {
  const [formData, setFormData] = useState<CloneClassData>({
    name: '',
    cloneSchedule: true,
    cloneTeacher: false,
    cloneStudents: false,
    cloneCurriculum: true,
    cloneRoom: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  // Auto-generate name when dialog opens
  useEffect(() => {
    if (open && classData) {
      // Generate smart clone name
      let newName = classData.name;
      // Remove existing "-Clone" or "-Clone-N" suffix if present
      newName = newName.replace(/-Clone(-\d+)?$/i, '');
      // Add "-Clone" suffix
      newName = `${newName}-Clone`;
      setFormData(prev => ({
        ...prev,
        name: newName
      }));
      setErrors({});
    }
  }, [open, classData]);

  const handleSubmit = () => {
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên lớp học là bắt buộc';
    }

    if (formData.name === classData?.name) {
      newErrors.name = 'Tên lớp mới phải khác lớp gốc';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const handleCheckboxChange = (field: keyof CloneClassData, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  if (!classData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Clone lớp học
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Source Class Info */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="text-sm text-gray-500 dark:text-gray-400">Lớp gốc</div>
                <div className="font-semibold text-lg">{classData.name}</div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">{classData.subjectName}</Badge>
                  <Badge variant="outline">{classData.gradeName}</Badge>
                  {classData.teacher && (
                    <Badge variant="outline">GV: {classData.teacher.name}</Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Học sinh</div>
                <div className="font-semibold">{classData.studentCount || 0} học sinh</div>
              </div>
            </div>
          </div>

          {/* New Class Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Tên lớp mới <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }));
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: '' }));
                }
              }}
              placeholder="Nhập tên lớp học mới..."
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Clone Options */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Nội dung cần clone</Label>
            
            <div className="space-y-3 border rounded-lg p-4">
              {/* Clone Schedule */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="cloneSchedule"
                  checked={formData.cloneSchedule}
                  onCheckedChange={(checked) => handleCheckboxChange('cloneSchedule', checked as boolean)}
                />
                <div className="flex-1">
                  <label
                    htmlFor="cloneSchedule"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Lịch học
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Sao chép lịch học hàng tuần (thứ, giờ học)
                  </p>
                  {classData.recurringSchedule && (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                      {classData.recurringSchedule.schedules?.map((s: any, i: number) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="inline-block w-1 h-1 rounded-full bg-green-400"></span>
                          <span>{s.day}: {s.startTime} - {s.endTime}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Clone Teacher */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="cloneTeacher"
                  checked={formData.cloneTeacher}
                  onCheckedChange={(checked) => handleCheckboxChange('cloneTeacher', checked as boolean)}
                />
                <div className="flex-1">
                  <label
                    htmlFor="cloneTeacher"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Giáo viên (tùy chọn)
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Gán cùng giáo viên phụ trách
                    {classData.teacher && (
                      <span className="ml-1 font-medium">({classData.teacher.name})</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Clone Room */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="cloneRoom"
                  checked={formData.cloneRoom}
                  onCheckedChange={(checked) => handleCheckboxChange('cloneRoom', checked as boolean)}
                />
                <div className="flex-1">
                  <label
                    htmlFor="cloneRoom"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Phòng học
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Sử dụng cùng phòng học
                    {classData.roomName && (
                      <span className="ml-1 font-medium">({classData.roomName})</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Clone Curriculum */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="cloneCurriculum"
                  checked={formData.cloneCurriculum}
                  onCheckedChange={(checked) => handleCheckboxChange('cloneCurriculum', checked as boolean)}
                />
                <div className="flex-1">
                  <label
                    htmlFor="cloneCurriculum"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Chương trình học
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Sao chép toàn bộ chương trình học (lessons, materials)
                  </p>
                </div>
              </div>

              {/* Clone Students */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="cloneStudents"
                  checked={formData.cloneStudents}
                  onCheckedChange={(checked) => handleCheckboxChange('cloneStudents', checked as boolean)}
                />
                <div className="flex-1">
                  <label
                    htmlFor="cloneStudents"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Học sinh
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Thêm tất cả học sinh hiện tại vào lớp mới ({classData.studentCount || 0} học sinh)
                  </p>
                  {formData.cloneStudents && (
                    <Alert className="mt-2">
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Học sinh sẽ được ghi danh vào cả 2 lớp. Hãy kiểm tra lịch học để tránh xung đột.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Lớp mới sẽ được tạo ở trạng thái <strong>"Nháp"</strong>. Bạn có thể chỉnh sửa và kích hoạt sau.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang clone...
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Clone lớp học
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

