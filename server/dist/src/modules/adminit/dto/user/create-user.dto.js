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
exports.CreateUserDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const constants_1 = require("../../../../common/constants");
const USER_ROLE_VALUES = [
    'admin',
    'center_owner',
    'teacher',
    'parent',
    'student',
];
class CreateUserDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { email: { required: true, type: () => String }, fullName: { required: true, type: () => String, minLength: 3 }, username: { required: true, type: () => String, minLength: 3, maxLength: 30, pattern: "/^[a-zA-Z0-9_.-]+$/" }, phone: { required: false, type: () => String, pattern: "/^[0-9]{8,15}$/" }, avatar: { required: false, type: () => String, nullable: true }, role: { required: true, type: () => Object }, isActive: { required: false, type: () => Boolean }, password: { required: false, type: () => String, minLength: 6 }, gender: { required: false, enum: require("../../../../common/constants").Gender }, birthDate: { required: false, type: () => String, nullable: true }, note: { required: false, type: () => String } };
    }
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Email không hợp lệ' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Họ và tên phải là chuỗi' }),
    (0, class_validator_1.MinLength)(3, { message: 'Họ và tên phải có ít nhất 3 ký tự' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Tên đăng nhập phải là chuỗi' }),
    (0, class_validator_1.MinLength)(3, { message: 'Tên đăng nhập phải có ít nhất 3 ký tự' }),
    (0, class_validator_1.MaxLength)(30, { message: 'Tên đăng nhập không được vượt quá 30 ký tự' }),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9_.-]+$/, {
        message: 'Tên đăng nhập chỉ được chứa chữ, số và _ . -',
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Số điện thoại phải là chuỗi' }),
    (0, class_validator_1.Matches)(/^[0-9]{8,15}$/, {
        message: 'Số điện thoại chỉ được chứa số và có 8-15 ký tự',
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Avatar phải là chuỗi URL' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "avatar", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(USER_ROLE_VALUES, { message: 'Vai trò người dùng không hợp lệ' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Trạng thái phải là boolean' }),
    __metadata("design:type", Boolean)
], CreateUserDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: 'Mật khẩu tối thiểu 6 ký tự' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(constants_1.Gender, { message: 'Giới tính không hợp lệ' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Ngày sinh không hợp lệ' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "birthDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "note", void 0);
//# sourceMappingURL=create-user.dto.js.map