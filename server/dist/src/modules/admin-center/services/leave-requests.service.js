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
exports.LeaveRequestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let LeaveRequestsService = class LeaveRequestsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getLeaveRequests(params) {
        const { teacherId, status = 'all', search = '', fromDate, toDate, page = 1, limit = 10 } = params;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const where = {};
        if (teacherId) {
            where.teacherId = teacherId;
        }
        if (status !== 'all') {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { requestType: { contains: search, mode: 'insensitive' } },
                { reason: { contains: search, mode: 'insensitive' } },
                { notes: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (fromDate || toDate) {
            where.startDate = {};
            if (fromDate) {
                where.startDate.gte = new Date(fromDate);
            }
            if (toDate) {
                where.startDate.lte = new Date(toDate);
            }
        }
        const total = await this.prisma.leaveRequest.count({ where });
        const skip = (pageNum - 1) * limitNum;
        const data = await this.prisma.leaveRequest.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { createdAt: 'desc' },
            include: {
                teacher: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                email: true
                            }
                        }
                    }
                },
                approvedByUser: {
                    select: {
                        fullName: true,
                        email: true
                    }
                },
                affectedSessions: {
                    include: {
                        session: {}
                    }
                }
            }
        });
        const totalPages = Math.ceil(total / limit);
        return {
            data: data.map(item => ({
                id: item.id,
                type: item.requestType,
                reason: item.reason,
                startDate: item.startDate.toISOString().split('T')[0],
                endDate: item.endDate.toISOString().split('T')[0],
                status: item.status,
                submittedDate: item.createdAt.toISOString().split('T')[0],
                approvedBy: item.approvedByUser?.fullName || null,
                approvedDate: item.approvedAt ? item.approvedAt.toISOString().split('T')[0] : null,
                notes: item.notes || null,
                teacherId: item.teacherId,
                teacherInfo: item.teacher?.user,
                affectedSessions: item.affectedSessions,
                createdAt: item.createdAt.toISOString().split('T')[0]
            })),
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages
            },
            message: 'Lấy danh sách đơn xin nghỉ thành công'
        };
    }
    async createLeaveRequest(leaveRequestData) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { id: leaveRequestData.teacherId }
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Giáo viên không tồn tại');
        }
        const startDate = new Date(leaveRequestData.startDate);
        const endDate = new Date(leaveRequestData.endDate);
        if (endDate <= startDate) {
            throw new common_1.BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
        }
        const leaveRequest = await this.prisma.leaveRequest.create({
            data: {
                teacherId: leaveRequestData.teacherId,
                requestType: leaveRequestData.requestType,
                reason: leaveRequestData.reason,
                startDate,
                endDate,
                status: 'pending',
                notes: leaveRequestData.notes,
                createdBy: leaveRequestData.teacherId
            },
            include: {
                teacher: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
        return {
            data: {
                id: leaveRequest.id,
                type: leaveRequest.requestType,
                reason: leaveRequest.reason,
                startDate: leaveRequest.startDate.toISOString().split('T')[0],
                endDate: leaveRequest.endDate.toISOString().split('T')[0],
                status: leaveRequest.status,
                submittedDate: leaveRequest.createdAt.toISOString().split('T')[0],
                approvedBy: null,
                approvedDate: null,
                notes: leaveRequest.notes,
                teacherId: leaveRequest.teacherId
            },
            message: 'Tạo đơn xin nghỉ thành công'
        };
    }
    async updateLeaveRequest(leaveRequestId, updateData) {
        const existingRequest = await this.prisma.leaveRequest.findUnique({
            where: { id: leaveRequestId }
        });
        if (!existingRequest) {
            throw new common_1.NotFoundException('Đơn xin nghỉ không tồn tại');
        }
        if (existingRequest.status !== 'pending') {
            throw new common_1.BadRequestException('Chỉ có thể chỉnh sửa đơn đang chờ duyệt');
        }
        if (updateData.startDate || updateData.endDate) {
            const startDate = updateData.startDate ? new Date(updateData.startDate) : existingRequest.startDate;
            const endDate = updateData.endDate ? new Date(updateData.endDate) : existingRequest.endDate;
            if (endDate <= startDate) {
                throw new common_1.BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
            }
        }
        const updatedRequest = await this.prisma.leaveRequest.update({
            where: { id: leaveRequestId },
            data: updateData,
            include: {
                teacher: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
        return {
            data: {
                id: updatedRequest.id,
                type: updatedRequest.requestType,
                reason: updatedRequest.reason,
                startDate: updatedRequest.startDate.toISOString().split('T')[0],
                endDate: updatedRequest.endDate.toISOString().split('T')[0],
                status: updatedRequest.status,
                submittedDate: updatedRequest.createdAt.toISOString().split('T')[0],
                approvedBy: null,
                approvedDate: null,
                notes: updatedRequest.notes,
                teacherId: updatedRequest.teacherId
            },
            message: 'Cập nhật đơn xin nghỉ thành công'
        };
    }
    async deleteLeaveRequest(leaveRequestId) {
        const existingRequest = await this.prisma.leaveRequest.findUnique({
            where: { id: leaveRequestId }
        });
        if (!existingRequest) {
            throw new common_1.NotFoundException('Đơn xin nghỉ không tồn tại');
        }
        if (existingRequest.status !== 'pending') {
            throw new common_1.BadRequestException('Chỉ có thể xóa đơn đang chờ duyệt');
        }
        await this.prisma.leaveRequest.delete({
            where: { id: leaveRequestId }
        });
        return {
            message: 'Xóa đơn xin nghỉ thành công'
        };
    }
    async approveLeaveRequest(leaveRequestId, action, approverId, notes) {
        const existingRequest = await this.prisma.leaveRequest.findUnique({
            where: { id: leaveRequestId },
            include: {
                affectedSessions: {
                    include: {
                        session: true
                    }
                }
            }
        });
        if (!existingRequest) {
            throw new common_1.NotFoundException('Đơn xin nghỉ không tồn tại');
        }
        if (existingRequest.status !== 'pending') {
            throw new common_1.BadRequestException('Đơn này đã được xử lý');
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const updatedRequest = await tx.leaveRequest.update({
                where: { id: leaveRequestId },
                data: {
                    status: action === 'approve' ? 'approved' : 'rejected',
                    approvedBy: approverId,
                    approvedAt: new Date(),
                    notes: notes || existingRequest.notes
                },
                include: {
                    teacher: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                    email: true
                                }
                            }
                        }
                    },
                    approvedByUser: {
                        select: {
                            fullName: true,
                            email: true
                        }
                    }
                }
            });
            if (action === 'approve' && existingRequest.affectedSessions.length > 0) {
                const sessionIds = existingRequest.affectedSessions.map(affected => affected.sessionId);
                await tx.classSession.updateMany({
                    where: {
                        id: { in: sessionIds }
                    },
                    data: {
                        status: 'cancelled'
                    }
                });
            }
            return updatedRequest;
        });
        return {
            data: {
                id: result.id,
                type: result.requestType,
                reason: result.reason,
                startDate: result.startDate.toISOString().split('T')[0],
                endDate: result.endDate.toISOString().split('T')[0],
                status: result.status,
                submittedDate: result.createdAt.toISOString().split('T')[0],
                approvedBy: result.approvedByUser?.fullName || null,
                approvedDate: result.approvedAt ? result.approvedAt.toISOString().split('T')[0] : null,
                notes: result.notes,
                teacherId: result.teacherId
            },
            message: action === 'approve' ? 'Duyệt đơn xin nghỉ thành công' : 'Từ chối đơn xin nghỉ thành công'
        };
    }
    async getLeaveRequestStats(teacherId) {
        const requests = await this.prisma.leaveRequest.findMany({
            where: { teacherId },
            select: {
                startDate: true,
                endDate: true,
                status: true
            }
        });
        const totalRequests = requests.length;
        const pendingRequests = requests.filter(req => req.status === 'pending').length;
        const approvedRequests = requests.filter(req => req.status === 'approved').length;
        const rejectedRequests = requests.filter(req => req.status === 'rejected').length;
        return {
            data: {
                totalRequests,
                pendingRequests,
                approvedRequests,
                rejectedRequests
            },
            message: 'Lấy thống kê đơn xin nghỉ thành công'
        };
    }
    async getLeaveRequestById(id) {
        const leaveRequest = await this.prisma.leaveRequest.findUnique({
            where: { id },
            include: {
                teacher: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                email: true
                            }
                        }
                    }
                },
                approvedByUser: {
                    select: {
                        fullName: true,
                        email: true
                    }
                },
                affectedSessions: {
                    include: {
                        session: {
                            include: {
                                class: {
                                    include: {
                                        subject: {
                                            select: {
                                                name: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        return {
            data: {
                id: leaveRequest.id,
                type: leaveRequest.requestType,
                reason: leaveRequest.reason,
                startDate: leaveRequest.startDate,
                endDate: leaveRequest.endDate,
                status: leaveRequest.status,
                submittedDate: leaveRequest.createdAt,
                approvedBy: leaveRequest.approvedByUser?.fullName || null,
                approvedDate: leaveRequest.approvedAt ? leaveRequest.approvedAt : null,
                notes: leaveRequest.notes,
                teacherId: leaveRequest.teacherId,
                createdAt: leaveRequest.createdAt,
                teacherInfo: leaveRequest.teacher?.user,
                affectedSessions: leaveRequest.affectedSessions?.map(session => ({
                    id: session.id,
                    sessionDate: session.session.sessionDate,
                    startTime: session.session.startTime,
                    endTime: session.session.endTime,
                    class: session.session.class.name,
                    subject: session.session.class.subject.name
                }))
            },
            message: 'Lấy chi tiết đơn xin nghỉ thành công'
        };
    }
};
exports.LeaveRequestsService = LeaveRequestsService;
exports.LeaveRequestsService = LeaveRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeaveRequestsService);
//# sourceMappingURL=leave-requests.service.js.map