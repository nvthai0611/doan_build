import { Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CommonService } from "../services/common.service";
import { StudentListResponseDto } from '../dto/common/student-list-response.dto';
import { StudentDetailResponseDto } from '../dto/common/student-detail-response.dto';
import { ClassStatisticsResponseDto } from '../dto/common/class-statistics-response.dto';
import { PrismaService } from '../../../db/prisma.service';

@ApiTags('Common - Quản lý chung')
@Controller('common')
export class CommonController {
  constructor(
    private readonly commonService: CommonService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Lấy danh sách học sinh trong lớp (endpoint mới cho frontend)
   * GET /common/class/:classId/students
   */
  @Get('class/:classId/students')
  @ApiOperation({
    summary: 'Lấy danh sách học sinh trong lớp (Frontend API)',
    description:
      'API endpoint cho frontend để lấy danh sách học sinh trong lớp',
  })
  @ApiParam({
    name: 'classId',
    description: 'ID lớp học',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách học sinh thành công',
    type: StudentListResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Lỗi request không hợp lệ',
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập',
  })
  async getStudentsByClass(@Param('classId') classId: string, @Req() req: any) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return {
          success: false,
          message: 'Không tìm thấy thông tin người dùng',
          data: null,
        };
      }

      // Lấy teacherId từ userId
      const teacher = await this.prisma.teacher.findFirst({
        where: { userId: userId },
        select: { id: true }
      });

      if (!teacher) {
        return {
          success: false,
          message: 'Không tìm thấy thông tin giáo viên',
          data: null,
        };
      }

      const result = await this.commonService.getListStudentOfClass(classId, teacher.id);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  /**
   * Lấy danh sách học sinh trong lớp
   * GET /common/students/:classId
   */
  @Get('students/:classId')
  @ApiOperation({
    summary: 'Lấy danh sách học sinh trong lớp',
    description:
      'Lấy danh sách tất cả học sinh đang học trong lớp thông qua class ID',
  })
  @ApiParam({
    name: 'classId',
    description: 'ID lớp học',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách học sinh thành công',
    type: StudentListResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Lỗi request không hợp lệ',
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập',
  })
  async getListStudentOfClass(@Param('classId') classId: string, @Req() req: any) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return {
          success: false,
          message: 'Không tìm thấy thông tin người dùng',
          data: null,
        };
      }

      // Lấy teacherId từ userId
      const teacher = await this.prisma.teacher.findFirst({
        where: { userId: userId },
        select: { id: true }
      });

      if (!teacher) {
        return {
          success: false,
          message: 'Không tìm thấy thông tin giáo viên',
          data: null,
        };
      }

      const result = await this.commonService.getListStudentOfClass(classId, teacher.id);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  /**
   * Lấy chi tiết thông tin học sinh trong lớp
   * GET /common/student/:studentId?classId=xxx
   */
  @Get('student/:studentId')
  @ApiOperation({
    summary: 'Lấy chi tiết thông tin học sinh',
    description:
      'Lấy thông tin chi tiết của một học sinh bao gồm lịch sử điểm danh, điểm số, thông tin phụ huynh',
  })
  @ApiParam({
    name: 'studentId',
    description: 'ID học sinh',
    example: 'uuid-string',
  })
  @ApiQuery({
    name: 'classId',
    description: 'ID lớp học (tùy chọn)',
    required: false,
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin chi tiết học sinh thành công',
    type: StudentDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy học sinh',
  })
  async getDetailStudentOfClass(
    @Param('studentId') studentId: string,
    @Req() req: any,
    @Query('classId') classId?: string,
  ) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return {
          success: false,
          message: 'Không tìm thấy thông tin người dùng',
          data: null,
        };
      }

      // Lấy teacherId từ userId
      const teacher = await this.prisma.teacher.findFirst({
        where: { userId: userId },
        select: { id: true }
      });

      if (!teacher) {
        return {
          success: false,
          message: 'Không tìm thấy thông tin giáo viên',
          data: null,
        };
      }

      const result = await this.commonService.getDetailStudentOfClass(
        studentId,
        classId,
        teacher.id,
      );
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  /**
   * Lấy thống kê tổng quan về lớp học
   * GET /common/statistics/:classId
   */
  @Get('statistics/:classId')
  @ApiOperation({
    summary: 'Lấy thống kê lớp học',
    description:
      'Lấy thống kê tổng quan về lớp học bao gồm số lượng học sinh, thống kê điểm danh, điểm số',
  })
  @ApiParam({
    name: 'classId',
    description: 'ID lớp học',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê lớp học thành công',
    type: ClassStatisticsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Lỗi request không hợp lệ',
  })
  async getClassStatistics(@Param('classId') classId: string, @Req() req: any) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return {
          success: false,
          message: 'Không tìm thấy thông tin người dùng',
          data: null,
        };
      }

      // Lấy teacherId từ userId
      const teacher = await this.prisma.teacher.findFirst({
        where: { userId: userId },
        select: { id: true }
      });

      if (!teacher) {
        return {
          success: false,
          message: 'Không tìm thấy thông tin giáo viên',
          data: null,
        };
      }

      const result = await this.commonService.getClassStatistics(classId, teacher.id);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  @Get('teacher-info')
  @ApiOperation({
    summary: 'Lấy thông tin giáo viên',
    description: 'Lấy thông tin giáo viên',
  })
  async getTeacherInfo(@Req() req: any) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return {
          success: false,
          message: 'Không tìm thấy thông tin người dùng',
          data: null,
        };
      }

      // Lấy teacherId từ userId
      const teacher = await this.prisma.teacher.findFirst({
        where: { userId: userId },
        select: { id: true }
      });

      if (!teacher) {
        return {
          success: false,
          message: 'Không tìm thấy thông tin giáo viên',
          data: null,
        };
      }

      const result = await this.commonService.getTeacherInfo(teacher.id);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  /**
   * Lấy danh sách buổi học theo class và năm học hiện tại
   * GET /common/class/:classId/sessions
   */
  @Get('class/:classId/sessions')
  @ApiOperation({
    summary: 'Lấy danh sách buổi học theo năm học hiện tại',
    description:
      'Trả về danh sách buổi học của lớp theo class ID và academicYear hiện tại',
  })
  @ApiParam({
    name: 'classId',
    description: 'ID lớp học',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách buổi học thành công',
  })
  async getClassSessionsByClass(@Param('classId') classId: string) {
    try {
      const result = await this.commonService.getClassSessionsByAssignment(classId);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }
}