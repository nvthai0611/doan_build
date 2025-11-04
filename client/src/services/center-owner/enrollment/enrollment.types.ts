export interface EnrollmentType {
    enrollmentId: number;
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentCode: string;
    classId: string;
    className: string;
    subjectName: string;
    enrolledAt: Date;
    status: 'active' | 'completed' | 'withdrawn';
    semester: string;
}

export interface EnrollmentFilters {
    classId?: string;
    studentId?: string;
    status?: string;
    semester?: string;
    page?: number;
    limit?: number;
}

export interface EnrollStudentData {
    studentId: string;
    classId: string;
    semester?: string;
    teacherClassAssignmentId?: string;
}

export interface BulkEnrollData {
    studentIds: string[];
    classId: string;
    semester?: string;
    teacherClassAssignmentId?: string;
}

export interface TransferStudentData {
    newClassId: string;
    reason?: string;
    semester?: string;
    newTeacherClassAssignmentId?: string;
}

export interface UpdateStatusData {
    status: 'active' | 'completed' | 'withdrawn';
    finalGrade?: string;
    completionStatus?: string;
    completionNotes?: string;
}

export interface CapacityInfo {
    maxStudents: number;
    currentStudents: number;
    availableSlots: number | null;
    isFull: boolean;
}

