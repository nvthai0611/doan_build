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
exports.UpdateCenterInfoSettingDto = exports.CenterInfoSettingDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class WorkingHourDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { fromDay: { required: true, type: () => String }, toDay: { required: true, type: () => String }, open: { required: true, type: () => String, pattern: "/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/" }, close: { required: true, type: () => String, pattern: "/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/" } };
    }
}
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Ngày bắt đầu không được để trống' }),
    (0, class_validator_1.IsString)({ message: 'Ngày bắt đầu phải là chuỗi ký tự' }),
    __metadata("design:type", String)
], WorkingHourDto.prototype, "fromDay", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Ngày kết thúc không được để trống' }),
    (0, class_validator_1.IsString)({ message: 'Ngày kết thúc phải là chuỗi ký tự' }),
    __metadata("design:type", String)
], WorkingHourDto.prototype, "toDay", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Giờ mở cửa không được để trống' }),
    (0, class_validator_1.IsString)({ message: 'Giờ mở cửa phải là chuỗi ký tự' }),
    (0, class_validator_1.Matches)(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Giờ mở cửa phải có định dạng HH:mm',
    }),
    __metadata("design:type", String)
], WorkingHourDto.prototype, "open", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Giờ đóng cửa không được để trống' }),
    (0, class_validator_1.IsString)({ message: 'Giờ đóng cửa phải là chuỗi ký tự' }),
    (0, class_validator_1.Matches)(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Giờ đóng cửa phải có định dạng HH:mm',
    }),
    __metadata("design:type", String)
], WorkingHourDto.prototype, "close", void 0);
class CenterInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String, maxLength: 200 }, logo: { required: false, type: () => String }, banner: { required: false, type: () => String }, description: { required: true, type: () => String, maxLength: 500 }, slogan: { required: false, type: () => String, maxLength: 100 } };
    }
}
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên trung tâm không được để trống' }),
    (0, class_validator_1.IsString)({ message: 'Tên trung tâm phải là chuỗi ký tự' }),
    (0, class_validator_1.MaxLength)(200, { message: 'Tên trung tâm không được vượt quá 200 ký tự' }),
    __metadata("design:type", String)
], CenterInfoDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Logo phải là chuỗi ký tự' }),
    __metadata("design:type", String)
], CenterInfoDto.prototype, "logo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Banner phải là chuỗi ký tự' }),
    __metadata("design:type", String)
], CenterInfoDto.prototype, "banner", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Mô tả ngắn không được để trống' }),
    (0, class_validator_1.IsString)({ message: 'Mô tả ngắn phải là chuỗi ký tự' }),
    (0, class_validator_1.MaxLength)(500, { message: 'Mô tả ngắn không được vượt quá 500 ký tự' }),
    __metadata("design:type", String)
], CenterInfoDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Slogan phải là chuỗi ký tự' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Slogan không được vượt quá 100 ký tự' }),
    __metadata("design:type", String)
], CenterInfoDto.prototype, "slogan", void 0);
class ContactDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { phone: { required: true, type: () => String, pattern: "/^0\\d{9,10}$/" }, email: { required: true, type: () => String }, website: { required: false, type: () => String }, workingHours: { required: true, type: () => [WorkingHourDto] } };
    }
}
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Số điện thoại không được để trống' }),
    (0, class_validator_1.IsString)({ message: 'Số điện thoại phải là chuỗi ký tự' }),
    (0, class_validator_1.Matches)(/^0\d{9,10}$/, {
        message: 'Số điện thoại phải bắt đầu bằng 0 và có 10-11 chữ số',
    }),
    __metadata("design:type", String)
], ContactDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Email không được để trống' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Email không hợp lệ' }),
    __metadata("design:type", String)
], ContactDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: 'Website phải là URL hợp lệ' }),
    __metadata("design:type", String)
], ContactDto.prototype, "website", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Giờ làm việc không được để trống' }),
    (0, class_validator_1.IsArray)({ message: 'Giờ làm việc phải là mảng' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WorkingHourDto),
    __metadata("design:type", Array)
], ContactDto.prototype, "workingHours", void 0);
class AddressDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { street: { required: true, type: () => String, maxLength: 200 }, province: { required: true, type: () => String }, district: { required: true, type: () => String }, detail: { required: true, type: () => String, maxLength: 200 } };
    }
}
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Địa chỉ không được để trống' }),
    (0, class_validator_1.IsString)({ message: 'Địa chỉ phải là chuỗi ký tự' }),
    (0, class_validator_1.MaxLength)(200, { message: 'Địa chỉ không được vượt quá 200 ký tự' }),
    __metadata("design:type", String)
], AddressDto.prototype, "street", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Tỉnh/Thành không được để trống' }),
    (0, class_validator_1.IsString)({ message: 'Tỉnh/Thành phải là chuỗi ký tự' }),
    __metadata("design:type", String)
], AddressDto.prototype, "province", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Quận/Huyện không được để trống' }),
    (0, class_validator_1.IsString)({ message: 'Quận/Huyện phải là chuỗi ký tự' }),
    __metadata("design:type", String)
], AddressDto.prototype, "district", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Địa chỉ chi tiết không được để trống' }),
    (0, class_validator_1.IsString)({ message: 'Địa chỉ chi tiết phải là chuỗi ký tự' }),
    (0, class_validator_1.MaxLength)(200, { message: 'Địa chỉ chi tiết không được vượt quá 200 ký tự' }),
    __metadata("design:type", String)
], AddressDto.prototype, "detail", void 0);
class CenterInfoSettingDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { centerInfo: { required: true, type: () => CenterInfoDto }, contact: { required: true, type: () => ContactDto }, address: { required: true, type: () => AddressDto } };
    }
}
exports.CenterInfoSettingDto = CenterInfoSettingDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Thông tin trung tâm không được để trống' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CenterInfoDto),
    __metadata("design:type", CenterInfoDto)
], CenterInfoSettingDto.prototype, "centerInfo", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Thông tin liên hệ không được để trống' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ContactDto),
    __metadata("design:type", ContactDto)
], CenterInfoSettingDto.prototype, "contact", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Địa chỉ không được để trống' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AddressDto),
    __metadata("design:type", AddressDto)
], CenterInfoSettingDto.prototype, "address", void 0);
class UpdateCenterInfoSettingDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { value: { required: true, type: () => require("./center-info.dto").CenterInfoSettingDto } };
    }
}
exports.UpdateCenterInfoSettingDto = UpdateCenterInfoSettingDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Dữ liệu không được để trống' }),
    (0, class_validator_1.IsObject)({ message: 'Dữ liệu phải là object' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CenterInfoSettingDto),
    __metadata("design:type", CenterInfoSettingDto)
], UpdateCenterInfoSettingDto.prototype, "value", void 0);
//# sourceMappingURL=center-info.dto.js.map