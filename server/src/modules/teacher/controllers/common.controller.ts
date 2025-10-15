import { Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CommonService } from "../services/common.service";
import { StudentListResponseDto } from '../dto/common/student-list-response.dto';
import { StudentDetailResponseDto } from '../dto/common/student-detail-response.dto';
import { ClassStatisticsResponseDto } from '../dto/common/class-statistics-response.dto';

@ApiTags('Common - Quản lý chung')
@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  /**
   * Lấy danh sách học sinh trong lớp (endpoint mới cho frontend)
   * GET /common/assignment/:assignmentId/students
   */
  @Get('assignment/:assignmentId/students')
  @ApiOperation({
    summary: 'Lấy danh sách học sinh trong lớp (Frontend API)',
    description:
      'API endpoint cho frontend để lấy danh sách học sinh trong lớp',
  })
  @ApiParam({
    name: 'assignmentId',
    description: 'ID phân công giáo viên - lớp học',
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
  async getStudentsByAssignment(@Param('assignmentId') assignmentId: string) {
    try {
      const result =
        await this.commonService.getListStudentOfClass(assignmentId);
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
   * GET /common/students/:assignmentId
   */
  @Get('students/:assignmentId')
  @ApiOperation({
    summary: 'Lấy danh sách học sinh trong lớp',
    description:
      'Lấy danh sách tất cả học sinh đang học trong lớp thông qua teacher class assignment ID',
  })
  @ApiParam({
    name: 'assignmentId',
    description: 'ID phân công giáo viên - lớp học',
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
  async getListStudentOfClass(@Param('assignmentId') assignmentId: string) {
    try {
      const result =
        await this.commonService.getListStudentOfClass(assignmentId);
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
   * GET /common/student/:studentId?assignmentId=xxx
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
    name: 'assignmentId',
    description: 'ID phân công giáo viên - lớp học (tùy chọn)',
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
    @Query('assignmentId') assignmentId?: string,
  ) {
    try {
      const result = await this.commonService.getDetailStudentOfClass(
        studentId,
        assignmentId,
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
   * GET /common/statistics/:assignmentId
   */
  @Get('statistics/:assignmentId')
  @ApiOperation({
    summary: 'Lấy thống kê lớp học',
    description:
      'Lấy thống kê tổng quan về lớp học bao gồm số lượng học sinh, thống kê điểm danh, điểm số',
  })
  @ApiParam({
    name: 'assignmentId',
    description: 'ID phân công giáo viên - lớp học',
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
  async getClassStatistics(@Param('assignmentId') assignmentId: string) {
    try {
      const result = await this.commonService.getClassStatistics(assignmentId);
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
      const result = await this.commonService.getTeacherInfo(
        req.user?.teacherId,
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
   * Lấy danh sách buổi học theo assignment và năm học hiện tại
   * GET /common/assignment/:assignmentId/sessions
   */
  @Get('assignment/:assignmentId/sessions')
  @ApiOperation({
    summary: 'Lấy danh sách buổi học theo năm học hiện tại',
    description:
      'Trả về danh sách buổi học của lớp theo assignment và academicYear hiện tại',
  })
  @ApiParam({
    name: 'assignmentId',
    description: 'ID phân công giáo viên - lớp học',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách buổi học thành công',
  })
  async getClassSessionsByAssignment(@Param('assignmentId') assignmentId: string) {
    try {
      const result = await this.commonService.getClassSessionsByAssignment(assignmentId);
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