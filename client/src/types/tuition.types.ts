export interface Grade {
  id: string;
  name: string;
  level: number;
  description?: string;
  isActive: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface FeeStructure {
  id: string;
  name: string;
  amount: number;
  period: 'per_session' | 'monthly' | 'quarterly' | 'yearly';
  description?: string;
  isActive: boolean;
  gradeId?: string;
  subjectId?: string;
  grade?: Grade;
  subject?: Subject;
  createdAt: string;
  updatedAt: string;
}

export interface SessionFeeMatrix {
  grade: Grade;
  subjects: Array<{
    subject: Subject;
    fee: {
      id: string;
      amount: number;
      name: string;
    } | null;
  }>;
}

export interface SessionFeeMatrixResponse {
  matrix: SessionFeeMatrix[];
  grades: Grade[];
  subjects: Subject[];
  totalGrades: number;
  totalSubjects: number;
}

export interface UpsertSessionFeeRequest {
  gradeId: string;
  subjectId: string;
  amount: number;
}

export interface BulkUpdateSessionFeesRequest {
  updates: Array<{
    gradeId: string;
    subjectId: string;
    amount: number;
  }>;
}

export interface SessionFeeInputProps {
  gradeId: string;
  subjectId: string;
  currentFee: number | null;
  onFeeChange: (gradeId: string, subjectId: string, amount: number) => Promise<void>;
  isLoading?: boolean;
}
