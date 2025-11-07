import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PayRollTeacherService } from "../services/payroll-teacher.service";

@ApiTags('Admin - Payroll Teacher')
@Controller('payroll-teacher')
export class PayrollTeacherController {
    constructor(private readonly PayRollTeacherService: PayRollTeacherService){}

    @Get('teachers')
    async getListTeachers(
        @Query('teacherName') teacherName: string,
        @Query('email') email: string,
        @Query('status') status: string,
        @Query('month') month: string
    ){
        return this.PayRollTeacherService.getListTeachers(teacherName, email, status, month)
    }
}