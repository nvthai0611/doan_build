import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Calendar, User, Clock, Upload, Download } from 'lucide-react';
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
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [contractPreviewUrl, setContractPreviewUrl] = useState<string>('');
  const [contractMimeType, setContractMimeType] = useState<string>('');
  
  // Link mẫu form cam kết học tập
  const COMMITMENT_FORM_URL = 'https://res.cloudinary.com/dgqkmqkdz/raw/upload/v1761971845/ban-cam-ket-cua-hoc-sinh-so-2_1603112518_wtpcg3.docx';

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
      setMessage('');
      setClassInfo(null);
      setSelectedStudentId('');
      setShowPasswordInput(false);
      setContractFile(null);
      setContractPreviewUrl('');
      setContractMimeType('');
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

    if (!contractFile) {
      toast({
        title: "Lỗi",
        description: "Vui lòng upload bản cam kết học tập",
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
        password: password || undefined,
        message: message || `Phụ huynh đăng ký lớp học cho con`,
        commitmentFile: contractFile as File,
      });
      
      toast({
        title: "Thành công",
        description: "Đã gửi yêu cầu tham gia lớp học. Vui lòng đợi trung tâm phê duyệt.",
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.log(error);
      const errorData = error.response?.data || error.response?.message;
      
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
                        // Download mẫu form cam kết từ bên thứ 3
                        window.open(COMMITMENT_FORM_URL, '_blank');
                      }}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Tải mẫu cam kết
                    </Button>
                  </div>
                  
                  <div className={`border-2 border-dashed rounded-lg p-4 hover:border-primary/50 transition-colors ${!contractFile ? 'border-red-300' : ''}`}>
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
                          setContractMimeType(file.type || '');
                          try {
                            const url = URL.createObjectURL(file);
                            setContractPreviewUrl(url);
                          } catch (_) {
                            setContractPreviewUrl('');
                          }
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
                      <div className="space-y-3">
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
                          <div className="flex items-center gap-2">
                            {contractPreviewUrl && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const a = document.createElement('a');
                                  a.href = contractPreviewUrl;
                                  a.target = '_blank';
                                  a.rel = 'noopener noreferrer';
                                  a.click();
                                }}
                              >
                                Xem file
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setContractFile(null);
                                if (contractPreviewUrl) URL.revokeObjectURL(contractPreviewUrl);
                                setContractPreviewUrl('');
                                setContractMimeType('');
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Inline preview */}
                        {contractPreviewUrl && (
                          contractMimeType.startsWith('image/') ? (
                            <img
                              src={contractPreviewUrl}
                              alt="Xem trước bản cam kết"
                              className="max-h-64 rounded border"
                            />
                          ) : (
                            <div className="text-xs text-muted-foreground">
                              File tài liệu (PDF). Bấm "Xem file" để mở trong tab mới.
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tải mẫu cam kết, điền thông tin và upload bản scan/ảnh đã ký
                  </p>
                  {!contractFile && (
                    <p className="text-xs text-red-500 mt-1">Bắt buộc phải upload bản cam kết</p>
                  )}
                </div>
              </div>

              {/* Nút tham gia */}
              <Button
                onClick={handleJoinClass}
                disabled={isLoading || !selectedStudentId || !contractFile}
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

