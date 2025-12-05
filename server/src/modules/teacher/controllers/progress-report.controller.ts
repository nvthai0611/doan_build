import { Body, Controller, Get, Param, Patch, Query, Req } from '@nestjs/common'
import { TeacherProgressReportService } from '../services/progress-report.service'

@Controller('progress-reports')
export class TeacherProgressReportController {
  constructor(private service: TeacherProgressReportService) {}

  @Get()
  async list(@Req() req: any, @Query('status') status?: string, @Query('periodLabel') periodLabel?: string) {
    const teacherId = req.user?.teacherId
    const data = await this.service.listReports(teacherId, { status, periodLabel })
    return { data, message: 'OK' }
  }

  @Patch('bulk-publish')
  async bulkPublish(@Req() req: any, @Body() body: { reportIds: string[] }) {
    const teacherId = req.user?.teacherId
    const data = await this.service.bulkPublish(teacherId, body.reportIds)
    return { data, message: 'Queued for publishing' }
  }

  @Patch(':id')
  async updateDraft(@Req() req: any, @Param('id') id: string, @Body() body: { overallComment?: string }) {
    const teacherId = req.user?.teacherId
    const data = await this.service.updateDraft(teacherId, id, body)
    return { data, message: 'Updated' }
  }

  @Patch(':id/publish')
  async publish(@Req() req: any, @Param('id') id: string, @Body() body: { overallComment?: string }) {
    const teacherId = req.user?.teacherId
    const data = await this.service.publish(teacherId, id, body)
    return { data, message: 'Published' }
  }
}
