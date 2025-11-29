import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/db/prisma.service'

@Injectable()
export class AcademicTrackingService {
	constructor(private prisma: PrismaService) {}

	async verifyParentOfStudent(parentId: string, studentId: string) {
		if (!parentId) return false
		const student = await this.prisma.student.findUnique({ where: { id: studentId }, select: { parentId: true } })
		return !!student && student.parentId === parentId
	}

	async listPublishedReports(studentId: string, params: { periodLabel?: string } = {}) {
		const { periodLabel } = params
		const data = await this.prisma.progressReport.findMany({
			where: {
				studentId,
				status: 'PUBLISHED',
				...(periodLabel ? { periodLabel } : {}),
			},
			include: { 
				teacher: { include: { user: true } },
				class: { include: { subject: true } },
			},
			orderBy: [{ periodStart: 'desc' }, { createdAt: 'desc' }],
		})
		return data
	}
}
