import { Controller, Get, Req } from '@nestjs/common';
import { ProfileService } from '../services/profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  /**
   * GET /student/profile
   * Trả về thông tin hồ sơ học sinh hiện tại dựa trên req.user
   * Response format: { data, message }
   */
  @Get()
  async getMyProfile(@Req() req: any) {
    const studentId = req.user?.studentId;
    const data = await this.profileService.getStudentProfileByStudentId(studentId);
    return { data, message: 'Lấy thông tin hồ sơ học sinh thành công' };
  }
}
