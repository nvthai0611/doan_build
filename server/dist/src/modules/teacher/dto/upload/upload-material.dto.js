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
exports.MaterialResponseDto = exports.GetMaterialsDto = exports.UploadMaterialDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UploadMaterialDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { classId: { required: true, type: () => String }, title: { required: true, type: () => String }, category: { required: true, type: () => String }, description: { required: false, type: () => String }, file: { required: true, type: () => Object } };
    }
}
exports.UploadMaterialDto = UploadMaterialDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID lớp học', example: 'uuid-string' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UploadMaterialDto.prototype, "classId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tiêu đề tài liệu', example: 'Bài tập chương 1' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UploadMaterialDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Danh mục tài liệu',
        example: 'lesson',
        enum: ['lesson', 'exercise', 'exam', 'material', 'reference']
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UploadMaterialDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Mô tả tài liệu' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadMaterialDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'File tài liệu',
        type: 'string',
        format: 'binary'
    }),
    __metadata("design:type", Object)
], UploadMaterialDto.prototype, "file", void 0);
class GetMaterialsDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { classId: { required: false, type: () => String }, category: { required: false, type: () => String }, page: { required: false, type: () => Number }, limit: { required: false, type: () => Number }, search: { required: false, type: () => String } };
    }
}
exports.GetMaterialsDto = GetMaterialsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID lớp học' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GetMaterialsDto.prototype, "classId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Danh mục' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetMaterialsDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Trang', example: 1 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GetMaterialsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Số lượng mỗi trang', example: 10 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GetMaterialsDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Từ khóa tìm kiếm' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetMaterialsDto.prototype, "search", void 0);
class MaterialResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, classId: { required: true, type: () => String }, title: { required: true, type: () => String }, fileName: { required: true, type: () => String }, category: { required: true, type: () => String }, fileUrl: { required: true, type: () => String }, fileSize: { required: false, type: () => Number }, fileType: { required: false, type: () => String }, description: { required: false, type: () => String }, uploadedBy: { required: true, type: () => String }, uploadedAt: { required: true, type: () => Date }, downloads: { required: true, type: () => Number } };
    }
}
exports.MaterialResponseDto = MaterialResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID tài liệu' }),
    __metadata("design:type", Number)
], MaterialResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID lớp học' }),
    __metadata("design:type", String)
], MaterialResponseDto.prototype, "classId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tiêu đề' }),
    __metadata("design:type", String)
], MaterialResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên file' }),
    __metadata("design:type", String)
], MaterialResponseDto.prototype, "fileName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Danh mục' }),
    __metadata("design:type", String)
], MaterialResponseDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'URL file' }),
    __metadata("design:type", String)
], MaterialResponseDto.prototype, "fileUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Kích thước file (bytes)' }),
    __metadata("design:type", Number)
], MaterialResponseDto.prototype, "fileSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Loại file' }),
    __metadata("design:type", String)
], MaterialResponseDto.prototype, "fileType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Mô tả' }),
    __metadata("design:type", String)
], MaterialResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Người upload' }),
    __metadata("design:type", String)
], MaterialResponseDto.prototype, "uploadedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày upload' }),
    __metadata("design:type", Date)
], MaterialResponseDto.prototype, "uploadedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Số lượt tải xuống' }),
    __metadata("design:type", Number)
], MaterialResponseDto.prototype, "downloads", void 0);
//# sourceMappingURL=upload-material.dto.js.map