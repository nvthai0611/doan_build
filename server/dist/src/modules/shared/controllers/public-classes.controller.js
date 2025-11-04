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
exports.PublicClassesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_classes_service_1 = require("../services/public-classes.service");
let PublicClassesController = class PublicClassesController {
    constructor(publicClassesService) {
        this.publicClassesService = publicClassesService;
    }
    async getRecruitingClasses(page, limit, subjectId, gradeId) {
        console.log();
        return this.publicClassesService.getRecruitingClasses({
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
            subjectId,
            gradeId,
        });
    }
    async getSubjects() {
        return this.publicClassesService.getSubjects();
    }
    async getGrades() {
        return this.publicClassesService.getGrades();
    }
};
exports.PublicClassesController = PublicClassesController;
__decorate([
    (0, common_1.Get)('recruiting'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lấy danh sách lớp đang tuyển sinh (Public API - không cần auth)',
        description: 'API công khai để hiển thị danh sách lớp đang tuyển sinh trên trang chủ'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Danh sách lớp đang tuyển sinh'
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('subjectId')),
    __param(3, (0, common_1.Query)('gradeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], PublicClassesController.prototype, "getRecruitingClasses", null);
__decorate([
    (0, common_1.Get)('subjects'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lấy danh sách môn học (Public)',
        description: 'Danh sách môn học để filter trên homepage'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách môn học' }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublicClassesController.prototype, "getSubjects", null);
__decorate([
    (0, common_1.Get)('grades'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lấy danh sách khối lớp (Public)',
        description: 'Danh sách khối lớp để filter trên homepage'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách khối lớp' }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublicClassesController.prototype, "getGrades", null);
exports.PublicClassesController = PublicClassesController = __decorate([
    (0, swagger_1.ApiTags)('Public - Classes'),
    (0, common_1.Controller)('public/classes'),
    __metadata("design:paramtypes", [public_classes_service_1.PublicClassesService])
], PublicClassesController);
//# sourceMappingURL=public-classes.controller.js.map