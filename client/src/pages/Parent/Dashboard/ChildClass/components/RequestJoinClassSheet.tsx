import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { X, Clock, Download, Upload, GraduationCap, User } from 'lucide-react';
import { useToast } from '../../../../../hooks/use-toast';
import { parentClassJoinService } from '../../../../../services/parent/class-join/class-join.service';
import { useQuery } from '@tanstack/react-query';
import { parentStudentsService } from '../../../../../services/parent/students/students.service';
import { RecruitingClass } from '../../../../../services/common/public-classes.service';

interface RequestJoinClassSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: RecruitingClass | null;
}

export const RequestJoinClassSheet = ({ open, onOpenChange, classData }: RequestJoinClassSheetProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  // Fetch danh sách con
  const { data: studentsResponse, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['parent', 'students'],
    queryFn: () => parentStudentsService.getChildren(),
    enabled: open,
  });

  const students = studentsResponse?.data || [];
  const hasNoChildren = !isLoadingStudents && students.length === 0;

  // Reset when close
  useEffect(() => {
    if (!open) {
      setPassword('');
      setMessage('');
      setContractFile(null);
      setSelectedStudentId('');
      setShowPasswordInput(false);
    }
  }, [open]);

  // Auto-populate from sessionStorage if available
  useEffect(() => {
    if (open && !classData) {
      const pendingClassId = sessionStorage.getItem('pendingClassJoin');
      if (pendingClassId) {
        // TODO: Load class data if needed
        sessionStorage.removeItem('pendingClassJoin');
      }
    }
  }, [open, classData]);

  const handleRequestJoin = async () => {
    if (!classData) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin lớp học",
        variant: "destructive",
      });
      return;
    }

    if (!selectedStudentId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn học sinh",
        variant: "destructive",
      });
      return;
    }

    if (!contractFile) {
      toast({
        title: "Lỗi",
        description: "Vui lòng upload bản cam kết học tập",
        variant: "destructive",
      });
      return;
    }

    // Nếu lớp yêu cầu password nhưng chưa nhập
    if (classData.requirePassword && !password) {
      setShowPasswordInput(true);
      toast({
        title: "Yêu cầu mật khẩu",
        description: "Lớp học này yêu cầu mật khẩu. Vui lòng nhập mật khẩu để tham gia.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Upload contract file first (integrate with cloudinary or backend upload endpoint)
      // For now, just send the request without file URL
      
      await parentClassJoinService.requestJoinClass({
        classId: classData.id,
        studentId: selectedStudentId,
        password: password || undefined,
        message: message || `Phụ huynh đăng ký lớp học cho con`,
      });
      
      toast({
        title: "Thành công",
        description: "Đã gửi yêu cầu tham gia lớp học. Vui lòng đợi trung tâm phê duyệt.",
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error requesting join class:', error);
      const errorData = error.response?.data;
      
      // Nếu lỗi do password, hiện input password
      if (errorData?.requirePassword) {
        setShowPasswordInput(true);
        toast({
          title: "Lỗi mật khẩu",
          description: errorData.message || "Mật khẩu không chính xác",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Lỗi",
          description: errorData?.message || error.message || "Có lỗi xảy ra khi gửi yêu cầu",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatSchedule = (schedule: any) => {
    if (!schedule || !Array.isArray(schedule)) return [];
    
    const dayNames: any = {
      monday: 'Thứ Hai',
      tuesday: 'Thứ Ba',
      wednesday: 'Thứ Tư',
      thursday: 'Thứ Năm',
      friday: 'Thứ Sáu',
      saturday: 'Thứ Bảy',
      sunday: 'Chủ Nhật',
    };
    
    return schedule.map((s: any) => ({
      day: dayNames[s.dayOfWeek] || s.dayOfWeek,
      time: `${s.startTime} → ${s.endTime}`
    }));
  };

  if (!classData) {
    return null;
  }

  const schedules = formatSchedule(classData.recurringSchedule?.schedules);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={true}>
      <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold">Đăng ký tham gia lớp học</SheetTitle>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Thông tin lớp học */}
          <div className="space-y-4 pb-4 border-b">
            {/* Tên lớp học */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Tên lớp học</Label>
              <p className="text-lg font-semibold mt-1">{classData.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Mã lớp */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Mã lớp</Label>
                <p className="text-sm mt-1">{classData.classCode || '-'}</p>
              </div>

              {/* Môn học */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Môn học</Label>
                <p className="text-sm mt-1">{classData.subject?.name || '-'}</p>
              </div>
            </div>

            {/* Giáo viên */}
            {classData.teacher && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Giáo viên</Label>
                  <p className="text-sm font-medium">{classData.teacher.fullName}</p>
                </div>
              </div>
            )}

            {/* Lịch học */}
            {schedules.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Lịch học hàng tuần</Label>
                <div className="mt-2 space-y-1">
                  {schedules.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-sm border-l-2 border-primary pl-3 py-1">
                      <span className="font-medium">{item.day}</span>
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Số lượng học sinh */}
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Số lượng</span>
              </div>
              <span className="text-sm font-semibold">
                {classData.currentStudents}/{classData.maxStudents || '∞'} học sinh
              </span>
            </div>
          </div>

          {/* Form đăng ký */}
          <div className="space-y-4">
            {/* Chọn học sinh */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Chọn học sinh <span className="text-red-500">*</span>
              </Label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full mt-2 px-3 py-2 border rounded-md bg-background"
              >
                <option value="">-- Chọn con của bạn --</option>
                {students.map((student: any) => (
                  <option key={student.id} value={student.id}>
                    {student.user.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Password (nếu cần) */}
            {(classData.requirePassword || showPasswordInput) && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Mật khẩu lớp học <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="password"
                  placeholder="Nhập mật khẩu để tham gia lớp"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lớp học này yêu cầu mật khẩu để tham gia
                </p>
              </div>
            )}

            {/* Message/Nguyện vọng */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Nguyện vọng/Lời nhắn <span className="text-muted-foreground/70">(Tùy chọn)</span>
              </Label>
              <Textarea
                placeholder="Ví dụ: Con tôi có nguyện vọng học lớp của thầy A..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full mt-2 min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Gửi lời nhắn hoặc nguyện vọng đến trung tâm (nếu có)
              </p>
            </div>

            {/* Upload file cam kết */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Bản cam kết học tập <span className="text-red-500">*</span>
                </Label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-primary"
                  onClick={() => {
                    // Download mẫu form cam kết
                    window.open('/templates/mau-cam-ket-hoc-tap.pdf', '_blank');
                  }}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Tải mẫu cam kết
                </Button>
              </div>
              
              <div className="border-2 border-dashed rounded-lg p-4 hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="contract-upload"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Validate file size (max 5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        toast({
                          title: "Lỗi",
                          description: "File quá lớn. Vui lòng chọn file nhỏ hơn 5MB",
                          variant: "destructive",
                        });
                        return;
                      }
                      setContractFile(file);
                    }
                  }}
                  className="hidden"
                />
                
                {!contractFile ? (
                  <label
                    htmlFor="contract-upload"
                    className="flex flex-col items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        Click để chọn file
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Hỗ trợ: JPG, PNG, PDF (tối đa 5MB)
                      </p>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {contractFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(contractFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setContractFile(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tải mẫu cam kết, điền thông tin và upload bản scan/ảnh đã ký
              </p>
            </div>
          </div>

          {/* Nút gửi yêu cầu */}
          <Button
            onClick={handleRequestJoin}
            disabled={isLoading || !selectedStudentId || !contractFile}
            className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 text-base font-semibold"
          >
            {isLoading ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu tham gia'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RequestJoinClassSheet;

