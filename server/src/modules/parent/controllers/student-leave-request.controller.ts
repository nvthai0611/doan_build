import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { StudentLeaveRequestService } from '../services/student-leave-request.service';
import {
  CreateStudentLeaveRequestDto,
  UpdateStudentLeaveRequestDto,
  GetStudentLeaveRequestsQueryDto,
  GetSessionsByClassQueryDto,
} from '../dto/student-leave-request/student-leave-request.dto';

@ApiTags('Parent - Student Leave Requests')
@Controller('student-leave-requests')
@UseGuards(JwtAuthGuard)
export class StudentLeaveRequestController {
  constructor(
    private readonly studentLeaveRequestService: StudentLeaveRequestService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách đơn nghỉ học của học sinh' })
  @ApiQuery({ name: 'page', required: false, description: 'Trang hiện tại' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Số lượng mỗi trang',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Trạng thái (pending, approved, rejected, cancelled)',
  })
  @ApiQuery({ name: 'studentId', required: false, description: 'ID học sinh' })
  @ApiQuery({ name: 'classId', required: false, description: 'ID lớp học' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  async getStudentLeaveRequests(
    @Req() req: any,
    @Query() query: GetStudentLeaveRequestsQueryDto,
  ) {
    try {
      const parentUserId = req.user?.userId;
      if (!parentUserId) {
        throw new HttpException(
          { success: false, message: 'Không tìm thấy thông tin phụ huynh' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Convert query params to numbers
      const queryParams = {
        ...query,
        page: query.page ? Number(query.page) : 1,
        limit: query.limit ? Number(query.limit) : 10,
      };

      const result =
        await this.studentLeaveRequestService.getStudentLeaveRequests(
          parentUserId,
          queryParams,
        );

      return {
        success: true,
        data: result,
        message: 'Lấy danh sách đơn nghỉ học thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách đơn nghỉ học',
          error: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('sessions-by-class')
  @ApiOperation({ summary: 'Lấy danh sách buổi học của 1 lớp theo học sinh (để chọn xin nghỉ)' })
  @ApiQuery({ name: 'studentId', required: true, description: 'ID học sinh' })
  @ApiQuery({ name: 'classId', required: true, description: 'ID lớp học' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách buổi học thành công' })
  async getSessionsByClass(@Query() query: GetSessionsByClassQueryDto) {
    try {
      const result = await this.studentLeaveRequestService.getSessionsByClass(query);

      return {
        success: true,
        data: result,
        message: 'Lấy danh sách buổi học thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách buổi học',
          error: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết đơn nghỉ học' })
  @ApiResponse({ status: 200, description: 'Lấy chi tiết thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn nghỉ học' })
  async getStudentLeaveRequestById(@Req() req: any, @Param('id') id: string) {
    try {
      const parentUserId = req.user?.userId;
      if (!parentUserId) {
        throw new HttpException(
          { success: false, message: 'Không tìm thấy thông tin phụ huynh' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const result =
        await this.studentLeaveRequestService.getStudentLeaveRequestById(
          parentUserId,
          id,
        );

      return {
        success: true,
        data: result,
        message: 'Lấy chi tiết đơn nghỉ học thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy chi tiết đơn nghỉ học',
          error: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @ApiOperation({ summary: 'Tạo đơn nghỉ học mới' })
  @ApiResponse({ status: 201, description: 'Tạo đơn thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async createStudentLeaveRequest(
    @Req() req: any,
    @Body() dto: CreateStudentLeaveRequestDto,
  ) {
    try {
      const parentUserId = req.user?.userId;
      if (!parentUserId) {
        throw new HttpException(
          { success: false, message: 'Không tìm thấy thông tin phụ huynh' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const result =
        await this.studentLeaveRequestService.createStudentLeaveRequest(
          parentUserId,
          dto,
        );

      return {
        success: true,
        data: result,
        message: 'Tạo đơn nghỉ học thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi tạo đơn nghỉ học',
          error: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật đơn nghỉ học' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({
    status: 400,
    description: 'Chỉ có thể sửa đơn đang chờ duyệt',
  })
  async updateStudentLeaveRequest(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateStudentLeaveRequestDto,
  ) {
    try {
      const parentUserId = req.user?.userId;
      if (!parentUserId) {
        throw new HttpException(
          { success: false, message: 'Không tìm thấy thông tin phụ huynh' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const result =
        await this.studentLeaveRequestService.updateStudentLeaveRequest(
          parentUserId,
          id,
          dto,
        );

      return {
        success: true,
        data: result,
        message: 'Cập nhật đơn nghỉ học thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi cập nhật đơn nghỉ học',
          error: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hủy đơn nghỉ học' })
  @ApiResponse({ status: 200, description: 'Hủy đơn thành công' })
  @ApiResponse({
    status: 400,
    description: 'Chỉ có thể hủy đơn đang chờ duyệt',
  })
  async cancelStudentLeaveRequest(@Req() req: any, @Param('id') id: string) {
    try {
      const parentUserId = req.user?.userId;
      if (!parentUserId) {
        throw new HttpException(
          { success: false, message: 'Không tìm thấy thông tin phụ huynh' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      await this.studentLeaveRequestService.cancelStudentLeaveRequest(
        parentUserId,
        id,
      );

      return {
        success: true,
        message: 'Hủy đơn nghỉ học thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi hủy đơn nghỉ học',
          error: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

}

