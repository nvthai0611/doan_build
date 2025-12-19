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
exports.SubjectManagementController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const subject_management_service_1 = require("../services/subject-management.service");
const create_subject_dto_1 = require("../dto/subject/create-subject.dto");
const update_subject_dto_1 = require("../dto/subject/update-subject.dto");
let SubjectManagementController = class SubjectManagementController {
    constructor(subjectService) {
        this.subjectService = subjectService;
    }
    async findAll() {
        const data = await this.subjectService.findAll();
        return { success: true, message: 'Lấy danh sách môn học thành công', data };
    }
    async findOne(id) {
        const data = await this.subjectService.findOne(id);
        return { success: true, message: 'Lấy chi tiết môn học thành công', data };
    }
    async create(dto) {
        const data = await this.subjectService.create(dto);
        return { success: true, message: 'Tạo môn học thành công', data };
    }
    async update(id, dto) {
        const data = await this.subjectService.update(id, dto);
        return { success: true, message: 'Cập nhật môn học thành công', data };
    }
    async remove(id) {
        await this.subjectService.remove(id);
        return { success: true, message: 'Xóa môn học thành công' };
    }
};
exports.SubjectManagementController = SubjectManagementController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách môn học' }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubjectManagementController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết môn học' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID môn học' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubjectManagementController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo môn học mới' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_subject_dto_1.CreateSubjectDto]),
    __metadata("design:returntype", Promise)
], SubjectManagementController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật môn học' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID môn học' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_subject_dto_1.UpdateSubjectDto]),
    __metadata("design:returntype", Promise)
], SubjectManagementController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa môn học' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID môn học' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubjectManagementController.prototype, "remove", null);
exports.SubjectManagementController = SubjectManagementController = __decorate([
    (0, swagger_1.ApiTags)('Admin Center - Subject Management'),
    (0, common_1.Controller)('subjects'),
    __metadata("design:paramtypes", [subject_management_service_1.SubjectManagementService])
], SubjectManagementController);
//# sourceMappingURL=subject-management.controller.js.map