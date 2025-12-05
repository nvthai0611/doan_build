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
exports.MaterialsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const materials_service_1 = require("../services/materials.service");
let MaterialsController = class MaterialsController {
    constructor(materialsService) {
        this.materialsService = materialsService;
    }
    async getMaterials(req, query) {
        const studentId = req.user?.studentId;
        if (!studentId) {
            throw new common_1.HttpException({ success: false, message: 'Không tìm thấy thông tin học sinh' }, common_1.HttpStatus.UNAUTHORIZED);
        }
        const queryAny = query;
        const classId = queryAny.params?.classId || query.classId;
        const limit = queryAny.params?.limit || query.limit;
        const page = queryAny.params?.page || query.page;
        const category = queryAny.params?.category || query.category;
        const search = queryAny.params?.search || query.search;
        const data = await this.materialsService.getMaterialsForStudent(studentId, {
            classId,
            category,
            search,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
        });
        return { success: true, data, message: 'Lấy danh sách tài liệu thành công' };
    }
    async markDownloaded(id) {
        await this.materialsService.incrementDownload(Number(id));
        return { success: true, message: 'Ghi nhận tải xuống thành công' };
    }
};
exports.MaterialsController = MaterialsController;
__decorate([
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MaterialsController.prototype, "getMaterials", null);
__decorate([
    (0, common_1.Post)(':id/download'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MaterialsController.prototype, "markDownloaded", null);
exports.MaterialsController = MaterialsController = __decorate([
    (0, common_1.Controller)('materials'),
    __metadata("design:paramtypes", [materials_service_1.MaterialsService])
], MaterialsController);
//# sourceMappingURL=materials.controller.js.map