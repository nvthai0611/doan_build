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
exports.GetAttendanceResponseDto = exports.AttendanceResponseDto = exports.SessionResponseDto = exports.ClassResponseDto = exports.StudentResponseDto = exports.UserResponseDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class UserResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { avatar: { required: true, type: () => String }, fullName: { required: true, type: () => String } };
    }
}
exports.UserResponseDto = UserResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Avatar URL của học sinh' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên đầy đủ của học sinh' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "fullName", void 0);
class StudentResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, userId: { required: true, type: () => String }, studentCode: { required: true, type: () => String }, address: { required: true, type: () => String }, grade: { required: true, type: () => String }, schoolId: { required: true, type: () => String }, parentId: { required: true, type: () => String }, user: { required: true, type: () => require("./attendance-response.dto").UserResponseDto } };
    }
}
exports.StudentResponseDto = StudentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của học sinh' }),
    __metadata("design:type", String)
], StudentResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của user' }),
    __metadata("design:type", String)
], StudentResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mã số học sinh' }),
    __metadata("design:type", String)
], StudentResponseDto.prototype, "studentCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Địa chỉ học sinh' }),
    __metadata("design:type", String)
], StudentResponseDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Khối lớp' }),
    __metadata("design:type", String)
], StudentResponseDto.prototype, "grade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID trường học' }),
    __metadata("design:type", String)
], StudentResponseDto.prototype, "schoolId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID phụ huynh' }),
    __metadata("design:type", String)
], StudentResponseDto.prototype, "parentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: UserResponseDto, description: 'Thông tin user' }),
    __metadata("design:type", UserResponseDto)
], StudentResponseDto.prototype, "user", void 0);
class ClassResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String } };
    }
}
exports.ClassResponseDto = ClassResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên lớp học' }),
    __metadata("design:type", String)
], ClassResponseDto.prototype, "name", void 0);
class SessionResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, classId: { required: true, type: () => String }, academicYear: { required: true, type: () => String }, sessionDate: { required: true, type: () => Date }, startTime: { required: true, type: () => String }, endTime: { required: true, type: () => String }, roomId: { required: true, type: () => String }, status: { required: true, type: () => String }, notes: { required: true, type: () => String }, createdAt: { required: true, type: () => Date }, class: { required: true, type: () => require("./attendance-response.dto").ClassResponseDto } };
    }
}
exports.SessionResponseDto = SessionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của buổi học' }),
    __metadata("design:type", String)
], SessionResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của lớp học' }),
    __metadata("design:type", String)
], SessionResponseDto.prototype, "classId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Năm học' }),
    __metadata("design:type", String)
], SessionResponseDto.prototype, "academicYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày học', type: Date }),
    __metadata("design:type", Date)
], SessionResponseDto.prototype, "sessionDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Giờ bắt đầu' }),
    __metadata("design:type", String)
], SessionResponseDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Giờ kết thúc' }),
    __metadata("design:type", String)
], SessionResponseDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID phòng học' }),
    __metadata("design:type", String)
], SessionResponseDto.prototype, "roomId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trạng thái buổi học' }),
    __metadata("design:type", String)
], SessionResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ghi chú buổi học' }),
    __metadata("design:type", String)
], SessionResponseDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày tạo', type: Date }),
    __metadata("design:type", Date)
], SessionResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ClassResponseDto, description: 'Thông tin lớp học' }),
    __metadata("design:type", ClassResponseDto)
], SessionResponseDto.prototype, "class", void 0);
class AttendanceResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, sessionId: { required: true, type: () => String }, studentId: { required: true, type: () => String }, status: { required: true, type: () => String }, note: { required: false, type: () => String }, recordedBy: { required: true, type: () => String }, recordedAt: { required: true, type: () => Date }, student: { required: true, type: () => require("./attendance-response.dto").StudentResponseDto }, session: { required: true, type: () => require("./attendance-response.dto").SessionResponseDto } };
    }
}
exports.AttendanceResponseDto = AttendanceResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của bản ghi điểm danh' }),
    __metadata("design:type", String)
], AttendanceResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của buổi học' }),
    __metadata("design:type", String)
], AttendanceResponseDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của học sinh' }),
    __metadata("design:type", String)
], AttendanceResponseDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Trạng thái điểm danh',
        enum: ['present', 'absent', 'late', 'excused']
    }),
    __metadata("design:type", String)
], AttendanceResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ghi chú điểm danh', required: false }),
    __metadata("design:type", String)
], AttendanceResponseDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID người ghi nhận' }),
    __metadata("design:type", String)
], AttendanceResponseDto.prototype, "recordedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thời gian ghi nhận', type: Date }),
    __metadata("design:type", Date)
], AttendanceResponseDto.prototype, "recordedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: StudentResponseDto, description: 'Thông tin học sinh' }),
    __metadata("design:type", StudentResponseDto)
], AttendanceResponseDto.prototype, "student", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: SessionResponseDto, description: 'Thông tin buổi học' }),
    __metadata("design:type", SessionResponseDto)
], AttendanceResponseDto.prototype, "session", void 0);
class GetAttendanceResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { data: { required: true, type: () => [require("./attendance-response.dto").AttendanceResponseDto] }, message: { required: true, type: () => String } };
    }
}
exports.GetAttendanceResponseDto = GetAttendanceResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [AttendanceResponseDto],
        description: 'Danh sách điểm danh'
    }),
    __metadata("design:type", Array)
], GetAttendanceResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông báo kết quả' }),
    __metadata("design:type", String)
], GetAttendanceResponseDto.prototype, "message", void 0);
//# sourceMappingURL=attendance-response.dto.js.map