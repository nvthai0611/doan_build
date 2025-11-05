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
exports.ParentManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
const hasing_util_1 = require("../../../utils/hasing.util");
const function_util_1 = require("../../../utils/function.util");
const template_parent_student_account_1 = require("../../shared/template-email/template-parent-student-account");
const email_util_1 = require("../../../utils/email.util");
const validate_util_1 = require("../../../utils/validate.util");
let ParentManagementService = class ParentManagementService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createParentWithStudents(createParentData) {
        const existingParentUsername = await this.prisma.user.findUnique({
            where: { username: createParentData.username },
        });
        if (existingParentUsername) {
            throw new common_1.HttpException('Username phụ huynh đã được sử dụng', common_1.HttpStatus.CONFLICT);
        }
        const existingParentEmail = await this.prisma.user.findUnique({
            where: { email: createParentData.email },
        });
        if (existingParentEmail) {
            throw new common_1.HttpException('Email phụ huynh đã được sử dụng', common_1.HttpStatus.CONFLICT);
        }
        if (createParentData.phone) {
            const existingParentPhone = await this.prisma.user.findFirst({
                where: { phone: createParentData.phone },
            });
            if (existingParentPhone) {
                throw new common_1.HttpException('Số điện thoại phụ huynh đã được sử dụng', common_1.HttpStatus.CONFLICT);
            }
        }
        if (createParentData.students && createParentData.students.length > 0) {
            for (let i = 0; i < createParentData.students.length; i++) {
                const s = createParentData.students[i];
                if (!s.fullName || !s.fullName.trim()) {
                    throw new common_1.HttpException(`Họ và tên học sinh ${i + 1} không được để trống`, common_1.HttpStatus.BAD_REQUEST);
                }
                if (!s.gender || !['MALE', 'FEMALE', 'OTHER'].includes(s.gender)) {
                    throw new common_1.HttpException(`Giới tính học sinh ${i + 1} không hợp lệ`, common_1.HttpStatus.BAD_REQUEST);
                }
                if (!s.birthDate || isNaN(Date.parse(s.birthDate))) {
                    throw new common_1.HttpException(`Ngày sinh học sinh ${i + 1} không hợp lệ`, common_1.HttpStatus.BAD_REQUEST);
                }
                if (!s.schoolId) {
                    throw new common_1.HttpException(`Trường học cho học sinh ${i + 1} không được để trống`, common_1.HttpStatus.BAD_REQUEST);
                }
            }
        }
        const defaultPassword = createParentData.password || '123456';
        let studentCode = (0, function_util_1.generateQNCode)('student');
        while (true) {
            const existingStudentCode = await this.prisma.student.findUnique({
                where: { studentCode: studentCode },
            });
            if (existingStudentCode) {
                studentCode = (0, function_util_1.generateQNCode)('student');
            }
            else {
                break;
            }
        }
        const parentRole = await this.prisma.role.findUnique({
            where: { name: 'parent' },
        });
        if (!parentRole) {
            throw new common_1.HttpException('Không tìm thấy vai trò phụ huynh trong hệ thống', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const studentRole = await this.prisma.role.findUnique({
            where: { name: 'student' },
        });
        if (!studentRole) {
            throw new common_1.HttpException('Không tìm thấy vai trò học sinh trong hệ thống', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const newParentUser = await tx.user.create({
                data: {
                    email: createParentData.email,
                    username: createParentData.username,
                    fullName: createParentData.fullName,
                    phone: createParentData.phone || null,
                    gender: 'OTHER',
                    password: hasing_util_1.default.make(defaultPassword),
                    isActive: true,
                    roleId: parentRole.id,
                    role: 'parent',
                },
            });
            const newParent = await tx.parent.create({
                data: {
                    userId: newParentUser.id,
                    relationshipType: createParentData.relationshipType,
                },
            });
            const base = createParentData.username;
            let nextIndex = 1;
            const generateNextStudentUsername = async () => {
                while (true) {
                    const candidate = `${base}_${nextIndex}`;
                    const exists = await tx.user.findUnique({
                        where: { username: candidate },
                    });
                    if (!exists) {
                        nextIndex++;
                        return candidate;
                    }
                    nextIndex++;
                }
            };
            const createdStudents = [];
            if (createParentData.students && createParentData.students.length > 0) {
                for (const s of createParentData.students) {
                    const studentUsername = await generateNextStudentUsername();
                    const studentUser = await tx.user.create({
                        data: {
                            email: `${studentUsername}@student.qne.edu.vn`,
                            username: studentUsername,
                            fullName: s.fullName,
                            phone: null,
                            gender: s.gender || 'OTHER',
                            birthDate: s.birthDate ? new Date(s.birthDate) : null,
                            password: hasing_util_1.default.make(defaultPassword),
                            isActive: true,
                            roleId: studentRole.id,
                            role: 'student',
                        },
                    });
                    const newStudent = await tx.student.create({
                        data: {
                            userId: studentUser.id,
                            parentId: newParent.id,
                            studentCode: studentCode,
                            address: null,
                            grade: null,
                            schoolId: s.schoolId,
                        },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    email: true,
                                    username: true,
                                    phone: true,
                                    avatar: true,
                                },
                            },
                        },
                    });
                    createdStudents.push({
                        id: newStudent.id,
                        studentCode: newStudent.studentCode,
                        grade: newStudent.grade,
                        address: newStudent.address,
                        user: {
                            ...newStudent.user,
                            password: defaultPassword,
                        },
                    });
                }
            }
            const parentWithStudents = await tx.parent.findUnique({
                where: { id: newParent.id },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            username: true,
                            fullName: true,
                            phone: true,
                            avatar: true,
                            isActive: true,
                            gender: true,
                            birthDate: true,
                            createdAt: true,
                            updatedAt: true,
                        },
                    },
                },
            });
            return {
                parent: parentWithStudents,
                students: createdStudents,
            };
        });
        if (result.parent.user.email) {
            const parentInfo = {
                fullName: result.parent.user.fullName,
                username: result.parent.user.username,
                email: result.parent.user.email,
                password: defaultPassword,
            };
            const studentsInfo = result.students.map((s) => ({
                fullName: s.user.fullName,
                username: s.user.username,
                email: s.user.email,
                password: s.user.password,
            }));
            try {
                await (0, email_util_1.default)(result.parent.user.email, 'Thông tin tài khoản phụ huynh và học sinh QNE', (0, template_parent_student_account_1.templateParentStudentAccount)(parentInfo, studentsInfo));
            }
            catch (emailError) {
                console.error('Failed to send email:', emailError);
            }
        }
        return {
            data: {
                id: result.parent.id,
                createdAt: result.parent.createdAt,
                updatedAt: result.parent.updatedAt,
                user: {
                    ...result.parent.user,
                    password: defaultPassword,
                },
                students: result.students,
                studentCount: result.students.length,
            },
            message: `Tạo tài khoản phụ huynh và ${result.students.length} học sinh thành công`,
        };
    }
    async addStudentToParent(parentId, studentData) {
        const parent = await this.prisma.parent.findUnique({
            where: { id: parentId },
            include: { user: true },
        });
        if (!parent) {
            throw new common_1.HttpException('Phụ huynh không tồn tại', common_1.HttpStatus.NOT_FOUND);
        }
        if (!parent.user.isActive) {
            throw new common_1.HttpException('Tài khoản phụ huynh đã bị vô hiệu hóa', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!studentData.fullName || !studentData.fullName.trim()) {
            throw new common_1.HttpException('Họ và tên học sinh không được để trống', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!studentData.schoolId) {
            throw new common_1.HttpException('Trường học không được để trống', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!studentData.gender) {
            throw new common_1.HttpException('Giới tính không được để trống', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!studentData.birthDate || isNaN(Date.parse(studentData.birthDate))) {
            throw new common_1.HttpException('Ngày sinh không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        let studentCode = (0, function_util_1.generateQNCode)('student');
        while (true) {
            const existingCode = await this.prisma.student.findUnique({
                where: { studentCode: studentCode },
            });
            if (!existingCode)
                break;
            studentCode = (0, function_util_1.generateQNCode)('student');
        }
        const defaultPassword = studentData.password || '123456';
        const parentUsername = parent.user.username || '';
        const base = parentUsername.includes('@')
            ? parentUsername.split('@')[0]
            : parentUsername;
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                let nextIndex = (await tx.student.count({ where: { parentId } })) + 1;
                const generateNextStudentUsername = async () => {
                    while (true) {
                        const candidate = `${base}_${nextIndex}`;
                        const exists = await tx.user.findUnique({
                            where: { username: candidate },
                        });
                        if (!exists) {
                            nextIndex++;
                            return candidate;
                        }
                        nextIndex++;
                    }
                };
                const studentUsername = await generateNextStudentUsername();
                const studentUser = await tx.user.create({
                    data: {
                        email: null,
                        username: studentUsername,
                        fullName: studentData.fullName,
                        phone: null,
                        gender: studentData.gender || 'OTHER',
                        birthDate: studentData.birthDate
                            ? new Date(studentData.birthDate)
                            : null,
                        password: hasing_util_1.default.make(defaultPassword),
                        isActive: true,
                        role: 'student',
                    },
                });
                const newStudent = await tx.student.create({
                    data: {
                        userId: studentUser.id,
                        parentId: parentId,
                        studentCode: studentCode,
                        address: null,
                        grade: null,
                        schoolId: studentData.schoolId,
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                username: true,
                                phone: true,
                                avatar: true,
                                isActive: true,
                                gender: true,
                                birthDate: true,
                            },
                        },
                    },
                });
                const updatedParent = await tx.parent.findUnique({
                    where: { id: parentId },
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                username: true,
                                fullName: true,
                                phone: true,
                                avatar: true,
                                isActive: true,
                                gender: true,
                                birthDate: true,
                            },
                        },
                        students: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                        email: true,
                                        username: true,
                                        phone: true,
                                    },
                                },
                            },
                        },
                    },
                });
                return {
                    parent: updatedParent,
                    newStudentId: newStudent.id,
                };
            });
            return {
                data: {
                    id: result.parent.id,
                    user: result.parent.user,
                    students: result.parent.students.map((s) => ({
                        id: s.id,
                        studentCode: s.studentCode,
                        grade: s.grade,
                        address: s.address,
                        user: {
                            ...s.user,
                            password: s.id === result.newStudentId ? defaultPassword : undefined,
                        },
                    })),
                    studentCount: result.parent.students.length,
                },
                message: 'Thêm học sinh mới cho phụ huynh thành công',
            };
        }
        catch (error) {
            console.error('Error adding student to parent:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(`Lỗi khi thêm học sinh: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createParent(createParentData) {
        const existingUsername = await this.prisma.user.findUnique({
            where: { username: createParentData.username },
        });
        if (existingUsername) {
            throw new common_1.HttpException('Username đã được sử dụng', common_1.HttpStatus.CONFLICT);
        }
        const existingEmail = await this.prisma.user.findUnique({
            where: { email: createParentData.email },
        });
        if (existingEmail) {
            throw new common_1.HttpException('Email đã được sử dụng', common_1.HttpStatus.CONFLICT);
        }
        if (createParentData.phone) {
            const existingPhone = await this.prisma.user.findFirst({
                where: { phone: createParentData.phone },
            });
            if (existingPhone) {
                throw new common_1.HttpException('Số điện thoại đã được sử dụng', common_1.HttpStatus.CONFLICT);
            }
        }
        const defaultPassword = createParentData.password || '123456';
        const newUser = await this.prisma.user.create({
            data: {
                email: createParentData.email,
                username: createParentData.username,
                fullName: createParentData.fullName,
                phone: createParentData.phone,
                gender: createParentData.gender || 'OTHER',
                birthDate: createParentData.birthDate
                    ? new Date(createParentData.birthDate)
                    : null,
                password: hasing_util_1.default.make(defaultPassword),
                isActive: true,
                role: 'parent',
            },
        });
        const newParent = await this.prisma.parent.create({
            data: {
                userId: newUser.id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        fullName: true,
                        phone: true,
                        avatar: true,
                        isActive: true,
                        gender: true,
                        birthDate: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
                students: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
        });
        return {
            data: {
                id: newParent.id,
                createdAt: newParent.createdAt,
                updatedAt: newParent.updatedAt,
                user: {
                    ...newParent.user,
                    password: defaultPassword,
                },
                students: newParent.students.map((student) => ({
                    id: student.id,
                    studentCode: student.studentCode,
                    user: student.user,
                })),
                studentCount: newParent.students.length,
            },
            message: 'Tạo tài khoản phụ huynh thành công',
        };
    }
    async getAllParents(search, gender, accountStatus, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const whereCondition = {};
            if (search && search.trim()) {
                whereCondition.OR = [
                    {
                        user: {
                            fullName: {
                                contains: search.trim(),
                                mode: 'insensitive',
                            },
                        },
                    },
                    {
                        user: {
                            email: {
                                contains: search.trim(),
                                mode: 'insensitive',
                            },
                        },
                    },
                    {
                        user: {
                            phone: {
                                contains: search.trim(),
                                mode: 'insensitive',
                            },
                        },
                    },
                ];
            }
            if (gender && gender !== 'all') {
                whereCondition.user = {
                    ...whereCondition.user,
                    gender: gender,
                };
            }
            if (accountStatus && accountStatus !== 'all') {
                const isActive = accountStatus === 'active';
                whereCondition.user = {
                    ...whereCondition.user,
                    isActive: isActive,
                };
            }
            const totalCount = await this.prisma.parent.count({
                where: whereCondition,
            });
            const parents = await this.prisma.parent.findMany({
                where: whereCondition,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            username: true,
                            fullName: true,
                            phone: true,
                            avatar: true,
                            isActive: true,
                            gender: true,
                            birthDate: true,
                            createdAt: true,
                            updatedAt: true,
                        },
                    },
                    students: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });
            const formattedParents = parents.map((parent) => ({
                id: parent.id,
                createdAt: parent.createdAt,
                updatedAt: parent.updatedAt,
                user: parent.user,
                students: parent.students.map((student) => ({
                    id: student.id,
                    studentCode: student.studentCode,
                    user: student.user,
                })),
                studentCount: parent.students.length,
            }));
            return {
                data: formattedParents,
                meta: {
                    pagination: {
                        total: totalCount,
                        page,
                        limit,
                        totalPages: Math.ceil(totalCount / limit),
                    },
                },
                message: 'Lấy danh sách phụ huynh thành công',
            };
        }
        catch (error) {
            console.error('Error getting parents:', error);
            throw new Error(`Error getting parents: ${error.message}`);
        }
    }
    async getParentById(parentId) {
        try {
            const parent = await this.prisma.parent.findUnique({
                where: { id: parentId },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            username: true,
                            fullName: true,
                            phone: true,
                            avatar: true,
                            isActive: true,
                            gender: true,
                            birthDate: true,
                            createdAt: true,
                            updatedAt: true,
                        },
                    },
                    students: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    email: true,
                                    phone: true,
                                    avatar: true,
                                    isActive: true,
                                },
                            },
                            school: {
                                select: {
                                    id: true,
                                    name: true,
                                    address: true,
                                },
                            },
                            enrollments: {
                                include: {
                                    class: {
                                        include: {
                                            subject: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            if (!parent) {
                return {
                    data: null,
                    message: 'Không tìm thấy phụ huynh',
                };
            }
            const payments = await this.prisma.payment.findMany({
                where: { parentId: parent.id },
                include: {
                    feeRecordPayments: {
                        include: {
                            feeRecord: {
                                include: {
                                    class: {
                                        select: {
                                            name: true,
                                            classCode: true,
                                        },
                                    },
                                    feeStructure: true,
                                    student: {
                                        include: {
                                            user: {
                                                select: { fullName: true },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: { paidAt: 'desc' },
            });
            const formattedPayments = payments.map((payment) => ({
                id: payment.id,
                amount: Number(payment.amount),
                paidAmount: Number(payment.paidAmount ?? 0),
                status: payment.status,
                reference: payment.reference,
                paidAt: payment.paidAt,
                notes: payment.notes,
                transactionCode: payment.transactionCode,
                method: payment.method || 'bank_transfer',
                allocations: (payment.feeRecordPayments || []).map((frp) => ({
                    id: frp.id,
                    feeRecordId: frp.feeRecordId,
                    notes: frp.notes,
                    studentId: frp.feeRecord?.studentId,
                    studentName: frp.feeRecord?.student?.user?.fullName,
                    className: frp.feeRecord?.class?.name,
                    classCode: frp.feeRecord?.class?.classCode,
                    feeName: frp.feeRecord?.feeStructure?.name,
                })),
            }));
            const totalPaid = formattedPayments.reduce((sum, p) => {
                if (p.status === 'completed')
                    return sum + Number(p.amount);
                if (p.status === 'partially_paid')
                    return sum + Number(p.paidAmount ?? 0);
                return sum;
            }, 0);
            const pendingFees = await this.prisma.feeRecord.findMany({
                where: {
                    studentId: {
                        in: parent.students.map((s) => s.id),
                    },
                    status: 'pending',
                },
                include: {
                    feeStructure: true,
                    student: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                },
                            },
                        },
                    },
                },
            });
            const totalPending = pendingFees.reduce((sum, fee) => sum + Number(fee.amount), 0);
            return {
                data: {
                    ...parent,
                    payments: formattedPayments,
                    studentCount: parent.students.length,
                    paymentStats: {
                        totalPaid,
                        totalPending,
                        paymentCount: formattedPayments.length,
                    },
                    pendingFees,
                },
                message: 'Lấy thông tin phụ huynh thành công',
            };
        }
        catch (error) {
            console.error('Error getting parent by id:', error);
            throw new Error(`Error getting parent by id: ${error.message}`);
        }
    }
    async getCountByStatus() {
        try {
            const totalParents = await this.prisma.parent.count();
            const activeParents = await this.prisma.parent.count({
                where: {
                    user: {
                        isActive: true,
                    },
                },
            });
            const inactiveParents = await this.prisma.parent.count({
                where: {
                    user: {
                        isActive: false,
                    },
                },
            });
            return {
                data: {
                    total: totalParents,
                    active: activeParents,
                    inactive: inactiveParents,
                },
                message: 'Lấy thống kê thành công',
            };
        }
        catch (error) {
            console.error('Error getting count by status:', error);
            throw new Error(`Error getting count by status: ${error.message}`);
        }
    }
    async toggleParentStatus(parentId) {
        try {
            const existingParent = await this.prisma.parent.findUnique({
                where: { id: parentId },
                include: {
                    user: true,
                },
            });
            if (!existingParent) {
                throw new Error('Phụ huynh không tồn tại');
            }
            const newStatus = !existingParent.user.isActive;
            await this.prisma.user.update({
                where: { id: existingParent.userId },
                data: {
                    isActive: newStatus,
                    updatedAt: new Date(),
                },
            });
            const updatedParent = await this.prisma.parent.findUnique({
                where: { id: parentId },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            username: true,
                            fullName: true,
                            phone: true,
                            avatar: true,
                            isActive: true,
                            gender: true,
                            birthDate: true,
                            createdAt: true,
                            updatedAt: true,
                        },
                    },
                    students: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });
            return {
                data: updatedParent,
                message: `${newStatus ? 'Kích hoạt' : 'Vô hiệu hóa'} tài khoản phụ huynh thành công`,
            };
        }
        catch (error) {
            console.error('Error toggling parent status:', error);
            throw new Error(`Error toggling parent status: ${error.message}`);
        }
    }
    async updateParent(parentId, updateParentData) {
        const existingParent = await this.prisma.parent.findUnique({
            where: { id: parentId },
            include: {
                user: true,
            },
        });
        if (!existingParent) {
            throw new common_1.HttpException('Phụ huynh không tồn tại', common_1.HttpStatus.NOT_FOUND);
        }
        if (updateParentData.email !== undefined) {
            const existingEmail = await this.prisma.user.findUnique({
                where: { email: updateParentData.email },
            });
            if (existingEmail && existingEmail.id !== existingParent.userId) {
                throw new common_1.HttpException('Email đã được sử dụng bởi tài khoản khác', common_1.HttpStatus.CONFLICT);
            }
        }
        if (updateParentData.phone !== undefined && updateParentData.phone) {
            const existingPhone = await this.prisma.user.findFirst({
                where: {
                    phone: updateParentData.phone,
                    id: { not: existingParent.userId }
                },
            });
            if (existingPhone) {
                throw new common_1.HttpException('Số điện thoại đã được sử dụng bởi tài khoản khác', common_1.HttpStatus.CONFLICT);
            }
        }
        const userUpdateData = {};
        if (updateParentData.fullName !== undefined) {
            userUpdateData.fullName = updateParentData.fullName.trim();
        }
        if (updateParentData.email !== undefined) {
            userUpdateData.email = updateParentData.email.trim();
        }
        if (updateParentData.phone !== undefined) {
            userUpdateData.phone = updateParentData.phone.trim() || null;
        }
        const parentUpdateData = {};
        if (updateParentData.relationshipType !== undefined) {
            parentUpdateData.relationshipType = updateParentData.relationshipType;
        }
        if (Object.keys(userUpdateData).length > 0) {
            await this.prisma.user.update({
                where: { id: existingParent.userId },
                data: {
                    ...userUpdateData,
                    updatedAt: new Date(),
                },
            });
        }
        if (Object.keys(parentUpdateData).length > 0) {
            await this.prisma.parent.update({
                where: { id: parentId },
                data: {
                    ...parentUpdateData,
                    updatedAt: new Date(),
                },
            });
        }
        const updatedParent = await this.prisma.parent.findUnique({
            where: { id: parentId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        fullName: true,
                        phone: true,
                        avatar: true,
                        isActive: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
                students: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
        });
        return {
            data: {
                id: updatedParent.id,
                createdAt: updatedParent.createdAt,
                updatedAt: updatedParent.updatedAt,
                relationshipType: updatedParent.relationshipType,
                user: updatedParent.user,
                students: updatedParent.students.map((student) => ({
                    id: student.id,
                    studentCode: student.studentCode,
                    user: student.user,
                })),
                studentCount: updatedParent.students.length,
            },
            message: 'Cập nhật thông tin phụ huynh thành công',
        };
    }
    async findStudentByCode(studentCode) {
        try {
            if (!studentCode || !studentCode.trim()) {
                throw new Error('Mã học viên không được để trống');
            }
            const student = await this.prisma.student.findUnique({
                where: { studentCode: studentCode.trim() },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            fullName: true,
                            phone: true,
                            avatar: true,
                            isActive: true,
                            gender: true,
                            birthDate: true,
                        },
                    },
                    parent: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    email: true,
                                    phone: true,
                                },
                            },
                        },
                    },
                    school: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            if (!student) {
                return {
                    data: null,
                    message: 'Không tìm thấy học viên với mã này',
                };
            }
            return {
                data: {
                    id: student.id,
                    studentCode: student.studentCode,
                    grade: student.grade,
                    address: student.address,
                    user: student.user,
                    parent: student.parent
                        ? {
                            id: student.parent.id,
                            user: student.parent.user,
                        }
                        : null,
                    school: student.school,
                },
                message: 'Tìm thấy học viên',
            };
        }
        catch (error) {
            console.error('Error finding student:', error);
            throw new Error(`Error finding student: ${error.message}`);
        }
    }
    async linkStudentToParent(parentId, studentId) {
        try {
            const parent = await this.prisma.parent.findUnique({
                where: { id: parentId },
                include: {
                    user: true,
                },
            });
            if (!parent) {
                throw new Error('Phụ huynh không tồn tại');
            }
            if (!parent.user.isActive) {
                throw new Error('Tài khoản phụ huynh đã bị vô hiệu hóa');
            }
            const student = await this.prisma.student.findUnique({
                where: { id: studentId },
                include: {
                    user: true,
                    parent: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!student) {
                throw new Error('Học viên không tồn tại');
            }
            if (student.parentId === parentId) {
                throw new Error('Học viên đã được liên kết với phụ huynh này');
            }
            await this.prisma.student.update({
                where: { id: studentId },
                data: {
                    parentId: parentId,
                    updatedAt: new Date(),
                },
            });
            const updatedParent = await this.prisma.parent.findUnique({
                where: { id: parentId },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            username: true,
                            fullName: true,
                            phone: true,
                            avatar: true,
                            isActive: true,
                            gender: true,
                            birthDate: true,
                        },
                    },
                    students: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    email: true,
                                    phone: true,
                                },
                            },
                        },
                    },
                },
            });
            return {
                data: {
                    id: updatedParent.id,
                    user: updatedParent.user,
                    students: updatedParent.students.map((s) => ({
                        id: s.id,
                        studentCode: s.studentCode,
                        user: s.user,
                    })),
                },
                message: 'Liên kết học viên với phụ huynh thành công',
            };
        }
        catch (error) {
            console.error('Error linking student to parent:', error);
            throw new Error(`Error linking student to parent: ${error.message}`);
        }
    }
    async unlinkStudentFromParent(parentId, studentId) {
        try {
            const student = await this.prisma.student.findUnique({
                where: { id: studentId },
                include: {
                    parent: true,
                },
            });
            if (!student) {
                throw new Error('Học viên không tồn tại');
            }
            if (student.parentId !== parentId) {
                throw new Error('Học viên không thuộc phụ huynh này');
            }
            await this.prisma.student.update({
                where: { id: studentId },
                data: {
                    parentId: null,
                    updatedAt: new Date(),
                },
            });
            return {
                data: null,
                message: 'Hủy liên kết học viên với phụ huynh thành công',
            };
        }
        catch (error) {
            console.error('Error unlinking student from parent:', error);
            throw new Error(`Error unlinking student from parent: ${error.message}`);
        }
    }
    async getPaymentDetails(paymentId, parentId) {
        try {
            const payment = await this.prisma.payment.findFirst({
                where: { id: paymentId, parentId },
                include: {
                    feeRecordPayments: {
                        include: {
                            feeRecord: {
                                include: {
                                    class: {
                                        select: {
                                            name: true,
                                            classCode: true,
                                        },
                                    },
                                    feeStructure: {
                                        select: {
                                            name: true,
                                            amount: true,
                                            period: true,
                                        },
                                    },
                                    student: {
                                        include: {
                                            user: {
                                                select: { fullName: true },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            if (!payment) {
                throw new common_1.HttpException({ message: 'Không tìm thấy payment' }, common_1.HttpStatus.NOT_FOUND);
            }
            return payment;
        }
        catch (error) { }
    }
    async createBillForParent(parentId, feeRecordIds, options) {
        try {
            const parent = await this.prisma.parent.findUnique({
                where: { id: parentId },
                include: { user: true, students: true },
            });
            if (!parent) {
                throw new common_1.HttpException('Phụ huynh không tồn tại', common_1.HttpStatus.NOT_FOUND);
            }
            if (!feeRecordIds || feeRecordIds.length === 0) {
                throw new common_1.HttpException('Danh sách feeRecordIds không được để trống', common_1.HttpStatus.BAD_REQUEST);
            }
            const feeRecords = await this.prisma.feeRecord.findMany({
                where: { id: { in: feeRecordIds } },
                include: {
                    student: {
                        select: {
                            id: true,
                            parentId: true,
                            user: { select: { fullName: true } },
                        },
                    },
                    feeStructure: true,
                    class: { select: { id: true, name: true, classCode: true } },
                },
            });
            if (feeRecords.length !== feeRecordIds.length) {
                const foundIds = feeRecords.map((f) => f.id);
                const missing = feeRecordIds.filter((id) => !foundIds.includes(id));
                throw new common_1.HttpException(`Không tìm thấy thông tin học phí: ${missing.join(', ')}`, common_1.HttpStatus.NOT_FOUND);
            }
            for (const fr of feeRecords) {
                if (!fr.student || fr.student.parentId !== parentId) {
                    throw new common_1.HttpException(`Thông tin học phí của học sinh ${fr.student?.user?.fullName} không thuộc phụ huynh này`, common_1.HttpStatus.BAD_REQUEST);
                }
            }
            const totalAmount = feeRecords.reduce((sum, fr) => {
                return sum + Number(fr.totalAmount || fr.amount || 0);
            }, 0);
            if (totalAmount <= 0) {
                throw new common_1.HttpException('Tổng tiền phải lớn hơn 0', common_1.HttpStatus.BAD_REQUEST);
            }
            const payNow = options?.payNow ?? false;
            const method = options?.method ?? 'bank_transfer';
            let paidAmount = 0;
            let returnMoney = 0;
            if (payNow && method === 'cash') {
                const cashGiven = Number(options?.cashGiven ?? 0);
                console.log(options?.cashGiven);
                console.log(cashGiven);
                if (isNaN(cashGiven) || cashGiven <= 0) {
                    throw new common_1.HttpException('Số tiền khách đưa không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
                }
                if (cashGiven < totalAmount) {
                    throw new common_1.HttpException(`Số tiền khách đưa (${cashGiven.toLocaleString('vi-VN')}đ) chưa đủ để thanh toán (${totalAmount.toLocaleString('vi-VN')}đ)`, common_1.HttpStatus.BAD_REQUEST);
                }
                paidAmount = totalAmount;
                returnMoney = cashGiven - totalAmount;
            }
            else if (payNow) {
                paidAmount = totalAmount;
                returnMoney = 0;
            }
            let expirationDate = null;
            if (options?.expirationDate) {
                expirationDate = new Date(options.expirationDate);
            }
            else if (payNow) {
                expirationDate = new Date();
            }
            else {
                const today = new Date();
                const currentMonth = today.getMonth();
                const currentYear = today.getFullYear();
                const currentDay = today.getDate();
                if (currentDay <= 7) {
                    expirationDate = new Date(currentYear, currentMonth, 7);
                }
                else {
                    expirationDate = new Date(currentYear, currentMonth + 1, 7);
                }
            }
            const result = await this.prisma.$transaction(async (tx) => {
                const transactionCode = (0, function_util_1.createOrderCode)();
                let finalNotes = options?.notes || '';
                if (payNow && method === 'cash' && options?.cashGiven) {
                    const cashDetails = `Khách đưa: ${Number(options.cashGiven).toLocaleString('vi-VN')}đ; Tiền thừa: ${returnMoney.toLocaleString('vi-VN')}đ`;
                    finalNotes = finalNotes
                        ? `${finalNotes} | ${cashDetails}`
                        : cashDetails;
                }
                const paymentStatus = payNow ? 'completed' : 'pending';
                const paidAt = payNow ? new Date() : null;
                const payment = await tx.payment.create({
                    data: {
                        parentId,
                        amount: totalAmount,
                        paidAmount: payNow ? paidAmount : 0,
                        returnMoney: payNow ? returnMoney : 0,
                        transactionCode: transactionCode,
                        status: paymentStatus,
                        paidAt: paidAt,
                        expirationDate: expirationDate,
                        notes: finalNotes || null,
                        reference: options?.reference ?? transactionCode,
                        method: method,
                    },
                });
                const feeRecordStatus = payNow ? 'paid' : 'processing';
                for (const fr of feeRecords) {
                    await tx.feeRecordPayment.create({
                        data: {
                            paymentId: payment.id,
                            feeRecordId: fr.id,
                            notes: payNow ? 'Thanh toán trực tiếp tại trung tâm' : null,
                        },
                    });
                    await tx.feeRecord.update({
                        where: { id: fr.id },
                        data: {
                            status: feeRecordStatus,
                        },
                    });
                }
                const paymentWithAllocations = await tx.payment.findUnique({
                    where: { id: payment.id },
                    include: {
                        feeRecordPayments: {
                            include: {
                                feeRecord: {
                                    include: {
                                        student: {
                                            include: { user: { select: { fullName: true } } },
                                        },
                                        feeStructure: true,
                                        class: { select: { name: true, classCode: true } },
                                    },
                                },
                            },
                        },
                        parent: {
                            include: { user: { select: { fullName: true, email: true } } },
                        },
                    },
                });
                return paymentWithAllocations;
            });
            const message = payNow
                ? method === 'cash'
                    ? `Tạo và thanh toán hóa đơn thành công. Tiền thừa: ${returnMoney.toLocaleString('vi-VN')}đ`
                    : 'Tạo và thanh toán hóa đơn thành công'
                : 'Tạo hóa đơn cho phụ huynh thành công';
            return {
                data: result,
                message: message,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException(`Lỗi khi tạo hóa đơn: ${error?.message || error}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateStatusPayment(paymentId, status, customNotes) {
        try {
            (0, validate_util_1.checkId)(paymentId);
            const existingPayment = await this.prisma.payment.findUnique({
                where: { id: paymentId },
                include: {
                    feeRecordPayments: {
                        include: {
                            feeRecord: true,
                        },
                    },
                },
            });
            if (!existingPayment) {
                throw new common_1.HttpException('Không tìm thấy thanh toán', common_1.HttpStatus.NOT_FOUND);
            }
            const validStatuses = ['pending', 'completed', 'partially_paid', 'cancelled'];
            if (!validStatuses.includes(status)) {
                throw new common_1.HttpException('Trạng thái thanh toán không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
            }
            let note = existingPayment.notes || "";
            if (customNotes && customNotes.trim()) {
                note = customNotes.trim();
            }
            else if (existingPayment.status === "partially_paid" && status === "completed") {
                note += " => Phụ huynh đã thanh toán phần còn lại của hóa đơn.";
            }
            const result = await this.prisma.$transaction(async (tx) => {
                const updatedPayment = await tx.payment.update({
                    where: { id: paymentId },
                    data: {
                        status,
                        paidAt: status === 'completed' ? new Date() : existingPayment.paidAt,
                        notes: note,
                        paidAmount: status === 'completed' ? existingPayment.amount : existingPayment.paidAmount,
                        updatedAt: new Date(),
                    },
                });
                const feeRecordStatus = status === 'completed' ? 'paid' :
                    status === 'cancelled' ? 'pending' :
                        'processing';
                for (const frp of existingPayment.feeRecordPayments) {
                    await tx.feeRecord.update({
                        where: { id: frp.feeRecordId },
                        data: {
                            status: feeRecordStatus,
                        },
                    });
                }
                return updatedPayment;
            });
            return {
                data: result,
                message: 'Cập nhật trạng thái thanh toán thành công',
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException(`Lỗi khi cập nhật trạng thái thanh toán: ${error?.message || error}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ParentManagementService = ParentManagementService;
exports.ParentManagementService = ParentManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ParentManagementService);
//# sourceMappingURL=parent-management.service.js.map