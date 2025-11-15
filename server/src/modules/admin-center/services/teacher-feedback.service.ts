import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from '../../../db/prisma.service'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class TeacherFeedbackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

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
      classId: f.classId ?? '',
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

  async analyzeClassFeedbacks(classId: string) {
    try {
      const feedbacks = await this.prisma.teacherFeedback.findMany({
        where: {
          classId,
          status: 'approved', // Chỉ phân tích feedback đã được approve
        },
        include: {
          teacher: { include: { user: true } },
          parent: { include: { user: true } },
          student: { include: { user: true } },
          class: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      if (feedbacks.length === 0) {
        return null
      }

      const className = feedbacks[0]?.class?.name || 'Lớp học'

      // Tổng hợp tất cả feedback để gửi AI phân tích một lần
      const feedbacksData = feedbacks.map((f, idx) => {
        const categories = (f.categories as any) || {}
        return {
          index: idx + 1,
          rating: f.rating,
          comment: f.comment || '',
          categories: {
            teaching_quality: categories.teaching_quality || 0,
            communication: categories.communication || 0,
            punctuality: categories.punctuality || 0,
            professionalism: categories.professionalism || 0,
          },
          createdAt: f.createdAt.toISOString().slice(0, 10),
        }
      })

      const startTime = Date.now()

      // Gọi AI để phân tích tổng hợp
      const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY')

      let analysisResult
      if (!openaiApiKey) {
        analysisResult = this.performBasicClassAnalysis(classId, className, feedbacksData)
      } else {
        try {
          analysisResult = await this.callOpenAIForClassFeedbacks(classId, className, feedbacksData, openaiApiKey)
        } catch (aiError) {
          console.error('AI analysis failed, using basic analysis:', aiError)
          analysisResult = this.performBasicClassAnalysis(classId, className, feedbacksData)
        }
      }

      const processingTimeMs = Date.now() - startTime

      return {
        ...analysisResult,
        processingTimeMs,
      }
    } catch (error) {
      console.error('Error analyzing class feedbacks:', error)
      return null
    }
  }

  private async callOpenAIForClassFeedbacks(
    classId: string,
    className: string,
    feedbacksData: any[],
    apiKey: string,
  ) {
    // Tổng hợp tất cả comment và thông tin
    const allComments = feedbacksData
      .filter((f) => f.comment && f.comment.trim())
      .map((f) => f.comment)
      .join('\n\n---\n\n')

    const avgRating = feedbacksData.reduce((sum, f) => sum + f.rating, 0) / feedbacksData.length
    const avgCategories = {
      teaching_quality:
        feedbacksData.reduce((sum, f) => sum + f.categories.teaching_quality, 0) / feedbacksData.length,
      communication: feedbacksData.reduce((sum, f) => sum + f.categories.communication, 0) / feedbacksData.length,
      punctuality: feedbacksData.reduce((sum, f) => sum + f.categories.punctuality, 0) / feedbacksData.length,
      professionalism:
        feedbacksData.reduce((sum, f) => sum + f.categories.professionalism, 0) / feedbacksData.length,
    }

    const prompt = `Bạn là một chuyên gia phân tích feedback giáo viên. Hãy phân tích TỔNG HỢP tất cả feedback sau đây cho lớp học "${className}" và trả về kết quả dưới dạng JSON với format sau:

{
  "sentiment": "positive" | "negative" | "neutral",
  "sentiment_explanation": "Giải thích tổng quan về cảm xúc của phụ huynh dựa trên tất cả feedback (3-4 câu)",
  "overall_analysis": "Phân tích tổng hợp tất cả feedback, điểm mạnh và điểm yếu chung được đề cập nhiều nhất (5-6 câu)",
  "strengths": ["Điểm mạnh 1 được nhiều phụ huynh nhắc đến", "Điểm mạnh 2", ...],
  "weaknesses": ["Điểm yếu 1 được nhiều phụ huynh nhắc đến", "Điểm yếu 2", ...],
  "recommendations": ["Khuyến nghị 1 dựa trên phân tích", "Khuyến nghị 2", ...],
  "key_insights": [
    "Insight quan trọng 1",
    "Insight quan trọng 2", 
    "Insight quan trọng 3",
    "⚠️ PHÁT HIỆN ĐẶC BIỆT: [Nếu có] Phát hiện các tín hiệu như: phụ huynh muốn đổi giáo viên, yêu cầu can thiệp, phàn nàn nghiêm trọng, hoặc các vấn đề cần xử lý ngay"
  ]
}

QUAN TRỌNG: Trong key_insights, hãy đặc biệt chú ý và phát hiện các tín hiệu sau (nếu có):
- Phụ huynh muốn đổi giáo viên (từ khóa: "đổi giáo viên", "thay giáo viên", "không muốn học với", "muốn học với giáo viên khác", "yêu cầu đổi", "đề nghị thay")
- Yêu cầu can thiệp từ trung tâm (từ khóa: "can thiệp", "xử lý", "giải quyết", "quản lý", "lãnh đạo")
- Phàn nàn nghiêm trọng (từ khóa: "rất không hài lòng", "rất tệ", "không thể chấp nhận", "phản đối", "khiếu nại")
- Yêu cầu rút học sinh khỏi lớp (từ khóa: "rút học", "chuyển lớp", "nghỉ học", "không muốn học tiếp")
- Vấn đề về đạo đức hoặc hành vi giáo viên (từ khóa: "thô lỗ", "thiếu tôn trọng", "không chuyên nghiệp", "hành vi không phù hợp")

Nếu phát hiện bất kỳ tín hiệu nào ở trên, hãy thêm vào key_insights với format: "⚠️ PHÁT HIỆN: [Mô tả chi tiết tín hiệu và số lượng phụ huynh đề cập]"

Thông tin tổng hợp:
- Lớp: ${className}
- Tổng số feedback: ${feedbacksData.length}
- Đánh giá trung bình: ${avgRating.toFixed(1)}/5 sao
- Chất lượng giảng dạy TB: ${avgCategories.teaching_quality.toFixed(1)}/5
- Giao tiếp TB: ${avgCategories.communication.toFixed(1)}/5
- Đúng giờ TB: ${avgCategories.punctuality.toFixed(1)}/5
- Chuyên nghiệp TB: ${avgCategories.professionalism.toFixed(1)}/5

Tất cả nhận xét từ phụ huynh:
${allComments || 'Không có nhận xét chi tiết từ phụ huynh'}

Chỉ trả về JSON, không thêm text nào khác.`

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are a professional feedback analysis expert. Always respond with valid JSON only in Vietnamese.',
              },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 2000,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
          },
        ),
      )

      const content = response.data.choices[0]?.message?.content || '{}'
      let analysis
      try {
        analysis = JSON.parse(content)
      } catch (parseError) {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('Failed to parse AI response')
        }
      }

      const avgRating = feedbacksData.reduce((sum, f) => sum + f.rating, 0) / feedbacksData.length
      const sentimentScore = this.calculateSentimentScore(analysis.sentiment || 'neutral', avgRating)

      return {
        classId,
        className,
        sentiment: analysis.sentiment || 'neutral',
        sentimentScore,
        sentimentExplanation: analysis.sentiment_explanation || '',
        overallAnalysis: analysis.overall_analysis || '',
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        recommendations: analysis.recommendations || [],
        keyInsights: analysis.key_insights || [],
        feedbackCount: feedbacksData.length,
        avgRating,
        confidenceScore: 0.85, // Default confidence
      }
    } catch (error) {
      console.error('Error calling OpenAI:', error)
      throw error
    }
  }

  private performBasicClassAnalysis(classId: string, className: string, feedbacksData: any[]) {
    const totalFeedbacks = feedbacksData.length
    const avgRating = feedbacksData.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks
    const positiveCount = feedbacksData.filter((f) => f.rating >= 4).length
    const negativeCount = feedbacksData.filter((f) => f.rating <= 2).length

    let sentiment = 'neutral'
    if (avgRating >= 4) sentiment = 'positive'
    else if (avgRating <= 2.5) sentiment = 'negative'

    const sentimentScore = this.calculateSentimentScore(sentiment, avgRating)

    const sentimentExplanation =
      sentiment === 'positive'
        ? `Phụ huynh có cảm xúc tích cực với ${positiveCount}/${totalFeedbacks} feedback tích cực.`
        : sentiment === 'negative'
          ? `Có ${negativeCount}/${totalFeedbacks} feedback tiêu cực cần chú ý.`
          : 'Phụ huynh có cảm xúc trung lập về lớp học.'

    const overallAnalysis = `Lớp ${className} có ${totalFeedbacks} feedback với điểm trung bình ${avgRating.toFixed(1)}/5. ${
      positiveCount > negativeCount
        ? `Nhận được ${positiveCount} feedback tích cực, cho thấy phụ huynh hài lòng.`
        : negativeCount > 0
          ? `Có ${negativeCount} feedback tiêu cực, cần chú ý và cải thiện.`
          : 'Phần lớn feedback ở mức trung bình.'
    }`

    const strengths: string[] = []
    const weaknesses: string[] = []
    const recommendations: string[] = []
    const keyInsights: string[] = []

    // Phát hiện các tín hiệu đặc biệt từ comments
    const allComments = feedbacksData
      .map((f) => (f.comment || '').toLowerCase())
      .join(' ')

    // Keywords để phát hiện các tín hiệu
    const changeTeacherKeywords = [
      'đổi giáo viên',
      'thay giáo viên',
      'không muốn học với',
      'muốn học với giáo viên khác',
      'yêu cầu đổi',
      'đề nghị thay',
      'thay đổi giáo viên',
      'đổi thầy cô',
    ]
    const interventionKeywords = [
      'can thiệp',
      'xử lý',
      'giải quyết',
      'quản lý',
      'lãnh đạo',
      'ban giám hiệu',
      'trung tâm',
    ]
    const seriousComplaintKeywords = [
      'rất không hài lòng',
      'rất tệ',
      'không thể chấp nhận',
      'phản đối',
      'khiếu nại',
      'rất thất vọng',
      'hoàn toàn không hài lòng',
    ]
    const withdrawKeywords = [
      'rút học',
      'chuyển lớp',
      'nghỉ học',
      'không muốn học tiếp',
      'bỏ lớp',
      'rời lớp',
    ]
    const behaviorKeywords = [
      'thô lỗ',
      'thiếu tôn trọng',
      'không chuyên nghiệp',
      'hành vi không phù hợp',
      'thái độ không tốt',
      'ứng xử không đúng',
    ]

    // Đếm số feedback có các tín hiệu này
    let changeTeacherCount = 0
    let interventionCount = 0
    let seriousComplaintCount = 0
    let withdrawCount = 0
    let behaviorIssueCount = 0

    feedbacksData.forEach((f) => {
      const comment = (f.comment || '').toLowerCase()
      if (changeTeacherKeywords.some((kw) => comment.includes(kw))) changeTeacherCount++
      if (interventionKeywords.some((kw) => comment.includes(kw))) interventionCount++
      if (seriousComplaintKeywords.some((kw) => comment.includes(kw))) seriousComplaintCount++
      if (withdrawKeywords.some((kw) => comment.includes(kw))) withdrawCount++
      if (behaviorKeywords.some((kw) => comment.includes(kw))) behaviorIssueCount++
    })

    // Thêm vào keyInsights nếu phát hiện
    if (changeTeacherCount > 0) {
      keyInsights.push(
        `⚠️ PHÁT HIỆN: Có ${changeTeacherCount} feedback đề cập đến việc muốn đổi/thay giáo viên - CẦN XỬ LÝ NGAY`,
      )
      recommendations.push(
        'Cần trao đổi ngay với phụ huynh và giáo viên để tìm hiểu nguyên nhân và giải pháp',
      )
    }
    if (interventionCount > 0) {
      keyInsights.push(
        `⚠️ PHÁT HIỆN: Có ${interventionCount} feedback yêu cầu can thiệp từ trung tâm/quản lý`,
      )
      recommendations.push('Cần có sự can thiệp từ phía quản lý trung tâm')
    }
    if (seriousComplaintCount > 0) {
      keyInsights.push(
        `⚠️ PHÁT HIỆN: Có ${seriousComplaintCount} feedback phàn nàn nghiêm trọng - MỨC ĐỘ CAO`,
      )
      recommendations.push('Cần xử lý khẩn cấp các phàn nàn nghiêm trọng này')
    }
    if (withdrawCount > 0) {
      keyInsights.push(
        `⚠️ PHÁT HIỆN: Có ${withdrawCount} feedback đề cập đến việc rút học/chuyển lớp - RỦI RO MẤT HỌC SINH`,
      )
      recommendations.push('Cần liên hệ ngay với phụ huynh để ngăn chặn việc rút học')
    }
    if (behaviorIssueCount > 0) {
      keyInsights.push(
        `⚠️ PHÁT HIỆN: Có ${behaviorIssueCount} feedback phản ánh vấn đề về đạo đức/hành vi giáo viên - CẦN ĐIỀU TRA`,
      )
      recommendations.push('Cần điều tra và xử lý các vấn đề về đạo đức/hành vi của giáo viên')
    }

    // Strengths
    if (avgRating >= 4) {
      strengths.push('Nhận được đánh giá tốt từ phụ huynh')
      keyInsights.push('Điểm đánh giá trung bình cao')
    } else if (avgRating >= 3.5) {
      strengths.push('Điểm đánh giá ở mức khá tốt')
    }
    if (positiveCount > negativeCount) {
      strengths.push('Nhận được nhiều phản hồi tích cực hơn tiêu cực')
    }
    if (positiveCount > 0 && avgRating >= 3) {
      strengths.push(`Có ${positiveCount} feedback tích cực từ phụ huynh`)
    }

    // Weaknesses
    if (avgRating <= 2.5) {
      weaknesses.push('Điểm đánh giá trung bình thấp, cần cải thiện ngay')
      recommendations.push('Nên có cuộc trao đổi khẩn cấp với giáo viên để cải thiện chất lượng')
    } else if (avgRating <= 3) {
      weaknesses.push('Điểm đánh giá trung bình ở mức cần cải thiện')
      recommendations.push('Nên có cuộc trao đổi với giáo viên để cải thiện chất lượng')
    }
    if (negativeCount > positiveCount) {
      weaknesses.push(`Có ${negativeCount} feedback tiêu cực, nhiều hơn feedback tích cực`)
      recommendations.push('Cần phân tích nguyên nhân và đề xuất giải pháp cải thiện')
    } else if (negativeCount > 0) {
      weaknesses.push(`Có ${negativeCount} feedback tiêu cực cần được xử lý`)
    }

    // Recommendations (luôn có ít nhất 1)
    if (recommendations.length === 0) {
      if (avgRating >= 4) {
        recommendations.push('Tiếp tục duy trì chất lượng giảng dạy tốt')
      } else if (avgRating >= 3.5) {
        recommendations.push('Có thể cải thiện thêm để đạt mức đánh giá cao hơn')
      } else {
        recommendations.push('Nên có cuộc trao đổi với giáo viên để cải thiện chất lượng')
      }
    }

    // Key Insights (luôn có ít nhất 1)
    if (keyInsights.length === 0) {
      if (avgRating >= 3.5) {
        keyInsights.push(`Điểm đánh giá trung bình ${avgRating.toFixed(1)}/5 cho thấy chất lượng ổn định`)
      } else {
        keyInsights.push(`Điểm đánh giá trung bình ${avgRating.toFixed(1)}/5 cần được cải thiện`)
      }
      if (positiveCount === negativeCount && positiveCount > 0) {
        keyInsights.push(`Có sự phân cực trong đánh giá: ${positiveCount} tích cực và ${negativeCount} tiêu cực`)
      }
    }

    return {
      classId,
      className,
      sentiment,
      sentimentScore,
      sentimentExplanation,
      overallAnalysis,
      strengths,
      weaknesses,
      recommendations,
      keyInsights,
      feedbackCount: totalFeedbacks,
      avgRating,
      confidenceScore: 0.7, // Lower confidence for basic analysis
    }
  }

  private calculateSentimentScore(sentiment: string, avgRating: number): number {
    if (sentiment === 'positive') {
      return Math.min(5.0, avgRating * 0.2 + 3.5)
    } else if (sentiment === 'negative') {
      return Math.max(1.0, avgRating * 0.2 + 1.5)
    } else {
      return Math.max(2.0, Math.min(4.0, avgRating * 0.4 + 2.0))
    }
  }

  async saveClassAnalysis(classId: string, analysis: any) {
    try {
      // Tìm existing analysis
      const existing = await (this.prisma.teacherFeedbackAnalysis as any).findFirst({
        where: {
          classId,
          analysisType: 'class',
        },
      })

      const data = {
        classId,
        analysisType: 'class',
        sentimentScore: analysis.sentimentScore,
        sentimentLabel: analysis.sentiment,
        sentimentExplanation: analysis.sentimentExplanation,
        overallAnalysis: analysis.overallAnalysis,
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        recommendations: analysis.recommendations || [],
        keyInsights: analysis.keyInsights || [],
        feedbackCount: analysis.feedbackCount || 0,
        avgRating: analysis.avgRating || 0,
        confidenceScore: analysis.confidenceScore,
        processingTimeMs: analysis.processingTimeMs,
        aiModel: this.configService.get<string>('OPENAI_API_KEY') ? 'gpt-3.5-turbo' : 'basic',
        analyzedAt: new Date(),
      }

      if (existing) {
        // Update existing
        await (this.prisma.teacherFeedbackAnalysis as any).update({
          where: { id: existing.id },
          data,
        })
      } else {
        // Create new
        await (this.prisma.teacherFeedbackAnalysis as any).create({
          data,
        })
      }
    } catch (error) {
      console.error('Error saving class analysis:', error)
      throw error
    }
  }

  async triggerClassAnalysisAsync(classId: string, feedbackId: string) {
    // Chạy async, không block main thread
    setImmediate(async () => {
      try {
        // Delay 2 giây để tránh phân tích quá nhiều lần nếu có nhiều feedback liên tiếp
        await new Promise((resolve) => setTimeout(resolve, 2000))

        const analysis = await this.analyzeClassFeedbacks(classId)
        if (analysis) {
          await this.saveClassAnalysis(classId, analysis)
          console.log(`Class analysis completed for class ${classId}`)
        }
      } catch (error) {
        console.error(`Error in async class analysis for class ${classId}:`, error)
        // Không throw error để không ảnh hưởng đến việc tạo feedback
      }
    })
  }

  async getClassAnalysisFromDB(classId: string) {
    try {
      const analysis = await (this.prisma.teacherFeedbackAnalysis as any).findFirst({
        where: {
          classId,
          analysisType: 'class',
        },
        include: {
          class: true,
        },
      })

      if (!analysis) {
        return {
          data: null,
          message: 'No analysis found for this class',
        }
      }

      return {
        data: {
          classId: analysis.classId,
          className: analysis.class?.name || 'Lớp học',
          sentiment: analysis.sentimentLabel as 'positive' | 'negative' | 'neutral',
          sentimentExplanation: analysis.sentimentExplanation || '',
          overallAnalysis: analysis.overallAnalysis || '',
          strengths: (analysis.strengths as string[]) || [],
          weaknesses: (analysis.weaknesses as string[]) || [],
          recommendations: (analysis.recommendations as string[]) || [],
          keyInsights: (analysis.keyInsights as string[]) || [],
          feedbackCount: analysis.feedbackCount || 0,
          avgRating: typeof analysis.avgRating === 'object' && analysis.avgRating?.toNumber
            ? analysis.avgRating.toNumber()
            : Number(analysis.avgRating) || 0,
          analyzedAt: analysis.analyzedAt.toISOString(),
        },
        message: 'Lấy phân tích thành công',
      }
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get class analysis',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}


