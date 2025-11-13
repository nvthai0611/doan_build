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
exports.GetSessionsByClassQueryDto = exports.GetStudentLeaveRequestsQueryDto = exports.UpdateStudentLeaveRequestDto = exports.CreateStudentLeaveRequestDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateStudentLeaveRequestDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { studentId: { required: true, type: () => String }, classId: { required: true, type: () => String }, sessionIds: { required: true, type: () => [String] }, reason: { required: true, type: () => String } };
    }
}
exports.CreateStudentLeaveRequestDto = CreateStudentLeaveRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID học sinh', example: 'uuid' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateStudentLeaveRequestDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID lớp học', example: 'uuid' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateStudentLeaveRequestDto.prototype, "classId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Danh sách sessionId được xin nghỉ', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    __metadata("design:type", Array)
], CreateStudentLeaveRequestDto.prototype, "sessionIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lý do nghỉ học', example: 'Con bị ốm' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateStudentLeaveRequestDto.prototype, "reason", void 0);
class UpdateStudentLeaveRequestDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { reason: { required: false, type: () => String }, sessionIds: { required: false, type: () => [String] } };
    }
}
exports.UpdateStudentLeaveRequestDto = UpdateStudentLeaveRequestDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Lý do nghỉ học' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateStudentLeaveRequestDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Danh sách sessionId được xin nghỉ', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateStudentLeaveRequestDto.prototype, "sessionIds", void 0);
class GetStudentLeaveRequestsQueryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { page: { required: false, type: () => Number }, limit: { required: false, type: () => Number }, status: { required: false, type: () => String }, studentId: { required: false, type: () => String }, classId: { required: false, type: () => String } };
    }
}
exports.GetStudentLeaveRequestsQueryDto = GetStudentLeaveRequestsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Trang hiện tại', example: 1 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GetStudentLeaveRequestsQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Số lượng mỗi trang', example: 10 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GetStudentLeaveRequestsQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Trạng thái đơn', example: 'pending' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetStudentLeaveRequestsQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID học sinh', example: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GetStudentLeaveRequestsQueryDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID lớp học', example: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GetStudentLeaveRequestsQueryDto.prototype, "classId", void 0);
class GetSessionsByClassQueryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { studentId: { required: true, type: () => String }, classId: { required: true, type: () => String } };
    }
}
exports.GetSessionsByClassQueryDto = GetSessionsByClassQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID học sinh', example: 'uuid' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GetSessionsByClassQueryDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID lớp học', example: 'uuid' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GetSessionsByClassQueryDto.prototype, "classId", void 0);
//# sourceMappingURL=student-leave-request.dto.js.map