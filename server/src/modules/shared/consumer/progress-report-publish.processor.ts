import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'
import { PrismaService } from 'src/db/prisma.service'

interface ProgressReportPublishData {
  reportId: string
  teacherId: string
}

@Processor('progress_report_publish')
export class ProgressReportPublishProcessor {
  constructor(private prisma: PrismaService) {}

  @Process('publish_single_report')
  async handlePublishReport(job: Job<ProgressReportPublishData>) {
    const { reportId, teacherId } = job.data

    console.log(`[Job ${job.id}] Publishing progress report ${reportId}`)

    try {
      const report = await this.prisma.progressReport.findUnique({
        where: { id: reportId },
      })

      if (!report) {
        console.error(`Report ${reportId} not found`)
        return { success: false, error: 'Report not found' }
      }

      if (report.teacherId !== teacherId) {
        console.error(`Teacher ${teacherId} not authorized for report ${reportId}`)
        return { success: false, error: 'Not authorized' }
      }

      await this.prisma.progressReport.update({
        where: { id: reportId },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
      })

      console.log(`[Job ${job.id}] Successfully published report ${reportId}`)
      return { success: true, reportId }
    } catch (error) {
      console.error(`[Job ${job.id}] Error publishing report ${reportId}:`, error)
      throw error
    }
  }
}
