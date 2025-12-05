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
exports.RequestJoinClassDto = exports.JoinClassByCodeDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class JoinClassByCodeDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { codeOrLink: { required: true, type: () => String } };
    }
}
exports.JoinClassByCodeDto = JoinClassByCodeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Class code hoặc link lớp học', example: '1ABC hoặc /classes/53d71ee9-2df8-4f92-af3f-75490f022a43' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Mã lớp hoặc link không được để trống' }),
    __metadata("design:type", String)
], JoinClassByCodeDto.prototype, "codeOrLink", void 0);
class RequestJoinClassDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { classId: { required: true, type: () => String }, studentId: { required: true, type: () => String }, contractUploadId: { required: false, type: () => String }, password: { required: false, type: () => String }, message: { required: false, type: () => String }, commitmentImageUrl: { required: false, type: () => String } };
    }
}
exports.RequestJoinClassDto = RequestJoinClassDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Class ID' }),
    (0, class_validator_1.IsUUID)('4', { message: 'Class ID không hợp lệ' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Class ID không được để trống' }),
    __metadata("design:type", String)
], RequestJoinClassDto.prototype, "classId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student ID - con của parent' }),
    (0, class_validator_1.IsUUID)('4', { message: 'Student ID không hợp lệ' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Student ID không được để trống' }),
    __metadata("design:type", String)
], RequestJoinClassDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Contract Upload ID (ID của hợp đồng đã upload trước) - KHÔNG BẮT BUỘC', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'Contract Upload ID không hợp lệ' }),
    __metadata("design:type", String)
], RequestJoinClassDto.prototype, "contractUploadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mật khẩu lớp học (nếu có)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RequestJoinClassDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lời nhắn gửi (tùy chọn)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RequestJoinClassDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'URL ảnh cam kết học tập (DEPRECATED - dùng contractUploadId)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RequestJoinClassDto.prototype, "commitmentImageUrl", void 0);
//# sourceMappingURL=join-class.dto.js.map