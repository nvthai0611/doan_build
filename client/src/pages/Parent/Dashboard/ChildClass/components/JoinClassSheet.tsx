import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Calendar, User, Clock } from 'lucide-react';
import { useToast } from '../../../../../hooks/use-toast';
import { parentClassJoinService } from '../../../../../services/parent/class-join/class-join.service';
import { useQuery } from '@tanstack/react-query';
import { parentStudentsService } from '../../../../../services/parent/students/students.service';

interface JoinClassSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JoinClassSheet = ({ open, onOpenChange }: JoinClassSheetProps) => {
  const { toast } = useToast();
  const [codeOrLink, setCodeOrLink] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  // Fetch danh sách con
  const { data: studentsResponse } = useQuery({
    queryKey: ['parent', 'students'],
    queryFn: () => parentStudentsService.getChildren(),
    enabled: open && !!classInfo,
  });

  const students = studentsResponse?.data || [];

  // Reset when close
  useEffect(() => {
    if (!open) {
      setCodeOrLink('');
      setPassword('');
      setClassInfo(null);
      setSelectedStudentId('');
      setShowPasswordInput(false);
    }
  }, [open]);

  const handleSearchClass = async () => {
    if (!codeOrLink.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã code hoặc link lớp học",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await parentClassJoinService.getClassInfo({ 
        codeOrLink: codeOrLink.trim()
      });
      console.log(response.data);
      
      setClassInfo(response.data);
      
      toast({
        title: "Thành công",
        description: "Đã tìm thấy lớp học",
      });
    } catch (error: any) {
      const errorData = error.response?.data;
      toast({
        title: "Lỗi",
        description: errorData?.message || "Không tìm thấy lớp học",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinClass = async () => {
    if (!selectedStudentId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn học sinh",
        variant: "destructive",
      });
      return;
    }

    // Nếu lớp yêu cầu password nhưng chưa nhập
    if (classInfo.requirePassword && !password) {
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
      await parentClassJoinService.requestJoinClass({
        classId: classInfo.id,
        studentId: selectedStudentId,
        password: password || undefined,
      });
      
      toast({
        title: "Thành công",
        description: "Đã gửi yêu cầu tham gia lớp học. Vui lòng đợi phê duyệt.",
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.log(error);
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
          description: errorData?.message || error.message || "Có lỗi xảy ra",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={true}>
      <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold">Tham gia lớp học</SheetTitle>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Input code/link */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">code/link</Label>
            <Input
              placeholder="Nhập mã code hoặc link lớp học"
              value={codeOrLink}
              onChange={(e) => setCodeOrLink(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !classInfo) {
                  handleSearchClass();
                }
              }}
              disabled={!!classInfo}
              className="w-full"
            />
          </div>

          {/* Nút tìm kiếm */}
          {!classInfo && (
            <Button
              onClick={handleSearchClass}
              disabled={isLoading}
              className="w-full bg-foreground text-background hover:bg-foreground/90"
            >
              {isLoading ? 'Đang tìm...' : 'Tìm kiếm'}
            </Button>
          )}

          {/* Thông tin lớp học */}
          {classInfo && (
            <div className="space-y-4 border-t pt-4">
              {/* Header với nút tìm lại */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Thông tin lớp học</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setClassInfo(null);
                    setPassword('');
                    setShowPasswordInput(false);
                  }}
                >
                  Tìm lớp khác
                </Button>
              </div>

              {/* Tên lớp học */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Tên lớp học</Label>
                <p className="text-base font-semibold mt-1">{classInfo.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Mã lớp học */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Mã lớp học</Label>
                  <p className="text-base mt-1">{classInfo.classCode || '-'}</p>
                </div>

                {/* Khóa học */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Khóa học</Label>
                  <p className="text-base mt-1">{classInfo.subject?.name || '-'}</p>
                </div>
              </div>

              {/* Giáo viên */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Giáo viên</Label>
                <p className="text-base mt-1">{classInfo.teacher?.fullName || '-'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Ngày bắt đầu */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Ngày bắt đầu</Label>
                  <p className="text-base mt-1">
                    {classInfo.actualStartDate 
                      ? new Date(classInfo.actualStartDate).toLocaleDateString('vi-VN')
                      : classInfo.expectedStartDate
                      ? new Date(classInfo.expectedStartDate).toLocaleDateString('vi-VN')
                      : '-'}
                  </p>
                </div>

                {/* Ngày kết thúc */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Ngày kết thúc</Label>
                  <p className="text-base mt-1">
                    {classInfo.actualEndDate 
                      ? new Date(classInfo.actualEndDate).toLocaleDateString('vi-VN')
                      : '-'}
                  </p>
                </div>
              </div>

              {/* Lịch học hàng tuần */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Lịch học hàng tuần</Label>
                {classInfo.recurringSchedule && formatSchedule(classInfo?.recurringSchedule?.schedules).length > 0 ? (
                  <div className="mt-2 space-y-1">
                    {formatSchedule(classInfo?.recurringSchedule?.schedules).map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm border-l-2 border-blue-500 pl-3 py-1">
                        <span className="font-medium">{item.day}</span>
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{item.time}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-base mt-1 text-muted-foreground">Chưa có lịch học</p>
                )}
              </div>

              {/* Mô tả */}
              {classInfo.description && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Mục tiêu bài học:</Label>
                  <div 
                    className="mt-2 text-sm prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: classInfo.description }}
                  />
                </div>
              )}

              {/* Chọn học sinh */}
              <div className="border-t pt-4 space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Chọn học sinh</Label>
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

                {/* Password input - Hiện khi lớp yêu cầu password hoặc sau khi bị lỗi password */}
                {(classInfo.requirePassword || showPasswordInput) && (
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
              </div>

              {/* Nút tham gia */}
              <Button
                onClick={handleJoinClass}
                disabled={isLoading || !selectedStudentId}
                className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 text-base font-semibold"
              >
                {isLoading ? 'Đang gửi yêu cầu...' : 'Tham gia'}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default JoinClassSheet;

