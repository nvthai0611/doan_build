import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/db/prisma.service'

@Injectable()
export class TeacherProgressReportService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async listReports(teacherId: string, params: { status?: string; periodLabel?: string } = {}) {
    const { status = 'DRAFT', periodLabel } = params
    const where: any = {
      teacherId,
      ...(status && status !== 'ALL' ? { status } : {}),
      ...(periodLabel ? { periodLabel } : {}),
    }
    return this.prisma.progressReport.findMany({
      where,
      include: {
        student: { include: { user: true } },
        class: { include: { subject: true } },
      },
      orderBy: [{ periodStart: 'desc' }, { createdAt: 'desc' }],
    })
  }

  async updateDraft(teacherId: string, reportId: string, data: { overallComment?: string }) {
    const report = await this.prisma.progressReport.findUnique({ where: { id: reportId } })
    if (!report) throw new NotFoundException('Report not found')
    if (report.teacherId !== teacherId) throw new ForbiddenException('Not allowed')
    if (report.status !== 'DRAFT') throw new ForbiddenException('Only drafts can be updated')
    return this.prisma.progressReport.update({
      where: { id: reportId },
      data: { overallComment: data.overallComment ?? undefined },
    })
  }

  async publish(teacherId: string, reportId: string, data: { overallComment?: string }) {
    const report = await this.prisma.progressReport.findUnique({ where: { id: reportId } })
    if (!report) throw new NotFoundException('Report not found')
    if (report.teacherId !== teacherId) throw new ForbiddenException('Not allowed')
    return this.prisma.progressReport.update({
      where: { id: reportId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        overallComment: data.overallComment ?? report.overallComment ?? undefined,
      },
    })
  }

  async bulkPublish(teacherId: string, reportIds: string[]) {
      // Giới hạn số lượng để tránh timeout
      if (reportIds.length > 200) {
        throw new ForbiddenException('Không thể duyệt quá 200 báo cáo cùng lúc. Vui lòng lọc và duyệt theo từng lớp.')
      }

    // Validate ownership
    const reports = await this.prisma.progressReport.findMany({
      where: { id: { in: reportIds } },
      select: { id: true, teacherId: true, status: true },
    })

    const unauthorized = reports.filter((r) => r.teacherId !== teacherId)
    if (unauthorized.length > 0) {
      throw new ForbiddenException('Not authorized for some reports')
    }

    const notFound = reportIds.filter((id) => !reports.find((r) => r.id === id))
    if (notFound.length > 0) {
      throw new NotFoundException(`Reports not found: ${notFound.join(', ')}`)
    }

      // Xử lý theo batch để tránh timeout với số lượng lớn
      const batchSize = 50
      const publishedAt = new Date()
      let totalPublished = 0

      for (let i = 0; i < reportIds.length; i += batchSize) {
        const batch = reportIds.slice(i, i + batchSize)
      
        const result = await this.prisma.progressReport.updateMany({
          where: {
            id: { in: batch },
            teacherId,
          },
          data: {
            status: 'PUBLISHED',
            publishedAt,
          },
        })

        totalPublished += result.count
      }

    return {
        published: totalPublished,
        message: `Successfully published ${totalPublished} reports`,
    }
  }
}
