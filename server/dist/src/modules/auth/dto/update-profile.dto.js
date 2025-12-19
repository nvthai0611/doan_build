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
exports.UpdateProfileDto = exports.Gender = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
var Gender;
(function (Gender) {
    Gender["MALE"] = "MALE";
    Gender["FEMALE"] = "FEMALE";
    Gender["OTHER"] = "OTHER";
})(Gender || (exports.Gender = Gender = {}));
class UpdateProfileDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { fullName: { required: false, type: () => String }, phone: { required: false, type: () => String, pattern: "/^(\\+84|0)[1-9][0-9]{8}$/" }, avatar: { required: false, type: () => String }, gender: { required: false, enum: require("./update-profile.dto").Gender }, birthDate: { required: false, type: () => String } };
    }
}
exports.UpdateProfileDto = UpdateProfileDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Họ và tên' }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => value === '' ? undefined : value),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Số điện thoại (VD: 0912345678 hoặc +84912345678)' }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === '' ? undefined : value),
    (0, class_validator_1.ValidateIf)((o) => o.phone !== undefined && o.phone !== null && o.phone !== ''),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^(\+84|0)[1-9][0-9]{8}$/, {
        message: 'Số điện thoại phải là một số điện thoại hợp lệ (VD: 0912345678 hoặc +84912345678)'
    }),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'URL ảnh đại diện hoặc base64 data URL' }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => value === '' ? undefined : value),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Giới tính', enum: Gender }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (!value || value === '' || value === null || value === undefined) {
            return undefined;
        }
        return value;
    }),
    (0, class_validator_1.ValidateIf)((o) => o.gender !== undefined && o.gender !== null && o.gender !== ''),
    (0, class_validator_1.IsEnum)(Gender, { message: 'giới tính phải là nam, nữ hoặc khác' }),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Ngày sinh (YYYY-MM-DD)', example: '1990-01-01' }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDateString)({}, { message: 'ngày sinh phải là một chuỗi ngày hợp lệ (YYYY-MM-DD)' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (!value || value === '' || value === null || value === undefined) {
            return undefined;
        }
        return value;
    }),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "birthDate", void 0);
//# sourceMappingURL=update-profile.dto.js.map