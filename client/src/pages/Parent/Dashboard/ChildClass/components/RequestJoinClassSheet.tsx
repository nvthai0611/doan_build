import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Clock, GraduationCap, User, Calendar, AlertCircle, Download } from 'lucide-react';
import { useToast } from '../../../../../hooks/use-toast';
import { parentClassJoinService } from '../../../../../services/parent/class-join/class-join.service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { parentStudentsService } from '../../../../../services/parent/students/students.service';
import { RecruitingClass } from '../../../../../services/common/public-classes.service';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ClassStatus, CLASS_STATUS_LABELS } from '../../../../../lib/constants';
import { parentCommitmentsService } from '../../../../../services/parent/commitments/commitments.service';
import { UploadCommitmentDialog } from '../../Commitments/components/UploadCommitmentDialog';

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
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState('');
  
  // Link mẫu form cam kết học tập
  const COMMITMENT_FORM_URL = 'https://res.cloudinary.com/dgqkmqkdz/raw/upload/v1761971845/ban-cam-ket-cua-hoc-sinh-so-2_1603112518_wtpcg3.docx';
  
  // Fetch danh sách con
  const { data: studentsResponse, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['parent', 'students'],
    queryFn: () => parentStudentsService.getChildren(),
    enabled: open,
  });
  const students = studentsResponse?.data || [];
  const hasNoChildren = !isLoadingStudents && students.length === 0;

  // Fetch danh sách hợp đồng của học sinh đã chọn
  const { data: commitmentsResponse } = useQuery({
    queryKey: ['commitments', selectedStudentId],
    queryFn: () => parentCommitmentsService.getStudentCommitments(selectedStudentId),
    enabled: !!selectedStudentId && !!classData,
  });

  const allCommitments = commitmentsResponse?.data || [];
  
  // Filter hợp đồng có môn học của lớp và chưa hết hạn (memoize để tránh re-render)
  const validCommitments = useMemo(() => {
    if (!classData?.subject?.id) return [];
    const subjectId = classData.subject.id;
    return allCommitments.filter((commitment: any) => {
      const hasSubject = commitment.subjectIds?.includes(subjectId);
      const isNotExpired = !commitment.expiredAt || new Date(commitment.expiredAt) > new Date();
      return hasSubject && isNotExpired;
    });
  }, [allCommitments, classData?.subject?.id]);

  // Tự động chọn hợp đồng hợp lệ đầu tiên (nếu có)
  useEffect(() => {
    if (validCommitments.length > 0 && !selectedContractId) {
      setSelectedContractId(validCommitments[0].id);
    } else if (validCommitments.length === 0 && selectedContractId) {
      // Nếu hợp đồng đã chọn không còn hợp lệ (không có môn học hoặc hết hạn)
      setSelectedContractId('');
    }
  }, [validCommitments, selectedContractId]);

  // Kiểm tra hợp đồng đã chọn có hợp lệ không
  const selectedCommitment = validCommitments.find((c: any) => c.id === selectedContractId);
  const hasValidCommitment = !!selectedCommitment;

  // Reset when close
  useEffect(() => {
    if (!open) {
      setPassword('');
      setMessage('');
      setSelectedStudentId('');
      setShowPasswordInput(false);
      setSelectedContractId('');
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

    // Validate: Đảm bảo các field có giá trị
    if (!classData.id || !selectedStudentId) {
      toast({
        title: "Lỗi",
        description: "Thiếu thông tin cần thiết. Vui lòng kiểm tra lại.",
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
      const payload: any = {
        classId: classData.id,
        studentId: selectedStudentId,
        password: password || undefined,
        message: message || `Phụ huynh đăng ký lớp học cho con`,
      };

      if (selectedContractId) {
        payload.contractUploadId = selectedContractId;
      }

      await parentClassJoinService.requestJoinClassForm(payload);
      
      toast({
        title: "Thành công",
        description: "Đã gửi yêu cầu tham gia lớp học. Vui lòng đợi trung tâm phê duyệt.",
      });
      
      onOpenChange(false);
    } catch (error: any) {
      const errorData = error.response?.data || error.response?.message || error;
      
      // Xử lý validation errors từ backend (array of objects)
      let errorMessage = "Có lỗi xảy ra khi gửi yêu cầu";
      
      if (errorData && typeof errorData === 'object') {
        // Nếu là array validation errors
        if (Array.isArray(errorData.message)) {
          const validationMessages = errorData.message
            .map((item: any) => {
              if (typeof item === 'object') {
                return Object.values(item).join(', ');
              }
              return String(item);
            })
            .filter(Boolean);
          errorMessage = validationMessages.length > 0 
            ? validationMessages.join('. ') 
            : "Vui lòng kiểm tra lại thông tin đã nhập";
        } 
        // Nếu là string message
        else if (typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        }
        // Nếu có requirePassword
        else if (errorData.requirePassword) {
          setShowPasswordInput(true);
          toast({
            title: "Lỗi mật khẩu",
            description: typeof errorData.message === 'string' ? errorData.message : "Mật khẩu không chính xác",
            variant: "destructive",
          });
          return;
        }
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
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
    
    return schedule.map((s: any) => {
      const dayKey = s.dayOfWeek?.toLowerCase() || s.day?.toLowerCase();
      const dayName = dayNames[dayKey] || s.dayOfWeek || s.day || '?';
      return {
        day: dayName,
        time: `${s.startTime} → ${s.endTime}`
      };
    });
  };

  // Kiểm tra xem có cần đến trung tâm làm test không
  const requiresInPersonTest = () => {
    // Chỉ áp dụng cho lớp đang hoạt động (active)
    if (!classData || classData.status !== ClassStatus.ACTIVE) {
      return false;
    }

    // Kiểm tra lớp còn chỗ trống không
    const hasAvailableSlots = classData.maxStudents ? classData.currentStudents < classData.maxStudents : true;
    if (!hasAvailableSlots) {
      return false; // Lớp đã đầy, không thể đăng ký
    }

    // Lấy số buổi đã hoàn thành từ database (backend đã đếm)
    const completedSessions = classData.completedSessionsCount || 0;
    
    // Nếu đã qua 2 buổi trở lên thì yêu cầu đến trung tâm
    return completedSessions >= 2;
  };
  

  if (!classData) {
    return null;
  }

  const schedules = formatSchedule(classData.recurringSchedule?.schedules);
  const needsInPersonTest = requiresInPersonTest();
  const pastSessionsCount = classData.completedSessionsCount || 0;
  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange} modal={true}>
        <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold">Đăng ký tham gia lớp học</SheetTitle>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Thông báo yêu cầu test trực tiếp */}
          {needsInPersonTest && (
            <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <AlertDescription className="text-sm text-amber-800 dark:text-amber-200 ml-2">
                <p className="font-semibold mb-2">Lớp học đã diễn ra {pastSessionsCount} buổi</p>
                <p className="mb-2">
                  Để đảm bảo học sinh có thể theo kịp chương trình học, quý phụ huynh vui lòng đến trực tiếp trung tâm để:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Trao đổi với giáo viên về tình trạng lớp học</li>
                  <li>Đánh giá năng lực học sinh (nếu cần)</li>
                  <li>Hoàn tất thủ tục đăng ký tham gia lớp</li>
                </ul>
                <p className="mt-3 font-medium">
                  📞 Vui lòng liên hệ trung tâm để đặt lịch hẹn và làm test đầu vào
                </p>
              </AlertDescription>
            </Alert>
          )}

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

            {/* Ngày học - Hiển thị theo trạng thái lớp */}
            {classData.status === ClassStatus.READY ? (
              // Lớp đang tuyển sinh → Hiển thị ngày bắt đầu dự kiến
              classData.expectedStartDate && (
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Ngày bắt đầu dự kiến</Label>
                    <p className="text-sm font-medium">
                      {new Date(classData.expectedStartDate).toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )
            ) : (
              // Lớp đang diễn ra → Hiển thị ngày bắt đầu và ngày kết thúc
              (classData.actualStartDate || classData.actualEndDate) && (
                <div className="space-y-2">
                  {classData.actualStartDate && (
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Ngày bắt đầu</Label>
                        <p className="text-sm font-medium">
                          {new Date(classData.actualStartDate).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  {classData.actualEndDate && (
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Ngày kết thúc</Label>
                        <p className="text-sm font-medium">
                          {new Date(classData.actualEndDate).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
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

          {/* Form đăng ký - Ẩn nếu cần đến trung tâm */}
          {!needsInPersonTest && (
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

            {/* Hợp đồng cam kết - Tự động chọn */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Bản cam kết học tập <span className="text-muted-foreground/70">(Tùy chọn)</span>
              </Label>
              {selectedStudentId ? (
                <div className="mt-2">
                  {hasValidCommitment && selectedCommitment ? (
                    <div className="space-y-2">
                      <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                              Đã tự động chọn bản cam kết hợp lệ
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                              Bản cam kết {new Date(selectedCommitment.uploadedAt).toLocaleDateString('vi-VN')} - 
                              Hết hạn: {selectedCommitment.expiredAt 
                                ? new Date(selectedCommitment.expiredAt).toLocaleDateString('vi-VN')
                                : 'Không hết hạn'}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                              Để upload hoặc cập nhật bản cam kết, vui lòng đến{' '}
                              <button
                                type="button"
                                onClick={() => {
                                  onOpenChange(false);
                                  navigate('/parent/commitments');
                                }}
                                className="underline font-medium hover:text-green-900 dark:hover:text-green-200"
                              >
                                trang quản lý bản cam kết
                              </button>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 border border-red-300 rounded-lg bg-red-50 dark:bg-red-950/20">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-800 dark:text-red-200">
                            {allCommitments.length === 0 
                              ? 'Chưa có bản cam kết hợp lệ'
                              : 'Hợp đồng chưa có môn học bạn đăng ký'}
                          </p>
                          <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                            {allCommitments.length === 0
                              ? `Học sinh này chưa có bản cam kết nào cho môn "${classData.subject?.name || ''}". Bạn vẫn có thể gửi yêu cầu, trung tâm sẽ hướng dẫn hoàn tất bản cam kết sau.`
                              : `Bản cam kết hiện tại không bao gồm môn "${classData.subject?.name || ''}" hoặc bản cam kết đã hết hạn. Bạn vẫn có thể gửi yêu cầu, đồng thời chuẩn bị bản cam kết có môn học này.`}
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                onOpenChange(false);
                                navigate('/parent/commitments');
                              }}
                            >
                              Đến trang quản lý bản cam kết
                            </Button>
                            <Button
                              type="button"
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-primary"
                              onClick={() => {
                                window.open(COMMITMENT_FORM_URL, '_blank');
                              }}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Tải mẫu cam kết
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-2">
                  Vui lòng chọn học sinh trước
                </p>
              )}
            </div>

            {/* Nút gửi yêu cầu */}
            <Button
              onClick={handleRequestJoin}
              disabled={isLoading || !selectedStudentId}
              className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 text-base font-semibold"
            >
              {isLoading ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu tham gia'}
            </Button>
          </div>
          )}
        </div>
      </SheetContent>
      </Sheet>
    </>
  );
};

export default RequestJoinClassSheet;

