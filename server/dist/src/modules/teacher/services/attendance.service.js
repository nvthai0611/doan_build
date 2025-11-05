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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
const validate_util_1 = require("../../../utils/validate.util");
let AttendanceService = class AttendanceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getListStudentBySessionId(sessionId) {
        try {
            if (!(0, validate_util_1.checkId)(sessionId)) {
                throw new common_1.HttpException('Id session không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
            }
            const session = await this.prisma.classSession.findUnique({
                where: { id: sessionId },
                include: { class: true },
            });
            if (!session) {
                throw new common_1.HttpException('Buổi học không tồn tại', common_1.HttpStatus.NOT_FOUND);
            }
            const result = await this.prisma.classSession.findUnique({
                where: { id: sessionId },
                include: {
                    class: {
                        include: {
                            enrollments: {
                                where: {
                                    status: 'studying',
                                    enrolledAt: {
                                        lte: session.sessionDate,
                                    },
                                },
                                include: {
                                    student: {
                                        include: {
                                            user: {
                                                select: {
                                                    id: true,
                                                    fullName: true,
                                                    avatar: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            return result;
        }
        catch (error) {
            console.error('Error fetching student list by session:', error);
            throw new common_1.HttpException('Lỗi khi lấy danh sách học sinh', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAttendanceBySessionId(sessionId) {
        if (!(0, validate_util_1.checkId)(sessionId)) {
            throw new common_1.HttpException('Id session không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const result = await this.prisma.studentSessionAttendance.findMany({
                where: { sessionId },
                include: {
                    student: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    avatar: true,
                                    fullName: true,
                                },
                            },
                        },
                    },
                    session: {
                        include: {
                            class: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
            });
            return result;
        }
        catch (error) {
            console.error('Error fetching attendance by session:', error);
            throw new common_1.HttpException('Lỗi khi lấy danh sách điểm danh', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getLeaveRequestsBySessionId(sessionId) {
        try {
            if (!(0, validate_util_1.checkId)(sessionId)) {
                throw new common_1.HttpException('Id session không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
            }
            const session = await this.prisma.classSession.findUnique({
                where: { id: sessionId },
                select: { sessionDate: true },
            });
            if (!session) {
                throw new common_1.HttpException('Buổi học không tồn tại', common_1.HttpStatus.NOT_FOUND);
            }
            const getListExcused = this.prisma.leaveRequestAffectedSession.findMany({
                where: {
                    sessionId: sessionId,
                    leaveRequest: {
                        status: 'pending',
                    },
                },
                include: {
                    leaveRequest: {
                        include: {
                            student: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            avatar: true,
                                            fullName: true,
                                        },
                                    },
                                },
                            },
                            createdByUser: {
                                select: {
                                    id: true,
                                    fullName: true,
                                },
                            },
                        },
                    },
                }
            });
            return getListExcused;
        }
        catch (error) {
            console.error('Error fetching leave requests by session:', error);
            throw new common_1.HttpException('Lỗi khi lấy danh sách đơn xin nghỉ', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async attendanceStudentBySessionId(sessionId, records, teacherId, userId) {
        if (!(0, validate_util_1.checkId)(sessionId) || !(0, validate_util_1.checkId)(teacherId)) {
            throw new common_1.HttpException('Id session hoặc teacher không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!records || records.length === 0) {
            throw new common_1.HttpException('Danh sách bản ghi điểm danh không được để trống', common_1.HttpStatus.BAD_REQUEST);
        }
        const session = await this.prisma.classSession.findUnique({
            where: { id: sessionId },
        });
        if (!session) {
            throw new common_1.HttpException('Buổi học không tồn tại', common_1.HttpStatus.NOT_FOUND);
        }
        this.validateAttendanceTime(session.sessionDate);
        try {
            console.log(`Processing attendance for ${records.length} students`, {
                sessionId,
                teacherId,
                recordsCount: records.length,
            });
            const excusedStudents = records
                .filter((r) => r.status === 'excused')
                .map((r) => r.studentId);
            if (excusedStudents.length > 0) {
                await this.approveLeaveRequestsForStudents(excusedStudents, sessionId, userId);
            }
            const result = await this.prisma.$transaction(async (prisma) => {
                const chunkSize = 10;
                const chunks = [];
                for (let i = 0; i < records.length; i += chunkSize) {
                    chunks.push(records.slice(i, i + chunkSize));
                }
                const results = [];
                for (const chunk of chunks) {
                    const chunkResults = await Promise.all(chunk.map((record) => prisma.studentSessionAttendance.upsert({
                        where: {
                            sessionId_studentId: {
                                sessionId,
                                studentId: record.studentId,
                            },
                        },
                        update: {
                            status: record.status,
                            note: record.note || null,
                            recordedAt: new Date(),
                            recordedByTeacher: { connect: { id: teacherId } },
                        },
                        create: {
                            status: record.status,
                            note: record.note || null,
                            recordedAt: new Date(),
                            session: { connect: { id: sessionId } },
                            student: { connect: { id: record.studentId } },
                            recordedByTeacher: { connect: { id: teacherId } },
                        },
                    })));
                    results.push(...chunkResults);
                }
                return results;
            }, { maxWait: 5000, timeout: 30000 });
            return {
                data: {
                    updated: result.length,
                    total: records.length,
                },
                message: `Cập nhật ${result.length} bản ghi điểm danh thành công`,
            };
        }
        catch (error) {
            console.error('Error updating attendance:', error.message);
            throw new common_1.HttpException('Lỗi khi cập nhật điểm danh', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async approveLeaveRequestsForStudents(studentIds, sessionId, userId) {
        if (!studentIds || studentIds.length === 0) {
            return;
        }
        try {
            console.log(`Approving leave requests for ${studentIds.length} students in session ${sessionId}`);
            const affectedSessions = await this.prisma.leaveRequestAffectedSession.findMany({
                where: {
                    sessionId,
                    leaveRequest: {
                        studentId: { in: studentIds },
                        status: 'pending',
                    },
                },
                select: { leaveRequest: { select: { id: true } } },
            });
            if (affectedSessions.length === 0) {
                console.log(`No pending leave requests found for session ${sessionId}`);
                return;
            }
            const leaveRequestIds = [
                ...new Set(affectedSessions.map((as) => as.leaveRequest.id)),
            ];
            const updated = await this.prisma.leaveRequest.updateMany({
                where: {
                    id: { in: leaveRequestIds },
                    status: 'pending',
                },
                data: {
                    status: 'approved',
                    approvedBy: userId,
                    approvedAt: new Date(),
                },
            });
            console.log(`Successfully approved ${updated.count} leave requests for session ${sessionId}`);
        }
        catch (error) {
            console.error(`Error approving leave requests for session ${sessionId}:`, error.message);
        }
    }
    validateAttendanceTime(sessionDate) {
        const currentDate = new Date();
        const sessionDateOnly = this.getDateStart(sessionDate);
        const currentDateOnly = this.getDateStart(currentDate);
        if (currentDateOnly < sessionDateOnly) {
            throw new common_1.HttpException('Chưa đến ngày học, không thể điểm danh', common_1.HttpStatus.BAD_REQUEST);
        }
        if (currentDateOnly > sessionDateOnly) {
            throw new common_1.HttpException('Đã qua ngày học, không thể điểm danh', common_1.HttpStatus.BAD_REQUEST);
        }
        if (currentDate < sessionDate) {
            throw new common_1.HttpException('Chưa đến giờ bắt đầu lớp, không thể điểm danh', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    getDateStart(date) {
        return new Date(new Date(date).toDateString());
    }
    getDateEnd(dateStart) {
        const dateEnd = new Date(dateStart);
        dateEnd.setDate(dateEnd.getDate() + 1);
        return dateEnd;
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map