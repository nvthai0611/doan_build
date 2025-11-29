import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
// Import thư viện Google AI
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- INTERFACES CHO AI ---

// Kết quả từ OpenAI (Analyst)
export interface OpenAIAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;       // Thang 1.0 - 5.0
  is_conflicting: boolean;      // Cờ báo hiệu: Sao cao nhưng comment chê
  sentiment_explanation: string;
  overall_analysis: string;
  strengths: string[];          // Lưu mảng string cho đơn giản
  weaknesses: string[];
  recommendations: string[];
  key_insights: string[];
}

// Kết quả từ Gemini (Auditor)
export interface GeminiCheckResult {
  is_agreed: boolean;
  consensus_score: number;      // Độ đồng thuận (0-100)
  auditor_comment: string;
}

@Injectable()
export class TeacherFeedbackService {
  private readonly logger = new Logger(TeacherFeedbackService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // --- 1. GIỮ NGUYÊN CODE CŨ (FIND ALL) ---
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
    } = query || {};

    const where: Prisma.TeacherFeedbackWhereInput = {};

    if (teacherId) where.teacherId = teacherId;
    if (classId) where.classId = classId;
    if (status) where.status = status;
    if (typeof isAnonymous !== 'undefined') where.isAnonymous = String(isAnonymous) === 'true';
    if (rating) where.rating = Number(rating);
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const d = new Date(dateTo);
        d.setHours(23, 59, 59, 999);
        where.createdAt.lte = d;
      }
    }

    const searchOr: Prisma.TeacherFeedbackWhereInput[] = [];
    if (search) {
      const contains = String(search);
      searchOr.push(
        { teacher: { user: { fullName: { contains, mode: 'insensitive' } } } },
        { parent: { user: { fullName: { contains, mode: 'insensitive' } } } },
        { student: { user: { fullName: { contains, mode: 'insensitive' } } } },
        { class: { name: { contains, mode: 'insensitive' } } },
      );
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
    });

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
      status: f.status,
      createdAt: f.createdAt.toISOString().slice(0, 10),
    }));

    return { data, message: 'Fetched feedbacks successfully' };
  }

  // --- 2. LOGIC PHÂN TÍCH MỚI (NÂNG CẤP HYBRID AI) ---

  async analyzeClassFeedbacks(classId: string) {
    try {
      // B1: Lấy dữ liệu (Chỉ lấy feedback đã duyệt)
      const feedbacks = await this.prisma.teacherFeedback.findMany({
        where: { classId, status: 'approved' },
        include: { class: true },
        orderBy: { createdAt: 'desc' },
        take: 60, // Lấy mẫu 60 cái mới nhất
      });

      if (feedbacks.length === 0) return null;
      const className = feedbacks[0]?.class?.name || 'Lớp học';

      // B2: Làm sạch dữ liệu để gửi AI
      const feedbacksData = feedbacks.map((f, idx) => ({
        index: idx + 1,
        rating: f.rating,
        // Cắt bớt nếu quá dài, nhưng lấy đủ để hiểu ngữ cảnh
        comment: f.comment ? f.comment.trim().substring(0, 600) : '',
      }));

      // B3: PHASE 1 - GỌI OPENAI (ANALYST)
      // Sử dụng Prompt đã được train kỹ để bắt lỗi "5 sao nhưng chê"
      let analysisResult = await this.performDeepAnalysisOpenAI(className, feedbacksData);

      // Nếu OpenAI lỗi, dùng Fallback cơ bản
      if (!analysisResult) {
        analysisResult = this.performBasicFallback(feedbacksData);
      }

      // B4: PHASE 2 - GỌI GEMINI (AUDITOR) - KIỂM CHỨNG CHÉO
      const verification = await this.crossCheckWithGemini(feedbacksData, analysisResult);

      // B5: TỔNG HỢP & XỬ LÝ CONFLICT (QUAN TRỌNG)
      
      // Rule 1: Nếu OpenAI phát hiện conflict (Sao cao - Comment xấu) -> Ép điểm xuống thấp
      if (analysisResult.is_conflicting) {
        // Dù rating trung bình là 5.0, nhưng có comment "sai kiến thức", điểm phân tích chỉ max 2.5
        analysisResult.sentimentScore = Math.min(analysisResult.sentimentScore, 2.5);
        analysisResult.key_insights.unshift('CẢNH BÁO: Phát hiện đánh giá ảo (Rating cao nhưng nội dung chê trách nghiêm trọng).');
      }

      // Rule 2: Nếu Gemini không đồng tình -> Hạ độ tin cậy
      let confidenceScore = 0.95; // Mặc định rất tin
      
      if (verification) {
         if (verification.consensus_score < 60) {
            confidenceScore = 0.5; // Giảm một nửa độ tin cậy
            analysisResult.key_insights.push(`CẢNH BÁO AI: Kết quả bị nghi ngờ bởi Gemini (Độ đồng thuận thấp: ${verification.consensus_score}%). Lý do: ${verification.auditor_comment}`);
         } else {
            analysisResult.key_insights.push(`Đã kiểm chứng bởi Gemini (Độ đồng thuận: ${verification.consensus_score}%)`);
         }
      }

      // B6: Lưu vào Database
      await this.saveClassAnalysis(classId, analysisResult, confidenceScore, feedbacks.length);

      const processingTimeMs = 0; // Bạn có thể tính time nếu muốn

      return {
        ...analysisResult,
        confidenceScore,
        verification, // Trả về cho FE hiển thị
        processingTimeMs
      };

    } catch (error) {
      this.logger.error('Error analyzing class feedbacks:', error);
      return null;
    }
  }

  // --- 3. CÁC HÀM PRIVATE XỬ LÝ AI ---

  // HÀM GỌI OPENAI (Đã train Prompt kỹ)
  private async performDeepAnalysisOpenAI(className: string, data: any[]): Promise<OpenAIAnalysisResult | null> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) return null;

    // --- PROMPT ENGINEERING ---
    const systemPrompt = `
      Bạn là Chuyên gia Đảm bảo Chất lượng Giáo dục (QA Expert). Nhiệm vụ là "vạch lá tìm sâu".
      
      LUẬT BẤT KHẢ KHÁNG (BẮT BUỘC TUÂN THỦ):
      1. **CONTENT IS KING**: Nội dung comment quan trọng hơn số sao (rating).
      2. **PHÁT HIỆN CONFLICT**: Nếu Rating = 4 hoặc 5 sao NHƯNG Comment chứa từ khóa tiêu cực (vd: "kiến thức sai", "dạy sai", "lừa đảo", "chán", "buồn ngủ") -> Đánh dấu là **NEGATIVE** và **is_conflicting = true**.
      3. **TRỌNG SỐ LỖI**:
         - Lỗi "Kiến thức sai lệch" = CỰC KỲ NGHIÊM TRỌNG (Dù thái độ tốt vẫn là 0 điểm).
      4. OUTPUT: Chỉ trả về JSON hợp lệ.
    `;

    // Ví dụ mẫu (Few-Shot Learning) để AI khôn hơn
    const userPrompt = `
      Phân tích lớp: "${className}".
      DỮ LIỆU: ${JSON.stringify(data)}

      VÍ DỤ XỬ LÝ MẪU:
      - Input: { rating: 5, comment: "Cô giáo xinh, nhẹ nhàng nhưng dạy sai kiến thức cơ bản." }
      - Output Mong Muốn: Sentiment="negative", is_conflicting=true, explanation="Dạy sai kiến thức là lỗi nghiêm trọng dù thái độ tốt".

      YÊU CẦU JSON OUTPUT:
      {
        "sentiment": "positive" | "negative" | "neutral",
        "sentimentScore": number (1.0-5.0),
        "is_conflicting": boolean, 
        "sentiment_explanation": "string",
        "overall_analysis": "string",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "recommendations": ["string"],
        "key_insights": ["string"]
      }
    `;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o-mini', // Dùng model mới nhất, rẻ và khôn hơn 3.5
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.2, // Giảm sáng tạo để tăng logic
            response_format: { type: 'json_object' },
          },
          { headers: { Authorization: `Bearer ${apiKey}` } },
        ),
      );

      const content = response.data.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (e) {
      this.logger.error('OpenAI Analysis Error', e);
      return null;
    }
  }

  // HÀM GỌI GEMINI (Thanh tra viên) 
  private async crossCheckWithGemini(feedbacks: any[], openAIResult: OpenAIAnalysisResult): Promise<GeminiCheckResult | null> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) return null;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Tóm tắt dữ liệu input (Lấy các comment có chữ để check)
      const inputSummary = feedbacks
        .filter(f => f.comment.length > 3)
        .slice(0, 30)
        .map(f => `[${f.rating}*] "${f.comment}"`)
        .join('\n');

      const prompt = `
        Bạn là Thanh tra độc lập (AI Auditor).
        
        NHIỆM VỤ: Kiểm tra xem kết quả phân tích của Model A có đúng với dữ liệu thực tế không.
        
        DỮ LIỆU GỐC:
        ${inputSummary}

        KẾT QUẢ CỦA MODEL A:
        - Đánh giá: ${openAIResult.sentiment}
        - Có mâu thuẫn (Conflict) không: ${openAIResult.is_conflicting ? 'CÓ' : 'KHÔNG'}
        - Điểm yếu phát hiện: ${JSON.stringify(openAIResult.weaknesses)}

        HỎI:
        Model A có đánh giá đúng không? Đặc biệt nếu có feedback 5 sao nhưng nội dung chê bai (Ví dụ: sai kiến thức), Model A có phát hiện ra không?

        TRẢ VỀ JSON:
        {
          "is_agreed": boolean,
          "consensus_score": number, // 0-100
          "auditor_comment": "Nhận xét ngắn gọn của bạn"
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json|```/g, '').trim();
      return JSON.parse(text);

    } catch (error) {
      this.logger.warn('Gemini Check Failed', error);
      return null; 
    }
  }

  // HÀM FALLBACK CƠ BẢN (Khi AI chết)
  private performBasicFallback(data: any[]): OpenAIAnalysisResult {
    const avgRating = data.reduce((sum, f) => sum + f.rating, 0) / data.length || 0;
    
    // Check từ khóa nguy hiểm thủ công
    const dangerKeywords = ['sai kiến thức', 'kiến thức sai', 'lừa đảo', 'tệ', 'kém', 'xúc phạm'];
    const hasDanger = data.some(f => dangerKeywords.some(k => f.comment.toLowerCase().includes(k)));
    
    return {
      sentiment: hasDanger ? 'negative' : (avgRating >= 4 ? 'positive' : 'neutral'),
      sentimentScore: hasDanger ? 2.0 : avgRating,
      is_conflicting: hasDanger && avgRating >= 4,
      sentiment_explanation: 'Phân tích cơ bản (Fallback Mode) do lỗi kết nối AI.',
      overall_analysis: `Dựa trên ${data.length} đánh giá. Điểm trung bình: ${avgRating.toFixed(1)}`,
      strengths: [],
      weaknesses: hasDanger ? ['Phát hiện từ khóa tiêu cực nghiêm trọng trong comment'] : [],
      recommendations: ['Vui lòng kiểm tra thủ công.'],
      key_insights: ['⚠️ Đang chạy chế độ Basic (Không có AI)'],
    };
  }

  // --- 4. LƯU TRỮ VÀO DB (GIỮ LOGIC CŨ, CẬP NHẬT TYPE) ---

  async saveClassAnalysis(classId: string, analysis: OpenAIAnalysisResult, confidenceScore: number, feedbackCount: number) {
    try {
      // Map dữ liệu từ Analysis Result vào DB Schema
      const updateData: Prisma.TeacherFeedbackAnalysisUpdateInput = {
        sentimentScore: analysis.sentimentScore,
        sentimentLabel: analysis.sentiment,
        sentimentExplanation: analysis.sentiment_explanation,
        overallAnalysis: analysis.overall_analysis,
        strengths: analysis.strengths,     // Prisma tự xử lý Json array
        weaknesses: analysis.weaknesses,
        recommendations: analysis.recommendations,
        keyInsights: analysis.key_insights,
        feedbackCount: feedbackCount,
        avgRating: 0, // Bạn có thể tính lại nếu cần
        confidenceScore: confidenceScore,
        aiModel: 'gpt-4o-mini + gemini-flash', // Đánh dấu model sử dụng
        analyzedAt: new Date(),
      };

      const createData: Prisma.TeacherFeedbackAnalysisCreateInput = {
        ...updateData,
        class: { connect: { id: classId } },
        analysisType: 'class',
      } as Prisma.TeacherFeedbackAnalysisCreateInput;

      await this.prisma.teacherFeedbackAnalysis.upsert({
        where: { classId: classId },
        update: updateData,
        create: createData,
      });
      
    } catch (error) {
      console.error('Error saving class analysis:', error);
      throw error;
    }
  }

  // --- 5. CÁC HÀM HỖ TRỢ KHÁC (GIỮ NGUYÊN) ---

  async triggerClassAnalysisAsync(classId: string, feedbackId: string) {
    setImmediate(async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await this.analyzeClassFeedbacks(classId);
        this.logger.log(`Class analysis completed for class ${classId}`);
      } catch (error) {
        this.logger.error(`Error in async class analysis for class ${classId}:`, error);
      }
    });
  }

  async getClassAnalysisFromDB(classId: string) {
    try {
      const analysis = await this.prisma.teacherFeedbackAnalysis.findUnique({
        where: { classId },
        include: { class: true },
      });

      if (!analysis) {
        return { data: null, message: 'No analysis found for this class' };
      }

      return {
        data: {
          classId: analysis.classId,
          className: analysis.class?.name || 'Lớp học',
          sentiment: analysis.sentimentLabel,
          sentimentExplanation: analysis.sentimentExplanation || '',
          overallAnalysis: analysis.overallAnalysis || '',
          strengths: (analysis.strengths as any) || [],
          weaknesses: (analysis.weaknesses as any) || [],
          recommendations: (analysis.recommendations as any) || [],
          keyInsights: (analysis.keyInsights as any) || [],
          feedbackCount: analysis.feedbackCount || 0,
          avgRating: analysis.avgRating ? Number(analysis.avgRating) : 0,
          confidenceScore: analysis.confidenceScore ? Number(analysis.confidenceScore) : 0,
          analyzedAt: analysis.analyzedAt.toISOString(),
        },
        message: 'Lấy phân tích thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get class analysis',
          data: null,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}