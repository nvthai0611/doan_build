export interface ClassType {
    id: string;
    name: string;
    subjectId: string;
    subjectName: string;
    grade: string;
    status: 'draft' | 'active' | 'completed' | 'deleted';
    maxStudents: number;
    currentStudents: number;
    roomId?: string;
    roomName?: string;
    description?: string;
    feeStructureId?: string;
    teachers: TeacherAssignment[];
    createdAt: Date;
    updatedAt: Date;
}

export interface TeacherAssignment {
    id: string;
    userId: string;
    name: string;
    email: string;
    assignmentId: string;
    startDate: Date;
    endDate?: Date;
    semester: string;
    academicYear: string;
}

export interface ClassFilters {
    status?: string;
    grade?: string;
    subjectId?: string;
    teacherId?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface CreateClassData {
    name: string;
    subjectId: string;
    grade?: string;
    maxStudents?: number;
    roomId?: string;
    feeStructureId?: string;
    description?: string;
    status?: string;
}

export interface UpdateClassData extends Partial<CreateClassData> {}

export interface AssignTeacherData {
    teacherId: string;
    semester: string;
    academicYear: string;
    startDate: string;
    endDate?: string;
    recurringSchedule?: any;
    maxStudents?: number;
    notes?: string;
}

export interface ClassStats {
    totalStudents: number;
    activeStudents: number;
    completedStudents: number;
    withdrawnStudents: number;
    maxStudents: number;
    availableSlots: number | null;
}
