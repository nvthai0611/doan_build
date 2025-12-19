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
exports.PublicCenterInfoController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_center_info_service_1 = require("../services/public-center-info.service");
let PublicCenterInfoController = class PublicCenterInfoController {
    constructor(publicCenterInfoService) {
        this.publicCenterInfoService = publicCenterInfoService;
    }
    async getCenterInfo() {
        return this.publicCenterInfoService.getCenterInfo();
    }
};
exports.PublicCenterInfoController = PublicCenterInfoController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Lấy thông tin trung tâm (Public API - không cần auth)',
        description: 'API công khai để hiển thị thông tin trung tâm trên trang chủ',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lấy thông tin trung tâm thành công',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy thông tin trung tâm' }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublicCenterInfoController.prototype, "getCenterInfo", null);
exports.PublicCenterInfoController = PublicCenterInfoController = __decorate([
    (0, swagger_1.ApiTags)('Public - Center Info'),
    (0, common_1.Controller)('public/center-info'),
    __metadata("design:paramtypes", [public_center_info_service_1.PublicCenterInfoService])
], PublicCenterInfoController);
//# sourceMappingURL=public-center-info.controller.js.map