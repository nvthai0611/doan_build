import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, User, Clock, AlertCircle, Download } from 'lucide-react';
import { useToast } from '../../../../../hooks/use-toast';
import { parentClassJoinService } from '../../../../../services/parent/class-join/class-join.service';
import { useQuery } from '@tanstack/react-query';
import { parentStudentsService } from '../../../../../services/parent/students/students.service';
import { parentCommitmentsService } from '../../../../../services/parent/commitments/commitments.service';

interface JoinClassSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JoinClassSheet = ({ open, onOpenChange }: JoinClassSheetProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [codeOrLink, setCodeOrLink] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState('');
  
  // Link mẫu form cam kết học tập
  const COMMITMENT_FORM_URL = 'https://res.cloudinary.com/dgqkmqkdz/raw/upload/v1761971845/ban-cam-ket-cua-hoc-sinh-so-2_1603112518_wtpcg3.docx';
  
  // Fetch danh sách con
  const { data: studentsResponse } = useQuery({
    queryKey: ['parent', 'students'],
    queryFn: () => parentStudentsService.getChildren(),
    enabled: open && !!classInfo,
  });

  const students = studentsResponse?.data || [];

  // Fetch danh sách hợp đồng của học sinh đã chọn
  const { data: commitmentsResponse } = useQuery({
    queryKey: ['commitments', selectedStudentId],
    queryFn: () => parentCommitmentsService.getStudentCommitments(selectedStudentId),
    enabled: !!selectedStudentId && !!classInfo,
  });

  const allCommitments = commitmentsResponse?.data || [];
  
  // Filter hợp đồng có môn học của lớp và chưa hết hạn (memoize để tránh re-render)
  const validCommitments = useMemo(() => {
    if (!classInfo?.subject?.id) return [];
    const subjectId = classInfo.subject.id;
    return allCommitments.filter((commitment: any) => {
      const hasSubject = commitment.subjectIds?.includes(subjectId);
      const isNotExpired = !commitment.expiredAt || new Date(commitment.expiredAt) > new Date();
      return hasSubject && isNotExpired;
    });
  }, [allCommitments, classInfo?.subject?.id]);

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
      setCodeOrLink('');
      setPassword('');
      setMessage('');
      setClassInfo(null);
      setSelectedStudentId('');
      setShowPasswordInput(false);
      setSelectedContractId('');
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
    if (!classInfo) {
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

    // Validate: Phải có hợp đồng
    if (!selectedContractId || selectedContractId.trim() === '') {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn hợp đồng cam kết học tập",
        variant: "destructive",
      });
      return;
    }

    // Validate: Đảm bảo các field có giá trị
    if (!classInfo.id || !selectedStudentId || !selectedContractId) {
      toast({
        title: "Lỗi",
        description: "Thiếu thông tin cần thiết. Vui lòng kiểm tra lại.",
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
      await parentClassJoinService.requestJoinClassForm({
        classId: classInfo.id,
        studentId: selectedStudentId,
        contractUploadId: selectedContractId,
        password: password || undefined,
        message: message || `Phụ huynh đăng ký lớp học cho con`,
      });
      
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
            <Label className="text-sm font-medium text-muted-foreground">code</Label>
            <Input
              placeholder="Nhập mã code lớp học"
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
                    Bản cam kết học tập <span className="text-red-500">*</span>
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
                                  Đã tự động chọn hợp đồng hợp lệ
                                </p>
                                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                  Hợp đồng {new Date(selectedCommitment.uploadedAt).toLocaleDateString('vi-VN')} - 
                                  Hết hạn: {selectedCommitment.expiredAt 
                                    ? new Date(selectedCommitment.expiredAt).toLocaleDateString('vi-VN')
                                    : 'Không hết hạn'}
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                  Để upload hoặc cập nhật hợp đồng, vui lòng đến{' '}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onOpenChange(false);
                                      navigate('/parent/commitments');
                                    }}
                                    className="underline font-medium hover:text-green-900 dark:hover:text-green-200"
                                  >
                                    trang quản lý hợp đồng
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
                                  ? 'Chưa có hợp đồng hợp lệ'
                                  : 'Hợp đồng chưa có môn học bạn đăng ký'}
                              </p>
                              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                                {allCommitments.length === 0
                                  ? `Học sinh này chưa có hợp đồng nào cho môn "${classInfo.subject?.name || ''}". Vui lòng đến trang quản lý hợp đồng để upload hợp đồng trước.`
                                  : `Hợp đồng hiện tại không bao gồm môn "${classInfo.subject?.name || ''}" hoặc hợp đồng đã hết hạn. Vui lòng cập nhật bản cam kết mới có môn học này.`}
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
                                  Đến trang quản lý hợp đồng
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
              </div>

              {/* Nút tham gia */}
              <Button
                onClick={handleJoinClass}
                disabled={isLoading || !selectedStudentId || !selectedContractId}
                className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 text-base font-semibold"
              >
                {isLoading ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu tham gia'}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default JoinClassSheet;

