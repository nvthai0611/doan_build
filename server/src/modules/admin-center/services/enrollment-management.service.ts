import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';

@Injectable()
export class EnrollmentManagementService {
    constructor(private prisma: PrismaService) {}

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

            // Check class exists
            const classItem = await this.prisma.class.findUnique({
                where: { id: body.classId }
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
                    status: 'active'
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
                    status: 'active'
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

            // Create enrollment
            const enrollment = await this.prisma.enrollment.create({
                data: {
                    studentId: body.studentId,
                    classId: body.classId,
                    semester: body.semester || null,
                    status: body.status || 'active'
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
                message: 'Đăng ký học sinh thành công',
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

            // Check class exists
            const classItem = await this.prisma.class.findUnique({
                where: { id: body.classId }
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

            // Check capacity
            const activeEnrollments = await this.prisma.enrollment.count({
                where: {
                    classId: body.classId,
                    status: 'active'
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

                    // Check if already enrolled
                    const existingEnrollment = await this.prisma.enrollment.findFirst({
                        where: {
                            studentId,
                            classId: body.classId,
                            status: 'active'
                        }
                    });

                    if (existingEnrollment) {
                        results.failed.push({
                            studentId,
                            reason: 'Đã được đăng ký vào lớp này'
                        });
                        continue;
                    }

                    // Create enrollment
                    const enrollment = await this.prisma.enrollment.create({
                        data: {
                            studentId,
                            classId: body.classId,
                            semester: body.semester || null,
                            status: 'active'
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

            return {
                success: true,
                message: `Đăng ký thành công ${results.success.length}/${body.studentIds.length} học sinh`,
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

            if (search) where.student = {
                OR: [
                    { user: { fullName: { contains: search, mode: 'insensitive' } } },
                    { user: { email: { contains: search, mode: 'insensitive' } } }
                ]
            };

            const total = await this.prisma.enrollment.count({ where });

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
                                    avatar: true
                                }
                            }
                        }
                    }
                },
                orderBy: { enrolledAt: 'desc' }
            });

            return {
                success: true,
                message: 'Lấy danh sách học sinh thành công',
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

            // Update enrollment
            const updatedEnrollment = await this.prisma.enrollment.update({
                where: { id: parseInt(id) },
                data: {
                    status: body.status,
                    ...(body.status === 'completed' && {
                        completedAt: new Date(),
                        finalGrade: body.finalGrade || null,
                        completionStatus: body.completionStatus || null,
                        completionNotes: body.completionNotes || null
                    })
                }
            });

            // Note: currentStudents count is now managed through _count.enrollments in Class model
            // No need to manually update teacherClassAssignment since it no longer exists

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
                    status: 'active'
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
                    status: 'active'
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

            // Create new enrollment
            const newEnrollment = await this.prisma.enrollment.create({
                data: {
                    studentId: enrollment.studentId,
                    classId: body.newClassId,
                    semester: body.semester || enrollment.semester,
                    status: 'active'
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
                    status: 'active'
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
}
