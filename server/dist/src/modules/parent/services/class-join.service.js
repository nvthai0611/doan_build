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
exports.ClassJoinService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_service_1 = require("../../cloudinary/cloudinary.service");
const prisma_service_1 = require("../../../db/prisma.service");
const alert_service_1 = require("../../admin-center/services/alert.service");
let ClassJoinService = class ClassJoinService {
    constructor(prisma, alertService, cloudinaryService) {
        this.prisma = prisma;
        this.alertService = alertService;
        this.cloudinaryService = cloudinaryService;
    }
    async getClassInfoByCodeOrLink(userId, dto) {
        const parent = await this.prisma.parent.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!parent) {
            throw new common_1.HttpException({ success: false, message: 'Không tìm thấy thông tin phụ huynh' }, common_1.HttpStatus.NOT_FOUND);
        }
        let classCode = null;
        let classId = null;
        const input = dto.codeOrLink.trim();
        const linkPattern = /\/classes\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i;
        const linkMatch = input.match(linkPattern);
        if (linkMatch) {
            classId = linkMatch[1];
        }
        else {
            classCode = input;
        }
        const whereCondition = {
            status: { in: ['ready', 'active'] },
        };
        if (classId) {
            whereCondition.id = classId;
        }
        else if (classCode) {
            whereCondition.classCode = classCode;
        }
        const classData = await this.prisma.class.findFirst({
            where: whereCondition,
            include: {
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
                                id: true,
                                fullName: true,
                                avatar: true,
                                phone: true,
                                email: true,
                            },
                        },
                    },
                },
                grade: {
                    select: {
                        id: true,
                        name: true,
                        level: true,
                    },
                },
                feeStructure: {
                    select: {
                        id: true,
                        name: true,
                        amount: true,
                        period: true,
                    },
                },
                _count: {
                    select: {
                        enrollments: {
                            where: {
                                status: { in: ['studying', 'not_been_updated'] },
                            },
                        },
                    },
                },
            },
        });
        if (!classData) {
            throw new common_1.HttpException({ success: false, message: 'Không tìm thấy lớp học hoặc lớp học không khả dụng' }, common_1.HttpStatus.NOT_FOUND);
        }
        let scheduleText = 'Chưa có lịch học';
        if (classData.recurringSchedule) {
            try {
                const schedule = classData.recurringSchedule;
                if (Array.isArray(schedule) && schedule.length > 0) {
                    const dayNames = {
                        monday: 'Thứ Hai',
                        tuesday: 'Thứ Ba',
                        wednesday: 'Thứ Tư',
                        thursday: 'Thứ Năm',
                        friday: 'Thứ Sáu',
                        saturday: 'Thứ Bảy',
                        sunday: 'Chủ Nhật',
                    };
                    scheduleText = schedule
                        .map((s) => `${dayNames[s.dayOfWeek] || s.dayOfWeek} ${s.startTime} → ${s.endTime}`)
                        .join(', ');
                }
            }
            catch (error) {
                console.error('Error parsing recurring schedule:', error);
            }
        }
        const classInfo = classData;
        const response = {
            id: classInfo.id,
            name: classInfo.name,
            classCode: classInfo.classCode,
            description: classInfo.description,
            status: classInfo.status,
            requirePassword: !!classInfo.password,
            subject: classInfo.subject
                ? {
                    id: classInfo.subject.id,
                    name: classInfo.subject.name,
                    code: classInfo.subject.code,
                }
                : null,
            grade: classInfo.grade
                ? {
                    id: classInfo.grade.id,
                    name: classInfo.grade.name,
                    level: classInfo.grade.level,
                }
                : null,
            teacher: classInfo.teacher
                ? {
                    id: classInfo.teacher.id,
                    userId: classInfo.teacher.userId,
                    fullName: classInfo.teacher.user?.fullName || 'Chưa có tên',
                    avatar: classInfo.teacher.user?.avatar,
                    phone: classInfo.teacher.user?.phone,
                    email: classInfo.teacher.user?.email,
                }
                : null,
            expectedStartDate: classInfo.expectedStartDate?.toISOString().split('T')[0],
            actualStartDate: classInfo.actualStartDate?.toISOString().split('T')[0],
            actualEndDate: classInfo.actualEndDate?.toISOString().split('T')[0],
            maxStudents: classInfo.maxStudents,
            currentStudents: classInfo._count.enrollments,
            recurringSchedule: classInfo.recurringSchedule,
            scheduleText: scheduleText,
            feeStructure: classInfo.feeStructure
                ? {
                    id: classInfo.feeStructure.id,
                    name: classInfo.feeStructure.name,
                    amount: Number(classInfo.feeStructure.amount),
                    period: classInfo.feeStructure.period,
                }
                : null,
            feeAmount: classInfo.feeAmount ? Number(classInfo.feeAmount) : null,
            feePeriod: classInfo.feePeriod,
            feeCurrency: classInfo.feeCurrency,
            academicYear: classInfo.academicYear,
        };
        return {
            success: true,
            data: response,
            message: 'Lấy thông tin lớp học thành công',
        };
    }
    async requestJoinClass(userId, dto, file) {
        const parent = await this.prisma.parent.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!parent) {
            throw new common_1.HttpException({ success: false, message: 'Không tìm thấy thông tin phụ huynh' }, common_1.HttpStatus.NOT_FOUND);
        }
        const student = await this.prisma.student.findFirst({
            where: {
                id: dto.studentId,
                parentId: parent.id,
            },
            select: {
                id: true,
                user: {
                    select: {
                        fullName: true,
                    },
                },
            },
        });
        if (!student) {
            throw new common_1.HttpException({ success: false, message: 'Không tìm thấy học sinh hoặc học sinh không thuộc quyền quản lý của bạn' }, common_1.HttpStatus.NOT_FOUND);
        }
        const classData = await this.prisma.class.findFirst({
            where: {
                id: dto.classId,
                status: { in: ['ready', 'active'] },
            },
            include: {
                _count: {
                    select: {
                        enrollments: {
                            where: {
                                status: { in: ['studying', 'not_been_updated'] },
                            },
                        },
                    },
                },
            },
        });
        if (!classData) {
            throw new common_1.HttpException({ success: false, message: 'Không tìm thấy lớp học hoặc lớp học không khả dụng' }, common_1.HttpStatus.NOT_FOUND);
        }
        if (classData.password) {
            if (!dto.password) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Lớp học này yêu cầu mật khẩu',
                    requirePassword: true,
                }, common_1.HttpStatus.UNAUTHORIZED);
            }
            if (classData.password !== dto.password) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Mật khẩu không chính xác',
                    requirePassword: true,
                }, common_1.HttpStatus.UNAUTHORIZED);
            }
        }
        if (classData.maxStudents && classData._count.enrollments >= classData.maxStudents) {
            throw new common_1.HttpException({ success: false, message: 'Lớp học đã đầy, không thể gửi yêu cầu tham gia' }, common_1.HttpStatus.BAD_REQUEST);
        }
        if (!dto.contractUploadId) {
            throw new common_1.HttpException({ success: false, message: 'Vui lòng chọn hợp đồng cam kết học tập' }, common_1.HttpStatus.BAD_REQUEST);
        }
        const contractUpload = await this.prisma.contractUpload.findUnique({
            where: { id: dto.contractUploadId },
            include: {
                student: {
                    select: {
                        id: true,
                        parentId: true,
                    },
                },
            },
        });
        if (!contractUpload) {
            throw new common_1.HttpException({ success: false, message: 'Không tìm thấy hợp đồng cam kết' }, common_1.HttpStatus.NOT_FOUND);
        }
        if (contractUpload.studentId !== dto.studentId) {
            throw new common_1.HttpException({ success: false, message: 'Hợp đồng không thuộc về học sinh này' }, common_1.HttpStatus.BAD_REQUEST);
        }
        if (contractUpload.student?.parentId !== parent.id) {
            throw new common_1.HttpException({ success: false, message: 'Bạn không có quyền sử dụng hợp đồng này' }, common_1.HttpStatus.FORBIDDEN);
        }
        const classSubject = await this.prisma.class.findUnique({
            where: { id: dto.classId },
            select: {
                subjectId: true,
            },
        });
        if (!classSubject?.subjectId) {
            throw new common_1.HttpException({ success: false, message: 'Lớp học không có môn học' }, common_1.HttpStatus.BAD_REQUEST);
        }
        if (!contractUpload.subjectIds || !contractUpload.subjectIds.includes(classSubject.subjectId)) {
            throw new common_1.HttpException({ success: false, message: 'Hợp đồng cam kết không bao gồm môn học của lớp này' }, common_1.HttpStatus.BAD_REQUEST);
        }
        const now = new Date();
        if (contractUpload.expiredAt && contractUpload.expiredAt < now) {
            throw new common_1.HttpException({ success: false, message: 'Hợp đồng cam kết đã hết hạn. Vui lòng upload hợp đồng mới' }, common_1.HttpStatus.BAD_REQUEST);
        }
        const existingEnrollment = await this.prisma.enrollment.findFirst({
            where: {
                studentId: dto.studentId,
                classId: dto.classId,
                status: { in: ['studying', 'not_been_updated'] },
            },
        });
        if (existingEnrollment) {
            throw new common_1.HttpException({ success: false, message: 'Học sinh đã đăng ký lớp học này rồi' }, common_1.HttpStatus.BAD_REQUEST);
        }
        const existingRequest = await this.prisma.studentClassRequest.findFirst({
            where: {
                studentId: dto.studentId,
                classId: dto.classId,
                status: 'pending',
            },
        });
        if (existingRequest) {
            throw new common_1.HttpException({ success: false, message: 'Đã có yêu cầu tham gia đang chờ xử lý' }, common_1.HttpStatus.BAD_REQUEST);
        }
        const request = await this.prisma.studentClassRequest.create({
            data: {
                studentId: dto.studentId,
                classId: dto.classId,
                message: dto.message || `Phụ huynh đăng ký lớp học cho ${student.user.fullName}`,
                contractUploadId: dto.contractUploadId,
                commitmentImageUrl: contractUpload.uploadedImageUrl,
                status: 'pending',
            },
            include: {
                student: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                email: true,
                            },
                        },
                    },
                },
                class: {
                    include: {
                        subject: true,
                        teacher: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
            },
        });
        try {
            await this.alertService.createStudentClassRequestAlert({
                id: request.id,
                studentId: request.student.id,
                studentName: request.student.user.fullName,
                classId: request.class.id,
                className: request.class.name,
                subjectName: request.class.subject?.name || 'N/A',
                teacherId: request.class.teacher?.id,
                teacherName: request.class.teacher?.user?.fullName,
            });
        }
        catch (error) {
            console.error('Failed to create alert for student class request:', error);
        }
        return {
            success: true,
            data: {
                id: request.id,
                studentId: request.studentId,
                classId: request.classId,
                message: request.message,
                status: request.status,
                createdAt: request.createdAt.toISOString(),
                student: {
                    id: request.student.id,
                    fullName: request.student.user.fullName,
                    email: request.student.user.email,
                },
                class: {
                    id: request.class.id,
                    name: request.class.name,
                    subject: request.class.subject?.name,
                },
            },
            message: 'Gửi yêu cầu tham gia lớp học thành công. Vui lòng đợi giáo viên/quản lý phê duyệt.',
        };
    }
    async getMyClassRequests(userId, filters) {
        const parent = await this.prisma.parent.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!parent) {
            throw new common_1.HttpException({ success: false, message: 'Không tìm thấy thông tin phụ huynh' }, common_1.HttpStatus.NOT_FOUND);
        }
        const students = await this.prisma.student.findMany({
            where: { parentId: parent.id },
            select: { id: true },
        });
        const studentIds = students.map((s) => s.id);
        if (studentIds.length === 0) {
            return {
                success: true,
                data: [],
                message: 'Không có yêu cầu nào',
                meta: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0,
                },
            };
        }
        const page = Math.max(1, filters?.page || 1);
        const limit = Math.max(1, Math.min(100, filters?.limit || 10));
        const skip = (page - 1) * limit;
        const where = {
            studentId: { in: studentIds },
        };
        if (filters?.status) {
            where.status = filters.status;
        }
        const [requests, total] = await Promise.all([
            this.prisma.studentClassRequest.findMany({
                where,
                skip,
                take: limit,
                include: {
                    student: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                    class: {
                        include: {
                            subject: true,
                            teacher: {
                                include: {
                                    user: {
                                        select: {
                                            fullName: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.studentClassRequest.count({ where }),
        ]);
        const data = requests.map((req) => ({
            id: req.id,
            studentId: req.studentId,
            classId: req.classId,
            message: req.message,
            status: req.status,
            createdAt: req.createdAt.toISOString(),
            processedAt: req.processedAt?.toISOString(),
            student: {
                id: req.student.id,
                fullName: req.student.user.fullName,
                avatar: req.student.user.avatar,
            },
            class: {
                id: req.class.id,
                name: req.class.name,
                classCode: req.class.classCode,
                subject: req.class.subject?.name,
                teacher: req.class.teacher?.user?.fullName || 'Chưa có giáo viên',
            },
        }));
        return {
            success: true,
            data,
            message: 'Lấy danh sách yêu cầu thành công',
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
};
exports.ClassJoinService = ClassJoinService;
exports.ClassJoinService = ClassJoinService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        alert_service_1.AlertService,
        cloudinary_service_1.CloudinaryService])
], ClassJoinService);
//# sourceMappingURL=class-join.service.js.map