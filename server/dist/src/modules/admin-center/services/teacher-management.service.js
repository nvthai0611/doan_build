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
exports.TeacherManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
const constants_1 = require("../../../common/constants");
const cloudinary_service_1 = require("../../cloudinary/cloudinary.service");
const function_util_1 = require("../../../utils/function.util");
const hasing_util_1 = require("../../../utils/hasing.util");
const email_notification_service_1 = require("../../shared/services/email-notification.service");
let TeacherManagementService = class TeacherManagementService {
    constructor(prisma, cloudinaryService, emailNotificationService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
        this.emailNotificationService = emailNotificationService;
    }
    async createTeacher(createTeacherDto) {
        return await this.prisma.$transaction(async (prisma) => {
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: createTeacherDto.email },
                        { username: createTeacherDto.username },
                    ],
                },
            });
            if (existingUser) {
                throw new common_1.BadRequestException('Email hoặc username đã tồn tại');
            }
            const passwordData = await hasing_util_1.default.generateRandomPassword();
            const defaultPassword = passwordData.rawPassword;
            const hashedPassword = passwordData.hashedPassword;
            let schoolId = null;
            if (createTeacherDto.schoolName) {
                let school = await prisma.school.findFirst({
                    where: {
                        name: createTeacherDto.schoolName,
                        address: createTeacherDto.schoolAddress || undefined,
                    },
                });
                if (!school) {
                    school = await prisma.school.create({
                        data: {
                            name: createTeacherDto.schoolName,
                            address: createTeacherDto.schoolAddress || null,
                            phone: null,
                        },
                    });
                }
                schoolId = school.id;
            }
            const user = await prisma.user.create({
                data: {
                    email: createTeacherDto.email,
                    password: hashedPassword,
                    fullName: createTeacherDto.fullName,
                    username: createTeacherDto.username,
                    phone: createTeacherDto.phone,
                    role: createTeacherDto.role,
                    isActive: createTeacherDto.isActive ?? true,
                    gender: createTeacherDto.gender,
                    birthDate: createTeacherDto.birthDate
                        ? this.parseDateString(createTeacherDto.birthDate)
                        : null,
                },
            });
            let teacherCode;
            let isUnique = false;
            let attempts = 0;
            const maxAttempts = 10;
            while (!isUnique && attempts < maxAttempts) {
                teacherCode = (0, function_util_1.generateQNCode)('teacher');
                const existingTeacher = await prisma.teacher.findUnique({
                    where: { teacherCode },
                });
                if (!existingTeacher) {
                    isUnique = true;
                }
                attempts++;
            }
            if (!isUnique) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Không thể tạo mã giáo viên duy nhất sau nhiều lần thử',
                }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            const teacher = await prisma.teacher.create({
                data: {
                    userId: user.id,
                    schoolId: schoolId,
                    teacherCode: teacherCode,
                    subjects: createTeacherDto.subjects,
                },
                include: {
                    user: true,
                    school: true,
                },
            });
            if (createTeacherDto.contractImage) {
                try {
                    const uploadResult = await this.cloudinaryService.uploadImage(createTeacherDto.contractImage, 'teachers');
                    await prisma.contractUpload.create({
                        data: {
                            teacherId: teacher.id,
                            contractType: 'teacher_contract',
                            uploadedImageUrl: uploadResult.secure_url,
                            uploadedImageName: createTeacherDto.contractImage.originalname,
                        },
                    });
                }
                catch (error) {
                    await prisma.contractUpload.create({
                        data: {
                            teacherId: teacher.id,
                            contractType: 'teacher_contract',
                            uploadedImageUrl: createTeacherDto.contractImage.filename || 'temp-filename',
                            uploadedImageName: createTeacherDto.contractImage.originalname,
                        },
                    });
                }
            }
            try {
                await this.emailNotificationService.sendTeacherAccountEmail(teacher.id, user.fullName, user.username, user.email, defaultPassword, teacherCode);
            }
            catch (emailError) {
            }
            return this.formatTeacherResponse(teacher);
        });
    }
    async findAllTeachers(queryDto) {
        const { search, role, status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', gender, birthYear, subject, } = queryDto;
        const pageNum = parseInt(page.toString());
        const limitNum = parseInt(limit.toString());
        const skip = (pageNum - 1) * limitNum;
        const where = { AND: [] };
        const userWhere = {};
        if (role) {
            userWhere.role = role;
        }
        if (status && status !== 'all') {
            userWhere.isActive = status === 'active';
        }
        if (gender) {
            userWhere.gender = gender;
        }
        if (birthYear) {
            const year = parseInt(birthYear);
            if (!isNaN(year)) {
                userWhere.birthDate = {
                    gte: new Date(year, 0, 1),
                    lt: new Date(year + 1, 0, 1),
                };
            }
        }
        if (Object.keys(userWhere).length > 0) {
            where.AND.push({ user: userWhere });
        }
        if (subject) {
            where.AND.push({
                subjects: {
                    has: subject,
                },
            });
        }
        if (search) {
            where.AND.push({
                OR: [
                    {
                        user: {
                            OR: [
                                { fullName: { contains: search, mode: 'insensitive' } },
                                { email: { contains: search, mode: 'insensitive' } },
                                { username: { contains: search, mode: 'insensitive' } },
                                { phone: { contains: search, mode: 'insensitive' } },
                            ],
                        },
                    },
                    { teacherCode: { contains: search, mode: 'insensitive' } },
                ],
            });
        }
        if (where.AND.length === 0) {
            delete where.AND;
        }
        const total = await this.prisma.teacher.count({ where });
        const totalPages = Math.ceil(total / limitNum);
        let orderBy = {};
        const fieldMapping = {
            name: 'fullName',
            email: 'email',
            phone: 'phone',
            username: 'username',
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
        };
        const mappedSortBy = fieldMapping[sortBy] || sortBy;
        if (['fullName', 'email', 'phone', 'username'].includes(mappedSortBy)) {
            orderBy = {
                user: {
                    [mappedSortBy]: sortOrder,
                },
            };
        }
        else {
            orderBy = {
                [mappedSortBy]: sortOrder,
            };
        }
        const teachers = await this.prisma.teacher.findMany({
            where,
            include: {
                user: true,
            },
            orderBy,
            skip,
            take: limitNum,
        });
        return {
            data: teachers.map((teacher) => this.formatTeacherResponse(teacher)),
            meta: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages,
            },
            message: 'Lấy danh sách giáo viên thành công',
        };
    }
    async findOneTeacher(id) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { id },
            include: {
                user: true,
                school: true,
                contractUploads: {
                    orderBy: {
                        uploadedAt: 'desc',
                    },
                },
                classes: {
                    include: {
                        subject: true,
                        grade: true,
                        room: true,
                    },
                },
            },
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Không tìm thấy giáo viên');
        }
        return this.formatTeacherResponse(teacher);
    }
    async updateTeacher(id, updateTeacherDto) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { id },
            include: { user: true },
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Không tìm thấy giáo viên');
        }
        if (updateTeacherDto.email || updateTeacherDto.username) {
            const existingUser = await this.prisma.user.findFirst({
                where: {
                    AND: [
                        { id: { not: teacher.userId } },
                        {
                            OR: [
                                updateTeacherDto.email ? { email: updateTeacherDto.email } : {},
                                updateTeacherDto.username
                                    ? { username: updateTeacherDto.username }
                                    : {},
                            ].filter((condition) => Object.keys(condition).length > 0),
                        },
                    ],
                },
            });
            if (existingUser) {
                throw new common_1.BadRequestException('Email hoặc username đã tồn tại');
            }
        }
        const userUpdateData = {};
        if (updateTeacherDto.email)
            userUpdateData.email = updateTeacherDto.email;
        if (updateTeacherDto.fullName)
            userUpdateData.fullName = updateTeacherDto.fullName;
        if (updateTeacherDto.username)
            userUpdateData.username = updateTeacherDto.username;
        if (updateTeacherDto.phone)
            userUpdateData.phone = updateTeacherDto.phone;
        if (updateTeacherDto.isActive !== undefined)
            userUpdateData.isActive = updateTeacherDto.isActive;
        if (Object.keys(userUpdateData).length > 0) {
            await this.prisma.user.update({
                where: { id: teacher.userId },
                data: userUpdateData,
            });
        }
        const teacherUpdateData = {};
        if (updateTeacherDto.contractEnd)
            teacherUpdateData.contractEnd = new Date(updateTeacherDto.contractEnd);
        if (updateTeacherDto.schoolName) {
            let school = await this.prisma.school.findFirst({
                where: { name: updateTeacherDto.schoolName },
            });
            if (!school) {
                school = await this.prisma.school.create({
                    data: {
                        name: updateTeacherDto.schoolName,
                        address: updateTeacherDto.schoolAddress || null,
                    },
                });
            }
            teacherUpdateData.schoolId = school.id;
        }
        if (updateTeacherDto.subjects)
            teacherUpdateData.subjects = updateTeacherDto.subjects;
        if (Object.keys(teacherUpdateData).length > 0) {
            await this.prisma.teacher.update({
                where: { id },
                data: teacherUpdateData,
            });
        }
        if (updateTeacherDto.contractImage) {
            try {
                const cloudinaryResult = await this.cloudinaryService.uploadImage(updateTeacherDto.contractImage, 'teachers');
                await this.prisma.contractUpload.create({
                    data: {
                        teacherId: id,
                        contractType: 'teacher_contract',
                        uploadedImageUrl: cloudinaryResult.secure_url,
                        uploadedImageName: updateTeacherDto.contractImage.originalname,
                    },
                });
            }
            catch (uploadError) {
                throw new common_1.BadRequestException('Không thể upload ảnh hợp đồng');
            }
        }
        return this.findOneTeacher(id);
    }
    async removeTeacher(id) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { id },
            include: { user: true },
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Không tìm thấy giáo viên');
        }
        await this.prisma.teacher.delete({
            where: { id },
        });
        return { message: 'Xóa giáo viên thành công' };
    }
    async toggleTeacherStatus(id) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { id },
            include: { user: true },
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Không tìm thấy giáo viên');
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: teacher.userId },
            data: { isActive: !teacher.user.isActive },
        });
        return this.formatTeacherResponse({ ...teacher, user: updatedUser });
    }
    async getTeacherSchedule(id, year, month) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { id },
            include: {
                user: true,
                classes: {
                    include: {
                        room: true,
                        subject: true,
                        sessions: {
                            where: year && month
                                ? {
                                    sessionDate: {
                                        gte: new Date(year, month - 1, 1),
                                        lt: new Date(year, month, 1),
                                    },
                                }
                                : undefined,
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
                                substituteTeacher: {
                                    include: {
                                        user: {
                                            select: {
                                                fullName: true,
                                            },
                                        },
                                    },
                                },
                                attendances: {
                                    include: {
                                        student: {
                                            include: {
                                                user: true,
                                            },
                                        },
                                    },
                                },
                            },
                            orderBy: {
                                sessionDate: 'asc',
                            },
                        },
                    },
                },
            },
        });
        if (!teacher) {
            throw new Error('Teacher not found');
        }
        const dateFilter = year && month
            ? {
                sessionDate: {
                    gte: new Date(year, month - 1, 1),
                    lt: new Date(year, month, 1),
                },
            }
            : undefined;
        const substituteSessions = await this.prisma.classSession.findMany({
            where: {
                substituteTeacherId: id,
                substituteEndDate: {
                    gte: new Date(),
                },
                ...(dateFilter ? dateFilter : {}),
            },
            include: {
                class: {
                    include: {
                        room: true,
                        subject: true,
                    },
                },
                teacher: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                            },
                        },
                    },
                },
                substituteTeacher: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                            },
                        },
                    },
                },
                attendances: {
                    include: {
                        student: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                sessionDate: 'asc',
            },
        });
        const mainSessions = teacher.classes.flatMap((cls) => cls.sessions
            .filter((session) => {
            const isSubstitute = session.substituteTeacherId &&
                session.substituteEndDate &&
                new Date(session.substituteEndDate) >= session.sessionDate;
            if (isSubstitute && session.substituteTeacherId !== id) {
                return false;
            }
            return true;
        })
            .map((session) => {
            const isSubstitute = session.substituteTeacherId &&
                session.substituteEndDate &&
                new Date(session.substituteEndDate) >= session.sessionDate &&
                session.substituteTeacherId === id;
            const currentTeacher = isSubstitute ? session.substituteTeacher : session.teacher;
            const teacherName = currentTeacher?.user?.fullName || teacher.user.fullName || 'Chưa xác định';
            const originalTeacherName = session.teacher?.user?.fullName || teacher.user.fullName || 'Chưa xác định';
            const substituteTeacherName = session.substituteTeacher?.user?.fullName || null;
            return {
                id: session.id,
                classId: cls.id,
                date: session.sessionDate,
                title: `Buổi ${cls.name}`,
                time: `${session.startTime}-${session.endTime}`,
                subject: cls.subject.name,
                class: cls.name,
                room: cls.room?.name || 'Chưa xác định',
                hasAlert: this.checkSessionAlerts(session),
                status: session.status,
                teacher: teacherName,
                originalTeacher: originalTeacherName,
                substituteTeacher: substituteTeacherName,
                isSubstitute: isSubstitute,
                students: session.attendances.map((attendance) => ({
                    id: attendance.student.id,
                    name: attendance.student.user.fullName || 'Chưa xác định',
                    avatar: undefined,
                    status: this.mapAttendanceStatus(attendance.status),
                })),
                attendanceWarnings: this.generateAttendanceWarnings(session),
                description: session.notes || 'Phương học: Chưa cập nhật',
                materials: [],
                cancellationReason: session.cancellationReason,
            };
        }));
        const substituteSessionsFormatted = substituteSessions.map((session) => {
            const originalTeacherName = session.teacher?.user?.fullName || 'Chưa xác định';
            const substituteTeacherName = session.substituteTeacher?.user?.fullName || teacher.user.fullName || 'Chưa xác định';
            return {
                id: session.id,
                classId: session.classId,
                date: session.sessionDate,
                title: `Buổi ${session.class.name}`,
                time: `${session.startTime}-${session.endTime}`,
                subject: session.class.subject.name,
                class: session.class.name,
                room: session.class.room?.name || 'Chưa xác định',
                hasAlert: this.checkSessionAlerts(session),
                status: session.status,
                teacher: substituteTeacherName,
                originalTeacher: originalTeacherName,
                substituteTeacher: substituteTeacherName,
                isSubstitute: true,
                students: session.attendances.map((attendance) => ({
                    id: attendance.student.id,
                    name: attendance.student.user.fullName || 'Chưa xác định',
                    avatar: undefined,
                    status: this.mapAttendanceStatus(attendance.status),
                })),
                attendanceWarnings: this.generateAttendanceWarnings(session),
                description: session.notes || 'Phương học: Chưa cập nhật',
                materials: [],
                cancellationReason: session.cancellationReason,
            };
        });
        const allSessions = [...mainSessions, ...substituteSessionsFormatted];
        const uniqueSessions = allSessions.filter((session, index, self) => index === self.findIndex((s) => s.id === session.id));
        return {
            teacher: {
                id: teacher.id,
                name: teacher.user.fullName,
                email: teacher.user.email,
            },
            sessions: uniqueSessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        };
    }
    checkSessionAlerts(session) {
        const now = new Date();
        const sessionDate = new Date(session.sessionDate);
        const sessionTime = session.startTime.split(':');
        const sessionDateTime = new Date(sessionDate);
        sessionDateTime.setHours(parseInt(sessionTime[0]), parseInt(sessionTime[1]));
        if (sessionDateTime < now && session.status === 'scheduled') {
            return true;
        }
        const absentStudents = session.attendances.filter((att) => att.status === 'absent').length;
        if (absentStudents > 0) {
            return true;
        }
        return false;
    }
    mapAttendanceStatus(status) {
        switch (status) {
            case 'present':
                return 'present';
            case 'absent':
                return 'absent';
            case 'excused':
                return 'excused';
            default:
                return 'absent';
        }
    }
    generateAttendanceWarnings(session) {
        const warnings = [];
        const totalStudents = session.attendances.length;
        const presentStudents = session.attendances.filter((att) => att.status === 'present').length;
        const absentStudents = session.attendances.filter((att) => att.status === 'absent').length;
        const excusedStudents = session.attendances.filter((att) => att.status === 'excused').length;
        if (absentStudents > 0) {
            warnings.push(`*Có ${absentStudents} học viên vắng mặt*`);
        }
        if (excusedStudents > 0) {
            warnings.push(`*Có ${excusedStudents} học viên có phép*`);
        }
        if (totalStudents === 0) {
            warnings.push('*Chưa có học viên nào điểm danh buổi học này*');
        }
        return warnings;
    }
    formatTeacherResponse(teacher) {
        return {
            id: teacher.id,
            name: teacher.user.fullName,
            email: teacher.user.email,
            phone: teacher.user.phone,
            username: teacher.user.username,
            code: teacher.teacherCode,
            avatar: teacher.user.avatar || null,
            role: this.mapRoleToVietnamese(teacher.user.role),
            gender: teacher.user.gender === constants_1.Gender.MALE
                ? 'Nam'
                : teacher.user.gender === constants_1.Gender.FEMALE
                    ? 'Nữ'
                    : 'Khác',
            birthDate: teacher.user.birthDate
                ? this.formatDate(teacher.user.birthDate)
                : undefined,
            status: teacher.user.isActive,
            schoolName: teacher.school?.name,
            schoolAddress: teacher.school?.address,
            school: teacher.school
                ? {
                    id: teacher.school.id,
                    name: teacher.school.name,
                    address: teacher.school.address,
                }
                : null,
            contractUploads: teacher.contractUploads || [],
            subjects: teacher.subjects || [],
            notes: teacher.notes,
            createdAt: teacher.createdAt,
            updatedAt: teacher.updatedAt,
        };
    }
    mapRoleToVietnamese(role) {
        const roleMap = {
            teacher: 'Giáo viên',
            center_owner: 'Chủ trung tâm',
        };
        return roleMap[role] || 'Giáo viên';
    }
    formatDate(date) {
        return date.toLocaleDateString('vi-VN');
    }
    async validateTeachersData(teachersData) {
        const results = {
            successCount: 0,
            errorCount: 0,
            errors: [],
            warnings: [],
        };
        for (let i = 0; i < teachersData.length; i++) {
            const teacherData = teachersData[i];
            const rowNumber = i + 2;
            try {
                if (!teacherData.email || !teacherData.name || !teacherData.username) {
                    results.errors.push({
                        row: rowNumber,
                        field: 'required',
                        message: 'Thiếu thông tin bắt buộc: email, name, username',
                        value: '',
                    });
                    results.errorCount++;
                    continue;
                }
                const existingUser = await this.prisma.user.findFirst({
                    where: {
                        OR: [
                            { email: teacherData.email },
                            { username: teacherData.username },
                            { phone: teacherData.phone },
                        ],
                    },
                });
                if (existingUser) {
                    results.errors.push({
                        row: rowNumber,
                        field: 'duplicate',
                        message: 'Email hoặc username đã tồn tại',
                        value: `${teacherData.email} / ${teacherData.username}`,
                    });
                    results.errorCount++;
                    continue;
                }
                results.successCount++;
            }
            catch (error) {
                results.errors.push({
                    row: rowNumber,
                    field: 'general',
                    message: error.message || 'Lỗi không xác định',
                    value: '',
                });
                results.errorCount++;
            }
        }
        return {
            ...results,
            message: results.errorCount === 0
                ? `Validation thành công: ${results.successCount} giáo viên hợp lệ`
                : `Validation thất bại: ${results.errorCount} lỗi`,
        };
    }
    parseDateString(dateStr) {
        const ddMMyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        if (ddMMyyyyRegex.test(dateStr)) {
            const [, day, month, year] = dateStr.match(ddMMyyyyRegex);
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        const yyyyMMddRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
        if (yyyyMMddRegex.test(dateStr)) {
            const [, year, month, day] = dateStr.match(yyyyMMddRegex);
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        return new Date(dateStr);
    }
    async bulkImportTeachers(teachersData) {
        const results = {
            successCount: 0,
            errorCount: 0,
            errors: [],
            warnings: [],
        };
        for (let i = 0; i < teachersData.length; i++) {
            const teacherData = teachersData[i];
            const rowNumber = i + 1;
            try {
                if (!teacherData.email || !teacherData.name || !teacherData.username) {
                    results.errors.push({
                        row: rowNumber,
                        field: 'required',
                        message: 'Thiếu thông tin bắt buộc: email, name, username',
                        value: JSON.stringify(teacherData),
                    });
                    results.errorCount++;
                    continue;
                }
                const existingUser = await this.prisma.user.findFirst({
                    where: {
                        OR: [
                            { email: teacherData.email },
                            { username: teacherData.username },
                        ],
                    },
                });
                if (existingUser) {
                    results.errors.push({
                        row: rowNumber,
                        field: 'duplicate',
                        message: 'Email hoặc username đã tồn tại',
                        value: `${teacherData.email} / ${teacherData.username}`,
                    });
                    results.errorCount++;
                    continue;
                }
                await this.createTeacher({
                    email: teacherData.email,
                    fullName: teacherData.name,
                    username: teacherData.username,
                    phone: teacherData.phone || '',
                    role: teacherData.role || 'teacher',
                    isActive: true,
                    gender: teacherData.gender === 'MALE'
                        ? constants_1.Gender.MALE
                        : teacherData.gender === 'FEMALE'
                            ? constants_1.Gender.FEMALE
                            : constants_1.Gender.OTHER,
                    birthDate: teacherData.birthDate || null,
                    schoolName: teacherData.schoolName,
                    schoolAddress: teacherData.schoolAddress,
                    notes: teacherData.notes,
                });
                results.successCount++;
                if (!teacherData.schoolName) {
                    results.warnings.push({
                        row: rowNumber,
                        field: 'schoolName',
                        message: 'Không có thông tin trường học',
                        value: '',
                    });
                }
            }
            catch (error) {
                results.errors.push({
                    row: rowNumber,
                    field: 'general',
                    message: error.message || 'Lỗi không xác định',
                    value: JSON.stringify(teacherData),
                });
                results.errorCount++;
            }
        }
        return {
            ...results,
            message: `Import hoàn thành: ${results.successCount} thành công, ${results.errorCount} lỗi`,
        };
    }
    async getTeacherContracts(teacherId) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { id: teacherId },
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Không tìm thấy giáo viên');
        }
        const contractUploads = await this.prisma.contractUpload.findMany({
            where: {
                teacherId: teacherId,
            },
            orderBy: {
                uploadedAt: 'desc',
            },
        });
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const contracts = contractUploads.map((u) => {
            let status = 'active';
            if (u.expiredAt) {
                if (u.expiredAt < now) {
                    status = 'expired';
                }
                else if (u.expiredAt <= thirtyDaysFromNow) {
                    status = 'expiring_soon';
                }
            }
            return {
                id: u.id,
                contractType: u.contractType,
                uploadedImageUrl: u.uploadedImageUrl,
                uploadedImageName: u.uploadedImageName,
                uploadedAt: u.uploadedAt,
                expiryDate: u.expiredAt,
                notes: u.note,
                status,
            };
        });
        return {
            contractUploads: contracts,
            message: 'Lấy danh sách hợp đồng thành công',
        };
    }
    async uploadContractForTeacher(teacherId, file, contractType, expiryDate, notes) {
        if (!file) {
            throw new common_1.BadRequestException('File là bắt buộc');
        }
        if (!expiryDate) {
            throw new common_1.BadRequestException('Ngày hết hạn là bắt buộc');
        }
        const teacher = await this.prisma.teacher.findUnique({
            where: { id: teacherId },
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Không tìm thấy giáo viên');
        }
        let uploadResult;
        try {
            uploadResult = await this.cloudinaryService.uploadDocument(file, `contracts/teacher/${teacherId}`);
        }
        catch (err) {
            uploadResult = {
                secure_url: `http://localhost:9999/uploads/mock-${file.originalname}`,
                public_id: `mock_${Date.now()}`,
            };
        }
        const expiredAt = new Date(expiryDate);
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        let status = 'active';
        if (expiredAt < now) {
            status = 'expired';
        }
        else if (expiredAt <= thirtyDaysFromNow) {
            status = 'expiring_soon';
        }
        const created = await this.prisma.contractUpload.create({
            data: {
                teacherId,
                contractType: contractType || 'other',
                uploadedImageUrl: uploadResult.secure_url,
                uploadedImageName: file.originalname,
                expiredAt,
                note: notes || null,
                status,
            },
        });
        return {
            success: true,
            data: {
                id: created.id,
                contractType: created.contractType,
                uploadedImageUrl: created.uploadedImageUrl,
                uploadedImageName: created.uploadedImageName,
                uploadedAt: created.uploadedAt,
                expiryDate: created.expiredAt,
                notes: created.note,
                status: created.status,
            },
            message: 'Tải lên hợp đồng thành công',
        };
    }
    async deleteTeacherContract(teacherId, contractId) {
        try {
            const teacher = await this.prisma.teacher.findUnique({
                where: { id: teacherId },
            });
            if (!teacher) {
                throw new common_1.NotFoundException('Không tìm thấy giáo viên');
            }
            const contract = await this.prisma.contractUpload.findFirst({
                where: {
                    id: contractId,
                    teacherId: teacherId,
                },
            });
            if (!contract) {
                throw new common_1.NotFoundException('Không tìm thấy hợp đồng hoặc hợp đồng không thuộc về giáo viên này');
            }
            await this.prisma.contractUpload.delete({
                where: {
                    id: contractId,
                },
            });
            return {
                success: true,
                message: 'Xóa hợp đồng thành công',
            };
        }
        catch (error) {
            throw error;
        }
    }
};
exports.TeacherManagementService = TeacherManagementService;
exports.TeacherManagementService = TeacherManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService,
        email_notification_service_1.EmailNotificationService])
], TeacherManagementService);
//# sourceMappingURL=teacher-management.service.js.map