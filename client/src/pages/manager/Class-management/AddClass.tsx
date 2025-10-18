import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Check, Plus, Clock, Trash2, Undo } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../utils/clientAxios';
import { useClassMutations } from './hooks/useClassMutations';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { GRADE_LEVEL_OPTIONS } from '../../../lib/gradeConstants';
import { dayOptions } from '../../../utils/commonData';

interface ScheduleItem {
  id: string;
  day: string;
  startTime: string;
  duration: number;
}

export const CreateClass = () => {
  const navigate = useNavigate();
  const { createClass } = useClassMutations();

  const [formData, setFormData] = useState({
    name: '',
    gradeId: '',
    subjectId: '',
    maxStudents: '',
    roomId: '',
    teacherId: '',
    feeStructureId: '',
    expectedStartDate: '',
    description: '',
    status: 'draft',
    academicYear: '',
    recurringSchedule: null as any,
  });

  const [useTemplate, setUseTemplate] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  
  // State để quản lý validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch subjects, rooms, grades, teachers, and fee structures
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

  const { data: gradesData } = useQuery({
    queryKey: ['grades'],
    queryFn: async () => {
      const response = await apiClient.get('/grades');
      return response;
    },
  });

  const { data: teachersData } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const response = await apiClient.get('/admin-center/teachers');
      return response;
    },
  });

  const { data: feeStructuresData } = useQuery({
    queryKey: ['fee-structures'],
    queryFn: async () => {
      const response = await apiClient.get('/fee-structures');
      return response;
    },
  });

  const subjects = (subjectsData as any)?.data || [];
  const rooms = (roomsData as any)?.data || [];
  const grades = (gradesData as any)?.data || [];
  const teachers = (teachersData as any)?.data?.data || [];
  const feeStructures = (feeStructuresData as any)?.data || [];


  const handleAddSchedule = () => {
    const newSchedule: ScheduleItem = {
      id: Date.now().toString(),
      day: 'monday',
      startTime: '08:00',
      duration: 90,
    };
    setSchedules([...schedules, newSchedule]);
  };

  const handleRemoveSchedule = (id: string) => {
    setSchedules(schedules.filter((s) => s.id !== id));
  };

  const handleScheduleChange = (
    id: string,
    field: keyof ScheduleItem,
    value: string | number,
  ) => {
    setSchedules(
      schedules.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  // Validation functions
  const validateRequired = (value: string): boolean => {
    return value.trim().length > 0;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate name
    if (!validateRequired(formData.name)) {
      newErrors.name = 'Tên lớp là bắt buộc';
    }

    // Validate subject
    if (!formData.subjectId || formData.subjectId === 'none') {
      newErrors.subjectId = 'Khoá học là bắt buộc';
    }

    // Validate start date
    if (!validateRequired(formData.expectedStartDate)) {
      newErrors.expectedStartDate = 'Ngày khai giảng là bắt buộc';
    }

    // Validate room
    if (!formData.roomId || formData.roomId === 'none') {
      newErrors.roomId = 'Chọn phòng học là bắt buộc';
    }

    // Validate academic year
    if (!validateRequired(formData.academicYear)) {
      newErrors.academicYear = 'Năm học là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [autoSelectNotification, setAutoSelectNotification] = useState<string>('');

  // Logic tự động chọn khóa học và khối lớp
  const autoSelectSubjectAndGrade = (className: string) => {
    const lowerClassName = className.toLowerCase();
    let selectedSubjectId = '';
    let selectedGrade = '';
    let notification = '';

    // Mapping từ khóa học
    const subjectKeywords = {
      'toán': ['toán', 'math', 'mathematics'],
      'văn': ['văn', 'literature', 'ngữ văn'],
      'anh': ['anh', 'english', 'tiếng anh', 'tieng anh'],
      'lý': ['lý', 'physics', 'vật lý'],
      'hóa': ['hóa', 'chemistry', 'hóa học'],
      'sinh': ['sinh', 'biology', 'sinh học'],
      'sử': ['sử', 'history', 'lịch sử'],
      'địa': ['địa', 'geography', 'địa lý'],
      'gdcd': ['gdcd', 'civic', 'giáo dục công dân'],
      'tin': ['tin', 'informatics', 'tin học'],
      'công nghệ': ['công nghệ', 'technology', 'cong nghe'],
      'mỹ thuật': ['mỹ thuật', 'art', 'my thuat'],
      'âm nhạc': ['âm nhạc', 'music', 'am nhac'],
      'thể dục': ['thể dục', 'physical', 'the duc']
    };

    // Tìm khóa học phù hợp
    for (const [subjectName, keywords] of Object.entries(subjectKeywords)) {
      if (keywords.some(keyword => lowerClassName.includes(keyword))) {
        // Tìm subject trong danh sách subjects
        const matchedSubject = subjects.find((subject: any) => 
          subject.name.toLowerCase().includes(subjectName)
        );
        if (matchedSubject) {
          selectedSubjectId = matchedSubject.id;
          notification += `Đã tự động chọn khóa học: ${matchedSubject.name}. `;
          break;
        }
      }
    }

    // Tìm khối lớp từ số trong tên lớp
    const gradeMatch = lowerClassName.match(/(\d+)/);
    if (gradeMatch) {
      const gradeNumber = parseInt(gradeMatch[1]);
      // Tìm grade trong danh sách grades
      const matchedGrade = grades.find((grade: any) => 
        grade.level === gradeNumber
      );
      if (matchedGrade) {
        selectedGrade = matchedGrade.id;
        notification += `Đã tự động chọn khối lớp: ${matchedGrade.name}.`;
      }
    }

    return { selectedSubjectId, selectedGrade, notification };
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
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

    // Tự động chọn khóa học và khối lớp khi nhập tên lớp
    if (field === 'name' && subjects.length > 0) {
      if (value && value.trim()) {
        const { selectedSubjectId, selectedGrade, notification } = autoSelectSubjectAndGrade(value);
        
        setFormData(prev => ({
          ...prev,
          ...(selectedSubjectId && { subjectId: selectedSubjectId }),
          ...(selectedGrade && { gradeId: selectedGrade })
        }));

        // Clear errors cho các field được auto-select
        if (selectedSubjectId || selectedGrade) {
          setErrors(prev => ({
            ...prev,
            ...(selectedSubjectId && { subjectId: '' }),
            ...(selectedGrade && { gradeId: '' })
          }));
        }

        // Hiển thị thông báo auto-select
        if (notification) {
          setAutoSelectNotification(notification);
          // Tự động ẩn thông báo sau 3 giây
          setTimeout(() => {
            setAutoSelectNotification('');
          }, 3000);
        }
      } else {
        // Nếu xóa tên lớp, ẩn thông báo auto-select
        setAutoSelectNotification('');
      }
    }
  };

  const handleSubmit = () => {
    // Validate form trước khi submit
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin đã nhập");
      return;
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentAcademicYear =
      currentMonth >= 9
        ? `${currentYear}-${currentYear + 1}`
        : `${currentYear - 1}-${currentYear}`;

    const recurringSchedule =
      schedules.length > 0
        ? {
            schedules: schedules.map((schedule) => ({
              day: schedule.day,
              startTime: schedule.startTime,
              endTime: new Date(
                new Date(`2000-01-01 ${schedule.startTime}`).getTime() +
                  schedule.duration * 60000,
              )
                .toTimeString()
                .slice(0, 5),
            })),
          }
        : null;

    const submitData = {
      ...formData,
      subjectId: formData.subjectId === 'none' ? undefined : formData.subjectId,
      roomId: formData.roomId === 'none' ? undefined : formData.roomId,
      teacherId: formData.teacherId === 'none' ? undefined : formData.teacherId,
      feeStructureId: formData.feeStructureId === 'none' ? undefined : formData.feeStructureId,
      maxStudents: formData.maxStudents
        ? parseInt(formData.maxStudents)
        : undefined,
      academicYear: formData.academicYear || currentAcademicYear,
      recurringSchedule: recurringSchedule,
    };

    createClass.mutate(submitData as any, {
      onSuccess: () => {
        toast.success('Tạo lớp học thành công');
        navigate('/center-qn/classes');
      },
      onError: (error: any) => {
        const errorMessage = error?.message || error?.error || 'Có lỗi xảy ra khi tạo lớp học';
        toast.error(typeof errorMessage === 'string' ? errorMessage : 'Có lỗi xảy ra khi tạo lớp học');
      },
    });
  };

  const handleCancel = () => {
    navigate('/center-qn/classes');
  };

  // Helper component để hiển thị error message
  const ErrorMessage = ({ field }: { field: string }) => {
    return errors[field] ? (
      <p className="text-sm text-red-500 mt-1">{errors[field]}</p>
    ) : null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Thêm mới lớp học
              </h1>
              <Breadcrumb className="mt-2">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href="/center-qn"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href="/center-qn/classes"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Danh sách lớp học
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-foreground font-medium">
                      Thêm mới lớp học
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={createClass.isPending}
                className="h-9 px-4"
              >
                <Check className="h-4 w-4 mr-2" />
                {createClass.isPending ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 space-y-6">
              {/* Tên lớp */}
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Tên lớp <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Nhập tên lớp học (VD: Toán 6, Văn 7, Anh 8, Lý 9)"
                  className={`mt-1.5 ${errors.name ? "border-red-500" : ""}`}
                  required
                />
                <ErrorMessage field="name" />
                {autoSelectNotification && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <Check className="w-4 h-4 inline mr-1" />
                      {autoSelectNotification}
                    </p>
                  </div>
                )}
              </div>

              {/* Mã lớp & Khoá học */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gradeId" className="text-sm font-medium">
                    Khối lớp
                  </Label>
                  <Select 
                    value={formData.gradeId} 
                    onValueChange={(value) => handleInputChange("gradeId", value)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Chọn khối lớp" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades && grades.length > 0 && grades.map((grade: any) => (
                        <SelectItem key={grade.id} value={grade.id}>
                          {grade.name} (Khối {grade.level})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subjectId" className="text-sm font-medium">
                    Khoá học <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.subjectId}
                    onValueChange={(value) => handleInputChange("subjectId", value)}
                  >
                    <SelectTrigger className={`mt-1.5 ${errors.subjectId ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Chọn khoá học" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Chọn khoá học</SelectItem>
                      {subjects &&
                        subjects.length > 0 &&
                        subjects?.map((subject: any) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <ErrorMessage field="subjectId" />
                </div>
              </div>

              {/* Ngày khai giảng & Phòng học */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="expectedStartDate" className="text-sm font-medium">
                    Ngày khai giảng (dự kiến) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="expectedStartDate"
                    type="date"
                    value={formData.expectedStartDate}
                    onChange={(e) => handleInputChange("expectedStartDate", e.target.value)}
                    className={`mt-1.5 ${errors.expectedStartDate ? "border-red-500" : ""}`}
                    required
                  />
                  <ErrorMessage field="expectedStartDate" />
                </div>
                <div>
                  <Label htmlFor="roomId" className="text-sm font-medium">
                    Chọn phòng học <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.roomId}
                    onValueChange={(value) => handleInputChange("roomId", value)}
                  >
                    <SelectTrigger className={`mt-1.5 ${errors.roomId ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Chọn phòng học" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không chọn</SelectItem>
                      {rooms &&
                        rooms.length > 0 &&
                        rooms.map((room: any) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <ErrorMessage field="roomId" />
                </div>
              </div>

              {/* Năm học */}
              <div>
                <Label htmlFor="academicYear" className="text-sm font-medium">
                  Năm học <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.academicYear}
                  onValueChange={(value) => handleInputChange("academicYear", value)}
                >
                  <SelectTrigger className={`mt-1.5 ${errors.academicYear ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Chọn năm học" />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      const currentYear = new Date().getFullYear();
                      const academicYears = [
                        `${currentYear - 1}-${currentYear}`,
                        `${currentYear}-${currentYear + 1}`,
                        ];
                      return academicYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ));
                    })()}
                  </SelectContent>
                </Select>
                <ErrorMessage field="academicYear" />
              </div>

              {/* Giáo viên & Cấu trúc phí */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="teacherId" className="text-sm font-medium">
                    Giáo viên
                  </Label>
                  <Select
                    value={formData.teacherId}
                    onValueChange={(value) => handleInputChange("teacherId", value)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Chọn giáo viên" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Chưa chọn giáo viên</SelectItem>
                      {teachers && teachers.length > 0 && teachers.map((teacher: any) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name || teacher.user?.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="feeStructureId" className="text-sm font-medium">
                    Cấu trúc phí
                  </Label>
                  <Select
                    value={formData.feeStructureId}
                    onValueChange={(value) => handleInputChange("feeStructureId", value)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Chọn cấu trúc phí" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Chưa chọn cấu trúc phí</SelectItem>
                      {feeStructures && feeStructures.length > 0 && feeStructures.map((feeStructure: any) => (
                        <SelectItem key={feeStructure.id} value={feeStructure.id}>
                          {feeStructure.name} - {feeStructure.amount?.toLocaleString()}đ
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Lịch học hàng tuần */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-semibold">
                    Lịch học hàng tuần
                  </Label>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={handleAddSchedule}
                    className="text-blue-600 hover:text-blue-700 h-auto p-0"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Lịch học
                  </Button>
                </div>

                <div className="space-y-3">
                  {schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex items-end gap-3">
                        {/* Thứ */}
                        <div className="flex-1">
                          <Label className="text-xs text-gray-600 dark:text-gray-400">
                            Thứ
                          </Label>
                          <Select
                            value={schedule.day}
                            onValueChange={(value: string) =>
                              handleScheduleChange(schedule.id, 'day', value)
                            }
                          >
                            <SelectTrigger className="mt-1 h-9">
                              <SelectValue placeholder="Chọn" />
                            </SelectTrigger>
                            <SelectContent>
                              {dayOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Bắt đầu */}
                        <div className="flex-1">
                          <Label className="text-xs text-gray-600 dark:text-gray-400">
                            Bắt đầu <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative mt-1">
                            <Clock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <Input
                              type="time"
                              value={schedule.startTime}
                              onChange={(e: any) =>
                                handleScheduleChange(
                                  schedule.id,
                                  'startTime',
                                  e.target.value,
                                )
                              }
                              className="pl-9 h-9"
                            />
                          </div>
                        </div>

                        {/* Thời lượng */}
                        <div className="flex-1">
                          <Label className="text-xs text-gray-600 dark:text-gray-400">
                            Thời lượng (phút){' '}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="number"
                            value={schedule.duration}
                            onChange={(e: any) =>
                              handleScheduleChange(
                                schedule.id,
                                'duration',
                                parseInt(e.target.value) || 0,
                              )
                            }
                            min={0}
                            step={15}
                            className="mt-1 h-9"
                          />
                        </div>

                        {/* Delete button */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSchedule(schedule.id)}
                          className="text-red-600 hover:text-red-700 h-9 w-9 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {schedules.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm border border-dashed rounded-lg">
                      Chưa có lịch học. Click "+ Lịch học" để thêm.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Use Template Switch */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="useTemplate"
                  className="text-sm font-medium cursor-pointer"
                >
                  Sử dụng chương trình học theo khoá học mẫu
                </Label>
                <Switch
                  id="useTemplate"
                  checked={useTemplate}
                  onCheckedChange={setUseTemplate}
                />
              </div>
            </div>

            {/* Mô tả */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Mô tả</h2>
                <div className="border rounded-lg overflow-hidden">
                  <ReactQuill
                    value={formData.description}
                    onChange={(value) => handleInputChange("description", value)}
                    placeholder="Nhập mô tả về lớp học..."
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateClass;
