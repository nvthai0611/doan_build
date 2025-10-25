import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { ChildTeacherFeedbackService } from '../services/child-teacher-feedback.service'

@Controller('teacher-feedback')
export class ChildTeacherFeedbackController {
	constructor(private readonly service: ChildTeacherFeedbackService) {}

	@Get('teachers')
	@UseGuards(JwtAuthGuard)
	async getTeachers(@Req() req: any, @Query('childId') childId?: string) {
		const parentUserId = req.user?.userId
		if (!parentUserId) throw new HttpException({ success: false, message: 'Không tìm thấy phụ huynh' }, HttpStatus.UNAUTHORIZED)
		if (!childId) throw new HttpException({ success: false, message: 'Thiếu tham số childId' }, HttpStatus.BAD_REQUEST)

		const data = await this.service.getAvailableTeachersForChild(parentUserId, String(childId))
		return { success: true, data, message: 'Lấy danh sách giáo viên thành công' }
	}

	@Get(':childId')
	@UseGuards(JwtAuthGuard)
	async getFeedbacks(@Req() req: any, @Param('childId') childId: string) {
		const parentUserId = req.user?.userId
		if (!parentUserId) throw new HttpException({ success: false, message: 'Không tìm thấy phụ huynh' }, HttpStatus.UNAUTHORIZED)
		const data = await this.service.getFeedbacksForChild(parentUserId, String(childId))
		return { success: true, data, message: 'Lấy lịch sử phản hồi thành công' }
	}

	@Post(':childId')
	@UseGuards(JwtAuthGuard)
	async createFeedback(@Req() req: any, @Param('childId') childId: string, @Body() body: any) {
		const parentUserId = req.user?.userId
		if (!parentUserId) throw new HttpException({ success: false, message: 'Không tìm thấy phụ huynh' }, HttpStatus.UNAUTHORIZED)
		const data = await this.service.createFeedbackForChild(parentUserId, String(childId), body)
		return { success: true, data, message: 'Gửi phản hồi thành công' }
	}
}

