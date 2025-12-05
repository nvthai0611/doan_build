import {
  Controller,
  Get,
  Req,
} from '@nestjs/common';
import { TeacherDashboardService } from '../services/dashboard.service';

interface AuthRequest extends Request {
  user: {
    teacherId: string;
    userId: string;
    role: string;
  };
}

@Controller('dashboard')
export class TeacherDashboardController {
  constructor(
    private readonly dashboardService: TeacherDashboardService,
  ) {}

  @Get('stats')
  async getStats(@Req() req: AuthRequest) {
    const teacherId = req.user?.teacherId;
    if (!teacherId) {
      throw new Error('Teacher ID not found');
    }

    const stats = await this.dashboardService.getStats(teacherId);
    return { data: stats };
  }

  @Get('today-sessions')
  async getTodaySessions(@Req() req: AuthRequest) {
    const teacherId = req.user?.teacherId;
    if (!teacherId) {
      throw new Error('Teacher ID not found');
    }

    const sessions = await this.dashboardService.getTodaySessions(teacherId);
    return { data: sessions };
  }
}
