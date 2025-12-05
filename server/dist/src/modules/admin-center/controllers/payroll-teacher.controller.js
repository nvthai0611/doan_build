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
exports.PayrollTeacherController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payroll_teacher_service_1 = require("../services/payroll-teacher.service");
let PayrollTeacherController = class PayrollTeacherController {
    constructor(PayRollTeacherService) {
        this.PayRollTeacherService = PayRollTeacherService;
    }
    async getListTeachers(teacherName, email, status, month) {
        return this.PayRollTeacherService.getListTeachers(teacherName, email, status, month);
    }
    async getPayrollDetails(teacherId, year, classId) {
        return this.PayRollTeacherService.getAllPayrollsByTeacherId(teacherId, year, classId);
    }
    async getPayrollById(payrollId) {
        return this.PayRollTeacherService.getPayrollById(payrollId);
    }
    async getClassSessionsByClass(classId, month, teacherId) {
        return this.PayRollTeacherService.getClassSessionsByClassId(classId, month, teacherId);
    }
};
exports.PayrollTeacherController = PayrollTeacherController;
__decorate([
    (0, common_1.Get)('teachers'),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, common_1.Query)('teacherName')),
    __param(1, (0, common_1.Query)('email')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], PayrollTeacherController.prototype, "getListTeachers", null);
__decorate([
    (0, common_1.Get)('payrolls/:teacherId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('teacherId')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('classId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PayrollTeacherController.prototype, "getPayrollDetails", null);
__decorate([
    (0, common_1.Get)('payroll/:payrollId/detail'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('payrollId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayrollTeacherController.prototype, "getPayrollById", null);
__decorate([
    (0, common_1.Get)('classes/:classId/sessions'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('classId')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PayrollTeacherController.prototype, "getClassSessionsByClass", null);
exports.PayrollTeacherController = PayrollTeacherController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Payroll Teacher'),
    (0, common_1.Controller)('payroll-teacher'),
    __metadata("design:paramtypes", [payroll_teacher_service_1.PayRollTeacherService])
], PayrollTeacherController);
//# sourceMappingURL=payroll-teacher.controller.js.map