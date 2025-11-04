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
exports.ClassJoinController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const common_2 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const class_join_service_1 = require("../services/class-join.service");
const join_class_dto_1 = require("../dto/request/join-class.dto");
let ClassJoinController = class ClassJoinController {
    constructor(classJoinService) {
        this.classJoinService = classJoinService;
    }
    async getClassInfo(req, dto) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new common_1.HttpException({ success: false, message: 'Không tìm thấy thông tin người dùng' }, common_1.HttpStatus.UNAUTHORIZED);
            }
            return await this.classJoinService.getClassInfoByCodeOrLink(userId, dto);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy thông tin lớp học',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async requestJoinClass(req, dto) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new common_1.HttpException({ success: false, message: 'Không tìm thấy thông tin người dùng' }, common_1.HttpStatus.UNAUTHORIZED);
            }
            return await this.classJoinService.requestJoinClass(userId, dto);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi gửi yêu cầu tham gia',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getMyRequests(req, status, page, limit) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new common_1.HttpException({ success: false, message: 'Không tìm thấy thông tin người dùng' }, common_1.HttpStatus.UNAUTHORIZED);
            }
            return await this.classJoinService.getMyClassRequests(userId, {
                status,
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 10,
            });
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách yêu cầu',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ClassJoinController = ClassJoinController;
__decorate([
    (0, common_1.Post)('get-class-info'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy thông tin lớp học từ classCode hoặc link' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lấy thông tin lớp học thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy lớp học' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, join_class_dto_1.JoinClassByCodeDto]),
    __metadata("design:returntype", Promise)
], ClassJoinController.prototype, "getClassInfo", null);
__decorate([
    (0, common_1.Post)('request-join'),
    (0, common_2.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)()),
    (0, swagger_1.ApiOperation)({ summary: 'Gửi yêu cầu tham gia lớp học cho con' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Gửi yêu cầu thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy lớp học hoặc học sinh' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Lớp học đã đầy hoặc đã có yêu cầu pending' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                classId: { type: 'string', format: 'uuid' },
                studentId: { type: 'string', format: 'uuid' },
                contractUploadId: { type: 'string', format: 'uuid', description: 'ID của hợp đồng đã upload (BẮT BUỘC)' },
                password: { type: 'string' },
                message: { type: 'string' },
            },
            required: ['classId', 'studentId', 'contractUploadId']
        },
    }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, join_class_dto_1.RequestJoinClassDto]),
    __metadata("design:returntype", Promise)
], ClassJoinController.prototype, "requestJoinClass", null);
__decorate([
    (0, common_1.Get)('my-requests'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách yêu cầu tham gia lớp của parent' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lấy danh sách yêu cầu thành công' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number]),
    __metadata("design:returntype", Promise)
], ClassJoinController.prototype, "getMyRequests", null);
exports.ClassJoinController = ClassJoinController = __decorate([
    (0, swagger_1.ApiTags)('Parent - Class Join'),
    (0, common_1.Controller)('class-join'),
    __metadata("design:paramtypes", [class_join_service_1.ClassJoinService])
], ClassJoinController);
//# sourceMappingURL=class-join.controller.js.map