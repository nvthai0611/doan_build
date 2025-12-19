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
var AuditLogService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let AuditLogService = AuditLogService_1 = class AuditLogService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AuditLogService_1.name);
    }
    async getAuditLogs(query) {
        const { search, action, tableName, userId, recordId, startDate, endDate, page = 1, limit = 20, sortBy = 'timestamp', sortOrder = 'desc', } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (action && action !== 'all') {
            where.action = action;
        }
        if (tableName) {
            where.tableName = {
                contains: tableName,
                mode: 'insensitive',
            };
        }
        if (userId) {
            where.userId = userId;
        }
        if (recordId) {
            where.recordId = recordId;
        }
        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate) {
                where.timestamp.gte = new Date(startDate);
            }
            if (endDate) {
                where.timestamp.lte = new Date(endDate);
            }
        }
        if (search) {
            where.OR = [
                { tableName: { contains: search, mode: 'insensitive' } },
                { recordId: { contains: search, mode: 'insensitive' } },
                { action: { contains: search, mode: 'insensitive' } },
                {
                    performedBy: {
                        OR: [
                            { fullName: { contains: search, mode: 'insensitive' } },
                            { username: { contains: search, mode: 'insensitive' } },
                            { email: { contains: search, mode: 'insensitive' } },
                        ],
                    },
                },
            ];
        }
        const orderBy = {};
        if (sortBy === 'timestamp') {
            orderBy.timestamp = sortOrder;
        }
        else if (sortBy === 'action') {
            orderBy.action = sortOrder;
        }
        else if (sortBy === 'tableName') {
            orderBy.tableName = sortOrder;
        }
        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    performedBy: {
                        select: {
                            id: true,
                            username: true,
                            fullName: true,
                            email: true,
                            avatar: true,
                            role: true,
                        },
                    },
                },
            }),
            this.prisma.auditLog.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            data: logs.map((log) => ({
                id: log.id.toString(),
                userId: log.userId,
                action: log.action,
                tableName: log.tableName,
                recordId: log.recordId,
                oldValues: log.oldValues,
                newValues: log.newValues,
                ipAddress: log.ipAddress,
                userAgent: log.userAgent,
                timestamp: log.timestamp,
                performedBy: log.performedBy,
            })),
            meta: {
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages,
                },
            },
            message: 'Lấy danh sách audit log thành công',
        };
    }
    async getAuditLogById(id) {
        const log = await this.prisma.auditLog.findUnique({
            where: { id: BigInt(id) },
            include: {
                performedBy: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        email: true,
                        avatar: true,
                        role: true,
                    },
                },
            },
        });
        if (!log) {
            throw new common_1.HttpException('Không tìm thấy audit log', common_1.HttpStatus.NOT_FOUND);
        }
        return {
            data: {
                id: log.id.toString(),
                userId: log.userId,
                action: log.action,
                tableName: log.tableName,
                recordId: log.recordId,
                oldValues: log.oldValues,
                newValues: log.newValues,
                ipAddress: log.ipAddress,
                userAgent: log.userAgent,
                timestamp: log.timestamp,
                performedBy: log.performedBy,
            },
            message: 'Lấy chi tiết audit log thành công',
        };
    }
    async createAuditLog(dto) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    userId: dto.userId,
                    action: dto.action,
                    tableName: dto.tableName,
                    recordId: dto.recordId || null,
                    oldValues: dto.oldValues ? (typeof dto.oldValues === 'object' ? dto.oldValues : JSON.parse(dto.oldValues)) : null,
                    newValues: dto.newValues ? (typeof dto.newValues === 'object' ? dto.newValues : JSON.parse(dto.newValues)) : null,
                    ipAddress: dto.ipAddress || null,
                    userAgent: dto.userAgent || null,
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
        }
    }
    async logCrudOperation(userId, action, tableName, recordId, oldValues, newValues, ipAddress, userAgent) {
        await this.createAuditLog({
            userId,
            action,
            tableName,
            recordId,
            oldValues,
            newValues,
            ipAddress,
            userAgent,
        });
    }
};
exports.AuditLogService = AuditLogService;
exports.AuditLogService = AuditLogService = AuditLogService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditLogService);
//# sourceMappingURL=audit-log.service.js.map