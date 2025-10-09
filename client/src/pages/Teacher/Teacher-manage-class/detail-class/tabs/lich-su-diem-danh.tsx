import { useQuery } from "@tanstack/react-query"
import { ClassAttendanceHistory } from "../components/attendance/class-attendance-history"
import { getAttendanceHistoryOfClass } from "../../../../../services/teacher-service/manage-class.service"
// import { LoadingSpinner } from "../../../../../components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Loading from "../../../../../components/Loading/LoadingPage"

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
