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
exports.RegisterParentDto = exports.ChildDto = exports.RelationshipType = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var Gender;
(function (Gender) {
    Gender["MALE"] = "MALE";
    Gender["FEMALE"] = "FEMALE";
    Gender["OTHER"] = "OTHER";
})(Gender || (Gender = {}));
var RelationshipType;
(function (RelationshipType) {
    RelationshipType["FATHER"] = "FATHER";
    RelationshipType["MOTHER"] = "MOTHER";
    RelationshipType["OTHER"] = "OTHER";
})(RelationshipType || (exports.RelationshipType = RelationshipType = {}));
class ChildDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { fullName: { required: true, type: () => String }, dateOfBirth: { required: true, type: () => String }, gender: { required: true, enum: Gender }, schoolName: { required: true, type: () => String }, schoolAddress: { required: false, type: () => String } };
    }
}
exports.ChildDto = ChildDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Họ và tên con', example: 'Nguyễn Văn B' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Họ và tên con không được để trống' }),
    __metadata("design:type", String)
], ChildDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày sinh con', example: '2015-01-01' }),
    (0, class_validator_1.IsDateString)({}, { message: 'Ngày sinh không hợp lệ' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Ngày sinh con không được để trống' }),
    __metadata("design:type", String)
], ChildDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Giới tính', enum: Gender, example: 'MALE' }),
    (0, class_validator_1.IsEnum)(Gender, { message: 'Giới tính không hợp lệ' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Giới tính con không được để trống' }),
    __metadata("design:type", String)
], ChildDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên trường học', example: 'Trường THCS ABC' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên trường học không được để trống' }),
    __metadata("design:type", String)
], ChildDto.prototype, "schoolName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Địa chỉ trường học',
        example: '123 Main St',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ChildDto.prototype, "schoolAddress", void 0);
class RegisterParentDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { username: { required: true, type: () => String, minLength: 3, maxLength: 20, pattern: "/^[a-zA-Z0-9_]+$/" }, email: { required: true, type: () => String, pattern: "/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/" }, password: { required: true, type: () => String, minLength: 6, maxLength: 16 }, fullName: { required: true, type: () => String, minLength: 5 }, phone: { required: true, type: () => String, pattern: "/^[0-9]{10,11}$/" }, birthDate: { required: false, type: () => String }, relationshipType: { required: true, enum: require("./register-parent.dto").RelationshipType }, children: { required: true, type: () => [require("./register-parent.dto").ChildDto] } };
    }
}
exports.RegisterParentDto = RegisterParentDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Tên đăng nhập phải là chuỗi' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên đăng nhập không được để trống' }),
    (0, class_validator_1.MinLength)(3, { message: 'Tên đăng nhập phải có ít nhất 3 ký tự' }),
    (0, class_validator_1.MaxLength)(20, { message: 'Tên đăng nhập không được quá 20 ký tự' }),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9_]+$/, {
        message: 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới',
    }),
    __metadata("design:type", String)
], RegisterParentDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Email không hợp lệ' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email không được để trống' }),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
        message: 'Định dạng email không hợp lệ',
    }),
    __metadata("design:type", String)
], RegisterParentDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Mật khẩu phải là chuỗi' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Mật khẩu không được để trống' }),
    (0, class_validator_1.MinLength)(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
    (0, class_validator_1.MaxLength)(16, { message: 'Mật khẩu không được quá 16 ký tự' }),
    __metadata("design:type", String)
], RegisterParentDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Họ và tên phải là chuỗi' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Họ và tên không được để trống' }),
    (0, class_validator_1.MinLength)(5, { message: 'Họ và tên phải có ít nhất 5 ký tự' }),
    __metadata("design:type", String)
], RegisterParentDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Số điện thoại phải là chuỗi' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Số điện thoại không được để trống' }),
    (0, class_validator_1.Matches)(/^[0-9]{10,11}$/, {
        message: 'Số điện thoại phải có 10-11 chữ số và chỉ chứa số',
    }),
    __metadata("design:type", String)
], RegisterParentDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'Ngày sinh không hợp lệ' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterParentDto.prototype, "birthDate", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(RelationshipType, { message: 'Quan hệ không hợp lệ' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Quan hệ không được để trống' }),
    __metadata("design:type", String)
], RegisterParentDto.prototype, "relationshipType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Danh sách con (ít nhất 1 con)',
        type: [ChildDto],
        example: [
            { fullName: 'Nguyễn Văn B', dateOfBirth: '2015-01-01', gender: 'MALE' },
        ],
    }),
    (0, class_validator_1.IsArray)({ message: 'Danh sách con phải là một mảng' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ChildDto),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'Phải có ít nhất 1 con' }),
    __metadata("design:type", Array)
], RegisterParentDto.prototype, "children", void 0);
//# sourceMappingURL=register-parent.dto.js.map