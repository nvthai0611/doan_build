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
exports.StudentManagementController = void 0;
const openapi = require("@nestjs/swagger");
const student_management_service_1 = require("../services/student-management.service");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
let StudentManagementController = class StudentManagementController {
    constructor(studentManagementService) {
        this.studentManagementService = studentManagementService;
    }
    async getAllStudents(query) {
        return this.studentManagementService.getAllStudents(query.status, query.search, query.birthMonth, query.birthYear, query.gender, query.accountStatus, query.customerConnection, query.course, parseInt(query.page), parseInt(query.limit));
    }
    async countByStatus() {
        return this.studentManagementService.getCountByStatus();
    }
    async createStudent(createStudentDto, applicationFile, req) {
        try {
            if (!createStudentDto.fullName) {
                throw new common_1.HttpException('Họ tên là bắt buộc', common_1.HttpStatus.BAD_REQUEST);
            }
            const isParentCaller = req?.user?.role === 'parent';
            if (!isParentCaller) {
                if (!createStudentDto.username) {
                    throw new common_1.HttpException('Username là bắt buộc', common_1.HttpStatus.BAD_REQUEST);
                }
                const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
                if (!usernameRegex.test(createStudentDto.username)) {
                    throw new common_1.HttpException('Username chỉ chứa chữ cái, số và dấu gạch dưới, từ 3-20 ký tự', common_1.HttpStatus.BAD_REQUEST);
                }
            }
            if (!createStudentDto.schoolId) {
                throw new common_1.HttpException('School ID là bắt buộc', common_1.HttpStatus.BAD_REQUEST);
            }
            if (applicationFile) {
                createStudentDto.applicationFile = applicationFile;
            }
            if (createStudentDto.subjectIds) {
                if (typeof createStudentDto.subjectIds === 'string') {
                    try {
                        createStudentDto.subjectIds = JSON.parse(createStudentDto.subjectIds);
                    }
                    catch (e) {
                    }
                }
            }
            const context = isParentCaller
                ? { createdByRole: 'parent', parentUserId: req?.user?.userId }
                : { createdByRole: 'center_owner' };
            return await this.studentManagementService.createStudent(createStudentDto, context);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            if (error.message.includes('Username đã được sử dụng')) {
                throw new common_1.HttpException('Username đã được sử dụng', common_1.HttpStatus.BAD_REQUEST);
            }
            if (error.message.includes('Trường học không tồn tại')) {
                throw new common_1.HttpException('Trường học không tồn tại', common_1.HttpStatus.BAD_REQUEST);
            }
            throw new common_1.HttpException(error.message || 'Lỗi server khi tạo tài khoản học sinh', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findParentByEmail(email) {
        try {
            if (!email) {
                throw new common_1.HttpException('Email là bắt buộc', common_1.HttpStatus.BAD_REQUEST);
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new common_1.HttpException('Email không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
            }
            return await this.studentManagementService.findParentByEmail(email);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(error.message || 'Lỗi server khi tìm kiếm phụ huynh', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async toggleStudentStatus(studentId) {
        try {
            if (!studentId) {
                throw new common_1.HttpException('Student ID is required', common_1.HttpStatus.BAD_REQUEST);
            }
            return await this.studentManagementService.toggleStudentStatus(studentId);
        }
        catch (error) {
            if (error.message === 'Student not found') {
                throw new common_1.HttpException('Student not found', common_1.HttpStatus.NOT_FOUND);
            }
            throw new common_1.HttpException(error.message || 'Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateStudentStatus(studentId, updateStudentStatusDto) {
        try {
            if (!studentId) {
                throw new common_1.HttpException('Student ID is required', common_1.HttpStatus.BAD_REQUEST);
            }
            if (typeof updateStudentStatusDto.isActive !== 'boolean') {
                throw new common_1.HttpException('isActive must be a boolean value', common_1.HttpStatus.BAD_REQUEST);
            }
            return await this.studentManagementService.updateStudentStatus(studentId, updateStudentStatusDto.isActive);
        }
        catch (error) {
            if (error.message === 'Student not found') {
                throw new common_1.HttpException('Student not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(error.message || 'Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateStudent(studentId, updateStudentDto) {
        try {
            if (!studentId) {
                throw new common_1.HttpException('Student ID is required', common_1.HttpStatus.BAD_REQUEST);
            }
            if (updateStudentDto.fullName !== undefined && !updateStudentDto.fullName.trim()) {
                throw new common_1.HttpException('Họ tên không được để trống', common_1.HttpStatus.BAD_REQUEST);
            }
            if (updateStudentDto.phone && updateStudentDto.phone.trim()) {
                const phoneRegex = /^[0-9]{10,11}$/;
                if (!phoneRegex.test(updateStudentDto.phone.trim())) {
                    throw new common_1.HttpException('Số điện thoại không hợp lệ (10-11 chữ số)', common_1.HttpStatus.BAD_REQUEST);
                }
            }
            return await this.studentManagementService.updateStudent(studentId, updateStudentDto);
        }
        catch (error) {
            if (error.message.includes('không tồn tại')) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.NOT_FOUND);
            }
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(error.message || 'Failed to update student', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateStudentParent(studentId, updateParentDto) {
        try {
            if (!studentId) {
                throw new common_1.HttpException('Student ID is required', common_1.HttpStatus.BAD_REQUEST);
            }
            if (updateParentDto.parentId === undefined) {
                throw new common_1.HttpException('parentId field is required', common_1.HttpStatus.BAD_REQUEST);
            }
            return await this.studentManagementService.updateStudentParent(studentId, updateParentDto.parentId);
        }
        catch (error) {
            if (error.message.includes('không tồn tại')) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.NOT_FOUND);
            }
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(error.message || 'Failed to update student parent', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAttendanceByStudentAndClass(studentId, classId) {
        try {
            if (!studentId || !classId) {
                throw new common_1.HttpException('studentId and classId are required', common_1.HttpStatus.BAD_REQUEST);
            }
            return await this.studentManagementService.getAttendanceByStudentIdAndClassId(studentId, classId);
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            console.error('Error in controller getAttendanceByStudentAndClass:', error);
            throw new common_1.HttpException(error.message || 'Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.StudentManagementController = StudentManagementController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "Lấy danh sách học sinh" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Danh sách học sinh"
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: "Không tìm thấy danh sách học sinh"
    }),
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StudentManagementController.prototype, "getAllStudents", null);
__decorate([
    (0, common_1.Get)('count-status'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StudentManagementController.prototype, "countByStatus", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "Tạo mới tài khoản học sinh" }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: "Tạo tài khoản học sinh thành công"
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: "Dữ liệu không hợp lệ hoặc email đã tồn tại"
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: "Lỗi server khi tạo tài khoản"
    }),
    (0, swagger_1.ApiBody)({
        description: 'Thông tin tạo tài khoản học sinh',
        schema: {
            type: 'object',
            required: ['fullName', 'username', 'schoolId'],
            properties: {
                fullName: {
                    type: 'string',
                    description: 'Họ và tên học sinh',
                    example: 'Nguyễn Văn A'
                },
                username: {
                    type: 'string',
                    description: 'Tên đăng nhập học sinh',
                    example: 'student001'
                },
                phone: {
                    type: 'string',
                    description: 'Số điện thoại (tùy chọn)',
                    example: '0123456789'
                },
                gender: {
                    type: 'string',
                    enum: ['MALE', 'FEMALE', 'OTHER'],
                    description: 'Giới tính',
                    example: 'MALE'
                },
                birthDate: {
                    type: 'string',
                    format: 'date',
                    description: 'Ngày sinh (định dạng YYYY-MM-DD)',
                    example: '2005-01-15'
                },
                address: {
                    type: 'string',
                    description: 'Địa chỉ (tùy chọn)',
                    example: '123 Đường ABC, Quận 1, TP.HCM'
                },
                grade: {
                    type: 'string',
                    description: 'Lớp học (tùy chọn)',
                    example: '10A1'
                },
                parentId: {
                    type: 'string',
                    description: 'ID phụ huynh (tùy chọn)',
                    example: 'uuid-parent-id'
                },
                schoolId: {
                    type: 'string',
                    description: 'ID trường học',
                    example: 'uuid-school-id'
                },
                password: {
                    type: 'string',
                    description: 'Mật khẩu (tùy chọn, mặc định là 123456)',
                    example: 'password123'
                }
            }
        }
    }),
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('applicationFile', {
        limits: {
            fileSize: 5 * 1024 * 1024
        },
        fileFilter: (req, file, cb) => {
            const allowedMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new common_1.HttpException('Chỉ chấp nhận file PDF, JPG hoặc PNG', common_1.HttpStatus.BAD_REQUEST), false);
            }
        }
    })),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], StudentManagementController.prototype, "createStudent", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "Tìm kiếm phụ huynh theo email" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Tìm kiếm thành công (có thể không tìm thấy)"
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: "Email không hợp lệ"
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: "Lỗi server khi tìm kiếm"
    }),
    (0, common_1.Get)('search-parent'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StudentManagementController.prototype, "findParentByEmail", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "Thay đổi trạng thái tài khoản học sinh (toggle)" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Cập nhật trạng thái thành công"
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: "Không tìm thấy học sinh"
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: "Lỗi server khi cập nhật trạng thái"
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID của học sinh cần cập nhật trạng thái',
        type: 'string'
    }),
    (0, common_1.Patch)(':id/toggle-status'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StudentManagementController.prototype, "toggleStudentStatus", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "Cập nhật trạng thái tài khoản học sinh (set specific status)" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Cập nhật trạng thái thành công"
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: "Dữ liệu không hợp lệ"
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: "Không tìm thấy học sinh"
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: "Lỗi server khi cập nhật trạng thái"
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID của học sinh cần cập nhật trạng thái',
        type: 'string'
    }),
    (0, common_1.Patch)(':id/status'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StudentManagementController.prototype, "updateStudentStatus", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "Cập nhật thông tin học sinh" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Cập nhật thông tin học sinh thành công"
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: "Dữ liệu không hợp lệ"
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: "Không tìm thấy học sinh"
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID của học sinh cần cập nhật',
        type: 'string'
    }),
    (0, swagger_1.ApiBody)({
        description: 'Thông tin cập nhật học sinh',
        schema: {
            type: 'object',
            properties: {
                fullName: {
                    type: 'string',
                    description: 'Họ và tên học sinh',
                    example: 'Nguyễn Văn A'
                },
                phone: {
                    type: 'string',
                    description: 'Số điện thoại',
                    example: '0987654321'
                },
                gender: {
                    type: 'string',
                    enum: ['MALE', 'FEMALE', 'OTHER'],
                    description: 'Giới tính',
                    example: 'MALE'
                },
                birthDate: {
                    type: 'string',
                    format: 'date',
                    description: 'Ngày sinh (định dạng YYYY-MM-DD)',
                    example: '2010-01-15'
                },
                address: {
                    type: 'string',
                    description: 'Địa chỉ',
                    example: '123 Đường ABC, Quận 1, TP.HCM'
                },
                grade: {
                    type: 'string',
                    description: 'Lớp học',
                    example: '10A1'
                },
                schoolId: {
                    type: 'string',
                    description: 'ID trường học',
                    example: 'uuid-school-id'
                }
            }
        }
    }),
    (0, common_1.Put)(':id'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StudentManagementController.prototype, "updateStudent", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "Cập nhật liên kết phụ huynh cho học sinh" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Cập nhật liên kết phụ huynh thành công"
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: "Dữ liệu không hợp lệ"
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: "Không tìm thấy học sinh hoặc phụ huynh"
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID của học sinh cần cập nhật',
        type: 'string'
    }),
    (0, swagger_1.ApiBody)({
        description: 'Thông tin liên kết phụ huynh',
        schema: {
            type: 'object',
            required: ['parentId'],
            properties: {
                parentId: {
                    type: 'string',
                    nullable: true,
                    description: 'ID phụ huynh (null để hủy liên kết)',
                    example: 'uuid-parent-id'
                }
            }
        }
    }),
    (0, common_1.Put)(':id/parent'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StudentManagementController.prototype, "updateStudentParent", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Lấy attendance của học sinh theo lớp (để tính tiền)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Thông tin điểm danh' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid studentId or classId' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Lớp hoặc học viên không tồn tại' }),
    (0, swagger_1.ApiParam)({ name: 'studentId', description: 'ID học sinh', type: 'string' }),
    (0, swagger_1.ApiParam)({ name: 'classId', description: 'ID lớp', type: 'string' }),
    (0, common_1.Get)(':studentId/classes/:classId/attendance'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Param)('classId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StudentManagementController.prototype, "getAttendanceByStudentAndClass", null);
exports.StudentManagementController = StudentManagementController = __decorate([
    (0, common_1.Injectable)(),
    (0, swagger_1.ApiTags)('Admin Center -Student Management'),
    (0, common_1.Controller)('student-management'),
    __metadata("design:paramtypes", [student_management_service_1.StudentManagementService])
], StudentManagementController);
//# sourceMappingURL=student-management.controller.js.map