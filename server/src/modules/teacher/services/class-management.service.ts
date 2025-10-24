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
            let classStatus = undefined;
            if (status && status !== 'all' && status.trim() !== '') {
                classStatus = status;
            }

            // Tính offset cho phân trang
            const offset = (page - 1) * limit;

            // Xây dựng điều kiện where cho Class
            const whereCondition: any = {
                teacherId,
                ...(classStatus && { status: classStatus }),
                ...(search && search.trim() !== '' && {
                    name: {
                        contains: search.trim(),
                        mode: 'insensitive'
                    }
                })
            };

            // Nếu không có status parameter, mặc định lấy class active
            if (!status) {
                whereCondition.status = 'active';
            }

            // Validate page và limit
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;
            if (limit > 100) limit = 100;
            
            // Lấy tổng số class để tính tổng số trang
            const totalCount = await this.prisma.class.count({
                where: whereCondition
            });

            // Lấy dữ liệu classes
            const classes = await this.prisma.class.findMany({
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
                    subject: true,
                    room: true,
                    feeStructure: true,
                    grade: true,
                    _count: {
                        select: {
                            enrollments: true
                        }
                    }
                },
                skip: offset,
                take: limit,
                orderBy: [
                    { status: 'asc' },
                    { createdAt: 'desc' }
                ]
            });

            if (!classes.length) {
                throw new HttpException(
                    'Không tìm thấy lớp học được phân công',
                    HttpStatus.NOT_FOUND
                );
            }

            // Tính toán số lượng học sinh active cho mỗi class
            const classesWithActiveStudents = await Promise.all(
                classes.map(async (classItem) => {
                    const activeStudentCount = await this.prisma.enrollment.count({
                        where: {
                            classId: classItem.id,
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
                        ...classItem,
                        activeStudentCount
                    };
                })
            );

            // Transform data để trả về format phù hợp
            const transformedClasses = classesWithActiveStudents.map(classItem => ({
                // Class info
                id: classItem.id,
                name: classItem.name,
                description: classItem.description,
                grade: classItem.grade,
                maxStudents: classItem.maxStudents,
                status: classItem.status,
                academicYear: classItem.academicYear,
                expectedStartDate: classItem.expectedStartDate,
                actualStartDate: classItem.actualStartDate,
                actualEndDate: classItem.actualEndDate,
                createdAt: classItem.createdAt,
                updatedAt: classItem.updatedAt,
                
                // Teacher info
                teacherName: classItem.teacher?.user?.fullName || 'N/A',
                teacherEmail: classItem.teacher?.user?.email || 'N/A',
                teacherId: classItem.teacher?.id,
                
                // Subject info
                subject: classItem.subject,
                subjectId: classItem.subjectId,
                
                // Room info
                room: classItem.room,
                roomId: classItem.roomId,
                
                // Student count (chỉ học sinh active)
                studentCount: classItem.activeStudentCount,
                
                // Fee structure
                feeStructure: classItem.feeStructure,
                feeStructureId: classItem.feeStructureId,
                
                // Schedule (parse JSON)
                schedule: classItem.recurringSchedule ? 
                    (typeof classItem.recurringSchedule === 'string' ? 
                        JSON.parse(classItem.recurringSchedule) : 
                        classItem.recurringSchedule) : null,

                // Enrollment info (chỉ học sinh active)
                enrollmentStatus: {
                    current: classItem.activeStudentCount,
                    max: classItem.maxStudents,
                    percentage: classItem.maxStudents > 0 ? 
                        Math.round((classItem.activeStudentCount / classItem.maxStudents) * 100) : 0,
                    available: Math.max(0, classItem.maxStudents - classItem.activeStudentCount),
                    isFull: classItem.activeStudentCount >= classItem.maxStudents,
                    status: classItem.activeStudentCount >= classItem.maxStudents ? 'full' : 
                            classItem.activeStudentCount >= classItem.maxStudents * 0.8 ? 'nearly_full' : 'available'
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
            if (error instanceof HttpException) throw error;

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

            // Đếm classes theo status
            const classCounts = await this.prisma.class.groupBy({
                by: ['status'],
                where: { 
                    teacherId
                },
                _count: {
                    status: true
                }
            });
            
            if (!classCounts.length) {
                throw new HttpException(
                    'Không tìm thấy lớp học nào cho giáo viên này',
                    HttpStatus.NOT_FOUND
                );
            }

            // Khởi tạo object với tất cả trạng thái = 0
            const result = {
                total: 0,
                active: 0,
                draft: 0,
                completed: 0,
                cancelled: 0
            };

            // Tính tổng
            classCounts.forEach(item => {
                const count = item._count.status;
                result.total += count;
                
                if (item.status === 'active') {
                    result.active = count;
                } else if (item.status === 'draft') {
                    result.draft = count;
                } else if (item.status === 'completed') {
                    result.completed = count;
                } else if (item.status === 'cancelled') {
                    result.cancelled = count;
                }
            });

            return result;

        } catch (error) {
            if (error instanceof HttpException) throw error;
            
            throw new HttpException(
                'Có lỗi xảy ra khi lấy số lượng lớp học theo trạng thái',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );           
        }
    }

    async getClassDetail(teacherId: string, classId: string){
        try {
            if(!checkId(teacherId) || !checkId(classId)){
                throw new HttpException(
                    'ID không hợp lệ',
                    HttpStatus.BAD_REQUEST
                );
            }
            
            // Tìm class của teacher
            const classItem = await this.prisma.class.findFirst({
                where: { 
                    id: classId,
                    teacherId: teacherId
                },
                include: {
                    room: true,
                    subject: true,
                    feeStructure: true,
                    grade: true,
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
                    _count: {
                        select: {
                            enrollments: true
                        }
                    }
                }
            });

            if(!classItem){
                throw new HttpException(
                    'Lớp học không tồn tại hoặc bạn không có quyền truy cập',
                    HttpStatus.NOT_FOUND
                );
            }

            // Tính toán số lượng học sinh active
            const listStudent = await this.prisma.enrollment.findMany({
                where: {
                    classId: classItem.id,
                    status: 'active',
                    student: {
                        user: {
                            isActive: true
                        }
                    }
                },
                include: {
                    student: {
                        select: {
                          studentCode: true,
                          user: {
                                select: {
                                    avatar: true,
                                    fullName: true,
                                    email: true,
                                    phone: true,
                                    id: true
                                }
                            }
                        }
                    }
                }
            });
            
            const classSessionInfo = await this.prisma.classSession.findMany({
                where: {
                    classId: classItem.id,
                    academicYear: classItem.academicYear,
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
            const activeStudentCount = listStudent.length;

            // Tính tỷ lệ tham gia
            let totalAttendanceRate = 0;
            let totalSessions = classSessionInfo.length;
            
            if (totalSessions > 0 && activeStudentCount > 0) {
                let totalPresentCount = 0;
                let totalPossibleAttendances = totalSessions * activeStudentCount;
                
                classSessionInfo.forEach(session => {
                    const presentCount = session.attendances.filter(
                        attendance => attendance.status === 'present'
                    ).length;
                    totalPresentCount += presentCount;
                });
                
                totalAttendanceRate = totalPossibleAttendances > 0 ? 
                    Math.round((totalPresentCount / totalPossibleAttendances) * 100) : 0;
            }

            // Lấy tổng số lượng attendance theo từng status
            const totalPresentCount = classSessionInfo.reduce((total, session) => {
                return total + session.attendances.filter(attendance => attendance.status === 'present').length;
            }, 0);

            const totalAbsentCount = classSessionInfo.reduce((total, session) => {
                return total + session.attendances.filter(attendance => attendance.status === 'absent').length;
            }, 0);

            const totalExcusedCount = classSessionInfo.reduce((total, session) => {
                return total + session.attendances.filter(attendance => attendance.status === 'excused').length;
            }, 0);

            // Transform data để trả về format tương tự cũ
            const result = {
                // Class info
                id: classItem.id,
                name: classItem.name,
                description: classItem.description,
                grade: classItem.grade,
                maxStudents: classItem.maxStudents,
                status: classItem.status,
                academicYear: classItem.academicYear,
                expectedStartDate: classItem.expectedStartDate,
                actualStartDate: classItem.actualStartDate,
                actualEndDate: classItem.actualEndDate,
                createdAt: classItem.createdAt,
                updatedAt: classItem.updatedAt,
                
                // Relations
                room: classItem.room,
                subject: classItem.subject,
                //list student in class
                emrollments: listStudent,
                // Counts (chỉ học sinh active)
                studentCount: activeStudentCount,

                // Class sessions với tỷ lệ tham gia
                classSession: {
                    total: classSessionInfo.length,
                    completed: classSessionInfo.filter(session => session.status === 'completed').length,
                    upcoming: classSessionInfo.filter(session => session.status === 'scheduled' && new Date(session.sessionDate) > new Date()).length,
                    attendanceRate: totalAttendanceRate,
                    averageAttendancePerSession: totalSessions > 0 && activeStudentCount > 0 ? 
                        Math.round((classSessionInfo.reduce((sum, session) => {
                            return sum + session.attendances.filter(att => att.status === 'present').length;
                        }, 0) / totalSessions)) : 0,
                    totalPresentCount,
                    totalAbsentCount,
                    totalExcusedCount
                },
                
                // Schedule
                schedule: classItem.recurringSchedule ? 
                    (typeof classItem.recurringSchedule === 'string' ? 
                        JSON.parse(classItem.recurringSchedule) : 
                        classItem.recurringSchedule) : null
            };
            
            return result;

        } catch (error) {
            if(error instanceof HttpException) throw error;
            console.log(error);
            
            throw new HttpException(
                'Có lỗi xảy ra khi lấy chi tiết lớp học',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getHistoryAttendanceOfClass(classId: string, teacherId: string){
        try {
            if(!checkId(teacherId) || !checkId(classId)){
                throw new HttpException('ID không hợp lệ', HttpStatus.BAD_REQUEST);
            }
            
            
            // Validate class thuộc về teacher này
            const classItem = await this.prisma.class.findFirst({
                where: {
                    id: classId,
                    teacherId: teacherId
                }
            });
            if(!classItem){
                throw new HttpException('Lớp học không tồn tại hoặc bạn không có quyền truy cập', HttpStatus.NOT_FOUND);
            }

            // Lấy danh sách của classSessions với academic year của lớp
            const classSessions = await this.prisma.classSession.findMany({
                where: {
                    classId: classId,
                    academicYear: classItem.academicYear
                },
                include: {
                    attendances: {
                        include: {
                            student: {
                                select: {
                                    id: true,
                                    user: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    sessionDate: 'desc'
                }
            });

            if(classSessions.length === 0){
                throw new HttpException('Không tìm thấy buổi học nào của lớp này', HttpStatus.NOT_FOUND);
            }

            return classSessions;

        } catch(error) {
            if(error instanceof HttpException) throw error;

            throw new HttpException(
                'Có lỗi xảy ra khi lấy lịch sử điểm danh',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
