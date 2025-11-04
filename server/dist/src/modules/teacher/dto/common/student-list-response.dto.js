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
exports.StudentListResponseDto = exports.EnrollmentDto = exports.StudentInfoDto = exports.TeacherClassAssignmentDto = exports.TeacherInfoDto = exports.ClassInfoDto = exports.SubjectInfoDto = exports.SchoolInfoDto = exports.UserInfoDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class UserInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, fullName: { required: true, type: () => String }, email: { required: true, type: () => String }, phone: { required: false, type: () => String }, avatar: { required: false, type: () => String }, gender: { required: false, type: () => String }, birthDate: { required: false, type: () => Date } };
    }
}
exports.UserInfoDto = UserInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID người dùng' }),
    __metadata("design:type", String)
], UserInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Họ và tên' }),
    __metadata("design:type", String)
], UserInfoDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email' }),
    __metadata("design:type", String)
], UserInfoDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Số điện thoại', required: false }),
    __metadata("design:type", String)
], UserInfoDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Avatar', required: false }),
    __metadata("design:type", String)
], UserInfoDto.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Giới tính', required: false }),
    __metadata("design:type", String)
], UserInfoDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày sinh', required: false }),
    __metadata("design:type", Date)
], UserInfoDto.prototype, "birthDate", void 0);
class SchoolInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String } };
    }
}
exports.SchoolInfoDto = SchoolInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID trường học' }),
    __metadata("design:type", String)
], SchoolInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên trường học' }),
    __metadata("design:type", String)
], SchoolInfoDto.prototype, "name", void 0);
class SubjectInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String }, code: { required: true, type: () => String } };
    }
}
exports.SubjectInfoDto = SubjectInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID môn học' }),
    __metadata("design:type", String)
], SubjectInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên môn học' }),
    __metadata("design:type", String)
], SubjectInfoDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mã môn học' }),
    __metadata("design:type", String)
], SubjectInfoDto.prototype, "code", void 0);
class ClassInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String }, grade: { required: false, type: () => String }, subject: { required: true, type: () => require("./student-list-response.dto").SubjectInfoDto } };
    }
}
exports.ClassInfoDto = ClassInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID lớp học' }),
    __metadata("design:type", String)
], ClassInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên lớp học' }),
    __metadata("design:type", String)
], ClassInfoDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Khối lớp', required: false }),
    __metadata("design:type", String)
], ClassInfoDto.prototype, "grade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin môn học' }),
    __metadata("design:type", SubjectInfoDto)
], ClassInfoDto.prototype, "subject", void 0);
class TeacherInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, user: { required: true, type: () => ({ fullName: { required: true, type: () => String }, email: { required: true, type: () => String } }) } };
    }
}
exports.TeacherInfoDto = TeacherInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID giáo viên' }),
    __metadata("design:type", String)
], TeacherInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin người dùng' }),
    __metadata("design:type", Object)
], TeacherInfoDto.prototype, "user", void 0);
class TeacherClassAssignmentDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, semester: { required: true, type: () => String }, academicYear: { required: true, type: () => String }, teacher: { required: true, type: () => require("./student-list-response.dto").TeacherInfoDto } };
    }
}
exports.TeacherClassAssignmentDto = TeacherClassAssignmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID phân công' }),
    __metadata("design:type", String)
], TeacherClassAssignmentDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Học kỳ' }),
    __metadata("design:type", String)
], TeacherClassAssignmentDto.prototype, "semester", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Năm học' }),
    __metadata("design:type", String)
], TeacherClassAssignmentDto.prototype, "academicYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin giáo viên' }),
    __metadata("design:type", TeacherInfoDto)
], TeacherClassAssignmentDto.prototype, "teacher", void 0);
class StudentInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, studentCode: { required: false, type: () => String }, address: { required: false, type: () => String }, grade: { required: false, type: () => String }, user: { required: true, type: () => require("./student-list-response.dto").UserInfoDto }, school: { required: true, type: () => require("./student-list-response.dto").SchoolInfoDto } };
    }
}
exports.StudentInfoDto = StudentInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID học sinh' }),
    __metadata("design:type", String)
], StudentInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mã học sinh', required: false }),
    __metadata("design:type", String)
], StudentInfoDto.prototype, "studentCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Địa chỉ', required: false }),
    __metadata("design:type", String)
], StudentInfoDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Khối lớp', required: false }),
    __metadata("design:type", String)
], StudentInfoDto.prototype, "grade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin người dùng' }),
    __metadata("design:type", UserInfoDto)
], StudentInfoDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin trường học' }),
    __metadata("design:type", SchoolInfoDto)
], StudentInfoDto.prototype, "school", void 0);
class EnrollmentDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, enrolledAt: { required: true, type: () => Date }, status: { required: true, type: () => String }, semester: { required: false, type: () => String }, completedAt: { required: false, type: () => Date }, finalGrade: { required: false, type: () => String }, student: { required: true, type: () => require("./student-list-response.dto").StudentInfoDto }, class: { required: true, type: () => require("./student-list-response.dto").ClassInfoDto }, teacherClassAssignment: { required: true, type: () => require("./student-list-response.dto").TeacherClassAssignmentDto } };
    }
}
exports.EnrollmentDto = EnrollmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID đăng ký' }),
    __metadata("design:type", String)
], EnrollmentDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày đăng ký' }),
    __metadata("design:type", Date)
], EnrollmentDto.prototype, "enrolledAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trạng thái' }),
    __metadata("design:type", String)
], EnrollmentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Học kỳ', required: false }),
    __metadata("design:type", String)
], EnrollmentDto.prototype, "semester", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày hoàn thành', required: false }),
    __metadata("design:type", Date)
], EnrollmentDto.prototype, "completedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Điểm cuối kỳ', required: false }),
    __metadata("design:type", String)
], EnrollmentDto.prototype, "finalGrade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin học sinh' }),
    __metadata("design:type", StudentInfoDto)
], EnrollmentDto.prototype, "student", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin lớp học' }),
    __metadata("design:type", ClassInfoDto)
], EnrollmentDto.prototype, "class", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin phân công giáo viên' }),
    __metadata("design:type", TeacherClassAssignmentDto)
], EnrollmentDto.prototype, "teacherClassAssignment", void 0);
class StudentListResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { success: { required: true, type: () => Boolean }, data: { required: true, type: () => [require("./student-list-response.dto").EnrollmentDto] }, message: { required: true, type: () => String } };
    }
}
exports.StudentListResponseDto = StudentListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trạng thái thành công' }),
    __metadata("design:type", Boolean)
], StudentListResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Danh sách học sinh', type: [EnrollmentDto] }),
    __metadata("design:type", Array)
], StudentListResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông báo' }),
    __metadata("design:type", String)
], StudentListResponseDto.prototype, "message", void 0);
//# sourceMappingURL=student-list-response.dto.js.map