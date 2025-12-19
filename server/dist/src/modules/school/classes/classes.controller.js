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
exports.ClassesController = void 0;
const openapi = require("@nestjs/swagger");
const classes_service_1 = require("./classes.service");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_response_dto_1 = require("./dto/class-response.dto");
let ClassesController = class ClassesController {
    constructor(classesService) {
        this.classesService = classesService;
    }
    async findOne(id) {
        try {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(id)) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'ID không hợp lệ'
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.classesService.findOne(id);
            if (!result) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy lớp học'
                }, common_1.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                message: 'Lấy thông tin lớp học thành công',
                data: result
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy thông tin lớp học',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getClassByTeacherId(teacherId) {
        try {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(teacherId)) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'ID giáo viên không hợp lệ'
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const classes = await this.classesService.getClassByTeacherId(teacherId);
            if (!classes || classes.length === 0) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không tìm thấy lớp học nào'
                }, common_1.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                message: 'Lấy danh sách lớp học thành công',
                data: classes
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách lớp học',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ClassesController = ClassesController;
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy thông tin chi tiết lớp học theo ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của lớp học (UUID)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lấy thông tin lớp học thành công',
        type: class_response_dto_1.ClassResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'ID không hợp lệ'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Không tìm thấy lớp học'
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Lỗi server'
    }),
    openapi.ApiResponse({ status: 200, type: require("./dto/class-response.dto").ClassResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('teacher/:teacherId'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách lớp học theo ID giáo viên' }),
    (0, swagger_1.ApiParam)({ name: 'teacherId', description: 'ID của giáo viên (UUID)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lấy danh sách lớp học thành công',
        type: class_response_dto_1.ClassesListResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'ID giáo viên không hợp lệ'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Không tìm thấy lớp học'
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Lỗi server'
    }),
    openapi.ApiResponse({ status: 200, type: require("./dto/class-response.dto").ClassesListResponseDto }),
    __param(0, (0, common_1.Param)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "getClassByTeacherId", null);
exports.ClassesController = ClassesController = __decorate([
    (0, swagger_1.ApiTags)('Classes'),
    (0, common_1.Controller)('classes'),
    __metadata("design:paramtypes", [classes_service_1.ClassesService])
], ClassesController);
//# sourceMappingURL=classes.controller.js.map