import { Controller, Get, Param, Query, Req, ForbiddenException } from '@nestjs/common'
import { AcademicTrackingService } from '../services/academic-tracking.service'

// ParentModule is prefixed with 'parent' via RouterModule, so controller path should be only 'children'
@Controller('children')
export class ChildProgressController {
	constructor(private academicService: AcademicTrackingService) {}

	// GET /parent/children/:studentId/progress-reports?periodLabel=Tháng 10/2025
	@Get(':studentId/progress-reports')
	async list(@Req() req: any, @Param('studentId') studentId: string, @Query('periodLabel') periodLabel?: string) {
		const parentId = req.user?.parentId
		const isParentOf = await this.academicService.verifyParentOfStudent(parentId, studentId)
		if (!isParentOf) throw new ForbiddenException('Not allowed to view this student')
		const data = await this.academicService.listPublishedReports(studentId, { periodLabel })
		return { data, message: 'OK' }
	}
}

