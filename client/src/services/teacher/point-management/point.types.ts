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

export type GradeEntry = {
  studentId: string;
  score?: number | null;
  feedback?: string | null;
};

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

