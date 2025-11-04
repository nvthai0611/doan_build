import { Controller, Get, Query, Req } from '@nestjs/common';
import { AcademicTrackingService } from '../services/academic-tracking.service';

@Controller('academic-tracking')
export class AcademicTrackingController {}

@Controller('grades')
export class GradesController {
  constructor(private readonly academicTrackingService: AcademicTrackingService) {}
  /**
   * GET /student/grades/classes
   * Danh sách lớp mà học sinh đang/đã học
   */
  @Get('classes')
  async getClasses(@Req() req: any) {
    const studentId = req.user?.studentId;
    const rows = await this.academicTrackingService["prisma"].$queryRawUnsafe<any[]>(
      `
      SELECT DISTINCT c.id as class_id, c.name as class_name, c.academic_year, s.name as subject_name
      FROM enrollments e
      JOIN classes c ON c.id = e.class_id
      JOIN subjects s ON s.id = c.subject_id
      WHERE e.student_id = $1::uuid
      AND c.status = 'active'
      ORDER BY c.name ASC
      `,
      studentId || null,
    );
    const classes = rows.map(r => ({ id: r.class_id, name: r.class_name, academicYear: r.academic_year, subjectName: r.subject_name }));
    return { data: classes, message: 'Lấy danh sách lớp thành công' };
  }

  /**
   * GET /student/grades/terms?academicYear=...
   */
  @Get('terms')
  async getTerms(@Req() req: any, @Query('academicYear') academicYear?: string) {
    const studentId = req.user?.studentId;
    const rows = await this.academicTrackingService["prisma"].$queryRawUnsafe<any[]>(
      `
      SELECT DISTINCT e.semester as term
      FROM enrollments e
      JOIN classes c ON c.id = e.class_id
      WHERE e.student_id = $1::uuid
        AND ($2::text IS NULL OR c.academic_year = $2::text)
        AND e.semester IS NOT NULL
      ORDER BY term ASC
      `,
      studentId || null,
      academicYear || null,
    );
    const terms = rows.map(r => r.term).filter(Boolean);
    return { data: terms, message: 'Lấy danh sách học kỳ thành công' };
  }

  /**
   * GET /student/grades/transcript?academicYear=&term=
   */
  @Get('transcript')
  async getTranscript(
    @Req() req: any,
    @Query('classId') classId?: string,
    @Query('testType') testType?: string,
    @Query('academicYear') academicYear?: string,
    @Query('term') term?: string,
    @Query('subjectId') subjectId?: string,
  ) {
    const studentId = req.user?.studentId;

    // Normalize term formats: support 'Học kỳ 1/2' and 'YYYY-1/2'
    let normalizedSemester: string | undefined = term || undefined;
    if (term && /\d{4}-[12]/.test(term)) {
      const part = term.split('-')[1];
      normalizedSemester = part === '1' ? 'Học kỳ 1' : 'Học kỳ 2';
    }

    // Derive date range from academicYear and term if possible
    let dateStart: string | undefined;
    let dateEnd: string | undefined;
    if (academicYear && (normalizedSemester === 'Học kỳ 1' || normalizedSemester === 'Học kỳ 2')) {
      const [y1, y2] = academicYear.split('-').map((x) => parseInt(x, 10));
      if (normalizedSemester === 'Học kỳ 1') {
        // Jul 1 -> Dec 31 of first year
        dateStart = `${y1}-07-01`;
        dateEnd = `${y1}-12-31`;
      } else {
        // Jan 1 -> Jun 30 of second year
        dateStart = `${y2}-01-01`;
        dateEnd = `${y2}-06-30`;
      }
    }

    const data = await this.academicTrackingService.getTranscript(studentId, {
      classId,
      testType,
      academicYear,
      term: normalizedSemester,
      subjectId,
      dateStart,
      dateEnd,
    } as any);
    return { data, message: 'Lấy bảng điểm thành công' };
  }

  /**
   * GET /student/grades/subjects?academicYear=&term=
   * Trả danh sách môn học học sinh có trong năm/kỳ
   */
  @Get('subjects')
  async getSubjects(@Req() req: any, @Query('academicYear') academicYear?: string, @Query('term') term?: string) {
    const studentId = req.user?.studentId;
    const rows = await this.academicTrackingService["prisma"].$queryRawUnsafe<any[]>(
      `
      SELECT DISTINCT s.id as subject_id, s.name as subject_name
      FROM enrollments e
      JOIN classes c ON c.id = e.class_id
      JOIN subjects s ON s.id = c.subject_id
      WHERE e.student_id = $1::uuid
        AND ($2::text IS NULL OR c.academic_year = $2::text)
        AND ($3::text IS NULL OR e.semester = $3::text)
      ORDER BY s.name ASC
      `,
      studentId || null,
      academicYear || null,
      term || null,
    );
    const subjects = rows.map(r => ({ id: r.subject_id, name: r.subject_name }));
    return { data: subjects, message: 'Lấy danh sách môn học thành công' };
  }

  /**
   * GET /student/grades/test-types?classId=
   * Trả ra các loại kiểm tra có dữ liệu theo filter
   */
  @Get('test-types')
  async getTestTypes(
    @Req() req: any,
    @Query('classId') classId?: string,
  ) {
    const studentId = req.user?.studentId;
    const rows = await this.academicTrackingService["prisma"].$queryRawUnsafe<any[]>(
      `
      SELECT DISTINCT a.type
      FROM student_assessment_grades sag
      JOIN assessments a ON a.id = sag.assessment_id
      JOIN classes c ON c.id = a.class_id
      JOIN enrollments e ON e.class_id = c.id AND e.student_id = sag.student_id
      WHERE sag.student_id = $1::uuid
        AND ($2::uuid IS NULL OR c.id = $2::uuid)
      ORDER BY a.type ASC
      `,
      studentId || null,
      classId || null,
    );
    const types = rows.map(r => r.type).filter(Boolean);
    return { data: types, message: 'Lấy danh sách loại kiểm tra thành công' };
  }

  /**
   * GET /student/grades/overview
   * Trả thống kê tổng quan về điểm số của học sinh
   */
  @Get('overview')
  async getOverview(@Req() req: any) {
    const studentId = req.user?.studentId;
    const data = await this.academicTrackingService.getOverview(studentId);
    return { data, message: 'Lấy thống kê tổng quan thành công' };
  }
}
