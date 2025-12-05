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
exports.PublicShowcasesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_showcases_service_1 = require("../services/public-showcases.service");
let PublicShowcasesController = class PublicShowcasesController {
    constructor(publicShowcasesService) {
        this.publicShowcasesService = publicShowcasesService;
    }
    async getShowcases(featured) {
        const query = {};
        if (featured !== undefined) {
            query.featured = featured === 'true';
        }
        return this.publicShowcasesService.getShowcases(query);
    }
};
exports.PublicShowcasesController = PublicShowcasesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Lấy danh sách học sinh tiêu biểu (Public API - không cần auth)',
        description: 'API công khai để hiển thị danh sách học sinh tiêu biểu và xuất sắc trên trang chủ',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'featured',
        required: false,
        type: Boolean,
        description: 'Lọc theo học sinh nổi bật (true/false)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Danh sách học sinh tiêu biểu',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('featured')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicShowcasesController.prototype, "getShowcases", null);
exports.PublicShowcasesController = PublicShowcasesController = __decorate([
    (0, swagger_1.ApiTags)('Public - Showcases'),
    (0, common_1.Controller)('public/showcases'),
    __metadata("design:paramtypes", [public_showcases_service_1.PublicShowcasesService])
], PublicShowcasesController);
//# sourceMappingURL=public-showcases.controller.js.map