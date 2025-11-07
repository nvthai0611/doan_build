"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
const email_queue_service_1 = require("../../shared/services/email-queue.service");
const email_notification_service_1 = require("../../shared/services/email-notification.service");
const function_util_1 = require("../../../utils/function.util");
const constants_1 = require("../../../common/constants");
const transformer_1 = require("../../../../core/transformer");
let ClassManagementService = class ClassManagementService {
    constructor(prisma, emailQueueService, emailNotificationService) {
        this.prisma = prisma;
        this.emailQueueService = emailQueueService;
        this.emailNotificationService = emailNotificationService;
    }
    async suggestNextClassName(name, academicYear) {
        const khPattern = /^(.+?)\s*K(\d+)$/i;
        const match = name.match(khPattern);
        let baseName;
        let currentNumber = 0;
        if (match) {
            baseName = match[1].trim();
            currentNumber = parseInt(match[2]);
        }
        else {
            baseName = name.trim();
        }
        const similarClasses = await this.prisma.class.findMany({
            where: {
                name: {
                    startsWith: baseName,
                    mode: 'insensitive',
                },
                academicYear: academicYear,
                status: { not: 'deleted' },
            },
            select: {
                name: true,
            },
        });
        let maxNumber = currentNumber;
        for (const cls of similarClasses) {
            const clsMatch = cls.name.match(khPattern);
            if (clsMatch &&
                clsMatch[1].trim().toLowerCase() === baseName.toLowerCase()) {
                const num = parseInt(clsMatch[2]);
                if (num > maxNumber) {
                    maxNumber = num;
                }
            }
            else if (cls.name.trim().toLowerCase() === baseName.toLowerCase()) {
                maxNumber = Math.max(maxNumber, 1);
            }
        }
        return `${baseName} K${maxNumber + 1}`;
    }
    async checkDuplicateClassName(name, academicYear, excludeId) {
        const whereCondition = {
            name: {
                equals: name,
                mode: 'insensitive',
            },
            academicYear: academicYear,
            status: { notIn: ['deleted', 'cancelled'] },
        };
        if (excludeId) {
            whereCondition.id = { not: excludeId };
        }
        const existingClass = await this.prisma.class.findFirst({
            where: whereCondition,
        });
        if (existingClass) {
            const suggestedName = await this.suggestNextClassName(name, academicYear);
            return {
                isDuplicate: true,
                suggestedName,
            };
        }
        return { isDuplicate: false };
    }
    async findAll(queryDto) {
        try {
            const { status, gradeId, subjectId, roomId, teacherId, search, dayOfWeek, shift, startDate, endDate, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', } = queryDto;
            const skip = (page - 1) * limit;
            const take = limit;
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;
            let currentAcademicYear;
            if (currentMonth >= 9) {
                currentAcademicYear = `${currentYear}-${currentYear + 1}`;
            }
            else {
                currentAcademicYear = `${currentYear - 1}-${currentYear}`;
            }
            const where = {
                status: { not: 'deleted' },
            };
            if (status && status !== 'all')
                where.status = status;
            if (gradeId) {
                const gradeValues = gradeId.split(',').map((id) => id.trim()).filter((id) => id);
                const isUUID = (value) => {
                    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                    return uuidRegex.test(value);
                };
                const allAreUUIDs = gradeValues.every((val) => isUUID(val));
                if (allAreUUIDs) {
                    if (gradeValues.length === 1) {
                        where.gradeId = gradeValues[0];
                    }
                    else if (gradeValues.length > 1) {
                        where.gradeId = { in: gradeValues };
                    }
                }
                else {
                    const gradeLevels = gradeValues.map((val) => parseInt(val)).filter((val) => !isNaN(val));
                    if (gradeLevels.length === 1) {
                        where.grade = { level: gradeLevels[0] };
                    }
                    else if (gradeLevels.length > 1) {
                        where.grade = { level: { in: gradeLevels } };
                    }
                }
            }
            const isValidUUID = (value) => {
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                return uuidRegex.test(value);
            };
            if (subjectId && subjectId !== 'all' && isValidUUID(subjectId)) {
                where.subjectId = subjectId;
            }
            if (roomId && roomId !== 'all' && isValidUUID(roomId)) {
                where.roomId = roomId;
            }
            if (teacherId && teacherId !== 'all' && isValidUUID(teacherId)) {
                where.teacherId = teacherId;
            }
            if (startDate || endDate) {
                where.AND = where.AND || [];
                if (startDate && endDate) {
                    const startDateObj = new Date(startDate + 'T00:00:00.000Z');
                    const endDateObj = new Date(endDate + 'T23:59:59.999Z');
                    where.AND.push({
                        AND: [
                            {
                                OR: [
                                    { actualStartDate: { lte: endDateObj } },
                                    { expectedStartDate: { lte: endDateObj } },
                                ],
                            },
                            {
                                OR: [
                                    { actualEndDate: { gte: startDateObj } },
                                    {
                                        AND: [
                                            { actualEndDate: null },
                                            {
                                                OR: [
                                                    { actualStartDate: { gte: startDateObj } },
                                                    { expectedStartDate: { gte: startDateObj } },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    });
                }
                else if (startDate) {
                    const startDateObj = new Date(startDate + 'T00:00:00.000Z');
                    where.AND.push({
                        OR: [
                            { actualStartDate: { gte: startDateObj } },
                            { expectedStartDate: { gte: startDateObj } },
                        ],
                    });
                }
                else if (endDate) {
                    const endDateObj = new Date(endDate + 'T23:59:59.999Z');
                    where.AND.push({
                        OR: [
                            { actualEndDate: { lte: endDateObj } },
                            {
                                AND: [
                                    { actualEndDate: null },
                                    {
                                        OR: [
                                            { actualStartDate: { lte: endDateObj } },
                                            { expectedStartDate: { lte: endDateObj } },
                                        ],
                                    },
                                ],
                            },
                        ],
                    });
                }
            }
            if (search) {
                const searchConditions = {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { classCode: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                        {
                            subject: {
                                name: { contains: search, mode: 'insensitive' },
                            },
                        },
                        {
                            teacher: {
                                user: {
                                    OR: [
                                        { fullName: { contains: search, mode: 'insensitive' } },
                                        { email: { contains: search, mode: 'insensitive' } },
                                        { phone: { contains: search, mode: 'insensitive' } },
                                    ],
                                },
                            },
                        },
                        {
                            room: {
                                name: { contains: search, mode: 'insensitive' },
                            },
                        },
                        {
                            grade: {
                                name: { contains: search, mode: 'insensitive' },
                            },
                        },
                    ],
                };
                if (where.AND) {
                    where.AND.push(searchConditions);
                }
                else {
                    where.AND = [searchConditions];
                }
            }
            const totalBeforeFilter = await this.prisma.class.count({ where });
            const orderBy = {};
            if (sortBy && sortOrder) {
                orderBy[sortBy] = sortOrder;
            }
            else {
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
                                    avatar: true,
                                },
                            },
                        },
                    },
                    enrollments: {
                        where: {
                            status: {
                                not: 'withdrawn',
                            },
                        },
                        select: {
                            id: true,
                        },
                    },
                    _count: {
                        select: { sessions: true },
                    },
                },
            });
            const classIds = classes.map((cls) => cls.id);
            const sessionsEndedResults = await this.prisma.classSession.groupBy({
                by: ['classId'],
                where: {
                    classId: { in: classIds },
                    status: 'end',
                },
                _count: {
                    id: true,
                },
            });
            const sessionsEndedMap = new Map(sessionsEndedResults.map((item) => [item.classId, item._count.id]));
            let transformedClasses = classes.map((cls) => ({
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
                currentStudents: cls.enrollments.length,
                roomId: cls.roomId,
                roomName: cls.room?.name || '-',
                description: cls.description,
                actualStartDate: cls.actualStartDate,
                actualEndDate: cls.actualEndDate,
                recurringSchedule: cls.recurringSchedule,
                academicYear: cls.academicYear,
                expectedStartDate: cls.expectedStartDate,
                teacher: cls.teacher
                    ? {
                        id: cls.teacher.id,
                        userId: cls.teacher.userId,
                        name: cls.teacher.user.fullName,
                        email: cls.teacher.user.email,
                        phone: cls.teacher.user.phone,
                        avatar: cls.teacher.user.avatar,
                    }
                    : null,
                sessions: cls._count.sessions,
                sessionsEnd: sessionsEndedMap.get(cls.id) || 0,
                createdAt: cls.createdAt,
                updatedAt: cls.updatedAt,
            }));
            if (dayOfWeek && dayOfWeek !== 'all') {
                transformedClasses = transformedClasses.filter((cls) => {
                    if (!cls.recurringSchedule ||
                        !cls.recurringSchedule?.schedules)
                        return false;
                    return cls.recurringSchedule.schedules.some((schedule) => schedule.day === dayOfWeek);
                });
            }
            if (shift && shift !== 'all') {
                const timeRanges = {
                    morning: { start: '00:00', end: '11:59' },
                    afternoon: { start: '12:00', end: '16:59' },
                    evening: { start: '17:00', end: '23:59' },
                };
                const timeRange = timeRanges[shift];
                if (timeRange) {
                    transformedClasses = transformedClasses.filter((cls) => {
                        if (!cls.recurringSchedule ||
                            !cls.recurringSchedule?.schedules)
                            return false;
                        return cls.recurringSchedule.schedules.some((schedule) => {
                            const startTime = schedule.startTime;
                            return (startTime >= timeRange.start && startTime <= timeRange.end);
                        });
                    });
                }
            }
            return {
                success: true,
                message: 'Lấy danh sách lớp học thành công',
                data: transformedClasses,
                meta: {
                    total: totalBeforeFilter,
                    page: page,
                    limit: limit,
                    totalPages: Math.ceil(totalBeforeFilter / limit),
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách lớp học',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id) {
        try {
            if (!this.isValidUUID(id)) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'ID lớp học không hợp lệ',
                }, common_1.HttpStatus.BAD_REQUEST);
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
                                    avatar: true,
                                },
                            },
                        },
                    },
                    enrollments: {
                        where: {
                            status: {
                                in: ['not_been_updated', 'studying'],
                            },
                        },
                        include: {
                            student: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            fullName: true,
                                            email: true,
                                            phone: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    _count: {
                        select: { enrollments: true },
                    },
                },
            });
            if (!classItem) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy lớp học',
                }, common_1.HttpStatus.NOT_FOUND);
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
                    teacher: classItem.teacher
                        ? {
                            ...classItem.teacher.user,
                            teacherId: classItem.teacher.id,
                            userId: classItem.teacher.userId,
                            teacherCode: classItem.teacher.teacherCode,
                        }
                        : null,
                    students: classItem.enrollments.map((e) => ({
                        enrollmentId: e.id,
                        studentId: e.student.id,
                        ...e.student.user,
                        enrolledAt: e.enrolledAt,
                        status: e.status,
                    })),
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy thông tin lớp học',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async create(createClassDto) {
        try {
            if (!createClassDto.name) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Tên lớp là bắt buộc',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;
            const currentAcademicYear = currentMonth >= 5
                ? `${currentYear}-${currentYear + 1}`
                : `${currentYear - 1}-${currentYear}`;
            const academicYear = createClassDto.academicYear || currentAcademicYear;
            const duplicateCheck = await this.checkDuplicateClassName(createClassDto.name, academicYear);
            if (duplicateCheck.isDuplicate) {
                throw new common_1.HttpException({
                    success: false,
                    message: `Tên lớp "${createClassDto.name}" đã tồn tại. Gợi ý tên: "${duplicateCheck.suggestedName}"`,
                }, common_1.HttpStatus.CONFLICT);
            }
            if (createClassDto.subjectId) {
                const subject = await this.prisma.subject.findUnique({
                    where: { id: createClassDto.subjectId },
                });
                if (!subject) {
                    throw new common_1.HttpException({
                        success: false,
                        message: 'Môn học không tồn tại',
                    }, common_1.HttpStatus.NOT_FOUND);
                }
            }
            let roomCapacity = null;
            if (createClassDto.roomId) {
                const room = await this.prisma.room.findUnique({
                    where: { id: createClassDto.roomId },
                });
                if (!room) {
                    throw new common_1.HttpException({
                        success: false,
                        message: 'Phòng học không tồn tại',
                    }, common_1.HttpStatus.NOT_FOUND);
                }
                roomCapacity = room.capacity;
            }
            if (createClassDto.gradeId) {
                const grade = await this.prisma.grade.findUnique({
                    where: { id: createClassDto.gradeId },
                });
                if (!grade) {
                    throw new common_1.HttpException({
                        success: false,
                        message: 'Khối lớp không tồn tại',
                    }, common_1.HttpStatus.NOT_FOUND);
                }
            }
            if (createClassDto.teacherId) {
                const teacher = await this.prisma.teacher.findUnique({
                    where: { id: createClassDto.teacherId },
                });
                if (!teacher) {
                    throw new common_1.HttpException({
                        success: false,
                        message: 'Giáo viên không tồn tại',
                    }, common_1.HttpStatus.NOT_FOUND);
                }
            }
            let classCode;
            let isUnique = false;
            let attempts = 0;
            const maxAttempts = 10;
            while (!isUnique && attempts < maxAttempts) {
                classCode = (0, function_util_1.generateQNCode)('class');
                const existingClass = await this.prisma.class.findUnique({
                    where: { classCode },
                });
                if (!existingClass) {
                    isUnique = true;
                }
                attempts++;
            }
            if (!isUnique) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không thể tạo mã lớp học duy nhất sau nhiều lần thử',
                }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            const maxStudents = createClassDto.maxStudents ?? roomCapacity;
            let feeStructureId = null;
            let feeAmount = null;
            let feePeriod = null;
            let feeCurrency = 'VND';
            if (createClassDto.gradeId && createClassDto.subjectId) {
                const grade = await this.prisma.grade.findUnique({
                    where: { id: createClassDto.gradeId },
                });
                const subject = await this.prisma.subject.findUnique({
                    where: { id: createClassDto.subjectId },
                });
                if (grade && subject) {
                    let feeStructure = await this.prisma.feeStructure.findUnique({
                        where: {
                            gradeId_subjectId: {
                                gradeId: createClassDto.gradeId,
                                subjectId: createClassDto.subjectId,
                            },
                        },
                    });
                    if (!feeStructure) {
                        feeStructure = await this.prisma.feeStructure.create({
                            data: {
                                name: `Học phí ${subject.name} ${grade.name}`,
                                amount: 0,
                                period: 'per_session',
                                description: `Học phí cho môn ${subject.name} khối ${grade.name}`,
                                gradeId: createClassDto.gradeId,
                                subjectId: createClassDto.subjectId,
                                isActive: true,
                            },
                        });
                    }
                    feeStructureId = feeStructure.id;
                    feeAmount = feeStructure.amount ? Number(feeStructure.amount) : null;
                    feePeriod = feeStructure.period || null;
                    feeCurrency = 'VND';
                }
            }
            const newClass = await this.prisma.class.create({
                data: {
                    name: createClassDto.name,
                    classCode: classCode,
                    subjectId: createClassDto.subjectId || null,
                    gradeId: createClassDto.gradeId || null,
                    maxStudents: maxStudents,
                    roomId: createClassDto.roomId || null,
                    teacherId: createClassDto.teacherId || null,
                    description: createClassDto.description || null,
                    status: constants_1.DEFAULT_STATUS.CLASS,
                    recurringSchedule: createClassDto.recurringSchedule || null,
                    academicYear: academicYear,
                    feeStructureId: feeStructureId,
                    feeAmount: feeAmount,
                    feePeriod: feePeriod,
                    feeCurrency: feeCurrency,
                    expectedStartDate: createClassDto.expectedStartDate
                        ? new Date(createClassDto.expectedStartDate)
                        : null,
                    actualStartDate: createClassDto.actualStartDate
                        ? new Date(createClassDto.actualStartDate)
                        : null,
                    actualEndDate: createClassDto.actualEndDate
                        ? new Date(createClassDto.actualEndDate)
                        : null,
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
                                    avatar: true,
                                },
                            },
                        },
                    },
                },
            });
            return {
                success: true,
                message: `Tạo lớp học thành công.`,
                data: newClass,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi tạo lớp học',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(id, updateClassDto) {
        try {
            if (!this.isValidUUID(id)) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'ID lớp học không hợp lệ',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const existingClass = await this.prisma.class.findUnique({
                where: { id },
            });
            if (!existingClass) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy lớp học',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            if (updateClassDto.name || updateClassDto.academicYear) {
                const newName = updateClassDto.name || existingClass.name;
                const newAcademicYear = updateClassDto.academicYear || existingClass.academicYear;
                if (newName !== existingClass.name ||
                    newAcademicYear !== existingClass.academicYear) {
                    const duplicateCheck = await this.checkDuplicateClassName(newName, newAcademicYear, id);
                    if (duplicateCheck.isDuplicate) {
                        throw new common_1.HttpException({
                            success: false,
                            message: `Tên lớp "${newName}" đã tồn tại trong năm học này. Gợi ý tên: "${duplicateCheck.suggestedName}"`,
                        }, common_1.HttpStatus.CONFLICT);
                    }
                }
            }
            if (updateClassDto.subjectId) {
                const subject = await this.prisma.subject.findUnique({
                    where: { id: updateClassDto.subjectId },
                });
                if (!subject) {
                    throw new common_1.HttpException({
                        success: false,
                        message: 'Môn học không tồn tại',
                    }, common_1.HttpStatus.NOT_FOUND);
                }
            }
            if (updateClassDto.roomId) {
                const room = await this.prisma.room.findUnique({
                    where: { id: updateClassDto.roomId },
                });
                if (!room) {
                    throw new common_1.HttpException({
                        success: false,
                        message: 'Phòng học không tồn tại',
                    }, common_1.HttpStatus.NOT_FOUND);
                }
            }
            if (updateClassDto.gradeId) {
                const grade = await this.prisma.grade.findUnique({
                    where: { id: updateClassDto.gradeId },
                });
                if (!grade) {
                    throw new common_1.HttpException({
                        success: false,
                        message: 'Khối lớp không tồn tại',
                    }, common_1.HttpStatus.NOT_FOUND);
                }
            }
            if (updateClassDto.teacherId) {
                const teacher = await this.prisma.teacher.findUnique({
                    where: { id: updateClassDto.teacherId },
                });
                if (!teacher) {
                    throw new common_1.HttpException({
                        success: false,
                        message: 'Giáo viên không tồn tại',
                    }, common_1.HttpStatus.NOT_FOUND);
                }
            }
            const updatedClass = await this.prisma.class.update({
                where: { id },
                data: {
                    ...(updateClassDto.name && { name: updateClassDto.name }),
                    ...(updateClassDto.subjectId && {
                        subjectId: updateClassDto.subjectId,
                    }),
                    ...(updateClassDto.gradeId !== undefined && {
                        gradeId: updateClassDto.gradeId,
                    }),
                    ...(updateClassDto.maxStudents !== undefined && {
                        maxStudents: updateClassDto.maxStudents,
                    }),
                    ...(updateClassDto.roomId !== undefined && {
                        roomId: updateClassDto.roomId,
                    }),
                    ...(updateClassDto.teacherId !== undefined && {
                        teacherId: updateClassDto.teacherId,
                    }),
                    ...(updateClassDto.description !== undefined && {
                        description: updateClassDto.description,
                    }),
                    ...(updateClassDto.status && { status: updateClassDto.status }),
                    ...(updateClassDto.recurringSchedule !== undefined && {
                        recurringSchedule: updateClassDto.recurringSchedule,
                    }),
                    ...(updateClassDto.academicYear !== undefined && {
                        academicYear: updateClassDto.academicYear,
                    }),
                    ...(updateClassDto.expectedStartDate !== undefined && {
                        expectedStartDate: updateClassDto.expectedStartDate
                            ? new Date(updateClassDto.expectedStartDate)
                            : null,
                    }),
                    ...(updateClassDto.actualEndDate !== undefined && {
                        actualEndDate: updateClassDto.actualEndDate
                            ? new Date(updateClassDto.actualEndDate)
                            : null,
                    }),
                    ...(updateClassDto.actualStartDate !== undefined && {
                        actualStartDate: updateClassDto.actualStartDate
                            ? new Date(updateClassDto.actualStartDate)
                            : null,
                    }),
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
                                    avatar: true,
                                },
                            },
                        },
                    },
                },
            });
            [];
            const isStatusChangedToActive = (existingClass.status === 'ready' || existingClass.status === 'suspended') && updateClassDto.status === 'active';
            if (isStatusChangedToActive) {
                try {
                    const existingSessionsCount = await this.prisma.classSession.count({
                        where: { classId: id },
                    });
                    if (existingSessionsCount > 0) {
                        return {
                            success: true,
                            message: `Cập nhật lớp học thành công. Lớp đã có ${existingSessionsCount} buổi học.`,
                            data: updatedClass,
                            sessionsGenerated: false,
                        };
                    }
                    const startDate = updatedClass.actualStartDate || updatedClass.expectedStartDate;
                    let endDate = updatedClass.actualEndDate;
                    if (startDate && !endDate) {
                        endDate = new Date(startDate);
                        endDate.setMonth(endDate.getMonth() + 9);
                        console.log(`📅 Auto-calculated endDate: ${endDate.toLocaleDateString('vi-VN')}`);
                    }
                    if (startDate && endDate && updatedClass.recurringSchedule) {
                        console.log(`🚀 Generating sessions from ${startDate.toLocaleDateString('vi-VN')} to ${endDate.toLocaleDateString('vi-VN')}`);
                        await this.generateSessions(id, {
                            startDate: startDate.toISOString().split('T')[0],
                            endDate: endDate.toISOString().split('T')[0],
                        });
                        return {
                            success: true,
                            message: `Cập nhật lớp học thành công. Đã tạo lịch học từ ${startDate.toLocaleDateString('vi-VN')} đến ${endDate.toLocaleDateString('vi-VN')}.`,
                            data: updatedClass,
                            sessionsGenerated: true,
                        };
                    }
                    else {
                        return {
                            success: true,
                            message: 'Cập nhật lớp học thành công. Vui lòng cập nhật ngày bắt đầu và lịch học tuần để tạo buổi học.',
                            data: updatedClass,
                            warning: 'Chưa thể tạo lịch học do thiếu thông tin ngày bắt đầu hoặc lịch học tuần',
                        };
                    }
                }
                catch (error) {
                    console.error('Error auto-generating sessions:', error);
                    return {
                        success: true,
                        message: 'Cập nhật lớp học thành công nhưng có lỗi khi tạo lịch học tự động',
                        data: updatedClass,
                        warning: error.message || 'Không thể tạo lịch học tự động',
                    };
                }
            }
            return {
                success: true,
                message: 'Cập nhật lớp học thành công',
                data: updatedClass,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi cập nhật lớp học',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateStatus(id, updateStatusDto) {
        try {
            if (!this.isValidUUID(id)) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'ID lớp học không hợp lệ',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const { status, startDate, endDate } = updateStatusDto;
            const existingClass = await this.prisma.class.findUnique({
                where: { id },
                include: {
                    enrollments: {
                        where: {
                            status: {
                                in: ['studying', 'not_been_updated'],
                            },
                        },
                    },
                    subject: true,
                    room: true,
                    teacher: true,
                },
            });
            if (!existingClass) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy lớp học',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            const result = await this.prisma.$transaction(async (tx) => {
                const updateData = { status };
                if (status === 'active' && !existingClass.feeLockedAt) {
                    updateData.feeLockedAt = new Date();
                }
                const updatedClass = await tx.class.update({
                    where: { id },
                    data: updateData,
                });
                let updatedEnrollmentsCount = 0;
                let updatedSessionsCount = 0;
                if (existingClass.status === 'active' && status === 'completed') {
                    const updateResult = await tx.enrollment.updateMany({
                        where: {
                            classId: id,
                            status: {
                                in: ['studying', 'not_been_updated'],
                            },
                        },
                        data: {
                            status: constants_1.EnrollmentStatus.GRADUATED,
                            completedAt: new Date(),
                        },
                    });
                    updatedEnrollmentsCount = updateResult.count;
                    const sessionsUpdateResult = await tx.classSession.updateMany({
                        where: {
                            classId: id,
                            status: {
                                notIn: ['end', 'cancelled', 'day_off'],
                            },
                        },
                        data: {
                            status: 'end',
                        },
                    });
                    updatedSessionsCount = sessionsUpdateResult.count;
                }
                if (status === 'cancelled') {
                    console.log(status);
                    const updateResult = await tx.enrollment.updateMany({
                        where: {
                            classId: id,
                            status: {
                                in: ['studying', 'not_been_updated'],
                            },
                        },
                        data: {
                            status: constants_1.EnrollmentStatus.STOPPED,
                            completionNotes: 'Lớp học đã bị hủy',
                        },
                    });
                    updatedEnrollmentsCount = updateResult.count;
                    const sessionsUpdateResult = await tx.classSession.updateMany({
                        where: {
                            classId: id,
                            status: {
                                notIn: ['end', 'cancelled', 'day_off'],
                            },
                        },
                        data: {
                            status: 'cancelled',
                        },
                    });
                    updatedSessionsCount = sessionsUpdateResult.count;
                }
                return {
                    class: updatedClass,
                    updatedEnrollmentsCount,
                    updatedSessionsCount,
                };
            });
            const isStatusChangedToActive = (existingClass.status === 'ready' || existingClass.status === 'suspended') && status === 'active';
            if (isStatusChangedToActive) {
                try {
                    const existingSessionsCount = await this.prisma.classSession.count({
                        where: { classId: id },
                    });
                    if (existingSessionsCount > 0) {
                        const statusLabel = {
                            draft: 'Lớp nháp',
                            ready: 'Sẵn sàng',
                            active: 'Đang hoạt động',
                            completed: 'Đã hoàn thành',
                            suspended: 'Tạm dừng',
                            cancelled: 'Đã hủy',
                        }[status] || status;
                        return {
                            success: true,
                            message: `Đã chuyển trạng thái lớp sang "${statusLabel}". Lớp đã có ${existingSessionsCount} buổi học.`,
                            data: result.class,
                            updatedEnrollmentsCount: result.updatedEnrollmentsCount,
                            sessionsGenerated: false,
                        };
                    }
                    const sessionStartDate = startDate
                        ? new Date(startDate)
                        : result.class.actualStartDate || result.class.expectedStartDate;
                    let sessionEndDate = null;
                    if (endDate) {
                        sessionEndDate = new Date(endDate);
                    }
                    else {
                        sessionEndDate = result.class.actualEndDate || null;
                        if (sessionStartDate && !sessionEndDate) {
                            sessionEndDate = new Date(sessionStartDate);
                            sessionEndDate.setMonth(sessionEndDate.getMonth() + 9);
                            console.log(`Auto-calculated endDate: ${sessionEndDate.toLocaleDateString('vi-VN')}`);
                        }
                    }
                    if (sessionStartDate && sessionEndDate && result.class.recurringSchedule) {
                        console.log(`Generating sessions from ${sessionStartDate.toLocaleDateString('vi-VN')} to ${sessionEndDate.toLocaleDateString('vi-VN')}`);
                        await this.generateSessions(id, {
                            startDate: sessionStartDate.toISOString().split('T')[0],
                            endDate: sessionEndDate.toISOString().split('T')[0],
                            generateForFullYear: false,
                        });
                        const statusLabel = {
                            draft: 'Lớp nháp',
                            ready: 'Sẵn sàng',
                            active: 'Đang hoạt động',
                            completed: 'Đã hoàn thành',
                            suspended: 'Tạm dừng',
                            cancelled: 'Đã hủy',
                        }[status] || status;
                        let message = `Đã chuyển trạng thái lớp sang "${statusLabel}". Đã tạo lịch học từ ${sessionStartDate.toLocaleDateString('vi-VN')} đến ${sessionEndDate.toLocaleDateString('vi-VN')}.`;
                        return {
                            success: true,
                            message,
                            data: result.class,
                            updatedEnrollmentsCount: result.updatedEnrollmentsCount,
                            sessionsGenerated: true,
                        };
                    }
                    else {
                        const statusLabel = {
                            draft: 'Lớp nháp',
                            ready: 'Sẵn sàng',
                            active: 'Đang hoạt động',
                            completed: 'Đã hoàn thành',
                            suspended: 'Tạm dừng',
                            cancelled: 'Đã hủy',
                        }[status] || status;
                        let message = `Đã chuyển trạng thái lớp sang "${statusLabel}". Vui lòng cập nhật ngày bắt đầu và lịch học tuần để tạo buổi học.`;
                        return {
                            success: true,
                            message,
                            data: result.class,
                            updatedEnrollmentsCount: result.updatedEnrollmentsCount,
                            warning: 'Chưa thể tạo lịch học do thiếu thông tin ngày bắt đầu hoặc lịch học tuần',
                        };
                    }
                }
                catch (error) {
                    console.error('Error auto-generating sessions:', error);
                    const statusLabel = {
                        draft: 'Lớp nháp',
                        ready: 'Sẵn sàng',
                        active: 'Đang hoạt động',
                        completed: 'Đã hoàn thành',
                        suspended: 'Tạm dừng',
                        cancelled: 'Đã hủy',
                    }[status] || status;
                    let message = `Đã chuyển trạng thái lớp sang "${statusLabel}" nhưng có lỗi khi tạo lịch học tự động`;
                    return {
                        success: true,
                        message,
                        data: result.class,
                        updatedEnrollmentsCount: result.updatedEnrollmentsCount,
                        warning: error.message || 'Không thể tạo lịch học tự động',
                    };
                }
            }
            const statusLabel = {
                draft: 'Lớp nháp',
                ready: 'Sẵn sàng',
                active: 'Đang hoạt động',
                completed: 'Đã hoàn thành',
                suspended: 'Tạm dừng',
                cancelled: 'Đã hủy',
            }[status] || status;
            let message = `Đã chuyển trạng thái lớp sang "${statusLabel}"`;
            if (existingClass.status === 'active' && status === 'completed') {
                message += `. Đã cập nhật trạng thái ${result.updatedEnrollmentsCount} học sinh sang "Đã tốt nghiệp"`;
            }
            this.emailNotificationService
                .sendClassStatusChangeEmailToParents(id, existingClass.status, status)
                .catch(error => {
                console.error('❌ Lỗi khi gửi email thông báo status:', error);
            });
            return {
                success: true,
                message,
                data: result.class,
                updatedEnrollmentsCount: result.updatedEnrollmentsCount,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi cập nhật trạng thái lớp học',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async generateSessions(classId, body) {
        try {
            const { startDate, endDate, generateForFullYear = true, overwrite = false, } = body;
            if (!this.isValidUUID(classId)) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'ID lớp học không hợp lệ',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (!startDate || !endDate) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Ngày bắt đầu và ngày kết thúc là bắt buộc',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (startDate >= endDate) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Ngày bắt đầu phải trước ngày kết thúc',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const classInfo = await this.prisma.class.findUnique({
                where: { id: classId },
                include: {
                    teacher: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                    isActive: true,
                                },
                            },
                        },
                    },
                    room: true,
                    subject: true,
                    enrollments: {
                        where: {
                            status: {
                                in: ['not_been_updated', 'studying'],
                            },
                        },
                        include: {
                            student: {
                                include: {
                                    user: {
                                        select: {
                                            isActive: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            enrollments: {
                                where: {
                                    status: {
                                        in: ['not_been_updated', 'studying'],
                                    },
                                },
                            },
                        },
                    },
                },
            });
            if (!classInfo) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy lớp học',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            const validationErrors = [];
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
            if (!classInfo.teacher) {
                validationErrors.push('Lớp học chưa được gán giáo viên');
            }
            if (validationErrors.length > 0) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Lớp học chưa đủ điều kiện để tạo buổi học',
                    errors: validationErrors,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const warnings = [];
            const activeEnrollments = classInfo._count.enrollments;
            if (activeEnrollments < 5) {
                warnings.push(`⚠️ Lớp học chỉ có ${activeEnrollments} học sinh`);
            }
            if (warnings.length > 0) {
                console.log('Warnings:', warnings);
            }
            let sessionStartDate;
            let sessionEndDate;
            if (generateForFullYear) {
                sessionStartDate =
                    classInfo.actualStartDate ||
                        classInfo.expectedStartDate ||
                        new Date();
                const nineMonthsLater = new Date(sessionStartDate);
                nineMonthsLater.setMonth(nineMonthsLater.getMonth() + 9);
                sessionEndDate = classInfo.actualEndDate || nineMonthsLater;
            }
            else {
                sessionStartDate = new Date(startDate);
                sessionEndDate = new Date(endDate);
            }
            if (overwrite) {
                const classStart = classInfo.actualStartDate || classInfo.expectedStartDate;
                if (classStart && new Date() >= new Date(classStart)) {
                    throw new common_1.HttpException({
                        success: false,
                        message: 'Lớp đã bắt đầu học, không thể cập nhật lịch cũ',
                    }, common_1.HttpStatus.BAD_REQUEST);
                }
                await this.prisma.classSession.deleteMany({
                    where: {
                        classId,
                    },
                });
            }
            if (sessionStartDate >= sessionEndDate) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Ngày bắt đầu phải trước ngày kết thúc',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const recurringSchedule = classInfo.recurringSchedule;
            const scheduleDays = Array.isArray(recurringSchedule?.schedules)
                ? recurringSchedule.schedules
                : [];
            if (scheduleDays.length === 0) {
                throw new common_1.HttpException({ success: false, message: 'Lớp học chưa có lịch học định kỳ' }, common_1.HttpStatus.BAD_REQUEST);
            }
            const sessions = [];
            let displayIndex = 1;
            const lastByCreated = await this.prisma.classSession.findFirst({
                where: { classId },
                orderBy: { createdAt: 'desc' },
            });
            if (lastByCreated) {
                const parsed = parseInt(lastByCreated.notes?.match(/Buổi (\d+)/)?.[1] || '0');
                if (!isNaN(parsed) && parsed > 0)
                    displayIndex = parsed + 1;
            }
            const overallStart = new Date(sessionStartDate);
            const overallEnd = new Date(sessionEndDate);
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            for (let d = new Date(overallStart); d <= overallEnd; d.setDate(d.getDate() + 1)) {
                const dayOfWeek = d.getDay();
                const dayName = [
                    'sunday',
                    'monday',
                    'tuesday',
                    'wednesday',
                    'thursday',
                    'friday',
                    'saturday',
                ][dayOfWeek];
                const daySchedules = scheduleDays.filter((s) => (s.day || '').toLowerCase() === dayName);
                if (daySchedules.length === 0)
                    continue;
                for (const s of daySchedules) {
                    const schedStart = s.startDate ? new Date(s.startDate) : overallStart;
                    const schedEnd = s.endDate ? new Date(s.endDate) : overallEnd;
                    if (d < schedStart || d > schedEnd)
                        continue;
                    const startTime = s.startTime;
                    const endTime = s.endTime;
                    if (!startTime || !endTime)
                        continue;
                    const sessionDate = new Date(d);
                    sessionDate.setHours(0, 0, 0, 0);
                    const diffInDays = Math.ceil((sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    const sessionStatus = diffInDays === 0 ? 'happening' : 'has_not_happened';
                    sessions.push({
                        classId,
                        academicYear: classInfo.academicYear ||
                            new Date().getFullYear().toString() +
                                '-' +
                                (new Date().getFullYear() + 1).toString(),
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
            const existingSessions = await this.prisma.classSession.findMany({
                where: {
                    classId,
                    sessionDate: {
                        gte: sessionStartDate,
                        lte: sessionEndDate,
                    },
                },
            });
            const filteredSessions = sessions.filter((session) => !existingSessions.some((existing) => existing.sessionDate.toDateString() ===
                session.sessionDate.toDateString() &&
                existing.startTime === session.startTime));
            const holidays = await this.prisma.holidayPeriod.findMany({
                where: {
                    isActive: true,
                    OR: [
                        {
                            AND: [
                                { startDate: { lte: sessionEndDate } },
                                { endDate: { gte: sessionStartDate } },
                            ],
                        },
                    ],
                },
                select: { id: true, startDate: true, endDate: true, note: true },
            });
            const sessionsWithHolidayCheck = filteredSessions.map((session) => {
                const sessionDate = new Date(session.sessionDate);
                sessionDate.setHours(0, 0, 0, 0);
                const matchingHoliday = holidays.find((holiday) => {
                    const holidayStart = new Date(holiday.startDate);
                    holidayStart.setHours(0, 0, 0, 0);
                    const holidayEnd = new Date(holiday.endDate);
                    holidayEnd.setHours(0, 0, 0, 0);
                    return sessionDate >= holidayStart && sessionDate <= holidayEnd;
                });
                if (matchingHoliday) {
                    return {
                        ...session,
                        status: 'day_off',
                        cancellationReason: matchingHoliday.note,
                    };
                }
                return session;
            });
            const createdSessions = await this.prisma.classSession.createMany({
                data: sessionsWithHolidayCheck,
                skipDuplicates: true,
            });
            if (holidays.length > 0 && createdSessions.count > 0) {
                const dayOffSessions = await this.prisma.classSession.findMany({
                    where: {
                        classId,
                        sessionDate: {
                            gte: sessionStartDate,
                            lte: sessionEndDate,
                        },
                        status: 'day_off',
                    },
                    select: { id: true, sessionDate: true },
                });
                const existingLinks = await this.prisma.holidayPeriodSession.findMany({
                    where: {
                        sessionId: { in: dayOffSessions.map(s => s.id) },
                    },
                    select: { sessionId: true, holidayPeriodId: true },
                });
                const holidayLinks = [];
                for (const session of dayOffSessions) {
                    const sessionDate = new Date(session.sessionDate);
                    sessionDate.setHours(0, 0, 0, 0);
                    const matchingHoliday = holidays.find((holiday) => {
                        const holidayStart = new Date(holiday.startDate);
                        holidayStart.setHours(0, 0, 0, 0);
                        const holidayEnd = new Date(holiday.endDate);
                        holidayEnd.setHours(0, 0, 0, 0);
                        return sessionDate >= holidayStart && sessionDate <= holidayEnd;
                    });
                    if (matchingHoliday) {
                        const linkExists = existingLinks.some((link) => link.sessionId === session.id &&
                            link.holidayPeriodId === matchingHoliday.id);
                        if (!linkExists) {
                            holidayLinks.push({
                                holidayPeriodId: matchingHoliday.id,
                                sessionId: session.id,
                            });
                        }
                    }
                }
                if (holidayLinks.length > 0) {
                    await Promise.all(holidayLinks.map((link) => this.prisma.holidayPeriodSession.upsert({
                        where: {
                            holidayPeriodId_sessionId: {
                                holidayPeriodId: link.holidayPeriodId,
                                sessionId: link.sessionId,
                            },
                        },
                        create: link,
                        update: {},
                    })));
                }
            }
            const updatedEnrollments = await this.prisma.enrollment.updateMany({
                where: {
                    classId: classId,
                    status: 'not_been_updated',
                },
                data: {
                    status: 'studying',
                },
            });
            if (startDate && endDate) {
                await this.prisma.class.update({
                    where: { id: classId },
                    data: {
                        actualStartDate: new Date(startDate),
                        actualEndDate: new Date(endDate),
                    },
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
                        activeEnrollments: classInfo._count.enrollments,
                        status: classInfo.status,
                    },
                },
                message: `Tạo thành công ${createdSessions.count} buổi học cho lớp ${classInfo.name}. ${updatedEnrollments.count} học sinh đã chuyển sang trạng thái "Đang học".`,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi tạo buổi học',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getClassSessions(classId, query) {
        try {
            const { page = 1, limit = 10, search, status, startDate, endDate, academicYear, sortBy = 'sessionDate', sortOrder = 'desc', } = query;
            const skip = (page - 1) * limit;
            const take = parseInt(limit);
            const where = {
                classId: classId,
            };
            if (academicYear) {
                where.academicYear = academicYear;
            }
            if (search) {
                where.OR = [{ notes: { contains: search, mode: 'insensitive' } }];
            }
            if (status && status !== 'all') {
                where.status = status;
            }
            if (startDate || endDate) {
                where.sessionDate = {};
                if (startDate) {
                    where.sessionDate.gte = new Date(startDate);
                }
                if (endDate) {
                    where.sessionDate.lte = new Date(endDate);
                }
            }
            const orderBy = {};
            if (sortBy === 'sessionDate') {
                orderBy.sessionDate = sortOrder;
            }
            else if (sortBy === 'startTime') {
                orderBy.startTime = sortOrder;
            }
            else if (sortBy === 'notes') {
                orderBy.notes = sortOrder;
            }
            else {
                orderBy.sessionDate = 'desc';
            }
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
                                                fullName: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        teacher: {
                            select: {
                                user: {
                                    select: {
                                        fullName: true,
                                    },
                                },
                            },
                        },
                        substituteTeacher: {
                            select: {
                                user: {
                                    select: {
                                        fullName: true,
                                    },
                                },
                            },
                        },
                        room: {
                            select: {
                                name: true,
                            },
                        },
                        _count: {
                            select: {
                                attendances: true,
                            },
                        },
                    },
                }),
                this.prisma.classSession.count({ where }),
            ]);
            const sessionStudentCounts = await Promise.all(sessions.map((session) => this.prisma.enrollment.count({
                where: {
                    classId: classId,
                    status: { notIn: ['stopped', 'withdrawn'] },
                    enrolledAt: {
                        lte: session.sessionDate,
                    },
                },
            })));
            const transformedSessions = sessions.map((session, index) => {
                const studentCount = sessionStudentCounts[index] || 0;
                const isSubstitute = session.substituteTeacherId &&
                    session.substituteEndDate &&
                    new Date(session.substituteEndDate) >= session.sessionDate;
                const teacher = isSubstitute ? session.substituteTeacher : session.teacher;
                const teacherName = teacher?.user?.fullName || session.class.teacher?.user?.fullName || null;
                const originalTeacherName = session.teacher?.user?.fullName || session.class.teacher?.user?.fullName || null;
                return {
                    id: session.id,
                    topic: session.notes || `Buổi ${index + 1}`,
                    name: session.notes || `Buổi ${index + 1}`,
                    scheduledDate: session.sessionDate.toISOString().split('T')[0],
                    sessionDate: session.sessionDate.toISOString().split('T')[0],
                    startTime: session.startTime,
                    endTime: session.endTime,
                    status: session.status,
                    notes: session.notes,
                    teacher: teacherName,
                    teacherName: teacherName,
                    substituteTeacher: session.substituteTeacher?.user?.fullName || null,
                    originalTeacher: originalTeacherName,
                    isSubstitute: isSubstitute,
                    totalStudents: session.class.maxStudents || 0,
                    studentCount: studentCount,
                    attendanceCount: session._count.attendances || 0,
                    absentCount: 0,
                    notAttendedCount: studentCount - (session._count.attendances || 0),
                    rating: 0,
                    roomName: session.room?.name || null,
                };
            });
            const totalPages = Math.ceil(total / take);
            return {
                success: true,
                data: transformedSessions,
                meta: {
                    total,
                    page: parseInt(page),
                    limit: take,
                    totalPages,
                },
                message: 'Lấy danh sách buổi học thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách buổi học',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteSessions(classId, sessionIds) {
        try {
            if (!sessionIds ||
                !Array.isArray(sessionIds) ||
                sessionIds.length === 0) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Vui lòng chọn ít nhất 1 buổi học để xóa',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const classData = await this.prisma.class.findUnique({
                where: { id: classId },
                select: {
                    id: true,
                    name: true,
                    status: true,
                },
            });
            if (!classData) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy lớp học',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            const sessionsToDelete = await this.prisma.classSession.findMany({
                where: {
                    id: { in: sessionIds },
                    classId: classId,
                },
                select: {
                    id: true,
                    status: true,
                    sessionDate: true,
                    notes: true,
                    _count: {
                        select: {
                            attendances: true,
                        },
                    },
                },
            });
            if (sessionsToDelete.length === 0) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy buổi học nào để xóa',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            const invalidSessions = sessionsToDelete.filter((session) => session.status === 'end' || session._count.attendances > 0);
            if (invalidSessions.length > 0) {
                const invalidSessionNames = invalidSessions
                    .map((s) => s.notes || 'Không có tên')
                    .join(', ');
                throw new common_1.HttpException({
                    success: false,
                    message: `Không thể xóa ${invalidSessions.length} buổi học đã kết thúc hoặc đã có điểm danh`,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const deletedResult = await this.prisma.classSession.deleteMany({
                where: {
                    id: { in: sessionIds },
                    classId: classId,
                },
            });
            return {
                success: true,
                data: {
                    deletedCount: deletedResult.count,
                    requestedCount: sessionIds.length,
                    classId: classId,
                    className: classData.name,
                },
                message: `Đã xóa ${deletedResult.count} buổi học thành công`,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi xóa buổi học',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateClassSchedules(id, body) {
        try {
            if (!this.isValidUUID(id)) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'ID lớp học không hợp lệ',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const classData = await this.prisma.class.findUnique({
                where: { id },
                select: {
                    id: true,
                    status: true,
                    name: true,
                },
            });
            if (!classData) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy lớp học',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            if (classData.status === 'active') {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không thể cập nhật lịch học cho lớp đang hoạt động. Vui lòng chuyển lớp sang trạng thái khác trước.',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const existingSessions = await this.prisma.classSession.count({
                where: { classId: id },
            });
            if (existingSessions > 0) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Lớp đã có buổi học, không thể cập nhật lịch học. Để thay đổi lịch học vui lòng xóa toàn bộ lịch học.',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const isDraft = classData.status === constants_1.ClassStatus.DRAFT;
            const hasSchedules = body.schedules &&
                Array.isArray(body.schedules) &&
                body.schedules.length > 0;
            if (!hasSchedules && !isDraft) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Dữ liệu lịch học không hợp lệ. Lớp không phải draft phải có lịch học.',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            let updateData = {};
            if (hasSchedules) {
                const schedules = body.schedules.map((schedule) => ({
                    day: schedule.day,
                    startTime: schedule.startTime,
                    endTime: schedule.endTime,
                }));
                updateData.recurringSchedule = {
                    schedules: schedules,
                };
            }
            else if (isDraft) {
                updateData.recurringSchedule = null;
            }
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
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });
            if (body.teacherId) {
                const teacher = await this.prisma.teacher.findUnique({
                    where: { id: body.teacherId },
                });
                if (!teacher) {
                    throw new common_1.HttpException({
                        success: false,
                        message: 'Giáo viên không tồn tại',
                    }, common_1.HttpStatus.NOT_FOUND);
                }
                await this.prisma.class.update({
                    where: { id },
                    data: {
                        teacherId: body.teacherId,
                    },
                });
            }
            let message = 'Cập nhật lịch học thành công';
            if (!hasSchedules && isDraft) {
                message =
                    'Đã xóa lịch học. Lớp cần có lịch học trước khi chuyển sang trạng thái sẵn sàng (ready)';
            }
            else if (hasSchedules) {
                message = 'Cập nhật lịch học thành công';
            }
            return {
                success: true,
                message,
                data: updatedClass,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi cập nhật lịch học',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async delete(id) {
        try {
            if (!this.isValidUUID(id)) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'ID lớp học không hợp lệ',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const existingClass = await this.prisma.class.findUnique({
                where: { id },
                include: {
                    enrollments: {
                        where: {
                            status: {
                                in: ['not_been_updated', 'studying'],
                            },
                        },
                    },
                },
            });
            if (!existingClass) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy lớp học',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            if (existingClass.enrollments.length > 0 &&
                existingClass.status === 'active') {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không thể xóa lớp học có học sinh đang học',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (existingClass.status === 'completed') {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không thể xóa lớp học đã hoàn thành',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            await this.prisma.class.update({
                where: { id },
                data: { status: 'deleted' },
            });
            return {
                success: true,
                message: 'Xóa lớp học thành công',
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi xóa lớp học',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async cloneClass(id, cloneData) {
        try {
            if (!this.isValidUUID(id)) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'ID lớp học không hợp lệ',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const sourceClass = await this.prisma.class.findUnique({
                where: { id },
                include: {
                    subject: true,
                    grade: true,
                    room: true,
                    teacher: {
                        include: {
                            user: true,
                        },
                    },
                },
            });
            const enrollments = cloneData.cloneStudents
                ? await this.prisma.enrollment.findMany({
                    where: {
                        classId: id,
                        status: {
                            in: ['active', 'studying'],
                        },
                    },
                    include: {
                        student: true,
                    },
                })
                : [];
            if (!sourceClass) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy lớp học gốc',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            const duplicateCheck = await this.checkDuplicateClassName(cloneData.name, sourceClass.academicYear);
            if (duplicateCheck.isDuplicate) {
                throw new common_1.HttpException({
                    success: false,
                    message: `Tên lớp "${cloneData.name}" đã tồn tại trong năm học ${sourceClass.academicYear}`,
                    suggestedName: duplicateCheck.suggestedName,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const newCode = (0, function_util_1.generateQNCode)('class');
            const newClassData = {
                classCode: newCode,
                name: cloneData.name,
                subjectId: sourceClass.subjectId,
                gradeId: sourceClass.gradeId,
                academicYear: sourceClass.academicYear,
                maxStudents: sourceClass.maxStudents,
                description: sourceClass.description,
                status: 'draft',
                recurringSchedule: cloneData.cloneSchedule
                    ? sourceClass.recurringSchedule
                    : null,
                roomId: cloneData.cloneRoom ? sourceClass.roomId : null,
                teacherId: cloneData.cloneTeacher ? sourceClass.teacherId : null,
            };
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
                                    phone: true,
                                },
                            },
                        },
                    },
                },
            });
            if (cloneData.cloneStudents && enrollments && enrollments.length > 0) {
                const enrollmentData = enrollments.map((enrollment) => ({
                    studentId: enrollment.studentId,
                    classId: newClass.id,
                    enrollmentDate: new Date(),
                    status: 'active',
                }));
                await this.prisma.enrollment.createMany({
                    data: enrollmentData,
                });
            }
            const responseData = {
                ...newClass,
                gradeName: newClass.grade?.name,
                gradeLevel: newClass.grade?.level,
                subjectName: newClass.subject?.name,
                roomName: newClass.room?.name,
                teacher: newClass.teacher
                    ? {
                        id: newClass.teacher.id,
                        name: newClass.teacher.user?.fullName,
                        email: newClass.teacher.user?.email,
                        phone: newClass.teacher.user?.phone,
                    }
                    : null,
            };
            return {
                success: true,
                message: `Clone lớp học thành công! Lớp mới: ${newClass.name}`,
                data: responseData,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            console.error('Error cloning class:', error);
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi clone lớp học',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async assignTeacher(classId, body) {
        try {
            if (!body.teacherId) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Thiếu thông tin bắt buộc: teacherId',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const classItem = await this.prisma.class.findUnique({
                where: { id: classId },
            });
            if (!classItem) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy lớp học',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            const teacher = await this.prisma.teacher.findUnique({
                where: { id: body.teacherId },
            });
            if (!teacher) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy giáo viên',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            if (classItem.teacherId === body.teacherId) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Giáo viên đã được phân công cho lớp này',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            let hasSchedule = false;
            if (classItem.recurringSchedule !== null &&
                classItem.recurringSchedule !== undefined) {
                if (Array.isArray(classItem.recurringSchedule)) {
                    hasSchedule = classItem.recurringSchedule.length > 0;
                }
                else if (typeof classItem.recurringSchedule === 'object') {
                    hasSchedule = Object.keys(classItem.recurringSchedule).length > 0;
                }
            }
            if (!hasSchedule) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Vui lòng cập nhật lịch học trước khi phân công giáo viên',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const scheduleConflict = await this.checkTeacherScheduleConflict(body.teacherId, classId, classItem.recurringSchedule, classItem.roomId);
            if (scheduleConflict.hasConflict) {
                throw new common_1.HttpException({
                    success: false,
                    message: scheduleConflict.message,
                    conflictDetails: scheduleConflict.conflictDetails,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            let newStatus = classItem.status;
            let successMessage = 'Phân công giáo viên thành công';
            if (classItem.status === constants_1.ClassStatus.DRAFT) {
                newStatus = constants_1.ClassStatus.READY;
                successMessage =
                    'Phân công giáo viên thành công. Lớp đã sẵn sàng khai giảng';
            }
            const updatedClass = await this.prisma.class.update({
                where: { id: classId },
                data: {
                    teacherId: body.teacherId,
                    status: newStatus,
                },
                include: {
                    teacher: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                    email: true,
                                    phone: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                },
            });
            try {
                await this.emailNotificationService.sendClassAssignTeacherEmail(classId, body.teacherId);
                console.log(`📧 Email phân công lớp đã được queue cho giáo viên ${body.teacherId} và lớp ${classId}`);
            }
            catch (emailError) {
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
                    newStatus: newStatus,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi phân công giáo viên',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async removeTeacher(classId, teacherId) {
        try {
            const classItem = await this.prisma.class.findUnique({
                where: { id: classId },
            });
            if (!classItem) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy lớp học',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            if (classItem.teacherId !== teacherId) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Giáo viên không được phân công cho lớp này',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            try {
                await this.emailNotificationService.sendClassRemoveTeacherEmail(classId, teacherId, 'Lớp học đã được hủy phân công');
                console.log(`📧 Email hủy phân công lớp đã được queue cho giáo viên ${teacherId}`);
            }
            catch (emailError) {
                console.error('Failed to queue cancellation email to teacher:', emailError);
            }
            const updatedClass = await this.prisma.class.update({
                where: { id: classId },
                data: {
                    teacherId: null,
                    status: constants_1.ClassStatus.DRAFT,
                },
            });
            return {
                success: true,
                message: 'Xóa phân công giáo viên thành công. Lớp đã chuyển về trạng thái nháp',
                data: updatedClass,
                metadata: {
                    statusChanged: classItem.status !== constants_1.ClassStatus.DRAFT,
                    oldStatus: classItem.status,
                    newStatus: constants_1.ClassStatus.DRAFT,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi xóa phân công giáo viên',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getTeachersByClass(classId) {
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
                                    avatar: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!classItem) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy lớp học',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            const teachers = classItem.teacher
                ? [
                    {
                        teacherId: classItem.teacher.id,
                        userId: classItem.teacher.userId,
                        ...classItem.teacher.user,
                    },
                ]
                : [];
            return {
                success: true,
                message: 'Lấy danh sách giáo viên thành công',
                data: teachers,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách giáo viên',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async transferTeacher(classId, body, requestedBy) {
        try {
            if (!body.replacementTeacherId) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Thiếu thông tin bắt buộc: replacementTeacherId',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (!body.reason || !body.reason.trim()) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Vui lòng nhập lý do chuyển giáo viên',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const classItem = await this.prisma.class.findUnique({
                where: { id: classId },
                include: {
                    teacher: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    enrollments: {
                        where: {
                            status: {
                                in: ['not_been_updated', 'studying'],
                            },
                        },
                    },
                    _count: {
                        select: {
                            sessions: true,
                        },
                    },
                },
            });
            if (!classItem) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy lớp học',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            if (!classItem.teacherId) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Lớp học chưa có giáo viên được phân công',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (classItem.teacherId === body.replacementTeacherId) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Giáo viên thay thế phải khác giáo viên hiện tại',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const replacementTeacher = await this.prisma.teacher.findUnique({
                where: { id: body.replacementTeacherId },
                include: {
                    user: {
                        select: {
                            fullName: true,
                            email: true,
                            isActive: true,
                        },
                    },
                },
            });
            if (!replacementTeacher) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy giáo viên thay thế',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            if (!replacementTeacher.user.isActive) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Giáo viên thay thế đang không hoạt động',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (classItem.subjectId) {
                const classSubject = await this.prisma.subject.findUnique({
                    where: { id: classItem.subjectId },
                });
                if (classSubject &&
                    replacementTeacher.subjects &&
                    Array.isArray(replacementTeacher.subjects) &&
                    !replacementTeacher.subjects.includes(classSubject.name)) {
                    throw new common_1.HttpException({
                        success: false,
                        message: `Giáo viên thay thế không thể dạy môn ${classSubject.name}`,
                    }, common_1.HttpStatus.BAD_REQUEST);
                }
            }
            const activeStudentsCount = classItem.enrollments.length;
            if (activeStudentsCount === 0 && classItem.status !== 'draft') {
            }
            const pendingTransfer = await this.prisma.teacherClassTransfer.findFirst({
                where: {
                    fromClassId: classId,
                    status: 'pending',
                },
            });
            if (pendingTransfer) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Lớp học đang có yêu cầu chuyển giáo viên đang chờ xử lý',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (body.substituteEndDate) {
                const substituteEndDate = new Date(body.substituteEndDate);
                if (body.effectiveDate) {
                    const effectiveDate = new Date(body.effectiveDate);
                    if (substituteEndDate <= effectiveDate) {
                        throw new common_1.HttpException({
                            success: false,
                            message: 'Ngày kết thúc giáo viên thay thế phải sau ngày bắt đầu có hiệu lực',
                        }, common_1.HttpStatus.BAD_REQUEST);
                    }
                }
            }
            const effectiveDate = body.effectiveDate
                ? new Date(body.effectiveDate)
                : new Date();
            const substituteEndDate = body.substituteEndDate
                ? new Date(body.substituteEndDate)
                : null;
            const conflictResult = await this.validateTransferConflict(classId, {
                replacementTeacherId: body.replacementTeacherId,
                effectiveDate: effectiveDate.toISOString().split('T')[0],
                substituteEndDate: substituteEndDate
                    ? substituteEndDate.toISOString().split('T')[0]
                    : undefined,
            });
            if (conflictResult?.data?.inactive) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Giáo viên thay thế đang không hoạt động',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (conflictResult?.data?.incompatibleSubject) {
                throw new common_1.HttpException({
                    success: false,
                    message: conflictResult?.data?.subjectMessage || 'Giáo viên thay thế không phù hợp môn học',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (conflictResult?.data?.hasConflict) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Giáo viên thay thế đang có xung đột lịch trong khoảng áp dụng',
                    data: conflictResult.data.conflicts,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.prisma.$transaction(async (tx) => {
                const transfer = await tx.teacherClassTransfer.create({
                    data: {
                        teacherId: classItem.teacherId,
                        fromClassId: classId,
                        replacementTeacherId: body.replacementTeacherId,
                        reason: body.reason.trim(),
                        reasonDetail: body.reasonDetail?.trim() || null,
                        requestedBy: requestedBy,
                        status: 'approved',
                        approvedBy: requestedBy,
                        approvedAt: new Date(),
                        effectiveDate: effectiveDate,
                        substituteEndDate: substituteEndDate,
                        notes: body.notes?.trim() || null,
                    },
                    include: {
                        teacher: {
                            include: {
                                user: {
                                    select: {
                                        fullName: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                        replacementTeacher: {
                            include: {
                                user: {
                                    select: {
                                        fullName: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                        fromClass: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                });
                if (substituteEndDate) {
                    await tx.classSession.updateMany({
                        where: {
                            classId: classId,
                            sessionDate: {
                                gte: effectiveDate,
                                lte: substituteEndDate,
                            },
                        },
                        data: {
                            teacherId: body.replacementTeacherId,
                            substituteTeacherId: classItem.teacherId,
                            substituteEndDate: substituteEndDate,
                        },
                    });
                }
                else {
                    await tx.classSession.updateMany({
                        where: {
                            classId: classId,
                            sessionDate: {
                                gte: effectiveDate,
                            },
                        },
                        data: {
                            teacherId: body.replacementTeacherId,
                            substituteTeacherId: null,
                            substituteEndDate: null,
                        },
                    });
                    await tx.class.update({
                        where: { id: classId },
                        data: {
                            teacherId: body.replacementTeacherId,
                        },
                    });
                }
                return transfer;
            });
            return {
                success: true,
                message: substituteEndDate
                    ? 'Chuyển giáo viên tạm thời thành công'
                    : 'Chuyển giáo viên thành công',
                data: result,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi chuyển giáo viên',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async validateTransferConflict(classId, params) {
        try {
            const { replacementTeacherId, effectiveDate, substituteEndDate } = params;
            const [classItem, teacher] = await Promise.all([
                this.prisma.class.findUnique({ where: { id: classId }, include: { subject: true } }),
                this.prisma.teacher.findUnique({ where: { id: replacementTeacherId }, include: { user: true } }),
            ]);
            if (!classItem) {
                throw new common_1.HttpException({ success: false, message: 'Không tìm thấy lớp học' }, common_1.HttpStatus.NOT_FOUND);
            }
            if (!teacher) {
                throw new common_1.HttpException({ success: false, message: 'Không tìm thấy giáo viên thay thế' }, common_1.HttpStatus.NOT_FOUND);
            }
            let incompatibleSubject = false;
            let subjectMessage = null;
            if (classItem.subjectId && classItem.subject?.name && Array.isArray(teacher.subjects)) {
                const canTeach = teacher.subjects.includes(classItem.subject.name);
                if (!canTeach) {
                    incompatibleSubject = true;
                    subjectMessage = `Giáo viên không thể dạy môn ${classItem.subject.name}`;
                }
            }
            if (teacher.user && teacher.user.isActive === false) {
                return {
                    success: true,
                    message: 'Giáo viên đang không hoạt động',
                    data: { hasConflict: true, conflicts: [], incompatibleSubject, subjectMessage, inactive: true },
                };
            }
            const startDate = effectiveDate ? new Date(effectiveDate) : new Date();
            const endDate = substituteEndDate ? new Date(substituteEndDate) : null;
            const classSessions = await this.prisma.classSession.findMany({
                where: {
                    classId: classId,
                    sessionDate: endDate
                        ? { gte: startDate, lte: endDate }
                        : { gte: startDate },
                },
                select: {
                    id: true,
                    sessionDate: true,
                    startTime: true,
                    endTime: true,
                },
                orderBy: { sessionDate: 'asc' },
            });
            if (classSessions.length === 0) {
                return {
                    success: true,
                    message: 'Không có buổi học trong khoảng thời gian áp dụng',
                    data: { hasConflict: false, conflicts: [], incompatibleSubject, subjectMessage },
                };
            }
            const conflicts = [];
            for (const s of classSessions) {
                const conflict = await this.prisma.classSession.findFirst({
                    where: {
                        sessionDate: s.sessionDate,
                        teacherId: replacementTeacherId,
                        OR: [
                            { AND: [{ startTime: { lte: s.startTime } }, { endTime: { gt: s.startTime } }] },
                            { AND: [{ startTime: { lt: s.endTime } }, { endTime: { gte: s.endTime } }] },
                            { AND: [{ startTime: { gte: s.startTime } }, { endTime: { lte: s.endTime } }] },
                        ],
                    },
                    select: { id: true, classId: true, startTime: true, endTime: true },
                });
                if (conflict) {
                    conflicts.push({
                        targetSessionId: s.id,
                        date: s.sessionDate,
                        targetStart: s.startTime,
                        targetEnd: s.endTime,
                        conflictSessionId: conflict.id,
                        conflictClassId: conflict.classId,
                        conflictStart: conflict.startTime,
                        conflictEnd: conflict.endTime,
                    });
                }
            }
            return {
                success: true,
                message: conflicts.length ? 'Phát hiện xung đột lịch' : 'Không có xung đột',
                data: { hasConflict: conflicts.length > 0, conflicts, incompatibleSubject, subjectMessage },
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({ success: false, message: 'Lỗi kiểm tra xung đột', error: error.message }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getTransferRequests(params) {
        try {
            const { status, classId, teacherId, page = 1, limit = 10, } = params;
            const where = {};
            if (status)
                where.status = status;
            if (classId)
                where.fromClassId = classId;
            if (teacherId)
                where.teacherId = teacherId;
            const skip = (page - 1) * limit;
            const [transfers, total] = await Promise.all([
                this.prisma.teacherClassTransfer.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        teacher: {
                            include: {
                                user: {
                                    select: {
                                        fullName: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                        replacementTeacher: {
                            include: {
                                user: {
                                    select: {
                                        fullName: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                        fromClass: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                }),
                this.prisma.teacherClassTransfer.count({ where }),
            ]);
            return {
                success: true,
                data: transfers,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
                message: 'Lấy danh sách yêu cầu chuyển giáo viên thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách yêu cầu chuyển giáo viên',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async approveTransfer(transferId, body, approvedBy) {
        try {
            const transfer = await this.prisma.teacherClassTransfer.findUnique({
                where: { id: transferId },
                include: {
                    fromClass: {
                        select: {
                            id: true,
                            teacherId: true,
                            name: true,
                        },
                    },
                    teacher: {
                        select: {
                            id: true,
                        },
                    },
                },
            });
            if (!transfer) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy yêu cầu chuyển giáo viên',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            if (transfer.status !== 'pending' && transfer.status !== 'auto_created') {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Yêu cầu này đã được xử lý',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const replacementTeacherId = body.replacementTeacherId || transfer.replacementTeacherId;
            if (!replacementTeacherId) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Chưa chọn giáo viên thay thế',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const substituteEndDate = body.substituteEndDate
                ? new Date(body.substituteEndDate)
                : transfer.substituteEndDate;
            if (substituteEndDate && transfer.effectiveDate) {
                if (substituteEndDate <= transfer.effectiveDate) {
                    throw new common_1.HttpException({
                        success: false,
                        message: 'Ngày kết thúc giáo viên thay thế phải sau ngày bắt đầu có hiệu lực',
                    }, common_1.HttpStatus.BAD_REQUEST);
                }
            }
            const result = await this.prisma.$transaction(async (tx) => {
                const updatedTransfer = await tx.teacherClassTransfer.update({
                    where: { id: transferId },
                    data: {
                        status: 'approved',
                        approvedBy: approvedBy,
                        approvedAt: new Date(),
                        replacementTeacherId: replacementTeacherId,
                        substituteEndDate: substituteEndDate,
                        notes: body.notes || transfer.notes,
                    },
                    include: {
                        teacher: {
                            include: {
                                user: {
                                    select: {
                                        fullName: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                        replacementTeacher: {
                            include: {
                                user: {
                                    select: {
                                        fullName: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                        fromClass: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                });
                const effectiveDate = transfer.effectiveDate
                    ? new Date(transfer.effectiveDate)
                    : new Date();
                if (substituteEndDate) {
                    await tx.classSession.updateMany({
                        where: {
                            classId: transfer.fromClassId,
                            sessionDate: {
                                gte: effectiveDate,
                                lte: substituteEndDate,
                            },
                            status: {
                                not: 'end',
                            },
                        },
                        data: {
                            teacherId: replacementTeacherId,
                            substituteTeacherId: transfer.teacherId,
                            substituteEndDate: substituteEndDate,
                        },
                    });
                }
                else {
                    await tx.classSession.updateMany({
                        where: {
                            classId: transfer.fromClassId,
                            sessionDate: {
                                gte: effectiveDate,
                            },
                            status: {
                                not: 'end',
                            },
                        },
                        data: {
                            teacherId: replacementTeacherId,
                        },
                    });
                    await tx.class.update({
                        where: { id: transfer.fromClassId },
                        data: {
                            teacherId: replacementTeacherId,
                        },
                    });
                }
                return updatedTransfer;
            });
            return {
                success: true,
                message: 'Yêu cầu chuyển giáo viên đã được duyệt thành công',
                data: result,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi duyệt yêu cầu chuyển giáo viên',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async rejectTransfer(transferId, body, rejectedBy) {
        try {
            const transfer = await this.prisma.teacherClassTransfer.findUnique({
                where: { id: transferId },
            });
            if (!transfer) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy yêu cầu chuyển giáo viên',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            if (transfer.status !== 'pending' && transfer.status !== 'auto_created') {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Yêu cầu này đã được xử lý',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const updatedTransfer = await this.prisma.teacherClassTransfer.update({
                where: { id: transferId },
                data: {
                    status: 'rejected',
                    approvedBy: rejectedBy,
                    approvedAt: new Date(),
                    notes: body.reason || body.notes || transfer.notes,
                },
                include: {
                    teacher: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    replacementTeacher: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    fromClass: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            return {
                success: true,
                message: 'Yêu cầu chuyển giáo viên đã bị từ chối',
                data: updatedTransfer,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi từ chối yêu cầu chuyển giáo viên',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getStats(classId) {
        try {
            const classItem = await this.prisma.class.findUnique({
                where: { id: classId },
                include: {
                    enrollments: {
                        select: {
                            status: true,
                        },
                    },
                },
            });
            if (!classItem) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy lớp học',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            const totalStudents = classItem.enrollments.length;
            const activeStudents = classItem.enrollments.filter((e) => e.status === 'not_been_updated' || e.status === 'studying').length;
            const completedStudents = classItem.enrollments.filter((e) => e.status === 'graduated').length;
            const withdrawnStudents = classItem.enrollments.filter((e) => e.status === 'stopped').length;
            return {
                success: true,
                message: 'Lấy thống kê thành công',
                data: {
                    totalStudents,
                    activeStudents,
                    completedStudents,
                    withdrawnStudents,
                    maxStudents: classItem.maxStudents,
                    availableSlots: classItem.maxStudents
                        ? classItem.maxStudents - activeStudents
                        : null,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy thống kê',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getDashboard(classId) {
        try {
            console.log(classId);
            const classItem = await this.prisma.class.findUnique({
                where: { id: classId },
                include: {
                    teacher: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    fullName: true,
                                },
                            },
                        },
                    },
                    enrollments: {
                        where: {
                            status: {
                                in: ['not_been_updated', 'studying', 'graduated'],
                            },
                        },
                        select: {
                            id: true,
                            status: true,
                            student: {
                                select: {
                                    id: true,
                                    user: {
                                        select: {
                                            fullName: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            if (!classItem) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy lớp học',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            const teachersCount = classItem.teacher ? 1 : 0;
            const studentsCount = classItem.enrollments.length;
            const completedSessions = await this.prisma.classSession.count({
                where: {
                    classId: classId,
                    status: 'end',
                },
            });
            const revenue = await this.prisma.payment.aggregate({
                where: {
                    status: 'completed',
                    feeRecordPayments: {
                        some: {
                            feeRecord: {
                                classId: classId,
                            },
                        },
                    },
                },
                _sum: {
                    amount: true,
                },
            });
            const attendanceStats = await this.prisma.studentSessionAttendance.groupBy({
                by: ['status'],
                where: {
                    session: {
                        classId: classId,
                    },
                },
                _count: {
                    status: true,
                },
            });
            const attendance = {
                onTime: attendanceStats.find((a) => a.status === 'present')?._count.status ||
                    0,
                late: 0,
                excusedAbsence: attendanceStats.find((a) => a.status === 'excused')?._count.status ||
                    0,
                unexcusedAbsence: attendanceStats.find((a) => a.status === 'absent')?._count.status ||
                    0,
                notMarked: 0,
            };
            const totalPossibleAttendances = completedSessions * studentsCount;
            const totalMarkedAttendances = attendance.onTime +
                attendance.late +
                attendance.excusedAbsence +
                attendance.unexcusedAbsence;
            attendance.notMarked = totalPossibleAttendances - totalMarkedAttendances;
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
                        notSubmitted: 0,
                    },
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy dashboard',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getClassByTeacherId(query, teacherId) {
        const { status, page = 1, limit = 10, search } = query;
        const where = {
            teacherId: teacherId,
            status: { not: 'deleted' },
        };
        if (status && status !== 'all') {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
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
                        enrollments: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const transformedClasses = classes.map((cls) => ({
            id: cls.id,
            code: cls.classCode,
            name: cls.name,
            subject: cls.subject?.name || '',
            students: cls._count.enrollments,
            schedule: transformer_1.DataTransformer.formatScheduleArray(cls.recurringSchedule),
            status: cls.status,
            startDate: cls.actualStartDate?.toISOString().split('T')[0] ||
                cls.expectedStartDate?.toISOString().split('T')[0] ||
                '',
            endDate: cls.actualEndDate?.toISOString().split('T')[0] || '',
            room: cls.room?.name || 'Chưa xác định',
            description: cls.description || '',
            teacherId: cls.teacherId,
            gradeName: cls.grade?.name || '',
            feeStructureName: cls.feeStructure?.name || '',
        }));
        return {
            data: transformedClasses,
            meta: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
            message: 'Lấy danh sách lớp học thành công ',
        };
    }
    async getClassDetail(id) {
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
                                avatar: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        enrollments: true,
                    },
                },
            },
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
            startDate: classItem.actualStartDate?.toISOString().split('T')[0] ||
                classItem.expectedStartDate?.toISOString().split('T')[0] ||
                '',
            endDate: classItem.actualEndDate?.toISOString().split('T')[0] || '',
            room: classItem.room?.name || 'Chưa xác định',
            description: classItem.description || '',
            teacherId: classItem.teacherId,
            teacherName: classItem.teacher?.user?.fullName || '',
            gradeName: classItem.grade?.name || '',
            feeStructureName: classItem.feeStructure?.name || '',
        };
    }
    async createClass(body) {
        return this.prisma.class.create({ data: body });
    }
    isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
    async checkTeacherScheduleConflict(teacherId, newClassId, newClassSchedule, newClassRoomId) {
        if (!newClassSchedule) {
            return { hasConflict: false, message: '' };
        }
        const assignedClasses = await this.prisma.class.findMany({
            where: {
                teacherId,
                status: { in: ['ready', 'active', 'suspended'] },
                id: { not: newClassId },
            },
            select: {
                id: true,
                name: true,
                classCode: true,
                recurringSchedule: true,
                roomId: true,
                subject: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        if (assignedClasses.length === 0) {
            return { hasConflict: false, message: '' };
        }
        const newSchedules = this.parseRecurringSchedule(newClassSchedule, newClassRoomId);
        if (newSchedules.length === 0) {
            return { hasConflict: false, message: '' };
        }
        const conflicts = [];
        for (const assignedClass of assignedClasses) {
            if (!assignedClass.recurringSchedule) {
                continue;
            }
            const assignedSchedules = this.parseRecurringSchedule(assignedClass.recurringSchedule, assignedClass.roomId);
            for (const newSchedule of newSchedules) {
                for (const assignedSchedule of assignedSchedules) {
                    if (this.normalizeDayOfWeek(newSchedule.day) === this.normalizeDayOfWeek(assignedSchedule.day)) {
                        if (this.isTimeOverlapping(newSchedule.startTime, newSchedule.endTime, assignedSchedule.startTime, assignedSchedule.endTime)) {
                            conflicts.push({
                                assignedClass: {
                                    id: assignedClass.id,
                                    name: assignedClass.name,
                                    classCode: assignedClass.classCode,
                                    subject: assignedClass.subject?.name || 'N/A',
                                },
                                conflictDay: this.getDayName(newSchedule.day),
                                conflictTime: `${newSchedule.startTime} - ${newSchedule.endTime}`,
                                assignedTime: `${assignedSchedule.startTime} - ${assignedSchedule.endTime}`,
                            });
                        }
                    }
                }
            }
        }
        if (conflicts.length > 0) {
            const conflictMessages = conflicts.map((c) => `Lớp "${c.assignedClass.name}" (${c.assignedClass.subject}) - ${c.conflictDay}: ${c.conflictTime}`);
            const message = `Lịch học của lớp này trùng với các lớp giáo viên đã được phân công:\n${conflictMessages.join('\n')}`;
            return {
                hasConflict: true,
                message,
                conflictDetails: conflicts,
            };
        }
        return { hasConflict: false, message: '' };
    }
    parseRecurringSchedule(schedule, classRoomId = null) {
        if (!schedule) {
            return [];
        }
        if (typeof schedule === 'object' && schedule.schedules && Array.isArray(schedule.schedules)) {
            return schedule.schedules.map((s) => ({
                day: s.day || s.dayOfWeek || '',
                startTime: s.startTime || '',
                endTime: s.endTime || '',
                roomId: s.roomId || classRoomId || null,
            }));
        }
        if (Array.isArray(schedule)) {
            return schedule.map((s) => ({
                day: s.day || s.dayOfWeek || '',
                startTime: s.startTime || '',
                endTime: s.endTime || '',
                roomId: s.roomId || classRoomId || null,
            }));
        }
        return [];
    }
    normalizeDayOfWeek(day) {
        if (!day)
            return '';
        return day.toLowerCase().trim();
    }
    isTimeOverlapping(start1, end1, start2, end2) {
        const toMinutes = (time) => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + (minutes || 0);
        };
        const start1Min = toMinutes(start1);
        const end1Min = toMinutes(end1);
        const start2Min = toMinutes(start2);
        const end2Min = toMinutes(end2);
        return start1Min < end2Min && end1Min > start2Min;
    }
    getDayName(day) {
        const dayNames = {
            monday: 'Thứ Hai',
            tuesday: 'Thứ Ba',
            wednesday: 'Thứ Tư',
            thursday: 'Thứ Năm',
            friday: 'Thứ Sáu',
            saturday: 'Thứ Bảy',
            sunday: 'Chủ Nhật',
        };
        const normalizedDay = this.normalizeDayOfWeek(day);
        return dayNames[normalizedDay] || day;
    }
};
exports.ClassManagementService = ClassManagementService;
exports.ClassManagementService = ClassManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_queue_service_1.EmailQueueService,
        email_notification_service_1.EmailNotificationService])
], ClassManagementService);
//# sourceMappingURL=class-management.service.js.map