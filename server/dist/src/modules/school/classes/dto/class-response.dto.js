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
exports.ClassResponseDto = exports.ClassesListResponseDto = exports.ClassDto = exports.RoomDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class RoomDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String }, description: { required: false, type: () => String } };
    }
}
exports.RoomDto = RoomDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của phòng học' }),
    __metadata("design:type", String)
], RoomDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên phòng học' }),
    __metadata("design:type", String)
], RoomDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mô tả phòng học', required: false }),
    __metadata("design:type", String)
], RoomDto.prototype, "description", void 0);
class ClassDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String }, teacherId: { required: false, type: () => String }, room: { required: true, type: () => require("./class-response.dto").RoomDto }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date } };
    }
}
exports.ClassDto = ClassDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của lớp học' }),
    __metadata("design:type", String)
], ClassDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên lớp học' }),
    __metadata("design:type", String)
], ClassDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của giáo viên', required: false }),
    __metadata("design:type", String)
], ClassDto.prototype, "teacherId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin phòng học', type: RoomDto }),
    __metadata("design:type", RoomDto)
], ClassDto.prototype, "room", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày tạo' }),
    __metadata("design:type", Date)
], ClassDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày cập nhật' }),
    __metadata("design:type", Date)
], ClassDto.prototype, "updatedAt", void 0);
class ClassesListResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { success: { required: true, type: () => Boolean }, message: { required: true, type: () => String }, data: { required: true, type: () => [require("./class-response.dto").ClassDto] } };
    }
}
exports.ClassesListResponseDto = ClassesListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trạng thái thành công' }),
    __metadata("design:type", Boolean)
], ClassesListResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông báo' }),
    __metadata("design:type", String)
], ClassesListResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Danh sách lớp học', type: [ClassDto] }),
    __metadata("design:type", Array)
], ClassesListResponseDto.prototype, "data", void 0);
class ClassResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { success: { required: true, type: () => Boolean }, message: { required: true, type: () => String }, data: { required: true, type: () => require("./class-response.dto").ClassDto } };
    }
}
exports.ClassResponseDto = ClassResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trạng thái thành công' }),
    __metadata("design:type", Boolean)
], ClassResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông báo' }),
    __metadata("design:type", String)
], ClassResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin lớp học', type: ClassDto }),
    __metadata("design:type", ClassDto)
], ClassResponseDto.prototype, "data", void 0);
//# sourceMappingURL=class-response.dto.js.map