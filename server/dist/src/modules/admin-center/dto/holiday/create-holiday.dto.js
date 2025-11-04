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
exports.CreateHolidayDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const date_range_validator_1 = require("../../../../common/validators/date-range.validator");
class CreateHolidayDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { type: { required: true, type: () => String, enum: ['PUBLIC', 'CENTER', 'EMERGENCY'] }, startDate: { required: true, type: () => String }, endDate: { required: true, type: () => String }, note: { required: false, type: () => String, maxLength: 500 }, isActive: { required: false, type: () => Boolean } };
    }
}
exports.CreateHolidayDto = CreateHolidayDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Loại kỳ nghỉ không được để trống' }),
    (0, class_validator_1.IsString)({ message: 'Loại kỳ nghỉ phải là chuỗi ký tự' }),
    (0, class_validator_1.IsIn)(['PUBLIC', 'CENTER', 'EMERGENCY'], { message: 'Loại kỳ nghỉ phải là PUBLIC, CENTER hoặc EMERGENCY' }),
    __metadata("design:type", String)
], CreateHolidayDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Ngày bắt đầu không được để trống' }),
    (0, class_validator_1.IsDateString)({}, { message: 'Ngày bắt đầu phải có định dạng ngày hợp lệ' }),
    (0, date_range_validator_1.IsDateRange)({ message: 'Ngày bắt đầu không hợp lệ' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value) {
            const date = new Date(value);
            return date.toISOString().split('T')[0];
        }
        return value;
    }),
    __metadata("design:type", String)
], CreateHolidayDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Ngày kết thúc không được để trống' }),
    (0, class_validator_1.IsDateString)({}, { message: 'Ngày kết thúc phải có định dạng ngày hợp lệ' }),
    (0, date_range_validator_1.IsEndDateAfterStart)({ message: 'Ngày kết thúc phải sau ngày bắt đầu' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value) {
            const date = new Date(value);
            return date.toISOString().split('T')[0];
        }
        return value;
    }),
    __metadata("design:type", String)
], CreateHolidayDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Ghi chú phải là chuỗi ký tự' }),
    (0, class_validator_1.MaxLength)(500, { message: 'Ghi chú không được vượt quá 500 ký tự' }),
    __metadata("design:type", String)
], CreateHolidayDto.prototype, "note", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Trạng thái phải là true hoặc false' }),
    __metadata("design:type", Boolean)
], CreateHolidayDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-holiday.dto.js.map