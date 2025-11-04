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
exports.CreateSessionRequestDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateSessionRequestDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { classId: { required: true, type: () => String }, sessionDate: { required: true, type: () => String }, startTime: { required: true, type: () => String }, endTime: { required: true, type: () => String }, roomId: { required: false, type: () => String }, reason: { required: true, type: () => String }, notes: { required: false, type: () => String }, requestType: { required: true, type: () => Object } };
    }
}
exports.CreateSessionRequestDto = CreateSessionRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của lớp học' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSessionRequestDto.prototype, "classId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày buổi học (YYYY-MM-DD)' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSessionRequestDto.prototype, "sessionDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Giờ bắt đầu (HH:MM)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSessionRequestDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Giờ kết thúc (HH:MM)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSessionRequestDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID phòng học (tùy chọn)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateSessionRequestDto.prototype, "roomId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lý do yêu cầu tạo buổi học' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSessionRequestDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ghi chú thêm (tùy chọn)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSessionRequestDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loại yêu cầu', enum: ['makeup_session', 'extra_session'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSessionRequestDto.prototype, "requestType", void 0);
//# sourceMappingURL=create-session-request.dto.js.map