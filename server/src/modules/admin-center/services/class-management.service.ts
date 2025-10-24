import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { CreateClassDto } from '../dto/class/create-class.dto';
import { UpdateClassDto } from '../dto/class/update-class.dto';
import { QueryClassDto } from '../dto/class/query-class.dto';
import { EmailQueueService } from '../../shared/services/email-queue.service';
import { EmailNotificationService } from '../../shared/services/email-notification.service';
import { generateQNCode } from '../../../utils/function.util';
import { DEFAULT_STATUS, ClassStatus } from '../../../common/constants';
import { DataTransformer } from '../../../../core/transformer';
import { log } from 'console';

@Injectable()
export class ClassManagementService {
    constructor(
        private prisma: PrismaService,
        private emailQueueService: EmailQueueService,
        private emailNotificationService: EmailNotificationService
    ) {}

    // Helper function để tìm và gợi ý tên khóa mới
    private async suggestNextClassName(name: string, academicYear: string): Promise<string> {
        // Pattern để tìm số khóa: "Toán 6 K1", "Văn 7 K2", etc.
        const khPattern = /^(.+?)\s*K(\d+)$/i;
        const match = name.match(khPattern);
        
        let baseName: string;
        let currentNumber = 0;
        
        if (match) {
            // Nếu tên đã có format "Tên K{số}"
            baseName = match[1].trim();
            currentNumber = parseInt(match[2]);
        } else {
            // Nếu tên không có format K{số}, lấy toàn bộ làm base
            baseName = name.trim();
        }
        
        // Tìm tất cả các lớp có tên tương tự trong cùng năm học
        const similarClasses = await this.prisma.class.findMany({
            where: {
                name: {
                    startsWith: baseName,
                    mode: 'insensitive'
                },
                academicYear: academicYear,
                status: { not: 'deleted' }
            },
            select: {
                name: true
            }
        });
        
        // Tìm số khóa cao nhất
        let maxNumber = currentNumber;
        
        for (const cls of similarClasses) {
            const clsMatch = cls.name.match(khPattern);
            if (clsMatch && clsMatch[1].trim().toLowerCase() === baseName.toLowerCase()) {
                const num = parseInt(clsMatch[2]);
                if (num > maxNumber) {
                    maxNumber = num;
                }
            } else if (cls.name.trim().toLowerCase() === baseName.toLowerCase()) {
                // Nếu có lớp chính xác trùng tên không có số
                maxNumber = Math.max(maxNumber, 1);
            }
        }
        
        // Gợi ý tên mới
        return `${baseName} K${maxNumber + 1}`;
    }

    // Helper function để kiểm tra trùng tên
    private async checkDuplicateClassName(name: string, academicYear: string, excludeId?: string): Promise<{ isDuplicate: boolean; suggestedName?: string }> {
        const whereCondition: any = {
            name: {
                equals: name,
                mode: 'insensitive'
            },
            academicYear: academicYear,
            status: { not: 'deleted' }
        };
        
        // Nếu đang update, loại trừ chính nó
        if (excludeId) {
            whereCondition.id = { not: excludeId };
        }
        
        const existingClass = await this.prisma.class.findFirst({
            where: whereCondition
        });
        
        if (existingClass) {
            const suggestedName = await this.suggestNextClassName(name, academicYear);
            return {
                isDuplicate: true,
                suggestedName
            };
        }
        
        return { isDuplicate: false };
    }
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
            
            // Enhanced search - search in name, classCode, description, subject name, teacher name
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { classCode: { contains: search, mode: 'insensitive' } },
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
                code: cls.classCode,
                subjectId: cls.subjectId,
                subjectName: cls.subject?.name || '',
                gradeId: cls.gradeId,
                gradeName: cls.grade?.name || '',
                gradeLevel: cls.grade?.level || null,
                status: cls.status,
                maxStudents: cls.maxStudents,
                currentStudents: cls._count.enrollments,    
                roomId: cls.roomId,
                roomName: cls.room?.name || "-",
                description: cls.description,
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
                        where: { 
                            status: {
                                in: ['not_been_updated', 'studying']
                            }
                        },
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
                    currentStudents: classItem._count.enrollments,
                    teacher: classItem.teacher ? {
                        ...classItem.teacher.user,
                        teacherId: classItem.teacher.id,
                        userId: classItem.teacher.userId,
                        teacherCode: classItem.teacher.teacherCode
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

            // Determine current academic year nếu không có
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;
            const currentAcademicYear = currentMonth >= 5
                ? `${currentYear}-${currentYear + 1}` 
                : `${currentYear - 1}-${currentYear}`;
            
            const academicYear = createClassDto.academicYear || currentAcademicYear;
            
            // Check duplicate class name
            const duplicateCheck = await this.checkDuplicateClassName(
                createClassDto.name,
                academicYear
            );
            
            if (duplicateCheck.isDuplicate) {
                throw new HttpException(
                    {
                        success: false,
                        message: `Tên lớp "${createClassDto.name}" đã tồn tại. Gợi ý tên: "${duplicateCheck.suggestedName}"`,
                    },
                    HttpStatus.CONFLICT
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

            // Auto-determine status based on completeness
            // Generate unique class code
            let classCode: string;
            let isUnique = false;
            let attempts = 0;
            const maxAttempts = 10;
            
            while (!isUnique && attempts < maxAttempts) {
                classCode = generateQNCode('class');
                const existingClass = await this.prisma.class.findUnique({
                    where: { classCode }
                });
                
                if (!existingClass) {
                    isUnique = true;
                }
                attempts++; 
            }
            
            if (!isUnique) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Không thể tạo mã lớp học duy nhất sau nhiều lần thử'
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }

            const newClass = await this.prisma.class.create({
                data: {
                    name: createClassDto.name,
                    classCode: classCode,
                    subjectId: createClassDto.subjectId || null,
                    gradeId: createClassDto.gradeId || null,
                    maxStudents: createClassDto.maxStudents || null,
                    roomId: createClassDto.roomId || null,
                    teacherId: createClassDto.teacherId || null,
                    description: createClassDto.description || null,
                    status: DEFAULT_STATUS.CLASS, 
                    recurringSchedule: createClassDto.recurringSchedule || null,
                    academicYear: academicYear,
                    expectedStartDate: createClassDto.expectedStartDate ? new Date(createClassDto.expectedStartDate) : null,
                    actualStartDate: createClassDto.actualStartDate ? new Date(createClassDto.actualStartDate) : null,
                    actualEndDate: createClassDto.actualEndDate ? new Date(createClassDto.actualEndDate) : null
                },
                include: {
                    subject: true,
                    room: true,
                    grade: true,
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
                message: `Tạo lớp học thành công.`,
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

            // Check duplicate class name nếu đổi tên hoặc đổi năm học
            if (updateClassDto.name || updateClassDto.academicYear) {
                const newName = updateClassDto.name || existingClass.name;
                const newAcademicYear = updateClassDto.academicYear || existingClass.academicYear;
                
                // Chỉ check nếu tên hoặc năm học thay đổi
                if (newName !== existingClass.name || newAcademicYear !== existingClass.academicYear) {
                    const duplicateCheck = await this.checkDuplicateClassName(
                        newName,
                        newAcademicYear,
                        id // Loại trừ chính nó
                    );
                    
                    if (duplicateCheck.isDuplicate) {
                        throw new HttpException(
                            {
                                success: false,
                                message: `Tên lớp "${newName}" đã tồn tại trong năm học này. Gợi ý tên: "${duplicateCheck.suggestedName}"`,
                            },
                            HttpStatus.CONFLICT
                        );
                    }
                }
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
                generateForFullYear = true,
                overwrite = false
            } = body;
            
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
                throw new HttpException(
                    {
                        success: false,
                        message: 'Ngày bắt đầu phải trước ngày kết thúc'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }
            
            // Lấy thông tin lớp học với đầy đủ thông tin cần thiết
            const classInfo = await this.prisma.class.findUnique({
                where: { id: classId },
                include: {
                    teacher: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                    isActive: true
                                }
                            }
                        }
                    },
                    room: true,
                    subject: true,
                    enrollments: {
                        where: {
                            status: {
                                in: ['not_been_updated', 'studying']  // Các trạng thái "đang hoạt động"
                            }
                        },
                        include: {
                            student: {
                                include: {
                                    user: {
                                        select: {
                                            isActive: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            enrollments: {
                                where: {
                                    status: {
                                        in: ['not_been_updated', 'studying']  // Các trạng thái "đang hoạt động"
                                    }
                                }
                            }
                        }
                    }
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

            // Kiểm tra điều kiện bắt buộc để tạo buổi học
            const validationErrors = [];

            // 1. Kiểm tra lớp học có đầy đủ thông tin cơ bản
            if (!classInfo.name) {
                validationErrors.push('Lớp học chưa có tên');
            }
            if (!classInfo.subject) {
                validationErrors.push('Lớp học chưa được gán môn học');
            }
            if (!classInfo.room) {
                validationErrors.push('Lớp học chưa được gán phòng học');
            }
            if (!classInfo.recurringSchedule) {
                validationErrors.push('Lớp học chưa có lịch học định kỳ');
            }

            // 2. Kiểm tra giáo viên
            if (!classInfo.teacher) {
                validationErrors.push('Lớp học chưa được gán giáo viên');
            } else if (!classInfo.teacher.user.isActive) {
                validationErrors.push('Giáo viên được gán không còn hoạt động');
            }

            // 3. Kiểm tra số lượng học sinh đăng ký và được chấp nhận
            const activeEnrollments = classInfo._count.enrollments;
            if (activeEnrollments < 15) {
                validationErrors.push(`Lớp học cần ít nhất 15 học sinh đăng ký và được chấp nhận (hiện tại: ${activeEnrollments} học sinh)`);
            }

            // 4. Kiểm tra học sinh đăng ký có đang hoạt động
            const inactiveStudents = classInfo.enrollments.filter(
                enrollment => !enrollment.student.user.isActive
            );
            if (inactiveStudents.length > 0) {
                validationErrors.push(`${inactiveStudents.length} học sinh trong lớp không còn hoạt động`);
            }

            // 5. Kiểm tra trạng thái lớp học
            if (classInfo.status === 'active') {
                validationErrors.push(`Lớp học đang ở trạng thái '${classInfo.status}', cần chuyển sang trạng thái 'draft hoặc ready'`);
            }
            console.log(validationErrors);
            
            // Nếu có lỗi validation, throw exception
            if (validationErrors.length > 0) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Lớp học chưa đủ điều kiện để tạo buổi học',
                        errors: validationErrors,
                    },
                    HttpStatus.BAD_REQUEST
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
                teacherId: string | null;
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
            const now = new Date();
            now.setHours(0, 0, 0, 0); // Reset time to start of day for comparison

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

                    // Tính khoảng cách ngày giữa session và hiện tại
                    const sessionDate = new Date(d);
                    sessionDate.setHours(0, 0, 0, 0);
                    const diffInDays = Math.ceil((sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    
                    // Auto set status dựa trên khoảng cách
                    // < 3 ngày: happening (đang diễn ra)
                    // >= 3 ngày: has_not_happened (chưa diễn ra)
                    const sessionStatus = diffInDays < 3 ? 'happening' : 'has_not_happened';

                    sessions.push({
                        classId,
                        academicYear: classInfo.academicYear || new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1).toString(),
                        sessionDate: new Date(d),
                        startTime,
                        endTime,
                        roomId: classInfo.roomId,
                        teacherId: classInfo.teacherId,
                        status: sessionStatus,
                        notes: `Buổi ${displayIndex++} - ${classInfo.name}`,
                        createdAt: new Date(),
                    });
                }
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
                skipDuplicates: true,
            });

            // AUTO-UPDATE: Chuyển enrollment status từ not_been_updated → studying
            const updatedEnrollments = await this.prisma.enrollment.updateMany({
                where: {
                    classId: classId,
                    status: 'not_been_updated'
                },
                data: {
                    status: 'studying'
                }
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
                    sessions: filteredSessions,
                    validationPassed: true,
                    updatedEnrollments: updatedEnrollments.count,
                    classInfo: {
                        id: classInfo.id,
                        name: classInfo.name,
                        teacher: classInfo.teacher?.user.fullName,
                        room: classInfo.room?.name,
                        subject: classInfo.subject?.name,
                        activeEnrollments: activeEnrollments,
                        status: classInfo.status
                    }
                },
                message: `Tạo thành công ${createdSessions.count} buổi học cho lớp ${classInfo.name}. ${updatedEnrollments.count} học sinh đã chuyển sang trạng thái "Đang học".`
            };

        } catch (error) {
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
            const [sessions, total, studentCount] = await Promise.all([
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
                this.prisma.classSession.count({ where }),
                this.prisma.enrollment.count({ where: { classId: classId, status: { notIn: ['stopped'] } } })
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
                studentCount: studentCount || 0,
                attendanceCount: session._count.attendances || 0,
                absentCount: 0, // Will be calculated based on attendance
                notAttendedCount: (studentCount || 0) - (session._count.attendances || 0),
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
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi lấy danh sách buổi học'
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Xóa nhiều buổi học
    async deleteSessions(classId: string, sessionIds: string[]) {
        try {
            // Validate input
            if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Vui lòng chọn ít nhất 1 buổi học để xóa'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Validate class exists
            const classData = await this.prisma.class.findUnique({
                where: { id: classId },
                select: { 
                    id: true, 
                    name: true,
                    status: true 
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

            // Get sessions to delete
            const sessionsToDelete = await this.prisma.classSession.findMany({
                where: {
                    id: { in: sessionIds },
                    classId: classId
                },
                select: {
                    id: true,
                    status: true,
                    sessionDate: true,
                    notes: true,
                    _count: {
                        select: {
                            attendances: true
                        }
                    }
                }
            });

            if (sessionsToDelete.length === 0) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Không tìm thấy buổi học nào để xóa'
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            // Check if any session has already ended or has attendances
            const invalidSessions = sessionsToDelete.filter(
                session => session.status === 'end' || session._count.attendances > 0
            );

            if (invalidSessions.length > 0) {
                const invalidSessionNames = invalidSessions.map(s => s.notes || 'Không có tên').join(', ');
                throw new HttpException(
                    {
                        success: false,
                        message: `Không thể xóa ${invalidSessions.length} buổi học đã kết thúc hoặc đã có điểm danh: ${invalidSessionNames}`
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Delete sessions
            const deletedResult = await this.prisma.classSession.deleteMany({
                where: {
                    id: { in: sessionIds },
                    classId: classId
                }
            });

            return {
                success: true,
                data: {
                    deletedCount: deletedResult.count,
                    requestedCount: sessionIds.length,
                    classId: classId,
                    className: classData.name
                },
                message: `Đã xóa ${deletedResult.count} buổi học thành công`
            };

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi xóa buổi học'
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
            // Nếu lớp là draft, cho phép xóa hết lịch học (set null)
            // Nếu không phải draft, bắt buộc phải có lịch học
            const isDraft = classData.status === ClassStatus.DRAFT;
            const hasSchedules = body.schedules && Array.isArray(body.schedules) && body.schedules.length > 0;

            if (!hasSchedules && !isDraft) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Dữ liệu lịch học không hợp lệ. Lớp không phải draft phải có lịch học.'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Prepare update data
            let updateData: any = {};

            if (hasSchedules) {
                // Transform schedules to proper format
                const schedules = body.schedules.map((schedule: any) => ({
                    day: schedule.day,
                    startTime: schedule.startTime,
                    endTime: schedule.endTime
                }));

                updateData.recurringSchedule = {
                    schedules: schedules
                };
            } else if (isDraft) {
                // Nếu là draft và không có schedules, set null
                updateData.recurringSchedule = null;
            }

            // Update class-level schedule
            const updatedClass = await this.prisma.class.update({
                where: { id },
                data: updateData,
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

            // Tạo message phù hợp
            let message = 'Cập nhật lịch học thành công';
            if (!hasSchedules && isDraft) {
                message = 'Đã xóa lịch học. Lớp cần có lịch học trước khi chuyển sang trạng thái sẵn sàng (ready)';
            } else if (hasSchedules) {
                message = 'Cập nhật lịch học thành công';
            }

            return {
                success: true,
                message,
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
                        where: { 
                            status: {
                                in: ['not_been_updated', 'studying']
                            }
                        }
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

    // Clone lớp học
    async cloneClass(id: string, cloneData: any) {
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

            // Get source class with all relations
            const sourceClass = await this.prisma.class.findUnique({
                where: { id },
                include: {
                    subject: true,
                    grade: true,
                    room: true,
                    teacher: {
                        include: {
                            user: true
                        }
                    }
                }
            });

            // Get enrollments separately if needed
            const enrollments = cloneData.cloneStudents 
                ? await this.prisma.enrollment.findMany({
                    where: {
                        classId: id,
                        status: {
                            in: ['active', 'studying']
                        }
                    },
                    include: {
                        student: true
                    }
                })
                : [];

            // // Get lessons separately if needed
            // const lessons = cloneData.cloneCurriculum
            //     ? await this.prisma.classLesson.findMany({
            //         where: { classId: id },
            //         include: {
            //             materials: true
            //         }
            //     })
            //     : [];

            if (!sourceClass) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Không tìm thấy lớp học gốc'
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            // Check duplicate name
            const duplicateCheck = await this.checkDuplicateClassName(
                cloneData.name,
                sourceClass.academicYear
            );

            if (duplicateCheck.isDuplicate) {
                throw new HttpException(
                    {
                        success: false,
                        message: `Tên lớp "${cloneData.name}" đã tồn tại trong năm học ${sourceClass.academicYear}`,
                        suggestedName: duplicateCheck.suggestedName
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // Generate new code
            const newCode = generateQNCode('class');

            // Prepare new class data
            const newClassData: any = {
                classCode: newCode,
                name: cloneData.name,
                subjectId: sourceClass.subjectId,
                gradeId: sourceClass.gradeId,
                academicYear: sourceClass.academicYear,
                maxStudents: sourceClass.maxStudents,
                description: sourceClass.description,
                status: 'draft', // Always create as draft
                recurringSchedule: cloneData.cloneSchedule ? sourceClass.recurringSchedule : null,
                roomId: cloneData.cloneRoom ? sourceClass.roomId : null,
                teacherId: cloneData.cloneTeacher ? sourceClass.teacherId : null,
            };

            // Create new class
            const newClass = await this.prisma.class.create({
                data: newClassData,
                include: {
                    subject: true,
                    grade: true,
                    room: true,
                    teacher: {
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
            });

            // Clone curriculum (lessons & materials)
            // if (cloneData.cloneCurriculum && lessons && lessons.length > 0) {
            //     for (const lesson of lessons) {
            //         const newLesson = await this.prisma.classLesson.create({
            //             data: {
            //                 title: lesson.title,
            //                 description: lesson.description,
            //                 lessonNumber: lesson.lessonNumber,
            //                 duration: lesson.duration,
            //                 objectives: lesson.objectives,
            //                 content: lesson.content,
            //                 classId: newClass.id
            //             }
            //         });

            //         // Clone materials for each lesson
            //         if (lesson.materials && lesson.materials.length > 0) {
            //             const materialData = lesson.materials.map((material: any) => ({
            //                 title: material.title,
            //                 type: material.type,
            //                 url: material.url,
            //                 description: material.description,
            //                 lessonId: newLesson.id
            //             }));

            //             // await this.prisma.classMaterial.createMany({
            //             //     data: materialData
            //             // });
            //         }
            //     }
            // }

            // Clone students (enrollments)
            if (cloneData.cloneStudents && enrollments && enrollments.length > 0) {
                const enrollmentData = enrollments.map((enrollment: any) => ({
                    studentId: enrollment.studentId,
                    classId: newClass.id,
                    enrollmentDate: new Date(),
                    status: 'active'
                }));

                await this.prisma.enrollment.createMany({
                    data: enrollmentData
                });
            }

            // Build response
            const responseData = {
                ...newClass,
                gradeName: newClass.grade?.name,
                gradeLevel: newClass.grade?.level,
                subjectName: newClass.subject?.name,
                roomName: newClass.room?.name,
                teacher: newClass.teacher ? {
                    id: newClass.teacher.id,
                    name: newClass.teacher.user?.fullName,
                    email: newClass.teacher.user?.email,
                    phone: newClass.teacher.user?.phone,
                } : null
            };

            return {
                success: true,
                message: `Clone lớp học thành công! Lớp mới: ${newClass.name}`,
                data: responseData
            };

        } catch (error) {
            if (error instanceof HttpException) throw error;
            
            console.error('Error cloning class:', error);
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi clone lớp học',
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


            // Kiểm tra xem lớp đã có lịch học chưa
            // recurringSchedule có thể là: null, undefined, array rỗng [], hoặc object rỗng {}
            let hasSchedule = false;
            
            if (classItem.recurringSchedule !== null && classItem.recurringSchedule !== undefined) {
                if (Array.isArray(classItem.recurringSchedule)) {
                    hasSchedule = classItem.recurringSchedule.length > 0;
                } else if (typeof classItem.recurringSchedule === 'object') {
                    hasSchedule = Object.keys(classItem.recurringSchedule).length > 0;
                }
            }

            // Nếu chưa có lịch học thì không cho phép phán công giáo viên
            if (!hasSchedule) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Vui lòng cập nhật lịch học trước khi phân công giáo viên'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

        
            // Xác định status mới - nếu đã có lịch học và đang ở draft thì chuyển sang ready
            let newStatus = classItem.status;
            let successMessage = 'Phân công giáo viên thành công';

            if (classItem.status === ClassStatus.DRAFT) {
                newStatus = ClassStatus.READY;
                successMessage = 'Phân công giáo viên thành công. Lớp đã sẵn sàng khai giảng';
            }

            // Update class with new teacher and status
            const updatedClass = await this.prisma.class.update({
                where: { id: classId },
                data: {
                    teacherId: body.teacherId,
                    status: newStatus
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

            // Gửi email thông báo cho giáo viên qua queue
            try {
                await this.emailNotificationService.sendClassAssignTeacherEmail(classId, body.teacherId);
                console.log(`📧 Email phân công lớp đã được queue cho giáo viên ${body.teacherId} và lớp ${classId}`);
            } catch (emailError) {
                // Log lỗi email nhưng không làm fail toàn bộ operation
                console.error('Failed to queue email notification:', emailError);
            }

            return {
                success: true,
                message: successMessage,
                data: updatedClass,
                metadata: {
                    hasSchedule,
                    statusChanged: classItem.status !== newStatus,
                    oldStatus: classItem.status,
                    newStatus: newStatus
                }
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

            // Gửi email hủy lớp cho giáo viên trước khi xóa
            try {
                await this.emailNotificationService.sendClassRemoveTeacherEmail(
                    classId, 
                    teacherId,
                    'Lớp học đã được hủy phân công'
                );
                console.log(`📧 Email hủy phân công lớp đã được queue cho giáo viên ${teacherId}`);
            } catch (emailError) {
                console.error('Failed to queue cancellation email to teacher:', emailError);
            }

            // Remove teacher assignment and chuyển status về draft
            const updatedClass = await this.prisma.class.update({
                where: { id: classId },
                data: { 
                    teacherId: null,
                    status: ClassStatus.DRAFT
                }
            });

            return {
                success: true,
                message: 'Xóa phân công giáo viên thành công. Lớp đã chuyển về trạng thái nháp',
                data: updatedClass,
                metadata: {
                    statusChanged: classItem.status !== ClassStatus.DRAFT,
                    oldStatus: classItem.status,
                    newStatus: ClassStatus.DRAFT
                }
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
            const activeStudents = classItem.enrollments.filter(e => 
                e.status === 'not_been_updated' || e.status === 'studying'
            ).length;
            const completedStudents = classItem.enrollments.filter(e => e.status === 'graduated').length;
            const withdrawnStudents = classItem.enrollments.filter(e => e.status === 'stopped').length;

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

    // Lấy dashboard data đầy đủ
    async getDashboard(classId: string) {
        try {
            // Validate class exists
            const classItem = await this.prisma.class.findUnique({
                where: { id: classId },
                include: {
                    teacher: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    fullName: true
                                }
                            }
                        }
                    },
                    enrollments: {
                        where: {
                            status: {
                                in: ['not_been_updated', 'studying', 'graduated']
                            }
                        },
                        select: {
                            id: true,
                            status: true,
                            student: {
                                select: {
                                    id: true,
                                    user: {
                                        select: {
                                            fullName: true
                                        }
                                    }
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

            // 1. Số giáo viên
            const teachersCount = classItem.teacher ? 1 : 0;

            // 2. Số học sinh
            const studentsCount = classItem.enrollments.length;

            // 3. Số buổi học đã diễn ra
            const completedSessions = await this.prisma.classSession.count({
                where: {
                    classId: classId,
                    status: 'end'
                }
            });

            // 4. Doanh thu từ học phí đã thanh toán
            const revenue = await this.prisma.payment.aggregate({
                where: {
                    status: 'completed',
                    feeRecord: {
                        student: {
                            enrollments: {
                                some: {
                                    classId: classId
                                }
                            }
                        }
                    }
                },
                _sum: {
                    amount: true
                }
            });

            // 5. Thống kê điểm danh
            const attendanceStats = await this.prisma.studentSessionAttendance.groupBy({
                by: ['status'],
                where: {
                    session: {
                        classId: classId
                    }
                },
                _count: {
                    status: true
                }
            });

            const attendance = {
                onTime: attendanceStats.find(a => a.status === 'present')?._count.status || 0,
                late: 0, // Schema không có late status, để mặc định 0
                excusedAbsence: attendanceStats.find(a => a.status === 'excused')?._count.status || 0,
                unexcusedAbsence: attendanceStats.find(a => a.status === 'absent')?._count.status || 0,
                notMarked: 0 // Sẽ tính sau
            };

            // Tính số chưa điểm danh
            const totalPossibleAttendances = completedSessions * studentsCount;
            const totalMarkedAttendances = attendance.onTime + attendance.late + attendance.excusedAbsence + attendance.unexcusedAbsence;
            attendance.notMarked = totalPossibleAttendances - totalMarkedAttendances;

            // 6. Đánh giá trung bình (chưa có trong schema, để mặc định)
            const rating = 0;
            const reviews = 0;

            return {
                success: true,
                message: 'Lấy dashboard thành công',
                data: {
                    teachers: teachersCount,
                    students: studentsCount,
                    lessons: completedSessions,
                    revenue: revenue._sum.amount || 0,
                    rating,
                    reviews,
                    attendance,
                    homework: {
                        assigned: 0,
                        submitted: 0,
                        notSubmitted: 0
                    }
                }
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi lấy dashboard',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Legacy methods (keep for backward compatibility)
    async getClassByTeacherId(query: any, teacherId: string) {
        const { status, page = 1, limit = 10, search } = query;
        
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

        // Count total before pagination
        const total = await this.prisma.class.count({ where });

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
            code: cls.classCode,
            name: cls.name,
            subject: cls.subject?.name || '',
            students: cls._count.enrollments,
            schedule: DataTransformer.formatScheduleArray(cls.recurringSchedule),
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
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
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
            code: classItem.classCode,
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
