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
exports.LeaveRequestService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
const validate_util_1 = require("../../../utils/validate.util");
let LeaveRequestService = class LeaveRequestService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAffectedSessions(teacherId, startDate, endDate) {
        if (!teacherId || !(0, validate_util_1.checkId)(teacherId)) {
            throw new common_1.HttpException('ID giáo viên không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!startDate || !endDate) {
            throw new common_1.HttpException('Thiếu tham số ngày', common_1.HttpStatus.BAD_REQUEST);
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new common_1.HttpException('Định dạng ngày không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        if (end < start) {
            throw new common_1.HttpException('Ngày kết thúc phải sau ngày bắt đầu', common_1.HttpStatus.BAD_REQUEST);
        }
        const sessions = await this.prisma.classSession.findMany({
            where: {
                sessionDate: {
                    gte: start,
                    lte: end,
                },
                teacherId: teacherId,
            },
            select: {
                id: true,
                sessionDate: true,
                startTime: true,
                endTime: true,
                class: {
                    select: {
                        name: true,
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
            room: s.room?.name || '',
            selected: true,
        }));
    }
    async getReplacementTeachers(requestingTeacherId, sessionId, date, time) {
        if (!requestingTeacherId || !(0, validate_util_1.checkId)(requestingTeacherId)) {
            throw new common_1.HttpException('ID giáo viên không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!sessionId || !(0, validate_util_1.checkId)(sessionId)) {
            throw new common_1.HttpException('ID buổi học không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!date || !time) {
            throw new common_1.HttpException('Thiếu tham số ngày hoặc giờ', common_1.HttpStatus.BAD_REQUEST);
        }
        const session = await this.prisma.classSession.findUnique({
            where: { id: sessionId },
            include: {
                class: {
                    include: {
                        subject: true,
                    }
                }
            }
        });
        if (!session) {
            throw new common_1.HttpException('Không tìm thấy buổi học', common_1.HttpStatus.NOT_FOUND);
        }
        if (session.teacherId !== requestingTeacherId) {
            throw new common_1.HttpException('Bạn không có quyền truy cập buổi học này', common_1.HttpStatus.FORBIDDEN);
        }
        const subjectName = session.class.subject.name;
        const [startTime, endTime] = time.split('-').map(t => t.trim());
        const allTeachers = await this.prisma.teacher.findMany({
            where: {
                id: { not: requestingTeacherId },
                user: { isActive: true },
                subjects: { has: subjectName },
            },
            include: {
                user: {
                    select: {
                        fullName: true,
                        email: true,
                        phone: true,
                    }
                },
                classes: {
                    include: {
                        subject: true
                    }
                }
            }
        });
        const availableTeachers = [];
        for (const teacher of allTeachers) {
            const hasConflict = await this.prisma.classSession.findFirst({
                where: {
                    sessionDate: new Date(date),
                    teacherId: teacher.id,
                    OR: [
                        {
                            AND: [
                                { startTime: { lte: startTime } },
                                { endTime: { gt: startTime } }
                            ]
                        },
                        {
                            AND: [
                                { startTime: { lt: endTime } },
                                { endTime: { gte: endTime } }
                            ]
                        }
                    ]
                }
            });
            if (!hasConflict) {
                availableTeachers.push(teacher);
            }
        }
        const replacementTeachers = availableTeachers.map(teacher => {
            const compatibilityScore = this.calculateCompatibilityScore(teacher, subjectName);
            const compatibilityReason = this.generateCompatibilityReason(teacher, subjectName);
            return {
                id: teacher.id,
                fullName: teacher.user.fullName || 'N/A',
                email: teacher.user.email,
                phone: teacher.user.phone,
                subjects: teacher.subjects,
                compatibilityScore,
                compatibilityReason,
                isAvailable: true,
                availabilityNote: 'Có thể dạy thay trong khung giờ này'
            };
        });
        return replacementTeachers.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    }
    calculateCompatibilityScore(teacher, subjectName) {
        let score = 0;
        if (teacher.subjects.includes(subjectName)) {
            score += 3;
        }
        const hasExperience = teacher.classes.some((classItem) => classItem.subject.name === subjectName);
        if (hasExperience) {
            score += 2;
        }
        const currentClasses = teacher.classes.length;
        if (currentClasses <= 2) {
            score += 1;
        }
        return Math.min(score, 5);
    }
    generateCompatibilityReason(teacher, subjectName) {
        const reasons = [];
        if (teacher.subjects.includes(subjectName)) {
            reasons.push(`Có thể dạy môn ${subjectName}`);
        }
        const hasExperience = teacher.classes.some((classItem) => classItem.subject.name === subjectName);
        if (hasExperience) {
            reasons.push('Có kinh nghiệm dạy môn này');
        }
        const currentClasses = teacher.classes.length;
        if (currentClasses <= 2) {
            reasons.push('Lịch dạy linh hoạt');
        }
        return reasons.join(', ') || 'Có thể dạy thay';
    }
    async createLeaveRequest(teacherId, body, affectedSessions, createdBy) {
        const leaveRequest = await this.prisma.leaveRequest.create({
            data: {
                teacherId,
                requestType: body.leaveType,
                reason: body.reason,
                startDate: new Date(body.startDate),
                endDate: new Date(body.endDate),
                status: 'pending',
                createdBy: createdBy,
                createdAt: new Date(),
                imageUrl: body.imageUrl || null,
                affectedSessions: {
                    create: affectedSessions.map((session) => ({
                        sessionId: session.id,
                        replacementTeacherId: session.replacementTeacherId || null,
                        notes: session.notes,
                    })) || [],
                },
            },
            include: {
                affectedSessions: {
                    include: {
                        session: {
                            include: {
                                class: { include: { subject: true } },
                                room: true,
                            },
                        },
                        replacementTeacher: {
                            include: { user: true },
                        },
                    },
                },
            },
        });
        return leaveRequest;
    }
    async getMyLeaveRequests(teacherId, options) {
        const { page, limit, status, requestType } = options;
        const skip = (page - 1) * limit;
        const where = {
            teacherId,
        };
        if (status) {
            where.status = status;
        }
        if (requestType) {
            where.requestType = requestType;
        }
        const total = await this.prisma.leaveRequest.count({ where });
        const leaveRequests = await this.prisma.leaveRequest.findMany({
            where,
            skip,
            take: limit,
            select: {
                id: true,
                requestType: true,
                reason: true,
                startDate: true,
                endDate: true,
                status: true,
                createdAt: true,
                createdBy: true,
                createdByUser: {
                    select: {
                        fullName: true,
                        email: true,
                    },
                },
                approvedBy: true,
                approvedByUser: {
                    select: {
                        fullName: true,
                        email: true,
                    },
                },
                affectedSessions: {
                    select: {
                        id: true,
                        notes: true,
                        session: {
                            select: {
                                id: true,
                                sessionDate: true,
                                startTime: true,
                                endTime: true,
                                notes: true,
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
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return {
            data: leaveRequests,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async cancelLeaveRequest(teacherId, leaveRequestId) {
        if (!teacherId || !(0, validate_util_1.checkId)(teacherId)) {
            throw new common_1.HttpException('ID giáo viên không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!leaveRequestId || !(0, validate_util_1.checkId)(leaveRequestId)) {
            throw new common_1.HttpException('ID đơn xin nghỉ không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        const leaveRequest = await this.prisma.leaveRequest.findUnique({
            where: { id: leaveRequestId },
            include: {
                teacher: true,
            },
        });
        if (!leaveRequest) {
            throw new common_1.HttpException('Không tìm thấy đơn xin nghỉ', common_1.HttpStatus.NOT_FOUND);
        }
        if (leaveRequest.teacherId !== teacherId) {
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
};
exports.LeaveRequestService = LeaveRequestService;
exports.LeaveRequestService = LeaveRequestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeaveRequestService);
//# sourceMappingURL=leave-request.service.js.map