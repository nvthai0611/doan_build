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
                throw new common_1.HttpException({
                    message: 'Id session không hợp lệ',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const checkExistSession = await this.prisma.classSession.findUnique({
                where: { id: sessionId },
                include: {
                    class: true,
                },
            });
            if (!checkExistSession) {
                throw new common_1.HttpException({
                    mesage: 'Buổi học không tồn tại',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            const classStartDate = checkExistSession.class.actualStartDate || new Date();
            const result = await this.prisma.classSession.findUnique({
                where: { id: sessionId },
                include: {
                    class: {
                        include: {
                            enrollments: {
                                where: {
                                    status: 'studying',
                                    enrolledAt: {
                                        lte: classStartDate
                                    }
                                },
                                include: {
                                    student: {
                                        include: {
                                            user: {
                                                select: {
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
            throw new common_1.HttpException({
                message: 'Lỗi khi lấy danh sách học sinh',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAttendanceBySessionId(sessionId) {
        if (!(0, validate_util_1.checkId)(sessionId)) {
            throw new common_1.HttpException('Invalid session ID', common_1.HttpStatus.BAD_REQUEST);
        }
        const result = await this.prisma.studentSessionAttendance.findMany({
            where: { sessionId },
            include: {
                student: {
                    include: {
                        user: {
                            select: {
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
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                id: 'asc',
            },
        });
        return result;
    }
    async attendanceStudentBySessionId(sessionId, records, teacherId) {
        if (!(0, validate_util_1.checkId)(sessionId) || !(0, validate_util_1.checkId)(teacherId)) {
            throw new common_1.HttpException('Invalid session or teacher ID', common_1.HttpStatus.BAD_REQUEST);
        }
        const findSession = await this.prisma.classSession.findUnique({
            where: { id: sessionId },
        });
        if (!findSession) {
            throw new common_1.HttpException('Buổi học không tồn tại', common_1.HttpStatus.NOT_FOUND);
        }
        const sessionDate = new Date(findSession.sessionDate);
        const currentDate = new Date();
        const sessionDateOnly = new Date(sessionDate.toDateString());
        const currentDateOnly = new Date(currentDate.toDateString());
        if (currentDateOnly < sessionDateOnly) {
            throw new common_1.HttpException('Chưa đến ngày học, không thể điểm danh', common_1.HttpStatus.BAD_REQUEST);
        }
        if (currentDateOnly > sessionDateOnly) {
            throw new common_1.HttpException('Đã qua ngày học, không thể điểm danh', common_1.HttpStatus.BAD_REQUEST);
        }
        if (currentDateOnly.getTime() === sessionDateOnly.getTime()) {
            if (currentDate < sessionDate) {
                throw new common_1.HttpException('Chưa đến giờ bắt đầu lớp, không thể điểm danh', common_1.HttpStatus.BAD_REQUEST);
            }
        }
        try {
            const result = await this.prisma.$transaction(async (prisma) => {
                const upsertPromises = records.map((record) => {
                    if (!(0, validate_util_1.checkId)(record.studentId)) {
                        throw new common_1.HttpException(`Invalid student ID: ${record.studentId}`, common_1.HttpStatus.BAD_REQUEST);
                    }
                    return prisma.studentSessionAttendance.upsert({
                        where: {
                            sessionId_studentId: {
                                sessionId,
                                studentId: record.studentId,
                            },
                        },
                        update: {
                            status: record.status,
                            note: record.note || '',
                            recordedAt: new Date(),
                            recordedByTeacher: {
                                connect: { id: teacherId }
                            }
                        },
                        create: {
                            status: record.status,
                            note: record.note || '',
                            recordedAt: new Date(),
                            session: {
                                connect: { id: sessionId }
                            },
                            student: {
                                connect: { id: record.studentId }
                            },
                            recordedByTeacher: {
                                connect: { id: teacherId }
                            },
                        },
                    });
                });
                return Promise.all(upsertPromises);
            }, {
                maxWait: 10000,
                timeout: 20000,
            });
            return {
                data: {
                    updated: result.length,
                    total: records.length,
                },
                message: `Cập nhật ${result.length} bản ghi điểm danh thành công`,
            };
        }
        catch (error) {
            console.error('Error updating attendance:', error);
            throw new common_1.HttpException('Lỗi khi cập nhật điểm danh', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map