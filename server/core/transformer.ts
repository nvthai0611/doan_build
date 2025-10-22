// Common Data Transformers for API Responses

export class DataTransformer {
    /**
     * Transform Class data for API response
     */
    static transformClass(cls: any) {
        return {
            id: cls.id,
            name: cls.name,
            subjectId: cls.subjectId,
            subjectName: cls.subject?.name || '',
            grade: cls.grade,
            status: cls.status,
            maxStudents: cls.maxStudents,
            currentStudents: cls._count?.enrollments || 0,
            roomId: cls.roomId,
            roomName: cls.room?.name || 'Chưa xác định',
            description: cls.description,
            feeStructureId: cls.feeStructureId,
            teachers: cls.teacherClassAssignments?.map((ta: any) => ({
                id: ta.teacher.id,
                userId: ta.teacher.userId,
                name: ta.teacher.user.fullName,
                email: ta.teacher.user.email,
                assignmentId: ta.id,
                startDate: ta.startDate,
                endDate: ta.endDate,
                semester: ta.semester,
                academicYear: ta.academicYear,
                recurringSchedule: ta.recurringSchedule
            })) || [],
            createdAt: cls.createdAt,
            updatedAt: cls.updatedAt
        };
    }

    /**
     * Transform multiple Classes
     */
    static transformClasses(classes: any[]) {
        return classes.map(cls => this.transformClass(cls));
    }

    /**
     * Transform Enrollment data for API response
     */
    static transformEnrollment(enrollment: any) {
        return {
            enrollmentId: enrollment.id,
            studentId: enrollment.student?.id,
            studentName: enrollment.student?.user?.fullName,
            studentEmail: enrollment.student?.user?.email,
            studentCode: enrollment.student?.studentCode,
            classId: enrollment.classId,
            className: enrollment.class?.name,
            subjectName: enrollment.class?.subject?.name,
            enrolledAt: enrollment.enrolledAt,
            status: enrollment.status,
            semester: enrollment.semester
        };
    }

    /**
     * Transform multiple Enrollments
     */
    static transformEnrollments(enrollments: any[]) {
        return enrollments.map(e => this.transformEnrollment(e));
    }

    /**
     * Transform Teacher data
     */
    static transformTeacher(teacher: any) {
        return {
            id: teacher.id,
            userId: teacher.userId,
            name: teacher.user?.fullName,
            email: teacher.user?.email,
            phone: teacher.user?.phone,
            avatar: teacher.user?.avatar,
            subjects: teacher.subjects || [],
            schoolId: teacher.schoolId
        };
    }

    /**
     * Transform Student data
     */
    static transformStudent(student: any) {
        return {
            id: student.id,
            userId: student.userId,
            studentCode: student.studentCode,
            name: student.user?.fullName,
            email: student.user?.email,
            phone: student.user?.phone,
            avatar: student.user?.avatar,
            grade: student.grade,
            address: student.address,
            schoolId: student.schoolId
        };
    }

    /**
     * Standard API Response format
     */
    static successResponse(data: any, message: string, meta?: any) {
        const response: any = {
            success: true,
            message,
            data
        };
        
        if (meta) {
            response.meta = meta;
        }
        
        return response;
    }

    /**
     * Standard API Error Response format
     */
    static errorResponse(message: string, error?: string) {
        return {
            success: false,
            message,
            ...(error && { error })
        };
    }

    /**
     * Pagination meta helper
     */
    static paginationMeta(total: number, page: number, limit: number) {
        return {
            total,
            page: parseInt(String(page)),
            limit: parseInt(String(limit)),
            totalPages: Math.ceil(total / parseInt(String(limit)))
        };
    }

    /**
     * Format schedule to array of strings
     */
    static formatScheduleArray(recurringSchedule: any): string[] {
        if (!recurringSchedule) return ['Chưa có lịch'];
        
        // If it's a string, try to parse it
        if (typeof recurringSchedule === 'string') {
            try {
                const parsed = JSON.parse(recurringSchedule);
                return this.formatScheduleArray(parsed);
            } catch {
                return [recurringSchedule];
            }
        }
        
        // If it has schedules array
        if (recurringSchedule.schedules && Array.isArray(recurringSchedule.schedules)) {
            const dayNames: { [key: string]: string } = {
                'monday': 'Thứ 2',
                'tuesday': 'Thứ 3', 
                'wednesday': 'Thứ 4',
                'thursday': 'Thứ 5',
                'friday': 'Thứ 6',
                'saturday': 'Thứ 7',
                'sunday': 'CN'
            };
            
            return recurringSchedule.schedules.map((schedule: any) => {
                const dayName = dayNames[schedule.day] || schedule.day;
                return `${dayName}: ${schedule.startTime} → ${schedule.endTime}`;
            });
        }
        
        return ['Chưa có lịch'];
    }
}