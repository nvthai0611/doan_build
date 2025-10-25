import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from 'src/db/prisma.service'

interface CreateFeedbackDto {
	teacherId: string
	classId?: string
	rating: number
	comment?: string
	categories?: any
	isAnonymous?: boolean
}

@Injectable()
export class ChildTeacherFeedbackService {
	constructor(private readonly prisma: PrismaService) {}

	async getAvailableTeachersForChild(userId: string, childId: string) {
		const parent = await this.prisma.parent.findUnique({ where: { userId }, select: { id: true } })
		if (!parent) throw new HttpException('Không tìm thấy phụ huynh', HttpStatus.NOT_FOUND)

		const child = await this.prisma.student.findFirst({ where: { id: childId, parentId: parent.id }, select: { id: true } })
		if (!child) throw new HttpException('Không tìm thấy học sinh', HttpStatus.NOT_FOUND)

		const enrollments = await this.prisma.enrollment.findMany({
			where: { studentId: childId, status: 'studying', class: { status: 'active', teacherId: { not: null } } },
			include: { class: { include: { teacher: { include: { user: true } } } } },
		})

		// Group by teacher
		const byTeacher = new Map<string, any>()
		for (const e of enrollments) {
			const t = e.class.teacher
			if (!t) continue
			if (!byTeacher.has(t.id)) {
				byTeacher.set(t.id, {
					id: t.id,
					name: t.user?.fullName ?? '',
					avatar: t.user?.avatar ?? null,
					classes: [] as Array<{ id: string; name: string }>,
				})
			}
			byTeacher.get(t.id).classes.push({ id: e.classId, name: e.class.name })
		}

		return Array.from(byTeacher.values())
	}

	async getFeedbacksForChild(userId: string, childId: string) {
		const parent = await this.prisma.parent.findUnique({ where: { userId }, select: { id: true } })
		if (!parent) throw new HttpException('Không tìm thấy phụ huynh', HttpStatus.NOT_FOUND)

		const child = await this.prisma.student.findFirst({ where: { id: childId, parentId: parent.id }, select: { id: true } })
		if (!child) throw new HttpException('Không tìm thấy học sinh', HttpStatus.NOT_FOUND)

		const feedbacks = await this.prisma.teacherFeedback.findMany({
			where: { parentId: parent.id, studentId: childId },
			include: { teacher: { include: { user: true } }, class: true },
			orderBy: { createdAt: 'desc' },
			take: 100,
		})

		return feedbacks.map((f) => ({
			id: f.id,
			teacherId: f.teacherId,
			classId: f.classId || undefined,
			rating: f.rating,
			comment: f.comment || '',
			categories: (f.categories as any) || undefined,
			isAnonymous: f.isAnonymous,
			date: f.createdAt.toISOString().slice(0, 10),
			status: f.status,
			teacherName: f.teacher?.user?.fullName || '',
			className: f.class?.name || undefined,
		}))
	}

	async createFeedbackForChild(userId: string, childId: string, dto: CreateFeedbackDto) {
		const parent = await this.prisma.parent.findUnique({ where: { userId }, select: { id: true } })
		if (!parent) throw new HttpException('Không tìm thấy phụ huynh', HttpStatus.NOT_FOUND)

		const child = await this.prisma.student.findFirst({ where: { id: childId, parentId: parent.id }, select: { id: true } })
		if (!child) throw new HttpException('Không tìm thấy học sinh', HttpStatus.NOT_FOUND)

		if (!dto.teacherId || !dto.rating) {
			throw new HttpException('Thiếu teacherId hoặc rating', HttpStatus.BAD_REQUEST)
		}

		// Validate teacher/class belongs to child's active classes
		const valid = await this.prisma.enrollment.findFirst({
			where: {
				studentId: childId,
				status: 'studying',
				class: { status: 'active', teacherId: dto.teacherId, ...(dto.classId ? { id: dto.classId } : {}) },
			},
			include: { class: true },
		})

		if (!valid) {
			throw new HttpException('Giáo viên hoặc lớp không hợp lệ với học sinh này', HttpStatus.BAD_REQUEST)
		}

		const created = await this.prisma.teacherFeedback.create({
			data: {
				teacherId: dto.teacherId,
				parentId: parent.id,
				studentId: childId,
				classId: dto.classId ?? valid.classId,
				rating: Math.max(1, Math.min(5, Number(dto.rating))),
				comment: dto.comment || '',
				categories: dto.categories ? (dto.categories as any) : undefined,
				isAnonymous: !!dto.isAnonymous,
				status: 'pending',
			},
		})

		return { id: created.id }
	}
}

