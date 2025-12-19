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
exports.EnrollmentManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
const email_notification_service_1 = require("../../shared/services/email-notification.service");
let EnrollmentManagementService = class EnrollmentManagementService {
    constructor(prisma, emailNotificationService) {
        this.prisma = prisma;
        this.emailNotificationService = emailNotificationService;
    }
    async checkScheduleConflicts(studentId, newClassSchedule, excludeClassId) {
        const normalizedNewSchedules = this.normalizeScheduleEntries(newClassSchedule);
        if (normalizedNewSchedules.length === 0) {
            return [];
        }
        const whereClause = {
            studentId,
            status: {
                in: ['studying'],
            },
        };
        if (excludeClassId) {
            whereClause.classId = {
                not: excludeClassId,
            };
        }
        const studentActiveEnrollments = await this.prisma.enrollment.findMany({
            where: whereClause,
            include: {
                class: {
                    select: {
                        id: true,
                        name: true,
                        recurringSchedule: true,
                    },
                },
            },
        });
        const conflicts = [];
        for (const activeEnrollment of studentActiveEnrollments) {
            const normalizedActiveSchedules = this.normalizeScheduleEntries(activeEnrollment.class.recurringSchedule);
            if (normalizedActiveSchedules.length === 0) {
                continue;
            }
            for (const newSchedule of normalizedNewSchedules) {
                for (const activeSchedule of normalizedActiveSchedules) {
                    if (newSchedule.dayKey !== activeSchedule.dayKey) {
                        continue;
                    }
                    if (this.areTimeRangesOverlapping(newSchedule.startTime, newSchedule.endTime, activeSchedule.startTime, activeSchedule.endTime)) {
                        conflicts.push({
                            classId: activeEnrollment.class.id,
                            className: activeEnrollment.class.name,
                            dayOfWeek: newSchedule.dayLabel,
                            newClassTime: `${newSchedule.startTime} - ${newSchedule.endTime}`,
                            conflictingClassTime: `${activeSchedule.startTime} - ${activeSchedule.endTime}`,
                        });
                    }
                }
            }
        }
        return conflicts;
    }
    normalizeScheduleEntries(schedule) {
        const rawItems = this.parseScheduleInput(schedule);
        const normalized = [];
        for (const item of rawItems) {
            const dayValue = item?.day ??
                item?.dayOfWeek ??
                item?.day_of_week ??
                item?.weekday ??
                item?.weekDay ??
                item?.dayIndex ??
                item?.dayindex;
            const normalizedDay = this.normalizeScheduleDay(dayValue);
            if (!normalizedDay) {
                continue;
            }
            const startTime = this.extractScheduleTime(item, 'start');
            const endTime = this.extractScheduleTime(item, 'end');
            if (!startTime || !endTime) {
                continue;
            }
            normalized.push({
                dayKey: normalizedDay,
                dayLabel: this.getDayLabelFromKey(normalizedDay),
                startTime,
                endTime,
            });
        }
        return normalized;
    }
    parseScheduleInput(input) {
        if (!input) {
            return [];
        }
        let schedule = input;
        if (typeof schedule === 'string') {
            try {
                schedule = JSON.parse(schedule);
            }
            catch (error) {
                return [];
            }
        }
        if (Array.isArray(schedule)) {
            return schedule;
        }
        const candidateKeys = ['schedules', 'schedule', 'items', 'slots'];
        for (const key of candidateKeys) {
            if (Array.isArray(schedule?.[key])) {
                return schedule[key];
            }
        }
        return [];
    }
    normalizeScheduleDay(day) {
        if (day === null || day === undefined) {
            return '';
        }
        const normalizedDays = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
        ];
        const normalizedDaySet = new Set(normalizedDays);
        const numericDayMap = {
            0: 'sunday',
            1: 'sunday',
            2: 'monday',
            3: 'tuesday',
            4: 'wednesday',
            5: 'thursday',
            6: 'friday',
            7: 'saturday',
            8: 'sunday',
        };
        if (typeof day === 'number' && Number.isFinite(day)) {
            if (numericDayMap[day] !== undefined) {
                return numericDayMap[day];
            }
            const fallbackIndex = ((day % 7) + 7) % 7;
            return normalizedDays[fallbackIndex] ?? '';
        }
        let normalized = String(day).toLowerCase().trim();
        if (!normalized) {
            return '';
        }
        normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const compact = normalized.replace(/[^a-z0-9]/g, '');
        const aliasMap = {
            sunday: 'sunday',
            chunhat: 'sunday',
            chuanhat: 'sunday',
            cn: 'sunday',
            monday: 'monday',
            thu2: 'monday',
            thuhai: 'monday',
            t2: 'monday',
            tuesday: 'tuesday',
            thu3: 'tuesday',
            thuba: 'tuesday',
            t3: 'tuesday',
            wednesday: 'wednesday',
            thu4: 'wednesday',
            thutu: 'wednesday',
            t4: 'wednesday',
            thursday: 'thursday',
            thu5: 'thursday',
            thunam: 'thursday',
            t5: 'thursday',
            friday: 'friday',
            thu6: 'friday',
            thusau: 'friday',
            t6: 'friday',
            saturday: 'saturday',
            thu7: 'saturday',
            thubay: 'saturday',
            t7: 'saturday',
        };
        if (aliasMap[compact]) {
            return aliasMap[compact];
        }
        const thuPattern = /^(thu|t)(\d)$/;
        const thuMatch = compact.match(thuPattern);
        if (thuMatch) {
            const number = parseInt(thuMatch[2], 10);
            if (number >= 2 && number <= 7) {
                return normalizedDays[number - 1];
            }
            if (number === 8 || number === 0 || number === 1) {
                return 'sunday';
            }
        }
        if (normalizedDaySet.has(compact)) {
            return compact;
        }
        const numericCompact = parseInt(compact, 10);
        if (!Number.isNaN(numericCompact)) {
            if (numericDayMap[numericCompact] !== undefined) {
                return numericDayMap[numericCompact];
            }
            const fallbackIndex = ((numericCompact % 7) + 7) % 7;
            return normalizedDays[fallbackIndex] ?? '';
        }
        if (normalizedDaySet.has(normalized)) {
            return normalized;
        }
        return '';
    }
    extractScheduleTime(schedule, type) {
        const candidateKeys = type === 'start'
            ? ['startTime', 'start_time', 'start', 'from', 'fromTime']
            : ['endTime', 'end_time', 'end', 'to', 'toTime'];
        for (const key of candidateKeys) {
            const value = schedule?.[key];
            if (typeof value === 'string' && value.trim()) {
                return value.trim();
            }
        }
        return '';
    }
    getDayLabelFromKey(day) {
        const dayLabels = {
            monday: 'Thứ Hai',
            tuesday: 'Thứ Ba',
            wednesday: 'Thứ Tư',
            thursday: 'Thứ Năm',
            friday: 'Thứ Sáu',
            saturday: 'Thứ Bảy',
            sunday: 'Chủ Nhật',
        };
        return dayLabels[day] || day;
    }
    areTimeRangesOverlapping(startA, endA, startB, endB) {
        const startAMin = this.convertTimeStringToMinutes(startA);
        const endAMin = this.convertTimeStringToMinutes(endA);
        const startBMin = this.convertTimeStringToMinutes(startB);
        const endBMin = this.convertTimeStringToMinutes(endB);
        if (startAMin === null ||
            endAMin === null ||
            startBMin === null ||
            endBMin === null) {
            return false;
        }
        return startAMin < endBMin && startBMin < endAMin;
    }
    convertTimeStringToMinutes(time) {
        if (!time) {
            return null;
        }
        const parts = time.split(':');
        if (parts.length < 2) {
            return null;
        }
        const hours = Number(parts[0]);
        const minutes = Number(parts[1]);
        if (Number.isNaN(hours) || Number.isNaN(minutes)) {
            return null;
        }
        return hours * 60 + minutes;
    }
    async create(body) {
        try {
            if (!body.studentId || !body.classId) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'studentId và classId là bắt buộc',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const student = await this.prisma.student.findUnique({
                where: { id: body.studentId },
                include: {
                    user: {
                        select: {
                            isActive: true,
                        },
                    },
                },
            });
            if (!student) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy học sinh',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            if (!student.user.isActive) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Tài khoản học sinh chưa được kích hoạt',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const classItem = await this.prisma.class.findUnique({
                where: { id: body.classId },
                select: {
                    id: true,
                    name: true,
                    maxStudents: true,
                    recurringSchedule: true,
                },
            });
            if (!classItem) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy lớp học',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            const existingEnrollment = await this.prisma.enrollment.findFirst({
                where: {
                    studentId: body.studentId,
                    classId: body.classId,
                    status: {
                        notIn: ['stopped', 'graduated'],
                    },
                },
            });
            if (existingEnrollment) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Học sinh đã được đăng ký vào lớp này',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const activeEnrollments = await this.prisma.enrollment.count({
                where: {
                    classId: body.classId,
                    status: {
                        notIn: ['stopped', 'graduated'],
                    },
                },
            });
            if (classItem.maxStudents && activeEnrollments >= classItem.maxStudents) {
                throw new common_1.HttpException({
                    success: false,
                    message: `Lớp đã đầy (${activeEnrollments}/${classItem.maxStudents})`,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const scheduleConflicts = await this.checkScheduleConflicts(body.studentId, classItem.recurringSchedule);
            if (scheduleConflicts.length > 0) {
                const conflictMessages = scheduleConflicts
                    .map((c) => `Lớp "${c.className}" - Thứ ${c.dayOfWeek}: ${c.conflictingClassTime} trùng với ${c.newClassTime}`)
                    .join('; ');
                throw new common_1.HttpException({
                    success: false,
                    message: `Lịch học bị trùng: ${conflictMessages}`,
                    conflicts: scheduleConflicts,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const enrollmentStatus = 'studying';
            const enrollment = await this.prisma.enrollment.create({
                data: {
                    studentId: body.studentId,
                    classId: body.classId,
                    semester: body.semester || null,
                    status: enrollmentStatus,
                },
                include: {
                    student: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    class: {
                        include: {
                            subject: true,
                        },
                    },
                },
            });
            return {
                success: true,
                message: 'Đăng ký học sinh thành công.',
                data: enrollment,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi đăng ký học sinh',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async bulkEnroll(body) {
        try {
            if (!body.studentIds ||
                !Array.isArray(body.studentIds) ||
                body.studentIds.length === 0) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'studentIds phải là mảng và không được rỗng',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (!body.classId) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'classId là bắt buộc',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const classItem = await this.prisma.class.findUnique({
                where: { id: body.classId },
                select: {
                    id: true,
                    name: true,
                    maxStudents: true,
                    recurringSchedule: true,
                },
            });
            if (!classItem) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy lớp học',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            if (!body.overrideCapacity) {
                const activeEnrollments = await this.prisma.enrollment.count({
                    where: {
                        classId: body.classId,
                        status: {
                            notIn: ['stopped', 'graduated'],
                        },
                    },
                });
                const availableSlots = classItem.maxStudents
                    ? classItem.maxStudents - activeEnrollments
                    : 999999;
                if (body.studentIds.length > availableSlots) {
                    throw new common_1.HttpException({
                        success: false,
                        message: `Không đủ chỗ. Chỉ còn ${availableSlots} chỗ trống`,
                    }, common_1.HttpStatus.BAD_REQUEST);
                }
            }
            const enrollmentStatus = 'studying';
            const results = {
                success: [],
                failed: [],
            };
            for (const studentId of body.studentIds) {
                try {
                    const student = await this.prisma.student.findUnique({
                        where: { id: studentId },
                        include: {
                            user: {
                                select: {
                                    isActive: true,
                                },
                            },
                        },
                    });
                    if (!student) {
                        results.failed.push({
                            studentId,
                            reason: 'Không tìm thấy học sinh',
                        });
                        continue;
                    }
                    if (!student.user.isActive) {
                        results.failed.push({
                            studentId,
                            reason: 'Tài khoản học sinh không hợp lệ',
                        });
                        continue;
                    }
                    const existingEnrollment = await this.prisma.enrollment.findFirst({
                        where: {
                            studentId,
                            classId: body.classId,
                            status: {
                                notIn: ['stopped', 'graduated'],
                            },
                        },
                    });
                    if (existingEnrollment) {
                        results.failed.push({
                            studentId,
                            reason: 'Đã được đăng ký vào lớp này',
                        });
                        continue;
                    }
                    const scheduleConflicts = await this.checkScheduleConflicts(studentId, classItem.recurringSchedule);
                    if (scheduleConflicts.length > 0) {
                        const conflictMessages = scheduleConflicts
                            .map((c) => `Lớp "${c.className}" - Thứ ${c.dayOfWeek}: ${c.conflictingClassTime} trùng với ${c.newClassTime}`)
                            .join('; ');
                        results.failed.push({
                            studentId,
                            reason: `Lịch học bị trùng: ${conflictMessages}`,
                        });
                        continue;
                    }
                    const enrollment = await this.prisma.enrollment.create({
                        data: {
                            studentId,
                            classId: body.classId,
                            semester: body.semester || null,
                            status: enrollmentStatus,
                        },
                    });
                    results.success.push({
                        studentId,
                        enrollmentId: enrollment.id,
                    });
                }
                catch (error) {
                    results.failed.push({
                        studentId,
                        reason: error.message,
                    });
                }
            }
            const successStudentIds = results.success.map((r) => r.studentId);
            if (successStudentIds.length > 0) {
                this.emailNotificationService
                    .sendBulkEnrollmentEmail(successStudentIds, body.classId)
                    .catch((error) => {
                    console.error('❌ Lỗi khi gửi email thông báo đăng ký:', error.message);
                });
            }
            return {
                success: true,
                message: `Đăng ký thành công ${results.success.length}/${body.studentIds.length} học sinh.`,
                data: results,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi đăng ký nhiều học sinh',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findAll(query) {
        try {
            const { classId, studentId, status, semester, page = 1, limit = 10, } = query;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const take = parseInt(limit);
            const where = {};
            if (classId)
                where.classId = classId;
            if (studentId)
                where.studentId = studentId;
            if (status)
                where.status = status;
            if (semester)
                where.semester = semester;
            const total = await this.prisma.enrollment.count({ where });
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
                                    phone: true,
                                },
                            },
                        },
                    },
                    class: {
                        include: {
                            subject: true,
                            room: true,
                        },
                    },
                },
                orderBy: { enrolledAt: 'desc' },
            });
            return {
                success: true,
                message: 'Lấy danh sách enrollment thành công',
                data: enrollments,
                meta: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách enrollment',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findByClass(classId, query = {}) {
        try {
            const { search, page = 1, limit = 50 } = query;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const take = parseInt(limit);
            const where = {
                classId,
                status: {
                    not: 'withdrawn',
                },
            };
            if (search) {
                where.student = {
                    OR: [
                        { user: { fullName: { contains: search, mode: 'insensitive' } } },
                        { user: { email: { contains: search, mode: 'insensitive' } } },
                        { user: { phone: { contains: search, mode: 'insensitive' } } },
                        { studentCode: { contains: search, mode: 'insensitive' } },
                        {
                            parent: {
                                user: { fullName: { contains: search, mode: 'insensitive' } },
                            },
                        },
                        {
                            parent: {
                                user: { email: { contains: search, mode: 'insensitive' } },
                            },
                        },
                        {
                            parent: {
                                user: { phone: { contains: search, mode: 'insensitive' } },
                            },
                        },
                    ],
                };
            }
            const total = await this.prisma.enrollment.count({ where });
            const classInfo = await this.prisma.class.findUnique({
                where: { id: classId },
                select: {
                    actualEndDate: true,
                    expectedStartDate: true,
                    subjectId: true,
                },
            });
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
                                },
                            },
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    email: true,
                                    phone: true,
                                    isActive: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                    contractUploads: {
                        select: {
                            id: true,
                            uploadedAt: true,
                            status: true,
                            subjectIds: true,
                        },
                        where: {
                            status: {
                                in: ['active'],
                            },
                        },
                        orderBy: {
                            uploadedAt: 'desc',
                        },
                    },
                },
                orderBy: { enrolledAt: 'desc' },
            });
            const enrollmentsWithStats = await Promise.all(enrollments.map(async (enrollment) => {
                const totalSessions = await this.prisma.classSession.count({
                    where: {
                        classId: classId,
                        sessionDate: {
                            gte: enrollment.enrolledAt,
                            lte: endDate,
                        },
                    },
                });
                const attendedSessions = await this.prisma.studentSessionAttendance.count({
                    where: {
                        studentId: enrollment.studentId,
                        session: {
                            classId: classId,
                            sessionDate: {
                                gte: enrollment.enrolledAt,
                                lte: endDate,
                            },
                        },
                        status: 'present',
                    },
                });
                let hasValidContract = false;
                if (enrollment.contractUploads &&
                    enrollment.contractUploads.length > 0 &&
                    classInfo?.subjectId) {
                    for (const contract of enrollment.contractUploads) {
                        if (contract.subjectIds &&
                            Array.isArray(contract.subjectIds) &&
                            contract.subjectIds.includes(classInfo.subjectId)) {
                            hasValidContract = true;
                            break;
                        }
                    }
                }
                return {
                    ...enrollment,
                    classesRegistered: totalSessions,
                    classesAttended: attendedSessions,
                    hasContract: hasValidContract,
                };
            }));
            return {
                success: true,
                message: 'Lấy danh sách học sinh thành công',
                data: enrollmentsWithStats,
                meta: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách học sinh',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findByStudent(studentId) {
        try {
            const enrollments = await this.prisma.enrollment.findMany({
                where: { studentId },
                include: {
                    class: {
                        include: {
                            subject: true,
                            room: true,
                        },
                    },
                },
                orderBy: { enrolledAt: 'desc' },
            });
            return {
                success: true,
                message: 'Lấy lịch sử enrollment thành công',
                data: enrollments,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy lịch sử enrollment',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateStatus(id, body) {
        try {
            if (!body.status) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'status là bắt buộc',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const enrollment = await this.prisma.enrollment.findUnique({
                where: { id: parseInt(id) },
                include: {
                    class: {
                        select: {
                            id: true,
                            name: true,
                            status: true,
                            teacherId: true,
                        },
                    },
                    student: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    id: true,
                                    isActive: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!enrollment) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy enrollment',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            if (!enrollment.class) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Lớp học không tồn tại',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (enrollment.class.status === 'cancelled' ||
                enrollment.class.status === 'withdrawn') {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không thể thay đổi trạng thái học sinh trong lớp đã hủy hoặc đã chuyển lớp',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (body.status === 'studying' && !enrollment.class.teacherId) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Lớp học chưa có giáo viên, không thể chuyển học sinh sang trạng thái đang học',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (body.status === 'studying' &&
                !['active', 'ready'].includes(enrollment.class.status)) {
                throw new common_1.HttpException({
                    success: false,
                    message: `Không thể chuyển học sinh sang trạng thái đang học khi lớp ở trạng thái ${enrollment.class.status}`,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (body.status === 'studying' && !enrollment.student.user.isActive) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không thể chuyển học sinh sang trạng thái đang học vì tài khoản học sinh đang không hoạt động',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const updatedEnrollment = await this.prisma.enrollment.update({
                where: { id: parseInt(id) },
                data: {
                    status: body.status,
                    ...(body.status === 'graduated' && {
                        completedAt: new Date(),
                    }),
                    ...(body.status === 'stopped' && {
                        completionNotes: body.completionNotes || 'Dừng học',
                    }),
                },
            });
            return {
                success: true,
                message: 'Cập nhật trạng thái thành công',
                data: updatedEnrollment,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi cập nhật trạng thái',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async transfer(id, body) {
        try {
            if (!body.newClassId) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'newClassId là bắt buộc',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const enrollment = await this.prisma.enrollment.findUnique({
                where: { id: parseInt(id) },
                include: {
                    class: true,
                    student: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                },
                            },
                            parent: {
                                include: {
                                    user: {
                                        select: {
                                            email: true,
                                            fullName: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            if (!enrollment) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy enrollment',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            const newClass = await this.prisma.class.findUnique({
                where: { id: body.newClassId },
                include: {
                    subject: true,
                },
            });
            if (!newClass) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy lớp mới',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            const newClassEnrollments = await this.prisma.enrollment.count({
                where: {
                    classId: body.newClassId,
                    status: {
                        notIn: ['stopped', 'graduated'],
                    },
                },
            });
            if (newClass.maxStudents && newClassEnrollments >= newClass.maxStudents) {
                throw new common_1.HttpException({
                    success: false,
                    message: `Lớp mới đã đầy (${newClassEnrollments}/${newClass.maxStudents})`,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const existingEnrollment = await this.prisma.enrollment.findFirst({
                where: {
                    studentId: enrollment.studentId,
                    classId: body.newClassId,
                    status: {
                        notIn: ['stopped', 'graduated'],
                    },
                },
            });
            if (existingEnrollment) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Học sinh đã được đăng ký vào lớp mới',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const scheduleConflicts = await this.checkScheduleConflicts(enrollment.studentId, newClass.recurringSchedule, enrollment.classId);
            if (scheduleConflicts.length > 0) {
                const conflictMessages = scheduleConflicts
                    .map((c) => `Lớp "${c.className}" - Thứ ${c.dayOfWeek}: ${c.conflictingClassTime} trùng với ${c.newClassTime}`)
                    .join('; ');
                throw new common_1.HttpException({
                    success: false,
                    message: `Lịch học bị trùng: ${conflictMessages}`,
                    conflicts: scheduleConflicts,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const shouldDeleteOldEnrollment = enrollment.class?.status === 'ready';
            if (shouldDeleteOldEnrollment) {
                await this.prisma.enrollment.delete({
                    where: { id: parseInt(id) },
                });
            }
            else {
                await this.prisma.enrollment.update({
                    where: { id: parseInt(id) },
                    data: {
                        status: 'withdrawn',
                        completionNotes: body.reason || 'Chuyển lớp',
                    },
                });
            }
            const newEnrollment = await this.prisma.enrollment.create({
                data: {
                    studentId: enrollment.studentId,
                    classId: body.newClassId,
                    semester: body.semester || enrollment.semester,
                    status: 'studying',
                },
            });
            const parentEmail = enrollment.student?.parent?.user?.email;
            const parentName = enrollment.student?.parent?.user?.fullName || 'Quý phụ huynh';
            const studentName = enrollment.student?.user?.fullName || 'N/A';
            const oldClassName = enrollment.class?.name || 'N/A';
            const newClassName = newClass.name || 'N/A';
            if (parentEmail) {
                this.emailNotificationService
                    .sendBulkEnrollmentEmail([enrollment.studentId], body.newClassId, {
                    oldClassId: enrollment.classId,
                    reason: body.reason || 'Chuyển lớp',
                })
                    .catch((error) => {
                    console.error('❌ Lỗi khi gửi email thông báo chuyển lớp:', error.message);
                });
                console.log(`Đã queue email chuyển lớp:\n` +
                    `   - Phụ huynh: ${parentName} (${parentEmail})\n` +
                    `   - Học sinh: ${studentName}\n` +
                    `   - Từ lớp: ${oldClassName}\n` +
                    `   - Sang lớp: ${newClassName}\n` +
                    `   - Lý do: ${body.reason || 'Chuyển lớp'}`);
            }
            else {
                console.warn(`⚠️ Không tìm thấy email phụ huynh cho học sinh ${studentName}`);
            }
            return {
                success: true,
                message: 'Chuyển lớp thành công',
                data: {
                    oldEnrollment: enrollment,
                    newEnrollment,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi chuyển lớp',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async delete(id) {
        try {
            const enrollment = await this.prisma.enrollment.findUnique({
                where: { id: parseInt(id) },
            });
            if (!enrollment) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy enrollment',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            await this.prisma.enrollment.delete({
                where: { id: parseInt(id) },
            });
            return {
                success: true,
                message: 'Xóa enrollment thành công',
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi xóa enrollment',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async checkCapacity(classId) {
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
            const activeEnrollments = await this.prisma.enrollment.count({
                where: {
                    classId,
                    status: {
                        notIn: ['stopped', 'graduated'],
                    },
                },
            });
            const availableSlots = classItem.maxStudents
                ? classItem.maxStudents - activeEnrollments
                : null;
            return {
                success: true,
                message: 'Kiểm tra capacity thành công',
                data: {
                    maxStudents: classItem.maxStudents,
                    currentStudents: activeEnrollments,
                    availableSlots,
                    isFull: classItem.maxStudents
                        ? activeEnrollments >= classItem.maxStudents
                        : false,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi kiểm tra capacity',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAvailableStudents(classId, query = {}) {
        try {
            const { search, page = 1, limit = 10 } = query;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const take = parseInt(limit);
            const classItem = await this.prisma.class.findUnique({
                where: { id: classId },
            });
            if (!classItem) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy lớp học',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            const enrolledStudentIds = await this.prisma.enrollment.findMany({
                where: {
                    classId,
                    status: {
                        notIn: ['stopped', 'graduated', 'withdrawn'],
                    },
                },
                select: {
                    studentId: true,
                },
            });
            const pendingRequestStudentIds = await this.prisma.studentClassRequest.findMany({
                where: {
                    classId,
                    status: 'pending',
                },
                select: {
                    studentId: true,
                },
            });
            const enrolledIds = enrolledStudentIds.map((e) => e.studentId);
            const pendingIds = pendingRequestStudentIds.map((r) => r.studentId);
            const excludedIds = [...enrolledIds, ...pendingIds];
            const where = {
                id: {
                    notIn: excludedIds,
                },
                user: {
                    isActive: true,
                },
            };
            if (search && search.trim()) {
                where.OR = [
                    {
                        user: {
                            fullName: { contains: search.trim(), mode: 'insensitive' },
                        },
                    },
                    { user: { email: { contains: search.trim(), mode: 'insensitive' } } },
                    { user: { phone: { contains: search.trim() } } },
                    { studentCode: { contains: search.trim(), mode: 'insensitive' } },
                ];
            }
            const total = await this.prisma.student.count({ where });
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
                            isActive: true,
                        },
                    },
                    parent: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                    email: true,
                                    phone: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            return {
                success: true,
                message: 'Lấy danh sách học sinh chưa enroll thành công',
                data: students,
                meta: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách học sinh',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.EnrollmentManagementService = EnrollmentManagementService;
exports.EnrollmentManagementService = EnrollmentManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_notification_service_1.EmailNotificationService])
], EnrollmentManagementService);
//# sourceMappingURL=enrollment-management.service.js.map