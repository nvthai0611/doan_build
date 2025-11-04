import { Controller, Get, Query } from '@nestjs/common'
import { TeacherFeedbackService } from '../services/teacher-feedback.service'

@Controller('teacher-feedback')
export class TeacherFeedbackController {
  constructor(private readonly service: TeacherFeedbackService) {}

  @Get()
  async list(@Query() query: any) {
    return this.service.findAll(query)
  }
}


