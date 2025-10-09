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
}

export class SchoolInfoDto {
  @ApiProperty({ description: 'ID trường học' })
  id: string;

  @ApiProperty({ description: 'Tên trường học' })
  name: string;
}

export class SubjectInfoDto {
  @ApiProperty({ description: 'ID môn học' })
  id: string;

  @ApiProperty({ description: 'Tên môn học' })
  name: string;

  @ApiProperty({ description: 'Mã môn học' })
  code: string;
}

export class ClassInfoDto {
  @ApiProperty({ description: 'ID lớp học' })
  id: string;

  @ApiProperty({ description: 'Tên lớp học' })
  name: string;

  @ApiProperty({ description: 'Khối lớp', required: false })
  grade?: string;

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
  };
}

export class TeacherClassAssignmentDto {
  @ApiProperty({ description: 'ID phân công' })
  id: string;

  @ApiProperty({ description: 'Học kỳ' })
  semester: string;

  @ApiProperty({ description: 'Năm học' })
  academicYear: string;

  @ApiProperty({ description: 'Thông tin giáo viên' })
  teacher: TeacherInfoDto;
}

export class StudentInfoDto {
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
}

export class EnrollmentDto {
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
  student: StudentInfoDto;

  @ApiProperty({ description: 'Thông tin lớp học' })
  class: ClassInfoDto;

  @ApiProperty({ description: 'Thông tin phân công giáo viên' })
  teacherClassAssignment: TeacherClassAssignmentDto;
}

export class StudentListResponseDto {
  @ApiProperty({ description: 'Trạng thái thành công' })
  success: boolean;

  @ApiProperty({ description: 'Danh sách học sinh', type: [EnrollmentDto] })
  data: EnrollmentDto[];

  @ApiProperty({ description: 'Thông báo' })
  message: string;
}
