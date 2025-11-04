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
exports.SessionRequestService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let SessionRequestService = class SessionRequestService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createSessionRequest(teacherId, dto) {
        try {
            const teacher = await this.prisma.teacher.findUnique({
                where: { id: teacherId },
                select: { userId: true }
            });
            if (!teacher) {
                throw new Error('Không tìm thấy thông tin giáo viên');
            }
            const classInfo = await this.prisma.class.findFirst({
                where: { id: dto.classId, teacherId: teacherId },
                select: { id: true, name: true, subject: { select: { name: true } } }
            });
            if (!classInfo) {
                throw new Error('Bạn không được phân công lớp này hoặc lớp không hoạt động');
            }
            if (dto.roomId) {
                const conflictRoom = await this.prisma.classSession.findFirst({
                    where: {
                        roomId: dto.roomId,
                        sessionDate: new Date(dto.sessionDate),
                        startTime: { lte: dto.endTime },
                        endTime: { gte: dto.startTime },
                    }
                });
                if (conflictRoom) {
                    throw new Error('Phòng học đã được sử dụng trong khoảng thời gian này');
                }
            }
            const conflictTeacher = await this.prisma.classSession.findFirst({
                where: {
                    sessionDate: new Date(dto.sessionDate),
                    startTime: { lte: dto.endTime },
                    endTime: { gte: dto.startTime },
                    teacherId: teacherId
                }
            });
            if (conflictTeacher) {
                throw new Error('Bạn đã có buổi dạy khác trùng khung giờ này');
            }
            const existingRequest = await this.prisma.sessionRequest.findFirst({
                where: {
                    teacherId: teacherId,
                    sessionDate: new Date(dto.sessionDate),
                    startTime: dto.startTime,
                    endTime: dto.endTime,
                    status: 'pending'
                }
            });
            if (existingRequest) {
                throw new Error('Bạn đã có yêu cầu tạo buổi học tương tự đang chờ duyệt');
            }
            const sessionRequest = await this.prisma.sessionRequest.create({
                data: {
                    requestType: dto.requestType,
                    teacherId: teacherId,
                    classId: dto.classId,
                    sessionDate: new Date(dto.sessionDate),
                    startTime: dto.startTime,
                    endTime: dto.endTime,
                    roomId: dto.roomId,
                    reason: dto.reason,
                    notes: dto.notes,
                    status: 'pending',
                    createdBy: teacher.userId,
                },
                include: {
                    class: {
                        include: {
                            subject: { select: { name: true } }
                        }
                    },
                    room: { select: { id: true, name: true } },
                    teacher: {
                        include: {
                            user: { select: { fullName: true } }
                        }
                    },
                    createdByUser: { select: { id: true, fullName: true } },
                    approvedByUser: { select: { id: true, fullName: true } }
                }
            });
            return this.formatSessionRequestResponse(sessionRequest);
        }
        catch (error) {
            throw error;
        }
    }
    async getMySessionRequests(teacherId, filters) {
        try {
            const { page = 1, limit = 10, status, requestType } = filters;
            const skip = (page - 1) * limit;
            const where = {
                teacherId: teacherId
            };
            if (status) {
                where.status = status;
            }
            if (requestType) {
                where.requestType = requestType;
            }
            const [sessionRequests, total] = await Promise.all([
                this.prisma.sessionRequest.findMany({
                    where,
                    include: {
                        class: {
                            include: {
                                subject: { select: { name: true } }
                            }
                        },
                        room: { select: { id: true, name: true } },
                        teacher: {
                            include: {
                                user: { select: { fullName: true } }
                            }
                        },
                        createdByUser: { select: { id: true, fullName: true } },
                        approvedByUser: { select: { id: true, fullName: true } }
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit
                }),
                this.prisma.sessionRequest.count({ where })
            ]);
            return {
                data: sessionRequests.map(request => this.formatSessionRequestResponse(request)),
                total,
                page,
                limit
            };
        }
        catch (error) {
            throw new Error(`Lỗi khi lấy danh sách yêu cầu tạo buổi học: ${error.message}`);
        }
    }
    async getSessionRequestDetail(teacherId, requestId) {
        try {
            const sessionRequest = await this.prisma.sessionRequest.findFirst({
                where: {
                    id: requestId,
                    teacherId: teacherId
                },
                include: {
                    class: {
                        include: {
                            subject: { select: { name: true } }
                        }
                    },
                    room: { select: { id: true, name: true } },
                    teacher: {
                        include: {
                            user: { select: { fullName: true } }
                        }
                    },
                    createdByUser: { select: { id: true, fullName: true } },
                    approvedByUser: { select: { id: true, fullName: true } }
                }
            });
            if (!sessionRequest) {
                return null;
            }
            return this.formatSessionRequestResponse(sessionRequest);
        }
        catch (error) {
            throw new Error(`Lỗi khi lấy chi tiết yêu cầu tạo buổi học: ${error.message}`);
        }
    }
    async cancelSessionRequest(teacherId, requestId) {
        try {
            const sessionRequest = await this.prisma.sessionRequest.findFirst({
                where: {
                    id: requestId,
                    teacherId: teacherId,
                    status: 'pending'
                }
            });
            if (!sessionRequest) {
                throw new Error('Không tìm thấy yêu cầu hoặc yêu cầu đã được xử lý');
            }
            const updatedRequest = await this.prisma.sessionRequest.update({
                where: { id: requestId },
                data: { status: 'cancelled' },
                include: {
                    class: {
                        include: {
                            subject: { select: { name: true } }
                        }
                    },
                    room: { select: { id: true, name: true } },
                    teacher: {
                        include: {
                            user: { select: { fullName: true } }
                        }
                    },
                    createdByUser: { select: { id: true, fullName: true } },
                    approvedByUser: { select: { id: true, fullName: true } }
                }
            });
            return this.formatSessionRequestResponse(updatedRequest);
        }
        catch (error) {
            throw new Error(`Lỗi khi hủy yêu cầu tạo buổi học: ${error.message}`);
        }
    }
    formatSessionRequestResponse(sessionRequest) {
        return {
            id: sessionRequest.id,
            requestType: sessionRequest.requestType,
            sessionDate: sessionRequest.sessionDate.toISOString().split('T')[0],
            startTime: sessionRequest.startTime,
            endTime: sessionRequest.endTime,
            reason: sessionRequest.reason,
            notes: sessionRequest.notes,
            status: sessionRequest.status,
            createdAt: sessionRequest.createdAt,
            approvedAt: sessionRequest.approvedAt,
            class: {
                id: sessionRequest.class.id,
                name: sessionRequest.class.name,
                subject: {
                    name: sessionRequest.class.subject.name
                }
            },
            room: sessionRequest.room ? {
                id: sessionRequest.room.id,
                name: sessionRequest.room.name
            } : undefined,
            teacher: {
                id: sessionRequest.teacher.id,
                user: {
                    fullName: sessionRequest.teacher.user.fullName
                }
            },
            createdByUser: {
                id: sessionRequest.createdByUser.id,
                fullName: sessionRequest.createdByUser.fullName
            },
            approvedByUser: sessionRequest.approvedByUser ? {
                id: sessionRequest.approvedByUser.id,
                fullName: sessionRequest.approvedByUser.fullName
            } : undefined
        };
    }
};
exports.SessionRequestService = SessionRequestService;
exports.SessionRequestService = SessionRequestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SessionRequestService);
//# sourceMappingURL=session-request.service.js.map