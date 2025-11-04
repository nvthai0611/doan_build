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
exports.ParentManagementController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const parent_management_service_1 = require("../services/parent-management.service");
let ParentManagementController = class ParentManagementController {
    constructor(parentManagementService) {
        this.parentManagementService = parentManagementService;
    }
    async createParentWithStudents(body) {
        if (!body.username || body.username.trim().length < 3 || body.username.trim().length > 20) {
            throw new common_1.HttpException('Username phụ huynh phải từ 3-20 ký tự', common_1.HttpStatus.BAD_REQUEST);
        }
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(body.username)) {
            throw new common_1.HttpException('Username phụ huynh chỉ được chứa chữ, số và dấu gạch dưới', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!body.password || body.password.length < 6) {
            throw new common_1.HttpException('Mật khẩu phải có ít nhất 6 ký tự', common_1.HttpStatus.BAD_REQUEST);
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!body.email || !emailRegex.test(body.email)) {
            throw new common_1.HttpException('Email phụ huynh không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!body.fullName || body.fullName.trim().length === 0) {
            throw new common_1.HttpException('Họ và tên phụ huynh không được để trống', common_1.HttpStatus.BAD_REQUEST);
        }
        if (body.phone) {
            const phoneRegex = /^[0-9]{10,11}$/;
            if (!phoneRegex.test(body.phone)) {
                throw new common_1.HttpException('Số điện thoại phụ huynh phải có 10-11 chữ số', common_1.HttpStatus.BAD_REQUEST);
            }
        }
        if (body.students && body.students.length > 0) {
            for (let i = 0; i < body.students.length; i++) {
                const student = body.students[i];
                if (!student.fullName || student.fullName.trim().length === 0) {
                    throw new common_1.HttpException(`Họ và tên học sinh ${i + 1} không được để trống`, common_1.HttpStatus.BAD_REQUEST);
                }
                if (!student.username || student.username.trim().length < 3 || student.username.trim().length > 20) {
                    throw new common_1.HttpException(`Username học sinh ${i + 1} phải từ 3-20 ký tự`, common_1.HttpStatus.BAD_REQUEST);
                }
                if (!usernameRegex.test(student.username)) {
                    throw new common_1.HttpException(`Username học sinh ${i + 1} chỉ được chứa chữ, số và dấu gạch dưới`, common_1.HttpStatus.BAD_REQUEST);
                }
                if (!student.schoolId) {
                    throw new common_1.HttpException(`Trường học cho học sinh ${i + 1} không được để trống`, common_1.HttpStatus.BAD_REQUEST);
                }
                if (student.email && student.email.trim() && !emailRegex.test(student.email)) {
                    throw new common_1.HttpException(`Email học sinh ${i + 1} không hợp lệ`, common_1.HttpStatus.BAD_REQUEST);
                }
                if (student.phone && student.phone.trim()) {
                    const phoneRegex = /^[0-9]{10,11}$/;
                    if (!phoneRegex.test(student.phone)) {
                        throw new common_1.HttpException(`Số điện thoại học sinh ${i + 1} phải có 10-11 chữ số`, common_1.HttpStatus.BAD_REQUEST);
                    }
                }
            }
        }
        const result = await this.parentManagementService.createParentWithStudents({
            username: body.username.trim(),
            password: body.password,
            email: body.email.trim(),
            fullName: body.fullName.trim(),
            phone: body.phone?.trim(),
            gender: body.gender,
            birthDate: body.birthDate,
            students: body.students?.map(s => ({
                fullName: s.fullName.trim(),
                username: s.username.trim(),
                email: s.email?.trim() || undefined,
                phone: s.phone?.trim() || undefined,
                gender: s.gender,
                birthDate: s.birthDate,
                address: s.address?.trim() || undefined,
                grade: s.grade || undefined,
                schoolId: s.schoolId
            }))
        });
        return {
            success: true,
            status: common_1.HttpStatus.CREATED,
            message: result.message,
            data: result.data,
            meta: {}
        };
    }
    async createParent(body) {
        const result = await this.parentManagementService.createParent({
            username: body.username.trim(),
            password: body.password,
            email: body.email.trim(),
            fullName: body.fullName.trim(),
            phone: body.phone?.trim(),
            gender: body.gender,
            birthDate: body.birthDate
        });
        return {
            success: true,
            status: common_1.HttpStatus.CREATED,
            message: result.message,
            data: result.data,
            meta: {}
        };
    }
    async addStudentToParent(parentId, body) {
        const result = await this.parentManagementService.addStudentToParent(parentId, {
            fullName: body.fullName.trim(),
            username: body.username.trim(),
            email: body.email?.trim() || undefined,
            phone: body.phone?.trim() || undefined,
            gender: body.gender,
            birthDate: body.birthDate,
            address: body.address?.trim() || undefined,
            grade: body.grade || undefined,
            schoolId: body.schoolId,
            password: body.password
        });
        return {
            success: true,
            status: common_1.HttpStatus.CREATED,
            message: result.message,
            data: result.data,
            meta: {}
        };
    }
    async getAllParents(page, limit, search, isActive) {
        const pageNumber = page ? Number(page) : 1;
        const limitNumber = limit ? Number(limit) : 10;
        const isActiveBoolean = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        const result = await this.parentManagementService.getAllParents(search, undefined, isActiveBoolean !== undefined ? (isActiveBoolean ? 'active' : 'inactive') : undefined, pageNumber, limitNumber);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: result.message,
            data: result.data,
            meta: result.meta
        };
    }
    async getCountByStatus() {
        const result = await this.parentManagementService.getCountByStatus();
        return {
            statusCode: common_1.HttpStatus.OK,
            message: result.message,
            data: result.data
        };
    }
    async findStudentByCode(studentCode) {
        if (!studentCode || studentCode.trim().length === 0) {
            return {
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: 'Mã học sinh không được để trống',
                data: null
            };
        }
        const result = await this.parentManagementService.findStudentByCode(studentCode);
        if (!result.data) {
            return {
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: result.message,
                data: null
            };
        }
        return {
            statusCode: common_1.HttpStatus.OK,
            message: result.message,
            data: result.data
        };
    }
    async getDetailPaymentOfParent(paymentId, parentId) {
        return await this.parentManagementService.getPaymentDetails(paymentId, parentId);
    }
    async createBillForParent(parentId, body) {
        const { feeRecordIds, expirationDate, notes, reference, method, payNow } = body || {};
        if (!feeRecordIds || !Array.isArray(feeRecordIds) || feeRecordIds.length === 0) {
            throw new common_1.HttpException('feeRecordIds là bắt buộc và phải là mảng có ít nhất 1 phần tử', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const result = await this.parentManagementService.createBillForParent(parentId, feeRecordIds, {
                expirationDate,
                notes,
                reference,
                method,
                payNow
            });
            return {
                statusCode: common_1.HttpStatus.CREATED,
                message: result?.message ?? 'Tạo hóa đơn thành công',
                data: result?.data ?? null
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException(`Lỗi khi tạo hóa đơn: ${error?.message || error}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updatePaymentStatus(paymentId, status) {
        if (!status || status.trim().length === 0) {
            throw new common_1.HttpException('Trạng thái thanh toán không được để trống', common_1.HttpStatus.BAD_REQUEST);
        }
        const validStatuses = ['pending', 'completed', 'partially_paid', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new common_1.HttpException('Trạng thái thanh toán không hợp lệ. Chỉ chấp nhận: pending, completed, partially_paid, cancelled', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const result = await this.parentManagementService.updateStatusPayment(paymentId, status);
            return {
                statusCode: common_1.HttpStatus.OK,
                message: result.message,
                data: result.data
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException(`Lỗi khi cập nhật trạng thái thanh toán: ${error?.message || error}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getParentById(id) {
        const result = await this.parentManagementService.getParentById(id);
        if (!result.data) {
            return {
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: result.message,
                data: null
            };
        }
        return {
            statusCode: common_1.HttpStatus.OK,
            message: result.message,
            data: result.data
        };
    }
    async toggleParentStatus(id) {
        const result = await this.parentManagementService.toggleParentStatus(id);
        if (!result.data) {
            return {
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: result.message,
                data: null
            };
        }
        return {
            statusCode: common_1.HttpStatus.OK,
            message: result.message,
            data: result.data
        };
    }
    async updateParent(id, body) {
        if (body.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(body.email)) {
                return {
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Email không hợp lệ',
                    data: null
                };
            }
        }
        if (body.fullName !== undefined && body.fullName.trim().length === 0) {
            return {
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: 'Họ và tên không được để trống',
                data: null
            };
        }
        if (body.phone) {
            const phoneRegex = /^[0-9]{10,11}$/;
            if (!phoneRegex.test(body.phone)) {
                return {
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Số điện thoại phải có 10-11 chữ số',
                    data: null
                };
            }
        }
        const result = await this.parentManagementService.updateParent(id, {
            fullName: body.fullName?.trim(),
            phone: body.phone?.trim(),
            gender: body.gender,
            birthDate: body.birthDate
        });
        if (!result.data) {
            return {
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: result.message,
                data: null
            };
        }
        return {
            statusCode: common_1.HttpStatus.OK,
            message: result.message,
            data: result.data
        };
    }
    async linkStudentToParent(parentId, body) {
        if (!body.studentId || body.studentId.trim().length === 0) {
            return {
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: 'studentId không được để trống',
                data: null
            };
        }
        const result = await this.parentManagementService.linkStudentToParent(parentId, body.studentId);
        if (!result.data) {
            return {
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: result.message,
                data: null
            };
        }
        return {
            statusCode: common_1.HttpStatus.OK,
            message: result.message,
            data: result.data
        };
    }
    async unlinkStudentFromParent(parentId, studentId) {
        const result = await this.parentManagementService.unlinkStudentFromParent(parentId, studentId);
        if (!result.data) {
            return {
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: result.message,
                data: null
            };
        }
        return {
            statusCode: common_1.HttpStatus.OK,
            message: result.message,
            data: result.data
        };
    }
};
exports.ParentManagementController = ParentManagementController;
__decorate([
    (0, common_1.Post)('with-students'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ParentManagementController.prototype, "createParentWithStudents", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ParentManagementController.prototype, "createParent", null);
__decorate([
    (0, common_1.Post)(':id/add-student'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ParentManagementController.prototype, "addStudentToParent", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách phụ huynh' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Trang hiện tại' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Số lượng mỗi trang' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String, description: 'Tìm kiếm theo tên, email, phone' }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: Boolean, description: 'Lọc theo trạng thái' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Lấy danh sách thành công' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], ParentManagementController.prototype, "getAllParents", null);
__decorate([
    (0, common_1.Get)('count-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Đếm số lượng phụ huynh theo trạng thái' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Đếm thành công' }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ParentManagementController.prototype, "getCountByStatus", null);
__decorate([
    (0, common_1.Get)('search-student'),
    (0, swagger_1.ApiOperation)({ summary: 'Tìm kiếm học sinh theo mã để liên kết với phụ huynh' }),
    (0, swagger_1.ApiQuery)({ name: 'studentCode', required: true, type: String, description: 'Mã học sinh' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Tìm thấy học sinh' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Không tìm thấy học sinh' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('studentCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ParentManagementController.prototype, "findStudentByCode", null);
__decorate([
    (0, common_1.Get)('payment-details'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Query)('paymentId')),
    __param(1, (0, common_1.Query)('parentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ParentManagementController.prototype, "getDetailPaymentOfParent", null);
__decorate([
    (0, common_1.Post)(':id/create-bill'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo hóa đơn (payment) cho phụ huynh từ danh sách feeRecordIds' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Tạo hóa đơn thành công' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Dữ liệu không hợp lệ' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Phụ huynh hoặc fee record không tồn tại' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ParentManagementController.prototype, "createBillForParent", null);
__decorate([
    (0, common_1.Patch)(':id/update-payment-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật trạng thái thanh toán' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: true, type: String, description: 'Trạng thái thanh toán (pending, completed, partially_paid, cancelled)' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Cập nhật trạng thái thành công' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Trạng thái không hợp lệ' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Không tìm thấy thanh toán' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ParentManagementController.prototype, "updatePaymentStatus", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết phụ huynh theo ID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Lấy thông tin thành công' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Không tìm thấy phụ huynh' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ParentManagementController.prototype, "getParentById", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Thay đổi trạng thái active của phụ huynh' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Cập nhật trạng thái thành công' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Không tìm thấy phụ huynh' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ParentManagementController.prototype, "toggleParentStatus", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật thông tin phụ huynh' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Cập nhật thành công' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Dữ liệu không hợp lệ' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Không tìm thấy phụ huynh' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ParentManagementController.prototype, "updateParent", null);
__decorate([
    (0, common_1.Post)(':id/students'),
    (0, swagger_1.ApiOperation)({ summary: 'Liên kết học sinh với phụ huynh' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Liên kết thành công' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Không tìm thấy phụ huynh hoặc học sinh' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Học sinh đã có phụ huynh' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ParentManagementController.prototype, "linkStudentToParent", null);
__decorate([
    (0, common_1.Delete)(':id/students/:studentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Hủy liên kết học sinh khỏi phụ huynh' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Hủy liên kết thành công' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Không tìm thấy phụ huynh hoặc học sinh' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ParentManagementController.prototype, "unlinkStudentFromParent", null);
exports.ParentManagementController = ParentManagementController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Parent Management'),
    (0, common_1.Controller)('parent-management'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [parent_management_service_1.ParentManagementService])
], ParentManagementController);
//# sourceMappingURL=parent-management.controller.js.map