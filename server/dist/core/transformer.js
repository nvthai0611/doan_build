"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTransformer = void 0;
class DataTransformer {
    static transformClass(cls) {
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
            teachers: cls.teacherClassAssignments?.map((ta) => ({
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
    static transformClasses(classes) {
        return classes.map(cls => this.transformClass(cls));
    }
    static transformEnrollment(enrollment) {
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
    static transformEnrollments(enrollments) {
        return enrollments.map(e => this.transformEnrollment(e));
    }
    static transformTeacher(teacher) {
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
    static transformStudent(student) {
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
    static successResponse(data, message, meta) {
        const response = {
            success: true,
            message,
            data
        };
        if (meta) {
            response.meta = meta;
        }
        return response;
    }
    static errorResponse(message, error) {
        return {
            success: false,
            message,
            ...(error && { error })
        };
    }
    static paginationMeta(total, page, limit) {
        return {
            total,
            page: parseInt(String(page)),
            limit: parseInt(String(limit)),
            totalPages: Math.ceil(total / parseInt(String(limit)))
        };
    }
    static formatScheduleArray(recurringSchedule) {
        if (!recurringSchedule)
            return ['Chưa có lịch'];
        if (typeof recurringSchedule === 'string') {
            try {
                const parsed = JSON.parse(recurringSchedule);
                return this.formatScheduleArray(parsed);
            }
            catch {
                return [recurringSchedule];
            }
        }
        if (recurringSchedule.schedules && Array.isArray(recurringSchedule.schedules)) {
            const dayNames = {
                'monday': 'Thứ 2',
                'tuesday': 'Thứ 3',
                'wednesday': 'Thứ 4',
                'thursday': 'Thứ 5',
                'friday': 'Thứ 6',
                'saturday': 'Thứ 7',
                'sunday': 'CN'
            };
            return recurringSchedule.schedules.map((schedule) => {
                const dayName = dayNames[schedule.day] || schedule.day;
                return `${dayName}: ${schedule.startTime} → ${schedule.endTime}`;
            });
        }
        return ['Chưa có lịch'];
    }
}
exports.DataTransformer = DataTransformer;
//# sourceMappingURL=transformer.js.map