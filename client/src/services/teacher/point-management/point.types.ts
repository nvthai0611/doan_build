export type TeacherStudentSummary = {
  studentId: string;
  fullName: string;
  email?: string | null;
  studentCode?: string | null;
  currentGrade?: number | null;
};

export type TeacherClassItem = {
  id: string;
  name: string;
  subject?: { id?: string; code?: string; name: string } | null;
  studentCount?: number | null;
  assignmentId?: string; // Thêm assignmentId
};

export type Assessment = {
  id: string;
  classId: string;
  name: string;
  type: string;
  maxScore: number;
  date: string;
  description?: string | null;
};

// GradeEntry đã được định nghĩa lại ở dưới

export type RecordGradesPayload = {
  classId: string;
  assessmentName: string;
  assessmentType: string;
  maxScore: number;
  date: string; // YYYY-MM-DD
  description?: string;
  grades: GradeEntry[];
};

export type UpdateGradePayload = {
  assessmentId: string;
  studentId: string;
  score?: number | null;
  feedback?: string | null;
};

export type AssessmentGradeView = {
  studentId: string;
  fullName: string;
  score: number | null;
  feedback?: string | null;
  gradedAt?: string | null;
};

// Types cho Score_view component
export type StudentGradeDetail = {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  avatar?: string;
  subject: string;
  class: string;
  grades: GradeEntry[];
  historicalGrades: HistoricalGrade[];
  average: number;
  previousAverage: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
};

export type GradeEntry = {
  type: string;
  testName: string;
  score: number;
  date: string;
  weight: number;
  assessmentId?: string; // Thêm assessmentId để có thể update
};

export type HistoricalGrade = {
  month: string;
  average: number;
};

export type SubjectStats = {
  subject: string;
  totalStudents: number;
  averageGrade: number;
  previousAverage: number;
  passRate: number;
  trend: 'up' | 'down' | 'stable';
};

export type GradeViewFilters = {
  searchTerm?: string;
  subjectFilter?: string;
  classFilter?: string;
  testTypeFilter?: string;
};

export type GradeViewResponse = {
  students: StudentGradeDetail[];
  subjectStats: SubjectStats[];
  totalStudents: number;
  overallAverage: number;
  passRate: number;
};

