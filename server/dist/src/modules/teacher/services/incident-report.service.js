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
exports.IncidentReportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
const validate_util_1 = require("../../../utils/validate.util");
let IncidentReportService = class IncidentReportService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createIncidentReport(teacherId, body) {
        if (!teacherId || !(0, validate_util_1.checkId)(teacherId)) {
            throw new common_1.HttpException('ID giáo viên không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        const { incidentType, severity, date, time, location, description, actionsTaken, studentsInvolved, witnessesPresent, classId, } = body || {};
        if (!incidentType || !severity || !description) {
            throw new common_1.HttpException('Thiếu dữ liệu bắt buộc', common_1.HttpStatus.BAD_REQUEST);
        }
        const data = {
            incidentType,
            severity,
            date: new Date(date || new Date()),
            time: time || new Date().toTimeString().slice(0, 5),
            location: location || null,
            description,
            actionsTaken: actionsTaken || null,
            studentsInvolved: studentsInvolved || null,
            witnessesPresent: witnessesPresent || null,
            reportedById: teacherId,
            status: 'PENDING',
        };
        if (classId && (0, validate_util_1.checkId)(classId)) {
            data.classId = classId;
        }
        const created = await this.prisma.incidentReport.create({ data });
        return {
            data: created,
            message: 'Tạo báo cáo sự cố thành công',
        };
    }
    async getMyIncidentReports(teacherId, options) {
        if (!teacherId || !(0, validate_util_1.checkId)(teacherId)) {
            throw new common_1.HttpException('ID giáo viên không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        const { page, limit, status } = options;
        const skip = (page - 1) * limit;
        const where = { reportedById: teacherId };
        if (status)
            where.status = status;
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
    async getIncidentReportDetail(teacherId, id) {
        if (!teacherId || !(0, validate_util_1.checkId)(teacherId)) {
            throw new common_1.HttpException('ID giáo viên không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!id || !(0, validate_util_1.checkId)(id)) {
            throw new common_1.HttpException('ID báo cáo không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        const item = await this.prisma.incidentReport.findFirst({
            where: { id, reportedById: teacherId },
            include: { class: true, reportedBy: { include: { user: true } } },
        });
        if (!item) {
            throw new common_1.HttpException('Không tìm thấy báo cáo', common_1.HttpStatus.NOT_FOUND);
        }
        return {
            data: item,
            message: 'Lấy chi tiết báo cáo sự cố thành công',
        };
    }
};
exports.IncidentReportService = IncidentReportService;
exports.IncidentReportService = IncidentReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IncidentReportService);
//# sourceMappingURL=incident-report.service.js.map