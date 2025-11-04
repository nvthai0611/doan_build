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
const function_util_1 = require("../../../utils/function.util");
const hasing_util_1 = require("../../../utils/hasing.util");
const validate_util_1 = require("../../../utils/validate.util");
const cloudinary_service_1 = require("../../cloudinary/cloudinary.service");
const STUDENT_USER_SELECT = {
    id: true,
    email: true,
    fullName: true,
    phone: true,
    avatar: true,
    isActive: true,
    gender: true,
    birthDate: true,
    createdAt: true,
    updatedAt: true
};
const PARENT_INCLUDE = {
    user: {
        select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatar: true
        }
    }
};
const SCHOOL_SELECT = {
    id: true,
    name: true,
    address: true,
    phone: true
};
let StudentManagementService = class StudentManagementService {
    constructor(prisma, cloudinaryService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
    }
    formatStudentResponse(student) {
        return {
            id: student.id,
            studentCode: student.studentCode,
            address: student.address,
            grade: student.grade,
            createdAt: student.createdAt,
            updatedAt: student.updatedAt,
            user: student.user,
            parent: student.parent
                ? {
                    id: student.parent.id,
                    user: student.parent.user
                }
                : null,
            school: student.school
        };
    }
    async createStudent(createStudentData) {
        try {
            if (!(0, validate_util_1.checkId)(createStudentData.schoolId)) {
                throw new common_1.HttpException('Invalid school ID', common_1.HttpStatus.BAD_REQUEST);
            }
            const school = await this.prisma.school.findUnique({
                where: { id: createStudentData.schoolId }
            });
            if (!school) {
                throw new common_1.HttpException('Trường học không tồn tại', common_1.HttpStatus.NOT_FOUND);
            }
            const existingUser = await this.prisma.user.findUnique({
                where: { username: createStudentData.username }
            });
            if (existingUser) {
                throw new common_1.HttpException('Username đã được sử dụng', common_1.HttpStatus.CONFLICT);
            }
            if (createStudentData.parentId) {
                if (!(0, validate_util_1.checkId)(createStudentData.parentId)) {
                    throw new common_1.HttpException('Invalid parent ID', common_1.HttpStatus.BAD_REQUEST);
                }
                const parent = await this.prisma.parent.findUnique({
                    where: { id: createStudentData.parentId }
                });
                if (!parent) {
                    throw new common_1.HttpException('Phụ huynh không tồn tại', common_1.HttpStatus.NOT_FOUND);
                }
            }
            const studentCount = await this.prisma.student.count();
            let studentCode = (0, function_util_1.generateQNCode)('student');
            while (true) {
                const existingStudentWithCode = await this.prisma.student.findFirst({
                    where: { studentCode: studentCode }
                });
                if (!existingStudentWithCode) {
                    break;
                }
                studentCode = (0, function_util_1.generateQNCode)('student');
            }
            const defaultPassword = createStudentData.password || '123456';
            const newStudent = await this.prisma.$transaction(async (prisma) => {
                const newUser = await prisma.user.create({
                    data: {
                        email: `${createStudentData.username}@qne.edu.vn`,
                        username: createStudentData.username,
                        fullName: createStudentData.fullName,
                        phone: createStudentData.phone,
                        gender: createStudentData.gender || 'OTHER',
                        birthDate: createStudentData.birthDate
                            ? new Date(createStudentData.birthDate)
                            : null,
                        password: hasing_util_1.default.make(defaultPassword),
                        isActive: true,
                        role: 'student'
                    }
                });
                const student = await prisma.student.create({
                    data: {
                        userId: newUser.id,
                        studentCode,
                        address: createStudentData.address,
                        grade: createStudentData.grade,
                        parentId: createStudentData.parentId,
                        schoolId: createStudentData.schoolId
                    },
                    include: {
                        user: { select: STUDENT_USER_SELECT },
                        parent: { include: PARENT_INCLUDE },
                        school: { select: SCHOOL_SELECT }
                    }
                });
                if (createStudentData.applicationFile) {
                    const file = createStudentData.applicationFile;
                    const uploadResult = await this.cloudinaryService.uploadDocument(file, 'student-applications');
                    let subjectIds = [];
                    if (createStudentData.subjectIds) {
                        if (Array.isArray(createStudentData.subjectIds)) {
                            subjectIds = createStudentData.subjectIds;
                        }
                        else if (typeof createStudentData.subjectIds === 'string') {
                            try {
                                subjectIds = JSON.parse(createStudentData.subjectIds);
                            }
                            catch (e) {
                                subjectIds = [];
                            }
                        }
                    }
                    const now = new Date();
                    const nextYear = now.getFullYear() + 1;
                    const expiredAt = new Date(nextYear, 4, 31, 23, 59, 59);
                    await prisma.contractUpload.create({
                        data: {
                            studentId: student.id,
                            parentId: createStudentData.parentId || null,
                            contractType: 'student_commitment',
                            subjectIds: subjectIds,
                            uploadedImageUrl: uploadResult.secure_url,
                            uploadedImageName: file.originalname,
                            uploadedAt: new Date(),
                            expiredAt: expiredAt,
                            note: `Đơn xin học thêm cho học sinh ${student.user.fullName} (${studentCode})${subjectIds.length > 0 ? ` - ${subjectIds.length} môn học` : ''}`,
                            status: 'active'
                        }
                    });
                }
                return student;
            });
            return {
                data: this.formatStudentResponse(newStudent),
                message: 'Tạo tài khoản học viên thành công'
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            console.error('Error creating student:', error);
            throw new common_1.HttpException('Error creating student', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findParentByEmail(email) {
        try {
            if (!email?.trim()) {
                throw new common_1.HttpException('Email không được để trống', common_1.HttpStatus.BAD_REQUEST);
            }
            const parent = await this.prisma.parent.findFirst({
                where: {
                    user: {
                        email: email.trim().toLowerCase()
                    }
                },
                include: {
                    user: { select: STUDENT_USER_SELECT },
                    students: {
                        select: {
                            id: true,
                            studentCode: true,
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    email: true
                                }
                            }
                        }
                    }
                }
            });
            if (!parent) {
                return {
                    data: null,
                    message: 'Không tìm thấy phụ huynh với email này'
                };
            }
            return {
                data: {
                    id: parent.id,
                    user: parent.user,
                    students: parent.students,
                    createdAt: parent.createdAt,
                    updatedAt: parent.updatedAt
                },
                message: 'Tìm thấy thông tin phụ huynh'
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            console.error('Error finding parent by email:', error);
            throw new common_1.HttpException('Error finding parent', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAllStudents(status, search, birthMonth, birthYear, gender, accountStatus, customerConnection, course, page = 1, limit = 10) {
        try {
            const validPage = Math.max(1, Number(page) || 1);
            const validLimit = Math.max(1, Math.min(100, Number(limit) || 10));
            const offset = (validPage - 1) * validLimit;
            const where = {};
            if (status?.trim() && status !== 'all') {
                where.enrollments = {
                    some: {
                        status: status.trim()
                    }
                };
            }
            if (course?.trim() && course !== 'Tất cả khóa học' && course !== 'all') {
                where.enrollments = {
                    some: {
                        ...where.enrollments?.some,
                        class: {
                            subjectId: course.trim()
                        }
                    }
                };
            }
            if (birthMonth?.trim() && birthMonth !== 'all') {
                const monthNum = parseInt(birthMonth);
                if (monthNum >= 1 && monthNum <= 12) {
                    where.user = {
                        ...where.user,
                        AND: [
                            ...(where.user?.AND || []),
                            {
                                birthDate: {
                                    not: null
                                }
                            },
                            {
                                birthDate: {
                                    gte: new Date(2000, monthNum - 1, 1),
                                    lt: new Date(2000, monthNum, 1)
                                }
                            }
                        ]
                    };
                }
            }
            if (birthYear?.trim() && birthYear !== 'all') {
                const yearNum = parseInt(birthYear);
                if (yearNum >= 1900 && yearNum <= new Date().getFullYear()) {
                    where.user = {
                        ...where.user,
                        AND: [
                            ...(where.user?.AND || []),
                            {
                                birthDate: {
                                    gte: new Date(yearNum, 0, 1),
                                    lt: new Date(yearNum + 1, 0, 1)
                                }
                            }
                        ]
                    };
                }
            }
            if (gender?.trim() && gender !== 'all') {
                where.user = {
                    ...where.user,
                    gender: gender.trim()
                };
            }
            if (accountStatus?.trim() && accountStatus !== 'all') {
                const isActive = accountStatus === 'active';
                where.user = {
                    ...where.user,
                    isActive
                };
            }
            if (customerConnection?.trim() && customerConnection !== 'all') {
                where.parentId =
                    customerConnection === 'with_parent'
                        ? { not: null }
                        : null;
            }
            if (search?.trim()) {
                const searchTerm = search.trim();
                where.OR = [
                    {
                        user: {
                            fullName: {
                                contains: searchTerm,
                                mode: 'insensitive'
                            }
                        }
                    },
                    {
                        AND: [
                            {
                                user: {
                                    email: {
                                        not: null
                                    }
                                }
                            },
                            {
                                user: {
                                    email: {
                                        contains: searchTerm,
                                        mode: 'insensitive'
                                    }
                                }
                            }
                        ]
                    },
                    {
                        user: {
                            phone: {
                                contains: searchTerm,
                                mode: 'insensitive'
                            }
                        }
                    },
                    {
                        studentCode: {
                            contains: searchTerm,
                            mode: 'insensitive'
                        }
                    }
                ];
            }
            const [students, totalCount] = await Promise.all([
                this.prisma.student.findMany({
                    where,
                    include: {
                        user: { select: STUDENT_USER_SELECT },
                        parent: { include: PARENT_INCLUDE },
                        school: { select: SCHOOL_SELECT },
                        enrollments: {
                            include: {
                                class: {
                                    select: {
                                        id: true,
                                        name: true,
                                        status: true,
                                        subject: {
                                            select: {
                                                id: true,
                                                name: true,
                                                code: true
                                            }
                                        },
                                        teacher: {
                                            select: {
                                                id: true,
                                                user: {
                                                    select: {
                                                        id: true,
                                                        fullName: true,
                                                        email: true
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            orderBy: {
                                enrolledAt: 'desc'
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    skip: offset,
                    take: validLimit
                }),
                this.prisma.student.count({ where })
            ]);
            const formattedStudents = students.map((student) => {
                const formattedStudent = this.formatStudentResponse(student);
                return {
                    ...formattedStudent,
                    enrollments: student.enrollments?.map((enrollment) => ({
                        id: enrollment.id,
                        status: enrollment.status,
                        enrolledAt: enrollment.enrolledAt,
                        completedAt: enrollment.completedAt,
                        finalGrade: enrollment.finalGrade,
                        completionStatus: enrollment.completionStatus,
                        class: enrollment.class,
                        teacher: enrollment.class.teacher || null
                    })) || []
                };
            });
            const totalPages = Math.ceil(totalCount / validLimit);
            return {
                data: {
                    students: formattedStudents,
                    pagination: {
                        currentPage: validPage,
                        totalPages,
                        totalCount,
                        limit: validLimit,
                        hasNextPage: validPage < totalPages,
                        hasPrevPage: validPage > 1
                    }
                },
                message: 'Students retrieved successfully'
            };
        }
        catch (error) {
            console.error('Error fetching students:', error);
            throw new common_1.HttpException('Error fetching students', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCountByStatus() {
        try {
            const enrollmentCounts = await this.prisma.enrollment.groupBy({
                by: ['status'],
                _count: {
                    status: true
                }
            });
            const total = enrollmentCounts.reduce((sum, item) => (sum += item._count.status), 0);
            return {
                data: {
                    total,
                    counts: enrollmentCounts.reduce((acc, item) => {
                        acc[item.status] = item._count.status;
                        return acc;
                    }, {})
                },
                message: 'Student counts by status retrieved successfully'
            };
        }
        catch (error) {
            console.error('Error fetching student counts by status:', error);
            throw new common_1.HttpException('Error fetching student counts', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async toggleStudentStatus(studentId, currentUserId) {
        if (!(0, validate_util_1.checkId)(studentId)) {
            throw new common_1.HttpException('Invalid student ID', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const existingStudent = await this.prisma.student.findUnique({
                where: { id: studentId },
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            isActive: true
                        }
                    }
                }
            });
            if (!existingStudent) {
                throw new common_1.HttpException('Student not found', common_1.HttpStatus.NOT_FOUND);
            }
            const newStatus = !existingStudent.user.isActive;
            const updatedStudent = await this.prisma.student.update({
                where: { id: studentId },
                data: {
                    user: {
                        update: {
                            isActive: newStatus,
                            updatedAt: new Date()
                        }
                    },
                    updatedAt: new Date()
                },
                include: {
                    user: { select: STUDENT_USER_SELECT },
                    parent: { include: PARENT_INCLUDE },
                    school: { select: SCHOOL_SELECT }
                }
            });
            return {
                data: {
                    ...this.formatStudentResponse(updatedStudent),
                    previousStatus: existingStudent.user.isActive,
                    newStatus
                },
                message: `Student account has been ${newStatus ? 'activated' : 'deactivated'} successfully`
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            console.error('Error toggling student status:', error);
            throw new common_1.HttpException('Error updating student status', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateStudentStatus(studentId, isActive, currentUserId) {
        if (!(0, validate_util_1.checkId)(studentId)) {
            throw new common_1.HttpException('Invalid student ID', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const existingStudent = await this.prisma.student.findUnique({
                where: { id: studentId },
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            isActive: true
                        }
                    }
                }
            });
            if (!existingStudent) {
                throw new common_1.HttpException('Student not found', common_1.HttpStatus.NOT_FOUND);
            }
            const updatedStudent = await this.prisma.student.update({
                where: { id: studentId },
                data: {
                    user: {
                        update: {
                            isActive,
                            updatedAt: new Date()
                        }
                    },
                    updatedAt: new Date()
                },
                include: {
                    user: { select: STUDENT_USER_SELECT },
                    parent: { include: PARENT_INCLUDE },
                    school: { select: SCHOOL_SELECT }
                }
            });
            return {
                data: {
                    ...this.formatStudentResponse(updatedStudent),
                    previousStatus: existingStudent.user.isActive,
                    newStatus: isActive
                },
                message: `Student account has been ${isActive ? 'activated' : 'deactivated'} successfully`
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            console.error('Error updating student status:', error);
            throw new common_1.HttpException('Error updating student status', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateStudent(studentId, updateStudentData) {
        if (!(0, validate_util_1.checkId)(studentId)) {
            throw new common_1.HttpException('Invalid student ID', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const existingStudent = await this.prisma.student.findUnique({
                where: { id: studentId },
                include: { user: true }
            });
            if (!existingStudent) {
                throw new common_1.HttpException('Học viên không tồn tại', common_1.HttpStatus.NOT_FOUND);
            }
            if (updateStudentData.schoolId) {
                if (!(0, validate_util_1.checkId)(updateStudentData.schoolId)) {
                    throw new common_1.HttpException('Invalid school ID', common_1.HttpStatus.BAD_REQUEST);
                }
                const school = await this.prisma.school.findUnique({
                    where: { id: updateStudentData.schoolId }
                });
                if (!school) {
                    throw new common_1.HttpException('Trường học không tồn tại', common_1.HttpStatus.NOT_FOUND);
                }
            }
            const userUpdateData = {};
            if (updateStudentData.fullName !== undefined) {
                userUpdateData.fullName = updateStudentData.fullName;
            }
            if (updateStudentData.phone !== undefined) {
                userUpdateData.phone = updateStudentData.phone;
            }
            if (updateStudentData.gender !== undefined) {
                userUpdateData.gender = updateStudentData.gender;
            }
            if (updateStudentData.birthDate !== undefined) {
                userUpdateData.birthDate = updateStudentData.birthDate
                    ? new Date(updateStudentData.birthDate)
                    : null;
            }
            const studentUpdateData = {};
            if (updateStudentData.address !== undefined) {
                studentUpdateData.address = updateStudentData.address;
            }
            if (updateStudentData.grade !== undefined) {
                studentUpdateData.grade = updateStudentData.grade;
            }
            if (updateStudentData.schoolId !== undefined) {
                studentUpdateData.schoolId = updateStudentData.schoolId;
            }
            if (Object.keys(userUpdateData).length > 0) {
                userUpdateData.updatedAt = new Date();
                await this.prisma.user.update({
                    where: { id: existingStudent.userId },
                    data: userUpdateData
                });
            }
            if (Object.keys(studentUpdateData).length > 0) {
                studentUpdateData.updatedAt = new Date();
                await this.prisma.student.update({
                    where: { id: studentId },
                    data: studentUpdateData
                });
            }
            const updatedStudent = await this.prisma.student.findUnique({
                where: { id: studentId },
                include: {
                    user: { select: STUDENT_USER_SELECT },
                    parent: { include: PARENT_INCLUDE },
                    school: { select: SCHOOL_SELECT }
                }
            });
            return {
                data: this.formatStudentResponse(updatedStudent),
                message: 'Cập nhật thông tin học viên thành công'
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            console.error('Error updating student:', error);
            throw new common_1.HttpException('Error updating student', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateStudentParent(studentId, parentId) {
        if (!(0, validate_util_1.checkId)(studentId)) {
            throw new common_1.HttpException('Invalid student ID', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const existingStudent = await this.prisma.student.findUnique({
                where: { id: studentId },
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true
                        }
                    }
                }
            });
            if (!existingStudent) {
                throw new common_1.HttpException('Học viên không tồn tại', common_1.HttpStatus.NOT_FOUND);
            }
            if (parentId) {
                if (!(0, validate_util_1.checkId)(parentId)) {
                    throw new common_1.HttpException('Invalid parent ID', common_1.HttpStatus.BAD_REQUEST);
                }
                const parent = await this.prisma.parent.findUnique({
                    where: { id: parentId },
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true
                            }
                        }
                    }
                });
                if (!parent) {
                    throw new common_1.HttpException('Phụ huynh không tồn tại', common_1.HttpStatus.NOT_FOUND);
                }
                if (!parent.user) {
                    throw new common_1.HttpException('Tài khoản phụ huynh không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
                }
            }
            const updatedStudent = await this.prisma.student.update({
                where: { id: studentId },
                data: {
                    parentId,
                    updatedAt: new Date()
                },
                include: {
                    user: { select: STUDENT_USER_SELECT },
                    parent: { include: PARENT_INCLUDE },
                    school: { select: SCHOOL_SELECT }
                }
            });
            return {
                data: this.formatStudentResponse(updatedStudent),
                message: parentId
                    ? 'Liên kết phụ huynh thành công'
                    : 'Hủy liên kết phụ huynh thành công'
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            console.error('Error updating student parent:', error);
            throw new common_1.HttpException('Error updating student parent', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAttendanceByStudentIdAndClassId(studentId, classId) {
        if (!(0, validate_util_1.checkId)(studentId) || !(0, validate_util_1.checkId)(classId)) {
            throw new common_1.HttpException('Invalid student ID or class ID', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const getClass = await this.prisma.class.findUnique({
                where: { id: classId }
            });
            if (!getClass) {
                throw new common_1.HttpException('Lớp học không tồn tại', common_1.HttpStatus.NOT_FOUND);
            }
            const student = await this.prisma.student.findUnique({
                where: { id: studentId },
                include: {
                    user: {
                        select: {
                            fullName: true
                        }
                    }
                }
            });
            if (!student) {
                throw new common_1.HttpException('Học viên không tồn tại', common_1.HttpStatus.NOT_FOUND);
            }
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const statusGroups = await this.prisma.studentSessionAttendance.groupBy({
                by: ['status'],
                where: {
                    studentId,
                    recordedAt: {
                        gte: startOfMonth,
                        lt: startOfNextMonth
                    },
                    session: { classId }
                },
                _count: {
                    status: true
                },
            });
            let presentCount = 0;
            let absentCount = 0;
            let excusedCount = 0;
            for (const g of statusGroups) {
                if (g.status === 'present')
                    presentCount = g._count.status;
                else if (g.status === 'absent')
                    absentCount = g._count.status;
                else if (g.status === 'excused')
                    excusedCount = g._count.status;
            }
            return {
                data: {
                    studentId,
                    studentName: student.user.fullName,
                    classId,
                    className: getClass.name,
                    presentCount,
                    absentCount,
                    excusedCount
                },
                message: 'Lấy thông tin điểm danh học viên trong tháng thành công'
            };
        }
        catch (error) {
            console.error('Error getting attendance by student and class:', error);
            throw new common_1.HttpException('Error fetching attendance', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.StudentManagementService = StudentManagementService;
exports.StudentManagementService = StudentManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], StudentManagementService);
//# sourceMappingURL=student-management.service.js.map