import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, Save, AlertCircle, Mail, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getListStudentBySessionId,
  getListStudentsByRecordId,
  updateAttendanceStudent,
} from '../../../services/teacher/attendance-management/attendance.service';
import Loading from '../../../components/Loading/LoadingPage';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

type AttendanceStatus = 'present' | 'absent' | 'excused';

export default function AttendanceTable() {
  const [localAttendance, setLocalAttendance] = useState<
    Record<string, AttendanceStatus | null>
  >({});
  const [hasChanges, setHasChanges] = useState(false);
  // State để lưu trữ danh sách học sinh được chọn để gửi email
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  // State để kiểm tra "Chọn tất cả"
  const [selectAll, setSelectAll] = useState(false);

  const navigate = useNavigate();
  const { classSessionId } = useParams();
  const queryClient = useQueryClient();

  // Fetch attendance data
  const {
    data: attendanceData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['attendance', classSessionId],
    queryFn: async () => {
      const response = await getListStudentsByRecordId(classSessionId!);
      return response;
    },
    enabled: !!classSessionId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const {
    data: studentListData,
    isLoading: isLoadingStudentList,
    isError: isErrorStudentList,
  } = useQuery({
    queryKey: ['list-students', classSessionId],
    queryFn: async () => {
      const response = await getListStudentBySessionId(classSessionId!);
      return response;
    },
  });

  // Initialize local state từ server data
  useEffect(() => {
    if (attendanceData?.data) {
      console.log('Initializing attendance data:', attendanceData.data);
      const initialAttendance: Record<string, AttendanceStatus> = {};

      attendanceData.data.forEach((record: any) => {
        const studentId = record.studentId || record.student?.id;
        const status = record.status;

        if (studentId) {
          initialAttendance[studentId] = status as AttendanceStatus;
        }
      });

      console.log('Initial attendance state:', initialAttendance);
      setLocalAttendance(initialAttendance);
      setHasChanges(false);
    }
  }, [attendanceData]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (records: any[]) => {
      return updateAttendanceStudent(classSessionId!, records);
    },
    onSuccess: (response: any) => {
      setHasChanges(false);
      queryClient.invalidateQueries({
        queryKey: ['attendance', classSessionId],
      });
      toast.success('Cập nhật trạng thái điểm danh thành công!', {
        duration: 3000,
      });
    },
    onError: (error: any) => {
      console.error('Save error:', error);
      toast.error(
        `Lỗi khi lưu điểm danh: ${error.message || 'Đã có lỗi xảy ra'}`,
        { duration: 5000 },
      );
    },
  });

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setLocalAttendance((prev) => {
      const currentStatus = prev[studentId];
      const newStatus = currentStatus === status ? null : status;
      const newState = {
        ...prev,
        [studentId]: newStatus,
      };

      // Check changes against server data
      const serverRecord = attendanceData?.data?.find(
        (r: any) => (r.studentId || r.student?.id) === studentId,
      );
      const serverStatus = serverRecord?.status || null;

      const hasAnyChanges = Object.keys(newState).some((id) => {
        const serverRec = attendanceData?.data?.find(
          (r: any) => (r.studentId || r.student?.id) === id,
        );
        const serverStat = serverRec?.status || null;
        return newState[id] !== serverStat;
      });

      setHasChanges(hasAnyChanges);

      return newState;
    });
  };

  const handleSave = async () => {
    if (!hasChanges) {
      toast.info('Không có thay đổi để lưu', { duration: 2000 });
      return;
    }

    const recordsToSave = Object.entries(localAttendance)
      .filter(([_, status]) => status !== null)
      .map(([studentId, status]) => ({
        studentId,
        status: status!,
        note: '',
      }));

    if (recordsToSave.length === 0) {
      toast.error('Vui lòng điểm danh trước khi lưu', {
        duration: 3000,
      });
      return;
    }
    //điểm danh hết trước khi lưu
    // Chỉ kiểm tra điều kiện này khi chưa có dữ liệu điểm danh từ server
    // hoặc số lượng bản ghi từ server ít hơn tổng số học sinh
    if (
      !attendanceData?.data?.length &&
      recordsToSave?.length < studentListData?.class?.enrollments?.length
    ) {
      toast.error('Vui lòng điểm danh tất cả học sinh trước khi lưu', {
        duration: 3000,
      });
      return;
    }

    saveMutation.mutate(recordsToSave);
  };

  const getStatusCount = (status: AttendanceStatus) => {
    if (!attendanceData) {
      return 0;
    }
    // nếu không thay đổi thì lấy dữ liệu từ server
    if (!hasChanges) {
      return attendanceData?.filter((record: any) => record.status === status)
        .length;
    }
    // nếu có thay đổi thì đếm từ local state
  };

  const getStudentCurrentStatus = (
    studentId: string,
  ): AttendanceStatus | null => {
    // Lấy status từ database trước
    const serverRecord = attendanceData?.find(
      (r: any) => (r.studentId || r.student?.id) === studentId,
    );
    const dbStatus = serverRecord?.status || null;

    // Nếu có thay đổi local thì dùng local, nếu không thì dùng DB
    const localStatus = localAttendance[studentId];

    // Nếu local status khác với DB status thì dùng local (đã có thay đổi)
    // Nếu local status giống DB status hoặc chưa có local thì dùng DB
    if (localStatus !== undefined && localStatus !== dbStatus) {
      return localStatus;
    }

    return dbStatus;
  };

  const isAttendanceDisabled = () => {
    // if (!studentListData?.studentListData) return true;

    // Lấy ngày học cơ bản (không tính giờ)
    const currentDate = new Date();
    const sessionDate = new Date(studentListData?.sessionDate);

    // Lấy ngày hiện tại (không tính giờ)
    const currentDateOnly = new Date(currentDate.toDateString());
    const sessionDateOnly = new Date(sessionDate.toDateString());

    // 1. Chưa đến ngày học -> không được điểm danh
    if (sessionDateOnly > currentDateOnly) {
      console.log('Chưa đến ngày học');
      return true;
    }

    // 2. Đã qua ngày học (sau 00h ngày hôm sau) -> không được điểm danh
    if (sessionDateOnly < currentDateOnly) {
      console.log('Đã qua ngày học');
      return true;
    }

    // 3. Đúng ngày học -> kiểm tra giờ
    if (sessionDateOnly.getTime() === currentDateOnly.getTime()) {
      const sessionHour = sessionDate.getHours();
      const sessionMinute = sessionDate.getMinutes();
      const currentHour = currentDate.getHours();
      const currentMinute = currentDate.getMinutes();

      // Chuyển sang phút để so sánh dễ hơn
      const sessionTimeInMinutes = sessionHour * 60 + sessionMinute;
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      // Chưa đến giờ học -> không được điểm danh
      if (currentTimeInMinutes < sessionTimeInMinutes) {
        console.log('Chưa đến giờ học');
        return true;
      }

      // Đã đến giờ học hoặc sau giờ học (nhưng vẫn trong ngày) -> được điểm danh
      console.log('Có thể điểm danh');
      return false;
    }

    return false;
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">Lỗi khi tải dữ liệu điểm danh</div>
      </div>
    );
  }

  if (isLoadingStudentList) {
    return <Loading />;
  }

  // Danh sách học sinh vắng mặt
  const absentStudents = React.useMemo(() => {
    if (!studentListData?.class?.enrollments) return [];
    
    return studentListData.class.enrollments.filter((record: any) => {
      const studentId = record.studentId || record.student?.id;
      const status = getStudentCurrentStatus(studentId);
      return status === 'absent';
    });
  }, [localAttendance, attendanceData, studentListData]);

  // Xử lý chọn/bỏ chọn tất cả học sinh vắng mặt
  const handleSelectAll = () => {
    if (selectAll) {
      // Bỏ chọn tất cả
      setSelectedStudents([]);
    } else {
      // Chọn tất cả học sinh vắng mặt
      const allAbsentIds = absentStudents.map((record: any) => 
        record.studentId || record.student?.id
      );
      setSelectedStudents(allAbsentIds);
    }
    setSelectAll(!selectAll);
  };

  // Xử lý chọn/bỏ chọn một học sinh
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        // Nếu đã chọn, bỏ chọn
        const newSelected = prev.filter(id => id !== studentId);
        setSelectAll(false);
        return newSelected;
      } else {
        // Nếu chưa chọn, thêm vào
        const newSelected = [...prev, studentId];
        // Kiểm tra nếu đã chọn tất cả học sinh vắng mặt
        if (newSelected.length === absentStudents.length) {
          setSelectAll(true);
        }
        return newSelected;
      }
    });
  };

  // Gửi email cho học sinh đã chọn
  const sendAbsentEmails = async () => {
    if (selectedStudents.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một học sinh để gửi email', {
        duration: 3000,
      });
      return;
    }

    // Giả lập gửi email - trong thực tế, bạn sẽ gọi API
    try {
      // Hiển thị toast loading
      toast.loading('Đang gửi email thông báo vắng học...', {
        duration: 2000,
      });

      // Giả lập API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Hiển thị toast thành công
      toast.success(`Đã gửi email thông báo vắng học cho ${selectedStudents.length} học sinh`, {
        duration: 3000,
      });

      // Reset danh sách đã chọn
      setSelectedStudents([]);
      setSelectAll(false);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi gửi email thông báo', {
        duration: 3000,
      });
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Điểm danh học sinh
        </h1>
        <div className="flex items-center gap-2 mt-4">
          <span
            onClick={() => navigate('/teacher/schedule')}
            className="text-gray-600 text-base cursor-pointer hover:text-blue-600"
          >
            Lịch dạy
          </span>
          <span className="text-gray-400"> &gt; </span>
          <span
            onClick={() =>
              navigate(
                `/teacher/session-details/${attendanceData?.[0]?.session?.id}`,
              )
            }
            className="text-gray-600 text-base cursor-pointer hover:text-blue-600"
          >
            Chi tiết buổi học
          </span>
          <span className="text-gray-400"> &gt; </span>
          <span className="text-gray-900 font-medium">Quản lý điểm danh</span>
        </div>
      </div>

      <Card className="shadow-xl border-slate-200">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <CardTitle className="text-2xl text-slate-900">
                Danh sách điểm danh
                <br />
                <span className="text-sm font-normal text-slate-500">
                  Buổi học: {studentListData?.class?.name || 'N/A'} | Ngày:{' '}
                  {studentListData?.sessionDate
                    ? new Date(
                        studentListData?.sessionDate,
                      ).toLocaleDateString()
                    : 'N/A'}{' '}
                  | Thời gian: {studentListData?.startTime || 'N/A'} -{' '}
                  {studentListData?.endTime || 'N/A'} | Tổng số học sinh:{' '}
                  {studentListData?.class?.enrollments?.length || 0}
                </span>
              </CardTitle>
              {hasChanges && (
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 border-amber-300"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Có thay đổi chưa lưu
                </Badge>
              )}
            </div>
            <div className="flex gap-3 flex-wrap">
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 px-4 py-2">
                <Check className="h-4 w-4 mr-1" />
                Có mặt: {getStatusCount('present')}
              </Badge>
              <Badge className="bg-rose-100 text-rose-700 border-rose-300 px-4 py-2">
                <X className="h-4 w-4 mr-1" />
                Vắng: {getStatusCount('absent')}
              </Badge>
              <Badge className="bg-sky-100 text-sky-700 border-sky-300 px-4 py-2">
                <Check className="h-4 w-4 mr-1" />
                Có phép: {getStatusCount('excused')}
              </Badge>
              
              {/* Di chuyển phần thông báo vắng học vào đây */}
              {absentStudents.length > 0 && (
                <div className="bg-amber-50 p-2 rounded-lg border border-amber-200 shadow-md flex items-center gap-2 ml-2">
                  <div>
                    <div className="flex items-center mb-1">
                      <Checkbox 
                        id="select-all-absent"
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                        className="mr-1 h-4 w-4"
                      />
                      <label 
                        htmlFor="select-all-absent" 
                        className="text-xs font-medium text-amber-800 cursor-pointer"
                      >
                        Chọn {absentStudents.length} học sinh vắng
                      </label>
                    </div>
                    <Button
                      onClick={sendAbsentEmails}
                      variant="outline"
                      size="sm"
                      className={cn(
                        'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300',
                        'flex items-center gap-1 w-full text-xs py-1 h-6'
                      )}
                      disabled={selectedStudents.length === 0}
                    >
                      <Mail className="h-3 w-3" />
                      Gửi email ({selectedStudents.length})
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 relative">
          {/* Xóa phần thông báo vắng học ở đây vì đã di chuyển lên trên */}
          <div className="space-y-3">
            <div className="grid grid-cols-[3fr_1fr_1fr_1fr] gap-4 pb-4 border-b-2 border-slate-200 font-semibold text-sm text-slate-600 uppercase tracking-wide">
              <div>Học sinh</div>
              <div className="text-center">Có mặt</div>
              <div className="text-center">Vắng</div>
              <div className="text-center">Có phép</div>
            </div>

            {studentListData?.class?.enrollments?.length > 0 ? (
              studentListData?.class?.enrollments?.map((record: any) => {
                const studentId = record.studentId || record.student?.id;
                const currentStatus = getStudentCurrentStatus(studentId);
                const isAbsent = currentStatus === 'absent';

                return (
                  <div
                    key={studentId}
                    className="grid grid-cols-[3fr_1fr_1fr_1fr] gap-4 items-center py-4 px-3 rounded-lg hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      {/* Thêm checkbox cho học sinh vắng mặt */}
                      {isAbsent && (
                        <Checkbox 
                          id={`select-${studentId}`}
                          checked={selectedStudents.includes(studentId)}
                          onCheckedChange={() => handleSelectStudent(studentId)}
                          className="mr-1"
                        />
                      )}
                      <Avatar className="h-12 w-12 border-2 border-slate-200 shadow-sm">
                        <AvatarImage
                          src={
                            record.student?.user?.avatar ||
                            'https://picsum.photos/200/300'
                          }
                          alt={record.student?.user?.fullName || 'Student'}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                          {record.student?.user?.fullName?.charAt(0) || 'S'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 text-base">
                          {record.student?.user?.fullName || 'Chưa có tên'}
                        </span>
                        <span className="text-sm text-slate-500">
                          {record.student?.studentCode || 'N/A'} •{' '}
                        </span>
                      </div>
                    </div>

                    {(
                      ['present', 'absent', 'excused'] as AttendanceStatus[]
                    ).map((status) => {
                      const currentStatus = getStudentCurrentStatus(studentId);
                      const serverRecord = attendanceData?.data?.find(
                        (r: any) =>
                          (r.studentId || r.student?.id) === studentId,
                      );
                      const dbStatus = serverRecord?.status || null;
                      const isChanged =
                        localAttendance[studentId] !== undefined &&
                        localAttendance[studentId] !== dbStatus;

                      return (
                        <div key={status} className="flex justify-center">
                          <Button
                            variant={
                              currentStatus === status ? 'default' : 'outline'
                            }
                            size="sm"
                            onClick={() => {
                              handleStatusChange(studentId, status);
                            }}
                            className={cn(
                              'w-24 h-10 font-medium transition-all relative',
                              currentStatus === status &&
                                {
                                  present:
                                    'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md',
                                  absent:
                                    'bg-rose-600 hover:bg-rose-700 text-white shadow-md',
                                  excused:
                                    'bg-sky-600 hover:bg-sky-700 text-white shadow-md',
                                }[status],
                              currentStatus !== status &&
                                {
                                  present:
                                    'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300',
                                  absent:
                                    'hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300',
                                  excused:
                                    'hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300',
                                }[status],
                              // Thêm border cho button đã thay đổi
                              isChanged &&
                                currentStatus === status &&
                                'ring-2 ring-amber-400 ring-offset-1',
                            )}
                          >
                            {status === 'present' && (
                              <Check className="h-4 w-4 mr-1" />
                            )}
                            {status === 'absent' && (
                              <X className="h-4 w-4 mr-1" />
                            )}
                            {status === 'excused' && (
                              <Check className="h-4 w-4 mr-1" />
                            )}

                            {currentStatus === status &&
                              {
                                present: 'Có mặt',
                                absent: 'Vắng',
                                excused: 'Có phép',
                              }[status]}

                            {/* Hiển thị indicator nếu có thay đổi */}
                            {isChanged && currentStatus === status && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full"></div>
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center py-12">
                <p className="text-slate-500">Không có dữ liệu học sinh</p>
              </div>
            )}
          </div>



          <div className="flex justify-end mt-8 pt-6 border-t-2 border-slate-200">
            <Button
              onClick={handleSave}
              size="lg"
              disabled={!hasChanges || saveMutation.isPending}
              className={cn(
                'min-w-40 h-12 text-base font-semibold shadow-lg transition-all',
                hasChanges
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  : 'bg-gray-400 cursor-not-allowed',
              )}
              style={isAttendanceDisabled() ? { display: 'none' } : {}}
            >
              <Save className="h-5 w-5 mr-2" />
              {saveMutation.isPending
                ? 'Đang lưu...'
                : hasChanges
                ? 'Lưu điểm danh'
                : 'Không có thay đổi'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
