import { Controller, Post, Body } from '@nestjs/common'
import { ProgressReportCronService } from '../service/progress-report-cron.service'

@Controller('cron-test')
export class CronTestController {
  constructor(private progressReportCron: ProgressReportCronService) {}

  // POST /cron-test/generate-progress-reports
  // Body (optional): { startDate?: "2025-10-01", endDate?: "2025-10-31" }
  @Post('generate-progress-reports')
  async triggerProgressReports(@Body() body?: { startDate?: string; endDate?: string }) {
    const customStart = body?.startDate ? new Date(body.startDate) : undefined
    const customEnd = body?.endDate ? new Date(body.endDate) : undefined
    
    const result = await this.progressReportCron.generateReportsForPeriod(customStart, customEnd)
    return result
  }
}
