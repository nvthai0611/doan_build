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
exports.GradeEntryDto = exports.RecordGradesDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class GradeEntryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { studentId: { required: true, type: () => String }, score: { required: false, type: () => Number, minimum: 0 }, feedback: { required: false, type: () => String } };
    }
}
exports.GradeEntryDto = GradeEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID học sinh', format: 'uuid' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GradeEntryDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Điểm số (0-10), có thể để trống nếu chưa chấm', minimum: 0, maximum: 10, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GradeEntryDto.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nhận xét của giáo viên', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GradeEntryDto.prototype, "feedback", void 0);
class RecordGradesDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { classId: { required: true, type: () => String }, assessmentName: { required: true, type: () => String }, assessmentType: { required: true, type: () => String }, maxScore: { required: false, type: () => Number, minimum: 0 }, date: { required: true, type: () => String }, description: { required: false, type: () => String }, grades: { required: true, type: () => [require("./record-grades.dto").GradeEntryDto] } };
    }
}
exports.RecordGradesDto = RecordGradesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID lớp học', format: 'uuid' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], RecordGradesDto.prototype, "classId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên bài kiểm tra (VD: Kiểm tra chương 1)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordGradesDto.prototype, "assessmentName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loại kiểm tra (quiz/midterm/final/homework/oral/...)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordGradesDto.prototype, "assessmentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Điểm tối đa của bài kiểm tra (optional, sẽ tự động lấy từ SystemSetting theo assessmentType)', example: 10, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RecordGradesDto.prototype, "maxScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày kiểm tra (ISO date: YYYY-MM-DD)' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RecordGradesDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mô tả chi tiết (tùy chọn)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordGradesDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [GradeEntryDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GradeEntryDto),
    __metadata("design:type", Array)
], RecordGradesDto.prototype, "grades", void 0);
//# sourceMappingURL=record-grades.dto.js.map