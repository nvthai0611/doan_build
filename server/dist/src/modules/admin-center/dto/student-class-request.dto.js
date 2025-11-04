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
exports.RejectRequestDto = exports.GetStudentClassRequestsDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class GetStudentClassRequestsDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: false, type: () => String }, classId: { required: false, type: () => String }, studentId: { required: false, type: () => String }, page: { required: false, type: () => Number }, limit: { required: false, type: () => Number } };
    }
}
exports.GetStudentClassRequestsDto = GetStudentClassRequestsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lọc theo trạng thái', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetStudentClassRequestsDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lọc theo ID lớp học', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GetStudentClassRequestsDto.prototype, "classId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lọc theo ID học sinh', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GetStudentClassRequestsDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Số trang', required: false, default: 1 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GetStudentClassRequestsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Số lượng mỗi trang', required: false, default: 20 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GetStudentClassRequestsDto.prototype, "limit", void 0);
class RejectRequestDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { reason: { required: false, type: () => String } };
    }
}
exports.RejectRequestDto = RejectRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lý do từ chối', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RejectRequestDto.prototype, "reason", void 0);
//# sourceMappingURL=student-class-request.dto.js.map