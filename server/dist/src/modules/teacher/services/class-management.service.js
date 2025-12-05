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
exports.ClassManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
const validate_util_1 = require("../../../utils/validate.util");
let ClassManagementService = class ClassManagementService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getClassByTeacherId(teacherId, status, page, limit, search) {
        try {
            if ((0, validate_util_1.checkId)(teacherId) === false) {
                throw new common_1.HttpException('ID giáo viên không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
            }
            const teacher = await this.prisma.teacher.findUnique({
                where: { id: teacherId }
            });
            if (!teacher) {
                throw new common_1.HttpException('Giáo viên không tồn tại', common_1.HttpStatus.NOT_FOUND);
            }
            let classStatus = undefined;
            if (status && status !== 'all' && status.trim() !== '') {
                classStatus = status;
            }
            const offset = (page - 1) * limit;
            const whereCondition = {
                teacherId,
                ...(classStatus && { status: classStatus }),
                ...(search && search.trim() !== '' && {
                    name: {
                        contains: search.trim(),
                        mode: 'insensitive'
                    }
                })
            };
            if (!status) {
                whereCondition.status = 'active';
            }
            if (page < 1)
                page = 1;
            if (limit < 1)
                limit = 10;
            if (limit > 100)
                limit = 100;
            const totalCount = await this.prisma.class.count({
                where: whereCondition
            });
            const classes = await this.prisma.class.findMany({
                where: whereCondition,
                include: {
                    teacher: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    fullName: true,
                                    email: true,
                                    phone: true
                                }
                            }
                        }
                    },
                    subject: true,
                    room: true,
                    feeStructure: true,
                    grade: true,
                    _count: {
                        select: {
                            enrollments: true
                        }
                    }
                },
                skip: offset,
                take: limit,
                orderBy: [
                    { status: 'asc' },
                    { createdAt: 'desc' }
                ]
            });
            if (!classes.length) {
                throw new common_1.HttpException('Không tìm thấy lớp học được phân công', common_1.HttpStatus.NOT_FOUND);
            }
            const classesWithActiveStudents = await Promise.all(classes.map(async (classItem) => {
                const activeStudentCount = await this.prisma.enrollment.count({
                    where: {
                        classId: classItem.id,
                        status: { not: 'stopped' },
                        completedAt: null,
                        student: {
                            user: {
                                isActive: true
                            }
                        }
                    }
                });
                return {
                    ...classItem,
                    activeStudentCount
                };
            }));
            const transformedClasses = classesWithActiveStudents.map(classItem => ({
                id: classItem.id,
                name: classItem.name,
                description: classItem.description,
                grade: classItem.grade,
                maxStudents: classItem.maxStudents,
                status: classItem.status,
                academicYear: classItem.academicYear,
                expectedStartDate: classItem.expectedStartDate,
                actualStartDate: classItem.actualStartDate,
                actualEndDate: classItem.actualEndDate,
                createdAt: classItem.createdAt,
                updatedAt: classItem.updatedAt,
                teacherName: classItem.teacher?.user?.fullName || 'N/A',
                teacherEmail: classItem.teacher?.user?.email || 'N/A',
                teacherId: classItem.teacher?.id,
                subject: classItem.subject,
                subjectId: classItem.subjectId,
                room: classItem.room,
                roomId: classItem.roomId,
                studentCount: classItem.activeStudentCount,
                feeStructure: classItem.feeStructure,
                feeStructureId: classItem.feeStructureId,
                schedule: classItem.recurringSchedule ?
                    (typeof classItem.recurringSchedule === 'string' ?
                        JSON.parse(classItem.recurringSchedule) :
                        classItem.recurringSchedule) : null,
                enrollmentStatus: {
                    current: classItem.activeStudentCount,
                    max: classItem.maxStudents,
                    percentage: classItem.maxStudents > 0 ?
                        Math.round((classItem.activeStudentCount / classItem.maxStudents) * 100) : 0,
                    available: Math.max(0, classItem.maxStudents - classItem.activeStudentCount),
                    isFull: classItem.activeStudentCount >= classItem.maxStudents,
                    status: classItem.activeStudentCount >= classItem.maxStudents ? 'full' :
                        classItem.activeStudentCount >= classItem.maxStudents * 0.8 ? 'nearly_full' : 'available'
                },
            }));
            const totalPages = Math.ceil(totalCount / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;
            const result = {
                data: transformedClasses,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    limit,
                    hasNextPage,
                    hasPrevPage
                },
                filters: {
                    search: search || '',
                    status: status || ''
                }
            };
            return result;
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách lớp học',
                error: error?.message || error,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCountByStatus(teacherId) {
        try {
            if ((0, validate_util_1.checkId)(teacherId) === false) {
                throw new common_1.HttpException('ID giáo viên không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
            }
            const teacher = await this.prisma.teacher.findUnique({
                where: { id: teacherId }
            });
            if (!teacher) {
                throw new common_1.HttpException('Giáo viên không tồn tại', common_1.HttpStatus.NOT_FOUND);
            }
            const classCounts = await this.prisma.class.groupBy({
                by: ['status'],
                where: {
                    teacherId
                },
                _count: {
                    status: true
                }
            });
            if (!classCounts.length) {
                throw new common_1.HttpException('Không tìm thấy lớp học nào cho giáo viên này', common_1.HttpStatus.NOT_FOUND);
            }
            const result = {
                total: 0,
                active: 0,
                draft: 0,
                completed: 0,
                cancelled: 0,
                ready: 0
            };
            classCounts.forEach(item => {
                const count = item._count.status;
                result.total += count;
                if (item.status === 'active') {
                    result.active = count;
                }
                else if (item.status === 'draft') {
                    result.draft = count;
                }
                else if (item.status === 'completed') {
                    result.completed = count;
                }
                else if (item.status === 'cancelled') {
                    result.cancelled = count;
                }
                else if (item.status === 'ready') {
                    result.ready = count;
                }
            });
            return result;
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException('Có lỗi xảy ra khi lấy số lượng lớp học theo trạng thái', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getClassDetail(teacherId, classId) {
        try {
            if (!(0, validate_util_1.checkId)(teacherId) || !(0, validate_util_1.checkId)(classId)) {
                throw new common_1.HttpException('ID không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
            }
            const classItem = await this.prisma.class.findFirst({
                where: {
                    id: classId,
                    teacherId: teacherId
                },
                include: {
                    room: true,
                    subject: true,
                    feeStructure: true,
                    grade: true,
                    teacher: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    fullName: true,
                                    email: true,
                                    phone: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            enrollments: true
                        }
                    }
                }
            });
            if (!classItem) {
                throw new common_1.HttpException('Lớp học không tồn tại hoặc bạn không có quyền truy cập', common_1.HttpStatus.NOT_FOUND);
            }
            const listStudent = await this.prisma.enrollment.findMany({
                where: {
                    classId: classItem.id,
                    status: { not: 'stopped' },
                    student: {
                        user: {
                            isActive: true
                        }
                    }
                },
                include: {
                    student: {
                        select: {
                            studentCode: true,
                            user: {
                                select: {
                                    avatar: true,
                                    fullName: true,
                                    email: true,
                                    phone: true,
                                    id: true
                                }
                            }
                        }
                    }
                }
            });
            const classSessionInfo = await this.prisma.classSession.findMany({
                where: {
                    classId: classItem.id,
                    academicYear: classItem.academicYear,
                },
                include: {
                    attendances: {
                        select: {
                            status: true,
                            studentId: true
                        }
                    }
                }
            });
            const activeStudentCount = listStudent.length;
            let totalAttendanceRate = 0;
            let totalSessions = classSessionInfo.length;
            if (totalSessions > 0 && activeStudentCount > 0) {
                let totalPresentCount = 0;
                let totalPossibleAttendances = totalSessions * activeStudentCount;
                classSessionInfo.forEach(session => {
                    const presentCount = session.attendances.filter(attendance => attendance.status === 'present').length;
                    totalPresentCount += presentCount;
                });
                totalAttendanceRate = totalPossibleAttendances > 0 ?
                    Math.round((totalPresentCount / totalPossibleAttendances) * 100) : 0;
            }
            const totalPresentCount = classSessionInfo.reduce((total, session) => {
                return total + session.attendances.filter(attendance => attendance.status === 'present').length;
            }, 0);
            const totalAbsentCount = classSessionInfo.reduce((total, session) => {
                return total + session.attendances.filter(attendance => attendance.status === 'absent').length;
            }, 0);
            const totalExcusedCount = classSessionInfo.reduce((total, session) => {
                return total + session.attendances.filter(attendance => attendance.status === 'excused').length;
            }, 0);
            const result = {
                id: classItem.id,
                name: classItem.name,
                description: classItem.description,
                grade: classItem.grade,
                maxStudents: classItem.maxStudents,
                status: classItem.status,
                academicYear: classItem.academicYear,
                expectedStartDate: classItem.expectedStartDate,
                actualStartDate: classItem.actualStartDate,
                actualEndDate: classItem.actualEndDate,
                createdAt: classItem.createdAt,
                updatedAt: classItem.updatedAt,
                room: classItem.room,
                subject: classItem.subject,
                emrollments: listStudent,
                studentCount: activeStudentCount,
                classSession: {
                    total: classSessionInfo.length,
                    completed: classSessionInfo.filter(session => session.status === 'completed').length,
                    upcoming: classSessionInfo.filter(session => session.status === 'scheduled' && new Date(session.sessionDate) > new Date()).length,
                    attendanceRate: totalAttendanceRate,
                    averageAttendancePerSession: totalSessions > 0 && activeStudentCount > 0 ?
                        Math.round((classSessionInfo.reduce((sum, session) => {
                            return sum + session.attendances.filter(att => att.status === 'present').length;
                        }, 0) / totalSessions)) : 0,
                    totalPresentCount,
                    totalAbsentCount,
                    totalExcusedCount
                },
                schedule: classItem.recurringSchedule ?
                    (typeof classItem.recurringSchedule === 'string' ?
                        JSON.parse(classItem.recurringSchedule) :
                        classItem.recurringSchedule) : null
            };
            return result;
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            console.log(error);
            throw new common_1.HttpException('Có lỗi xảy ra khi lấy chi tiết lớp học', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getHistoryAttendanceOfClass(classId, teacherId) {
        try {
            if (!(0, validate_util_1.checkId)(teacherId) || !(0, validate_util_1.checkId)(classId)) {
                throw new common_1.HttpException('ID không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
            }
            const classItem = await this.prisma.class.findFirst({
                where: {
                    id: classId,
                    teacherId: teacherId
                }
            });
            if (!classItem) {
                throw new common_1.HttpException('Lớp học không tồn tại hoặc bạn không có quyền truy cập', common_1.HttpStatus.NOT_FOUND);
            }
            const classSessions = await this.prisma.classSession.findMany({
                where: {
                    classId: classId,
                    academicYear: classItem.academicYear
                },
                include: {
                    attendances: {
                        include: {
                            student: {
                                select: {
                                    id: true,
                                    user: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    sessionDate: 'desc'
                }
            });
            if (classSessions.length === 0) {
                throw new common_1.HttpException('Không tìm thấy buổi học nào của lớp này', common_1.HttpStatus.NOT_FOUND);
            }
            return classSessions;
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException('Có lỗi xảy ra khi lấy lịch sử điểm danh', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ClassManagementService = ClassManagementService;
exports.ClassManagementService = ClassManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClassManagementService);
//# sourceMappingURL=class-management.service.js.map