import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { checkId } from 'src/utils/validate.util';

@Injectable()
export class ClassManagementService {
    constructor(private prisma: PrismaService) {}

    async getClassByTeacherId(
        teacherId: string, 
        status: string,
        page: number,
        limit: number,
        search?: string
    ) {
        try {
            if(checkId(teacherId) === false){
                throw new HttpException(
                    'ID giáo viên không hợp lệ',
                    HttpStatus.BAD_REQUEST
                )
            }

            // Validate teacher existence
            const teacher = await this.prisma.teacher.findUnique({
                where: { id: teacherId }
            });

            if (!teacher) {
                throw new HttpException(
                    'Giáo viên không tồn tại',
                    HttpStatus.NOT_FOUND
                );
            }

            // Xử lý status parameter
            let assignmentStatus = undefined;
            if (status && status !== 'all' && status.trim() !== '') {
                assignmentStatus = status;
            }

            // Tính offset cho phân trang
            const offset = (page - 1) * limit;

            // Xây dựng điều kiện where cho TeacherAssignment
            const whereCondition: any = {
                teacherId,
                ...(assignmentStatus && { status: assignmentStatus }),
                class: {
                    // Chỉ filter class theo 'active' khi KHÔNG có status hoặc status khác 'all'
                    ...((!status || (status !== 'all' && !assignmentStatus)) && { status: 'active' }),
                    ...(search && search.trim() !== '' && {
                        name: {
                            contains: search.trim(),
                            mode: 'insensitive'
                        }
                    })
                }
            };

            // Nếu không có status parameter, mặc định lấy assignment active
            if (!status) {
                whereCondition.status = 'active';
            }
            // Nếu status là 'all', không filter theo assignment status (bỏ điều kiện status)

            // Validate page và limit
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;
            if (limit > 100) limit = 100;
            
            // Lấy tổng số assignment để tính tổng số trang
            const totalCount = await this.prisma.teacherClassAssignment.count({
                where: whereCondition
            });

            // Lấy dữ liệu assignments với thông tin class
            const assignments = await this.prisma.teacherClassAssignment.findMany({
                where: whereCondition,
                include: { 
                    teacher: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    fullName: true,
                                    email: true,
                                    phone: true
                                }
                            }
                        }
                    },
                    class: {
                        include: {
                            subject: true,
                            room: true,
                            feeStructure: true
                        }
                    },
                    _count:{
                        select:{
                            enrollments: true
                        }
                    }
                },
                skip: offset,
                take: limit,
                orderBy: [
                    { status: 'asc' }, // Active assignments trước
                    { startDate: 'desc' } // Assignments mới nhất trước
                ]
            });

            if (!assignments.length) {
                throw new HttpException(
                    'Không tìm thấy lớp học được phân công',
                    HttpStatus.NOT_FOUND
                );
            }

            // Tính toán số lượng học sinh active cho mỗi assignment
            const assignmentsWithActiveStudents = await Promise.all(
                assignments.map(async (assignment) => {
                    const activeStudentCount = await this.prisma.enrollment.count({
                        where: {
                            teacherClassAssignmentId: assignment.id,
                            status: 'active',
                            completedAt: null,
                            student: {
                                user: {
                                    isActive: true
                                }
                            }
                        }
                    });
                
                    
                    return {
                        ...assignment,
                        activeStudentCount
                    };
                })
            );

            // Transform data để trả về format phù hợp
            const transformedClasses = assignmentsWithActiveStudents.map(assignment => ({
                // Assignment info
                assignmentId: assignment.id,
                assignmentStatus: assignment.status,
                startDate: assignment.startDate,
                endDate: assignment.endDate,
                semester: assignment.semester,
                academicYear: assignment.academicYear,
                notes: assignment.notes,
                
                // Class info (giữ nguyên structure cũ để không break frontend)
                id: assignment.class.id,
                name: assignment.class.name,
                description: assignment.class.description,
                grade: assignment.class.grade,
                maxStudents: assignment.class.maxStudents,
                status: assignment.class.status,
                createdAt: assignment.class.createdAt,
                updatedAt: assignment.class.updatedAt,
                
                // Teacher info
                teacherName: assignment.teacher?.user?.fullName || 'N/A',
                teacherEmail: assignment.teacher?.user?.email || 'N/A',
                
                // Subject info
                subject: assignment.class.subject,
                subjectId: assignment.class.subjectId,
                
                // Room info
                room: assignment.class.room,
                roomId: assignment.class.roomId,
                
                // Student count (chỉ học sinh active)
                studentCount: assignment.activeStudentCount,
                
                // Fee structure
                feeStructure: assignment.class.feeStructure,
                feeStructureId: assignment.class.feeStructureId,
                
                // Schedule (parse JSON)
                schedule: assignment.recurringSchedule ? 
                    (typeof assignment.recurringSchedule === 'string' ? 
                        JSON.parse(assignment.recurringSchedule) : 
                        assignment.recurringSchedule) : null,

                // Enrollment info (chỉ học sinh active)
                enrollmentStatus: {
                    current: assignment.activeStudentCount,
                    max: assignment.class.maxStudents,
                    percentage: assignment.class.maxStudents > 0 ? 
                        Math.round((assignment.activeStudentCount / assignment.class.maxStudents) * 100) : 0,
                    available: Math.max(0, assignment.class.maxStudents - assignment.activeStudentCount),
                    isFull: assignment.activeStudentCount >= assignment.class.maxStudents,
                    status: assignment.activeStudentCount >= assignment.class.maxStudents ? 'full' : 
                            assignment.activeStudentCount >= assignment.class.maxStudents * 0.8 ? 'nearly_full' : 'available'
                },
            }));
            
            // Tính toán thông tin phân trang
            const totalPages = Math.ceil(totalCount / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            const result = {
                data: transformedClasses,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    limit,
                    hasNextPage,
                    hasPrevPage
                },
                filters: {
                    search: search || '',
                    status: status || ''
                }
            };

            return result;

        } catch (error) {
            // Nếu đã là HttpException thì ném lại
            if (error instanceof HttpException) throw error;

            // Còn lại là lỗi từ Prisma hoặc runtime khác
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi lấy danh sách lớp học',
                    error: error?.message || error,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getCountByStatus(teacherId: string) {
        try {
            if (checkId(teacherId) === false) {
                throw new HttpException(
                    'ID giáo viên không hợp lệ',
                    HttpStatus.BAD_REQUEST
                );
            }

            // Validate teacher existence
            const teacher = await this.prisma.teacher.findUnique({
                where: { id: teacherId }
            });

            if (!teacher) {
                throw new HttpException(
                    'Giáo viên không tồn tại',
                    HttpStatus.NOT_FOUND
                );
            }

            // Đếm theo status của TeacherAssignment với class active
            const activeAssignmentCounts = await this.prisma.teacherClassAssignment.groupBy({
                by: ['status'],
                where: { 
                    teacherId
                },
                _count: {
                    status: true
                }
            });

            // Đếm tổng tất cả assignment (không filter class status)
            const totalAssignmentCounts = await this.prisma.teacherClassAssignment.groupBy({
                by: ['status'],
                where: { 
                    teacherId
                    // Không filter class status để có tổng thực tế
                },
                _count: {
                    status: true
                }
            });
            
            if (!activeAssignmentCounts.length && !totalAssignmentCounts.length) {
                throw new HttpException(
                    'Không tìm thấy lớp học nào cho giáo viên này',
                    HttpStatus.NOT_FOUND
                );
            }

            // Khởi tạo object với tất cả trạng thái = 0
            const result = {
                total: 0,
                active: 0,
                completed: 0,
                cancelled: 0,
                // Thêm thông tin về class status
                activeClassOnly: {
                    total: 0,
                    active: 0,
                    completed: 0,
                    cancelled: 0
                }
            };

            // Tính tổng từ tất cả assignment (bao gồm cả class inactive)
            totalAssignmentCounts.forEach(item => {
                const count = item._count.status;
                result.total += count;
                
                if (item.status === 'active') {
                    result.active = count;
                } else if (item.status === 'completed') {
                    result.completed = count;
                } else if (item.status === 'cancelled') {
                    result.cancelled = count;
                }
            });

            // Tính từ assignment với class active only
            activeAssignmentCounts.forEach(item => {
                const count = item._count.status;
                result.activeClassOnly.total += count;
                
                if (item.status === 'active') {
                    result.activeClassOnly.active = count;
                } else if (item.status === 'completed') {
                    result.activeClassOnly.completed = count;
                } else if (item.status === 'cancelled') {
                    result.activeClassOnly.cancelled = count;
                }
            });

            return result;

        } catch (error) {
            // Nếu đã là HttpException thì ném lại
            if (error instanceof HttpException) throw error;
            
            // Còn lại là lỗi từ Prisma hoặc runtime khác
            throw new HttpException(
                'Có lỗi xảy ra khi lấy số lượng lớp học theo trạng thái',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );           
        }
    }

    async getClassDetail(teacherId: string, teacherClassAssignmentId: string){
        try {
            if(!checkId(teacherId) || !checkId(teacherClassAssignmentId)){
                throw new HttpException(
                    'ID không hợp lệ',
                    HttpStatus.BAD_REQUEST
                );
            }
            
            // Tìm assignment của teacher với class này
            const assignment = await this.prisma.teacherClassAssignment.findFirst({
                where: { 
                    id:teacherClassAssignmentId
                },
                include: {
                    class: {
                        include: {
                            room: true,
                            subject: true,
                            feeStructure: true,                         
                        }
                    },
                    teacher: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    fullName: true,
                                    email: true,
                                    phone: true
                                }   
                            }
                        }
                    },
                    _count:{
                        select:{
                            enrollments: true
                        }
                    }
                },
                orderBy: {
                    startDate: 'desc' // Lấy assignment mới nhất
                }
            });

            // Tính toán số lượng học sinh active
            const activeStudentCount = await this.prisma.enrollment.count({
                where: {
                    teacherClassAssignmentId: assignment.id,
                    status: 'active',
                    completedAt: null,
                    student: {
                        user: {
                            isActive: true
                        }
                    }
                }
            });

            // Thêm activeStudentCount vào assignment object
            const assignmentWithActiveCount = {
                ...assignment,
                activeStudentCount
            };

            const classSessionInfo = await this.prisma.classSession.findMany({
                where: {
                    classId: assignment?.classId,
                    academicYear: assignment?.academicYear,
                },
                include: {
                    attendances: {
                        select: {
                            status: true,
                            studentId: true
                        }
                    }
                }
            });

            // Tính tỷ lệ tham gia
            let totalAttendanceRate = 0;
            let totalSessions = classSessionInfo.length;
            
            if (totalSessions > 0) {
                const totalStudents = assignmentWithActiveCount.activeStudentCount;
                
                if (totalStudents > 0) {
                    let totalPresentCount = 0;
                    let totalPossibleAttendances = totalSessions * totalStudents;
                    
                    classSessionInfo.forEach(session => {
                        const presentCount = session.attendances.filter(
                            attendance => attendance.status === 'present'
                        ).length;
                        totalPresentCount += presentCount;
                    });
                    
                    totalAttendanceRate = totalPossibleAttendances > 0 ? 
                        Math.round((totalPresentCount / totalPossibleAttendances) * 100) : 0;
                }
            }

            //Lấy tổng số lượng attendance với status 'present'

            const totalPresentCount = classSessionInfo.reduce((total, session) => {
                return total + session.attendances.filter(attendance => attendance.status === 'present').length;
            }, 0);

            // //Lấy tổng số lượng attendance với status 'absent'

            const totalAbsentCount = classSessionInfo.reduce((total, session) => {
                return total + session.attendances.filter(attendance => attendance.status === 'absent').length;
            }, 0);

            // Lấy tổng số lượng attendance với status 'excused'
            const totalExcusedCount = classSessionInfo.reduce((total, session) => {
                return total + session.attendances.filter(attendance => attendance.status === 'excused').length;
            }, 0);

            
            if(!assignment){
                throw new HttpException(
                    'Lớp học không tồn tại hoặc bạn không có quyền truy cập',
                    HttpStatus.NOT_FOUND
                );
            }
            
            // Transform data để trả về format tương tự cũ
            const result = {
                // Assignment info
                assignmentId: assignment.id,
                assignmentStatus: assignment.status,
                startDate: assignment.startDate,
                endDate: assignment.endDate,
                semester: assignment.semester,
                academicYear: assignment.academicYear,
                assignmentNotes: assignment.notes,
                
                // Class info
                id: assignment.class.id,
                name: assignment.class.name,
                description: assignment.class.description,
                grade: assignment.class.grade,
                maxStudents: assignment.class.maxStudents,
                status: assignment.class.status,
                createdAt: assignment.class.createdAt,
                updatedAt: assignment.class.updatedAt,
                
                // Relations
                room: assignment.class.room,
                subject: assignment.class.subject,
                
                // Counts (chỉ học sinh active)
                studentCount: assignmentWithActiveCount.activeStudentCount,

                // Class sessions với tỷ lệ tham gia
                classSession:{
                    total: classSessionInfo.length,
                    completed: classSessionInfo.filter(session => session.status === 'completed').length,
                    upcoming: classSessionInfo.filter(session => session.status === 'scheduled' && new Date(session.sessionDate) > new Date()).length,
                    attendanceRate: totalAttendanceRate, // Tỷ lệ tham gia tổng thể (%)
                    averageAttendancePerSession: totalSessions > 0 && assignmentWithActiveCount.activeStudentCount > 0 ? 
                        Math.round((classSessionInfo.reduce((sum, session) => {
                            return sum + session.attendances.filter(att => att.status === 'present').length;
                        }, 0) / totalSessions)) : 0,
                    totalPresentCount: totalPresentCount,
                    totalAbsentCount: totalAbsentCount,
                    totalExcusedCount: totalExcusedCount
                },
                
                // Schedule
                recurringSchedule: assignment.recurringSchedule ? 
                    (typeof assignment.recurringSchedule === 'string' ? 
                        JSON.parse(assignment.recurringSchedule) : 
                        assignment.recurringSchedule) : null
            };
            
            return result;

        } catch (error) {
            if(error instanceof HttpException) throw error;

            throw new HttpException(
                'Có lỗi xảy ra khi lấy chi tiết lớp học',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Thêm method để lấy lịch sử assignments của một class
    async getClassAssignmentHistory(teacherId: string, classId: string) {
        try {
            if(!checkId(teacherId) || !checkId(classId)){
                throw new HttpException(
                    'ID không hợp lệ',
                    HttpStatus.BAD_REQUEST
                );
            }

            const assignments = await this.prisma.teacherClassAssignment.findMany({
                where: { classId },
                include: {
                    teacher: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    fullName: true,
                                    email: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    startDate: 'desc'
                }
            });

            return assignments;

        } catch (error) {
            if(error instanceof HttpException) throw error;

            throw new HttpException(
                'Có lỗi xảy ra khi lấy lịch sử phân công lớp học',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    
}
