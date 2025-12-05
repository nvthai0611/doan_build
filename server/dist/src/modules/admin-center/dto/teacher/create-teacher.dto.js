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
exports.CreateTeacherDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const constants_1 = require("../../../../common/constants");
class CreateTeacherDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { email: { required: true, type: () => String, pattern: "/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/" }, fullName: { required: true, type: () => String, minLength: 5 }, username: { required: true, type: () => String, minLength: 3, maxLength: 20, pattern: "/^[a-zA-Z0-9_]+$/" }, phone: { required: false, type: () => String, pattern: "/^[0-9]{10,11}$/" }, role: { required: true, type: () => String }, subjects: { required: false, type: () => [String] }, contractEnd: { required: false, type: () => String }, isActive: { required: false, type: () => Boolean }, gender: { required: false, enum: require("../../../../common/constants").Gender }, birthDate: { required: false, type: () => String }, notes: { required: false, type: () => String }, schoolName: { required: false, type: () => String }, schoolAddress: { required: false, type: () => String }, contractImage: { required: false, type: () => Object }, contractImageUrl: { required: false, type: () => String } };
    }
}
exports.CreateTeacherDto = CreateTeacherDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Email không hợp lệ' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email không được để trống' }),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
        message: 'Định dạng email không hợp lệ',
    }),
    __metadata("design:type", String)
], CreateTeacherDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Họ và tên phải là chuỗi' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Họ và tên không được để trống' }),
    (0, class_validator_1.MinLength)(5, { message: 'Họ và tên phải có ít nhất 5 ký tự' }),
    __metadata("design:type", String)
], CreateTeacherDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Tên đăng nhập phải là chuỗi' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên đăng nhập không được để trống' }),
    (0, class_validator_1.MinLength)(3, { message: 'Tên đăng nhập phải có ít nhất 3 ký tự' }),
    (0, class_validator_1.MaxLength)(20, { message: 'Tên đăng nhập không được quá 20 ký tự' }),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9_]+$/, {
        message: 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới',
    }),
    __metadata("design:type", String)
], CreateTeacherDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Số điện thoại phải là chuỗi' }),
    (0, class_validator_1.Matches)(/^[0-9]{10,11}$/, {
        message: 'Số điện thoại phải có 10-11 chữ số và chỉ chứa số',
    }),
    __metadata("design:type", String)
], CreateTeacherDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['teacher', 'admin', 'center_owner']),
    __metadata("design:type", String)
], CreateTeacherDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateTeacherDto.prototype, "subjects", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTeacherDto.prototype, "contractEnd", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTeacherDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(constants_1.Gender),
    __metadata("design:type", String)
], CreateTeacherDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTeacherDto.prototype, "birthDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTeacherDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTeacherDto.prototype, "schoolName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTeacherDto.prototype, "schoolAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTeacherDto.prototype, "contractImageUrl", void 0);
//# sourceMappingURL=create-teacher.dto.js.map