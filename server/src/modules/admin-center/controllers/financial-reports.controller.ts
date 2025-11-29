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
}
