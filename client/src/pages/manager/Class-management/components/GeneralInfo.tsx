import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  MapPin,
  Edit,
  Calendar as CalendarIcon,
  Share2,
  Copy,
  QrCode,
  RefreshCw,
  X,
  Check,
  Undo,
  UserPlus,
  GraduationCap,
  Mail,
  Phone,
  Search,
  ArrowLeft,
  Code,
} from 'lucide-react';
import { formatDateForInput, formatSchedule, convertDateToISO } from '../../../../utils/format';
import { getStatusBadge } from '../const/statusBadge';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { EditScheduleSheet } from './Sheet/EditScheduleSheet';
import { SelectTeacherSheet } from './Sheet/SelectTeacherSheet';
import { ShareClassSheet } from './Sheet/ShareClassSheet';
import { ChangeStatusDialog } from './Dialog/ChangeStatusDialog';
import { TransferTeacherSheet } from './Sheet/TransferTeacherSheet';
import { classService } from '../../../../services/center-owner/class-management/class.service';
import { useToast } from '../../../../hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../utils/clientAxios';
import { ClassStatus, CLASS_STATUS_LABELS, CLASS_STATUS_COLORS, CLASS_STATUS_BADGE_COLORS } from '../../../../lib/constants';
import studentClassRequestService from '../../../../services/center-owner/student-class-request.service';

interface GeneralInfoProps {
  classData: any;
}

export const GeneralInfo = ({ classData }: GeneralInfoProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isShareEnabled, setIsShareEnabled] = useState(false);
  const [sharePassword, setSharePassword] = useState('');
  const [isChangeStatusDialogOpen, setIsChangeStatusDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const [isAssignTeacherModalOpen, setIsAssignTeacherModalOpen] = useState(false);
  const [isAssignTeacherLoading, setIsAssignTeacherLoading] = useState(false);
  const [isTransferTeacherSheetOpen, setIsTransferTeacherSheetOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const { toast } = useToast();
  

  
  // Fetch subjects, rooms, and grades
  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const response = await apiClient.get('/subjects');
      return response;
    },
    enabled: !!classData.id,
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  const { data: roomsData } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const response = await apiClient.get('/rooms');
      return response;
    },
    enabled: !!classData.id,
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  const { data: gradesData } = useQuery({
    queryKey: ['grades'],
    queryFn: async () => {
      const response = await apiClient.get('/shared/grades');
      return response;
    },
    enabled: !!classData.id,
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  // Fetch sessions data để kiểm tra lớp đã có lịch học chưa
  const { data: sessionsData } = useQuery({
    queryKey: ['classSessions', classData.id, classData.academicYear],
    queryFn: () => classService.getClassSessions(classData.id, {
      page: 1,
      limit: 30, // Chỉ cần kiểm tra có sessions hay không
      academicYear: classData.academicYear, // Chỉ lấy sessions cùng academicYear
      sortOrder: "asc",
    }),
    enabled: !!classData.id && !!classData.academicYear,
    staleTime: 0, // Không cache data
    refetchOnWindowFocus: true
  });

  // Fetch pending requests count
  const { data: requestsData } = useQuery({
    queryKey: ['class-join-requests', classData.id],
    queryFn: () => studentClassRequestService.getAllRequests({
      classId: classData.id,
      status: 'pending',
      limit: 1000,
    }),
    enabled: !!classData.id,
    staleTime: 30000,
    refetchOnWindowFocus: true
  });
  
  // Update pending requests count
  useEffect(() => {
    if (requestsData) {
      const count = (requestsData as any)?.meta?.total || 0;
      setPendingRequestsCount(count);
    }
  }, [requestsData]);

  // Auto-open ShareClassSheet từ query params (khi click từ notifications)
  useEffect(() => {
    const openShare = searchParams.get('openShare');
    if (openShare === 'true') {
      setIsShareModalOpen(true);
      // Remove query param sau khi đã xử lý
      searchParams.delete('openShare');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);


  const subjects = (subjectsData as any)?.data || [];
  const rooms = (roomsData as any)?.data || [];
  const grades = (gradesData as any)?.data || [];
  const sessions = (sessionsData as any)?.data || [];
  const hasSessions = sessions.length > 0;
  
  // Logic kiểm tra có thể edit hay không dựa trên status
  const hasActualDates = Boolean(classData.actualStartDate || classData.actualEndDate);
  
  // - DRAFT, READY: Có thể edit tất cả
  // - ACTIVE: Không thể edit (trừ khi có quyền đặc biệt)
  // - COMPLETED, CANCELLED: Không thể edit
  // - SUSPENDED: Có thể edit một số thông tin
  const canEditGeneralInfo = classData.status === ClassStatus.DRAFT || 
                            classData.status === ClassStatus.READY ||
                            classData.status === ClassStatus.SUSPENDED ||
                            classData.status === ClassStatus.COMPLETED; 
                            
  
  const canEditActualDates = canEditGeneralInfo && hasActualDates && !hasSessions;
  const canEditExpectedDates = canEditGeneralInfo;
  // Sync editData when classData changes
  useEffect(() => {
    setEditData({
      name: classData.name || '',
      roomId: classData.roomId || classData.room?.id || '',
      gradeId: classData.gradeId || '',
      subjectId: classData.subjectId || classData.subject?.id || '',
      expectedStartDate: formatDateForInput(classData.expectedStartDate),
      actualStartDate: formatDateForInput(classData.actualStartDate),
      actualEndDate: formatDateForInput(classData.actualEndDate),
      description: classData.description || '',
      status: classData.status || ClassStatus.DRAFT,
      academicYear: classData.academicYear || '',
    });
  }, [classData]);
  
  const [editData, setEditData] = useState({
    name: classData.name || '',
    roomId: classData.roomId || classData.room?.id || '',
    gradeId: classData.gradeId || '',
    subjectId: classData.subjectId || classData.subject?.id || '',
    expectedStartDate: formatDateForInput(classData.expectedStartDate),
    actualStartDate: formatDateForInput(classData.actualStartDate),
    actualEndDate: formatDateForInput(classData.actualEndDate),
    description: classData.description || '',
    status: classData.status || 'draft',
    academicYear: classData.academicYear || '',
  });

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({}); // Clear errors when starting to edit
  };

  

  // Validation functions
  const validateRequired = (value: string): boolean => {
    return value.trim().length > 0;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Chỉ validate các trường bắt buộc: tên, khối lớp, môn học
    // Validate name - bắt buộc
    if (!validateRequired(editData.name)) {
      newErrors.name = 'Tên lớp là bắt buộc';
    }

    // Validate grade - bắt buộc
    if (!editData.gradeId || editData.gradeId === 'none') {
      newErrors.gradeId = 'Chọn khối lớp là bắt buộc';
    }

    // Validate subject - bắt buộc
    if (!editData.subjectId || editData.subjectId === 'none') {
      newErrors.subjectId = 'Môn học là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!classData.id) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy ID lớp học",
        variant: "destructive",
      });
      return;
    }

    // Validate form trước khi submit
    if (!validateForm()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng kiểm tra lại thông tin đã nhập",
        variant: "destructive",
      });
      return;
    }

    // Kiểm tra xem có thay đổi gì không
    const hasChanges = 
      editData.name.trim() !== classData.name ||
      editData.description !== (classData.description || '') ||
      editData.roomId !== (classData.roomId || '') ||
      editData.gradeId !== (classData.gradeId || '') ||
      editData.subjectId !== (classData.subjectId || classData.subject?.id || '') ||
      editData.status !== classData.status ||
      editData.academicYear !== classData.academicYear ||
      (canEditExpectedDates && editData.expectedStartDate !== formatDateForInput(classData.expectedStartDate)) ||
      (canEditActualDates && editData.actualStartDate !== formatDateForInput(classData.actualStartDate)) ||
      (canEditActualDates && editData.actualEndDate !== formatDateForInput(classData.actualEndDate));

    if (!hasChanges) {
      toast({
        title: "Thông báo",
        description: "Dữ liệu chưa có gì thay đổi",
        variant: "default",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Logic gửi dữ liệu theo status
      const updateData = {
        name: editData.name.trim(),
        description: editData.description,
        // Xử lý roomId: chỉ gửi nếu có giá trị hợp lệ, không gửi nếu rỗng hoặc 'none'
        ...(editData.roomId && editData.roomId !== 'none' && editData.roomId !== '' ? { roomId: editData.roomId } : {}),
        // Xử lý gradeId: chỉ gửi nếu có giá trị hợp lệ
        ...(editData.gradeId && editData.gradeId !== 'none' ? { gradeId: editData.gradeId } : {}),
        // Xử lý subjectId: chỉ gửi nếu có giá trị hợp lệ
        ...(editData.subjectId && editData.subjectId !== 'none' ? { subjectId: editData.subjectId } : {}),
        status: editData.status,
        academicYear: editData.academicYear,
        // Gửi expectedStartDate nếu được phép edit
        ...(canEditExpectedDates && editData.expectedStartDate ? { 
          expectedStartDate: convertDateToISO(editData.expectedStartDate) 
        } : {}),
        // Gửi actualDates nếu được phép edit
        ...(canEditActualDates ? {
          ...(editData.actualStartDate ? { actualStartDate: convertDateToISO(editData.actualStartDate) } : {}),
          ...(editData.actualEndDate ? { actualEndDate: convertDateToISO(editData.actualEndDate) } : {}),
        } : {}),
      };

      console.log('Sending update data:', updateData);
      await classService.updateClass(classData.id, updateData);
      
      toast({
        title: "Thành công",
        description: "Cập nhật thông tin lớp học thành công",
      });
      
      setIsEditing(false);
      // Refresh class data - có thể emit event hoặc callback để parent component refetch
      window.location.reload(); // Temporary solution
    } catch (error: any) {
      // Hiển thị chi tiết lỗi validation từ backend
      const errorMessage = error.response?.data?.message || 
                          error.response?.message || 
                          "Có lỗi xảy ra khi cập nhật lớp học";
      toast({
        title: "Lỗi",
        description: Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error khi user nhập
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleCancel = () => {
    setEditData({
      name: classData.name || '',
      roomId: classData.roomId || classData.room?.id || '',
      gradeId: classData.gradeId || '',
      subjectId: classData.subjectId || classData.subject?.id || '',
      expectedStartDate: formatDateForInput(classData.expectedStartDate),
      actualStartDate: formatDateForInput(classData.actualStartDate),
      actualEndDate: formatDateForInput(classData.actualEndDate),
      description: classData.description || '',
      status: classData.status || ClassStatus.DRAFT,
      academicYear: classData.academicYear || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleScheduleUpdate = async (schedules: any[]) => {
    if (!classData.id) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy ID lớp học",
        variant: "destructive",
      });
      return;
    }

    setIsScheduleLoading(true);
    try {
      // Cập nhật lịch học với format đúng theo backend
      const scheduleData = {
        schedules: schedules, // Backend mong đợi 'schedules' không phải 'recurringSchedule'
        // Thêm teacherId và academicYear nếu có để cập nhật đúng teacher assignment
        ...(classData.teacherId && { teacherId: classData.teacherId }),
        ...(classData.academicYear && { academicYear: classData.academicYear }),
      };

      await classService.updateClassSchedule(classData.id, scheduleData);
      
      toast({
        title: "Thành công",
        description: "Cập nhật lịch học thành công",
      });
      
      setIsScheduleModalOpen(false);
      // Refresh class data
      window.location.reload(); // Temporary solution
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi cập nhật lịch học",
        variant: "destructive",
      });
    } finally {
      setIsScheduleLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Thành công",
        description: "Đã sao chép link vào clipboard",
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({
        title: "Lỗi",
        description: "Không thể sao chép link",
        variant: "destructive",
      });
    }
  };

  // Handle teacher assignment
  const handleAssignTeacher = async (teacherId: string) => {
    if (!teacherId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn giáo viên",
        variant: "destructive",
      });
      return;
    }

    if (!classData.id) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy ID lớp học",
        variant: "destructive",
      });
      return;
    }

    setIsAssignTeacherLoading(true);
    try {
      const response = await classService.assignTeacher(classData.id, { teacherId });
      toast({
        title: "Thành công",
        description: "Gán giáo viên cho lớp học thành công. Email thông báo đã được gửi cho giáo viên.",
      });
      setIsAssignTeacherModalOpen(false);
      // Refresh class data
      window.location.reload(); // Temporary solution
    } catch (error: any) {
      console.error('Error assigning teacher:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || error.response?.message || error.message || "Có lỗi xảy ra khi gán giáo viên",
        variant: "destructive",
      });
    } finally {
      setIsAssignTeacherLoading(false);
    }
  };

  const handleRemoveTeacher = async () => {
    if (!classData.id) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy ID lớp học",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm('Bạn có chắc muốn gỡ giáo viên khỏi lớp học này?')) {
      setIsAssignTeacherLoading(true);
      try {
        await classService.removeTeacher(classData.id, classData.teacherId);
        
        toast({
          title: "Thành công",
          description: "Đã gỡ giáo viên khỏi lớp học",
        });
        
        // Refresh class data
        window.location.reload(); // Temporary solution
      } catch (error: any) {
        console.error('Error removing teacher:', error);
        toast({
          title: "Lỗi",
          description: error.response?.message || "Có lỗi xảy ra khi gỡ giáo viên",
          variant: "destructive",
        });
      } finally {
        setIsAssignTeacherLoading(false);
      }
    }
  };

  // Helper component để hiển thị error message
  const ErrorMessage = ({ field }: { field: string }) => {
    return errors[field] ? (
      <p className="text-sm text-red-500 mt-1">{errors[field]}</p>
    ) : null;
  };

  return (
    <div className="space-y-6">
      {/* Chi tiết lớp học */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Chi tiết lớp học
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsShareModalOpen(true)}
                className="relative"
              >
                <Share2 className="h-4 w-4" />
                {pendingRequestsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
                  </span>
                )}
              </Button>
              {isEditing ? (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleCancel}>
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleEdit}
                  // disabled={!canEditGeneralInfo}
                  title={!canEditGeneralInfo ? `Không thể chỉnh sửa khi lớp có trạng thái ${CLASS_STATUS_LABELS[classData.status as ClassStatus]}` : ""}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cột trái */}
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Tên lớp học <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <Input
                    value={editData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`mt-1 ${errors.name ? "border-red-500" : ""}`}
                    placeholder="Nhập tên lớp học"
                  />
                ) : (
                  <p className="text-lg font-semibold mt-1">{classData.name}</p>
                )}
                <ErrorMessage field="name" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Khối lớp <span className="text-red-500">*</span>
                </label>
                {isEditing && classData.status === ClassStatus.DRAFT ? (
                  <Select
                    value={editData.gradeId}
                    onValueChange={(value) => handleInputChange('gradeId', value)}
                  >
                    <SelectTrigger className={`mt-1 ${errors.gradeId ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Chọn khối lớp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Chọn khối lớp</SelectItem>
                      {grades && grades.length > 0 && grades.map((grade: any) => (
                        <SelectItem key={grade.id} value={grade.id}>
                          {grade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-base mt-1">
                    {classData.gradeName || classData.grade?.name ? `Khối ${classData.gradeLevel || classData.grade?.level}` : 'Chưa xác định'}
                  </p>
                )}
                <ErrorMessage field="gradeId" />
              </div>
            

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Chọn phòng học
                </label>
                {isEditing ? (
                  <Select
                    value={editData.roomId}
                    onValueChange={(value) => handleInputChange('roomId', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn phòng học" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Chọn phòng học</SelectItem>
                      {rooms &&
                        rooms.length > 0 &&
                        rooms.map((room: any) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-base mt-1">
                    {classData.roomName || classData.room?.name || 'Chưa phân công'}
                  </p>
                )}
              </div>

              {/* Lịch học hàng tuần */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-500">
                    Lịch học hàng tuần
                    
                  </label>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsScheduleModalOpen(true)}
                    // disabled={isScheduleLoading || !canEditGeneralInfo}
                    disabled={isScheduleLoading }
                    title={!canEditGeneralInfo ? `Không thể chỉnh sửa lịch học khi lớp có trạng thái ${CLASS_STATUS_LABELS[classData.status as ClassStatus]}` : ""}
                  >
                    {isScheduleLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Edit className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="space-y-2">
                  {classData.recurringSchedule ? (
                    <div className="space-y-2">
                      {formatSchedule(classData.recurringSchedule).split('\n').map((schedule, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">{schedule}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-sm">Chưa có lịch học</p>
                  )}
                </div>
              </div>
            </div>

            {/* Cột phải */}
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Môn học <span className="text-red-500">*</span>
                </label>
                {isEditing && classData.status === ClassStatus.DRAFT ? (
                  <Select
                    value={editData.subjectId}
                    onValueChange={(value) => handleInputChange('subjectId', value)}
                  >
                    <SelectTrigger className={`mt-1 ${errors.subjectId ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Chọn môn học" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Chọn môn học</SelectItem>
                      {subjects && subjects.length > 0 && subjects.map((subject: any) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-base mt-1">
                    {classData.subjectName || classData.subject?.name || 'Chưa xác định'}
                  </p>
                )}
                <ErrorMessage field="subjectId" />
              </div>

              {/* Trạng thái hoạt động */}
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Trạng thái hoạt động
                </label>
                <div className="mt-1">
                  <button
                    onClick={() => setIsChangeStatusDialogOpen(true)}
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-opacity hover:opacity-80 cursor-pointer ${CLASS_STATUS_BADGE_COLORS[classData.status as ClassStatus]}`}
                    title="Click để chuyển trạng thái"
                  >
                    {CLASS_STATUS_LABELS[classData.status as ClassStatus]}
                    <Edit className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {/* Logic hiển thị ngày dựa trên status */}
              {(() => {
                // Hiển thị expectedStartDate cho các lớp DRAFT, READY
                if (classData.status === ClassStatus.DRAFT || classData.status === ClassStatus.READY) {
                  return (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Ngày khai giảng dự kiến
                        <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          {CLASS_STATUS_LABELS[classData.status as ClassStatus]}
                        </span>
                      </label>
                      {isEditing && canEditExpectedDates ? (
                        <Input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={editData.expectedStartDate}
                          onChange={(e) => handleInputChange('expectedStartDate', e.target.value)}
                          className={`mt-1 ${errors.expectedStartDate ? "border-red-500" : ""}`}
                        />
                      ) : (
                        <p className="text-base mt-1">
                          {classData.expectedStartDate
                            ? new Date(classData.expectedStartDate).toLocaleDateString('vi-VN')
                            : 'Chưa xác định'}
                        </p>
                      )}
                      <ErrorMessage field="expectedStartDate" />
                    </div>
                  );
                }
                
                // Hiển thị actualStartDate cho các lớp ACTIVE, SUSPENDED, COMPLETED
                if (classData.status === ClassStatus.ACTIVE || 
                    classData.status === ClassStatus.SUSPENDED || 
                    classData.status === ClassStatus.COMPLETED) {
                  return (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Ngày bắt đầu thực tế
                      </label>
                      {isEditing && canEditActualDates ? (
                        <Input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={editData.actualStartDate}
                          onChange={(e) => handleInputChange('actualStartDate', e.target.value)}
                          className={`mt-1 ${errors.actualStartDate ? "border-red-500" : ""}`}
                        />
                      ) : (
                        <p className="text-base mt-1">
                          {classData.actualStartDate
                            ? new Date(classData.actualStartDate).toLocaleDateString('vi-VN')
                            : 'Chưa xác định'}
                        </p>
                      )}
                      <ErrorMessage field="actualStartDate" />
                    </div>
                  );
                }
                
                // Hiển thị cho các status khác (CANCELLED)
                return (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Ngày khai giảng
                      <span className={`ml-2 text-xs px-2 py-1 rounded ${CLASS_STATUS_COLORS[classData.status as ClassStatus]}`}>
                        {CLASS_STATUS_LABELS[classData.status as ClassStatus]}
                      </span>
                    </label>
                    <p className="text-base mt-1">
                      {classData.expectedStartDate
                        ? new Date(classData.expectedStartDate).toLocaleDateString('vi-VN')
                        : 'Chưa xác định'}
                    </p>
                  </div>
                );
              })()}
           

              {/* Ngày kết thúc - hiển thị dựa trên status */}
              {classData.actualEndDate && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Ngày kết thúc
                  </label>
                  {isEditing && canEditActualDates ? (
                    <Input
                      type="date"
                      min={editData.actualStartDate || new Date().toISOString().split('T')[0]}
                      value={editData.actualEndDate}
                      onChange={(e) => handleInputChange('actualEndDate', e.target.value)}
                      className={`mt-1 ${errors.actualEndDate ? "border-red-500" : ""}`}
                    />
                  ) : (
                    <p className="text-base mt-1">
                      {new Date(classData.actualEndDate).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                  <ErrorMessage field="actualEndDate" />
                </div>
              )}


              <div>
                <label className="text-sm font-medium text-gray-500">
                  Mô tả
                </label>
                {isEditing ? (
                  <div className="border rounded-lg overflow-hidden mt-1">
                    <ReactQuill
                      value={editData.description}
                      onChange={(value) => handleInputChange('description', value)}
                      placeholder="Nhập gì đó tại đây"
                      style={{ height: '200px' }}
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                          [{ 'indent': '-1' }, { 'indent': '+1' }],
                          [{ 'align': [] }],
                          ['link', 'image'],
                          ['clean']
                        ],
                      }}
                      formats={[
                        'header', 'bold', 'italic', 'underline', 'strike',
                        'list', 'bullet', 'indent', 'align', 'link', 'image'
                      ]}
                      theme="snow"
                    />
                  </div>
                ) : (
                  <div 
                    className="text-base mt-1 text-gray-500 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: classData.description || 'Chưa có mô tả' 
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Giáo viên phụ trách */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Giáo viên phụ trách
            </CardTitle>
            <div className="flex items-center gap-2">
              {classData.teacher ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsTransferTeacherSheetOpen(true)}
                    disabled={isAssignTeacherLoading || classData.status === ClassStatus.CANCELLED || classData.status === ClassStatus.COMPLETED}
                    title={classData.status === ClassStatus.CANCELLED || classData.status === ClassStatus.COMPLETED ? 'Không thể chuyển giáo viên cho lớp đã hủy hoặc hoàn thành' : 'Chuyển giáo viên'}
                  >
                    <Users className="h-4 w-4" />
                    Chuyển giáo viên
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRemoveTeacher}
                    disabled={isAssignTeacherLoading || !canEditGeneralInfo || classData.status === ClassStatus.COMPLETED}
                    title={!canEditGeneralInfo || classData.status === ClassStatus.COMPLETED ? `Không thể chỉnh sửa khi lớp có trạng thái ${CLASS_STATUS_LABELS[classData.status as ClassStatus]}` : ""}
                  >
                    {isAssignTeacherLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    Gỡ giáo viên
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsAssignTeacherModalOpen(true)}
                  disabled={isAssignTeacherLoading || !canEditGeneralInfo}
                  title={!canEditGeneralInfo ? `Không thể chỉnh sửa khi lớp có trạng thái ${CLASS_STATUS_LABELS[classData.status as ClassStatus]}` : ""}
                >
                  <UserPlus className="h-4 w-4" />
                  Gán giáo viên
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {classData.teacher ? (
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <Avatar className="h-16 w-16">
                <AvatarImage 
                  src={classData.teacher?.avatar} 
                  alt={classData.teacher.name} 
                />
                <AvatarFallback>
                  {classData.teacher.fullName?.charAt(0) || 'GV'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">
                    {classData.teacher?.fullName}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    Giáo viên
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{classData.teacher?.email || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{classData.teacher?.phone || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    <span>{classData.teacher?.teacherCode || 'Chưa cập nhật'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Chưa có giáo viên phụ trách</p>
              <p className="text-sm">Nhấn "Gán giáo viên" để chọn giáo viên cho lớp học này</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sheet chia sẻ lớp học */}
      <ShareClassSheet
        open={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
        classData={classData}
        pendingRequestsCount={pendingRequestsCount}
        onUpdatePassword={(password) => {
          // TODO: Implement API call to update class password
          console.log('Update password:', password);
        }}
      />

      {/* Sheet gán giáo viên */}
      <SelectTeacherSheet
        open={isAssignTeacherModalOpen}
        onOpenChange={setIsAssignTeacherModalOpen}
        classData={classData}
        onSubmit={handleAssignTeacher}
        isLoading={isAssignTeacherLoading}
      />

      {/* Edit Schedule Sheet */}
      <EditScheduleSheet
        open={isScheduleModalOpen}
        onOpenChange={setIsScheduleModalOpen}
        classData={classData}
        onSubmit={handleScheduleUpdate}
        isLoading={isScheduleLoading}
        expectedStartDate={
          isEditing && editData.expectedStartDate 
            ? editData.expectedStartDate 
            : classData?.expectedStartDate
        }
      />

      {/* Change Status Dialog */}
      <ChangeStatusDialog
        open={isChangeStatusDialogOpen}
        onOpenChange={setIsChangeStatusDialogOpen}
        classData={classData}
        onSuccess={() => {
          // Data will be automatically refetched via query invalidation
        }}
      />

      {/* Transfer Teacher Sheet */}
      <TransferTeacherSheet
        open={isTransferTeacherSheetOpen}
        onOpenChange={setIsTransferTeacherSheetOpen}
        classData={classData}
      />
    </div>
  );
};