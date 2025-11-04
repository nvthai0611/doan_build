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
exports.TeacherResponseDto = exports.TeachersListResponseDto = exports.TeacherDetailDto = exports.TeacherCountDto = exports.LeaveRequestInfoDto = exports.DocumentInfoDto = exports.PayrollInfoDto = exports.ContractInfoDto = exports.ClassInfoDto = exports.EnrollmentInfoDto = exports.StudentInfoDto = exports.RoomInfoDto = exports.SubjectInfoDto = exports.UserInfoDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class UserInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, username: { required: true, type: () => String }, email: { required: true, type: () => String }, fullName: { required: false, type: () => String }, phone: { required: false, type: () => String }, role: { required: true, type: () => String }, isActive: { required: true, type: () => Boolean }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date } };
    }
}
exports.UserInfoDto = UserInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của user' }),
    __metadata("design:type", String)
], UserInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên đăng nhập' }),
    __metadata("design:type", String)
], UserInfoDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email' }),
    __metadata("design:type", String)
], UserInfoDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Họ và tên', required: false }),
    __metadata("design:type", String)
], UserInfoDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Số điện thoại', required: false }),
    __metadata("design:type", String)
], UserInfoDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vai trò' }),
    __metadata("design:type", String)
], UserInfoDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trạng thái hoạt động' }),
    __metadata("design:type", Boolean)
], UserInfoDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày tạo' }),
    __metadata("design:type", Date)
], UserInfoDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày cập nhật' }),
    __metadata("design:type", Date)
], UserInfoDto.prototype, "updatedAt", void 0);
class SubjectInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, code: { required: true, type: () => String }, name: { required: true, type: () => String }, description: { required: false, type: () => String } };
    }
}
exports.SubjectInfoDto = SubjectInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của môn học' }),
    __metadata("design:type", String)
], SubjectInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mã môn học' }),
    __metadata("design:type", String)
], SubjectInfoDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên môn học' }),
    __metadata("design:type", String)
], SubjectInfoDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mô tả môn học', required: false }),
    __metadata("design:type", String)
], SubjectInfoDto.prototype, "description", void 0);
class RoomInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String }, capacity: { required: false, type: () => Number }, equipment: { required: false, type: () => Object }, isActive: { required: true, type: () => Boolean } };
    }
}
exports.RoomInfoDto = RoomInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của phòng học' }),
    __metadata("design:type", String)
], RoomInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên phòng học' }),
    __metadata("design:type", String)
], RoomInfoDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sức chứa', required: false }),
    __metadata("design:type", Number)
], RoomInfoDto.prototype, "capacity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thiết bị trong phòng', required: false }),
    __metadata("design:type", Object)
], RoomInfoDto.prototype, "equipment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trạng thái hoạt động' }),
    __metadata("design:type", Boolean)
], RoomInfoDto.prototype, "isActive", void 0);
class StudentInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, studentCode: { required: false, type: () => String }, grade: { required: false, type: () => String }, user: { required: true, type: () => ({ fullName: { required: false, type: () => String }, email: { required: true, type: () => String }, phone: { required: false, type: () => String } }) } };
    }
}
exports.StudentInfoDto = StudentInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của học sinh' }),
    __metadata("design:type", String)
], StudentInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mã học sinh', required: false }),
    __metadata("design:type", String)
], StudentInfoDto.prototype, "studentCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lớp', required: false }),
    __metadata("design:type", String)
], StudentInfoDto.prototype, "grade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin user của học sinh' }),
    __metadata("design:type", Object)
], StudentInfoDto.prototype, "user", void 0);
class EnrollmentInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, status: { required: true, type: () => String }, enrolledAt: { required: true, type: () => Date }, student: { required: true, type: () => require("./teacher-response.dto").StudentInfoDto } };
    }
}
exports.EnrollmentInfoDto = EnrollmentInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của enrollment' }),
    __metadata("design:type", String)
], EnrollmentInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trạng thái đăng ký' }),
    __metadata("design:type", String)
], EnrollmentInfoDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày đăng ký' }),
    __metadata("design:type", Date)
], EnrollmentInfoDto.prototype, "enrolledAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin học sinh' }),
    __metadata("design:type", StudentInfoDto)
], EnrollmentInfoDto.prototype, "student", void 0);
class ClassInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String }, grade: { required: false, type: () => String }, maxStudents: { required: false, type: () => Number }, startDate: { required: false, type: () => Date }, endDate: { required: false, type: () => Date }, recurringSchedule: { required: false, type: () => Object }, status: { required: true, type: () => String }, description: { required: false, type: () => String }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date }, subject: { required: true, type: () => require("./teacher-response.dto").SubjectInfoDto }, room: { required: false, type: () => require("./teacher-response.dto").RoomInfoDto }, enrollments: { required: true, type: () => [require("./teacher-response.dto").EnrollmentInfoDto] }, _count: { required: true, type: () => ({ enrollments: { required: true, type: () => Number }, sessions: { required: true, type: () => Number }, assessments: { required: true, type: () => Number } }) } };
    }
}
exports.ClassInfoDto = ClassInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của lớp học' }),
    __metadata("design:type", String)
], ClassInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên lớp học' }),
    __metadata("design:type", String)
], ClassInfoDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lớp', required: false }),
    __metadata("design:type", String)
], ClassInfoDto.prototype, "grade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Số học sinh tối đa', required: false }),
    __metadata("design:type", Number)
], ClassInfoDto.prototype, "maxStudents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày bắt đầu', required: false }),
    __metadata("design:type", Date)
], ClassInfoDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày kết thúc', required: false }),
    __metadata("design:type", Date)
], ClassInfoDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lịch học định kỳ', required: false }),
    __metadata("design:type", Object)
], ClassInfoDto.prototype, "recurringSchedule", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trạng thái lớp học' }),
    __metadata("design:type", String)
], ClassInfoDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mô tả', required: false }),
    __metadata("design:type", String)
], ClassInfoDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày tạo' }),
    __metadata("design:type", Date)
], ClassInfoDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày cập nhật' }),
    __metadata("design:type", Date)
], ClassInfoDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin môn học' }),
    __metadata("design:type", SubjectInfoDto)
], ClassInfoDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin phòng học', required: false }),
    __metadata("design:type", RoomInfoDto)
], ClassInfoDto.prototype, "room", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Danh sách đăng ký' }),
    __metadata("design:type", Array)
], ClassInfoDto.prototype, "enrollments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thống kê số lượng' }),
    __metadata("design:type", Object)
], ClassInfoDto.prototype, "_count", void 0);
class ContractInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, startDate: { required: false, type: () => Date }, endDate: { required: false, type: () => Date }, salary: { required: false, type: () => Object }, status: { required: true, type: () => String }, terms: { required: false, type: () => Object }, createdAt: { required: true, type: () => Date } };
    }
}
exports.ContractInfoDto = ContractInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của hợp đồng' }),
    __metadata("design:type", String)
], ContractInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày bắt đầu', required: false }),
    __metadata("design:type", Date)
], ContractInfoDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày kết thúc', required: false }),
    __metadata("design:type", Date)
], ContractInfoDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lương', required: false }),
    __metadata("design:type", Object)
], ContractInfoDto.prototype, "salary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trạng thái hợp đồng' }),
    __metadata("design:type", String)
], ContractInfoDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Điều khoản', required: false }),
    __metadata("design:type", Object)
], ContractInfoDto.prototype, "terms", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày tạo' }),
    __metadata("design:type", Date)
], ContractInfoDto.prototype, "createdAt", void 0);
class PayrollInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, periodStart: { required: true, type: () => Date }, periodEnd: { required: true, type: () => Date }, baseSalary: { required: true, type: () => Object }, teachingHours: { required: false, type: () => Object }, hourlyRate: { required: false, type: () => Object }, bonuses: { required: true, type: () => Object }, deductions: { required: true, type: () => Object }, totalAmount: { required: true, type: () => Object }, status: { required: true, type: () => String }, paidAt: { required: false, type: () => Date } };
    }
}
exports.PayrollInfoDto = PayrollInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của bảng lương' }),
    __metadata("design:type", String)
], PayrollInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày bắt đầu kỳ lương' }),
    __metadata("design:type", Date)
], PayrollInfoDto.prototype, "periodStart", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày kết thúc kỳ lương' }),
    __metadata("design:type", Date)
], PayrollInfoDto.prototype, "periodEnd", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lương cơ bản' }),
    __metadata("design:type", Object)
], PayrollInfoDto.prototype, "baseSalary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Số giờ dạy', required: false }),
    __metadata("design:type", Object)
], PayrollInfoDto.prototype, "teachingHours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lương theo giờ', required: false }),
    __metadata("design:type", Object)
], PayrollInfoDto.prototype, "hourlyRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thưởng' }),
    __metadata("design:type", Object)
], PayrollInfoDto.prototype, "bonuses", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Khấu trừ' }),
    __metadata("design:type", Object)
], PayrollInfoDto.prototype, "deductions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tổng lương' }),
    __metadata("design:type", Object)
], PayrollInfoDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trạng thái' }),
    __metadata("design:type", String)
], PayrollInfoDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày thanh toán', required: false }),
    __metadata("design:type", Date)
], PayrollInfoDto.prototype, "paidAt", void 0);
class DocumentInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, docType: { required: false, type: () => String }, docUrl: { required: false, type: () => String }, uploadedAt: { required: true, type: () => Date } };
    }
}
exports.DocumentInfoDto = DocumentInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của tài liệu' }),
    __metadata("design:type", String)
], DocumentInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loại tài liệu', required: false }),
    __metadata("design:type", String)
], DocumentInfoDto.prototype, "docType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'URL tài liệu', required: false }),
    __metadata("design:type", String)
], DocumentInfoDto.prototype, "docUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày upload' }),
    __metadata("design:type", Date)
], DocumentInfoDto.prototype, "uploadedAt", void 0);
class LeaveRequestInfoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, requestType: { required: true, type: () => String }, startDate: { required: true, type: () => Date }, endDate: { required: true, type: () => Date }, reason: { required: true, type: () => String }, status: { required: true, type: () => String }, createdAt: { required: true, type: () => Date }, approvedAt: { required: false, type: () => Date } };
    }
}
exports.LeaveRequestInfoDto = LeaveRequestInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của đơn nghỉ phép' }),
    __metadata("design:type", String)
], LeaveRequestInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loại đơn nghỉ phép' }),
    __metadata("design:type", String)
], LeaveRequestInfoDto.prototype, "requestType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày bắt đầu nghỉ' }),
    __metadata("design:type", Date)
], LeaveRequestInfoDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày kết thúc nghỉ' }),
    __metadata("design:type", Date)
], LeaveRequestInfoDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lý do nghỉ' }),
    __metadata("design:type", String)
], LeaveRequestInfoDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trạng thái đơn' }),
    __metadata("design:type", String)
], LeaveRequestInfoDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày tạo' }),
    __metadata("design:type", Date)
], LeaveRequestInfoDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày duyệt', required: false }),
    __metadata("design:type", Date)
], LeaveRequestInfoDto.prototype, "approvedAt", void 0);
class TeacherCountDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { classes: { required: true, type: () => Number }, contracts: { required: true, type: () => Number }, payrolls: { required: true, type: () => Number }, documents: { required: true, type: () => Number }, leaveRequests: { required: true, type: () => Number } };
    }
}
exports.TeacherCountDto = TeacherCountDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Số lớp học' }),
    __metadata("design:type", Number)
], TeacherCountDto.prototype, "classes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Số hợp đồng' }),
    __metadata("design:type", Number)
], TeacherCountDto.prototype, "contracts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Số bảng lương' }),
    __metadata("design:type", Number)
], TeacherCountDto.prototype, "payrolls", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Số tài liệu' }),
    __metadata("design:type", Number)
], TeacherCountDto.prototype, "documents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Số đơn nghỉ phép' }),
    __metadata("design:type", Number)
], TeacherCountDto.prototype, "leaveRequests", void 0);
class TeacherDetailDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, userId: { required: true, type: () => String }, contractEnd: { required: false, type: () => Date }, subjects: { required: true, type: () => [String] }, salary: { required: false, type: () => Object }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date }, user: { required: true, type: () => require("./teacher-response.dto").UserInfoDto }, classes: { required: true, type: () => [require("./teacher-response.dto").ClassInfoDto] }, contracts: { required: true, type: () => [require("./teacher-response.dto").ContractInfoDto] }, payrolls: { required: true, type: () => [require("./teacher-response.dto").PayrollInfoDto] }, documents: { required: true, type: () => [require("./teacher-response.dto").DocumentInfoDto] }, leaveRequests: { required: true, type: () => [require("./teacher-response.dto").LeaveRequestInfoDto] }, _count: { required: true, type: () => require("./teacher-response.dto").TeacherCountDto } };
    }
}
exports.TeacherDetailDto = TeacherDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của giáo viên' }),
    __metadata("design:type", String)
], TeacherDetailDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của user' }),
    __metadata("design:type", String)
], TeacherDetailDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày kết thúc hợp đồng', required: false }),
    __metadata("design:type", Date)
], TeacherDetailDto.prototype, "contractEnd", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Các môn dạy được' }),
    __metadata("design:type", Array)
], TeacherDetailDto.prototype, "subjects", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lương', required: false }),
    __metadata("design:type", Object)
], TeacherDetailDto.prototype, "salary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày tạo' }),
    __metadata("design:type", Date)
], TeacherDetailDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày cập nhật' }),
    __metadata("design:type", Date)
], TeacherDetailDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin user' }),
    __metadata("design:type", UserInfoDto)
], TeacherDetailDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Danh sách lớp học' }),
    __metadata("design:type", Array)
], TeacherDetailDto.prototype, "classes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Danh sách hợp đồng' }),
    __metadata("design:type", Array)
], TeacherDetailDto.prototype, "contracts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Danh sách bảng lương' }),
    __metadata("design:type", Array)
], TeacherDetailDto.prototype, "payrolls", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Danh sách tài liệu' }),
    __metadata("design:type", Array)
], TeacherDetailDto.prototype, "documents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Danh sách đơn nghỉ phép' }),
    __metadata("design:type", Array)
], TeacherDetailDto.prototype, "leaveRequests", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thống kê số lượng' }),
    __metadata("design:type", TeacherCountDto)
], TeacherDetailDto.prototype, "_count", void 0);
class TeachersListResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { success: { required: true, type: () => Boolean }, data: { required: true, type: () => [require("./teacher-response.dto").TeacherDetailDto] }, total: { required: true, type: () => Number }, message: { required: true, type: () => String } };
    }
}
exports.TeachersListResponseDto = TeachersListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trạng thái thành công' }),
    __metadata("design:type", Boolean)
], TeachersListResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dữ liệu danh sách giáo viên', type: [TeacherDetailDto] }),
    __metadata("design:type", Array)
], TeachersListResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tổng số lượng' }),
    __metadata("design:type", Number)
], TeachersListResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông báo' }),
    __metadata("design:type", String)
], TeachersListResponseDto.prototype, "message", void 0);
class TeacherResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { success: { required: true, type: () => Boolean }, data: { required: true, type: () => require("./teacher-response.dto").TeacherDetailDto }, message: { required: true, type: () => String } };
    }
}
exports.TeacherResponseDto = TeacherResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trạng thái thành công' }),
    __metadata("design:type", Boolean)
], TeacherResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dữ liệu giáo viên', type: TeacherDetailDto }),
    __metadata("design:type", TeacherDetailDto)
], TeacherResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông báo' }),
    __metadata("design:type", String)
], TeacherResponseDto.prototype, "message", void 0);
//# sourceMappingURL=teacher-response.dto.js.map