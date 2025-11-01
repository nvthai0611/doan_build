import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { EmailNotificationService } from '../../shared/services/email-notification.service';

@Injectable()
export class EnrollmentManagementService {
    constructor(
        private prisma: PrismaService,
        private emailNotificationService: EmailNotificationService
    ) {}

    // Enroll 1 học sinh vào lớp
    async create(body: any) {
        try {
            // Validation
            if (!body.studentId || !body.classId) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'studentId và classId là bắt buộc'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Check student exists
            const student = await this.prisma.student.findUnique({
                where: { id: body.studentId }
            });

            if (!student) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Không tìm thấy học sinh'
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            // Check class exists and count sessions
            const classItem = await this.prisma.class.findUnique({
                where: { id: body.classId },
                include: {
                    _count: {
                        select: { sessions: true }
                    }
                }
            });

            if (!classItem) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Không tìm thấy lớp học'
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            // Check if student already enrolled in this class
            const existingEnrollment = await this.prisma.enrollment.findFirst({
                where: {
                    studentId: body.studentId,
                    classId: body.classId,
                    status: {
                        notIn: ['stopped', 'graduated']  // Chỉ check nếu chưa dừng học hoặc tốt nghiệp
                    }
                }
            });

            if (existingEnrollment) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Học sinh đã được đăng ký vào lớp này'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Check capacity
            const activeEnrollments = await this.prisma.enrollment.count({
                where: {
                    classId: body.classId,
                    status: {
                        notIn: ['stopped', 'graduated']
                    }
                }
            });

            if (classItem.maxStudents && activeEnrollments >= classItem.maxStudents) {
                throw new HttpException(
                    {
                        success: false,
                        message: `Lớp đã đầy (${activeEnrollments}/${classItem.maxStudents})`
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Determine enrollment status based on class sessions
            const hasSession = classItem._count.sessions > 0;
            const enrollmentStatus = hasSession ? 'studying' : 'not_been_updated';

            // Create enrollment
            const enrollment = await this.prisma.enrollment.create({
                data: {
                    studentId: body.studentId,
                    classId: body.classId,
                    semester: body.semester || null,
                    status: enrollmentStatus
                },
                include: {
                    student: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                    email: true
                                }
                            }
                        }
                    },
                    class: {
                        include: {
                            subject: true
                        }
                    }
                }
            });

            // Note: currentStudents count is now managed through _count.enrollments in Class model
            // No need to manually update teacherClassAssignment since it no longer exists

            return {
                success: true,
                message: hasSession 
                    ? 'Đăng ký học sinh thành công. Học sinh có thể xem lịch ngay.'
                    : 'Đăng ký học sinh thành công. Chờ lớp chuẩn bị lịch học.',
                data: enrollment
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi đăng ký học sinh',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Enroll nhiều học sinh cùng lúc
    async bulkEnroll(body: any) {
        try {
            // Validation
            if (!body.studentIds || !Array.isArray(body.studentIds) || body.studentIds.length === 0) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'studentIds phải là mảng và không được rỗng'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            if (!body.classId) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'classId là bắt buộc'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Check class exists and count sessions
            const classItem = await this.prisma.class.findUnique({
                where: { id: body.classId },
                include: {
                    _count: {
                        select: { sessions: true }
                    }
                }
            });

            if (!classItem) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Không tìm thấy lớp học'
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            // Check capacity (count active enrollments)
            const activeEnrollments = await this.prisma.enrollment.count({
                where: {
                    classId: body.classId,
                    status: {
                        notIn: ['stopped', 'graduated']
                    }
                }
            });

            const availableSlots = classItem.maxStudents ? classItem.maxStudents - activeEnrollments : 999999;
            
            if (body.studentIds.length > availableSlots) {
                throw new HttpException(
                    {
                        success: false,
                        message: `Không đủ chỗ. Chỉ còn ${availableSlots} chỗ trống`
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Determine enrollment status based on class sessions
            const hasSession = classItem._count.sessions > 0;
            const enrollmentStatus = hasSession ? 'studying' : 'not_been_updated';

            const results = {
                success: [],
                failed: []
            };

            // Process each student
            for (const studentId of body.studentIds) {
                try {
                    // Check student exists
                    const student = await this.prisma.student.findUnique({
                        where: { id: studentId }
                    });

                    if (!student) {
                        results.failed.push({
                            studentId,
                            reason: 'Không tìm thấy học sinh'
                        });
                        continue;
                    }

                    // Check if already enrolled (not stopped/graduated)
                    const existingEnrollment = await this.prisma.enrollment.findFirst({
                        where: {
                            studentId,
                            classId: body.classId,
                            status: {
                                notIn: ['stopped', 'graduated']
                            }
                        }
                    });

                    if (existingEnrollment) {
                        results.failed.push({
                            studentId,
                            reason: 'Đã được đăng ký vào lớp này'
                        });
                        continue;
                    }

                    // Create enrollment with dynamic status
                    const enrollment = await this.prisma.enrollment.create({
                        data: {
                            studentId,
                            classId: body.classId,
                            semester: body.semester || null,
                            status: enrollmentStatus
                        }
                    });

                    // Note: currentStudents count is now managed through _count.enrollments in Class model

                    results.success.push({
                        studentId,
                        enrollmentId: enrollment.id
                    });
                } catch (error) {
                    results.failed.push({
                        studentId,
                        reason: error.message
                    });
                }
            }

            // Gửi email thông báo hàng loạt cho phụ huynh (non-blocking)
            const successStudentIds = results.success.map(r => r.studentId);
            if (successStudentIds.length > 0) {
                this.emailNotificationService.sendBulkEnrollmentEmail(
                    successStudentIds,
                    body.classId
                ).catch(error => {
                    console.error('❌ Lỗi khi gửi email thông báo đăng ký:', error.message);
                });
            }

            return {
                success: true,
                message: hasSession
                    ? `Đăng ký thành công ${results.success.length}/${body.studentIds.length} học sinh. Học sinh có thể xem lịch ngay.`
                    : `Đăng ký thành công ${results.success.length}/${body.studentIds.length} học sinh. Chờ lớp chuẩn bị lịch học.`,
                data: results
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi đăng ký nhiều học sinh',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Lấy danh sách enrollments với filters
    async findAll(query: any) {
        try {
            const {
                classId,
                studentId,
                status,
                semester,
                page = 1,
                limit = 10
            } = query;

            const skip = (parseInt(page) - 1) * parseInt(limit);
            const take = parseInt(limit);

            // Build where clause
            const where: any = {};
            
            if (classId) where.classId = classId;
            if (studentId) where.studentId = studentId;
            if (status) where.status = status;
            if (semester) where.semester = semester;

            // Get total count
            const total = await this.prisma.enrollment.count({ where });

            // Get data
            const enrollments = await this.prisma.enrollment.findMany({
                where,
                skip,
                take,
                include: {
                    student: {
                        include: {
                            user: {
                                select: {
                                    id: true,
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
                            room: true
                        }
                    }
                },
                orderBy: { enrolledAt: 'desc' }
            });

            return {
                success: true,
                message: 'Lấy danh sách enrollment thành công',
                data: enrollments,
                meta: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi lấy danh sách enrollment',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Lấy danh sách học sinh trong lớp
    async findByClass(classId: string, query: any = {}) {
        try {
            const {search, page = 1, limit = 50 } = query;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const take = parseInt(limit);

            const where: any = { classId };

            // Search đầy đủ: tên, email, SĐT học viên, mã học viên, thông tin phụ huynh
            if (search) where.student = {
                OR: [
                    // Thông tin học viên
                    { user: { fullName: { contains: search, mode: 'insensitive' } } },
                    { user: { email: { contains: search, mode: 'insensitive' } } },
                    { user: { phone: { contains: search, mode: 'insensitive' } } },
                    { studentCode: { contains: search, mode: 'insensitive' } },
                    // Thông tin phụ huynh
                    { parent: { user: { fullName: { contains: search, mode: 'insensitive' } } } },
                    { parent: { user: { email: { contains: search, mode: 'insensitive' } } } },
                    { parent: { user: { phone: { contains: search, mode: 'insensitive' } } } }
                ]
            };

            const total = await this.prisma.enrollment.count({ where });

            // Lấy thông tin lớp học để biết ngày kết thúc
            const classInfo = await this.prisma.class.findUnique({
                where: { id: classId },
                select: {
                    actualEndDate: true,
                    expectedStartDate: true
                }
            });

            // Xác định ngày kết thúc để tính: dùng actualEndDate nếu có, không thì dùng ngày hiện tại
            const endDate = classInfo?.actualEndDate || new Date();

            const enrollments = await this.prisma.enrollment.findMany({
                where,
                skip,
                take,
                include: {
                    student: {
                            include: {
                            parent: {
                                include: {
                                    user: true,
                                }
                            },
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    email: true,
                                    phone: true,
                                    isActive: true,
                                    avatar: true
                                }
                            }
                        }
                    }
                },
                orderBy: { enrolledAt: 'desc' }
            });
            
            // Tính số buổi đã học và tổng buổi cho từng học sinh
            const enrollmentsWithStats = await Promise.all(
                enrollments.map(async (enrollment) => {
                    // Đếm tổng số buổi học đã lên lịch từ khi học sinh đăng ký
                    const totalSessions = await this.prisma.classSession.count({
                        where: {
                            classId: classId,
                            sessionDate: {
                                gte: enrollment.enrolledAt, // Từ ngày đăng ký
                                lte: new Date()    // Đến ngày kết thúc lớp hoặc hiện tại
                            }
                        }
                    });

                    // Đếm số buổi học sinh có mặt (present)
                    const attendedSessions = await this.prisma.studentSessionAttendance.count({
                        where: {
                            studentId: enrollment.studentId,
                            session: {
                                classId: classId,
                                sessionDate: {
                                    gte: enrollment.enrolledAt,
                                    lte: endDate
                                }
                            },
                            status: 'present'
                        }
                    });

                    return {
                        ...enrollment,
                        classesRegistered: totalSessions,
                        classesAttended: attendedSessions
                    };
                })
            );
            return {
                success: true,
                message: 'Lấy danh sách học sinh thành công',
                data: enrollmentsWithStats,
                meta: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi lấy danh sách học sinh',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Lấy lịch sử enrollment của học sinh
    async findByStudent(studentId: string) {
        try {
            const enrollments = await this.prisma.enrollment.findMany({
                where: { studentId },
                include: {
                    class: {
                        include: {
                            subject: true,
                            room: true
                        }
                    }
                },
                orderBy: { enrolledAt: 'desc' }
            });

            return {
                success: true,
                message: 'Lấy lịch sử enrollment thành công',
                data: enrollments
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi lấy lịch sử enrollment',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Cập nhật status của enrollment
    async updateStatus(id: string, body: any) {
        try {
            // Validation
            if (!body.status) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'status là bắt buộc'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Check enrollment exists with class info
            const enrollment = await this.prisma.enrollment.findUnique({
                where: { id: parseInt(id) },
                include: {
                    class: {
                        select: {
                            id: true,
                            name: true,
                            status: true,
                            teacherId: true,
                        }
                    },
                    student: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    id: true,
                                    isActive: true,
                                }
                            }
                        }
                    }
                }
            });

            if (!enrollment) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Không tìm thấy enrollment'
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            // Validation: Check if class exists and has teacher
            if (!enrollment.class) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Lớp học không tồn tại'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Validation: Cannot change status if class is cancelled or completed
            if (enrollment.class.status === 'cancelled') {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Không thể thay đổi trạng thái học sinh trong lớp đã hủy'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Validation: Cannot change to studying if class doesn't have teacher
            if (body.status === 'studying' && !enrollment.class.teacherId) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Lớp học chưa có giáo viên, không thể chuyển học sinh sang trạng thái đang học'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Validation: Cannot change to studying if class status is not active or ready
            if (body.status === 'studying' && !['active', 'ready'].includes(enrollment.class.status)) {
                throw new HttpException(
                    {
                        success: false,
                        message: `Không thể chuyển học sinh sang trạng thái đang học khi lớp ở trạng thái ${enrollment.class.status}`
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Validation: Check if student account is active when changing to studying
            if (body.status === 'studying' && !enrollment.student.user.isActive) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Không thể chuyển học sinh sang trạng thái đang học vì tài khoản học sinh đang không hoạt động'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Update enrollment
            const updatedEnrollment = await this.prisma.enrollment.update({
                where: { id: parseInt(id) },
                data: {
                    status: body.status,
                    ...(body.status === 'graduated' && {
                        completedAt: new Date(),
                    }),
                    ...(body.status === 'stopped' && {
                        completionNotes: body.completionNotes || 'Dừng học',
                    })
                }
            });

            return {
                success: true,
                message: 'Cập nhật trạng thái thành công',
                data: updatedEnrollment
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi cập nhật trạng thái',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Chuyển lớp cho học sinh
    async transfer(id: string, body: any) {
        try {
            // Validation
            if (!body.newClassId) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'newClassId là bắt buộc'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Check enrollment exists
            const enrollment = await this.prisma.enrollment.findUnique({
                where: { id: parseInt(id) },
                include: {
                    class: true
                }
            });

            if (!enrollment) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Không tìm thấy enrollment'
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            // Check new class exists
            const newClass = await this.prisma.class.findUnique({
                where: { id: body.newClassId }
            });

            if (!newClass) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Không tìm thấy lớp mới'
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            // Check capacity of new class
            const newClassEnrollments = await this.prisma.enrollment.count({
                where: {
                    classId: body.newClassId,
                    status: {
                        notIn: ['stopped', 'graduated']
                    }
                }
            });

            if (newClass.maxStudents && newClassEnrollments >= newClass.maxStudents) {
                throw new HttpException(
                    {
                        success: false,
                        message: `Lớp mới đã đầy (${newClassEnrollments}/${newClass.maxStudents})`
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Check if student already enrolled in new class
            const existingEnrollment = await this.prisma.enrollment.findFirst({
                where: {
                    studentId: enrollment.studentId,
                    classId: body.newClassId,
                    status: {
                        notIn: ['stopped', 'graduated']
                    }
                }
            });

            if (existingEnrollment) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Học sinh đã được đăng ký vào lớp mới'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Update old enrollment to withdrawn
            await this.prisma.enrollment.update({
                where: { id: parseInt(id) },
                data: {
                    status: 'withdrawn',
                    completionNotes: body.reason || 'Chuyển lớp'
                }
            });

            // Note: currentStudents count is now managed through _count.enrollments in Class model
            // No need to manually update teacherClassAssignment since it no longer exists

            // Create new enrollment with appropriate status
            // Check if new class has sessions
            const newClassSessions = await this.prisma.classSession.count({
                where: { classId: body.newClassId }
            });
            const newEnrollmentStatus = newClassSessions > 0 ? 'studying' : 'not_been_updated';
            
            const newEnrollment = await this.prisma.enrollment.create({
                data: {
                    studentId: enrollment.studentId,
                    classId: body.newClassId,
                    semester: body.semester || enrollment.semester,
                    status: newEnrollmentStatus
                }
            });

            // Note: currentStudents count is now managed through _count.enrollments in Class model

            return {
                success: true,
                message: 'Chuyển lớp thành công',
                data: {
                    oldEnrollment: enrollment,
                    newEnrollment
                }
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi chuyển lớp',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Xóa enrollment
    async delete(id: string) {
        try {
            // Check enrollment exists
            const enrollment = await this.prisma.enrollment.findUnique({
                where: { id: parseInt(id) }
            });

            if (!enrollment) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Không tìm thấy enrollment'
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            // Delete enrollment
            await this.prisma.enrollment.delete({
                where: { id: parseInt(id) }
            });

            // Note: currentStudents count is now managed through _count.enrollments in Class model
            // No need to manually update teacherClassAssignment since it no longer exists

            return {
                success: true,
                message: 'Xóa enrollment thành công'
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi xóa enrollment',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Kiểm tra còn chỗ không
    async checkCapacity(classId: string) {
        try {
            const classItem = await this.prisma.class.findUnique({
                where: { id: classId }
            });

            if (!classItem) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Không tìm thấy lớp học'
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            const activeEnrollments = await this.prisma.enrollment.count({
                where: {
                    classId,
                    status: {
                        notIn: ['stopped', 'graduated']
                    }
                }
            });

            const availableSlots = classItem.maxStudents ? classItem.maxStudents - activeEnrollments : null;

            return {
                success: true,
                message: 'Kiểm tra capacity thành công',
                data: {
                    maxStudents: classItem.maxStudents,
                    currentStudents: activeEnrollments,
                    availableSlots,
                    isFull: classItem.maxStudents ? activeEnrollments >= classItem.maxStudents : false
                }
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi kiểm tra capacity',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Lấy danh sách students CHƯA ENROLL vào lớp này
    async getAvailableStudents(classId: string, query: any = {}) {
        try {
            const { search, page = 1, limit = 10 } = query;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const take = parseInt(limit);

            // Validate classId
            const classItem = await this.prisma.class.findUnique({
                where: { id: classId }
            });

            if (!classItem) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Không tìm thấy lớp học'
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            // Lấy danh sách studentIds đã enroll (chưa stopped/graduated)
            const enrolledStudentIds = await this.prisma.enrollment.findMany({
                where: {
                    classId,
                    status: {
                        notIn: ['stopped', 'graduated']
                    }
                },
                select: {
                    studentId: true
                }
            });

            const excludedIds = enrolledStudentIds.map(e => e.studentId);

            // Build where clause cho students chưa enroll
            const where: any = {
                id: {
                    notIn: excludedIds
                },
                user: {
                    isActive: true  // Chỉ lấy students có tài khoản active
                }
            };

            // Thêm search nếu có
            if (search && search.trim()) {
                where.OR = [
                    { user: { fullName: { contains: search.trim(), mode: 'insensitive' } } },
                    { user: { email: { contains: search.trim(), mode: 'insensitive' } } },
                    { user: { phone: { contains: search.trim() } } },
                    { studentCode: { contains: search.trim(), mode: 'insensitive' } }
                ];
            }

            // Count total
            const total = await this.prisma.student.count({ where });

            // Get students
            const students = await this.prisma.student.findMany({
                where,
                skip,
                take,
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            phone: true,
                            avatar: true,
                            isActive: true
                        }
                    },
                    parent: {
                        include: {
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
                    createdAt: 'desc'
                }
            });

            return {
                success: true,
                message: 'Lấy danh sách học sinh chưa enroll thành công',
                data: students,
                meta: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi lấy danh sách học sinh',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
