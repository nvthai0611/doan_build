import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { Prisma, PrismaClient } from '@prisma/client'
import { PrismaService } from '../../../../src/db/prisma.service'

// Helper to format period label like "Tháng 10/2025"
function buildPeriodLabel(date: Date) {
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  return `Tháng ${month}/${year}`
}

// Helper to get first/last day of last month (running on 1st will generate for previous month)
function getLastMonthRange(base = new Date()) {
  const firstDayCurrentMonth = new Date(base.getFullYear(), base.getMonth(), 1)
  const periodEnd = new Date(firstDayCurrentMonth.getTime() - 1) // last day of previous month
  const periodStart = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), 1)
  return { periodStart, periodEnd }
}

@Injectable()
export class ProgressReportCronService {
  private readonly logger = new Logger(ProgressReportCronService.name)

  constructor(private readonly prisma: PrismaService) {}

  // Chạy 00:30 ngày 1 hàng tháng để tạo báo cáo tháng trước
  @Cron('0 30 0 1 * *')
  async generateMonthlyProgressReports() {
    return await this.generateReportsForPeriod()
  }

  // Public method để test manual hoặc gọi từ controller
  async generateReportsForPeriod(customStart?: Date, customEnd?: Date) {
    const { periodStart, periodEnd } = customStart && customEnd 
      ? { periodStart: customStart, periodEnd: customEnd }
      : getLastMonthRange()
    const periodLabel = buildPeriodLabel(periodStart)

    this.logger.log(`Generating progress reports for ${periodLabel} (${periodStart.toISOString()} - ${periodEnd.toISOString()})`)

    // 1) Lấy danh sách enrollment đang học (status = 'studying') VÀ lớp đang active
    const studyingEnrollments = await this.prisma.enrollment.findMany({
      where: { 
        status: 'studying',
        class: {
          status: 'active' // ✅ Chỉ lấy lớp đang hoạt động
        }
      },
      include: {
        class: {
          include: {
            subject: true,
            teacher: true,
          },
        },
        student: {
          include: {
            user: true,
          },
        },
      },
    })

    if (studyingEnrollments.length === 0) {
      this.logger.log('No active enrollments found for progress reports')
      return { message: 'No active enrollments found', created: 0 }
    }

    let createdCount = 0
    let skippedCount = 0
    const errors: any[] = []

    // 2) Tạo báo cáo cho từng enrollment (mỗi học sinh x mỗi lớp)
    for (const enrollment of studyingEnrollments) {
      try {
        const { studentId, classId, student, class: classData } = enrollment

        // Bỏ qua nếu lớp không có giáo viên được phân công
        if (!classData.teacherId) {
          this.logger.warn(`Class ${classId} (${classData.name}) has no teacherId assigned. Skipping.`)
          skippedCount++
          continue
        }

        // 3) Kiểm tra tồn tại báo cáo cho học sinh + lớp + kỳ này
        const exists = await this.prisma.progressReport.findFirst({
          where: {
            studentId,
            classId,
            periodLabel,
          },
        })
        if (exists) {
          skippedCount++
          continue
        }

        // 4) Tính điểm TB + chuyên cần cho lớp này
        const { averageScore, attendanceRate } = await this.computeStudentMetricsForClass(
          studentId,
          classId, 
          periodStart,
          periodEnd
        )

        // 5) Tính trend bằng cách so sánh với kỳ trước
        const trend = await this.computeTrend(studentId, classId, periodStart, averageScore)

        // 6) Tạo nhận xét tự động
        const autoComment = this.generateAutoComment(averageScore, attendanceRate)

        // 7) Tạo ProgressReport (status=PUBLISHED - tự động công bố)
        await this.prisma.progressReport.create({
          data: {
            studentId,
            classId, // lưu classId để filter theo lớp giáo viên
            teacherId: classData.teacherId,
            reportType: 'MONTHLY',
            periodLabel,
            periodStart,
            periodEnd,
            averageScore: averageScore ?? undefined,
            attendanceRate: attendanceRate ?? undefined,
            trend: trend ?? undefined, // ✅ Xu hướng điểm so với kỳ trước
            overallComment: autoComment,
            status: 'PUBLISHED', // Tự động công bố
            generatedAt: new Date(),
            publishedAt: new Date(),
          },
        })
        createdCount++
      } catch (error) {
        this.logger.error(`Failed to create report for enrollment ${enrollment.id}:`, error)
        errors.push({ 
          studentId: enrollment.studentId, 
          classId: enrollment.classId,
          error: error.message 
        })
      }
    }

    this.logger.log(`Created ${createdCount} draft progress reports for ${periodLabel} (skipped: ${skippedCount})`)

    // 6) Thông báo giáo viên duyệt (Placeholder)
    // TODO: Integrate Notification/Email queue to notify teachers that draft reports are ready to review.

    return {
      message: `Created ${createdCount} reports for ${periodLabel}`,
      periodLabel,
      created: createdCount,
      skipped: skippedCount,
      errors: errors.length > 0 ? errors : undefined,
    }
  }

  private async computeStudentMetrics(studentId: string, start: Date, end: Date): Promise<{
    averageScore: number | null
    attendanceRate: number | null
    items: Array<{ subject: string; score?: number | null; trend?: string | null; comment?: string | null; rank?: number | null }>
  }> {
    // Grades within period
    const grades = await this.prisma.studentAssessmentGrade.findMany({
      where: {
        studentId,
        assessment: {
          date: { gte: start, lte: end },
        },
      },
      include: {
        assessment: {
          include: {
            class: { include: { subject: true } },
          },
        },
      },
    })

    // Attendance within period
    const attendance = await this.prisma.studentSessionAttendance.findMany({
      where: {
        studentId,
        recordedAt: { gte: start, lte: end },
      },
      include: {
        session: true,
      },
    })

    // Compute averageScore (across all subjects)
    const numericScores = grades.map((g) => (g.score ? Number(g.score) : null)).filter((x): x is number => x !== null)
    const averageScore = numericScores.length ? Number((numericScores.reduce((a, b) => a + b, 0) / numericScores.length).toFixed(2)) : null

    // Compute per-subject items
    const subjectGroups = new Map<string, number[]>()
    for (const g of grades) {
      const subjectName = g.assessment.class.subject?.name ?? 'Khác'
      const val = g.score ? Number(g.score) : null
      if (val === null) continue
      if (!subjectGroups.has(subjectName)) subjectGroups.set(subjectName, [])
      subjectGroups.get(subjectName)!.push(val)
    }
    const items = Array.from(subjectGroups.entries()).map(([subject, arr]) => ({
      subject,
      score: Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)),
      trend: 'stable',
      comment: null,
      rank: null,
    }))

    this.logger.debug(`[computeStudentMetrics] AverageScore: ${averageScore}, Items: ${JSON.stringify(items)}`)

    // Attendance rate: present or late counts as attended
    const total = attendance.length
    const attended = attendance.filter((a) => a.status?.toLowerCase() === 'present' || a.status?.toLowerCase() === 'late').length
    const attendanceRate = total > 0 ? Number(((attended / total) * 100).toFixed(2)) : null

    return { averageScore, attendanceRate, items }
  }

  private async computeStudentMetricsForClass(
    studentId: string, 
    classId: string,
    start: Date, 
    end: Date
  ): Promise<{
    averageScore: number | null
    attendanceRate: number | null
  }> {
    // Grades within period for this class only
    const grades = await this.prisma.studentAssessmentGrade.findMany({
      where: {
        studentId,
        assessment: {
          classId,
          date: { gte: start, lte: end },
        },
      },
      include: {
        assessment: true,
      },
    })

    // Attendance within period for this class only
    const attendance = await this.prisma.studentSessionAttendance.findMany({
      where: {
        studentId,
        session: {
          classId,
          sessionDate: { gte: start, lte: end },
        },
      },
    })

    // Compute averageScore for this class
    const numericScores = grades.map((g) => (g.score ? Number(g.score) : null)).filter((x): x is number => x !== null)
    const averageScore = numericScores.length ? Number((numericScores.reduce((a, b) => a + b, 0) / numericScores.length).toFixed(2)) : null

    // Attendance rate: present or late counts as attended
    const total = attendance.length
    const attended = attendance.filter((a) => a.status?.toLowerCase() === 'present' || a.status?.toLowerCase() === 'late').length
    const attendanceRate = total > 0 ? Number(((attended / total) * 100).toFixed(2)) : null

    this.logger.debug(`Class ${classId} - Student ${studentId}: ${grades.length} grades, ${attendance.length} sessions, avg: ${averageScore}, attendance: ${attendanceRate}%`)

    return { averageScore, attendanceRate }
  }

  // Tính trend bằng cách so sánh với kỳ trước
  private async computeTrend(
    studentId: string,
    classId: string,
    currentPeriodStart: Date,
    currentScore: number | null
  ): Promise<string | null> {
    if (currentScore === null) return null

    // Tìm báo cáo kỳ trước (sắp xếp theo periodStart giảm dần, lấy report đầu tiên trước currentPeriodStart)
    const previousReport = await this.prisma.progressReport.findFirst({
      where: {
        studentId,
        classId,
        periodStart: { lt: currentPeriodStart },
      },
      orderBy: { periodStart: 'desc' },
      select: { averageScore: true },
    })

    if (!previousReport || previousReport.averageScore === null) {
      return 'stable' // Không có dữ liệu trước đó
    }

    const diff = currentScore - previousReport.averageScore
    const epsilon = 0.5 // Ngưỡng để xác định thay đổi có ý nghĩa

    if (diff > epsilon) return 'up'
    if (diff < -epsilon) return 'down'
    return 'stable'
  }

  // Tạo nhận xét tự động dựa trên điểm trung bình và chuyên cần
  private generateAutoComment(averageScore: number | null, attendanceRate: number | null): string {
    // Nếu thiếu dữ liệu
    if (averageScore === null && attendanceRate === null) {
      return 'Chưa có đủ dữ liệu để đánh giá kết quả học tập và chuyên cần của học sinh.'
    }

    if (averageScore === null) {
      return this.generateAttendanceOnlyComment(attendanceRate)
    }

    if (attendanceRate === null) {
      return this.generateScoreOnlyComment(averageScore)
    }

    // Có đầy đủ cả điểm và chuyên cần - tạo nhận xét tổng hợp
    return this.generateCombinedComment(averageScore, attendanceRate)
  }

  private generateScoreOnlyComment(score: number): string {
    if (score >= 9) {
      return 'Học sinh có kết quả học tập xuất sắc. Tiếp tục duy trì và phát huy.'
    } else if (score >= 8) {
      return 'Học sinh có kết quả học tập tốt. Hãy tiếp tục nỗ lực để đạt kết quả cao hơn.'
    } else if (score >= 6.5) {
      return 'Học sinh có kết quả học tập khá. Cần ôn tập và rèn luyện thêm để nâng cao kiến thức.'
    } else if (score >= 5) {
      return 'Học sinh có kết quả học tập trung bình. Cần chú ý lắng nghe bài giảng và làm bài tập đầy đủ.'
    } else {
      return 'Học sinh cần cố gắng nhiều hơn nữa trong học tập. Phụ huynh cần quan tâm và hỗ trợ con em.'
    }
  }

  private generateAttendanceOnlyComment(rate: number): string {
    if (rate >= 95) {
      return 'Học sinh có ý thức học tập rất tốt, đi học đầy đủ và đúng giờ.'
    } else if (rate >= 85) {
      return 'Học sinh có ý thức học tập tốt, thường xuyên đi học đầy đủ.'
    } else if (rate >= 75) {
      return 'Học sinh có ý thức học tập khá, tuy nhiên cần cải thiện tình trạng vắng mặt.'
    } else if (rate >= 60) {
      return 'Học sinh cần cải thiện ý thức đi học. Phụ huynh cần giám sát và nhắc nhở con em.'
    } else {
      return 'Học sinh vắng mặt quá nhiều, ảnh hưởng nghiêm trọng đến việc học. Phụ huynh cần có biện pháp can thiệp kịp thời.'
    }
  }

  private generateCombinedComment(score: number, attendance: number): string {
    // Xuất sắc cả học lực và chuyên cần
    if (score >= 9 && attendance >= 95) {
      return 'Học sinh có kết quả học tập xuất sắc với điểm số cao và chuyên cần rất tốt. Đây là tấm gương sáng cho các bạn học sinh khác. Hãy tiếp tục phát huy và duy trì thành tích này.'
    }
    
    if (score >= 8 && attendance >= 90) {
      return 'Học sinh thể hiện sự nỗ lực đáng khen ngợi với kết quả học tập tốt và ý thức học tập cao. Tiếp tục phát huy để đạt kết quả xuất sắc.'
    }

    // Học lực tốt nhưng chuyên cần yếu
    if (score >= 8 && attendance < 75) {
      return 'Học sinh có năng lực học tập tốt nhưng tình trạng vắng học còn nhiều. Nếu đi học đầy đủ hơn, em sẽ đạt kết quả cao hơn nữa.'
    }

    // Chuyên cần tốt nhưng học lực yếu
    if (score < 6.5 && attendance >= 85) {
      return 'Học sinh có ý thức học tập tốt, đi học đầy đủ nhưng kết quả học tập chưa cao. Cần tập trung lắng nghe bài giảng và ôn tập thêm ở nhà.'
    }

    // Cả hai đều trung bình - khá
    if (score >= 6.5 && score < 8 && attendance >= 75 && attendance < 90) {
      return 'Học sinh có kết quả học tập và ý thức học tập ở mức khá. Cần nỗ lực hơn nữa để nâng cao cả điểm số và chuyên cần.'
    }

    // Cả hai đều yếu
    if (score < 5 && attendance < 60) {
      return 'Học sinh có kết quả học tập và chuyên cần chưa đạt yêu cầu. Phụ huynh cần quan tâm, giám sát chặt chẽ và có biện pháp hỗ trợ con em kịp thời.'
    }

    // Một trong hai yếu
    if (score < 5 || attendance < 60) {
      if (score < 5) {
        return 'Học sinh cần cố gắng nhiều hơn trong học tập. Phụ huynh nên trao đổi với giáo viên để tìm phương pháp học phù hợp cho con.'
      } else {
        return 'Học sinh cần cải thiện ý thức đi học. Việc vắng mặt thường xuyên ảnh hưởng tiêu cực đến kết quả học tập.'
      }
    }

    // Trường hợp mặc định
    return `Học sinh có điểm trung bình ${score} và chuyên cần ${attendance}%. Cần tiếp tục nỗ lực để đạt kết quả tốt hơn.`
  }
}
