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
import { Switch } from '@/components/ui/switch';
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
} from 'lucide-react';
import { formatSchedule } from '../../../../utils/format';
import { getStatusBadge } from '../const/statusBadge';
import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { EditScheduleSheet } from './EditScheduleSheet';
import { classService } from '../../../../services/center-owner/class-management/class.service';
import { useToast } from '../../../../hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../utils/clientAxios';
import { GRADE_LEVEL_OPTIONS } from '../../../../lib/gradeConstants';
import { ClassStatus, CLASS_STATUS_LABELS, CLASS_STATUS_COLORS, CLASS_STATUS_BADGE_COLORS } from '../../../../lib/constants';

interface GeneralInfoProps {
  classData: any;
}

export const GeneralInfo = ({ classData }: GeneralInfoProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isShareEnabled, setIsShareEnabled] = useState(false);
  const [sharePassword, setSharePassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  
  // Fetch subjects and rooms
  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const response = await apiClient.get('/subjects');
      return response;
    },
  });

  const { data: roomsData } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const response = await apiClient.get('/rooms');
      return response;
    },
  });

  // Fetch sessions data để kiểm tra lớp đã có lịch học chưa
  const { data: sessionsData } = useQuery({
    queryKey: ['classSessions', classData.id, classData.academicYear],
    queryFn: () => classService.getClassSessions(classData.id, {
      page: 1,
      limit: 1, // Chỉ cần kiểm tra có sessions hay không
      academicYear: classData.academicYear, // Chỉ lấy sessions cùng academicYear
    }),
    enabled: !!classData.id && !!classData.academicYear,
    staleTime: 3000,
    refetchOnWindowFocus: true
  });

  const subjects = (subjectsData as any)?.data || [];
  const rooms = (roomsData as any)?.data || [];
  const sessions = (sessionsData as any)?.data || [];
  const hasSessions = sessions.length > 0;
  
  // Logic kiểm tra có thể edit hay không dựa trên status
  const hasActualDates = Boolean(classData.actualStartDate || classData.actualEndDate);
  const isClassActive = classData.status === ClassStatus.ACTIVE;
  const isClassCompleted = classData.status === ClassStatus.COMPLETED;
  const isClassCancelled = classData.status === ClassStatus.CANCELLED;
  const isClassSuspended = classData.status === ClassStatus.SUSPENDED;
  
  // Logic mới: Quyết định edit dựa trên status
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
  
  console.log('classData:', classData);
  console.log('classData.subjectId:', classData.subjectId);
  console.log('subjects:', subjects);
  console.log('hasSessions:', hasSessions);
  console.log('isClassActive:', isClassActive);
  console.log('isClassCompleted:', isClassCompleted);
  console.log('canEditActualDates:', canEditActualDates);
  console.log('canEditExpectedDates:', canEditExpectedDates);

  // Sync editData when classData changes
  useEffect(() => {
    setEditData({
      name: classData.name || '',
      roomId: classData.roomId || classData.room?.id || '',
      grade: classData.grade || '',
      expectedStartDate: classData.expectedStartDate || '',
      actualStartDate: classData.actualStartDate || '',
      actualEndDate: classData.actualEndDate || '',
      description: classData.description || '',
      status: classData.status || ClassStatus.DRAFT,
      academicYear: classData.academicYear || '',
    });
  }, [classData]);
  
  const [editData, setEditData] = useState({
    name: classData.name || '',
    roomId: classData.roomId || classData.room?.id || '',
    grade: classData.grade || '',
    expectedStartDate: classData.expectedStartDate || '',
    actualStartDate: classData.actualStartDate || '',
    actualEndDate: classData.actualEndDate || '',
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

    // Validate name
    if (!validateRequired(editData.name)) {
      newErrors.name = 'Tên lớp là bắt buộc';
    }

    // Note: subjectId không được edit

    // Validate room
    if (!editData.roomId || editData.roomId === 'none') {
      newErrors.roomId = 'Chọn phòng học là bắt buộc';
    }

    // Logic validation theo status
    if (canEditExpectedDates) {
      // Có thể edit expectedStartDate -> validate expectedStartDate
      if (editData.expectedStartDate) {
        const expectedDate = new Date(editData.expectedStartDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        
        if (expectedDate < today) {
          newErrors.expectedStartDate = 'Ngày khai giảng không được là ngày trong quá khứ';
        }
      }
    }
    
    if (canEditActualDates) {
      // Có thể edit actualDates -> validate actualStartDate và actualEndDate
      if (editData.actualStartDate) {
        const actualStartDate = new Date(editData.actualStartDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (actualStartDate < today) {
          newErrors.actualStartDate = 'Ngày bắt đầu không được là ngày trong quá khứ';
        }
      }

      if (editData.actualEndDate) {
        const actualEndDate = new Date(editData.actualEndDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (actualEndDate < today) {
          newErrors.actualEndDate = 'Ngày kết thúc không được là ngày trong quá khứ';
        }
        
        // Validate end date is after start date
        if (editData.actualStartDate) {
          const actualStartDate = new Date(editData.actualStartDate);
          if (actualEndDate <= actualStartDate) {
            newErrors.actualEndDate = 'Ngày kết thúc phải sau ngày bắt đầu';
          }
        }
      }
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

    setIsLoading(true);
    try {
      // Logic gửi dữ liệu theo status
      const updateData = {
        name: editData.name.trim(),
        description: editData.description,
        roomId: editData.roomId === 'none' ? undefined : editData.roomId,
        grade: editData.grade,
        status: editData.status,
        academicYear: editData.academicYear,
        // Gửi expectedStartDate nếu được phép edit
        ...(canEditExpectedDates ? { expectedStartDate: editData.expectedStartDate } : {}),
        // Gửi actualDates nếu được phép edit
        ...(canEditActualDates ? {
          actualStartDate: editData.actualStartDate,
          actualEndDate: editData.actualEndDate,
        } : {}),
      };

      await classService.updateClass(classData.id, updateData);
      
      toast({
        title: "Thành công",
        description: "Cập nhật thông tin lớp học thành công",
      });
      
      setIsEditing(false);
      // Refresh class data - có thể emit event hoặc callback để parent component refetch
      window.location.reload(); // Temporary solution
    } catch (error: any) {
      console.error('Error updating class:', error);
      toast({
        title: "Lỗi",
        description: error.response?.message || "Có lỗi xảy ra khi cập nhật lớp học",
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
      grade: classData.grade || '',
      expectedStartDate: classData.expectedStartDate || '',
      actualStartDate: classData.actualStartDate || '',
      actualEndDate: classData.actualEndDate || '',
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
              <Button variant="ghost" size="sm" onClick={() => setIsShareModalOpen(true)}>
                <Share2 className="h-4 w-4" />
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
                  disabled={!canEditGeneralInfo}
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
                  Khối lớp
                </label>
                {isEditing ? (
                  <Select
                    value={editData.grade}
                    onValueChange={(value) => handleInputChange('grade', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn khối lớp" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADE_LEVEL_OPTIONS.map(grade => (
                        <SelectItem key={grade.value} value={grade.value}>
                          {grade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-base mt-1">
                    {classData.grade ? `Khối ${classData.grade}` : 'Chưa xác định'}
                  </p>
                )}
              </div>
            

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Chọn phòng học <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <Select
                    value={editData.roomId}
                    onValueChange={(value) => handleInputChange('roomId', value)}
                  >
                    <SelectTrigger className={`mt-1 ${errors.roomId ? "border-red-500" : ""}`}>
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
                <ErrorMessage field="roomId" />
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
                    disabled={isScheduleLoading || !canEditGeneralInfo}
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
                  Khoá học
                </label>
                <p className="text-base mt-1">
                  {classData.subjectName || classData.subject?.name || 'Chưa xác định'}
                </p>
              </div>

              {/* Trạng thái hoạt động */}
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Trạng thái hoạt động
                </label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${CLASS_STATUS_BADGE_COLORS[classData.status as ClassStatus]}`}>
                    {CLASS_STATUS_LABELS[classData.status as ClassStatus]}
                  </span>
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

      {/* Modal chia sẻ lớp học */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Chia sẻ lớp học</DialogTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsShareModalOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Kích hoạt chia sẻ */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Kích hoạt chia sẻ</span>
              <Switch
                checked={isShareEnabled}
                onCheckedChange={(checked) => {
                  setIsShareEnabled(checked);
                  if (checked) {
                    toast({
                      title: "Thông báo",
                      description: "Lớp học đã được kích hoạt chia sẻ",
                    });
                  } else {
                    toast({
                      title: "Thông báo", 
                      description: "Lớp học đã tắt chia sẻ",
                    });
                  }
                }}
              />
            </div>

            {/* Link chia sẻ */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Link chia sẻ</Label>
              <div className="flex gap-2">
                <Input
                  value={`https://staging.studentup.vn/student-app/classes/${classData.id || '276ebec0-c8cf-4c'}`}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`https://staging.studentup.vn/student-app/classes/${classData.id || '276ebec0-c8cf-4c'}`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mật khẩu */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Mật khẩu</Label>
              <Input
                value={sharePassword}
                onChange={(e) => setSharePassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                type="password"
              />
            </div>

            {/* Danh sách yêu cầu truy cập */}
            <div className="flex items-center justify-between">
              <span className="text-sm">Danh sách yêu cầu truy cập vào lớp học</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">0 người</span>
                <Button variant="ghost" size="sm">
                  →
                </Button>
              </div>
            </div>

            {/* QR Code */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Mã QR của lớp học</h3>
              <div className="space-y-2">
                <p className="text-xs text-gray-600">1. Mở ứng dụng camera trên máy điện thoại</p>
                <p className="text-xs text-gray-600">2. Di chuyển camera và quét mã QR để đăng ký nhanh</p>
              </div>
              <div className="flex justify-center">
                <div className="border-2 border-dashed border-purple-500 p-4 rounded-lg">
                  <div className="w-32 h-32 bg-black flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Sheet */}
      <EditScheduleSheet
        open={isScheduleModalOpen}
        onOpenChange={setIsScheduleModalOpen}
        classData={classData}
        onSubmit={handleScheduleUpdate}
        isLoading={isScheduleLoading}
      />
    </div>
  );
};