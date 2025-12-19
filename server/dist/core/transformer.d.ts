export declare class DataTransformer {
    static transformClass(cls: any): {
        id: any;
        name: any;
        subjectId: any;
        subjectName: any;
        grade: any;
        status: any;
        maxStudents: any;
        currentStudents: any;
        roomId: any;
        roomName: any;
        description: any;
        feeStructureId: any;
        teachers: any;
        createdAt: any;
        updatedAt: any;
    };
    static transformClasses(classes: any[]): {
        id: any;
        name: any;
        subjectId: any;
        subjectName: any;
        grade: any;
        status: any;
        maxStudents: any;
        currentStudents: any;
        roomId: any;
        roomName: any;
        description: any;
        feeStructureId: any;
        teachers: any;
        createdAt: any;
        updatedAt: any;
    }[];
    static transformEnrollment(enrollment: any): {
        enrollmentId: any;
        studentId: any;
        studentName: any;
        studentEmail: any;
        studentCode: any;
        classId: any;
        className: any;
        subjectName: any;
        enrolledAt: any;
        status: any;
        semester: any;
    };
    static transformEnrollments(enrollments: any[]): {
        enrollmentId: any;
        studentId: any;
        studentName: any;
        studentEmail: any;
        studentCode: any;
        classId: any;
        className: any;
        subjectName: any;
        enrolledAt: any;
        status: any;
        semester: any;
    }[];
    static transformTeacher(teacher: any): {
        id: any;
        userId: any;
        name: any;
        email: any;
        phone: any;
        avatar: any;
        subjects: any;
        schoolId: any;
    };
    static transformStudent(student: any): {
        id: any;
        userId: any;
        studentCode: any;
        name: any;
        email: any;
        phone: any;
        avatar: any;
        grade: any;
        address: any;
        schoolId: any;
    };
    static successResponse(data: any, message: string, meta?: any): any;
    static errorResponse(message: string, error?: string): {
        error: string;
        success: boolean;
        message: string;
    };
    static paginationMeta(total: number, page: number, limit: number): {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    static formatScheduleArray(recurringSchedule: any): string[];
}
