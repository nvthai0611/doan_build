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
exports.CenterInfoController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const center_info_service_1 = require("../services/center-info.service");
let CenterInfoController = class CenterInfoController {
    constructor(centerInfoService) {
        this.centerInfoService = centerInfoService;
    }
    async getCenterInfo() {
        return this.centerInfoService.getCenterInfo();
    }
    async updateCenterInfo(body, files) {
        let data;
        try {
            data = typeof body.data === 'string' ? JSON.parse(body.data) : body.data;
        }
        catch (error) {
            throw new common_1.BadRequestException('Dữ liệu JSON không hợp lệ');
        }
        const logoFile = files?.logoFile?.[0];
        const bannerFile = files?.bannerFile?.[0];
        return this.centerInfoService.updateCenterInfo(data, logoFile, bannerFile);
    }
};
exports.CenterInfoController = CenterInfoController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy thông tin trung tâm' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lấy thông tin trung tâm thành công',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy thông tin trung tâm' }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CenterInfoController.prototype, "getCenterInfo", null);
__decorate([
    (0, common_1.Put)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'logoFile', maxCount: 1 },
        { name: 'bannerFile', maxCount: 1 },
    ], {
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new common_1.BadRequestException('Chỉ chấp nhận file ảnh (PNG, JPG, WEBP, SVG)'), false);
            }
        }
    })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật thông tin trung tâm (có thể kèm file logo/banner)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Cập nhật thông tin trung tâm thành công',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dữ liệu không hợp lệ' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'string',
                    description: 'JSON string của CenterInfoSettingDto',
                },
                logoFile: {
                    type: 'string',
                    format: 'binary',
                    description: 'File logo (optional)',
                },
                bannerFile: {
                    type: 'string',
                    format: 'binary',
                    description: 'File banner (optional)',
                },
            },
            required: ['data'],
        },
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CenterInfoController.prototype, "updateCenterInfo", null);
exports.CenterInfoController = CenterInfoController = __decorate([
    (0, swagger_1.ApiTags)('Admin Center - Center Info'),
    (0, common_1.Controller)('center-info'),
    __metadata("design:paramtypes", [center_info_service_1.CenterInfoService])
], CenterInfoController);
//# sourceMappingURL=center-info.controller.js.map