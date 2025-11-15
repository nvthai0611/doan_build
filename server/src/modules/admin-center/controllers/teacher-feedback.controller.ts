import { Controller, Get, Query, Param, Post, Patch, Body } from '@nestjs/common'
import { TeacherFeedbackService } from '../services/teacher-feedback.service'

@Controller('teacher-feedback')
export class TeacherFeedbackController {
  constructor(private readonly service: TeacherFeedbackService) {}

  @Get()
  async list(@Query() query: any) {
    return this.service.findAll(query)
  }

  @Get('class/:classId/analysis')
  async getClassAnalysis(@Param('classId') classId: string) {
    return this.service.getClassAnalysisFromDB(classId)
  }

  @Post('class/:classId/analyze')
  async triggerClassAnalysis(@Param('classId') classId: string) {
    const analysis = await this.service.analyzeClassFeedbacks(classId)
    if (analysis) {
      await this.service.saveClassAnalysis(classId, analysis)
      return {
        data: analysis,
        message: 'Class analysis completed successfully',
      }
    }
    return {
      data: null,
      message: 'No feedbacks to analyze',
    }
  }
}


