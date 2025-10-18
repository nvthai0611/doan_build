import { useQuery } from "@tanstack/react-query"
import { ClassAttendanceHistory } from "../components/attendance/class-attendance-history"
import { getAttendanceHistoryOfClass } from "../../../../../services/teacher-service/manage-class.service"
// import { LoadingSpinner } from "../../../../../components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Loading from "../../../../../components/Loading/LoadingPage"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar } from 'lucide-react';
import { formatDate } from '@/utils/format';
import { getHistoryAttendanceOfClass } from '../../../../services/teacher-service/manage-class.service';

// Mock data for demonstration - COMMENTED OUT
// const mockStudents = [
// 	{
// 		id: "1",
// 		userId: "u1",
// 		studentCode: "ST001",
// 		grade: "10A",
// 		user: {
// 			id: "u1",
// 			fullName: "Nguyễn Văn An",
// 			avatar: "/diverse-students-studying.png",
// 			email: "an.nguyen@example.com",
// 		},
// 	},
// 	// ... rest of mock data
// ]

// const mockAttendanceRecords = [
// 	// ... mock data commented out
// ]

export default function ClassAttendancePage({
    teacherClassAssignmentId,
}: {
    teacherClassAssignmentId: any
}) {
    // Fetch attendance history data using React Query
    const {
        data: attendanceData,
        isLoading,
        isError,
        error,
        refetch
    } = useQuery({
        queryKey: ['attendanceHistory', teacherClassAssignmentId],
        queryFn: () => getAttendanceHistoryOfClass(teacherClassAssignmentId),
        enabled: !!teacherClassAssignmentId,
        staleTime: 30000,
        refetchOnWindowFocus: false
    })

    // Transform API data to match component structure
    const transformedData = attendanceData?.map((session: any) => ({
        session: {
            id: session.id,
            classId: session.classId,
            academicYear: session.academicYear,
            sessionDate: new Date(session.sessionDate),
            startTime: session.startTime,
            endTime: session.endTime,
            status: session.status,
            notes: session.notes,
        },
        attendances: session.attendances?.map((attendance: any) => ({
            id: attendance.id,
            sessionId: attendance.sessionId,
            studentId: attendance.studentId,
            status: attendance.status,
            note: attendance.note,
            recordedBy: attendance.recordedBy,
            recordedAt: new Date(attendance.recordedAt),
        })) || []
    })) || []

    // Extract unique students from all sessions
    const extractStudents = (sessions: any[]) => {
        const studentMap = new Map()
        
        sessions.forEach(session => {
            session.attendances?.forEach((attendance: any) => {
                if (attendance.student && !studentMap.has(attendance.studentId)) {
                    studentMap.set(attendance.studentId, {
                        id: attendance.studentId,
                        userId: attendance.student.user.id,
                        studentCode: attendance.student.user.username, // Using username as student code
                        grade: "N/A", // Not available in API response
                        user: {
                            id: attendance.student.user.id,
                            fullName: attendance.student.user.fullName,
                            avatar: attendance.student.user.avatar || "/diverse-students-studying.png",
                            email: attendance.student.user.email,
                        },
                    })
                }
            })
        })
        
        return Array.from(studentMap.values())
    }

    const students = extractStudents(attendanceData || [])

    if (isLoading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="flex items-center justify-center h-64">
                    <Loading  />
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="container mx-auto py-8 px-4">
                <Alert variant="destructive">
                    <AlertDescription>
                        Lỗi khi tải lịch sử điểm danh: {error?.message || 'Đã có lỗi xảy ra'}
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <ClassAttendanceHistory
                classId={teacherClassAssignmentId}
                className="Lớp học - Lịch sử điểm danh"
                students={students}
                attendanceRecords={transformedData}
                onRefresh={refetch}
            />
        </div>
    )
}

interface LichSuDiemDanhTabProps {
  classId: string;
  classData: any;
}

export function LichSuDiemDanhTab({
  classId,
  classData,
}: LichSuDiemDanhTabProps) {
  const {
    data: attendanceHistory,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['attendanceHistory', classId],
    queryFn: () => getHistoryAttendanceOfClass(classId),
    enabled: !!classId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const sessions = attendanceHistory?.data ?? [];

  const getAttendanceStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      present: 'bg-green-100 text-green-700',
      absent: 'bg-red-100 text-red-700',
      excused: 'bg-yellow-100 text-yellow-700',
    };
    return colorMap[status] ?? 'bg-gray-100 text-gray-700';
  };

  const getAttendanceStatusLabel = (status: string): string => {
    const labelMap: Record<string, string> = {
      present: 'Có mặt',
      absent: 'Vắng',
      excused: 'Xin phép',
    };
    return labelMap[status] ?? status;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
        <span className="text-gray-600 dark:text-gray-400">Đang tải...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">
          {(error as any)?.message || 'Có lỗi xảy ra khi tải lịch sử điểm danh'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Tổng buổi học
            </p>
            <p className="text-3xl font-bold text-blue-600">
              {sessions?.length ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Có mặt
            </p>
            <p className="text-3xl font-bold text-green-600">
              {classData?.classSession?.totalPresentCount ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Vắng</p>
            <p className="text-3xl font-bold text-red-600">
              {classData?.classSession?.totalAbsentCount ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Xin phép
            </p>
            <p className="text-3xl font-bold text-yellow-600">
              {classData?.classSession?.totalExcusedCount ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Lịch sử điểm danh theo buổi học
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Chưa có lịch sử điểm danh nào
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session: any, idx: number) => (
                <Card
                  key={idx}
                  className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Buổi {idx + 1}
                      </CardTitle>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {session?.sessionDate
                          ? formatDate(session.sessionDate)
                          : 'N/A'}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {session?.attendances && Array.isArray(session.attendances) ? (
                      <div className="space-y-2">
                        {session.attendances.slice(0, 5).map((attendance: any, aidx: number) => (
                          <div
                            key={aidx}
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                          >
                            <span className="text-sm text-gray-900 dark:text-white">
                              {attendance?.student?.user?.fullName ?? 'N/A'}
                            </span>
                            <Badge
                              className={getAttendanceStatusColor(
                                attendance?.status ?? ''
                              )}
                            >
                              {getAttendanceStatusLabel(
                                attendance?.status ?? ''
                              )}
                            </Badge>
                          </div>
                        ))}
                        {session.attendances.length > 5 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 pt-2">
                            +{session.attendances.length - 5} người khác
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Không có dữ liệu điểm danh
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
