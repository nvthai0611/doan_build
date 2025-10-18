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
                gradeId, 
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
            
            // Filter by gradeId instead of grade string
            if (gradeId) {
                where.gradeId = gradeId;
            }
            
            if (subjectId) where.subjectId = subjectId;
            if (roomId) where.roomId = roomId;
            if (academicYear) where.academicYear = academicYear;
            
            // Enhanced search - search in name, description, subject name, teacher name
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { 
                        subject: {
                            name: { contains: search, mode: 'insensitive' }
                        }
                    },
                    {
                        teacher: {
                            user: {
                                fullName: { contains: search, mode: 'insensitive' }
                            }
                        }
                    },
                    {
                        room: {
                            name: { contains: search, mode: 'insensitive' }
                        }
                    },
                    {
                        grade: {
                            name: { contains: search, mode: 'insensitive' }
                        }
                    }
                ];
            }

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
                    grade: true,
                    feeStructure: true,
                    teacher: {
                        select: {
                            id: true,
                            userId: true,
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
                gradeId: cls.gradeId,
                gradeName: cls.grade?.name || '',
                gradeLevel: cls.grade?.level || null,
                status: cls.status,
                maxStudents: cls.maxStudents,
                currentStudents: cls._count.enrollments,
                roomId: cls.roomId,
                roomName: cls.room?.name || 'Chưa xác định',
                description: cls.description,
                feeStructureId: cls.feeStructureId,
                feeStructureName: cls.feeStructure?.name || '',
                feeAmount: cls.feeStructure?.amount || null,
                actualStartDate: cls.actualStartDate,
                actualEndDate: cls.actualEndDate,
                recurringSchedule: cls.recurringSchedule,
                academicYear: cls.academicYear,
                expectedStartDate: cls.expectedStartDate,
                teacher: cls.teacher ? {
                    id: cls.teacher.id,
                    userId: cls.teacher.userId,
                    name: cls.teacher.user.fullName,
                    email: cls.teacher.user.email,
                    phone: cls.teacher.user.phone,
                    avatar: cls.teacher.user.avatar
                } : null,
                createdAt: cls.createdAt,
                updatedAt: cls.updatedAt
            }));

            if (dayOfWeek && dayOfWeek !== 'all') {
                transformedClasses = transformedClasses.filter(cls => {
                    if (!cls.recurringSchedule || !(cls.recurringSchedule as any)?.schedules) return false;
                    return (cls.recurringSchedule as any).schedules.some((schedule: any) => schedule.day === dayOfWeek);
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
                        if (!cls.recurringSchedule || !(cls.recurringSchedule as any)?.schedules) return false;
                        return (cls.recurringSchedule as any).schedules.some((schedule: any) => {
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

            const classItem = await this.prisma.class.findUnique({
                where: { id },
                include: {
                    subject: true,
                    room: true,
                    grade: true,
                    feeStructure: true,
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
                    gradeName: classItem.grade?.name,
                    gradeLevel: classItem.grade?.level,
                    feeStructureName: classItem.feeStructure?.name,
                    feeAmount: classItem.feeStructure?.amount,
                    currentStudents: classItem._count.enrollments,
                    teacher: classItem.teacher ? {
                        ...classItem.teacher.user,
                        teacherId: classItem.teacher.id,
                        userId: classItem.teacher.userId
                    } : null,
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
            
            // Check grade exists if provided
            if (createClassDto.gradeId) {
                const grade = await this.prisma.grade.findUnique({
                    where: { id: createClassDto.gradeId }
                });

                if (!grade) {
                    throw new HttpException(
                        {
                            success: false,
                            message: 'Khối lớp không tồn tại'
                        },
                        HttpStatus.NOT_FOUND
                    );
                }
            }
            
            // Check fee structure exists if provided
            if (createClassDto.feeStructureId) {
                const feeStructure = await this.prisma.feeStructure.findUnique({
                    where: { id: createClassDto.feeStructureId }
                });

                if (!feeStructure) {
                    throw new HttpException(
                        {
                            success: false,
                            message: 'Cấu trúc phí không tồn tại'
                        },
                        HttpStatus.NOT_FOUND
                    );
                }
            }
            
            // Check teacher exists if provided
            if (createClassDto.teacherId) {
                const teacher = await this.prisma.teacher.findUnique({
                    where: { id: createClassDto.teacherId }
                });

                if (!teacher) {
                    throw new HttpException(
                        {
                            success: false,
                            message: 'Giáo viên không tồn tại'
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
                    gradeId: createClassDto.gradeId || null,
                    maxStudents: createClassDto.maxStudents || null,
                    roomId: createClassDto.roomId || null,
                    teacherId: createClassDto.teacherId || null,
                    feeStructureId: createClassDto.feeStructureId || null,
                    description: createClassDto.description || null,
                    status: createClassDto.status || 'draft',
                    recurringSchedule: createClassDto.recurringSchedule || null,
                    academicYear: createClassDto.academicYear || currentAcademicYear,
                    expectedStartDate: createClassDto.expectedStartDate ? new Date(createClassDto.expectedStartDate) : null,
                    actualStartDate: createClassDto.actualStartDate ? new Date(createClassDto.actualStartDate) : null,
                    actualEndDate: createClassDto.actualEndDate ? new Date(createClassDto.actualEndDate) : null
                },
                include: {
                    subject: true,
                    room: true,
                    grade: true,
                    feeStructure: true,
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

            // Check grade exists if provided
            if (updateClassDto.gradeId) {
                const grade = await this.prisma.grade.findUnique({
                    where: { id: updateClassDto.gradeId }
                });

                if (!grade) {
                    throw new HttpException(
                        {
                            success: false,
                            message: 'Khối lớp không tồn tại'
                        },
                        HttpStatus.NOT_FOUND
                    );
                }
            }

            // Check fee structure exists if provided
            if (updateClassDto.feeStructureId) {
                const feeStructure = await this.prisma.feeStructure.findUnique({
                    where: { id: updateClassDto.feeStructureId }
                });

                if (!feeStructure) {
                    throw new HttpException(
                        {
                            success: false,
                            message: 'Cấu trúc phí không tồn tại'
                        },
                        HttpStatus.NOT_FOUND
                    );
                }
            }

            // Check teacher exists if provided
            if (updateClassDto.teacherId) {
                const teacher = await this.prisma.teacher.findUnique({
                    where: { id: updateClassDto.teacherId }
                });

                if (!teacher) {
                    throw new HttpException(
                        {
                            success: false,
                            message: 'Giáo viên không tồn tại'
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
                    ...(updateClassDto.gradeId !== undefined && { gradeId: updateClassDto.gradeId }),
                    ...(updateClassDto.maxStudents !== undefined && { maxStudents: updateClassDto.maxStudents }),
                    ...(updateClassDto.roomId !== undefined && { roomId: updateClassDto.roomId }),
                    ...(updateClassDto.teacherId !== undefined && { teacherId: updateClassDto.teacherId }),
                    ...(updateClassDto.feeStructureId !== undefined && { feeStructureId: updateClassDto.feeStructureId }),
                    ...(updateClassDto.description !== undefined && { description: updateClassDto.description }),
                    ...(updateClassDto.status && { status: updateClassDto.status }),
                    ...(updateClassDto.recurringSchedule !== undefined && { recurringSchedule: updateClassDto.recurringSchedule }),
                    ...(updateClassDto.academicYear !== undefined && { academicYear: updateClassDto.academicYear }),
                    ...(updateClassDto.expectedStartDate !== undefined && { expectedStartDate: updateClassDto.expectedStartDate ? new Date(updateClassDto.expectedStartDate) : null }),
                    ...(updateClassDto.actualEndDate !== undefined && { actualEndDate: updateClassDto.actualEndDate ? new Date(updateClassDto.actualEndDate) : null }),
                    ...(updateClassDto.actualStartDate !== undefined && { actualStartDate: updateClassDto.actualStartDate ? new Date(updateClassDto.actualStartDate) : null })
                },
                include: {
                    subject: true,
                    room: true,
                    grade: true,
                    feeStructure: true,
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
                    teacher: {
                        include: {
                            user: {
                                select: {
                                    fullName: true
                                }
                            }
                        }
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
                                teacher: {
                                    select: {
                                        user: {
                                            select: {
                                                fullName: true
                                            }
                                        }
                                    }
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
                teacher: session.class.teacher?.user?.fullName || null,
                teacherName: session.class.teacher?.user?.fullName || null,
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
                    grade: true,
                    feeStructure: true,
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
            });
            
            // Update teacher assignment if teacherId is provided
            if (body.teacherId) {
                // Check if teacher exists
                const teacher = await this.prisma.teacher.findUnique({
                    where: { id: body.teacherId }
                });

                if (!teacher) {
                    throw new HttpException(
                        {
                            success: false,
                            message: 'Giáo viên không tồn tại'
                        },
                        HttpStatus.NOT_FOUND
                    );
                }

                // Update class with new teacher
                await this.prisma.class.update({
                    where: { id },
                    data: {
                        teacherId: body.teacherId
                    }
                });
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
            if (!body.teacherId) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Thiếu thông tin bắt buộc: teacherId'
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

            // Check if teacher is already assigned to this class
            if (classItem.teacherId === body.teacherId) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Giáo viên đã được phân công cho lớp này'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Update class with new teacher
            const updatedClass = await this.prisma.class.update({
                where: { id: classId },
                data: {
                    teacherId: body.teacherId
                },
                include: {
                    teacher: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                    email: true,
                                    phone: true,
                                    avatar: true
                                }
                            }
                        }
                    }
                }
            });

            return {
                success: true,
                message: 'Phân công giáo viên thành công',
                data: updatedClass
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

            // Check if teacher is assigned to this class
            if (classItem.teacherId !== teacherId) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Giáo viên không được phân công cho lớp này'
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            // Remove teacher assignment by setting teacherId to null
            await this.prisma.class.update({
                where: { id: classId },
                data: { teacherId: null }
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
            const classItem = await this.prisma.class.findUnique({
                where: { id: classId },
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

            const teachers = classItem.teacher ? [{
                teacherId: classItem.teacher.id,
                userId: classItem.teacher.userId,
                ...classItem.teacher.user
            }] : [];

            return {
                success: true,
                message: 'Lấy danh sách giáo viên thành công',
                data: teachers
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            
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
        
        const where: any = {
            teacherId: teacherId,
            status: { not: 'deleted' }
        };

        if (status && status !== 'all') {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const classes = await this.prisma.class.findMany({
            where,
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit),
            include: { 
                room: true,
                subject: true,
                grade: true,
                feeStructure: true,
                _count: {
                    select: {
                        enrollments: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Transform the data to match frontend expectations
        const transformedClasses = classes.map(cls => ({
            id: cls.id,
            name: cls.name,
            subject: cls.subject?.name || '',
            students: cls._count.enrollments,
            schedule: cls.recurringSchedule,
            status: cls.status,
            startDate: cls.actualStartDate?.toISOString().split('T')[0] || cls.expectedStartDate?.toISOString().split('T')[0] || '',
            endDate: cls.actualEndDate?.toISOString().split('T')[0] || '',
            room: cls.room?.name || 'Chưa xác định',
            description: cls.description || '',
            teacherId: cls.teacherId,
            gradeName: cls.grade?.name || '',
            feeStructureName: cls.feeStructure?.name || ''
        }));

        return {
            data: transformedClasses,
            meta: { 
                total: transformedClasses.length,
                page: parseInt(query.page) || 1,
                limit: parseInt(query.limit) || 10,
                totalPages: Math.ceil(transformedClasses.length / (parseInt(query.limit) || 10))
            },
            message: 'Lấy danh sách lớp học thành công '
        };
    }

    
    async getClassDetail(id: string) {
        const classItem = await this.prisma.class.findUnique({
            where: { id },
            include: {
                room: true,
                subject: true,
                grade: true,
                feeStructure: true,
                teacher: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                email: true,
                                phone: true,
                                avatar: true
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

        if (!classItem) {
            return null;
        }

        return {
            id: classItem.id,
            name: classItem.name,
            subject: classItem.subject?.name || '',
            students: classItem._count.enrollments,
            schedule: classItem.recurringSchedule,
            status: classItem.status,
            startDate: classItem.actualStartDate?.toISOString().split('T')[0] || classItem.expectedStartDate?.toISOString().split('T')[0] || '',
            endDate: classItem.actualEndDate?.toISOString().split('T')[0] || '',
            room: classItem.room?.name || 'Chưa xác định',
            description: classItem.description || '',
            teacherId: classItem.teacherId,
            teacherName: classItem.teacher?.user?.fullName || '',
            gradeName: classItem.grade?.name || '',
            feeStructureName: classItem.feeStructure?.name || ''
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
