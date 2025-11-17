import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/db/prisma.service'

@Injectable()
export class TeacherProgressReportService {
  constructor(private prisma: PrismaService) {}

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
}
