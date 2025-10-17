import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { CreateClassDto } from '../dto/class/create-class.dto';
import { UpdateClassDto } from '../dto/class/update-class.dto';
import { QueryClassDto } from '../dto/class/query-class.dto';

@Injectable()
export class ClassManagementService {
    constructor(private prisma: PrismaService) {}
    // Lấy danh sách tất cả lớp học với filters và pagination
    async findAll(queryDto: QueryClassDto) {
        try {
            const { 
                status, 
                grade, 
                subjectId, 
                roomId,
                search,
                dayOfWeek,
                shift,
                academicYear,
                page = 1, 
                limit = 10,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = queryDto;
            const grades = (queryDto as any)?.grades;
            
            const skip = (page - 1) * limit;
            const take = limit;
            
            // Determine current academic year
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1; // 1-12
            
            // Academic year logic: 
            // - If current month is 9-12: current academic year is currentYear-currentYear+1
            // - If current month is 1-8: current academic year is currentYear-1-currentYear
            let currentAcademicYear: string;
            if (currentMonth >= 9) {
                currentAcademicYear = `${currentYear}-${currentYear + 1}`;
            } else {
                currentAcademicYear = `${currentYear - 1}-${currentYear}`;
            }
            
            const where: any = {
                status: { not: 'deleted' } // Exclude deleted classes
            };
            
            if (status && status !== 'all') where.status = status;
            // Support both `grades` and `grade` being arrays or strings
            if (grades && Array.isArray((grades as any))) {
                where.grade = { in: grades as any };
            } else if (typeof grades === 'string') {
                // support comma-separated string
                const arr = (grades as string).split(',').map(s => s.trim()).filter(Boolean);
                if (arr.length > 0) where.grade = { in: arr };
            } else if (Array.isArray((grade as any))) {
                where.grade = { in: grade as any };
            } else if (grade) {
                where.grade = grade;
            }
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
            const totalBeforeFilter = await this.prisma.class.count({ where });
            const orderBy: any = {};
            if (sortBy && sortOrder) {
                orderBy[sortBy] = sortOrder;
            } else {
                orderBy.createdAt = 'desc'; 
            }
            const classes = await this.prisma.class.findMany({
                where,
                skip,
                take,
                orderBy,
                include: {
                    subject: true,
                    room: true,
                    teacherClassAssignments: {
                        // where: {
                        //     status: 'active'
                        // },
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
                        orderBy: { createdAt: 'desc' }
                    },
                    _count: {
                        select: { enrollments: true }
                    }
                }
            });

            // Transform data
            let transformedClasses = classes.map(cls => ({
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
                actualStartDate: cls.actualStartDate,
                actualEndDate: cls.actualEndDate,
                // Use schedule from Classes table directly
                recurringSchedule: (cls as any).recurringSchedule,
                academicYear: (cls as any).academicYear,
                expectedStartDate: cls.expectedStartDate,
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

            if (dayOfWeek && dayOfWeek !== 'all') {
                transformedClasses = transformedClasses.filter(cls => {
                    if (!cls.recurringSchedule || !cls.recurringSchedule.schedules) return false;
                    return cls.recurringSchedule.schedules.some((schedule: any) => schedule.day === dayOfWeek);
                });
            }

            if (shift && shift !== 'all') {
                const timeRanges = {
                    morning: { start: '00:00', end: '11:59' },
                    afternoon: { start: '12:00', end: '16:59' },
                    evening: { start: '17:00', end: '23:59' }
                };
                
                const timeRange = timeRanges[shift];
                
                if (timeRange) {
                    transformedClasses = transformedClasses.filter(cls => {
                        if (!cls.recurringSchedule || !cls.recurringSchedule.schedules) return false;
                        return cls.recurringSchedule.schedules.some((schedule: any) => {
                            const startTime = schedule.startTime;
                            return startTime >= timeRange.start && startTime <= timeRange.end;
                        });
                    });
                }
            }
            const sortedClasses = transformedClasses.sort((a, b) => {
                const aIsCurrentYear = a.academicYear === currentAcademicYear;
                const bIsCurrentYear = b.academicYear === currentAcademicYear;
                if (aIsCurrentYear && !bIsCurrentYear) return -1;
                if (!aIsCurrentYear && bIsCurrentYear) return 1;
                return 0; 
            });
            return {
                success: true,
                message: 'Lấy danh sách lớp học thành công',
                data: sortedClasses,
                meta: {
                    total: totalBeforeFilter,
                    page: page,
                    limit: limit,
                    totalPages: Math.ceil(totalBeforeFilter / limit)
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
    async create(createClassDto: CreateClassDto) {
        try {
            // Validation
            if (!createClassDto.name) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Tên lớp là bắt buộc'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }
            // Check subject exists if provided
            if (createClassDto.subjectId) {
                const subject = await this.prisma.subject.findUnique({
                    where: { id: createClassDto.subjectId }
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
            if (createClassDto.roomId) {
                const room = await this.prisma.room.findUnique({
                    where: { id: createClassDto.roomId }
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
            // Determine current academic year
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;
            const currentAcademicYear = currentMonth >= 9 
                ? `${currentYear}-${currentYear + 1}` 
                : `${currentYear - 1}-${currentYear}`;

            const newClass = await this.prisma.class.create({
                data: {
                    name: createClassDto.name,
                    subjectId: createClassDto.subjectId || null,
                    grade: createClassDto.grade || null,
                    maxStudents: createClassDto.maxStudents || null,
                    roomId: createClassDto.roomId || null,
                    description: createClassDto.description || null,
                    status: createClassDto.status || 'draft',
                    recurringSchedule: createClassDto.recurringSchedule || null,
                    academicYear: createClassDto.academicYear || currentAcademicYear,
                    expectedStartDate: createClassDto.expectedStartDate ? new Date(createClassDto.expectedStartDate) : null,
                    actualStartDate: createClassDto.actualStartDate ? new Date(createClassDto.actualStartDate) : null,
                    actualEndDate: createClassDto.actualEndDate ? new Date(createClassDto.actualEndDate) : null
                } as any,
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
    async update(id: string, updateClassDto: UpdateClassDto) {
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
            if (updateClassDto.subjectId) {
                const subject = await this.prisma.subject.findUnique({
                    where: { id: updateClassDto.subjectId }
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
            if (updateClassDto.roomId) {
                const room = await this.prisma.room.findUnique({
                    where: { id: updateClassDto.roomId }
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
                    ...(updateClassDto.name && { name: updateClassDto.name }),
                    ...(updateClassDto.subjectId && { subjectId: updateClassDto.subjectId }),
                    ...(updateClassDto.grade !== undefined && { grade: updateClassDto.grade }),
                    ...(updateClassDto.maxStudents !== undefined && { maxStudents: updateClassDto.maxStudents }),
                    ...(updateClassDto.roomId !== undefined && { roomId: updateClassDto.roomId }),
                    ...(updateClassDto.description !== undefined && { description: updateClassDto.description }),
                    ...(updateClassDto.status && { status: updateClassDto.status }),
                    ...(updateClassDto.recurringSchedule !== undefined && { recurringSchedule: updateClassDto.recurringSchedule }),
                    ...(updateClassDto.academicYear !== undefined && { academicYear: updateClassDto.academicYear }),
                    ...(updateClassDto.expectedStartDate !== undefined && { expectedStartDate: updateClassDto.expectedStartDate ? new Date(updateClassDto.expectedStartDate) : null }),
                    ...(updateClassDto.actualEndDate !== undefined && { actualEndDate: updateClassDto.actualEndDate ? new Date(updateClassDto.actualEndDate) : null }),
                    ...(updateClassDto.actualStartDate !== undefined && { actualStartDate: updateClassDto.actualStartDate ? new Date(updateClassDto.actualStartDate) : null })
                } as any,
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

    // Tạo tự động buổi học cho lớp
    async generateSessions(classId: string, body: any) {
        try {
            const {
                startDate,
                endDate,
                sessionCount,
                generateForFullYear = true,
                overwrite = false
            } = body;

            console.log("body", body);
            
            // Validate UUID
            if (!this.isValidUUID(classId)) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'ID lớp học không hợp lệ'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            if (!startDate || !endDate) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Ngày bắt đầu và ngày kết thúc là bắt buộc'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }
            if (startDate >= endDate) {
                console.log("đã vào");
                
                throw new HttpException(
                    {
                        success: false,
                        message: 'Ngày bắt đầu phải trước ngày kết thúc'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }
            // Lấy thông tin lớp học (JSON recurringSchedule là thuộc tính trực tiếp của class)
            const classInfo = await this.prisma.class.findUnique({
                where: { id: classId },
                include: {
                    teacherClassAssignments: {
                        include: {
                            teacher: {
                                include: {
                                    user: {
                                        select: {
                                            fullName: true
                                        }
                                    }
                                }
                            }
                        },
                        take: 1
                    },
                    room: true,
                }
            });

            if (!classInfo) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Không tìm thấy lớp học'
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            // Xác định ngày bắt đầu và kết thúc
            let sessionStartDate: Date;
            let sessionEndDate: Date;

            if (generateForFullYear) {
                // Ưu tiên khoảng thời gian thực tế nếu có; nếu không, mặc định 9 tháng kể từ start
                sessionStartDate = classInfo.actualStartDate || classInfo.expectedStartDate || new Date();
                const nineMonthsLater = new Date(sessionStartDate);
                nineMonthsLater.setMonth(nineMonthsLater.getMonth() + 9);
                sessionEndDate = classInfo.actualEndDate || nineMonthsLater;
            } else {
                // Sử dụng ngày từ request body
                sessionStartDate = new Date(startDate);
                sessionEndDate = new Date(endDate);
            }
            // If overwrite requested, ensure class hasn't started, then delete existing sessions in range
            if (overwrite) {
                const classStart = classInfo.actualStartDate || classInfo.expectedStartDate;
                if (classStart && new Date() >= new Date(classStart)) {
                    throw new HttpException(
                        {
                            success: false,
                            message: 'Lớp đã bắt đầu học, không thể cập nhật lịch cũ'
                        },
                        HttpStatus.BAD_REQUEST
                    );
                }
                await this.prisma.classSession.deleteMany({
                    where: {
                        classId,
                        sessionDate: { gte: sessionStartDate, lte: sessionEndDate }
                    }
                });
            }

            // Validate dates
            if (sessionStartDate >= sessionEndDate) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Ngày bắt đầu phải trước ngày kết thúc'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Lấy lịch học định kỳ từ class
            const recurringSchedule = classInfo.recurringSchedule as any;
            const scheduleDays = Array.isArray(recurringSchedule?.schedules) ? recurringSchedule.schedules : [];

            if (scheduleDays.length === 0) {
                throw new HttpException(
                    { success: false, message: 'Lớp học chưa có lịch học định kỳ' },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Tạo danh sách buổi học theo lịch định kỳ: dựa vào thứ và khoảng ngày hiệu lực
            const sessions: Array<{
                classId: string;
                academicYear: string;
                sessionDate: Date;
                startTime: string;
                endTime: string;
                roomId: string | null;
                status: string;
                notes: string;
                createdAt: Date;
            }> = [];

            // Lấy số thứ tự tiếp theo từ notes (nếu muốn hiển thị)
            let displayIndex = 1;
            const lastByCreated = await this.prisma.classSession.findFirst({ where: { classId }, orderBy: { createdAt: 'desc' } });
            if (lastByCreated) {
                const parsed = parseInt(lastByCreated.notes?.match(/Buổi (\d+)/)?.[1] || '0');
                if (!isNaN(parsed) && parsed > 0) displayIndex = parsed + 1;
            }

            const overallStart = new Date(sessionStartDate);
            const overallEnd = new Date(sessionEndDate);

            for (let d = new Date(overallStart); d <= overallEnd; d.setDate(d.getDate() + 1)) {
                const dayOfWeek = d.getDay();
                const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];

                // Lấy tất cả schedule của ngày này (có thể nhiều ca)
                const daySchedules = scheduleDays.filter((s: any) => (s.day || '').toLowerCase() === dayName);
                if (daySchedules.length === 0) continue;
                
                for (const s of daySchedules) {
                    // Nếu schedule có phạm vi startDate/endDate riêng, kiểm tra trong phạm vi
                    const schedStart = s.startDate ? new Date(s.startDate) : overallStart;
                    const schedEnd = s.endDate ? new Date(s.endDate) : overallEnd;
                    if (d < schedStart || d > schedEnd) continue;

                    const startTime: string = s.startTime;
                    const endTime: string = s.endTime;
                    if (!startTime || !endTime) continue;

                    sessions.push({
                        classId,
                        academicYear: classInfo.academicYear || new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1).toString(),
                        sessionDate: new Date(d),
                        startTime,
                        endTime,
                        roomId: classInfo.roomId,
                        status: 'scheduled',
                        notes: `Buổi ${displayIndex++} - ${classInfo.name}`,
                        createdAt: new Date(),
                    });
                    if (sessionCount && sessions.length >= sessionCount) break;
                }
                if (sessionCount && sessions.length >= sessionCount) break;
            }

            // Kiểm tra xem có buổi học nào trùng lặp không
            const existingSessions = await this.prisma.classSession.findMany({
                where: {
                    classId,
                    sessionDate: {
                        gte: sessionStartDate,
                        lte: sessionEndDate
                    }
                }
            });

            // Lọc bỏ các buổi học trùng lặp
            const filteredSessions = sessions.filter(session => 
                !existingSessions.some(existing => 
                    existing.sessionDate.toDateString() === session.sessionDate.toDateString() &&
                    existing.startTime === session.startTime
                )
            );

            // Tạo buổi học trong database
            const createdSessions = await this.prisma.classSession.createMany({
                data: filteredSessions,
                skipDuplicates: true
            });

            // Cập nhật lại ngày thực tế của lớp học (nếu có start/end trong body)
            if (startDate && endDate) {
                await this.prisma.class.update({
                    where: { id: classId },
                    data: {
                        actualStartDate: new Date(startDate),
                        actualEndDate: new Date(endDate)
                    }
                });
            }

            return {
                success: true,
                data: {
                    createdCount: createdSessions.count,
                    totalSessions: sessions.length,
                    filteredCount: filteredSessions.length,
                    skippedCount: sessions.length - filteredSessions.length,
                    startDate: sessionStartDate,
                    endDate: sessionEndDate,
                    sessions: filteredSessions
                },
                message: `Tạo thành công ${createdSessions.count} buổi học`
            };

        } catch (error) {
            console.error('Error generating sessions:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi tạo buổi học'
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Lấy danh sách buổi học của lớp
    async getClassSessions(classId: string, query: any) {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                status,
                startDate,
                endDate,
                academicYear,
                sortBy = 'sessionDate',
                sortOrder = 'desc'
            } = query;

            const skip = (page - 1) * limit;
            const take = parseInt(limit);

            // Build where clause
            const where: any = {
                classId: classId
            };

            // Add academicYear filter - chỉ lấy sessions có cùng academicYear với lớp
            if (academicYear) {
                where.academicYear = academicYear;
            }

            // Add search filter
            if (search) {
                where.OR = [
                    { notes: { contains: search, mode: 'insensitive' } }
                ];
            }

            // Add status filter
            if (status && status !== 'all') {
                where.status = status;
            }

            // Add date range filter
            if (startDate || endDate) {
                where.sessionDate = {};
                if (startDate) {
                    where.sessionDate.gte = new Date(startDate);
                }
                if (endDate) {
                    where.sessionDate.lte = new Date(endDate);
                }
            }

            // Build orderBy clause
            const orderBy: any = {};
            if (sortBy === 'sessionDate') {
                orderBy.sessionDate = sortOrder;
            } else if (sortBy === 'startTime') {
                orderBy.startTime = sortOrder;
            } else if (sortBy === 'notes') {
                orderBy.notes = sortOrder;
            } else {
                orderBy.sessionDate = 'desc';
            }
            
            // Get sessions with pagination
            const [sessions, total] = await Promise.all([
                this.prisma.classSession.findMany({
                    where,
                    skip,
                    take,
                    orderBy,
                    include: {
                        class: {
                            select: {
                                name: true,
                                maxStudents: true,
                                teacherClassAssignments: {
                                    select: {
                                        teacher: {
                                            select: {
                                                user: {
                                                    select: {
                                                        fullName: true
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    take: 1
                                }
                            }
                        },
                        room: {
                            select: {
                                name: true
                            }
                        },
                        _count: {
                            select: {
                                attendances: true
                            }
                        }
                    }
                }),
                this.prisma.classSession.count({ where })
            ]);

            
            // Transform data to match frontend expectations
            const transformedSessions = sessions.map((session, index) => ({
                id: session.id,
                topic: session.notes || `Buổi ${index + 1}`,
                name: session.notes || `Buổi ${index + 1}`,
                scheduledDate: session.sessionDate.toISOString().split('T')[0],
                sessionDate: session.sessionDate.toISOString().split('T')[0],
                startTime: session.startTime,
                endTime: session.endTime,
                status: session.status,
                notes: session.notes,
                teacher: session.class.teacherClassAssignments[0]?.teacher?.user?.fullName || null,
                teacherName: session.class.teacherClassAssignments[0]?.teacher?.user?.fullName || null,
                totalStudents: session.class.maxStudents || 0,
                studentCount: session.class.maxStudents || 0,
                attendanceCount: session._count.attendances || 0,
                absentCount: 0, // Will be calculated based on attendance
                notAttendedCount: (session.class.maxStudents || 0) - (session._count.attendances || 0),
                rating: 0, // Default rating since not available in schema
                roomName: session.room?.name || null
            }));

            const totalPages = Math.ceil(total / take);

            return {
                success: true,
                data: transformedSessions,
                meta: {
                    total,
                    page: parseInt(page),
                    limit: take,
                    totalPages
                },
                message: 'Lấy danh sách buổi học thành công'
            };

        } catch (error) {
            console.error('Error getting class sessions:', error);
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi lấy danh sách buổi học'
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Xóa lớp học (soft delete bằng cách đổi status)
    async updateClassSchedules(id: string, body: any) {
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

            // Tìm lớp học và kiểm tra status
            const classData = await this.prisma.class.findUnique({
                where: { id },
                select: { 
                    id: true, 
                    status: true,
                    name: true
                }
            });

            if (!classData) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Không tìm thấy lớp học'
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            // Chỉ cho phép cập nhật khi lớp không ở trạng thái active
            if (classData.status === 'active') {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Không thể cập nhật lịch học cho lớp đang hoạt động. Vui lòng chuyển lớp sang trạng thái khác trước.'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Không cho phép cập nhật lịch nếu lớp đã có buổi học
            const existingSessions = await this.prisma.classSession.count({ where: { classId: id } });
            if (existingSessions > 0) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Lớp đã có buổi học, không thể cập nhật lịch học'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Validate schedule data
            if (!body.schedules || !Array.isArray(body.schedules) || body.schedules.length === 0) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Dữ liệu lịch học không hợp lệ'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Transform schedules to proper format
            const schedules = body.schedules.map((schedule: any) => ({
                day: schedule.day,
                startTime: schedule.startTime,
                endTime: schedule.endTime
            }));

            // Update class-level schedule
            const updatedClass = await this.prisma.class.update({
                where: { id },
                data: {
                    recurringSchedule: {
                        schedules: schedules
                    }
                },
                include: {
                    subject: true,
                    room: true,
                    teacherClassAssignments: {
                        include: {
                            teacher: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            fullName: true,
                                            email: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            
            // Update teacher assignment based on academicYear and teacherId from request
            if (body.academicYear && body.teacherId) {
                const teacherAssignment = await this.prisma.teacherClassAssignment.findFirst({
                    where: { 
                        classId: id,
                        teacherId: body.teacherId,
                        academicYear: body.academicYear
                    }
                });

                if (teacherAssignment) {
                    await this.prisma.teacherClassAssignment.update({
                        where: { id: teacherAssignment.id },
                        data: {
                            recurringSchedule: {
                                schedules: schedules
                            }
                        }
                    });
                }
            } else {
                // Fallback: Update only the current active teacher assignment for this class
                const currentTeacherAssignment = await this.prisma.teacherClassAssignment.findFirst({
                    where: { 
                        classId: id,
                        status: 'active' // Chỉ lấy assignment đang active
                    },
                    orderBy: { createdAt: 'desc' } // Lấy assignment mới nhất
                });

                if (currentTeacherAssignment) {
                    await this.prisma.teacherClassAssignment.update({
                        where: { id: currentTeacherAssignment.id },
                        data: {
                            recurringSchedule: {
                                schedules: schedules
                            }
                        }
                    });
                }
            }

            return {
                success: true,
                message: 'Cập nhật lịch học thành công',
                data: updatedClass
            };

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi cập nhật lịch học',
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
            if (existingClass.enrollments.length > 0 && existingClass.status === 'active' ) {
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
                data: { status: 'cancelled' }
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
                    // Copy dates from Class: actualStartDate/actualEndDate takes priority over expectedStartDate
                    startDate: new Date(body.startDate || classItem.actualStartDate || classItem.expectedStartDate),
                    endDate: body.endDate ? new Date(body.endDate) : (classItem.actualEndDate ? new Date(classItem.actualEndDate) : null),
                    // Copy schedule from Classes table to teacherClassAssignments
                    recurringSchedule: body.recurringSchedule || (classItem as any).recurringSchedule,
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
