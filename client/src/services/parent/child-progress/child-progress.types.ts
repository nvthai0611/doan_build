export interface ProgressReportDto {
	id: string
	studentId: string
	teacherId?: string | null
	classId?: string | null
	reportType: string
	periodLabel: string
	periodStart: string
	periodEnd: string
	averageScore?: number | null
	attendanceRate?: number | null
	grade?: string | null
	trend?: 'up' | 'stable' | 'down' | null // ✅ Xu hướng điểm
	overallComment?: string | null
	status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'DRAFT'
	generatedAt?: string | null
	publishedAt?: string | null
	createdAt?: string
	updatedAt?: string
	teacher?: { id: string; user?: { fullName?: string } } | null
	class?: { id: string; name?: string; subject?: { name?: string } } | null // ✅ Môn học và tên lớp từ class
}

