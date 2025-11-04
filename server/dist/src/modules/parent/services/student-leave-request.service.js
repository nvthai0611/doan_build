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
exports.StudentLeaveRequestService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
const validate_util_1 = require("../../../utils/validate.util");
let StudentLeaveRequestService = class StudentLeaveRequestService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStudentLeaveRequests(parentUserId, query) {
        if (!parentUserId || !(0, validate_util_1.checkId)(parentUserId)) {
            throw new common_1.HttpException('ID phụ huynh không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        const parent = await this.prisma.parent.findUnique({
            where: { userId: parentUserId },
            include: {
                students: true,
            },
        });
        if (!parent) {
            throw new common_1.HttpException('Không tìm thấy thông tin phụ huynh', common_1.HttpStatus.NOT_FOUND);
        }
        const studentIds = parent.students.map((s) => s.id);
        if (studentIds.length === 0) {
            return {
                data: [],
                meta: {
                    total: 0,
                    page: query.page || 1,
                    limit: query.limit || 10,
                    totalPages: 0,
                },
            };
        }
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const where = {
            studentId: query.studentId || { in: studentIds },
            requestType: 'student_leave',
        };
        if (query.status) {
            where.status = query.status;
        }
        if (query.classId) {
            const classSessionIds = await this.prisma.classSession.findMany({
                where: { classId: query.classId },
                select: { id: true },
            });
            const sessionIds = classSessionIds.map((s) => s.id);
            where.affectedSessions = {
                some: {
                    sessionId: { in: sessionIds },
                },
            };
        }
        const [total, leaveRequests, pendingCount, approvedCount, rejectedCount, cancelledCount, allCount] = await Promise.all([
            this.prisma.leaveRequest.count({ where }),
            this.prisma.leaveRequest.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
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
                    affectedSessions: {
                        include: {
                            session: {
                                include: {
                                    class: {
                                        include: {
                                            subject: true,
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
                                        },
                                    },
                                    room: true,
                                },
                            },
                        },
                    },
                    approvedByUser: {
                        select: {
                            fullName: true,
                            email: true,
                        },
                    },
                },
            }),
            this.prisma.leaveRequest.count({
                where: { ...where, status: 'pending' },
            }),
            this.prisma.leaveRequest.count({
                where: { ...where, status: 'approved' },
            }),
            this.prisma.leaveRequest.count({
                where: { ...where, status: 'rejected' },
            }),
            this.prisma.leaveRequest.count({
                where: { ...where, status: 'cancelled' },
            }),
            this.prisma.leaveRequest.count({
                where,
            }),
        ]);
        const data = leaveRequests.map((request) => {
            const affectedClasses = new Map();
            for (const affectedSession of request.affectedSessions) {
                const classData = affectedSession?.session?.class;
                if (classData && !affectedClasses.has(classData.id)) {
                    affectedClasses.set(classData.id, {
                        id: classData.id,
                        name: classData.name,
                        subject: classData.subject,
                        teacher: classData.teacher
                            ? {
                                id: classData.teacher.id,
                                user: classData.teacher.user,
                            }
                            : null,
                    });
                }
            }
            return {
                ...request,
                classes: Array.from(affectedClasses.values()),
            };
        });
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            counts: {
                pending: pendingCount,
                approved: approvedCount,
                rejected: rejectedCount,
                cancelled: cancelledCount,
                all: allCount,
            },
        };
    }
    async getStudentLeaveRequestById(parentUserId, leaveRequestId) {
        if (!parentUserId || !(0, validate_util_1.checkId)(parentUserId)) {
            throw new common_1.HttpException('ID phụ huynh không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!leaveRequestId || !(0, validate_util_1.checkId)(leaveRequestId)) {
            throw new common_1.HttpException('ID đơn nghỉ học không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        const parent = await this.prisma.parent.findUnique({
            where: { userId: parentUserId },
            include: { students: true },
        });
        if (!parent) {
            throw new common_1.HttpException('Không tìm thấy thông tin phụ huynh', common_1.HttpStatus.NOT_FOUND);
        }
        const leaveRequest = await this.prisma.leaveRequest.findUnique({
            where: { id: leaveRequestId },
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
                affectedSessions: {
                    include: {
                        session: {
                            include: {
                                class: {
                                    include: {
                                        subject: true,
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
                                    },
                                },
                                room: true,
                            },
                        },
                    },
                },
                approvedByUser: {
                    select: {
                        fullName: true,
                        email: true,
                    },
                },
            },
        });
        if (!leaveRequest) {
            throw new common_1.HttpException('Không tìm thấy đơn nghỉ học', common_1.HttpStatus.NOT_FOUND);
        }
        const studentIds = parent.students.map((s) => s.id);
        if (!studentIds.includes(leaveRequest.studentId)) {
            throw new common_1.HttpException('Không có quyền truy cập', common_1.HttpStatus.FORBIDDEN);
        }
        const affectedClasses = new Map();
        for (const affectedSession of leaveRequest.affectedSessions) {
            const classData = affectedSession?.session?.class;
            if (classData && !affectedClasses.has(classData.id)) {
                affectedClasses.set(classData.id, {
                    id: classData.id,
                    name: classData.name,
                    subject: classData.subject,
                    teacher: classData.teacher
                        ? {
                            id: classData.teacher.id,
                            user: classData.teacher.user,
                        }
                        : null,
                });
            }
        }
        return {
            ...leaveRequest,
            classes: Array.from(affectedClasses.values()),
        };
    }
    async createStudentLeaveRequest(parentUserId, dto) {
        if (!parentUserId || !(0, validate_util_1.checkId)(parentUserId)) {
            throw new common_1.HttpException('ID phụ huynh không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        const start = new Date(dto.startDate);
        const end = new Date(dto.endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new common_1.HttpException('Định dạng ngày không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        if (end < start) {
            throw new common_1.HttpException('Ngày kết thúc phải sau ngày bắt đầu', common_1.HttpStatus.BAD_REQUEST);
        }
        const parent = await this.prisma.parent.findUnique({
            where: { userId: parentUserId },
            include: { students: true },
        });
        if (!parent) {
            throw new common_1.HttpException('Không tìm thấy thông tin phụ huynh', common_1.HttpStatus.NOT_FOUND);
        }
        const studentIds = parent.students.map((s) => s.id);
        if (!studentIds.includes(dto.studentId)) {
            throw new common_1.HttpException('Không có quyền tạo đơn cho học sinh này', common_1.HttpStatus.FORBIDDEN);
        }
        const enrollments = await this.prisma.enrollment.findMany({
            where: {
                studentId: dto.studentId,
            },
            select: {
                classId: true,
            },
        });
        if (enrollments.length === 0) {
            throw new common_1.HttpException('Học sinh chưa ghi danh vào lớp học nào', common_1.HttpStatus.BAD_REQUEST);
        }
        const classIds = enrollments.map((e) => e.classId);
        const sessions = await this.prisma.classSession.findMany({
            where: {
                classId: { in: classIds },
                sessionDate: {
                    gte: start,
                    lte: end,
                },
                class: {
                    status: 'active',
                },
            },
            select: {
                id: true,
            },
        });
        const leaveRequest = await this.prisma.leaveRequest.create({
            data: {
                requestType: 'student_leave',
                studentId: dto.studentId,
                startDate: start,
                endDate: end,
                reason: dto.reason,
                status: 'pending',
                createdBy: parentUserId,
                notes: null,
                approvedAt: null,
                affectedSessions: {
                    create: sessions.map((session) => ({
                        sessionId: session.id,
                    })),
                },
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
                affectedSessions: {
                    include: {
                        session: {
                            include: {
                                class: {
                                    include: {
                                        subject: true,
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
                                    },
                                },
                                room: true,
                            },
                        },
                    },
                },
            },
        });
        const affectedClasses = new Map();
        for (const affectedSession of leaveRequest.affectedSessions) {
            const classData = affectedSession?.session?.class;
            if (classData && !affectedClasses.has(classData.id)) {
                affectedClasses.set(classData.id, {
                    id: classData.id,
                    name: classData.name,
                    subject: classData.subject,
                    teacher: classData.teacher
                        ? {
                            id: classData.teacher.id,
                            user: classData.teacher.user,
                        }
                        : null,
                });
            }
        }
        return {
            ...leaveRequest,
            classes: Array.from(affectedClasses.values()),
        };
    }
    async updateStudentLeaveRequest(parentUserId, leaveRequestId, dto) {
        if (!parentUserId || !(0, validate_util_1.checkId)(parentUserId)) {
            throw new common_1.HttpException('ID phụ huynh không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!leaveRequestId || !(0, validate_util_1.checkId)(leaveRequestId)) {
            throw new common_1.HttpException('ID đơn nghỉ học không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        const leaveRequest = await this.prisma.leaveRequest.findUnique({
            where: { id: leaveRequestId },
            include: {
                student: {
                    include: {
                        parent: true,
                    },
                },
                affectedSessions: {
                    include: {
                        session: true,
                    },
                },
            },
        });
        if (!leaveRequest) {
            throw new common_1.HttpException('Không tìm thấy đơn nghỉ học', common_1.HttpStatus.NOT_FOUND);
        }
        if (leaveRequest.student.parent.userId !== parentUserId) {
            throw new common_1.HttpException('Không có quyền sửa đơn này', common_1.HttpStatus.FORBIDDEN);
        }
        if (leaveRequest.status !== 'pending') {
            throw new common_1.HttpException('Chỉ có thể sửa đơn đang chờ duyệt', common_1.HttpStatus.BAD_REQUEST);
        }
        const enrollments = await this.prisma.enrollment.findMany({
            where: {
                studentId: leaveRequest.studentId,
            },
            select: {
                classId: true,
            },
        });
        if (enrollments.length === 0) {
            throw new common_1.HttpException('Học sinh chưa ghi danh vào lớp học nào', common_1.HttpStatus.BAD_REQUEST);
        }
        const classIds = enrollments.map((e) => e.classId);
        const newStartDate = dto.startDate ? new Date(dto.startDate) : leaveRequest.startDate;
        const newEndDate = dto.endDate ? new Date(dto.endDate) : leaveRequest.endDate;
        if (newEndDate < newStartDate) {
            throw new common_1.HttpException('Ngày kết thúc phải sau ngày bắt đầu', common_1.HttpStatus.BAD_REQUEST);
        }
        const oldStartDateStr = leaveRequest.startDate.toISOString().split('T')[0];
        const oldEndDateStr = leaveRequest.endDate.toISOString().split('T')[0];
        const newStartDateStr = newStartDate.toISOString().split('T')[0];
        const newEndDateStr = newEndDate.toISOString().split('T')[0];
        const datesChanged = oldStartDateStr !== newStartDateStr ||
            oldEndDateStr !== newEndDateStr;
        if (datesChanged) {
            await this.prisma.leaveRequestAffectedSession.deleteMany({
                where: { leaveRequestId },
            });
            const newSessions = await this.prisma.classSession.findMany({
                where: {
                    classId: { in: classIds },
                    sessionDate: {
                        gte: newStartDate,
                        lte: newEndDate,
                    },
                    class: {
                        status: 'active',
                    },
                },
                select: {
                    id: true,
                },
            });
            const updated = await this.prisma.leaveRequest.update({
                where: { id: leaveRequestId },
                data: {
                    startDate: newStartDate,
                    endDate: newEndDate,
                    reason: dto.reason || leaveRequest.reason,
                    affectedSessions: {
                        create: newSessions.map((session) => ({
                            sessionId: session.id,
                        })),
                    },
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
                    affectedSessions: {
                        include: {
                            session: {
                                include: {
                                    class: {
                                        include: {
                                            subject: true,
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
                                        },
                                    },
                                    room: true,
                                },
                            },
                        },
                    },
                },
            });
            const affectedClasses = new Map();
            for (const affectedSession of updated.affectedSessions) {
                const classData = affectedSession?.session?.class;
                if (classData && !affectedClasses.has(classData.id)) {
                    affectedClasses.set(classData.id, {
                        id: classData.id,
                        name: classData.name,
                        subject: classData.subject,
                        teacher: classData.teacher
                            ? {
                                id: classData.teacher.id,
                                user: classData.teacher.user,
                            }
                            : null,
                    });
                }
            }
            return {
                ...updated,
                classes: Array.from(affectedClasses.values()),
            };
        }
        else {
            const updated = await this.prisma.leaveRequest.update({
                where: { id: leaveRequestId },
                data: {
                    reason: dto.reason || leaveRequest.reason,
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
                    affectedSessions: {
                        include: {
                            session: {
                                include: {
                                    class: {
                                        include: {
                                            subject: true,
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
                                        },
                                    },
                                    room: true,
                                },
                            },
                        },
                    },
                },
            });
            const affectedClasses = new Map();
            for (const affectedSession of updated.affectedSessions) {
                const classData = affectedSession?.session?.class;
                if (classData && !affectedClasses.has(classData.id)) {
                    affectedClasses.set(classData.id, {
                        id: classData.id,
                        name: classData.name,
                        subject: classData.subject,
                        teacher: classData.teacher
                            ? {
                                id: classData.teacher.id,
                                user: classData.teacher.user,
                            }
                            : null,
                    });
                }
            }
            return {
                ...updated,
                classes: Array.from(affectedClasses.values()),
            };
        }
    }
    async cancelStudentLeaveRequest(parentUserId, leaveRequestId) {
        if (!parentUserId || !(0, validate_util_1.checkId)(parentUserId)) {
            throw new common_1.HttpException('ID phụ huynh không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!leaveRequestId || !(0, validate_util_1.checkId)(leaveRequestId)) {
            throw new common_1.HttpException('ID đơn nghỉ học không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        const leaveRequest = await this.prisma.leaveRequest.findUnique({
            where: { id: leaveRequestId },
            include: {
                student: {
                    include: {
                        parent: true,
                    },
                },
            },
        });
        if (!leaveRequest) {
            throw new common_1.HttpException('Không tìm thấy đơn nghỉ học', common_1.HttpStatus.NOT_FOUND);
        }
        if (leaveRequest.student.parent.userId !== parentUserId) {
            throw new common_1.HttpException('Không có quyền hủy đơn này', common_1.HttpStatus.FORBIDDEN);
        }
        if (leaveRequest.status !== 'pending') {
            throw new common_1.HttpException('Chỉ có thể hủy đơn đang chờ duyệt', common_1.HttpStatus.BAD_REQUEST);
        }
        await this.prisma.leaveRequest.update({
            where: { id: leaveRequestId },
            data: {
                status: 'cancelled',
            },
        });
        return { success: true };
    }
    async getChildClasses(parentUserId, studentId) {
        if (!parentUserId || !(0, validate_util_1.checkId)(parentUserId)) {
            throw new common_1.HttpException('ID phụ huynh không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!studentId || !(0, validate_util_1.checkId)(studentId)) {
            throw new common_1.HttpException('ID học sinh không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        const parent = await this.prisma.parent.findUnique({
            where: { userId: parentUserId },
            include: { students: true },
        });
        if (!parent) {
            throw new common_1.HttpException('Không tìm thấy thông tin phụ huynh', common_1.HttpStatus.NOT_FOUND);
        }
        const studentIds = parent.students.map((s) => s.id);
        if (!studentIds.includes(studentId)) {
            throw new common_1.HttpException('Không có quyền xem thông tin học sinh này', common_1.HttpStatus.FORBIDDEN);
        }
        const enrollments = await this.prisma.enrollment.findMany({
            where: {
                studentId,
            },
        });
        if (enrollments.length === 0) {
            return [];
        }
        const classIds = enrollments.map((e) => e.classId);
        const classes = await this.prisma.class.findMany({
            where: {
                id: { in: classIds },
                status: 'active',
            },
            include: {
                subject: true,
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
                sessions: {
                    select: {
                        sessionDate: true,
                        startTime: true,
                        endTime: true,
                    },
                    take: 10,
                    orderBy: {
                        sessionDate: 'asc',
                    },
                },
            },
        });
        return classes.map((classItem) => ({
            id: classItem.id,
            name: classItem.name,
            subject: classItem.subject,
            teacher: classItem.teacher
                ? {
                    id: classItem.teacher.id,
                    user: classItem.teacher.user,
                }
                : null,
            schedule: classItem.sessions.map((s) => ({
                date: s.sessionDate.toISOString().slice(0, 10),
                startTime: s.startTime,
                endTime: s.endTime,
            })),
        }));
    }
    async getAffectedSessions(query) {
        const start = new Date(query.startDate);
        const end = new Date(query.endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new common_1.HttpException('Định dạng ngày không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        if (end < start) {
            throw new common_1.HttpException('Ngày kết thúc phải sau ngày bắt đầu', common_1.HttpStatus.BAD_REQUEST);
        }
        const enrollments = await this.prisma.enrollment.findMany({
            where: {
                studentId: query.studentId,
            },
            select: {
                classId: true,
            },
        });
        if (enrollments.length === 0) {
            return [];
        }
        const classIds = enrollments.map((e) => e.classId);
        const sessions = await this.prisma.classSession.findMany({
            where: {
                classId: { in: classIds },
                sessionDate: {
                    gte: start,
                    lte: end,
                },
                class: {
                    status: 'active',
                },
            },
            select: {
                id: true,
                sessionDate: true,
                startTime: true,
                endTime: true,
                class: {
                    select: {
                        name: true,
                        subject: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                room: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
        });
        return sessions.map((s) => ({
            id: s.id,
            date: s.sessionDate.toISOString().slice(0, 10),
            time: `${s.startTime} - ${s.endTime}`,
            className: s.class?.name || '',
            subjectName: s.class?.subject?.name || '',
            room: s.room?.name || '',
        }));
    }
};
exports.StudentLeaveRequestService = StudentLeaveRequestService;
exports.StudentLeaveRequestService = StudentLeaveRequestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudentLeaveRequestService);
//# sourceMappingURL=student-leave-request.service.js.map