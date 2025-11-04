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
exports.TeachersController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const teachers_service_1 = require("./teachers.service");
const create_teacher_dto_1 = require("./dto/create-teacher.dto");
const update_teacher_dto_1 = require("./dto/update-teacher.dto");
const teacher_response_dto_1 = require("./dto/teacher-response.dto");
let TeachersController = class TeachersController {
    constructor(teachersService) {
        this.teachersService = teachersService;
    }
    async create(createTeacherDto) {
        try {
            return await this.teachersService.create(createTeacherDto);
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi tạo giáo viên',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findAll() {
        try {
            const result = await this.teachersService.findAll();
            if (!result.success) {
                throw new common_1.HttpException({
                    success: false,
                    message: result.message,
                    error: result.error
                }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            return result;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách giáo viên',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
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
            const result = await this.teachersService.findOne(id);
            if (!result.success) {
                const status = result.data === null ? common_1.HttpStatus.NOT_FOUND : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
                throw new common_1.HttpException({
                    success: false,
                    message: result.message,
                    error: result.error
                }, status);
            }
            return result;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy thông tin giáo viên',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(id, updateTeacherDto) {
        try {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(id)) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'ID không hợp lệ'
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            return await this.teachersService.update(id, updateTeacherDto);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi cập nhật giáo viên',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async remove(id) {
        try {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(id)) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'ID không hợp lệ'
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            return await this.teachersService.remove(id);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi xóa giáo viên',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getTeacherContracts(id) {
        try {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(id)) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'ID không hợp lệ'
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            return await this.teachersService.getTeacherContracts(id);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách hợp đồng',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteTeacherContract(teacherId, contractId) {
        try {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(teacherId) || !uuidRegex.test(contractId)) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'ID không hợp lệ'
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            return await this.teachersService.deleteTeacherContract(teacherId, contractId);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi xóa hợp đồng',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.TeachersController = TeachersController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo giáo viên mới' }),
    openapi.ApiResponse({ status: 201, type: String }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_teacher_dto_1.CreateTeacherDto]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách tất cả giáo viên' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lấy danh sách giáo viên thành công',
        type: teacher_response_dto_1.TeachersListResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Lỗi server'
    }),
    openapi.ApiResponse({ status: 200, type: require("./dto/teacher-response.dto").TeachersListResponseDto }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy thông tin chi tiết giáo viên theo ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của giáo viên (UUID)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lấy thông tin giáo viên thành công',
        type: teacher_response_dto_1.TeacherResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'ID không hợp lệ'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Không tìm thấy giáo viên'
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Lỗi server'
    }),
    openapi.ApiResponse({ status: 200, type: require("./dto/teacher-response.dto").TeacherResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật thông tin giáo viên' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của giáo viên (UUID)' }),
    openapi.ApiResponse({ status: 200, type: String }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_teacher_dto_1.UpdateTeacherDto]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa giáo viên' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của giáo viên (UUID)' }),
    openapi.ApiResponse({ status: 200, type: String }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/contracts'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách hợp đồng của giáo viên' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của giáo viên (UUID)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lấy danh sách hợp đồng thành công'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Không tìm thấy giáo viên'
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "getTeacherContracts", null);
__decorate([
    (0, common_1.Delete)(':id/contracts/:contractId'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa hợp đồng của giáo viên' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của giáo viên (UUID)' }),
    (0, swagger_1.ApiParam)({ name: 'contractId', description: 'ID của hợp đồng (UUID)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Xóa hợp đồng thành công'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Không tìm thấy hợp đồng'
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('contractId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "deleteTeacherContract", null);
exports.TeachersController = TeachersController = __decorate([
    (0, swagger_1.ApiTags)('Teachers'),
    (0, common_1.Controller)('teachers'),
    __metadata("design:paramtypes", [teachers_service_1.TeachersService])
], TeachersController);
//# sourceMappingURL=teachers.controller.js.map