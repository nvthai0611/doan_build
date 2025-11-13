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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowLeft } from 'lucide-react';
import { parentStudentLeaveRequestService } from '../../../../services/parent/student-leave-request/student-leave.service';
import { parentChildService } from '../../../../services/parent/child-management/child.service';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import type { ChildClass, StudentLeaveRequest } from '../../../../services/parent/student-leave-request/student-leave.types';

export function StudentLeaveRequestForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  const [selectedChild, setSelectedChild] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [availableClasses, setAvailableClasses] = useState<ChildClass[]>([]);
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [availableSessions, setAvailableSessions] = useState<any[]>([]);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [sessionsSearch, setSessionsSearch] = useState('');
  const [sessionsFilterUpcoming, setSessionsFilterUpcoming] = useState(true);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [children, setChildren] = useState<any[]>([]);
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
        setReason(data.reason || '');

        const firstSession = data.affectedSessions?.[0];
        const classId = firstSession?.session?.class?.id || data.classes?.[0]?.id || '';
        if (classId) {
          setSelectedClass(classId);
        }
        if (data.affectedSessions && data.affectedSessions.length) {
          const preselected = (data.affectedSessions || []).map((s: any) => s.sessionId).filter(Boolean);
          if (preselected.length) setSelectedSessionIds(preselected as string[]);
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
        setChildren(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch children:', error);
        toast.error('Không thể tải danh sách con');
        setChildren([]);
      }
    };
    fetchChildren();
  }, []);

  // Fetch child classes when child selected
  useEffect(() => {
    const loadClasses = async () => {
      if (!selectedChild) {
        setAvailableClasses([]);
        setSelectedClass('');
        return;
      }
      try {
        const classes = await parentStudentLeaveRequestService.getChildClasses(selectedChild);
        const normalized = Array.isArray(classes)
          ? classes
          : Array.isArray((classes as any)?.data)
            ? (classes as any).data
            : [];
        setAvailableClasses(normalized);

        if (!isEditMode) {
          setSelectedClass('');
        } else if (isEditMode && leaveRequestData) {
          const firstSession = leaveRequestData.affectedSessions?.[0];
          const classId = firstSession?.session?.class?.id || leaveRequestData.classes?.[0]?.id || '';
          if (classId) {
            setSelectedClass(classId);
          }
        }
      } catch (e) {
        setAvailableClasses([]);
      }
    };
    loadClasses();
  }, [selectedChild, isEditMode, leaveRequestData]);

  // Fetch sessions for selected class
  useEffect(() => {
    const loadSessions = async () => {
      if (!selectedChild || !selectedClass) {
        setAvailableSessions([]);
        setSelectedSessionIds([]);
        return;
      }
      try {
        setIsLoadingSessions(true);
        const sessions = await parentStudentLeaveRequestService.getSessionsByClass({ studentId: selectedChild, classId: selectedClass });
        const normalized = Array.isArray(sessions)
          ? sessions
          : Array.isArray((sessions as any)?.data)
            ? (sessions as any).data
            : [];
        setAvailableSessions(normalized);

        if (isEditMode && leaveRequestData && leaveRequestData.affectedSessions?.length) {
          const preselected = (leaveRequestData.affectedSessions || []).map((s: any) => s.sessionId).filter(Boolean);
          if (preselected.length) setSelectedSessionIds(preselected as string[]);
        }
      } catch (e) {
        setAvailableSessions([]);
        if (!isEditMode) setSelectedSessionIds([]);
      } finally {
        setIsLoadingSessions(false);
      }
    };
    loadSessions();
  }, [selectedChild, selectedClass, isEditMode, leaveRequestData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedChild || !selectedClass || selectedSessionIds.length === 0 || !reason) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (isEditMode && id) {
        // Update existing leave request (không update studentId)
        await parentStudentLeaveRequestService.updateStudentLeaveRequest(id, {
          reason,
          sessionIds: selectedSessionIds,
        });
        toast.success('Đơn nghỉ học đã được cập nhật thành công!');
      } else {
        // Create new leave request (theo lớp + buổi học được chọn)
        await parentStudentLeaveRequestService.createStudentLeaveRequest({
          studentId: selectedChild,
          classId: selectedClass,
          sessionIds: selectedSessionIds,
          reason,
        });
        toast.success('Đơn nghỉ học đã được gửi thành công!');
      }

      navigate('/parent/student-leave-requests');
    } catch (error: any) {
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
                    {isEditMode ? (
                      <p className="text-xs text-muted-foreground">
                        Không thể thay đổi học sinh khi chỉnh sửa đơn
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Đơn nghỉ sẽ áp dụng cho TẤT CẢ các lớp có buổi học trong khoảng thời gian đã chọn
                      </p>
                    )}
                  </div>

                  {/* Class Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="classId" className="text-base font-semibold">
                      Chọn lớp <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      value={selectedClass} 
                      onValueChange={setSelectedClass}
                      disabled={!selectedChild || isEditMode}
                    >
                      <SelectTrigger id="classId">
                        <SelectValue placeholder="Chọn lớp..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(availableClasses) && availableClasses.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} {cls.subject?.name ? `- ${cls.subject.name}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedChild && Array.isArray(availableClasses) && availableClasses.length === 0 && (
                      <p className="text-xs text-muted-foreground mt-1">Không tìm thấy lớp nào cho học sinh này.</p>
                    )}
                  </div>

                  {/* Session Selection (multi) */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Chọn buổi học <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedSessionIds.length === 0 ? (
                        <span className="text-sm text-muted-foreground">Chưa chọn buổi nào</span>
                      ) : (
                        selectedSessionIds.map((id) => {
                          const s = (availableSessions || []).find((x: any) => x.id === id);
                          const label = s ? `${s.date} • ${s.time}` : id;
                          return (
                            <span key={id} className="text-xs px-2 py-1 rounded border bg-muted/30">
                              {label}
                            </span>
                          );
                        })
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" disabled={!selectedClass} onClick={() => setSessionsOpen(true)}>
                        {isLoadingSessions ? 'Đang tải buổi học...' : 'Chọn buổi học'}
                      </Button>
                      {selectedSessionIds.length > 0 && (
                        <Button type="button" variant="ghost" onClick={() => setSelectedSessionIds([])}>
                          Xóa chọn
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Bạn có thể chọn nhiều buổi. Mặc định chỉ hiển thị buổi sắp tới (tối đa 30).</p>
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

          {/* Helper Section */}
          <div>
            <Card className="shadow-xl border rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground pb-8 rounded-t-2xl">
                <CardTitle className="text-2xl font-bold">Hướng dẫn</CardTitle>
                <CardDescription className="text-primary-foreground/80">Chọn lớp và buổi học cụ thể để xin nghỉ</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Chọn con để tải danh sách lớp</li>
                  <li>Chọn lớp để hiển thị các buổi học</li>
                  <li>Chọn đúng buổi học muốn xin nghỉ</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

    {/* Dialog chọn buổi */}
    <Dialog open={sessionsOpen} onOpenChange={setSessionsOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Chọn buổi học</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Tìm buổi theo ngày, giờ, phòng, lớp, môn..."
              value={sessionsSearch}
              onChange={(e) => setSessionsSearch(e.target.value)}
            />
            <div className="flex items-center gap-2 text-sm">
              <input
                id="upcoming"
                type="checkbox"
                checked={sessionsFilterUpcoming}
                onChange={(e) => setSessionsFilterUpcoming(e.target.checked)}
              />
              <label htmlFor="upcoming">Chỉ buổi sắp tới</label>
            </div>
          </div>

          {(() => {
            const filtered = (availableSessions || [])
              .filter((s: any) => {
                if (!sessionsSearch) return true;
                const text = `${s.date} ${s.time} ${s.room || ''} ${s.className || ''} ${s.subjectName || ''}`.toLowerCase();
                return text.includes(sessionsSearch.toLowerCase());
              })
              .filter((s: any) => {
                if (!sessionsFilterUpcoming) return true;
                try {
                  const d = new Date(s.date);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return d >= today;
                } catch { return true; }
              })
              .slice(0, 30);

            return (
              <>
                <div className="max-h-[420px] overflow-auto space-y-1">
                  {filtered.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-8 text-center">
                      Không có buổi nào phù hợp
                    </div>
                  ) : (
                    filtered.map((s: any) => {
                      const checked = selectedSessionIds.includes(s.id);
                      const toggle = () => {
                        setSelectedSessionIds((prev) =>
                          checked ? prev.filter((x) => x !== s.id) : [...prev, s.id]
                        );
                      };
                      return (
                        <label key={s.id} className="flex items-center gap-3 p-2 rounded border hover:bg-muted/30 cursor-pointer">
                          <input type="checkbox" checked={checked} onChange={toggle} />
                          <div className="text-sm">
                            <div className="font-medium">{s.date} • {s.time}</div>
                            <div className="text-xs text-muted-foreground">
                              {(s.className || '')} {s.subjectName ? `• ${s.subjectName}` : ''} {s.room ? `• Phòng ${s.room}` : ''}
                            </div>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Đang hiển thị {filtered.length} buổi</span>
                  <span>Đã chọn {selectedSessionIds.length} buổi</span>
                </div>
              </>
            );
          })()}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setSessionsOpen(false)}>Đóng</Button>
            <Button type="button" onClick={() => setSessionsOpen(false)}>Xong</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
  );
}

