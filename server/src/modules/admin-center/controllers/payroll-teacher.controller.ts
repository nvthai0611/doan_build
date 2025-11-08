import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PayRollTeacherService } from "../services/payroll-teacher.service";

@ApiTags('Admin - Payroll Teacher')
@Controller('payroll-teacher')
export class PayrollTeacherController {
  constructor(private readonly PayRollTeacherService: PayRollTeacherService) {}

  @Get('teachers')
  async getListTeachers(
    @Query('teacherName') teacherName: string,
    @Query('email') email: string,
    @Query('status') status: string,
    @Query('month') month: string
  ) {
    return this.PayRollTeacherService.getListTeachers(teacherName, email, status, month);
  }

  @Get('payrolls/:teacherId')
  async getPayrollDetails(
    @Param('teacherId') teacherId: string,
    @Query('year') year: string, // Changed from month to year
    @Query('classId') classId: string
  ) {
    return this.PayRollTeacherService.getAllPayrollsByTeacherId(teacherId, year, classId); // Updated to pass year
  }

  // Chi tiết 1 payroll (kèm class qua payoutDetails -> session -> class)
  @Get('payroll/:payrollId/detail')
  async getPayrollById(@Param('payrollId') payrollId: string) {
    return this.PayRollTeacherService.getPayrollById(payrollId);
  }

  // Danh sách buổi học theo classId (filter optional: month, teacherId)
  @Get('classes/:classId/sessions')
  async getClassSessionsByClass(
    @Param('classId') classId: string,
    @Query('month') month?: string,
    @Query('teacherId') teacherId?: string
  ) {
    return this.PayRollTeacherService.getClassSessionsByClassId(classId, month, teacherId);
  }
}