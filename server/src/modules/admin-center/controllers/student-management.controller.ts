import { query } from 'express';
import { StudentManagementService, StudentResponse } from '../services/student-management.service';
import { Controller, Get, Injectable, Query, Patch, Param, Body, HttpStatus, HttpException, Post, Put } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';

@Injectable()
@ApiTags('Admin Center -Student Management')
@Controller('student-management')
export class StudentManagementController {
    constructor(private readonly studentManagementService: StudentManagementService){}

    @ApiOperation({summary: "Lấy danh sách học sinh"})
    @ApiResponse({
        status: 200,
        description:"Danh sách học sinh"
    })
    @ApiResponse({
        status: 400,
        description: "Không tìm thấy danh sách học sinh"
    })
    @Get()
    async getAllStudents (@Query() query: any){
        
        return this.studentManagementService.getAllStudents(
            query.status,
             query.search,
             query.birthMonth,
             query.birthYear,
             query.gender,
             query.accountStatus,
             query.customerConnection,
             query.course,
             parseInt(query.page),
             parseInt(query.limit)
        );
    }

    @Get('count-status')
    async countByStatus(){
        return this.studentManagementService.getCountByStatus();
    }

    @ApiOperation({ summary: "Tạo mới tài khoản học sinh" })
    @ApiResponse({
        status: 201,
        description: "Tạo tài khoản học sinh thành công"
    })
    @ApiResponse({
        status: 400,
        description: "Dữ liệu không hợp lệ hoặc email đã tồn tại"
    })
    @ApiResponse({
        status: 500,
        description: "Lỗi server khi tạo tài khoản"
    })
    @ApiBody({
        description: 'Thông tin tạo tài khoản học sinh',
        schema: {
            type: 'object',
            required: ['fullName', 'username', 'schoolId'],
            properties: {
                fullName: {
                    type: 'string',
                    description: 'Họ và tên học sinh',
                    example: 'Nguyễn Văn A'
                },
                username: {
                    type: 'string',
                    description: 'Tên đăng nhập học sinh',
                    example: 'student001'
                },
                phone: {
                    type: 'string',
                    description: 'Số điện thoại (tùy chọn)',
                    example: '0123456789'
                },
                gender: {
                    type: 'string',
                    enum: ['MALE', 'FEMALE', 'OTHER'],
                    description: 'Giới tính',
                    example: 'MALE'
                },
                birthDate: {
                    type: 'string',
                    format: 'date',
                    description: 'Ngày sinh (định dạng YYYY-MM-DD)',
                    example: '2005-01-15'
                },
                address: {
                    type: 'string',
                    description: 'Địa chỉ (tùy chọn)',
                    example: '123 Đường ABC, Quận 1, TP.HCM'
                },
                grade: {
                    type: 'string',
                    description: 'Lớp học (tùy chọn)',
                    example: '10A1'
                },
                parentId: {
                    type: 'string',
                    description: 'ID phụ huynh (tùy chọn)',
                    example: 'uuid-parent-id'
                },
                schoolId: {
                    type: 'string',
                    description: 'ID trường học',
                    example: 'uuid-school-id'
                },
                password: {
                    type: 'string',
                    description: 'Mật khẩu (tùy chọn, mặc định là 123456)',
                    example: 'password123'
                }
            }
        }
    })
    @Post()
    async createStudent(@Body() createStudentDto: any) {
        try {
            // Validate required fields
            if (!createStudentDto.fullName) {
                throw new HttpException('Họ tên là bắt buộc', HttpStatus.BAD_REQUEST);
            }
            if (!createStudentDto.username) {
                throw new HttpException('Username là bắt buộc', HttpStatus.BAD_REQUEST);
            }
            if (!createStudentDto.schoolId) {
                throw new HttpException('School ID là bắt buộc', HttpStatus.BAD_REQUEST);
            }

            // Validate username format (alphanumeric and underscore only)
            const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
            if (!usernameRegex.test(createStudentDto.username)) {
                throw new HttpException('Username chỉ chứa chữ cái, số và dấu gạch dưới, từ 3-20 ký tự', HttpStatus.BAD_REQUEST);
            }

            return await this.studentManagementService.createStudent(createStudentDto);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            if (error.message.includes('Username đã được sử dụng')) {
                throw new HttpException('Username đã được sử dụng', HttpStatus.BAD_REQUEST);
            }
            if (error.message.includes('Trường học không tồn tại')) {
                throw new HttpException('Trường học không tồn tại', HttpStatus.BAD_REQUEST);
            }
            throw new HttpException(
                error.message || 'Lỗi server khi tạo tài khoản học sinh',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @ApiOperation({ summary: "Tìm kiếm phụ huynh theo email" })
    @ApiResponse({
        status: 200,
        description: "Tìm kiếm thành công (có thể không tìm thấy)"
    })
    @ApiResponse({
        status: 400,
        description: "Email không hợp lệ"
    })
    @ApiResponse({
        status: 500,
        description: "Lỗi server khi tìm kiếm"
    })
    @Get('search-parent')
    async findParentByEmail(@Query('email') email: string) {
        try {
            if (!email) {
                throw new HttpException('Email là bắt buộc', HttpStatus.BAD_REQUEST);
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new HttpException('Email không hợp lệ', HttpStatus.BAD_REQUEST);
            }

            return await this.studentManagementService.findParentByEmail(email);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                error.message || 'Lỗi server khi tìm kiếm phụ huynh',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @ApiOperation({ summary: "Thay đổi trạng thái tài khoản học sinh (toggle)" })
    @ApiResponse({
        status: 200,
        description: "Cập nhật trạng thái thành công"
    })
    @ApiResponse({
        status: 404,
        description: "Không tìm thấy học sinh"
    })
    @ApiResponse({
        status: 500,
        description: "Lỗi server khi cập nhật trạng thái"
    })
    @ApiParam({
        name: 'id',
        description: 'ID của học sinh cần cập nhật trạng thái',
        type: 'string'
    })
    @Patch(':id/toggle-status')
    async toggleStudentStatus(@Param('id') studentId: string) {
        try {
            if (!studentId) {
                throw new HttpException('Student ID is required', HttpStatus.BAD_REQUEST);
            }

            return await this.studentManagementService.toggleStudentStatus(studentId);
        } catch (error) {
            if (error.message === 'Student not found') {
                throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
            }
            throw new HttpException(
                error.message || 'Internal server error',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @ApiOperation({ summary: "Cập nhật trạng thái tài khoản học sinh (set specific status)" })
    @ApiResponse({
        status: 200,
        description: "Cập nhật trạng thái thành công"
    })
    @ApiResponse({
        status: 400,
        description: "Dữ liệu không hợp lệ"
    })
    @ApiResponse({
        status: 404,
        description: "Không tìm thấy học sinh"
    })
    @ApiResponse({
        status: 500,
        description: "Lỗi server khi cập nhật trạng thái"
    })
    @ApiParam({
        name: 'id',
        description: 'ID của học sinh cần cập nhật trạng thái',
        type: 'string'
    })
    @Patch(':id/status')
    async updateStudentStatus(
        @Param('id') studentId: string,
        @Body() updateStudentStatusDto: any
    ) {
        try {
            if (!studentId) {
                throw new HttpException('Student ID is required', HttpStatus.BAD_REQUEST);
            }

            if (typeof updateStudentStatusDto.isActive !== 'boolean') {
                throw new HttpException('isActive must be a boolean value', HttpStatus.BAD_REQUEST);
            }

            return await this.studentManagementService.updateStudentStatus(studentId, updateStudentStatusDto.isActive);
        } catch (error) {
            if (error.message === 'Student not found') {
                throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
            }
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                error.message || 'Internal server error',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @ApiOperation({ summary: "Cập nhật thông tin học sinh" })
    @ApiResponse({
        status: 200,
        description: "Cập nhật thông tin học sinh thành công"
    })
    @ApiResponse({
        status: 400,
        description: "Dữ liệu không hợp lệ"
    })
    @ApiResponse({
        status: 404,
        description: "Không tìm thấy học sinh"
    })
    @ApiParam({
        name: 'id',
        description: 'ID của học sinh cần cập nhật',
        type: 'string'
    })
    @ApiBody({
        description: 'Thông tin cập nhật học sinh',
        schema: {
            type: 'object',
            properties: {
                fullName: {
                    type: 'string',
                    description: 'Họ và tên học sinh',
                    example: 'Nguyễn Văn A'
                },
                phone: {
                    type: 'string',
                    description: 'Số điện thoại',
                    example: '0987654321'
                },
                gender: {
                    type: 'string',
                    enum: ['MALE', 'FEMALE', 'OTHER'],
                    description: 'Giới tính',
                    example: 'MALE'
                },
                birthDate: {
                    type: 'string',
                    format: 'date',
                    description: 'Ngày sinh (định dạng YYYY-MM-DD)',
                    example: '2010-01-15'
                },
                address: {
                    type: 'string',
                    description: 'Địa chỉ',
                    example: '123 Đường ABC, Quận 1, TP.HCM'
                },
                grade: {
                    type: 'string',
                    description: 'Lớp học',
                    example: '10A1'
                },
                schoolId: {
                    type: 'string',
                    description: 'ID trường học',
                    example: 'uuid-school-id'
                }
            }
        }
    })
    @Put(':id')
    async updateStudent(
      @Param('id') studentId: string,
      @Body() updateStudentDto: {
        fullName?: string;
        phone?: string;
        gender?: 'MALE' | 'FEMALE' | 'OTHER';
        birthDate?: string;
        address?: string;
        grade?: string;
        schoolId?: string;
      }
    ) {
      try {
        if (!studentId) {
          throw new HttpException('Student ID is required', HttpStatus.BAD_REQUEST);
        }

        // Validate fullName if provided
        if (updateStudentDto.fullName !== undefined && !updateStudentDto.fullName.trim()) {
          throw new HttpException('Họ tên không được để trống', HttpStatus.BAD_REQUEST);
        }

        // Validate phone format if provided
        if (updateStudentDto.phone && updateStudentDto.phone.trim()) {
          const phoneRegex = /^[0-9]{10,11}$/;
          if (!phoneRegex.test(updateStudentDto.phone.trim())) {
            throw new HttpException('Số điện thoại không hợp lệ (10-11 chữ số)', HttpStatus.BAD_REQUEST);
          }
        }

        return await this.studentManagementService.updateStudent(studentId, updateStudentDto);
      } catch (error) {
        if (error.message.includes('không tồn tại')) {
          throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
        if (error instanceof HttpException) {
          throw error;
        }
        throw new HttpException(
          error.message || 'Failed to update student',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }

    @ApiOperation({ summary: "Cập nhật liên kết phụ huynh cho học sinh" })
    @ApiResponse({
        status: 200,
        description: "Cập nhật liên kết phụ huynh thành công"
    })
    @ApiResponse({
        status: 400,
        description: "Dữ liệu không hợp lệ"
    })
    @ApiResponse({
        status: 404,
        description: "Không tìm thấy học sinh hoặc phụ huynh"
    })
    @ApiParam({
        name: 'id',
        description: 'ID của học sinh cần cập nhật',
        type: 'string'
    })
    @ApiBody({
        description: 'Thông tin liên kết phụ huynh',
        schema: {
            type: 'object',
            required: ['parentId'],
            properties: {
                parentId: {
                    type: 'string',
                    nullable: true,
                    description: 'ID phụ huynh (null để hủy liên kết)',
                    example: 'uuid-parent-id'
                }
            }
        }
    })
    @Put(':id/parent')
    async updateStudentParent(
      @Param('id') studentId: string,
      @Body() updateParentDto: {
        parentId: string | null;
      }
    ) {
      try {
        if (!studentId) {
          throw new HttpException('Student ID is required', HttpStatus.BAD_REQUEST);
        }
        if (updateParentDto.parentId === undefined) {
          throw new HttpException('parentId field is required', HttpStatus.BAD_REQUEST);
        }
        return await this.studentManagementService.updateStudentParent(
          studentId, 
          updateParentDto.parentId
        );
      } catch (error) {
        if (error.message.includes('không tồn tại')) {
          throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
        if (error instanceof HttpException) {
          throw error;
        }
        throw new HttpException(
          error.message || 'Failed to update student parent',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }

    @ApiOperation({ summary: 'Lấy attendance của học sinh theo lớp (để tính tiền)' })
    @ApiResponse({ status: 200, description: 'Thông tin điểm danh' })
    @ApiResponse({ status: 400, description: 'Invalid studentId or classId' })
    @ApiResponse({ status: 404, description: 'Lớp hoặc học viên không tồn tại' })
    @ApiParam({ name: 'studentId', description: 'ID học sinh', type: 'string' })
    @ApiParam({ name: 'classId', description: 'ID lớp', type: 'string' })
    @Get(':studentId/classes/:classId/attendance')
    async getAttendanceByStudentAndClass(
      @Param('studentId') studentId: string,
      @Param('classId') classId: string
    ): Promise<StudentResponse> {
      try {
        if (!studentId || !classId) {
          throw new HttpException('studentId and classId are required', HttpStatus.BAD_REQUEST);
        }
        return await this.studentManagementService.getAttendanceByStudentIdAndClassId(studentId, classId);
      } catch (error) {
        if (error instanceof HttpException) throw error;
        console.error('Error in controller getAttendanceByStudentAndClass:', error);
        throw new HttpException(error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
}