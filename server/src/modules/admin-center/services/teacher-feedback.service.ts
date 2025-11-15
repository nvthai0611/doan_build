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

  async analyzeSingleFeedback(feedbackId: string) {
    try {
      const feedback = await this.prisma.teacherFeedback.findUnique({
        where: { id: feedbackId },
        include: {
          teacher: { include: { user: true } },
          parent: { include: { user: true } },
          student: { include: { user: true } },
          class: true,
        },
      })

      if (!feedback) {
        throw new HttpException(
          {
            success: false,
            message: 'Feedback not found',
          },
          HttpStatus.NOT_FOUND,
        )
      }

      // Format feedback data for AI analysis
      const categories = (feedback.categories as any) || {}
      const feedbackData = {
        rating: feedback.rating,
        comment: feedback.comment || '',
        categories: {
          teaching_quality: categories.teaching_quality || 0,
          communication: categories.communication || 0,
          punctuality: categories.punctuality || 0,
          professionalism: categories.professionalism || 0,
        },
        teacherName: feedback.teacher?.user?.fullName || 'Giáo viên',
        parentName: feedback.isAnonymous ? 'Ẩn danh' : feedback.parent?.user?.fullName || 'Phụ huynh',
        studentName: feedback.isAnonymous ? 'Ẩn danh' : feedback.student?.user?.fullName || '',
        className: feedback.class?.name || '',
      }

      // Gọi AI để phân tích
      const openaiApiKey = this.configService.get<string>('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')

      if (!openaiApiKey) {
        // Fallback: Phân tích cơ bản
        return {
          data: this.performBasicSingleAnalysis(feedbackData),
          message: 'Basic analysis completed',
        }
      }

      try {
        const aiAnalysis = await this.callOpenAIForSingleFeedback(feedbackData, openaiApiKey)
        return {
          data: aiAnalysis,
          message: 'AI analysis completed successfully',
        }
      } catch (aiError) {
        console.error('AI analysis failed, using basic analysis:', aiError)
        return {
          data: this.performBasicSingleAnalysis(feedbackData),
          message: 'Basic analysis completed (AI failed)',
        }
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        {
          success: false,
          message: 'Failed to analyze feedback',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  private async callOpenAIForSingleFeedback(feedbackData: any, apiKey: string) {
    const prompt = `Bạn là một chuyên gia phân tích feedback giáo viên. Hãy phân tích feedback sau đây và giải thích chi tiết tại sao phụ huynh lại đánh giá như vậy. Trả về kết quả dưới dạng JSON với format sau:

{
  "sentiment": "positive" | "negative" | "neutral",
  "sentiment_explanation": "Giải thích ngắn gọn về cảm xúc của phụ huynh (2-3 câu)",
  "rating_justification": "Giải thích tại sao phụ huynh cho ${feedbackData.rating}/5 sao (3-4 câu)",
  "comment_analysis": "Phân tích chi tiết nhận xét của phụ huynh, điểm mạnh và điểm yếu được đề cập (4-5 câu)",
  "category_insights": {
    "teaching_quality": "Nhận xét về chất lượng giảng dạy dựa trên điểm ${feedbackData.categories.teaching_quality}/5",
    "communication": "Nhận xét về giao tiếp dựa trên điểm ${feedbackData.categories.communication}/5",
    "punctuality": "Nhận xét về đúng giờ dựa trên điểm ${feedbackData.categories.punctuality}/5",
    "professionalism": "Nhận xét về chuyên nghiệp dựa trên điểm ${feedbackData.categories.professionalism}/5"
  },
  "key_points": ["Điểm quan trọng 1", "Điểm quan trọng 2", "Điểm quan trọng 3"],
  "overall_summary": "Tóm tắt tổng quan về feedback này (2-3 câu)"
}

Thông tin feedback:
- Giáo viên: ${feedbackData.teacherName}
- Lớp: ${feedbackData.className}
- Đánh giá tổng: ${feedbackData.rating}/5 sao
- Chất lượng giảng dạy: ${feedbackData.categories.teaching_quality}/5
- Giao tiếp: ${feedbackData.categories.communication}/5
- Đúng giờ: ${feedbackData.categories.punctuality}/5
- Chuyên nghiệp: ${feedbackData.categories.professionalism}/5
- Nhận xét: "${feedbackData.comment || 'Không có nhận xét'}"

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
            max_tokens: 1500,
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
        // Try to parse JSON directly
        analysis = JSON.parse(content)
      } catch (parseError) {
        // Sometimes AI returns markdown code blocks, try to extract JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('Failed to parse AI response')
        }
      }

      return {
        sentiment: analysis.sentiment || 'neutral',
        sentimentExplanation: analysis.sentiment_explanation || '',
        ratingJustification: analysis.rating_justification || '',
        commentAnalysis: analysis.comment_analysis || '',
        categoryInsights: analysis.category_insights || {},
        keyPoints: analysis.key_points || [],
        overallSummary: analysis.overall_summary || '',
      }
    } catch (error) {
      console.error('Error calling OpenAI:', error)
      throw error
    }
  }

  private performBasicSingleAnalysis(feedbackData: any) {
    const { rating, comment, categories } = feedbackData

    let sentiment = 'neutral'
    if (rating >= 4) sentiment = 'positive'
    else if (rating <= 2) sentiment = 'negative'

    const avgCategory =
      (categories.teaching_quality +
        categories.communication +
        categories.punctuality +
        categories.professionalism) /
      4

    const sentimentExplanation =
      sentiment === 'positive'
        ? 'Phụ huynh có cảm xúc tích cực và hài lòng với giáo viên.'
        : sentiment === 'negative'
          ? 'Phụ huynh có cảm xúc tiêu cực và không hài lòng với giáo viên.'
          : 'Phụ huynh có cảm xúc trung lập về giáo viên.'

    const ratingJustification = `Với đánh giá ${rating}/5 sao, phụ huynh ${
      rating >= 4
        ? 'rất hài lòng'
        : rating >= 3
          ? 'hài lòng ở mức trung bình'
          : 'chưa hài lòng'
    } với chất lượng giảng dạy. Điểm trung bình các danh mục là ${avgCategory.toFixed(1)}/5.`

    const commentAnalysis = comment
      ? `Nhận xét của phụ huynh cho thấy ${
          sentiment === 'positive' ? 'những điểm tích cực' : sentiment === 'negative' ? 'những vấn đề cần cải thiện' : 'quan điểm trung lập'
        }. ${comment.substring(0, 100)}${comment.length > 100 ? '...' : ''}`
      : 'Phụ huynh chưa để lại nhận xét chi tiết.'

    const categoryInsights = {
      teaching_quality: `Chất lượng giảng dạy được đánh giá ${categories.teaching_quality}/5 - ${
        categories.teaching_quality >= 4 ? 'tốt' : categories.teaching_quality >= 3 ? 'trung bình' : 'cần cải thiện'
      }`,
      communication: `Giao tiếp được đánh giá ${categories.communication}/5 - ${
        categories.communication >= 4 ? 'tốt' : categories.communication >= 3 ? 'trung bình' : 'cần cải thiện'
      }`,
      punctuality: `Đúng giờ được đánh giá ${categories.punctuality}/5 - ${
        categories.punctuality >= 4 ? 'tốt' : categories.punctuality >= 3 ? 'trung bình' : 'cần cải thiện'
      }`,
      professionalism: `Chuyên nghiệp được đánh giá ${categories.professionalism}/5 - ${
        categories.professionalism >= 4 ? 'tốt' : categories.professionalism >= 3 ? 'trung bình' : 'cần cải thiện'
      }`,
    }

    const keyPoints: string[] = []
    if (rating >= 4) keyPoints.push('Đánh giá tích cực từ phụ huynh')
    if (rating <= 2) keyPoints.push('Cần chú ý và cải thiện')
    if (categories.teaching_quality >= 4) keyPoints.push('Chất lượng giảng dạy được đánh giá cao')
    if (categories.communication < 3) keyPoints.push('Giao tiếp cần được cải thiện')
    if (comment && comment.length > 50) keyPoints.push('Có nhận xét chi tiết từ phụ huynh')

    const overallSummary = `Feedback này cho thấy ${
      sentiment === 'positive'
        ? 'sự hài lòng của phụ huynh'
        : sentiment === 'negative'
          ? 'những vấn đề cần được giải quyết'
          : 'quan điểm trung lập của phụ huynh'
    } với đánh giá tổng thể ${rating}/5 sao.`

    return {
      sentiment,
      sentimentExplanation,
      ratingJustification,
      commentAnalysis,
      categoryInsights,
      keyPoints,
      overallSummary,
    }
  }

  async analyzeTeacherFeedbacks(teacherId: string, query: any = {}) {
    try {
      const { dateFrom, dateTo } = query || {}

      // Lấy tất cả feedback của giáo viên
      const where: any = { teacherId }
      if (dateFrom || dateTo) {
        where.createdAt = {}
        if (dateFrom) where.createdAt.gte = new Date(dateFrom)
        if (dateTo) {
          const d = new Date(dateTo)
          d.setHours(23, 59, 59, 999)
          where.createdAt.lte = d
        }
      }

      const feedbacks = await this.prisma.teacherFeedback.findMany({
        where,
        include: {
          teacher: { include: { user: true } },
          parent: { include: { user: true } },
          student: { include: { user: true } },
          class: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      if (feedbacks.length === 0) {
        return {
          data: {
            teacherId,
            teacherName: 'Giáo viên',
            summary: 'Chưa có feedback nào để phân tích',
            sentiment: 'neutral',
            sentimentExplanation: '',
            overallAnalysis: '',
            strengths: [],
            weaknesses: [],
            recommendations: [],
            keyInsights: [],
          },
          message: 'No feedbacks to analyze',
        }
      }

      const teacherName = feedbacks[0]?.teacher?.user?.fullName || 'Giáo viên'

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
          className: f.class?.name || '',
          createdAt: f.createdAt.toISOString().slice(0, 10),
        }
      })

      // Gọi AI để phân tích tổng hợp
      const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY')

      if (!openaiApiKey) {
        // Fallback: Phân tích cơ bản
        return {
          data: this.performBasicTeacherAnalysis(teacherId, teacherName, feedbacksData),
          message: 'Basic analysis completed',
        }
      }

      try {
        const aiAnalysis = await this.callOpenAIForTeacherFeedbacks(teacherId, teacherName, feedbacksData, openaiApiKey)
        return {
          data: aiAnalysis,
          message: 'AI analysis completed successfully',
        }
      } catch (aiError) {
        console.error('AI analysis failed, using basic analysis:', aiError)
        return {
          data: this.performBasicTeacherAnalysis(teacherId, teacherName, feedbacksData),
          message: 'Basic analysis completed (AI failed)',
        }
      }
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to analyze teacher feedbacks',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  private async callOpenAIForTeacherFeedbacks(
    teacherId: string,
    teacherName: string,
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

    const prompt = `Bạn là một chuyên gia phân tích feedback giáo viên. Hãy phân tích TỔNG HỢP tất cả feedback sau đây cho giáo viên "${teacherName}" và trả về kết quả dưới dạng JSON với format sau:

{
  "sentiment": "positive" | "negative" | "neutral",
  "sentiment_explanation": "Giải thích tổng quan về cảm xúc của phụ huynh dựa trên tất cả feedback (3-4 câu)",
  "overall_analysis": "Phân tích tổng hợp tất cả feedback, điểm mạnh và điểm yếu chung được đề cập nhiều nhất (5-6 câu)",
  "strengths": ["Điểm mạnh 1 được nhiều phụ huynh nhắc đến", "Điểm mạnh 2", ...],
  "weaknesses": ["Điểm yếu 1 được nhiều phụ huynh nhắc đến", "Điểm yếu 2", ...],
  "recommendations": ["Khuyến nghị 1 dựa trên phân tích", "Khuyến nghị 2", ...],
  "key_insights": ["Insight quan trọng 1", "Insight quan trọng 2", "Insight quan trọng 3"]
}

Thông tin tổng hợp:
- Giáo viên: ${teacherName}
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

      return {
        teacherId,
        teacherName,
        summary: `Đã phân tích ${feedbacksData.length} feedback cho giáo viên ${teacherName}`,
        sentiment: analysis.sentiment || 'neutral',
        sentimentExplanation: analysis.sentiment_explanation || '',
        overallAnalysis: analysis.overall_analysis || '',
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        recommendations: analysis.recommendations || [],
        keyInsights: analysis.key_insights || [],
      }
    } catch (error) {
      console.error('Error calling OpenAI:', error)
      throw error
    }
  }

  private performBasicTeacherAnalysis(teacherId: string, teacherName: string, feedbacksData: any[]) {
    const totalFeedbacks = feedbacksData.length
    const avgRating = feedbacksData.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks
    const positiveCount = feedbacksData.filter((f) => f.rating >= 4).length
    const negativeCount = feedbacksData.filter((f) => f.rating <= 2).length

    let sentiment = 'neutral'
    if (avgRating >= 4) sentiment = 'positive'
    else if (avgRating <= 2.5) sentiment = 'negative'

    const sentimentExplanation =
      sentiment === 'positive'
        ? `Phụ huynh có cảm xúc tích cực với ${positiveCount}/${totalFeedbacks} feedback tích cực.`
        : sentiment === 'negative'
          ? `Có ${negativeCount}/${totalFeedbacks} feedback tiêu cực cần chú ý.`
          : 'Phụ huynh có cảm xúc trung lập về giáo viên.'

    const overallAnalysis = `Giáo viên ${teacherName} có ${totalFeedbacks} feedback với điểm trung bình ${avgRating.toFixed(1)}/5. ${
      positiveCount > negativeCount
        ? `Nhận được ${positiveCount} feedback tích cực, cho thấy phụ huynh hài lòng với chất lượng giảng dạy.`
        : negativeCount > 0
          ? `Có ${negativeCount} feedback tiêu cực, cần chú ý và cải thiện.`
          : 'Phần lớn feedback ở mức trung bình.'
    }`

    const strengths: string[] = []
    const weaknesses: string[] = []
    const recommendations: string[] = []
    const keyInsights: string[] = []

    if (avgRating >= 4) {
      strengths.push('Nhận được đánh giá tốt từ phụ huynh')
      keyInsights.push('Điểm đánh giá trung bình cao')
    }
    if (avgRating <= 3) {
      weaknesses.push('Điểm đánh giá trung bình thấp')
      recommendations.push('Nên có cuộc trao đổi với giáo viên để cải thiện chất lượng')
    }
    if (negativeCount > positiveCount) {
      weaknesses.push('Có nhiều feedback tiêu cực')
      recommendations.push('Cần phân tích nguyên nhân và đề xuất giải pháp cải thiện')
    }
    if (positiveCount > negativeCount) {
      strengths.push('Nhận được nhiều phản hồi tích cực')
    }

    return {
      teacherId,
      teacherName,
      summary: `Đã phân tích ${totalFeedbacks} feedback cho giáo viên ${teacherName}`,
      sentiment,
      sentimentExplanation,
      overallAnalysis,
      strengths,
      weaknesses,
      recommendations,
      keyInsights,
    }
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
  "key_insights": ["Insight quan trọng 1", "Insight quan trọng 2", "Insight quan trọng 3"]
}

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

    if (avgRating >= 4) {
      strengths.push('Nhận được đánh giá tốt từ phụ huynh')
      keyInsights.push('Điểm đánh giá trung bình cao')
    }
    if (avgRating <= 3) {
      weaknesses.push('Điểm đánh giá trung bình thấp')
      recommendations.push('Nên có cuộc trao đổi để cải thiện chất lượng')
    }
    if (negativeCount > positiveCount) {
      weaknesses.push('Có nhiều feedback tiêu cực')
      recommendations.push('Cần phân tích nguyên nhân và đề xuất giải pháp cải thiện')
    }
    if (positiveCount > negativeCount) {
      strengths.push('Nhận được nhiều phản hồi tích cực')
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
        message: 'Analysis retrieved successfully',
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


