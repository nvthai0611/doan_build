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
exports.PublicTeachersController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_teachers_service_1 = require("../services/public-teachers.service");
let PublicTeachersController = class PublicTeachersController {
    constructor(publicTeachersService) {
        this.publicTeachersService = publicTeachersService;
    }
    async getTeachers(subjectId, limit) {
        return this.publicTeachersService.getTeachers({
            subjectId,
            limit: limit ? Number(limit) : undefined,
        });
    }
};
exports.PublicTeachersController = PublicTeachersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Lấy danh sách giáo viên (Public API - không cần auth)',
        description: 'API công khai để hiển thị danh sách giáo viên trên trang chủ',
    }),
    (0, swagger_1.ApiQuery)({ name: 'subjectId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách giáo viên' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('subjectId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], PublicTeachersController.prototype, "getTeachers", null);
exports.PublicTeachersController = PublicTeachersController = __decorate([
    (0, swagger_1.ApiTags)('Public - Teachers'),
    (0, common_1.Controller)('public/teachers'),
    __metadata("design:paramtypes", [public_teachers_service_1.PublicTeachersService])
], PublicTeachersController);
//# sourceMappingURL=public-teachers.controller.js.map