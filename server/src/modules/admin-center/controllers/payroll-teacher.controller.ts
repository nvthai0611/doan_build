import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PayRollTeacherService } from "../services/payroll-teacher.service";

@ApiTags('Admin - Payroll Teacher')
@Controller('payroll-teacher')
export class PayrollTeacherController {
  constructor(private readonly payRollTeacherService: PayRollTeacherService) { }

  @Get('teachers')
  async getListTeachers(
    @Query('teacherName') teacherName: string,
    @Query('email') email: string,
    @Query('status') status: string,
    @Query('month') month: string
  ) {
    return this.payRollTeacherService.getListTeachers(teacherName, email, status, month);
  }

  @Get('payrolls/:teacherId')
  async getPayrollDetails(
    @Param('teacherId') teacherId: string,
    @Query('year') year: string,
    @Query('classId') classId: string
  ) {
    return this.payRollTeacherService.getAllPayrollsByTeacherId(teacherId, year, classId);
  }

  // Chi tiết 1 payroll (kèm class qua payoutDetails -> session -> class)
  @Get('payroll/:payrollId/detail')
  async getPayrollById(@Param('payrollId') payrollId: string) {
    return this.payRollTeacherService.getPayrollById(payrollId);
  }

  // Danh sách buổi học theo classId (filter optional: month, teacherId)
  @Get('classes/:classId/sessions')
  async getClassSessionsByClass(
    @Param('classId') classId: string,
    @Query('month') month?: string,
    @Query('teacherId') teacherId?: string
  ) {
    return this.payRollTeacherService.getClassSessionsByClassId(classId, month, teacherId);
  }

  @Post('payroll/send-email')
  async sendPayrollEmail(@Body() body: { payrollIds: string[] }) {
    return this.payRollTeacherService.sendEmailNotificationPayrollTeacher(body.payrollIds);
  }

  @Get(':payrollId/back-pay-details')
  async getPayrollBackPayDetails(@Param('payrollId') payrollId: string) {
    return this.payRollTeacherService.getPayrollBackPayDetails(payrollId);
  }

  @Post('recalculate')
  async recalculate(@Body() body: { payrollIds: string[] }) {
    if (!body.payrollIds || !Array.isArray(body.payrollIds) || body.payrollIds.length === 0) {
      throw new BadRequestException('Vui lòng cung cấp danh sách payrollIds hợp lệ (mảng khác rỗng)');
    }
    return this.payRollTeacherService.dispatchRecalculation(body.payrollIds);
  }

  @Post('payment/create')
  async createPayrollPayment(@Body() body: {
    payrollIds: string[]
    totalAmount: number
    paymentMethod: string
    notes?: string
  }, @Req() req: any) {
    const userId = req.user?.userId;
    return this.payRollTeacherService.createPayrollPayment(body, userId);
  }

  @Post('adjustments/apply')
  async applyPayrollAdjustments(@Body() body: {
    adjustments: {
      payrollId: string
      items: {
        type: 'bonus' | 'deduction'
        amount: number
        reason: string
      }[]
    }[]
  }) {
    return this.payRollTeacherService.applyPayrollAdjustments(body)
  }

}