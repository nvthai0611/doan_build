import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';

type TranscriptFilters = { classId?: string; testType?: string; academicYear?: string; term?: string; subjectId?: string; dateStart?: string; dateEnd?: string };

@Injectable()
export class AcademicTrackingService {
  constructor(private readonly prisma: PrismaService) {}

  async getTranscript(studentId: string, { classId, testType, academicYear, term, subjectId, dateStart, dateEnd }: TranscriptFilters) {
    // Fetch assessments joined with student grades for this student
    const whereAssess: any = {};
    if (classId) whereAssess.class_id = classId;
    if (testType) whereAssess.type = testType;

    const assessments = await this.prisma.$queryRawUnsafe<any[]>(
      `
      SELECT DISTINCT ON (a.id, sag.student_id)
             a.id as assessment_id, a.class_id, a.name, a.type, a.max_score, a.date,
             sag.score, sag.feedback, sag.graded_at,
             c.subject_id, s.name as subject_name,
             COALESCE(tca_best.academic_year,
               CASE
                 WHEN EXTRACT(MONTH FROM a.date) >= 7 THEN CONCAT(EXTRACT(YEAR FROM a.date)::int, '-', (EXTRACT(YEAR FROM a.date)::int + 1))
                 ELSE CONCAT((EXTRACT(YEAR FROM a.date)::int - 1), '-', EXTRACT(YEAR FROM a.date)::int)
               END
             ) as academic_year,
             COALESCE(tca_best.semester,
               CASE WHEN EXTRACT(MONTH FROM a.date) BETWEEN 7 AND 12 THEN 'Học kỳ 1' ELSE 'Học kỳ 2' END
             ) as semester
      FROM assessments a
      JOIN classes c ON c.id = a.class_id
      JOIN subjects s ON s.id = c.subject_id
      JOIN student_assessment_grades sag ON sag.assessment_id = a.id AND sag.student_id = $1::uuid
      LEFT JOIN LATERAL (
        SELECT tca.academic_year, tca.semester, tca.updated_at
        FROM teacher_class_assignments tca
        WHERE tca.class_id = a.class_id
          AND (tca.start_date IS NULL OR a.date >= tca.start_date)
          AND (tca.end_date IS NULL OR a.date <= tca.end_date)
        ORDER BY tca.updated_at DESC NULLS LAST
        LIMIT 1
      ) tca_best ON true
      WHERE ($2::uuid IS NULL OR a.class_id = $2::uuid)
        AND ($3::text IS NULL OR a.type = $3::text)
        AND ($4::text IS NULL OR COALESCE(tca_best.academic_year,
               CASE
                 WHEN EXTRACT(MONTH FROM a.date) >= 7 THEN CONCAT(EXTRACT(YEAR FROM a.date)::int, '-', (EXTRACT(YEAR FROM a.date)::int + 1))
                 ELSE CONCAT((EXTRACT(YEAR FROM a.date)::int - 1), '-', EXTRACT(YEAR FROM a.date)::int)
               END) = $4::text)
        AND ($5::text IS NULL OR COALESCE(tca_best.semester,
               CASE WHEN EXTRACT(MONTH FROM a.date) BETWEEN 7 AND 12 THEN 'Học kỳ 1' ELSE 'Học kỳ 2' END) = $5::text)
        AND ($6::uuid IS NULL OR c.subject_id = $6::uuid)
        AND ($7::date IS NULL OR a.date >= $7::date)
        AND ($8::date IS NULL OR a.date <= $8::date)
      ORDER BY a.id, sag.student_id, a.date ASC
      `,
      studentId || null,
      classId || null,
      testType || null,
      academicYear || null,
      term || null,
      subjectId || null,
      dateStart || null,
      dateEnd || null,
    );

    // Group by academicYear/term then by subject
    const groupKey = (x: any) => `${x.academic_year || ''}||${x.semester || ''}`;
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
      const [academicYear, term] = key.split('||');
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
}
