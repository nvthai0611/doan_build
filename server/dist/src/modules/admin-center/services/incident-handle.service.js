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
exports.IncidentHandleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
const validate_util_1 = require("../../../utils/validate.util");
let IncidentHandleService = class IncidentHandleService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listIncidents(options) {
        const { page, limit, status, severity } = options;
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status.toUpperCase();
        if (severity)
            where.severity = severity;
        const [total, items] = await this.prisma.$transaction([
            this.prisma.incidentReport.count({ where }),
            this.prisma.incidentReport.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    class: true,
                    reportedBy: { include: { user: true } },
                },
            }),
        ]);
        return {
            data: items,
            message: 'Lấy danh sách báo cáo sự cố thành công',
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async updateStatus(id, status) {
        if (!id || !(0, validate_util_1.checkId)(id)) {
            throw new common_1.HttpException('ID không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        const updated = await this.prisma.incidentReport.update({
            where: { id },
            data: { status: status.toUpperCase() },
        });
        return { data: updated, message: 'Cập nhật trạng thái thành công' };
    }
};
exports.IncidentHandleService = IncidentHandleService;
exports.IncidentHandleService = IncidentHandleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IncidentHandleService);
//# sourceMappingURL=incident-handle.service.js.map