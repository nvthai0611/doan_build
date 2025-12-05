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
exports.StudentDetailResponseDto = exports.StudentDetailEnrollmentDto = exports.StudentDetailInfoDto = exports.TeacherClassAssignmentDto = exports.TeacherInfoDto = exports.ClassInfoDto = exports.SubjectInfoDto = exports.GradeInfoDto = exports.AssessmentInfoDto = exports.AttendanceInfoDto = exports.SessionInfoDto = exports.ParentInfoDto = exports.SchoolInfoDto = exports.UserInfoDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class UserInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, fullName: { required: true, type: () => String }, email: { required: true, type: () => String }, phone: { required: false, type: () => String }, avatar: { required: false, type: () => String }, gender: { required: false, type: () => String }, birthDate: { required: false, type: () => Date }, createdAt: { required: true, type: () => Date } };
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
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày tạo' }),
    __metadata("design:type", Date)
], UserInfoDto.prototype, "createdAt", void 0);
class SchoolInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String }, address: { required: false, type: () => String }, phone: { required: false, type: () => String } };
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
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Địa chỉ', required: false }),
    __metadata("design:type", String)
], SchoolInfoDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Số điện thoại', required: false }),
    __metadata("design:type", String)
], SchoolInfoDto.prototype, "phone", void 0);
class ParentInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, user: { required: true, type: () => ({ fullName: { required: true, type: () => String }, email: { required: true, type: () => String }, phone: { required: false, type: () => String } }) } };
    }
}
exports.ParentInfoDto = ParentInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID phụ huynh' }),
    __metadata("design:type", String)
], ParentInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin người dùng' }),
    __metadata("design:type", Object)
], ParentInfoDto.prototype, "user", void 0);
class SessionInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, sessionDate: { required: true, type: () => Date }, startTime: { required: true, type: () => String }, endTime: { required: true, type: () => String }, status: { required: true, type: () => String } };
    }
}
exports.SessionInfoDto = SessionInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID buổi học' }),
    __metadata("design:type", String)
], SessionInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày học' }),
    __metadata("design:type", Date)
], SessionInfoDto.prototype, "sessionDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Giờ bắt đầu' }),
    __metadata("design:type", String)
], SessionInfoDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Giờ kết thúc' }),
    __metadata("design:type", String)
], SessionInfoDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trạng thái' }),
    __metadata("design:type", String)
], SessionInfoDto.prototype, "status", void 0);
class AttendanceInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, status: { required: true, type: () => String }, note: { required: false, type: () => String }, recordedAt: { required: true, type: () => Date }, session: { required: true, type: () => require("./student-detail-response.dto").SessionInfoDto } };
    }
}
exports.AttendanceInfoDto = AttendanceInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID điểm danh' }),
    __metadata("design:type", String)
], AttendanceInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trạng thái điểm danh' }),
    __metadata("design:type", String)
], AttendanceInfoDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ghi chú', required: false }),
    __metadata("design:type", String)
], AttendanceInfoDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày ghi nhận' }),
    __metadata("design:type", Date)
], AttendanceInfoDto.prototype, "recordedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin buổi học' }),
    __metadata("design:type", SessionInfoDto)
], AttendanceInfoDto.prototype, "session", void 0);
class AssessmentInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String }, type: { required: true, type: () => String }, maxScore: { required: true, type: () => Number }, date: { required: true, type: () => Date } };
    }
}
exports.AssessmentInfoDto = AssessmentInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID bài kiểm tra' }),
    __metadata("design:type", String)
], AssessmentInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên bài kiểm tra' }),
    __metadata("design:type", String)
], AssessmentInfoDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loại bài kiểm tra' }),
    __metadata("design:type", String)
], AssessmentInfoDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Điểm tối đa' }),
    __metadata("design:type", Number)
], AssessmentInfoDto.prototype, "maxScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày kiểm tra' }),
    __metadata("design:type", Date)
], AssessmentInfoDto.prototype, "date", void 0);
class GradeInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, score: { required: false, type: () => Number }, feedback: { required: false, type: () => String }, gradedAt: { required: true, type: () => Date }, assessment: { required: true, type: () => require("./student-detail-response.dto").AssessmentInfoDto } };
    }
}
exports.GradeInfoDto = GradeInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID điểm số' }),
    __metadata("design:type", String)
], GradeInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Điểm số', required: false }),
    __metadata("design:type", Number)
], GradeInfoDto.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nhận xét', required: false }),
    __metadata("design:type", String)
], GradeInfoDto.prototype, "feedback", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày chấm điểm' }),
    __metadata("design:type", Date)
], GradeInfoDto.prototype, "gradedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin bài kiểm tra' }),
    __metadata("design:type", AssessmentInfoDto)
], GradeInfoDto.prototype, "assessment", void 0);
class SubjectInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String }, code: { required: true, type: () => String }, description: { required: false, type: () => String } };
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
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mô tả', required: false }),
    __metadata("design:type", String)
], SubjectInfoDto.prototype, "description", void 0);
class ClassInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String }, grade: { required: false, type: () => String }, description: { required: false, type: () => String }, subject: { required: true, type: () => require("./student-detail-response.dto").SubjectInfoDto } };
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
    (0, swagger_1.ApiProperty)({ description: 'Mô tả', required: false }),
    __metadata("design:type", String)
], ClassInfoDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin môn học' }),
    __metadata("design:type", SubjectInfoDto)
], ClassInfoDto.prototype, "subject", void 0);
class TeacherInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, user: { required: true, type: () => ({ fullName: { required: true, type: () => String }, email: { required: true, type: () => String }, phone: { required: false, type: () => String } }) } };
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
        return { id: { required: true, type: () => String }, semester: { required: true, type: () => String }, academicYear: { required: true, type: () => String }, startDate: { required: true, type: () => Date }, endDate: { required: false, type: () => Date }, status: { required: true, type: () => String }, teacher: { required: true, type: () => require("./student-detail-response.dto").TeacherInfoDto } };
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
    (0, swagger_1.ApiProperty)({ description: 'Ngày bắt đầu' }),
    __metadata("design:type", Date)
], TeacherClassAssignmentDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày kết thúc', required: false }),
    __metadata("design:type", Date)
], TeacherClassAssignmentDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trạng thái' }),
    __metadata("design:type", String)
], TeacherClassAssignmentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin giáo viên' }),
    __metadata("design:type", TeacherInfoDto)
], TeacherClassAssignmentDto.prototype, "teacher", void 0);
class StudentDetailInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, studentCode: { required: false, type: () => String }, address: { required: false, type: () => String }, grade: { required: false, type: () => String }, user: { required: true, type: () => require("./student-detail-response.dto").UserInfoDto }, school: { required: true, type: () => require("./student-detail-response.dto").SchoolInfoDto }, parent: { required: false, type: () => require("./student-detail-response.dto").ParentInfoDto }, attendances: { required: true, type: () => [require("./student-detail-response.dto").AttendanceInfoDto] }, grades: { required: true, type: () => [require("./student-detail-response.dto").GradeInfoDto] } };
    }
}
exports.StudentDetailInfoDto = StudentDetailInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID học sinh' }),
    __metadata("design:type", String)
], StudentDetailInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mã học sinh', required: false }),
    __metadata("design:type", String)
], StudentDetailInfoDto.prototype, "studentCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Địa chỉ', required: false }),
    __metadata("design:type", String)
], StudentDetailInfoDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Khối lớp', required: false }),
    __metadata("design:type", String)
], StudentDetailInfoDto.prototype, "grade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin người dùng' }),
    __metadata("design:type", UserInfoDto)
], StudentDetailInfoDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin trường học' }),
    __metadata("design:type", SchoolInfoDto)
], StudentDetailInfoDto.prototype, "school", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin phụ huynh', required: false }),
    __metadata("design:type", ParentInfoDto)
], StudentDetailInfoDto.prototype, "parent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lịch sử điểm danh', type: [AttendanceInfoDto] }),
    __metadata("design:type", Array)
], StudentDetailInfoDto.prototype, "attendances", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lịch sử điểm số', type: [GradeInfoDto] }),
    __metadata("design:type", Array)
], StudentDetailInfoDto.prototype, "grades", void 0);
class StudentDetailEnrollmentDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, enrolledAt: { required: true, type: () => Date }, status: { required: true, type: () => String }, semester: { required: false, type: () => String }, completedAt: { required: false, type: () => Date }, finalGrade: { required: false, type: () => String }, student: { required: true, type: () => require("./student-detail-response.dto").StudentDetailInfoDto }, class: { required: true, type: () => require("./student-detail-response.dto").ClassInfoDto }, teacherClassAssignment: { required: true, type: () => require("./student-detail-response.dto").TeacherClassAssignmentDto } };
    }
}
exports.StudentDetailEnrollmentDto = StudentDetailEnrollmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID đăng ký' }),
    __metadata("design:type", String)
], StudentDetailEnrollmentDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày đăng ký' }),
    __metadata("design:type", Date)
], StudentDetailEnrollmentDto.prototype, "enrolledAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trạng thái' }),
    __metadata("design:type", String)
], StudentDetailEnrollmentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Học kỳ', required: false }),
    __metadata("design:type", String)
], StudentDetailEnrollmentDto.prototype, "semester", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày hoàn thành', required: false }),
    __metadata("design:type", Date)
], StudentDetailEnrollmentDto.prototype, "completedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Điểm cuối kỳ', required: false }),
    __metadata("design:type", String)
], StudentDetailEnrollmentDto.prototype, "finalGrade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin học sinh' }),
    __metadata("design:type", StudentDetailInfoDto)
], StudentDetailEnrollmentDto.prototype, "student", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin lớp học' }),
    __metadata("design:type", ClassInfoDto)
], StudentDetailEnrollmentDto.prototype, "class", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin phân công giáo viên' }),
    __metadata("design:type", TeacherClassAssignmentDto)
], StudentDetailEnrollmentDto.prototype, "teacherClassAssignment", void 0);
class StudentDetailResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { success: { required: true, type: () => Boolean }, data: { required: false, type: () => require("./student-detail-response.dto").StudentDetailEnrollmentDto }, message: { required: true, type: () => String } };
    }
}
exports.StudentDetailResponseDto = StudentDetailResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trạng thái thành công' }),
    __metadata("design:type", Boolean)
], StudentDetailResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin chi tiết học sinh', type: StudentDetailEnrollmentDto, required: false }),
    __metadata("design:type", StudentDetailEnrollmentDto)
], StudentDetailResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông báo' }),
    __metadata("design:type", String)
], StudentDetailResponseDto.prototype, "message", void 0);
//# sourceMappingURL=student-detail-response.dto.js.map