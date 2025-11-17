import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '../../../db/prisma.service'
import { TeacherFeedbackService } from '../services/teacher-feedback.service'

@Injectable()
export class FeedbackAnalysisCronService {
  private readonly logger = new Logger(FeedbackAnalysisCronService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly teacherFeedbackService: TeacherFeedbackService,
  ) {}

  /**
   * Cron job chạy mỗi 7 ngày (mỗi Chủ nhật lúc 00:00) để phân tích feedback mới
   * Tìm các lớp có feedback mới (feedbacks có createdAt sau analyzedAt) và trigger phân tích
   * 
   * TODO: Đổi lại thành '0 0 * * 0' (mỗi Chủ nhật) sau khi test xong
   */
  @Cron(CronExpression.EVERY_MINUTE) // Mỗi 1 phút để test (sẽ đổi lại thành '0 0 * * 0' sau)
  async analyzeNewFeedbacks() {
    this.logger.log('🔄 Starting feedback analysis cron job...')

    try {
      // Lấy tất cả các lớp có feedback approved
      const classesWithFeedbacks = await this.prisma.teacherFeedback.groupBy({
        by: ['classId'],
        where: {
          status: 'approved',
          classId: { not: null },
        },
        _count: {
          id: true,
        },
      })

      this.logger.log(`Found ${classesWithFeedbacks.length} classes with feedbacks`)

      let analyzedCount = 0
      let skippedCount = 0
      let errorCount = 0

      for (const classGroup of classesWithFeedbacks) {
        if (!classGroup.classId) continue

        try {
          const classId = classGroup.classId

          // Lấy analysis hiện tại của lớp (nếu có)
          const existingAnalysis = await (this.prisma.teacherFeedbackAnalysis as any).findFirst({
            where: {
              classId,
              analysisType: 'class',
            },
            select: {
              analyzedAt: true,
            },
          })

          // Lấy feedback mới nhất của lớp
          const latestFeedback = await this.prisma.teacherFeedback.findFirst({
            where: {
              classId,
              status: 'approved',
            },
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              createdAt: true,
              id: true,
            },
          })

          if (!latestFeedback) {
            skippedCount++
            continue
          }

          // Kiểm tra xem có feedback mới không
          // Nếu chưa có analysis hoặc feedback mới nhất được tạo sau analyzedAt
          const hasNewFeedbacks =
            !existingAnalysis ||
            new Date(latestFeedback.createdAt) > new Date(existingAnalysis.analyzedAt)

          if (hasNewFeedbacks) {
            this.logger.log(
              `Analyzing class ${classId} - ${existingAnalysis ? 'has new feedbacks' : 'no analysis yet'}`,
            )

            // Trigger phân tích async
            await this.teacherFeedbackService.triggerClassAnalysisAsync(
              classId,
              latestFeedback.id,
            )

            analyzedCount++

            // Delay nhỏ để tránh quá tải
            await new Promise((resolve) => setTimeout(resolve, 1000))
          } else {
            skippedCount++
            this.logger.debug(`Skipping class ${classId} - no new feedbacks`)
          }
        } catch (error) {
          errorCount++
          this.logger.error(`Error analyzing class ${classGroup.classId}:`, error)
        }
      }

      this.logger.log(
        `✅ Feedback analysis cron job completed: ${analyzedCount} analyzed, ${skippedCount} skipped, ${errorCount} errors`,
      )
    } catch (error) {
      this.logger.error('❌ Error in feedback analysis cron job:', error)
    }
  }
}

