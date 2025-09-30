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

            if(status == 'all' || status == '' || !status){
                status = undefined;
            }

            // Tính offset cho phân trang
            const offset = (page - 1) * limit;

            // Xây dựng điều kiện where cho TeacherAssignment
            const whereCondition: any = {
                teacherId,
                ...(status && { status })
            };

            // Thêm điều kiện search cho tên lớp học
            if (search && search.trim() !== '') {
                const searchTerm = search.trim();
                whereCondition.class = {
                    name: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    }
                };
            }

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
                            feeStructure: true,
                            _count: {
                                select: {
                                    enrollments: true,
                                }
                            }
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

            // Transform data để trả về format phù hợp
            const transformedClasses = assignments.map(assignment => ({
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
                
                // Student count
                studentCount: assignment.class._count.enrollments,
                
                // Fee structure
                feeStructure: assignment.class.feeStructure,
                feeStructureId: assignment.class.feeStructureId,
                
                // Schedule (parse JSON)
                schedule: assignment.recurringSchedule ? 
                    (typeof assignment.recurringSchedule === 'string' ? 
                        JSON.parse(assignment.recurringSchedule) : 
                        assignment.recurringSchedule) : null
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

    async getCountByStatus(teacherId: string){
        try {
            if(checkId(teacherId) === false){
                throw new HttpException(
                    'ID giáo viên không hợp lệ',
                    HttpStatus.BAD_REQUEST
                );
            }

            // Đếm theo status của TeacherAssignment
            const countByStatus = await this.prisma.teacherClassAssignment.groupBy({
                by: ['status'],
                where: { teacherId },
                _count: {
                    status: true
                }
            });
            
            if (!countByStatus.length) {
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
                cancelled: 0
            };

            // Tính tổng và phân loại theo status của assignment
            countByStatus.forEach(item => {
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

    async getClassDetail(teacherId: string, classId: string){
        try {
            if(!checkId(teacherId) || !checkId(classId)){
                throw new HttpException(
                    'ID không hợp lệ',
                    HttpStatus.BAD_REQUEST
                );
            }
            
            // Tìm assignment của teacher với class này
            const assignment = await this.prisma.teacherClassAssignment.findFirst({
                where: { 
                    teacherId, 
                    classId 
                },
                include: {
                    class: {
                        include: {
                            room: true,
                            subject: true,
                            feeStructure: true,
                            _count: {
                                select: {
                                    enrollments: true,
                                    sessions: true,
                                    assessments: true
                                }
                            }
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
                    }
                },
                orderBy: {
                    startDate: 'desc' // Lấy assignment mới nhất
                }
            });

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
                feeStructure: assignment.class.feeStructure,
                teacher: assignment.teacher,
                
                // Counts
                studentCount: assignment.class._count.enrollments,
                sessionCount: assignment.class._count.sessions,
                assessmentCount: assignment.class._count.assessments,
                
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
