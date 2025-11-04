export interface StudentSubjectGrade {
  subjectId: string;
  subjectName: string;
  credits?: number;
  assessments?: Array<{
    name: string;
    type?: string;
    weight?: number;
    score: number;
    maxScore?: number;
    date?: string;
    comment?: string; // giáo viên nhận xét
  }>;
  average: number;
  letter?: string;
  status?: 'pass' | 'fail' | 'in_progress';
}

export interface StudentTermResult {
  academicYear: string; // e.g. "2024-2025"
  term?: string; // e.g. "Học kỳ 1"
  gpa: number;
  totalCredits?: number;
  totalSubjects: number;
  passedSubjects: number;
  failedSubjects: number;
  remarks?: string;
}

export interface TranscriptEntry {
  academicYear: string;
  term?: string;
  subjects: StudentSubjectGrade[];
  termResult: StudentTermResult;
}

export interface TranscriptFilters {
  academicYear?: string;
  term?: string;
  classId?: string;
  subjectId?: string;
  testType?: string;
}

export interface TranscriptResponse {
  entries: TranscriptEntry[];
  overview: {
    cumulativeGpa: number;
    totalCredits?: number;
    totalSubjects?: number;
  };
}


