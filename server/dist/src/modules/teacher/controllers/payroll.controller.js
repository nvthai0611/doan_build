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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payroll_service_1 = require("../services/payroll.service");
let PayrollController = class PayrollController {
    constructor(payrollService) {
        this.payrollService = payrollService;
    }
    async getTeacherPayrolls(req, month, status, page, limit) {
        const teacherId = req.user.teacherId;
        return this.payrollService.getTeacherPayroll({
            teacherId,
            month,
            status,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10
        });
    }
    async getPayrollDetail(payrollId, classId, startDate, endDate, page, limit) {
        return this.payrollService.getPayrollDetail({
            payrollId,
            classId,
            startDate,
            endDate,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10
        });
    }
    async approvePayroll(req, payrollId) {
        const teacherId = req.user.teacherId;
        return this.payrollService.approvePayroll(teacherId, payrollId);
    }
    async rejectPayroll(req, payrollId, teacherRejectionReason) {
        const teacherId = req.user.teacherId;
        console.log(teacherRejectionReason);
        return this.payrollService.rejectPayroll(teacherId, payrollId, teacherRejectionReason);
    }
};
exports.PayrollController = PayrollController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách lương của giáo viên' }),
    (0, swagger_1.ApiQuery)({ name: 'teacherId', required: true, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'month', required: false, type: String, description: 'Format: YYYY-MM' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getTeacherPayrolls", null);
__decorate([
    (0, common_1.Get)(':payrollId'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết payroll' }),
    (0, swagger_1.ApiParam)({ name: 'payrollId', required: true, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'classId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String, description: 'Format: YYYY-MM-DD' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String, description: 'Format: YYYY-MM-DD' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('payrollId')),
    __param(1, (0, common_1.Query)('classId')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayrollDetail", null);
__decorate([
    (0, common_1.Patch)(':payrollId/approve'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('payrollId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "approvePayroll", null);
__decorate([
    (0, common_1.Post)(':payrollId/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Từ chối bảng lương' }),
    (0, swagger_1.ApiParam)({ name: 'payrollId', required: true, type: String }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                rejectionReason: {
                    type: 'string',
                    description: 'Lý do từ chối (tối thiểu 10 ký tự)',
                    example: 'Số buổi học không chính xác, cần kiểm tra lại'
                }
            },
            required: ['rejectionReason']
        }
    }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('payrollId')),
    __param(2, (0, common_1.Body)('teacherRejectionReason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "rejectPayroll", null);
exports.PayrollController = PayrollController = __decorate([
    (0, swagger_1.ApiTags)('Teacher - Payroll'),
    (0, common_1.Controller)('payroll'),
    __metadata("design:paramtypes", [payroll_service_1.PayrollService])
], PayrollController);
//# sourceMappingURL=payroll.controller.js.map