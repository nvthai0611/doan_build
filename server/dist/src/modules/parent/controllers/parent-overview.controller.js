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
exports.ParentOverviewController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const parent_overview_service_1 = require("../services/parent-overview.service");
let ParentOverviewController = class ParentOverviewController {
    constructor(parentOverviewService) {
        this.parentOverviewService = parentOverviewService;
    }
    async getOverview(req, date) {
        try {
            const parentUserId = req.user?.userId;
            if (!parentUserId) {
                throw new common_1.HttpException({ success: false, message: 'Không tìm thấy thông tin phụ huynh' }, common_1.HttpStatus.UNAUTHORIZED);
            }
            const result = await this.parentOverviewService.getParentOverview(parentUserId, date);
            return {
                success: true,
                data: result,
                message: 'Lấy overview thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy overview',
                error: error.message,
            }, error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ParentOverviewController = ParentOverviewController;
__decorate([
    (0, common_1.Get)('overview'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy overview dashboard cho parent' }),
    (0, swagger_1.ApiQuery)({
        name: 'date',
        required: false,
        description: 'Lọc theo ngày (YYYY-MM-DD), mặc định là hôm nay',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lấy overview thành công' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentOverviewController.prototype, "getOverview", null);
exports.ParentOverviewController = ParentOverviewController = __decorate([
    (0, swagger_1.ApiTags)('Parent - Overview'),
    (0, common_1.Controller)(''),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [parent_overview_service_1.ParentOverviewService])
], ParentOverviewController);
//# sourceMappingURL=parent-overview.controller.js.map