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
exports.TeacherStudentLeaveRequestService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
const validate_util_1 = require("../../../utils/validate.util");
let TeacherStudentLeaveRequestService = class TeacherStudentLeaveRequestService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStudentLeaveRequests(teacherId, query) {
        if (!teacherId || !(0, validate_util_1.checkId)(teacherId)) {
            throw new common_1.HttpException('ID giáo viên không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        const teacher = await this.prisma.teacher.findUnique({
            where: { id: teacherId },
        });
        if (!teacher) {
            throw new common_1.HttpException('Không tìm thấy thông tin giáo viên', common_1.HttpStatus.NOT_FOUND);
        }
        const teacherClasses = await this.prisma.class.findMany({
            where: { teacherId: teacherId },
            select: { id: true },
        });
        const classIds = teacherClasses.map((c) => c.id);
        if (classIds.length === 0) {
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
        const baseWhere = {
            requestType: 'student_leave',
            affectedSessions: {
                some: {
                    session: {
                        classId: query.classId || { in: classIds },
                    },
                },
            },
        };
        const filteredWhere = { ...baseWhere };
        if (query.status) {
            filteredWhere.status = query.status;
        }
        if (query.search) {
            baseWhere.student = {
                user: {
                    fullName: {
                        contains: query.search,
                        mode: 'insensitive',
                    },
                },
            };
            filteredWhere.student = baseWhere.student;
        }
        const [total, leaveRequests, pendingCount, approvedCount, rejectedCount, allCount] = await Promise.all([
            this.prisma.leaveRequest.count({ where: filteredWhere }),
            this.prisma.leaveRequest.findMany({
                where: filteredWhere,
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
                where: { ...baseWhere, status: 'pending' },
            }),
            this.prisma.leaveRequest.count({
                where: { ...baseWhere, status: 'approved' },
            }),
            this.prisma.leaveRequest.count({
                where: { ...baseWhere, status: 'rejected' },
            }),
            this.prisma.leaveRequest.count({
                where: baseWhere,
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
                all: allCount,
            },
        };
    }
    async getStudentLeaveRequestById(teacherId, leaveRequestId) {
        if (!teacherId || !(0, validate_util_1.checkId)(teacherId)) {
            throw new common_1.HttpException('ID giáo viên không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!leaveRequestId || !(0, validate_util_1.checkId)(leaveRequestId)) {
            throw new common_1.HttpException('ID đơn nghỉ học không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
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
        const teacherClassIds = await this.prisma.class.findMany({
            where: { teacherId: teacherId },
            select: { id: true },
        });
        const teacherClassIdList = teacherClassIds.map((c) => c.id);
        const hasPermission = leaveRequest.affectedSessions.some((session) => teacherClassIdList.includes(session.session.classId));
        if (!hasPermission) {
            throw new common_1.HttpException('Không có quyền xem đơn này', common_1.HttpStatus.FORBIDDEN);
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
    async approveOrRejectStudentLeaveRequest(teacherId, leaveRequestId, action, dto) {
        if (!teacherId || !(0, validate_util_1.checkId)(teacherId)) {
            throw new common_1.HttpException('ID giáo viên không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!leaveRequestId || !(0, validate_util_1.checkId)(leaveRequestId)) {
            throw new common_1.HttpException('ID đơn nghỉ học không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        const teacher = await this.prisma.teacher.findUnique({
            where: { id: teacherId },
            select: { userId: true },
        });
        if (!teacher) {
            throw new common_1.HttpException('Không tìm thấy thông tin giáo viên', common_1.HttpStatus.NOT_FOUND);
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
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!leaveRequest) {
            throw new common_1.HttpException('Không tìm thấy đơn nghỉ học', common_1.HttpStatus.NOT_FOUND);
        }
        if (leaveRequest.status !== 'pending') {
            throw new common_1.HttpException('Chỉ có thể duyệt/từ chối đơn đang chờ duyệt', common_1.HttpStatus.BAD_REQUEST);
        }
        const teacherClassIds = await this.prisma.class.findMany({
            where: { teacherId: teacherId },
            select: { id: true },
        });
        const teacherClassIdList = teacherClassIds.map((c) => c.id);
        const affectedSessionsByTeacher = leaveRequest.affectedSessions.filter((session) => teacherClassIdList.includes(session.session.classId));
        if (affectedSessionsByTeacher.length === 0) {
            throw new common_1.HttpException('Không có quyền duyệt đơn này', common_1.HttpStatus.FORBIDDEN);
        }
        const updatedRequest = await this.prisma.leaveRequest.update({
            where: { id: leaveRequestId },
            data: {
                status: action === 'approve' ? 'approved' : 'rejected',
                approvedBy: teacher.userId,
                approvedAt: new Date(),
                notes: dto.notes || leaveRequest.notes,
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
                approvedByUser: {
                    select: {
                        fullName: true,
                        email: true,
                    },
                },
            },
        });
        if (action === 'approve') {
            const affectedSessionIds = leaveRequest.affectedSessions.map((s) => s.sessionId);
            for (const sessionId of affectedSessionIds) {
                const existingAttendance = await this.prisma.studentSessionAttendance.findFirst({
                    where: {
                        studentId: leaveRequest.studentId,
                        sessionId: sessionId,
                    },
                });
                if (existingAttendance) {
                    await this.prisma.studentSessionAttendance.update({
                        where: { id: existingAttendance.id },
                        data: {
                            status: 'excused',
                            note: `Nghỉ có phép - Đơn #${leaveRequestId.slice(0, 8)} đã được duyệt`,
                        },
                    });
                }
                else {
                    await this.prisma.studentSessionAttendance.create({
                        data: {
                            studentId: leaveRequest.studentId,
                            sessionId: sessionId,
                            status: 'excused',
                            note: `Nghỉ có phép - Đơn #${leaveRequestId.slice(0, 8)} đã được duyệt`,
                            recordedBy: teacherId,
                            recordedAt: new Date(),
                        },
                    });
                }
            }
        }
        const affectedClasses = new Map();
        for (const affectedSession of updatedRequest.affectedSessions) {
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
            ...updatedRequest,
            classes: Array.from(affectedClasses.values()),
        };
    }
};
exports.TeacherStudentLeaveRequestService = TeacherStudentLeaveRequestService;
exports.TeacherStudentLeaveRequestService = TeacherStudentLeaveRequestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeacherStudentLeaveRequestService);
//# sourceMappingURL=student-leave-request.service.js.map