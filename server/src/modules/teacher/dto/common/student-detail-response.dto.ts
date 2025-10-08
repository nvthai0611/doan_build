import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
  @ApiProperty({ description: 'ID người dùng' })
  id: string;

  @ApiProperty({ description: 'Họ và tên' })
  fullName: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({ description: 'Số điện thoại', required: false })
  phone?: string;

  @ApiProperty({ description: 'Avatar', required: false })
  avatar?: string;

  @ApiProperty({ description: 'Giới tính', required: false })
  gender?: string;

  @ApiProperty({ description: 'Ngày sinh', required: false })
  birthDate?: Date;

  @ApiProperty({ description: 'Ngày tạo' })
  createdAt: Date;
}

export class SchoolInfoDto {
  @ApiProperty({ description: 'ID trường học' })
  id: string;

  @ApiProperty({ description: 'Tên trường học' })
  name: string;

  @ApiProperty({ description: 'Địa chỉ', required: false })
  address?: string;

  @ApiProperty({ description: 'Số điện thoại', required: false })
  phone?: string;
}

export class ParentInfoDto {
  @ApiProperty({ description: 'ID phụ huynh' })
  id: string;

  @ApiProperty({ description: 'Thông tin người dùng' })
  user: {
    fullName: string;
    email: string;
    phone?: string;
  };
}

export class SessionInfoDto {
  @ApiProperty({ description: 'ID buổi học' })
  id: string;

  @ApiProperty({ description: 'Ngày học' })
  sessionDate: Date;

  @ApiProperty({ description: 'Giờ bắt đầu' })
  startTime: string;

  @ApiProperty({ description: 'Giờ kết thúc' })
  endTime: string;

  @ApiProperty({ description: 'Trạng thái' })
  status: string;
}

export class AttendanceInfoDto {
  @ApiProperty({ description: 'ID điểm danh' })
  id: string;

  @ApiProperty({ description: 'Trạng thái điểm danh' })
  status: string;

  @ApiProperty({ description: 'Ghi chú', required: false })
  note?: string;

  @ApiProperty({ description: 'Ngày ghi nhận' })
  recordedAt: Date;

  @ApiProperty({ description: 'Thông tin buổi học' })
  session: SessionInfoDto;
}

export class AssessmentInfoDto {
  @ApiProperty({ description: 'ID bài kiểm tra' })
  id: string;

  @ApiProperty({ description: 'Tên bài kiểm tra' })
  name: string;

  @ApiProperty({ description: 'Loại bài kiểm tra' })
  type: string;

  @ApiProperty({ description: 'Điểm tối đa' })
  maxScore: number;

  @ApiProperty({ description: 'Ngày kiểm tra' })
  date: Date;
}

export class GradeInfoDto {
  @ApiProperty({ description: 'ID điểm số' })
  id: string;

  @ApiProperty({ description: 'Điểm số', required: false })
  score?: number;

  @ApiProperty({ description: 'Nhận xét', required: false })
  feedback?: string;

  @ApiProperty({ description: 'Ngày chấm điểm' })
  gradedAt: Date;

  @ApiProperty({ description: 'Thông tin bài kiểm tra' })
  assessment: AssessmentInfoDto;
}

export class SubjectInfoDto {
  @ApiProperty({ description: 'ID môn học' })
  id: string;

  @ApiProperty({ description: 'Tên môn học' })
  name: string;

  @ApiProperty({ description: 'Mã môn học' })
  code: string;

  @ApiProperty({ description: 'Mô tả', required: false })
  description?: string;
}

export class ClassInfoDto {
  @ApiProperty({ description: 'ID lớp học' })
  id: string;

  @ApiProperty({ description: 'Tên lớp học' })
  name: string;

  @ApiProperty({ description: 'Khối lớp', required: false })
  grade?: string;

  @ApiProperty({ description: 'Mô tả', required: false })
  description?: string;

  @ApiProperty({ description: 'Thông tin môn học' })
  subject: SubjectInfoDto;
}

export class TeacherInfoDto {
  @ApiProperty({ description: 'ID giáo viên' })
  id: string;

  @ApiProperty({ description: 'Thông tin người dùng' })
  user: {
    fullName: string;
    email: string;
    phone?: string;
  };
}

export class TeacherClassAssignmentDto {
  @ApiProperty({ description: 'ID phân công' })
  id: string;

  @ApiProperty({ description: 'Học kỳ' })
  semester: string;

  @ApiProperty({ description: 'Năm học' })
  academicYear: string;

  @ApiProperty({ description: 'Ngày bắt đầu' })
  startDate: Date;

  @ApiProperty({ description: 'Ngày kết thúc', required: false })
  endDate?: Date;

  @ApiProperty({ description: 'Trạng thái' })
  status: string;

  @ApiProperty({ description: 'Thông tin giáo viên' })
  teacher: TeacherInfoDto;
}

export class StudentDetailInfoDto {
  @ApiProperty({ description: 'ID học sinh' })
  id: string;

  @ApiProperty({ description: 'Mã học sinh', required: false })
  studentCode?: string;

  @ApiProperty({ description: 'Địa chỉ', required: false })
  address?: string;

  @ApiProperty({ description: 'Khối lớp', required: false })
  grade?: string;

  @ApiProperty({ description: 'Thông tin người dùng' })
  user: UserInfoDto;

  @ApiProperty({ description: 'Thông tin trường học' })
  school: SchoolInfoDto;

  @ApiProperty({ description: 'Thông tin phụ huynh', required: false })
  parent?: ParentInfoDto;

  @ApiProperty({ description: 'Lịch sử điểm danh', type: [AttendanceInfoDto] })
  attendances: AttendanceInfoDto[];

  @ApiProperty({ description: 'Lịch sử điểm số', type: [GradeInfoDto] })
  grades: GradeInfoDto[];
}

export class StudentDetailEnrollmentDto {
  @ApiProperty({ description: 'ID đăng ký' })
  id: string;

  @ApiProperty({ description: 'Ngày đăng ký' })
  enrolledAt: Date;

  @ApiProperty({ description: 'Trạng thái' })
  status: string;

  @ApiProperty({ description: 'Học kỳ', required: false })
  semester?: string;

  @ApiProperty({ description: 'Ngày hoàn thành', required: false })
  completedAt?: Date;

  @ApiProperty({ description: 'Điểm cuối kỳ', required: false })
  finalGrade?: string;

  @ApiProperty({ description: 'Thông tin học sinh' })
  student: StudentDetailInfoDto;

  @ApiProperty({ description: 'Thông tin lớp học' })
  class: ClassInfoDto;

  @ApiProperty({ description: 'Thông tin phân công giáo viên' })
  teacherClassAssignment: TeacherClassAssignmentDto;
}

export class StudentDetailResponseDto {
  @ApiProperty({ description: 'Trạng thái thành công' })
  success: boolean;

  @ApiProperty({ description: 'Thông tin chi tiết học sinh', type: StudentDetailEnrollmentDto, required: false })
  data?: StudentDetailEnrollmentDto;

  @ApiProperty({ description: 'Thông báo' })
  message: string;
}
