"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let StudentManagementService = class StudentManagementService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getChildrenForParent(userId, query = {}) {
        const parent = await this.prisma.parent.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!parent) {
            return { data: [], message: 'Không tìm thấy phụ huynh' };
        }
        const { search, grade, schoolId, enrollmentStatus = 'all', page = 1, limit = 10, } = query;
        const where = {
            parentId: parent.id,
        };
        if (grade)
            where.grade = grade;
        if (schoolId)
            where.schoolId = schoolId;
        if (search) {
            where.OR = [
                { user: { fullName: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { studentCode: { contains: search, mode: 'insensitive' } },
            ];
        }
        let enrollmentWhere = undefined;
        if (enrollmentStatus === 'enrolled') {
            enrollmentWhere = { some: { status: 'studying', class: { status: 'active' } } };
        }
        else if (enrollmentStatus === 'not_enrolled') {
            enrollmentWhere = { none: { status: 'studying', class: { status: 'active' } } };
        }
        const skip = (Math.max(1, page) - 1) * Math.max(1, limit);
        const take = Math.max(1, limit);
        const studentWhere = { ...where };
        if (enrollmentWhere) {
            studentWhere.enrollments = enrollmentWhere;
        }
        const [students, total] = await Promise.all([
            this.prisma.student.findMany({
                where: studentWhere,
                skip,
                take,
                include: {
                    user: true,
                    school: true,
                    enrollments: {
                        where: {
                            status: 'studying',
                            class: { status: 'active' },
                        },
                        include: {
                            class: {
                                include: {
                                    subject: true,
                                    teacher: { include: { user: true } },
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.student.count({ where: studentWhere }),
        ]);
        const formatted = students.map((s) => ({
            id: s.id,
            userId: s.userId,
            studentCode: s.studentCode ?? undefined,
            dateOfBirth: s.user.birthDate ? s.user.birthDate.toISOString() : undefined,
            gender: s.user.gender ?? undefined,
            address: s.address ?? undefined,
            grade: s.grade ?? undefined,
            school: {
                id: s.school.id,
                name: s.school.name,
                address: s.school.address ?? undefined,
                phone: s.school.phone ?? undefined,
            },
            user: {
                id: s.user.id,
                fullName: s.user.fullName ?? s.user.username,
                email: s.user.email,
                avatar: s.user.avatar ?? undefined,
                phone: s.user.phone ?? undefined,
            },
            enrollments: s.enrollments?.map((e) => ({
                id: String(e.id),
                classId: e.classId,
                status: e.status,
                enrolledAt: e.enrolledAt.toISOString(),
                class: {
                    id: e.class.id,
                    name: e.class.name,
                    subject: { id: e.class.subject.id, name: e.class.subject.name },
                    teacher: e.class.teacher
                        ? { id: e.class.teacher.id, user: { fullName: e.class.teacher.user.fullName ?? '' } }
                        : { id: '', user: { fullName: '' } },
                },
            })),
        }));
        const totalPages = Math.ceil(total / take);
        return {
            data: formatted,
            message: 'Lấy danh sách con thành công',
            meta: {
                page,
                limit: take,
                total,
                totalPages,
            },
        };
    }
    async getChildDetailForParent(userId, childId) {
        const parent = await this.prisma.parent.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!parent) {
            return { data: null, message: 'Không tìm thấy phụ huynh' };
        }
        const student = await this.prisma.student.findFirst({
            where: { id: childId, parentId: parent.id },
            include: {
                user: true,
                school: true,
                enrollments: {
                    where: {
                        status: 'studying',
                        class: { status: 'active', teacherId: { not: null } },
                    },
                    include: {
                        class: {
                            include: {
                                subject: true,
                                teacher: { include: { user: true } }
                            }
                        },
                    },
                },
                attendances: {
                    include: {
                        session: { include: { class: { include: { subject: true } } } },
                    },
                    orderBy: { recordedAt: 'desc' },
                    take: 50,
                },
                grades: {
                    include: {
                        assessment: { include: { class: true } },
                    },
                    orderBy: { gradedAt: 'desc' },
                    take: 50,
                },
            },
        });
        if (!student) {
            return { data: null, message: 'Không tìm thấy học sinh' };
        }
        const result = {
            id: student.id,
            userId: student.userId,
            studentCode: student.studentCode ?? undefined,
            dateOfBirth: student.user.birthDate ? student.user.birthDate.toISOString() : undefined,
            gender: student.user.gender ?? undefined,
            address: student.address ?? undefined,
            grade: student.grade ?? undefined,
            school: {
                id: student.school.id,
                name: student.school.name,
                address: student.school.address ?? undefined,
                phone: student.school.phone ?? undefined,
            },
            user: {
                id: student.user.id,
                fullName: student.user.fullName ?? student.user.username,
                email: student.user.email,
                avatar: student.user.avatar ?? undefined,
                phone: student.user.phone ?? undefined,
            },
            enrollments: student.enrollments.map((e) => ({
                id: String(e.id),
                classId: e.classId,
                status: e.status,
                enrolledAt: e.enrolledAt.toISOString(),
                class: {
                    id: e.class.id,
                    name: e.class.name,
                    subject: { id: e.class.subject.id, name: e.class.subject.name },
                    teacher: e.class.teacher
                        ? { id: e.class.teacher.id, user: { fullName: e.class.teacher.user.fullName ?? '' } }
                        : { id: '', user: { fullName: '' } },
                },
            })),
            attendances: student.attendances.map((a) => ({
                id: String(a.id),
                sessionId: a.sessionId,
                status: a.status,
                note: a.note ?? undefined,
                session: {
                    id: a.session.id,
                    sessionDate: a.session.sessionDate.toISOString(),
                    startTime: a.session.startTime,
                    endTime: a.session.endTime,
                    class: { name: a.session.class.name, subject: { name: a.session.class.subject.name } },
                },
            })),
            grades: student.grades.map((g) => ({
                id: String(g.id),
                assessmentId: g.assessmentId,
                score: g.score ? Number(g.score) : undefined,
                feedback: g.feedback ?? undefined,
                assessment: {
                    name: g.assessment.name,
                    type: g.assessment.type,
                    maxScore: Number(g.assessment.maxScore),
                    date: g.assessment.date.toISOString(),
                    class: { name: g.assessment.class.name },
                },
            })),
        };
        return { data: result, message: 'Lấy chi tiết học sinh thành công' };
    }
    async getChildMetricsForParent(userId, childId) {
        const parent = await this.prisma.parent.findUnique({ where: { userId }, select: { id: true } });
        if (!parent)
            return { data: null, message: 'Không tìm thấy phụ huynh' };
        const child = await this.prisma.student.findFirst({ where: { id: childId, parentId: parent.id }, select: { id: true } });
        if (!child)
            return { data: null, message: 'Không tìm thấy học sinh' };
        const enrollments = await this.prisma.enrollment.findMany({
            where: {
                studentId: childId,
                status: 'studying',
                class: { status: 'active', teacherId: { not: null } }
            },
            select: { classId: true },
        });
        const classIds = enrollments.map((e) => e.classId);
        if (classIds.length === 0) {
            return {
                data: { averageGrade: 0, classRank: null, totalStudents: 0, attendanceRate: 0 },
                message: 'Chưa có lớp học đang hoạt động',
            };
        }
        const studentGradeAgg = await this.prisma.studentAssessmentGrade.aggregate({
            _avg: { score: true },
            where: { studentId: childId, assessment: { classId: { in: classIds } }, score: { not: null } },
        });
        const averageGrade = studentGradeAgg._avg.score != null ? Number(studentGradeAgg._avg.score) : null;
        const classmates = await this.prisma.studentAssessmentGrade.groupBy({
            by: ['studentId'],
            _avg: { score: true },
            where: { assessment: { classId: { in: classIds } }, score: { not: null } },
        });
        const sorted = classmates
            .map((c) => ({ studentId: c.studentId, avg: c._avg.score ? Number(c._avg.score) : 0 }))
            .sort((a, b) => b.avg - a.avg);
        const totalStudents = sorted.length;
        const idx = sorted.findIndex((s) => s.studentId === childId);
        const classRank = idx >= 0 ? idx + 1 : null;
        const [attendanceTotal, attendancePresent] = await Promise.all([
            this.prisma.studentSessionAttendance.count({ where: { studentId: childId, session: { classId: { in: classIds } } } }),
            this.prisma.studentSessionAttendance.count({ where: { studentId: childId, status: 'present', session: { classId: { in: classIds } } } }),
        ]);
        const attendanceRate = attendanceTotal > 0 ? Math.round((attendancePresent / attendanceTotal) * 100) : null;
        return {
            data: { averageGrade, classRank, totalStudents, attendanceRate },
            message: 'Lấy thành tích học tập thành công',
        };
    }
    async getChildScheduleForParent(userId, childId, startDate, endDate) {
        const parent = await this.prisma.parent.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!parent)
            return { data: [], message: 'Không tìm thấy phụ huynh' };
        const child = await this.prisma.student.findFirst({
            where: { id: childId, parentId: parent.id },
            select: { id: true },
        });
        if (!child)
            return { data: [], message: 'Không tìm thấy học sinh' };
        const enrollments = await this.prisma.enrollment.findMany({
            where: {
                studentId: childId,
                status: 'studying',
                class: { status: 'active' }
            },
            select: {
                classId: true,
                enrolledAt: true
            },
        });
        if (enrollments.length === 0)
            return { data: [], message: 'Chưa có lịch học' };
        const classIds = enrollments.map((e) => e.classId);
        const dateFilter = {};
        if (startDate)
            dateFilter.gte = new Date(startDate);
        if (endDate)
            dateFilter.lte = new Date(endDate);
        const orConditions = enrollments.map((enrollment) => ({
            classId: enrollment.classId,
            sessionDate: { gte: enrollment.enrolledAt }
        }));
        const whereCondition = {
            classId: { in: classIds },
            class: { status: 'active' },
            ...(startDate || endDate ? { sessionDate: dateFilter } : {}),
            OR: orConditions
        };
        const sessions = await this.prisma.classSession.findMany({
            where: whereCondition,
            include: {
                class: {
                    include: {
                        subject: true,
                        teacher: {
                            include: {
                                user: { select: { fullName: true } }
                            }
                        }
                    }
                },
                room: true,
            },
            orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
        });
        const activeTransfers = await this.prisma.teacherClassTransfer.findMany({
            where: {
                fromClassId: { in: classIds },
                status: { in: ['approved', 'auto_created'] },
            },
            include: {
                teacher: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                            },
                        },
                    },
                },
                replacementTeacher: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                effectiveDate: 'desc',
            },
        });
        const formatYMD = (d) => {
            if (!d)
                return undefined;
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        const result = sessions.map((s) => {
            const sessionDate = new Date(s.sessionDate);
            sessionDate.setHours(0, 0, 0, 0);
            const activeTransfer = activeTransfers.find(transfer => {
                if (transfer.fromClassId !== s.classId)
                    return false;
                const effectiveDate = new Date(transfer.effectiveDate || 0);
                effectiveDate.setHours(0, 0, 0, 0);
                if (effectiveDate > sessionDate)
                    return false;
                if (transfer.substituteEndDate) {
                    const endDate = new Date(transfer.substituteEndDate);
                    endDate.setHours(0, 0, 0, 0);
                    if (endDate < sessionDate)
                        return false;
                }
                return true;
            });
            const teacher = activeTransfer?.teacher || s.class.teacher;
            const substituteTeacher = activeTransfer?.replacementTeacher || null;
            const substituteEndDate = activeTransfer?.substituteEndDate || null;
            return {
                id: s.id,
                classId: s.classId,
                sessionDate: s.sessionDate.toISOString(),
                startTime: s.startTime,
                endTime: s.endTime,
                room: s.room ? { id: s.room.id, name: s.room.name, capacity: s.room.capacity ?? 0 } : undefined,
                status: s.status,
                teacher: teacher
                    ? {
                        id: teacher.id,
                        fullName: teacher.user?.fullName || null,
                    }
                    : undefined,
                substituteTeacher: substituteTeacher
                    ? {
                        id: substituteTeacher.id,
                        fullName: substituteTeacher.user?.fullName || null,
                    }
                    : undefined,
                substituteEndDate: substituteEndDate ? formatYMD(substituteEndDate) : undefined,
                class: {
                    id: s.class.id,
                    name: s.class.name,
                    subject: { id: s.class.subject.id, name: s.class.subject.name },
                    teacher: s.class.teacher ? {
                        id: s.class.teacher.id,
                        fullName: s.class.teacher.user?.fullName || null,
                    } : undefined,
                    maxStudents: s.class.maxStudents ?? 0,
                    currentStudents: 0,
                },
            };
        });
        return { data: result, message: 'Lấy lịch học thành công' };
    }
    async getChildGradesForParent(userId, childId, classId) {
        const parent = await this.prisma.parent.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!parent) {
            return { data: [], message: 'Không tìm thấy phụ huynh' };
        }
        const child = await this.prisma.student.findFirst({
            where: { id: childId, parentId: parent.id },
            select: { id: true },
        });
        if (!child) {
            return { data: [], message: 'Không tìm thấy học sinh' };
        }
        const grades = await this.prisma.studentAssessmentGrade.findMany({
            where: {
                studentId: childId,
                ...(classId ? { assessment: { classId } } : {})
            },
            include: {
                assessment: {
                    include: {
                        class: {
                            include: {
                                subject: true,
                                teacher: {
                                    include: {
                                        user: {
                                            select: {
                                                fullName: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                gradedByUser: {
                    select: {
                        fullName: true
                    }
                }
            },
            orderBy: {
                gradedAt: 'desc'
            }
        });
        const result = grades.map((grade) => {
            const teacherName = grade.assessment.class.teacher?.user?.fullName || 'Chưa xác định';
            let status = 'average';
            if (grade.score !== null) {
                const scoreValue = Number(grade.score);
                if (scoreValue >= 8.5) {
                    status = 'excellent';
                }
                else if (scoreValue >= 7.0) {
                    status = 'good';
                }
            }
            return {
                id: String(grade.id),
                subject: grade.assessment.class.subject.name,
                examName: grade.assessment.name,
                date: grade.assessment.date.toISOString().split('T')[0],
                score: grade.score ? Number(grade.score) : null,
                maxScore: Number(grade.assessment.maxScore),
                status: status,
                teacher: teacherName,
                feedback: grade.feedback || '',
                gradedAt: grade.gradedAt.toISOString(),
                assessmentType: grade.assessment.type,
                className: grade.assessment.class.name,
                classId: grade.assessment.classId
            };
        });
        return { data: result, message: 'Lấy điểm số thành công' };
    }
    async getChildAttendanceForParent(userId, childId, filters = {}) {
        const parent = await this.prisma.parent.findUnique({ where: { userId }, select: { id: true } });
        if (!parent) {
            return { success: false, message: 'Không tìm thấy phụ huynh' };
        }
        const student = await this.prisma.student.findFirst({
            where: { id: childId, parentId: parent.id },
            select: { id: true }
        });
        if (!student) {
            return { success: false, message: 'Không tìm thấy học sinh' };
        }
        const enrollments = await this.prisma.enrollment.findMany({
            where: {
                studentId: student.id,
                status: 'studying',
                class: { status: 'active' },
                ...(filters.classId ? { classId: filters.classId } : {})
            },
            select: { classId: true }
        });
        const classIds = enrollments.map(e => e.classId);
        if (classIds.length === 0) {
            return { success: true, data: [], message: 'Học sinh chưa có lớp học nào' };
        }
        const sessionWhere = {
            classId: { in: classIds }
        };
        if (filters.startDate || filters.endDate) {
            sessionWhere.sessionDate = {};
            if (filters.startDate)
                sessionWhere.sessionDate.gte = new Date(filters.startDate);
            if (filters.endDate)
                sessionWhere.sessionDate.lte = new Date(filters.endDate);
        }
        const sessions = await this.prisma.classSession.findMany({
            where: sessionWhere,
            include: {
                class: {
                    include: {
                        subject: { select: { name: true } },
                        teacher: {
                            include: {
                                user: { select: { fullName: true } }
                            }
                        }
                    }
                },
                room: { select: { name: true } },
                attendances: {
                    where: { studentId: student.id },
                    include: {
                        recordedByTeacher: {
                            include: {
                                user: { select: { fullName: true } }
                            }
                        }
                    }
                }
            },
            orderBy: {
                sessionDate: 'asc'
            }
        });
        const result = sessions.map((session) => {
            const attendance = session.attendances[0];
            return {
                id: session.id,
                sessionId: session.id,
                sessionDate: session.sessionDate,
                startTime: session.startTime,
                endTime: session.endTime,
                status: session.status,
                attendanceStatus: attendance?.status || null,
                attendanceRecordedAt: attendance?.recordedAt,
                attendanceRecordedBy: attendance?.recordedByTeacher?.user?.fullName,
                attendanceNote: attendance?.note,
                room: session.room,
                class: {
                    name: session.class.name,
                    subject: session.class.subject
                },
                teacher: session.class.teacher?.user?.fullName
            };
        });
        return { success: true, data: result, message: 'Lấy lịch sử điểm danh thành công' };
    }
    async getClassRankingForParent(userId, childId, classId) {
        const parent = await this.prisma.parent.findUnique({
            where: { userId },
            select: { id: true }
        });
        if (!parent) {
            return { data: null, message: 'Không tìm thấy phụ huynh' };
        }
        const child = await this.prisma.student.findFirst({
            where: { id: childId, parentId: parent.id },
            select: { id: true }
        });
        if (!child) {
            return { data: null, message: 'Không tìm thấy học sinh' };
        }
        const enrollment = await this.prisma.enrollment.findFirst({
            where: {
                studentId: childId,
                classId: classId,
                status: 'studying',
            },
        });
        if (!enrollment) {
            return { data: null, message: 'Học sinh không học lớp này' };
        }
        const studentGradeAgg = await this.prisma.studentAssessmentGrade.aggregate({
            _avg: { score: true },
            where: {
                studentId: childId,
                assessment: { classId: classId },
                score: { not: null }
            },
        });
        const studentAvg = studentGradeAgg._avg.score != null ? Number(studentGradeAgg._avg.score) : null;
        const allStudentsGrades = await this.prisma.studentAssessmentGrade.groupBy({
            by: ['studentId'],
            _avg: { score: true },
            where: {
                assessment: { classId: classId },
                score: { not: null }
            },
        });
        const sorted = allStudentsGrades
            .map((g) => ({
            studentId: g.studentId,
            avg: g._avg.score ? Number(g._avg.score) : 0
        }))
            .sort((a, b) => {
            if (b.avg !== a.avg)
                return b.avg - a.avg;
            return a.studentId.localeCompare(b.studentId);
        });
        const totalStudents = sorted.length;
        const idx = sorted.findIndex((s) => s.studentId === childId);
        const rank = idx >= 0 ? idx + 1 : null;
        return {
            data: {
                rank,
                totalStudents,
                averageScore: studentAvg
            },
            message: 'Lấy xếp hạng thành công',
        };
    }
};
exports.StudentManagementService = StudentManagementService;
exports.StudentManagementService = StudentManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudentManagementService);
//# sourceMappingURL=student-management.service.js.map