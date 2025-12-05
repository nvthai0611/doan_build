import { Body, Controller, Get, Param, Patch, Post, Put, Query, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger'
import { PayrollService } from '../services/payroll.service'

@ApiTags('Teacher - Payroll')
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  /**
   * GET /payroll?teacherId=xxx&month=2024-11&status=approved&page=1&limit=10
   * Lấy danh sách lương của giáo viên
   */
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách lương của giáo viên' })
  @ApiQuery({ name: 'teacherId', required: true, type: String })
  @ApiQuery({ name: 'month', required: false, type: String, description: 'Format: YYYY-MM' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTeacherPayrolls(
    @Req() req: any,
    @Query('month') month?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    const teacherId = req.user.teacherId
    return this.payrollService.getTeacherPayroll({
      teacherId,
      month,
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10
    })
  }

  /**
   * GET /payroll/:payrollId?classId=xxx&startDate=2024-11-01&endDate=2024-11-30&page=1&limit=10
   * Lấy chi tiết một payroll với filter sessions
   */
  @Get(':payrollId')
  @ApiOperation({ summary: 'Lấy chi tiết payroll' })
  @ApiParam({ name: 'payrollId', required: true, type: String })
  @ApiQuery({ name: 'classId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Format: YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Format: YYYY-MM-DD' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPayrollDetail(
    @Param('payrollId') payrollId: string,
    @Query('classId') classId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<any> {
    return this.payrollService.getPayrollDetail({
      payrollId,
      classId,
      startDate,
      endDate,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10
    })
  }
  @Patch(':payrollId/approve')
  async approvePayroll( @Req() req: any, @Param('payrollId') payrollId: string ) {
    const teacherId = req.user.teacherId
    return this.payrollService.approvePayroll(teacherId, payrollId)
  }

  @Post(':payrollId/reject')
  @ApiOperation({ summary: 'Từ chối bảng lương' })
  @ApiParam({ name: 'payrollId', required: true, type: String })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        rejectionReason: {
          type: 'string',
          description: 'Lý do từ chối (tối thiểu 10 ký tự)',
          example: 'Số buổi học không chính xác, cần kiểm tra lại'
        }
      },
      required: ['rejectionReason']
    }
  })
  async rejectPayroll(
    @Req() req: any,
    @Param('payrollId') payrollId: string,
    @Body('teacherRejectionReason') teacherRejectionReason: string
  ) {
    const teacherId = req.user.teacherId
    console.log(teacherRejectionReason);
    
    return this.payrollService.rejectPayroll(teacherId, payrollId, teacherRejectionReason)
  }

}
