import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';

@Injectable()
export class ClassManagementService {
    constructor(private prisma: PrismaService) {}
    // Lấy danh sách tất cả lớp học với filters và pagination
    async findAll(query: any) {
        try {
            const { 
                status, 
                grade, 
                subjectId, 
                teacherId, 
                roomId,
                search,
                // Advanced search filters
                dayOfWeek,
                shift,
                // academicYear,
                // semester,
                // startDate,
                // endDate,
                // rating,
                page = 1, 
                limit = Math.min(parseInt(query.limit) || 10, 50), // Max 50 items per page
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = query;
            console.log(query);
            
            
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const take = parseInt(limit);
            // Build where clause
            const where: any = {};
            
            if (status && status !== 'all') where.status = status;
            if (grade) where.grade = grade;
            if (subjectId) where.subjectId = subjectId;
            if (roomId) where.roomId = roomId;
            
            // Enhanced search - search in name, description, grade, subject name, teacher name
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { grade: { contains: search, mode: 'insensitive' } },
                    { 
                        subject: {
                            name: { contains: search, mode: 'insensitive' }
                        }
                    },
                    {
                        teacherClassAssignments: {
                            some: {
                                teacher: {
                                    user: {
                                        fullName: { contains: search, mode: 'insensitive' }
                                    }
                                }
                            }
                        }
                    },
                    {
                        room: {
                            name: { contains: search, mode: 'insensitive' }
                        }
                    }
                ];
            }

            // Filter by teacher
            let classIds: string[] | undefined;
            // if (teacherId) {
            //     const assignments = await this.prisma.teacherClassAssignment.findMany({
            //         where: { teacherId },
            //         select: { classId: true }
            //     });
            //     classIds = assignments.map(a => a.classId);
            //     where.id = { in: classIds };
            // }
            
            // // Filter by day of week
            if (dayOfWeek && dayOfWeek !== 'all') {
                where.teacherClassAssignments = {
                    some: {
                        recurringSchedule: {
                            path: ['dayOfWeek'],
                            equals: dayOfWeek
                        }
                    }
                };
            }

            // Filter by shift (morning, afternoon, evening)
            if (shift && shift !== 'all') {
                const timeRanges = {
                    morning: { start: '00:00', end: '11:59' },
                    afternoon: { start: '12:00', end: '16:59' },
                    evening: { start: '17:00', end: '23:59' }
                };
                
                const timeRange = timeRanges[shift];
                if (timeRange) {
                    where.teacherClassAssignments = {
                        some: {
                            recurringSchedule: {
                                path: ['startTime'],
                                gte: timeRange.start,
                                lte: timeRange.end
                            }
                        }
                    };
                }
            }

            // // Filter by academic year and semester
            // if (academicYear || semester) {
            //     const assignmentFilter: any = {};
            //     if (academicYear) assignmentFilter.academicYear = academicYear;
            //     if (semester) assignmentFilter.semester = semester;
                
            //     where.teacherClassAssignments = {
            //         some: assignmentFilter
            //     };
            // }

            // // Filter by date range
            // if (startDate || endDate) {
            //     const dateFilter: any = {};
            //     if (startDate) dateFilter.gte = new Date(startDate);
            //     if (endDate) dateFilter.lte = new Date(endDate);
                
            //     where.startDate = dateFilter;
            // }

            // // Filter by rating (if rating system exists)
            // if (rating) {
            //     where.averageRating = { gte: parseFloat(rating) };
            // }

            // Get total count
            const total = await this.prisma.class.count({ where });

            // Build orderBy clause
            const orderBy: any = {};
            if (sortBy && sortOrder) {
                orderBy[sortBy] = sortOrder;
            } else {
                orderBy.createdAt = 'desc'; // Default ordering
            }
             console.log(where);
                    
            // Get data with relations - optimized for performance
            const classes = await this.prisma.class.findMany({
                where,
                skip,
                take,
                orderBy,
                include: {
                    subject: true,
                    room: true,
                    teacherClassAssignments: {
                        where: {
                            // academicYear: currentAcademicYear, 
                        },
                        select: {
                            id: true,
                            startDate: true,
                            endDate: true,
                            semester: true,
                            academicYear: true,
                            recurringSchedule: true,
                            teacher: {
                                select: {
                                    id: true,
                                    userId: true,
                                    user: {
                                        select: {
                                            id: true,
                                            fullName: true,
                                            email: true
                                        }
                                    }
                                }
                            }
                        },
                        take: 1, // Chỉ lấy 1 assignment (teacher đầu tiên)
                        orderBy: orderBy
                    },
                    _count: {
                        select: { enrollments: true }
                    }
                }
            });

            // Transform data
            const transformedClasses = classes.map(cls => ({
                id: cls.id,
                name: cls.name,
                subjectId: cls.subjectId,
                subjectName: cls.subject?.name || '',
                grade: cls.grade,
                status: cls.status,
                maxStudents: cls.maxStudents,
                currentStudents: cls._count.enrollments,
                roomId: cls.roomId,
                roomName: cls.room?.name || 'Chưa xác định',
                description: cls.description,
                feeStructureId: cls.feeStructureId,
                teachers: cls.teacherClassAssignments.map(ta => ({
                    id: ta.teacher.id,
                    userId: ta.teacher.userId,
                    name: ta.teacher.user.fullName,
                    email: ta.teacher.user.email,
                    assignmentId: ta.id,
                    startDate: ta.startDate,
                    endDate: ta.endDate,
                    semester: ta.semester,
                    academicYear: ta.academicYear,
                    recurringSchedule: ta.recurringSchedule
                })),
                createdAt: cls.createdAt,
                updatedAt: cls.updatedAt
            }));
            console.log(transformedClasses);
            
            return {
                success: true,
                message: 'Lấy danh sách lớp học thành công',
                data: transformedClasses,
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
                    message: 'Có lỗi xảy ra khi lấy danh sách lớp học',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Lấy chi tiết 1 lớp học
    async findOne(id: string) {
        try {
            // Validate UUID
            if (!this.isValidUUID(id)) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'ID lớp học không hợp lệ'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Lấy thông tin năm học và semester hiện tại

            const classItem = await this.prisma.class.findUnique({
                where: { id },
                include: {
                    subject: true,
                    room: true,
                    feeStructure: true,
                    teacherClassAssignments: {
                        where: {
                            // academicYear: currentAcademicYear,
                            // semester: currentSemester,
                            status: 'active'
                        },
                        include: {
                            teacher: {
                                include: {
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
                        }
                    },
                    enrollments: {
                        where: { status: 'active' },
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
                            }
                        }
                    },
                    _count: {
                        select: { enrollments: true }
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

            return {
                success: true,
                message: 'Lấy thông tin lớp học thành công',
                data: {
                    ...classItem,
                    subjectName: classItem.subject?.name,
                    roomName: classItem.room?.name,
                    currentStudents: classItem._count.enrollments,
                    teachers: classItem.teacherClassAssignments.map(ta => ({
                        ...ta.teacher.user,
                        teacherId: ta.teacher.id,
                        assignmentId: ta.id,
                        startDate: ta.startDate,
                        endDate: ta.endDate,
                        semester: ta.semester,
                        academicYear: ta.academicYear,
                        recurringSchedule: ta.recurringSchedule
                    })),
                    students: classItem.enrollments.map(e => ({
                        enrollmentId: e.id,
                        studentId: e.student.id,
                        ...e.student.user,
                        enrolledAt: e.enrolledAt,
                        status: e.status
                    }))
                }
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi lấy thông tin lớp học',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Tạo lớp học mới
    async create(body: any) {
        try {
            // Validation
            if (!body.name || !body.subjectId) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Tên lớp và môn học là bắt buộc'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Check subject exists
            const subject = await this.prisma.subject.findUnique({
                where: { id: body.subjectId }
            });

            if (!subject) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Môn học không tồn tại'
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            // Check room exists if provided
            if (body.roomId) {
                const room = await this.prisma.room.findUnique({
                    where: { id: body.roomId }
                });

                if (!room) {
                    throw new HttpException(
                        {
                            success: false,
                            message: 'Phòng học không tồn tại'
                        },
                        HttpStatus.NOT_FOUND
                    );
                }
            }

            const newClass = await this.prisma.class.create({
                data: {
                    name: body.name,
                    subjectId: body.subjectId,
                    grade: body.grade || null,
                    maxStudents: body.maxStudents || null,
                    roomId: body.roomId || null,
                    feeStructureId: body.feeStructureId || null,
                    description: body.description || null,
                    status: body.status || 'draft'
                },
                include: {
                    subject: true,
                    room: true
                }
            });

            return {
                success: true,
                message: 'Tạo lớp học thành công',
                data: newClass
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi tạo lớp học',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Cập nhật lớp học
    async update(id: string, body: any) {
        try {
            // Validate UUID
            if (!this.isValidUUID(id)) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'ID lớp học không hợp lệ'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Check class exists
            const existingClass = await this.prisma.class.findUnique({
                where: { id }
            });

            if (!existingClass) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Không tìm thấy lớp học'
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            // Check subject exists if provided
            if (body.subjectId) {
                const subject = await this.prisma.subject.findUnique({
                    where: { id: body.subjectId }
                });

                if (!subject) {
                    throw new HttpException(
                        {
                            success: false,
                            message: 'Môn học không tồn tại'
                        },
                        HttpStatus.NOT_FOUND
                    );
                }
            }

            // Check room exists if provided
            if (body.roomId) {
                const room = await this.prisma.room.findUnique({
                    where: { id: body.roomId }
                });

                if (!room) {
                    throw new HttpException(
                        {
                            success: false,
                            message: 'Phòng học không tồn tại'
                        },
                        HttpStatus.NOT_FOUND
                    );
                }
            }

            const updatedClass = await this.prisma.class.update({
                where: { id },
                data: {
                    ...(body.name && { name: body.name }),
                    ...(body.subjectId && { subjectId: body.subjectId }),
                    ...(body.grade !== undefined && { grade: body.grade }),
                    ...(body.maxStudents !== undefined && { maxStudents: body.maxStudents }),
                    ...(body.roomId !== undefined && { roomId: body.roomId }),
                    ...(body.feeStructureId !== undefined && { feeStructureId: body.feeStructureId }),
                    ...(body.description !== undefined && { description: body.description }),
                    ...(body.status && { status: body.status })
                },
                include: {
                    subject: true,
                    room: true
                }
            });

            return {
                success: true,
                message: 'Cập nhật lớp học thành công',
                data: updatedClass
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi cập nhật lớp học',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Xóa lớp học (soft delete bằng cách đổi status)
    async delete(id: string) {
        try {
            // Validate UUID
            if (!this.isValidUUID(id)) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'ID lớp học không hợp lệ'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Check class exists
            const existingClass = await this.prisma.class.findUnique({
                where: { id },
                include: {
                    enrollments: {
                        where: { status: 'active' }
                    }
                }
            });

            if (!existingClass) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Không tìm thấy lớp học'
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            // Check if there are active enrollments
            if (existingClass.enrollments.length > 0) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Không thể xóa lớp học có học sinh đang học'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Soft delete by updating status
            await this.prisma.class.update({
                where: { id },
                data: { status: 'deleted' }
            });

            return {
                success: true,
                message: 'Xóa lớp học thành công'
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi xóa lớp học',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Phân công giáo viên cho lớp
    async assignTeacher(classId: string, body: any) {
        try {
            // Validation
            if (!body.teacherId || !body.semester || !body.academicYear || !body.startDate) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Thiếu thông tin bắt buộc: teacherId, semester, academicYear, startDate'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Check class exists
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

            // Check teacher exists
            const teacher = await this.prisma.teacher.findUnique({
                where: { id: body.teacherId }
            });

            if (!teacher) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Không tìm thấy giáo viên'
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            // Check if assignment already exists
            const existingAssignment = await this.prisma.teacherClassAssignment.findFirst({
                where: {
                    classId,
                    teacherId: body.teacherId,
                    semester: body.semester,
                    academicYear: body.academicYear
                }
            });

            if (existingAssignment) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Giáo viên đã được phân công cho lớp này trong kỳ học này'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            const assignment = await this.prisma.teacherClassAssignment.create({
                data: {
                    classId,
                    teacherId: body.teacherId,
                    semester: body.semester,
                    academicYear: body.academicYear,
                    startDate: new Date(body.startDate),
                    endDate: body.endDate ? new Date(body.endDate) : null,
                    recurringSchedule: body.recurringSchedule || null,
                    maxStudents: body.maxStudents || classItem.maxStudents,
                    status: body.status || 'active',
                    notes: body.notes || null
                },
                include: {
                    teacher: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                    email: true
                                }
                            }
                        }
                    }
                }
            });

            return {
                success: true,
                message: 'Phân công giáo viên thành công',
                data: assignment
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi phân công giáo viên',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Xóa phân công giáo viên
    async removeTeacher(classId: string, teacherId: string) {
        try {
            // Find active assignment
            const assignment = await this.prisma.teacherClassAssignment.findFirst({
                where: {
                    classId,
                    teacherId,
                    status: 'active'
                }
            });

            if (!assignment) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Không tìm thấy phân công giáo viên'
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            // Update status instead of delete
            await this.prisma.teacherClassAssignment.update({
                where: { id: assignment.id },
                data: { status: 'inactive' }
            });

            return {
                success: true,
                message: 'Xóa phân công giáo viên thành công'
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi xóa phân công giáo viên',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Lấy danh sách giáo viên của lớp
    async getTeachersByClass(classId: string) {
        try {
            const assignments = await this.prisma.teacherClassAssignment.findMany({
                where: { classId },
                include: {
                    teacher: {
                        include: {
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
                orderBy: { createdAt: 'desc' }
            });

            return {
                success: true,
                message: 'Lấy danh sách giáo viên thành công',
                data: assignments.map(a => ({
                    assignmentId: a.id,
                    teacherId: a.teacherId,
                    ...a.teacher.user,
                    semester: a.semester,
                    academicYear: a.academicYear,
                    startDate: a.startDate,
                    endDate: a.endDate,
                    status: a.status,
                    recurringSchedule: a.recurringSchedule
                }))
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi lấy danh sách giáo viên',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Lấy thống kê lớp học
    async getStats(classId: string) {
        try {
            const classItem = await this.prisma.class.findUnique({
                where: { id: classId },
                include: {
                    enrollments: {
                        select: {
                            status: true
                        }
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

            const totalStudents = classItem.enrollments.length;
            const activeStudents = classItem.enrollments.filter(e => e.status === 'active').length;
            const completedStudents = classItem.enrollments.filter(e => e.status === 'completed').length;
            const withdrawnStudents = classItem.enrollments.filter(e => e.status === 'withdrawn').length;

            return {
                success: true,
                message: 'Lấy thống kê thành công',
                data: {
                    totalStudents,
                    activeStudents,
                    completedStudents,
                    withdrawnStudents,
                    maxStudents: classItem.maxStudents,
                    availableSlots: classItem.maxStudents ? classItem.maxStudents - activeStudents : null
                }
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi lấy thống kê',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Legacy methods (keep for backward compatibility)
    async getClassByTeacherId(query: any, teacherId: string) {
        const { status, page, limit, search } = query?.params;
        const assignments = await this.prisma.teacherClassAssignment.findMany({
            where: { teacherId: teacherId },
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit),
            include: { 
                class: {
                    include: { 
                        room: true,
                        subject: true,
                        _count: {
                            select: {
                                enrollments: true
                            }
                        }
                    }
                }
            }
        });

        // Transform the data to match frontend expectations
        const classes = assignments.map(assignment => ({
            id: assignment.class.id,
            name: assignment.class.name,
            subject: assignment.class.subject.name,
            students: assignment.class._count.enrollments,
            schedule: assignment.recurringSchedule ? 
                (typeof assignment.recurringSchedule === 'string' ? 
                    JSON.parse(assignment.recurringSchedule) : 
                    assignment.recurringSchedule) : null,
            status: assignment.class.status,
            startDate: assignment.startDate?.toISOString().split('T')[0] || '',
            endDate: assignment.endDate?.toISOString().split('T')[0] || '',
            room: assignment.class.room?.name || 'Chưa xác định',
            description: assignment.class.description || '',
            teacherId: assignment.teacherId
        }));

        return {
            data: classes,
            meta: { total: classes.length,
                page: parseInt(query.page) || 1,
                limit: parseInt(query.limit) || 10,
                totalPages: Math.ceil(classes.length / (parseInt(query.limit) || 10))
            },
            message: 'Lấy danh sách lớp học thành công '
        };
    }

    
    async getClassDetail(id: string) {
        const assignment = await this.prisma.teacherClassAssignment.findFirst({
            where: { classId: id },
            include: {
                class: {
                    include: {
                        room: true,
                        subject: true,
                        _count: {
                            select: {
                                enrollments: true
                            }
                        }
                    }
                }
            }
        });

        if (!assignment) {
            return null;
        }

        return {
            id: assignment.class.id,
            name: assignment.class.name,
            subject: assignment.class.subject.name,
            students: assignment.class._count.enrollments,
            schedule: assignment.recurringSchedule ? 
                (typeof assignment.recurringSchedule === 'string' ? 
                    JSON.parse(assignment.recurringSchedule) : 
                    assignment.recurringSchedule) : null,
            status: assignment.class.status,
            startDate: assignment.startDate?.toISOString().split('T')[0] || '',
            endDate: assignment.endDate?.toISOString().split('T')[0] || '',
            room: assignment.class.room?.name || 'Chưa xác định',
            description: assignment.class.description || '',
            teacherId: assignment.teacherId
        };
    }
    
    async createClass(body: any) {
        return this.prisma.class.create({ data: body });
    }

    // Helper method
    private isValidUUID(uuid: string): boolean {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
}
