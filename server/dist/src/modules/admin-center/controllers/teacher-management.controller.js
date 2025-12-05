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
exports.TeacherManagementController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const teacher_management_service_1 = require("../services/teacher-management.service");
const create_teacher_dto_1 = require("../dto/teacher/create-teacher.dto");
const update_teacher_dto_1 = require("../dto/teacher/update-teacher.dto");
const swagger_1 = require("@nestjs/swagger");
let TeacherManagementController = class TeacherManagementController {
    constructor(teacherManagementService) {
        this.teacherManagementService = teacherManagementService;
    }
    create(createTeacherDto, file) {
        if (file) {
            createTeacherDto.contractImage = file;
        }
        return this.teacherManagementService.createTeacher(createTeacherDto);
    }
    findAll(queryDto) {
        return this.teacherManagementService.findAllTeachers(queryDto);
    }
    findOne(id) {
        return this.teacherManagementService.findOneTeacher(id);
    }
    update(id, updateTeacherDto, file) {
        if (file) {
            updateTeacherDto.contractImage = file;
        }
        return this.teacherManagementService.updateTeacher(id, updateTeacherDto);
    }
    remove(id) {
        return this.teacherManagementService.removeTeacher(id);
    }
    toggleStatus(id) {
        return this.teacherManagementService.toggleTeacherStatus(id);
    }
    getSchedule(id, year, month) {
        const yearNum = year ? parseInt(year) : undefined;
        const monthNum = month ? parseInt(month) : undefined;
        return this.teacherManagementService.getTeacherSchedule(id, yearNum, monthNum);
    }
    async validateBulkImport(body) {
        return this.teacherManagementService.validateTeachersData(body.teachers);
    }
    bulkImport(body) {
        console.log("Creating teachers:", body.teachers.length);
        return this.teacherManagementService.bulkImportTeachers(body.teachers);
    }
    getTeacherContracts(id) {
        return this.teacherManagementService.getTeacherContracts(id);
    }
    uploadContractForTeacher(teacherId, file, contractType, startDate, expiryDate, teacherSalaryPercent, notes) {
        const salaryPercent = parseFloat(teacherSalaryPercent);
        if (isNaN(salaryPercent) || salaryPercent < 0 || salaryPercent > 100) {
            throw new common_1.HttpException('teacherSalaryPercent must be between 0 and 100', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.teacherManagementService.uploadContractForTeacher(teacherId, file, contractType, startDate, expiryDate, notes, salaryPercent);
    }
    deleteTeacherContract(teacherId, contractId) {
        return this.teacherManagementService.deleteTeacherContract(teacherId, contractId);
    }
};
exports.TeacherManagementController = TeacherManagementController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('contractImage')),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_teacher_dto_1.CreateTeacherDto, Object]),
    __metadata("design:returntype", void 0)
], TeacherManagementController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TeacherManagementController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TeacherManagementController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('contractImage')),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_teacher_dto_1.UpdateTeacherDto, Object]),
    __metadata("design:returntype", void 0)
], TeacherManagementController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TeacherManagementController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-status'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TeacherManagementController.prototype, "toggleStatus", null);
__decorate([
    (0, common_1.Get)(':id/schedule'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], TeacherManagementController.prototype, "getSchedule", null);
__decorate([
    (0, common_1.Post)('bulk-import-validate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherManagementController.prototype, "validateBulkImport", null);
__decorate([
    (0, common_1.Post)('bulk-import'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TeacherManagementController.prototype, "bulkImport", null);
__decorate([
    (0, common_1.Get)(':id/contracts'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TeacherManagementController.prototype, "getTeacherContracts", null);
__decorate([
    (0, common_1.Post)(':id/contracts/upload'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('contractType')),
    __param(3, (0, common_1.Body)('startDate')),
    __param(4, (0, common_1.Body)('expiryDate')),
    __param(5, (0, common_1.Body)('teacherSalaryPercent')),
    __param(6, (0, common_1.Body)('notes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], TeacherManagementController.prototype, "uploadContractForTeacher", null);
__decorate([
    (0, common_1.Delete)(':id/contracts/:contractId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('contractId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TeacherManagementController.prototype, "deleteTeacherContract", null);
exports.TeacherManagementController = TeacherManagementController = __decorate([
    (0, swagger_1.ApiTags)('Admin Center - Teacher Management'),
    (0, common_1.Controller)('/teachers'),
    __metadata("design:paramtypes", [teacher_management_service_1.TeacherManagementService])
], TeacherManagementController);
//# sourceMappingURL=teacher-management.controller.js.map