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
exports.UpdateHolidayDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class UpdateHolidayDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { type: { required: false, type: () => String, enum: ['PUBLIC', 'CENTER', 'EMERGENCY'] }, startDate: { required: false, type: () => String }, endDate: { required: false, type: () => String }, note: { required: false, type: () => String, maxLength: 500 }, isActive: { required: false, type: () => Boolean } };
    }
}
exports.UpdateHolidayDto = UpdateHolidayDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Loại kỳ nghỉ phải là chuỗi ký tự' }),
    (0, class_validator_1.IsIn)(['PUBLIC', 'CENTER', 'EMERGENCY'], { message: 'Loại kỳ nghỉ phải là PUBLIC, CENTER hoặc EMERGENCY' }),
    __metadata("design:type", String)
], UpdateHolidayDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Ngày bắt đầu phải có định dạng ngày hợp lệ' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value) {
            const date = new Date(value);
            return date.toISOString().split('T')[0];
        }
        return value;
    }),
    __metadata("design:type", String)
], UpdateHolidayDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Ngày kết thúc phải có định dạng ngày hợp lệ' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value) {
            const date = new Date(value);
            return date.toISOString().split('T')[0];
        }
        return value;
    }),
    __metadata("design:type", String)
], UpdateHolidayDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Ghi chú phải là chuỗi ký tự' }),
    (0, class_validator_1.MaxLength)(500, { message: 'Ghi chú không được vượt quá 500 ký tự' }),
    __metadata("design:type", String)
], UpdateHolidayDto.prototype, "note", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Trạng thái phải là true hoặc false' }),
    __metadata("design:type", Boolean)
], UpdateHolidayDto.prototype, "isActive", void 0);
//# sourceMappingURL=update-holiday.dto.js.map