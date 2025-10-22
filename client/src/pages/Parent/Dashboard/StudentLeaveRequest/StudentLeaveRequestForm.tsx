import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Loader2, ArrowLeft } from 'lucide-react';
import { parentStudentLeaveRequestService } from '../../../../services/parent/student-leave-request/student-leave.service';
import { parentChildService } from '../../../../services/parent/child-management/child.service';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import type { ChildClass, StudentLeaveRequest } from '../../../../services/parent/student-leave-request/student-leave.types';
import { formatDateForInput } from '../../../../utils/format';

export function StudentLeaveRequestForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  const [selectedChild, setSelectedChild] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [children, setChildren] = useState<any[]>([]);
  const [classes, setClasses] = useState<ChildClass[]>([]);
  const [affectedSessions, setAffectedSessions] = useState<any[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [leaveRequestData, setLeaveRequestData] = useState<StudentLeaveRequest | null>(null);

  // Load leave request data if in edit mode
  useEffect(() => {
    if (!isEditMode || !id) return;

    const fetchLeaveRequest = async () => {
      try {
        setIsLoadingData(true);
        const data = await parentStudentLeaveRequestService.getStudentLeaveRequestById(id);
        setLeaveRequestData(data);
        
        // Populate form fields
        setSelectedChild(data.studentId || '');
        setStartDate(formatDateForInput(data.startDate) || '');
        setEndDate(formatDateForInput(data.endDate) || '');
        setReason(data.reason || '');

        // Fetch classes for the student first, then set selectedClass
        if (data.studentId) {
          try {
            const classesData = await parentStudentLeaveRequestService.getChildClasses(data.studentId);
            setClasses(classesData);
            // Now set selectedClass after classes are loaded
            setSelectedClass(data.classId || '');
          } catch (error) {
            console.error('Failed to fetch classes for student:', error);
            toast.error('Không thể tải danh sách lớp học');
          }
        }
      } catch (error) {
        console.error('Failed to fetch leave request:', error);
        toast.error('Không thể tải thông tin đơn nghỉ học');
        navigate('/parent/student-leave-requests');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchLeaveRequest();
  }, [isEditMode, id, navigate]);

  // Fetch children list
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const data = await parentChildService.getChildren();
        setChildren(data);
      } catch (error) {
        console.error('Failed to fetch children:', error);
        toast.error('Không thể tải danh sách con');
        setChildren([]);
      }
    };
    fetchChildren();
  }, []);

  // Fetch classes when child is selected (only in create mode)
  useEffect(() => {
    // Skip if in edit mode (classes already loaded)
    if (isEditMode) return;

    if (!selectedChild) {
      setClasses([]);
      setSelectedClass('');
      return;
    }

    const fetchClasses = async () => {
      try {
        setIsLoadingClasses(true);
        const data = await parentStudentLeaveRequestService.getChildClasses(selectedChild);
        setClasses(data);
      } catch (error) {
        console.error('Failed to fetch classes:', error);
        toast.error('Không thể tải danh sách lớp học');
        setClasses([]);
      } finally {
        setIsLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [selectedChild, isEditMode]);

  // Fetch affected sessions when dates and class are selected
  useEffect(() => {
    if (!selectedChild || !selectedClass || !startDate || !endDate) {
      setAffectedSessions([]);
      return;
    }

    const fetchAffectedSessions = async () => {
      try {
        setIsLoadingSessions(true);
        const data = await parentStudentLeaveRequestService.getAffectedSessions({
          studentId: selectedChild,
          classId: selectedClass,
          startDate,
          endDate,
        });
        setAffectedSessions(data);
      } catch (error) {
        console.error('Failed to fetch affected sessions:', error);
        setAffectedSessions([]);
      } finally {
        setIsLoadingSessions(false);
      }
    };

    fetchAffectedSessions();
  }, [selectedChild, selectedClass, startDate, endDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedChild || !selectedClass || !startDate || !endDate || !reason) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast.error('Ngày kết thúc không được trước ngày bắt đầu');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (isEditMode && id) {
        // Update existing leave request (không update studentId và classId)
        await parentStudentLeaveRequestService.updateStudentLeaveRequest(id, {
          startDate,
          endDate,
          reason,
        });
        toast.success('Đơn nghỉ học đã được cập nhật thành công!');
      } else {
        // Create new leave request
        await parentStudentLeaveRequestService.createStudentLeaveRequest({
          studentId: selectedChild,
          classId: selectedClass,
          startDate,
          endDate,
          reason,
        });
        toast.success('Đơn nghỉ học đã được gửi thành công!');
      }

      navigate('/parent/student-leave-requests');
    } catch (error: any) {
      console.error('Failed to submit leave request:', error);
      toast.error(error?.error || error?.message || `Có lỗi xảy ra khi ${isEditMode ? 'cập nhật' : 'gửi'} đơn nghỉ học`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary/5 via-background to-primary/10 min-h-screen px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/parent/student-leave-requests')}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            {isEditMode ? 'Chỉnh sửa đơn nghỉ học' : 'Tạo đơn nghỉ học cho con'}
          </h1>
          <p className="text-muted-foreground text-base mt-2">
            {isEditMode 
              ? 'Cập nhật thông tin đơn nghỉ học của con bạn' 
              : 'Vui lòng điền thông tin nghỉ học của con bạn'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div>
            <Card className="shadow-xl border rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground pb-8 rounded-t-2xl">
                <CardTitle className="text-2xl font-bold">
                  {isEditMode ? 'Chỉnh sửa thông tin' : 'Thông tin đơn nghỉ học'}
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Các trường đánh dấu (*) là bắt buộc
                  {isEditMode && leaveRequestData?.status === 'pending' && (
                    <span className="ml-2">(Chỉ có thể sửa đơn đang chờ duyệt)</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoadingData ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">Đang tải dữ liệu...</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Child Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="child" className="text-base font-semibold">
                      Chọn con <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      value={selectedChild} 
                      onValueChange={setSelectedChild}
                      disabled={isEditMode}
                    >
                      <SelectTrigger id="child">
                        <SelectValue placeholder="Chọn con..." />
                      </SelectTrigger>
                      <SelectContent>
                        {children.map((child) => (
                          <SelectItem key={child.id} value={child.id}>
                            {child.user.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isEditMode && (
                      <p className="text-xs text-muted-foreground">
                        Không thể thay đổi học sinh khi chỉnh sửa đơn
                      </p>
                    )}
                  </div>

                  {/* Class Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="class" className="text-base font-semibold">
                      Lớp học <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      value={selectedClass} 
                      onValueChange={setSelectedClass}
                      disabled={!selectedChild || isLoadingClasses || isEditMode}
                    >
                      <SelectTrigger id="class">
                        <SelectValue placeholder={
                          isLoadingClasses 
                            ? "Đang tải..." 
                            : !selectedChild 
                            ? "Vui lòng chọn con trước" 
                            : "Chọn lớp học..."
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} - {cls.subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isEditMode && (
                      <p className="text-xs text-muted-foreground">
                        Không thể thay đổi lớp học khi chỉnh sửa đơn
                      </p>
                    )}
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-base font-semibold">
                        Từ ngày <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="startDate"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="text-base font-semibold">
                        Đến ngày <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="endDate"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="pl-10"
                          min={startDate}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="space-y-2">
                    <Label htmlFor="reason" className="text-base font-semibold">
                      Lý do nghỉ học <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="reason"
                      placeholder="Nhập lý do nghỉ học của con..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={5}
                      className="resize-none"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Vui lòng mô tả rõ lý do nghỉ học
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/parent/student-leave-requests')}
                      className="flex-1"
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isEditMode ? 'Đang cập nhật...' : 'Đang gửi...'}
                        </>
                      ) : (
                        isEditMode ? 'Cập nhật đơn' : 'Gửi đơn'
                      )}
                    </Button>
                  </div>
                </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Affected Sessions Section */}
          <div>
            <Card className="shadow-xl border rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground pb-8 rounded-t-2xl">
                <CardTitle className="text-2xl font-bold">
                  Danh sách buổi sẽ nghỉ dự kiến
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  {affectedSessions.length} buổi học
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoadingSessions ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : affectedSessions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {!startDate || !endDate || !selectedClass
                      ? 'Vui lòng chọn lớp học và thời gian để xem các buổi học bị ảnh hưởng'
                      : 'Không có buổi học nào trong khoảng thời gian này'}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {affectedSessions.map((session, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              {session.className || 'Lớp học'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {session.date} - {session.time}
                            </div>
                            {session.room && (
                              <div className="text-xs text-muted-foreground">
                                Phòng: {session.room}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

