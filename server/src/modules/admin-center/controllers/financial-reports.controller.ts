import { Controller, Get, Query } from '@nestjs/common'
import { FinancialReportsService } from '../services/financial-reports.service'

@Controller('financial-reports')
export class FinancialReportsController {
  constructor(private readonly financialReportsService: FinancialReportsService) {}

  @Get('summary')
  async getSummary(
    @Query('month') month?: string,
    @Query('year') year?: string
  ) {
    const data = await this.financialReportsService.getSummary(month, year)
    return { data, message: 'OK' }
  }

  @Get('outstanding-students')
  async getOutstandingStudents(
    @Query('month') month?: string,
    @Query('year') year?: string
  ) {
    const data = await this.financialReportsService.getOutstandingStudents(month, year)
    return { data, message: 'OK' }
  }

  @Get('overdue-students')
  async getOverdueStudents(
    @Query('month') month?: string,
    @Query('year') year?: string
  ) {
    const data = await this.financialReportsService.getOverdueStudents(month, year)
    return { data, message: 'OK' }
  }

  @Get('pending-students')
  async getPendingStudents(
    @Query('month') month?: string,
    @Query('year') year?: string
  ) {
    const data = await this.financialReportsService.getPendingStudents(month, year)
    return { data, message: 'OK' }
  }

  @Get('class-students-status')
  async getClassStudentsStatus(
    @Query('month') month?: string,
    @Query('year') year?: string
  ) {
    const data = await this.financialReportsService.getClassStudentsStatus(month, year)
    return { data, message: 'OK' }
  }
}
