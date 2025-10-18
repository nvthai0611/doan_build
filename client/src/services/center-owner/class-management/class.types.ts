export interface ClassType {
    id: string;
    name: string;
    subjectId: string;
    subjectName: string;
    gradeId?: string;
    gradeName?: string;
    gradeLevel?: number;
    status: 'draft' | 'active' | 'completed' | 'deleted';
    maxStudents: number;
    currentStudents: number;
    roomId?: string;
    roomName?: string;
    description?: string;
    feeStructureId?: string;
    feeStructureName?: string;
    feeAmount?: number;
    teacherId?: string;
    teacher?: {
        id: string;
        userId: string;
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
            avatar?: string;
        };
    };
    academicYear?: string;
    recurringSchedule?: any;
    startDate?: string;
    expectedStartDate?: string;
    actualStartDate?: string;
    actualEndDate?: string;
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
    gradeId?: string;
    subjectId?: string;
    teacherId?: string;
    roomId?: string;
    feeStructureId?: string;
    search?: string;
    dayOfWeek?: string;
    shift?: string;
    academicYear?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface CreateClassData {
    name: string;
    code?: string;
    subjectId?: string;
    gradeId?: string;
    maxStudents?: number;
    roomId?: string;
    teacherId?: string;
    feeStructureId?: string;
    description?: string;
    status?: string;
    academicYear?: string;
    recurringSchedule?: any;
    startDate?: string;
    expectedStartDate?: string;
    actualStartDate?: string;
    actualEndDate?: string;
}

export interface UpdateClassData extends Partial<CreateClassData> {}

export interface AssignTeacherData {
    teacherId: string;
    semester?: string;
    academicYear?: string;
    startDate?: string;
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
