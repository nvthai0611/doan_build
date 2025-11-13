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
exports.ChildClassesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const student_leave_request_service_1 = require("../services/student-leave-request.service");
let ChildClassesController = class ChildClassesController {
    constructor(studentLeaveRequestService) {
        this.studentLeaveRequestService = studentLeaveRequestService;
    }
    async getAllChildrenClasses(req) {
        try {
            const parentUserId = req.user?.userId;
            if (!parentUserId) {
                throw new common_1.HttpException({ success: false, message: 'Không tìm thấy thông tin phụ huynh' }, common_1.HttpStatus.UNAUTHORIZED);
            }
            const result = await this.studentLeaveRequestService.getAllChildrenClasses(parentUserId);
            return {
                success: true,
                data: result,
                message: 'Lấy danh sách lớp học thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách lớp học',
                error: error.message,
            }, error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getChildClasses(req, studentId) {
        try {
            const parentUserId = req.user?.userId;
            if (!parentUserId) {
                throw new common_1.HttpException({ success: false, message: 'Không tìm thấy thông tin phụ huynh' }, common_1.HttpStatus.UNAUTHORIZED);
            }
            const result = await this.studentLeaveRequestService.getChildClasses(parentUserId, studentId);
            const list = Array.isArray(result)
                ? result
                : (result && Array.isArray(result.data))
                    ? result.data
                    : [];
            return {
                success: true,
                data: list,
                message: 'Lấy danh sách lớp học thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách lớp học',
                error: error.message,
            }, error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ChildClassesController = ChildClassesController;
__decorate([
    (0, common_1.Get)('children-classes'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy tất cả lớp học của tất cả con' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lấy danh sách lớp học thành công' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChildClassesController.prototype, "getAllChildrenClasses", null);
__decorate([
    (0, common_1.Get)('students/:studentId/classes'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách lớp học của một con cụ thể' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lấy danh sách lớp học thành công' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChildClassesController.prototype, "getChildClasses", null);
exports.ChildClassesController = ChildClassesController = __decorate([
    (0, swagger_1.ApiTags)('Parent - Child Classes'),
    (0, common_1.Controller)(''),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [student_leave_request_service_1.StudentLeaveRequestService])
], ChildClassesController);
//# sourceMappingURL=child-classes.controller.js.map