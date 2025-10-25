import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FinancialManagementService } from '../services/financial-management.service';

@ApiTags('Admin Center - Financial Management')
@Controller('financial-management')
export class FinancialManagementController {
  constructor(
    private readonly financialManagementService: FinancialManagementService
  ) {}

  /**
   * Lấy danh sách học phí theo buổi
   */
  @Get('session-fees')
  @ApiOperation({ summary: 'Lấy danh sách học phí theo buổi' })
  @ApiResponse({ status: 200, description: 'Danh sách học phí theo buổi' })
  async getSessionFeeStructures() {
    try {
      return await this.financialManagementService.getSessionFeeStructures();
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi lấy danh sách học phí theo buổi',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Lấy ma trận học phí theo buổi
   */
  @Get('session-fees/matrix')
  @ApiOperation({ summary: 'Lấy ma trận học phí theo buổi' })
  @ApiResponse({ status: 200, description: 'Ma trận học phí theo buổi' })
  async getSessionFeeMatrix() {
    try {
      return await this.financialManagementService.getSessionFeeMatrix();
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi lấy ma trận học phí theo buổi',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Lấy danh sách khối lớp
   */
  @Get('grades')
  @ApiOperation({ summary: 'Lấy danh sách khối lớp' })
  @ApiResponse({ status: 200, description: 'Danh sách khối lớp' })
  async getGrades() {
    try {
      return await this.financialManagementService.getGrades();
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi lấy danh sách khối lớp',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Lấy danh sách môn học
   */
  @Get('subjects')
  @ApiOperation({ summary: 'Lấy danh sách môn học' })
  @ApiResponse({ status: 200, description: 'Danh sách môn học' })
  async getSubjects() {
    try {
      return await this.financialManagementService.getSubjects();
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi lấy danh sách môn học',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Tạo hoặc cập nhật học phí theo buổi
   */
  @Post('session-fees')
  @ApiOperation({ summary: 'Tạo hoặc cập nhật học phí theo buổi' })
  @ApiResponse({ status: 200, description: 'Tạo hoặc cập nhật học phí thành công' })
  async upsertSessionFee(
    @Body() body: {
      gradeId: string;
      subjectId: string;
      amount: number;
    }
  ) {
    try {
      return await this.financialManagementService.upsertSessionFee(
        body.gradeId,
        body.subjectId,
        body.amount
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi lưu học phí theo buổi',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Cập nhật hàng loạt học phí theo buổi
   */
  @Put('session-fees/bulk')
  @ApiOperation({ summary: 'Cập nhật hàng loạt học phí theo buổi' })
  @ApiResponse({ status: 200, description: 'Cập nhật hàng loạt học phí thành công' })
  async bulkUpdateSessionFees(
    @Body() body: {
      updates: Array<{
        gradeId: string;
        subjectId: string;
        amount: number;
      }>;
    }
  ) {
    try {
      return await this.financialManagementService.bulkUpdateSessionFees(body.updates);
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi cập nhật hàng loạt học phí',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Xóa học phí theo buổi
   */
  @Delete('session-fees/:id')
  @ApiOperation({ summary: 'Xóa học phí theo buổi' })
  @ApiResponse({ status: 200, description: 'Xóa học phí thành công' })
  async deleteSessionFee(@Param('id') id: string) {
    try {
      return await this.financialManagementService.deleteSessionFee(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi xóa học phí theo buổi',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}