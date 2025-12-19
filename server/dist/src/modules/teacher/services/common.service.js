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
exports.CommonService = void 0;
const prisma_service_1 = require("../../../db/prisma.service");
const common_1 = require("@nestjs/common");
let CommonService = class CommonService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getListStudentOfClass(classId, teacherId) {
        try {
            const students = await this.prisma.enrollment.findMany({
                where: {
                    classId: classId,
                    status: 'studying',
                    student: {
                        user: {
                            isActive: true,
                        },
                    },
                    class: {
                        status: 'active',
                        teacherId: teacherId,
                    },
                },
                include: {
                    student: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    email: true,
                                    phone: true,
                                    avatar: true,
                                    gender: true,
                                    birthDate: true,
                                },
                            },
                            school: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                            grades: {
                                select: {
                                    id: true,
                                    score: true,
                                    assessment: {
                                        select: {
                                            id: true,
                                            name: true,
                                            type: true,
                                            date: true,
                                        },
                                    },
                                },
                                orderBy: {
                                    gradedAt: 'desc',
                                },
                            },
                        },
                    },
                    class: {
                        select: {
                            id: true,
                            name: true,
                            academicYear: true,
                            grade: {
                                select: {
                                    id: true,
                                    name: true,
                                    level: true,
                                },
                            },
                            subject: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                },
                            },
                            teacher: {
                                include: {
                                    user: {
                                        select: {
                                            fullName: true,
                                            email: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    enrolledAt: 'desc',
                },
            });
            return {
                success: true,
                data: students,
                message: `Lấy danh sách học sinh thành công - ${students.length} học sinh đang học`,
            };
        }
        catch (error) {
            throw new Error(`Lỗi khi lấy danh sách học sinh: ${error.message}`);
        }
    }
    async getClassSessionsByAssignment(classId, academicYear) {
        try {
            const classInfo = await this.prisma.class.findUnique({
                where: { id: classId },
                select: { id: true, academicYear: true }
            });
            if (!classInfo) {
                return {
                    success: false,
                    message: 'Không tìm thấy lớp học'
                };
            }
            const sessions = await this.prisma.classSession.findMany({
                where: {
                    classId: classId,
                    academicYear: academicYear || classInfo.academicYear
                },
                select: {
                    id: true,
                    sessionDate: true,
                    startTime: true,
                    endTime: true,
                    status: true,
                    room: { select: { name: true } }
                },
                orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }]
            });
            return {
                success: true,
                data: sessions,
                message: `Lấy danh sách buổi học thành công (${sessions.length})`
            };
        }
        catch (error) {
            throw new Error(`Lỗi khi lấy danh sách buổi học: ${error.message}`);
        }
    }
    async getDetailStudentOfClass(studentId, classId, teacherId) {
        try {
            const whereCondition = {
                studentId: studentId,
                status: 'studying',
                student: {
                    user: {
                        isActive: true,
                    },
                },
                class: {
                    status: 'active',
                },
            };
            if (classId) {
                whereCondition.classId = classId;
            }
            if (teacherId) {
                whereCondition.class.teacherId = teacherId;
            }
            const studentDetail = await this.prisma.enrollment.findFirst({
                where: whereCondition,
                include: {
                    student: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    email: true,
                                    phone: true,
                                    avatar: true,
                                    gender: true,
                                    birthDate: true,
                                    createdAt: true,
                                },
                            },
                            school: {
                                select: {
                                    id: true,
                                    name: true,
                                    address: true,
                                    phone: true,
                                },
                            },
                            parent: {
                                include: {
                                    user: {
                                        select: {
                                            fullName: true,
                                            email: true,
                                            phone: true,
                                        },
                                    },
                                },
                            },
                            attendances: {
                                include: {
                                    session: {
                                        select: {
                                            id: true,
                                            sessionDate: true,
                                            startTime: true,
                                            endTime: true,
                                            status: true,
                                        },
                                    },
                                },
                                orderBy: {
                                    recordedAt: 'desc',
                                },
                                take: 10,
                            },
                            grades: {
                                include: {
                                    assessment: {
                                        select: {
                                            id: true,
                                            name: true,
                                            type: true,
                                            maxScore: true,
                                            date: true,
                                        },
                                    },
                                },
                                orderBy: {
                                    gradedAt: 'desc',
                                },
                                take: 10,
                            },
                        },
                    },
                    class: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            academicYear: true,
                            expectedStartDate: true,
                            actualStartDate: true,
                            actualEndDate: true,
                            grade: {
                                select: {
                                    id: true,
                                    name: true,
                                    level: true,
                                },
                            },
                            subject: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                    description: true,
                                },
                            },
                            teacher: {
                                include: {
                                    user: {
                                        select: {
                                            fullName: true,
                                            email: true,
                                            phone: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            if (!studentDetail) {
                return {
                    success: false,
                    message: 'Không tìm thấy học sinh trong lớp này',
                };
            }
            return {
                success: true,
                data: studentDetail,
                message: 'Lấy thông tin chi tiết học sinh thành công',
            };
        }
        catch (error) {
            throw new Error(`Lỗi khi lấy thông tin chi tiết học sinh: ${error.message}`);
        }
    }
    async getClassStatistics(classId, teacherId) {
        try {
            const [totalStudents, attendanceStats, gradeStats] = await Promise.all([
                this.prisma.enrollment.count({
                    where: {
                        classId: classId,
                        status: 'studying',
                        student: {
                            user: {
                                isActive: true,
                            },
                        },
                        class: {
                            status: 'active',
                            teacherId: teacherId,
                        },
                    },
                }),
                this.prisma.studentSessionAttendance.groupBy({
                    by: ['status'],
                    where: {
                        student: {
                            user: {
                                isActive: true,
                            },
                            enrollments: {
                                some: {
                                    classId: classId,
                                    status: 'studying',
                                    class: {
                                        status: 'active',
                                        teacherId: teacherId,
                                    },
                                },
                            },
                        },
                    },
                    _count: {
                        status: true,
                    },
                }),
                this.prisma.studentAssessmentGrade.aggregate({
                    where: {
                        student: {
                            user: {
                                isActive: true,
                            },
                            enrollments: {
                                some: {
                                    classId: classId,
                                    status: 'studying',
                                    class: {
                                        status: 'active',
                                        teacherId: teacherId,
                                    },
                                },
                            },
                        },
                    },
                    _avg: {
                        score: true,
                    },
                    _max: {
                        score: true,
                    },
                    _min: {
                        score: true,
                    },
                }),
            ]);
            return {
                success: true,
                data: {
                    totalStudents,
                    attendanceStats,
                    gradeStats,
                },
                message: `Lấy thống kê lớp học thành công - ${totalStudents} học sinh đang học`,
            };
        }
        catch (error) {
            throw new Error(`Lỗi khi lấy thống kê lớp học: ${error.message}`);
        }
    }
    async getTeacherInfo(teacherId) {
        try {
            if (!teacherId) {
                throw new Error('ID giáo viên không hợp lệ');
            }
            const teacher = await this.prisma.teacher.findUnique({
                where: { id: teacherId },
                include: {
                    user: {
                        select: {
                            fullName: true,
                            email: true,
                        },
                    },
                    classes: {
                        include: {
                            subject: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!teacher) {
                return {
                    success: false,
                    message: 'Không tìm thấy giáo viên',
                };
            }
            return {
                success: true,
                data: teacher,
                message: 'Lấy thông tin giáo viên thành công',
            };
        }
        catch (error) {
            throw new Error(`Lỗi khi lấy thông tin giáo viên: ${error.message}`);
        }
    }
};
exports.CommonService = CommonService;
exports.CommonService = CommonService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommonService);
//# sourceMappingURL=common.service.js.map