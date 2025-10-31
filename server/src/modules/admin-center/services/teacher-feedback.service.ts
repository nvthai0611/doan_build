import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../db/prisma.service'

@Injectable()
export class TeacherFeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: any) {
    const {
      search,
      teacherId,
      classId,
      rating,
      isAnonymous,
      dateFrom,
      dateTo,
      status,
    } = query || {}

    const where: any = {}

    if (teacherId) where.teacherId = teacherId
    if (classId) where.classId = classId
    if (status) where.status = status
    if (typeof isAnonymous !== 'undefined') where.isAnonymous = String(isAnonymous) === 'true'
    if (rating) where.rating = Number(rating)
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) {
        const d = new Date(dateTo)
        d.setHours(23, 59, 59, 999)
        where.createdAt.lte = d
      }
    }

    // Simple search on related names (teacher, class, student, parent)
    const searchOr: any[] = []
    if (search) {
      const contains = String(search)
      searchOr.push(
        { teacher: { user: { fullName: { contains, mode: 'insensitive' } } } },
        { parent: { user: { fullName: { contains, mode: 'insensitive' } } } },
        { student: { user: { fullName: { contains, mode: 'insensitive' } } } },
        { class: { name: { contains, mode: 'insensitive' } } },
      )
    }

    const feedbacks = await this.prisma.teacherFeedback.findMany({
      where: searchOr.length ? { AND: [where], OR: searchOr } : where,
      orderBy: { createdAt: 'desc' },
      include: {
        teacher: { include: { user: true } },
        parent: { include: { user: true } },
        student: { include: { user: true } },
        class: true,
      },
    })

    const data = feedbacks.map((f) => ({
      id: f.id,
      teacherId: f.teacherId,
      teacherName: f.teacher?.user?.fullName ?? 'Giáo viên',
      teacherAvatar: f.teacher?.user?.avatar ?? undefined,
      parentName: f.parent?.user?.fullName ?? 'Phụ huynh',
      parentEmail: f.parent?.user?.email ?? '',
      studentName: f.student?.user?.fullName ?? '',
      className: f.class?.name ?? '',
      rating: f.rating,
      categories: (f.categories as any) || {},
      comment: f.comment || '',
      isAnonymous: f.isAnonymous,
      status: f.status as any,
      createdAt: f.createdAt.toISOString().slice(0, 10),
    }))

    return { data, message: 'Fetched feedbacks successfully' }
  }
}


