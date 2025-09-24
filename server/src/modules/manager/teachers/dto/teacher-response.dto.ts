import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
  @ApiProperty({ description: 'ID của user' })
  id: string;

  @ApiProperty({ description: 'Tên đăng nhập' })
  username: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({ description: 'Họ và tên', required: false })
  fullName?: string;

  @ApiProperty({ description: 'Số điện thoại', required: false })
  phone?: string;

  @ApiProperty({ description: 'Vai trò' })
  role: string;

  @ApiProperty({ description: 'Trạng thái hoạt động' })
  isActive: boolean;

  @ApiProperty({ description: 'Ngày tạo' })
  createdAt: Date;

  @ApiProperty({ description: 'Ngày cập nhật' })
  updatedAt: Date;
}

export class SubjectInfoDto {
  @ApiProperty({ description: 'ID của môn học' })
  id: string;

  @ApiProperty({ description: 'Mã môn học' })
  code: string;

  @ApiProperty({ description: 'Tên môn học' })
  name: string;

  @ApiProperty({ description: 'Mô tả môn học', required: false })
  description?: string;
}

export class RoomInfoDto {
  @ApiProperty({ description: 'ID của phòng học' })
  id: string;

  @ApiProperty({ description: 'Tên phòng học' })
  name: string;

  @ApiProperty({ description: 'Sức chứa', required: false })
  capacity?: number;

  @ApiProperty({ description: 'Thiết bị trong phòng', required: false })
  equipment?: any;

  @ApiProperty({ description: 'Trạng thái hoạt động' })
  isActive: boolean;
}

export class StudentInfoDto {
  @ApiProperty({ description: 'ID của học sinh' })
  id: string;

  @ApiProperty({ description: 'Mã học sinh', required: false })
  studentCode?: string;

  @ApiProperty({ description: 'Lớp', required: false })
  grade?: string;

  @ApiProperty({ description: 'Thông tin user của học sinh' })
  user: {
    fullName?: string;
    email: string;
    phone?: string;
  };
}

export class EnrollmentInfoDto {
  @ApiProperty({ description: 'ID của enrollment' })
  id: string;

  @ApiProperty({ description: 'Trạng thái đăng ký' })
  status: string;

  @ApiProperty({ description: 'Ngày đăng ký' })
  enrolledAt: Date;

  @ApiProperty({ description: 'Thông tin học sinh' })
  student: StudentInfoDto;
}

export class ClassInfoDto {
  @ApiProperty({ description: 'ID của lớp học' })
  id: string;

  @ApiProperty({ description: 'Tên lớp học' })
  name: string;

  @ApiProperty({ description: 'Lớp', required: false })
  grade?: string;

  @ApiProperty({ description: 'Số học sinh tối đa', required: false })
  maxStudents?: number;

  @ApiProperty({ description: 'Ngày bắt đầu', required: false })
  startDate?: Date;

  @ApiProperty({ description: 'Ngày kết thúc', required: false })
  endDate?: Date;

  @ApiProperty({ description: 'Lịch học định kỳ', required: false })
  recurringSchedule?: any;

  @ApiProperty({ description: 'Trạng thái lớp học' })
  status: string;

  @ApiProperty({ description: 'Mô tả', required: false })
  description?: string;

  @ApiProperty({ description: 'Ngày tạo' })
  createdAt: Date;

  @ApiProperty({ description: 'Ngày cập nhật' })
  updatedAt: Date;

  @ApiProperty({ description: 'Thông tin môn học' })
  subject: SubjectInfoDto;

  @ApiProperty({ description: 'Thông tin phòng học', required: false })
  room?: RoomInfoDto;

  @ApiProperty({ description: 'Danh sách đăng ký' })
  enrollments: EnrollmentInfoDto[];

  @ApiProperty({ description: 'Thống kê số lượng' })
  _count: {
    enrollments: number;
    sessions: number;
    assessments: number;
  };
}

export class ContractInfoDto {
  @ApiProperty({ description: 'ID của hợp đồng' })
  id: string;

  @ApiProperty({ description: 'Ngày bắt đầu', required: false })
  startDate?: Date;

  @ApiProperty({ description: 'Ngày kết thúc', required: false })
  endDate?: Date;

  @ApiProperty({ description: 'Lương', required: false })
  salary?: any;

  @ApiProperty({ description: 'Trạng thái hợp đồng' })
  status: string;

  @ApiProperty({ description: 'Điều khoản', required: false })
  terms?: any;

  @ApiProperty({ description: 'Ngày tạo' })
  createdAt: Date;
}

export class PayrollInfoDto {
  @ApiProperty({ description: 'ID của bảng lương' })
  id: string;

  @ApiProperty({ description: 'Ngày bắt đầu kỳ lương' })
  periodStart: Date;

  @ApiProperty({ description: 'Ngày kết thúc kỳ lương' })
  periodEnd: Date;

  @ApiProperty({ description: 'Lương cơ bản' })
  baseSalary: any;

  @ApiProperty({ description: 'Số giờ dạy', required: false })
  teachingHours?: any;

  @ApiProperty({ description: 'Lương theo giờ', required: false })
  hourlyRate?: any;

  @ApiProperty({ description: 'Thưởng' })
  bonuses: any;

  @ApiProperty({ description: 'Khấu trừ' })
  deductions: any;

  @ApiProperty({ description: 'Tổng lương' })
  totalAmount: any;

  @ApiProperty({ description: 'Trạng thái' })
  status: string;

  @ApiProperty({ description: 'Ngày thanh toán', required: false })
  paidAt?: Date;
}

export class DocumentInfoDto {
  @ApiProperty({ description: 'ID của tài liệu' })
  id: string;

  @ApiProperty({ description: 'Loại tài liệu', required: false })
  docType?: string;

  @ApiProperty({ description: 'URL tài liệu', required: false })
  docUrl?: string;

  @ApiProperty({ description: 'Ngày upload' })
  uploadedAt: Date;
}

export class LeaveRequestInfoDto {
  @ApiProperty({ description: 'ID của đơn nghỉ phép' })
  id: string;

  @ApiProperty({ description: 'Loại đơn nghỉ phép' })
  requestType: string;

  @ApiProperty({ description: 'Ngày bắt đầu nghỉ' })
  startDate: Date;

  @ApiProperty({ description: 'Ngày kết thúc nghỉ' })
  endDate: Date;

  @ApiProperty({ description: 'Lý do nghỉ' })
  reason: string;

  @ApiProperty({ description: 'Trạng thái đơn' })
  status: string;

  @ApiProperty({ description: 'Ngày tạo' })
  createdAt: Date;

  @ApiProperty({ description: 'Ngày duyệt', required: false })
  approvedAt?: Date;
}

export class TeacherCountDto {
  @ApiProperty({ description: 'Số lớp học' })
  classes: number;

  @ApiProperty({ description: 'Số hợp đồng' })
  contracts: number;

  @ApiProperty({ description: 'Số bảng lương' })
  payrolls: number;

  @ApiProperty({ description: 'Số tài liệu' })
  documents: number;

  @ApiProperty({ description: 'Số đơn nghỉ phép' })
  leaveRequests: number;
}

export class TeacherDetailDto {
  @ApiProperty({ description: 'ID của giáo viên' })
  id: string;

  @ApiProperty({ description: 'ID của user' })
  userId: string;

  @ApiProperty({ description: 'Ngày tuyển dụng', required: false })
  hireDate?: Date;

  @ApiProperty({ description: 'Ngày kết thúc hợp đồng', required: false })
  contractEnd?: Date;

  @ApiProperty({ description: 'Các môn dạy được' })
  subjects: string[];

  @ApiProperty({ description: 'Lương', required: false })
  salary?: any;

  @ApiProperty({ description: 'Ngày tạo' })
  createdAt: Date;

  @ApiProperty({ description: 'Ngày cập nhật' })
  updatedAt: Date;

  @ApiProperty({ description: 'Thông tin user' })
  user: UserInfoDto;

  @ApiProperty({ description: 'Danh sách lớp học' })
  classes: ClassInfoDto[];

  @ApiProperty({ description: 'Danh sách hợp đồng' })
  contracts: ContractInfoDto[];

  @ApiProperty({ description: 'Danh sách bảng lương' })
  payrolls: PayrollInfoDto[];

  @ApiProperty({ description: 'Danh sách tài liệu' })
  documents: DocumentInfoDto[];

  @ApiProperty({ description: 'Danh sách đơn nghỉ phép' })
  leaveRequests: LeaveRequestInfoDto[];

  @ApiProperty({ description: 'Thống kê số lượng' })
  _count: TeacherCountDto;
}

export class TeachersListResponseDto {
  @ApiProperty({ description: 'Trạng thái thành công' })
  success: boolean;

  @ApiProperty({ description: 'Dữ liệu danh sách giáo viên', type: [TeacherDetailDto] })
  data: TeacherDetailDto[];

  @ApiProperty({ description: 'Tổng số lượng' })
  total: number;

  @ApiProperty({ description: 'Thông báo' })
  message: string;
}

export class TeacherResponseDto {
  @ApiProperty({ description: 'Trạng thái thành công' })
  success: boolean;

  @ApiProperty({ description: 'Dữ liệu giáo viên', type: TeacherDetailDto })
  data: TeacherDetailDto;

  @ApiProperty({ description: 'Thông báo' })
  message: string;
}
