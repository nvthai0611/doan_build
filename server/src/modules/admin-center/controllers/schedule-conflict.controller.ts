import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ScheduleConflictService } from '../services/schedule-conflict.service';

@Controller('schedule')
export class ScheduleConflictController {
  constructor(
    private readonly scheduleConflictService: ScheduleConflictService,
  ) {}

  /**
   * GET /admin-center/schedule/room-conflicts
   * Lấy danh sách các buổi học bị trùng phòng
   *
   * Query params:
   * - startDate: Ngày bắt đầu (YYYY-MM-DD)
   * - endDate: Ngày kết thúc (YYYY-MM-DD)
   * - roomId: Filter theo phòng
   */
  @Get('room-conflicts')
  async getRoomConflicts(@Query() query: any) {
    return this.scheduleConflictService.getRoomConflicts(query);
  }

  /**
   * GET /admin-center/schedule/teacher-available-slots/:teacherId
   * Lấy các time slots mà giáo viên đang rảnh
   *
   * Query params:
   * - startDate: Ngày bắt đầu (YYYY-MM-DD)
   * - endDate: Ngày kết thúc (YYYY-MM-DD)
   */
  @Get('teacher-available-slots/:teacherId')
  async getTeacherAvailableSlots(
    @Param('teacherId') teacherId: string,
    @Query() query: any,
  ) {
    return this.scheduleConflictService.getTeacherAvailableSlots(
      teacherId,
      query,
    );
  }

  /**
   * POST /admin-center/schedule/add-session
   * Thêm buổi học mới với auto-check conflicts
   *
   * Body:
   * - classId: ID lớp học (required)
   * - sessionDate: Ngày học (YYYY-MM-DD) (required)
   * - startTime: Giờ bắt đầu (HH:mm) (required)
   * - endTime: Giờ kết thúc (HH:mm) (required)
   * - teacherId: ID giáo viên (optional, mặc định lấy từ class)
   * - roomId: ID phòng (optional, mặc định lấy từ class)
   * - notes: Ghi chú (optional)
   */
  @Post('add-session')
  async addSession(@Body() body: any) {
    return this.scheduleConflictService.addSession(body);
  }
}
