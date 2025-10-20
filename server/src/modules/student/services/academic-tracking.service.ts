import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';

type TranscriptFilters = { classId?: string; testType?: string; academicYear?: string; term?: string; subjectId?: string; dateStart?: string; dateEnd?: string };

@Injectable()
export class AcademicTrackingService {
  constructor(private readonly prisma: PrismaService) {}

  async getTranscript(studentId: string, { classId, testType, academicYear, term, subjectId, dateStart, dateEnd }: TranscriptFilters) {
    // Chỉ filter theo classId (và tùy chọn testType); academicYear/term/subject lấy từ class/enrollment để hiển thị
    const assessments = await this.prisma.$queryRawUnsafe<any[]>(
      `
      SELECT DISTINCT ON (a.id, sag.student_id)
             a.id as assessment_id, a.class_id, a.name, a.type, a.max_score, a.date,
             sag.score, sag.feedback, sag.graded_at,
             c.subject_id, s.name as subject_name,
             c.academic_year,
             e.semester
      FROM assessments a
      JOIN classes c ON c.id = a.class_id
      JOIN subjects s ON s.id = c.subject_id
      JOIN student_assessment_grades sag ON sag.assessment_id = a.id AND sag.student_id = $1::uuid
      JOIN enrollments e ON e.class_id = c.id AND e.student_id = sag.student_id
      WHERE ($2::uuid IS NULL OR a.class_id = $2::uuid)
        AND ($3::text IS NULL OR a.type = $3::text)
        AND ($4::date IS NULL OR a.date >= $4::date)
        AND ($5::date IS NULL OR a.date <= $5::date)
      ORDER BY a.id, sag.student_id, a.date ASC
      `,
      studentId || null,
      classId || null,
      testType || null,
      dateStart || null,
      dateEnd || null,
    );

    // Group by academicYear/term then by subject
    const groupKey = (x: any) => `${x.class_id || ''}`;
    const grouped = new Map<string, any[]>();
    for (const row of assessments) {
      const key = groupKey(row);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(row);
    }

    const entries: any[] = [];
    let cumulativeSum = 0;
    let cumulativeCount = 0;

    for (const [key, rows] of grouped.entries()) {
      // lấy academicYear/term từ hàng đầu tiên của lớp
      const academicYear = rows[0]?.academic_year || '';
      const term = rows[0]?.semester || undefined;
      const subjectsMap = new Map<string, { subjectId: string; subjectName: string; assessments: any[] }>();
      for (const r of rows) {
        const sid = r.subject_id;
        if (!subjectsMap.has(sid)) {
          subjectsMap.set(sid, { subjectId: sid, subjectName: r.subject_name, assessments: [] });
        }
        subjectsMap.get(sid)!.assessments.push({
          name: r.name,
          type: r.type,
          weight: undefined,
          score: r.score ? Number(r.score) : 0,
          maxScore: r.max_score ? Number(r.max_score) : undefined,
          date: r.date,
          comment: r.feedback || undefined,
        });
      }

      const subjects = Array.from(subjectsMap.values()).map((s) => {
        const avg = s.assessments.length
          ? s.assessments.reduce((acc, a) => acc + (a.score ?? 0), 0) / s.assessments.length
          : 0;
        cumulativeSum += avg;
        cumulativeCount += 1;
        return {
          subjectId: s.subjectId,
          subjectName: s.subjectName,
          assessments: s.assessments,
          average: Number(avg.toFixed(2)),
          status: avg >= 5 ? 'pass' : 'fail',
        };
      });

      const termGpa = subjects.length
        ? Number((subjects.reduce((acc, it) => acc + it.average, 0) / subjects.length).toFixed(2))
        : 0;

      entries.push({
        academicYear: academicYear || '',
        term: term || undefined,
        subjects,
        termResult: {
          academicYear: academicYear || '',
          term: term || undefined,
          gpa: termGpa,
          totalSubjects: subjects.length,
          passedSubjects: subjects.filter((x) => x.status === 'pass').length,
          failedSubjects: subjects.filter((x) => x.status === 'fail').length,
        },
      });
    }

    const cumulativeGpa = cumulativeCount ? Number((cumulativeSum / cumulativeCount).toFixed(2)) : 0;
    return {
      entries,
      overview: { cumulativeGpa },
    };
  }

  /**
   * Lấy thống kê tổng quan về điểm số của học sinh
   */
  async getOverview(studentId: string) {
    const stats = await this.prisma.$queryRawUnsafe<any[]>(
      `
      SELECT 
        COUNT(DISTINCT c.academic_year) as total_academic_years,
        COUNT(DISTINCT e.semester) as total_semesters,
        COUNT(DISTINCT c.subject_id) as total_subjects,
        COUNT(DISTINCT a.id) as total_assessments,
        AVG(sag.score::numeric) as average_score,
        MIN(sag.score::numeric) as min_score,
        MAX(sag.score::numeric) as max_score,
        COUNT(CASE WHEN sag.score::numeric >= 5 THEN 1 END) as passed_assessments,
        COUNT(CASE WHEN sag.score::numeric < 5 THEN 1 END) as failed_assessments
      FROM student_assessment_grades sag
      JOIN assessments a ON a.id = sag.assessment_id
      JOIN classes c ON c.id = a.class_id
      JOIN enrollments e ON e.class_id = c.id AND e.student_id = sag.student_id
      WHERE sag.student_id = $1::uuid AND sag.score IS NOT NULL
      `,
      studentId || null,
    );

    const result = stats[0] || {};
    const totalAssessments = Number(result.total_assessments) || 0;
    const passedAssessments = Number(result.passed_assessments) || 0;
    const failedAssessments = Number(result.failed_assessments) || 0;
    
    return {
      totalAcademicYears: Number(result.total_academic_years) || 0,
      totalSemesters: Number(result.total_semesters) || 0,
      totalSubjects: Number(result.total_subjects) || 0,
      totalAssessments,
      averageScore: result.average_score ? Number(Number(result.average_score).toFixed(2)) : 0,
      minScore: result.min_score ? Number(result.min_score) : 0,
      maxScore: result.max_score ? Number(result.max_score) : 0,
      passedAssessments,
      failedAssessments,
      passRate: totalAssessments > 0 ? Number(((passedAssessments / totalAssessments) * 100).toFixed(1)) : 0,
      cumulativeGpa: result.average_score ? Number(Number(result.average_score).toFixed(2)) : 0,
    };
  }
}
