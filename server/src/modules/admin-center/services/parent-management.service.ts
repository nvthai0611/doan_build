import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import hash from '../../../utils/hasing.util';
import { generateQNCode } from '../../../utils/function.util';

@Injectable()
export class ParentManagementService {
    constructor(private readonly prisma: PrismaService){}

    /**
     * Tạo mới parent kèm student
     */
    async createParentWithStudents(createParentData: {
        fullName: string;
        username: string;
        email: string;
        phone?: string;
        gender?: 'MALE' | 'FEMALE' | 'OTHER';
        birthDate?: string;
        password?: string;
        students?: Array<{
            fullName: string;
            username: string;
            email?: string;
            phone?: string;
            gender?: 'MALE' | 'FEMALE' | 'OTHER';
            birthDate?: string;
            address?: string;
            grade?: string;
            schoolId: string;
        }>;
    }) {
        // ===== VALIDATION PHASE - Check everything before creating anything =====
        
        // Check if parent username already exists
        const existingParentUsername = await this.prisma.user.findUnique({
            where: { username: createParentData.username + "@qne.edu.vn" }
        });

        if (existingParentUsername) {
            throw new HttpException(
                'Username phụ huynh đã được sử dụng',
                HttpStatus.CONFLICT
            );
        }

        // Check if parent email already exists
        const existingParentEmail = await this.prisma.user.findUnique({
            where: { email: createParentData.email }
        });

        if (existingParentEmail) {
            throw new HttpException(
                'Email phụ huynh đã được sử dụng',
                HttpStatus.CONFLICT
            );
        }

        // Check if parent phone already exists (if provided)
        if (createParentData.phone) {
            const existingParentPhone = await this.prisma.user.findFirst({
                where: { phone: createParentData.phone }
            });

            if (existingParentPhone) {
                throw new HttpException(
                    'Số điện thoại phụ huynh đã được sử dụng',
                    HttpStatus.CONFLICT
                );
            }
        }

        // Validate students if provided
        if (createParentData.students && createParentData.students.length > 0) {
            for (let i = 0; i < createParentData.students.length; i++) {
                const student = createParentData.students[i];

                // Validate required fields
                if (!student.fullName || !student.username || !student.schoolId) {
                    throw new HttpException(
                        `Thông tin học sinh ${i + 1} không đầy đủ (cần: fullName, username, schoolId)`,
                        HttpStatus.BAD_REQUEST
                    );
                }

                // Check if student username already exists
                const studentUsername = student.username;
                const existingStudentUsername = await this.prisma.user.findUnique({
                    where: { username: studentUsername }
                });

                if (existingStudentUsername) {
                    throw new HttpException(
                        `Username học sinh "${student.username}" đã được sử dụng`,
                        HttpStatus.CONFLICT
                    );
                }

                // Check if student email already exists (if provided)
                if (student.email) {
                    const existingStudentEmail = await this.prisma.user.findUnique({
                        where: { email: student.email }
                    });

                    if (existingStudentEmail) {
                        throw new HttpException(
                            `Email học sinh ${student.email} đã được sử dụng`,
                            HttpStatus.CONFLICT
                        );
                    }
                }

                // Check if phone already exists (if provided)
                if (student.phone) {
                    const existingStudentPhone = await this.prisma.user.findFirst({
                        where: { phone: student.phone }
                    });

                    if (existingStudentPhone) {
                        throw new HttpException(
                            `Số điện thoại ${student.phone} đã được sử dụng`,
                            HttpStatus.CONFLICT
                        );
                    }
                }
            }

            // Check for duplicate usernames within the students array
            const studentUsernames = createParentData.students.map(s => s.username);
            const duplicateUsernames = studentUsernames.filter(
                (username, index) => studentUsernames.indexOf(username) !== index
            );

            if (duplicateUsernames.length > 0) {
                throw new HttpException(
                    `Username học sinh "${duplicateUsernames[0]}" bị trùng lặp trong danh sách`,
                    HttpStatus.BAD_REQUEST
                );
            }

            // Check for duplicate emails within the students array
            const studentEmails = createParentData.students
                .filter(s => s.email)
                .map(s => s.email);
            
            const duplicateEmails = studentEmails.filter(
                (email, index) => studentEmails.indexOf(email) !== index
            );

            if (duplicateEmails.length > 0) {
                throw new HttpException(
                    `Email học sinh "${duplicateEmails[0]}" bị trùng lặp trong danh sách`,
                    HttpStatus.BAD_REQUEST
                );
            }

            // Check for duplicate phones within the students array
            const studentPhones = createParentData.students
                .filter(s => s.phone)
                .map(s => s.phone);
            
            const duplicatePhones = studentPhones.filter(
                (phone, index) => studentPhones.indexOf(phone) !== index
            );

            if (duplicatePhones.length > 0) {
                throw new HttpException(
                    `Số điện thoại "${duplicatePhones[0]}" bị trùng lặp trong danh sách`,
                    HttpStatus.BAD_REQUEST
                );
            }
        }

        // ===== CREATION PHASE - All validations passed, now create using transaction =====
        
        const defaultPassword = createParentData.password || '123456';
        const studentCode = generateQNCode();

        try {
            // Use transaction to ensure all-or-nothing operation
            const result = await this.prisma.$transaction(async (tx) => {
                // Create parent user
                const newParentUser = await tx.user.create({
                    data: {
                        email: createParentData.email,
                        username: createParentData.username + "@qne.edu.vn",
                        fullName: createParentData.fullName,
                        phone: createParentData.phone || null,
                        gender: createParentData.gender || 'OTHER',
                        birthDate: createParentData.birthDate 
                            ? new Date(createParentData.birthDate) 
                            : null,
                        password: hash.make(defaultPassword),
                        isActive: true,
                        role: 'parent'
                    }
                });

                // Create parent record
                const newParent = await tx.parent.create({
                    data: {
                        userId: newParentUser.id
                    }
                });

                // Create students if provided
                const createdStudents = [];
                if (createParentData.students && createParentData.students.length > 0) {
                    for (const studentData of createParentData.students) {
                        const studentUsername = studentData.username;
                        const studentEmail = studentData.email;

                        // Create student user
                        const studentUser = await tx.user.create({
                            data: {
                                email: studentEmail,
                                username: studentUsername,
                                fullName: studentData.fullName,
                                phone: studentData.phone || null,
                                gender: studentData.gender || 'OTHER',
                                birthDate: studentData.birthDate 
                                    ? new Date(studentData.birthDate) 
                                    : null,
                                password: hash.make(defaultPassword),
                                isActive: true,
                                role: 'student'
                            }
                        });

                        // Create student record
                        const newStudent = await tx.student.create({
                            data: {
                                userId: studentUser.id,
                                parentId: newParent.id,
                                studentCode: studentCode,
                                address: studentData.address || null,
                                grade: studentData.grade || null,
                                schoolId: studentData.schoolId
                            },
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                        email: true,
                                        username: true,
                                        phone: true,
                                        avatar: true
                                    }
                                }
                            }
                        });

                        createdStudents.push({
                            id: newStudent.id,
                            studentCode: newStudent.studentCode,
                            grade: newStudent.grade,
                            address: newStudent.address,
                            user: {
                                ...newStudent.user,
                                password: defaultPassword
                            }
                        });
                    }
                }

                // Get final parent data
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
                                updatedAt: true
                            }
                        }
                    }
                });

                return {
                    parent: parentWithStudents,
                    students: createdStudents
                };
            });

            // Return success response
            return {
                data: {
                    id: result.parent.id,
                    createdAt: result.parent.createdAt,
                    updatedAt: result.parent.updatedAt,
                    user: {
                        ...result.parent.user,
                        password: defaultPassword
                    },
                    students: result.students,
                    studentCount: result.students.length
                },
                message: `Tạo tài khoản phụ huynh và ${result.students.length} học sinh thành công`
            };

        } catch (error) {
            // Handle any unexpected errors during transaction
            console.error('Error creating parent with students:', error);
            
            // If it's already an HttpException, re-throw it
            if (error instanceof HttpException) {
                throw error;
            }
            
            // Otherwise, throw a generic error
            throw new HttpException(
                `Lỗi khi tạo tài khoản: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Thêm học sinh mới cho phụ huynh đã tồn tại
     */
    async addStudentToParent(parentId: string, studentData: {
        fullName: string;
        username: string;
        email?: string;
        phone?: string;
        gender?: 'MALE' | 'FEMALE' | 'OTHER';
        birthDate?: string;
        address?: string;
        grade?: string;
        schoolId: string;
        password?: string;
    }) {
        // ===== VALIDATION PHASE =====
        
        // Validate parent exists
        const parent = await this.prisma.parent.findUnique({
            where: { id: parentId },
            include: { user: true }
        });

        if (!parent) {
            throw new HttpException(
                'Phụ huynh không tồn tại',
                HttpStatus.NOT_FOUND
            );
        }

        if (!parent.user.isActive) {
            throw new HttpException(
                'Tài khoản phụ huynh đã bị vô hiệu hóa',
                HttpStatus.BAD_REQUEST
            );
        }

        // Validate required fields
        if (!studentData.fullName || !studentData.username || !studentData.schoolId) {
            throw new HttpException(
                'Thông tin học sinh không đầy đủ (cần: fullName, username, schoolId)',
                HttpStatus.BAD_REQUEST
            );
        }

        const studentUsername = studentData.username;
        
        // Check if student username already exists
        const existingUsername = await this.prisma.user.findUnique({
            where: { username: studentUsername }
        });

        if (existingUsername) {
            throw new HttpException(
                'Username học sinh đã được sử dụng',
                HttpStatus.CONFLICT
            );
        }

        // Check if student email already exists (if provided)
        if (studentData.email) {
            const existingEmail = await this.prisma.user.findUnique({
                where: { email: studentData.email }
            });

            if (existingEmail) {
                throw new HttpException(
                    'Email học sinh đã được sử dụng',
                    HttpStatus.CONFLICT
                );
            }
        }

        // Check if phone already exists (if provided)
        if (studentData.phone) {
            const existingPhone = await this.prisma.user.findFirst({
                where: { phone: studentData.phone }
            });

            if (existingPhone) {
                throw new HttpException(
                    'Số điện thoại đã được sử dụng',
                    HttpStatus.CONFLICT
                );
            }
        }

        // ===== CREATION PHASE =====
        
        const studentCode = generateQNCode();
        const defaultPassword = studentData.password || '123456';
        const studentEmail = studentData.email || 
            studentData.username;

        try {
            // Use transaction
            const result = await this.prisma.$transaction(async (tx) => {
                // Create student user
                const studentUser = await tx.user.create({
                    data: {
                        email: studentEmail,
                        username: studentUsername,
                        fullName: studentData.fullName,
                        phone: studentData.phone || null,
                        gender: studentData.gender || 'OTHER',
                        birthDate: studentData.birthDate 
                            ? new Date(studentData.birthDate) 
                            : null,
                        password: hash.make(defaultPassword),
                        isActive: true,
                        role: 'student'
                    }
                });

                // Create student record
                const newStudent = await tx.student.create({
                    data: {
                        userId: studentUser.id,
                        parentId: parentId,
                        studentCode: studentCode,
                        address: studentData.address || null,
                        grade: studentData.grade || null,
                        schoolId: studentData.schoolId
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
                                birthDate: true
                            }
                        }
                    }
                });

                // Get updated parent with all students
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
                                birthDate: true
                            }
                        },
                        students: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                        email: true,
                                        username: true,
                                        phone: true
                                    }
                                }
                            }
                        }
                    }
                });

                return {
                    parent: updatedParent,
                    newStudentId: newStudent.id
                };
            });

            return {
                data: {
                    id: result.parent.id,
                    user: result.parent.user,
                    students: result.parent.students.map(s => ({
                        id: s.id,
                        studentCode: s.studentCode,
                        grade: s.grade,
                        address: s.address,
                        user: {
                            ...s.user,
                            password: s.id === result.newStudentId ? defaultPassword : undefined
                        }
                    })),
                    studentCount: result.parent.students.length
                },
                message: 'Thêm học sinh mới cho phụ huynh thành công'
            };

        } catch (error) {
            console.error('Error adding student to parent:', error);
            
            if (error instanceof HttpException) {
                throw error;
            }
            
            throw new HttpException(
                `Lỗi khi thêm học sinh: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Tạo mới parent
     */
    async createParent(createParentData: {
        fullName: string;
        username: string;
        email: string;
        phone?: string;
        gender?: 'MALE' | 'FEMALE' | 'OTHER';
        birthDate?: string;
        password?: string;
    }) {
        // Check if username already exists
        const existingUsername = await this.prisma.user.findUnique({
            where: { username: createParentData.username + "@qne.edu.vn" }
        });

        if (existingUsername) {
            throw new HttpException(
                'Username đã được sử dụng',
                HttpStatus.CONFLICT
            );
        }

        // Check if email already exists
        const existingEmail = await this.prisma.user.findUnique({
            where: { email: createParentData.email }
        });

        if (existingEmail) {
            throw new HttpException(
                'Email đã được sử dụng',
                HttpStatus.CONFLICT
            );
        }

        // Check if phone already exists (if provided)
        if (createParentData.phone) {
            const existingPhone = await this.prisma.user.findFirst({
                where: { phone: createParentData.phone }
            });

            if (existingPhone) {
                throw new HttpException(
                    'Số điện thoại đã được sử dụng',
                    HttpStatus.CONFLICT
                );
            }
        }

        // Default password if not provided
        const defaultPassword = createParentData.password || '123456';

        // Create user first
        const newUser = await this.prisma.user.create({
            data: {
                email: createParentData.email,
                username: createParentData.username + "@qne.edu.vn",
                fullName: createParentData.fullName,
                phone: createParentData.phone,
                gender: createParentData.gender || 'OTHER',
                birthDate: createParentData.birthDate ? new Date(createParentData.birthDate) : null,
                password: hash.make(defaultPassword),
                isActive: true,
                role: 'parent'
            }
        });

        // Create parent
        const newParent = await this.prisma.parent.create({
            data: {
                userId: newUser.id
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
                        updatedAt: true
                    }
                },
                students: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                phone: true
                            }
                        }
                    }
                }
            }
        });

        return {
            data: {
                id: newParent.id,
                createdAt: newParent.createdAt,
                updatedAt: newParent.updatedAt,
                user: {
                    ...newParent.user,
                    password: defaultPassword
                },
                students: newParent.students.map(student => ({
                    id: student.id,
                    studentCode: student.studentCode,
                    user: student.user
                })),
                studentCount: newParent.students.length
            },
            message: 'Tạo tài khoản phụ huynh thành công'
        };
    }

    /**
     * Lấy danh sách parents với filter và phân trang
     */
    async getAllParents(
        search?: string,
        gender?: string,
        accountStatus?: string,
        page: number = 1,
        limit: number = 10,
    ) {
        try {
            const skip = (page - 1) * limit;

            // Build where condition
            const whereCondition: any = {};

            // Search by name, email, phone
            if (search && search.trim()) {
                whereCondition.OR = [
                    {
                        user: {
                            fullName: {
                                contains: search.trim(),
                                mode: 'insensitive'
                            }
                        }
                    },
                    {
                        user: {
                            email: {
                                contains: search.trim(),
                                mode: 'insensitive'
                            }
                        }
                    },
                    {
                        user: {
                            phone: {
                                contains: search.trim(),
                                mode: 'insensitive'
                            }
                        }
                    }
                ];
            }

            // Filter by gender
            if (gender && gender !== 'all') {
                whereCondition.user = {
                    ...whereCondition.user,
                    gender: gender
                };
            }

            // Filter by account status
            if (accountStatus && accountStatus !== 'all') {
                const isActive = accountStatus === 'active';
                whereCondition.user = {
                    ...whereCondition.user,
                    isActive: isActive
                };
            }

            // Get total count
            const totalCount = await this.prisma.parent.count({
                where: whereCondition
            });

            // Get parents with pagination
            const parents = await this.prisma.parent.findMany({
                where: whereCondition,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
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
                            updatedAt: true
                        }
                    },
                    students: {
                        include: {
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

            const formattedParents = parents.map(parent => ({
                id: parent.id,
                createdAt: parent.createdAt,
                updatedAt: parent.updatedAt,
                user: parent.user,
                students: parent.students.map(student => ({
                    id: student.id,
                    studentCode: student.studentCode,
                    user: student.user
                })),
                studentCount: parent.students.length
            }));

            return {
                data: formattedParents,
                meta: {
                    pagination: {
                        total: totalCount,
                        page,
                        limit,
                        totalPages: Math.ceil(totalCount / limit)
                    }
                },
                message: 'Lấy danh sách phụ huynh thành công'
            };

        } catch (error) {
            console.error('Error getting parents:', error);
            throw new Error(`Error getting parents: ${error.message}`);
        }
    }

    /**
     * Lấy chi tiết parent theo ID
     */
    async getParentById(parentId: string) {
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
                            updatedAt: true
                        }
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
                                    isActive: true
                                }
                            },
                            school: {
                                select: {
                                    id: true,
                                    name: true,
                                    address: true
                                }
                            },
                            enrollments: {
                                include: {
                                    class: {
                                        include: {
                                            subject: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    payments: {
                        include: {
                            feeRecord: {
                                include: {
                                    feeStructure: true,
                                    student: {
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
                        },
                        orderBy: {
                            paidAt: 'desc'
                        }
                    }
                }
            });

            if (!parent) {
                return {
                    data: null,
                    message: 'Không tìm thấy phụ huynh'
                };
            }

            // Calculate payment statistics
            const totalPaid = parent.payments.reduce((sum, payment) => 
                sum + Number(payment.amount), 0
            );

            const pendingFees = await this.prisma.feeRecord.findMany({
                where: {
                    studentId: {
                        in: parent.students.map(s => s.id)
                    },
                    status: 'pending'
                },
                include: {
                    feeStructure: true,
                    student: {
                        include: {
                            user: {
                                select: {
                                    fullName: true
                                }
                            }
                        }
                    }
                }
            });

            const totalPending = pendingFees.reduce((sum, fee) => 
                sum + Number(fee.amount) - Number(fee.paidAmount), 0
            );

            return {
                data: {
                    ...parent,
                    studentCount: parent.students.length,
                    paymentStats: {
                        totalPaid,
                        totalPending,
                        paymentCount: parent.payments.length
                    },
                    pendingFees
                },
                message: 'Lấy thông tin phụ huynh thành công'
            };

        } catch (error) {
            console.error('Error getting parent by id:', error);
            throw new Error(`Error getting parent by id: ${error.message}`);
        }
    }

    /**
     * Đếm số lượng phụ huynh theo trạng thái
     */
    async getCountByStatus() {
        try {
            const totalParents = await this.prisma.parent.count();
            
            const activeParents = await this.prisma.parent.count({
                where: {
                    user: {
                        isActive: true
                    }
                }
            });

            const inactiveParents = await this.prisma.parent.count({
                where: {
                    user: {
                        isActive: false
                    }
                }
            });

            return {
                data: {
                    total: totalParents,
                    active: activeParents,
                    inactive: inactiveParents
                },
                message: 'Lấy thống kê thành công'
            };
        } catch (error) {
            console.error('Error getting count by status:', error);
            throw new Error(`Error getting count by status: ${error.message}`);
        }
    }

    /**
     * Toggle trạng thái parent
     */
    async toggleParentStatus(parentId: string) {
        try {
            const existingParent = await this.prisma.parent.findUnique({
                where: { id: parentId },
                include: {
                    user: true
                }
            });

            if (!existingParent) {
                throw new Error('Phụ huynh không tồn tại');
            }

            const newStatus = !existingParent.user.isActive;

            await this.prisma.user.update({
                where: { id: existingParent.userId },
                data: {
                    isActive: newStatus,
                    updatedAt: new Date()
                }
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
                            updatedAt: true
                        }
                    },
                    students: {
                        include: {
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

            return {
                data: updatedParent,
                message: `${newStatus ? 'Kích hoạt' : 'Vô hiệu hóa'} tài khoản phụ huynh thành công`
            };

        } catch (error) {
            console.error('Error toggling parent status:', error);
            throw new Error(`Error toggling parent status: ${error.message}`);
        }
    }

    /**
     * Cập nhật thông tin parent
     */
    async updateParent(parentId: string, updateParentData: {
        fullName?: string;
        phone?: string;
        gender?: 'MALE' | 'FEMALE' | 'OTHER';
        birthDate?: string;
    }) {
        
        try {
            const existingParent = await this.prisma.parent.findUnique({
                where: { id: parentId },
                include: {
                    user: true
                }
            });

            if (!existingParent) {
                throw new Error('Phụ huynh không tồn tại');
            }

            // Prepare user update data
            const userUpdateData: any = {};
            if (updateParentData.fullName !== undefined) {
                userUpdateData.fullName = updateParentData.fullName;
            }
            if (updateParentData.phone !== undefined) {
                userUpdateData.phone = updateParentData.phone;
            }
            if (updateParentData.gender !== undefined) {
                userUpdateData.gender = updateParentData.gender;
            }
            if (updateParentData.birthDate !== undefined) {
                userUpdateData.birthDate = updateParentData.birthDate ? new Date(updateParentData.birthDate) : null;
            }

            // Update user data if there are changes
            if (Object.keys(userUpdateData).length > 0) {
                await this.prisma.user.update({
                    where: { id: existingParent.userId },
                    data: {
                        ...userUpdateData,
                        updatedAt: new Date()
                    }
                });
            }

            // Get updated parent data
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
                            updatedAt: true
                        }
                    },
                    students: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    email: true,
                                    phone: true
                                }
                            }
                        }
                    }
                }
            });

            return {
                data: {
                    id: updatedParent.id,
                    createdAt: updatedParent.createdAt,
                    updatedAt: updatedParent.updatedAt,
                    user: updatedParent.user,
                    students: updatedParent.students.map(student => ({
                        id: student.id,
                        studentCode: student.studentCode,
                        user: student.user
                    }))
                },
                message: 'Cập nhật thông tin phụ huynh thành công'
            };

        } catch (error) {
            console.error('Error updating parent:', error);
            throw new Error(`Error updating parent: ${error.message}`);
        }
    }

    /**
     * Tìm student theo student code để link với parent
     */
    async findStudentByCode(studentCode: string) {
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
                            birthDate: true
                        }
                    },
                    parent: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    email: true,
                                    phone: true
                                }
                            }
                        }
                    },
                    school: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });

            if (!student) {
                return {
                    data: null,
                    message: 'Không tìm thấy học viên với mã này'
                };
            }

            return {
                data: {
                    id: student.id,
                    studentCode: student.studentCode,
                    grade: student.grade,
                    address: student.address,
                    user: student.user,
                    parent: student.parent ? {
                        id: student.parent.id,
                        user: student.parent.user
                    } : null,
                    school: student.school
                },
                message: 'Tìm thấy học viên'
            };

        } catch (error) {
            console.error('Error finding student:', error);
            throw new Error(`Error finding student: ${error.message}`);
        }
    }

    /**
     * Link student với parent
     */
    async linkStudentToParent(parentId: string, studentId: string) {
        try {
            // Validate parent exists
            const parent = await this.prisma.parent.findUnique({
                where: { id: parentId },
                include: {
                    user: true
                }
            });

            if (!parent) {
                throw new Error('Phụ huynh không tồn tại');
            }

            if (!parent.user.isActive) {
                throw new Error('Tài khoản phụ huynh đã bị vô hiệu hóa');
            }

            // Validate student exists
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
                                    email: true
                                }
                            }
                        }
                    }
                }
            });

            if (!student) {
                throw new Error('Học viên không tồn tại');
            }

            // Check if student already has this parent
            if (student.parentId === parentId) {
                throw new Error('Học viên đã được liên kết với phụ huynh này');
            }

            // Update student's parent
            await this.prisma.student.update({
                where: { id: studentId },
                data: {
                    parentId: parentId,
                    updatedAt: new Date()
                }
            });

            // Get updated parent with students
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
                            birthDate: true
                        }
                    },
                    students: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    email: true,
                                    phone: true
                                }
                            }
                        }
                    }
                }
            });

            return {
                data: {
                    id: updatedParent.id,
                    user: updatedParent.user,
                    students: updatedParent.students.map(s => ({
                        id: s.id,
                        studentCode: s.studentCode,
                        user: s.user
                    }))
                },
                message: 'Liên kết học viên với phụ huynh thành công'
            };

        } catch (error) {
            console.error('Error linking student to parent:', error);
            throw new Error(`Error linking student to parent: ${error.message}`);
        }
    }

    /**
     * Unlink student khỏi parent
     */
    async unlinkStudentFromParent(parentId: string, studentId: string) {
        try {
            // Validate student belongs to this parent
            const student = await this.prisma.student.findUnique({
                where: { id: studentId },
                include: {
                    parent: true
                }
            });

            if (!student) {
                throw new Error('Học viên không tồn tại');
            }

            if (student.parentId !== parentId) {
                throw new Error('Học viên không thuộc phụ huynh này');
            }

            // Remove parent link
            await this.prisma.student.update({
                where: { id: studentId },
                data: {
                    parentId: null,
                    updatedAt: new Date()
                }
            });

            return {
                data: null,
                message: 'Hủy liên kết học viên với phụ huynh thành công'
            };

        } catch (error) {
            console.error('Error unlinking student from parent:', error);
            throw new Error(`Error unlinking student from parent: ${error.message}`);
        }
    }

    /**
     * Thêm học sinh mới cho phụ huynh đã tồn tại
     */
    // async addStudentToParent(parentId: string, studentData: {
    //     fullName: string;
    //     username: string;
    //     email?: string;
    //     phone?: string;
    //     gender?: 'MALE' | 'FEMALE' | 'OTHER';
    //     birthDate?: string;
    //     address?: string;
    //     grade?: string;
    //     schoolId: string;
    //     password?: string;
    // }) {
    //     // ===== VALIDATION PHASE =====
        
    //     // Validate parent exists
    //     const parent = await this.prisma.parent.findUnique({
    //         where: { id: parentId },
    //         include: { user: true }
    //     });

    //     if (!parent) {
    //         throw new HttpException(
    //             'Phụ huynh không tồn tại',
    //             HttpStatus.NOT_FOUND
    //         );
    //     }

    //     if (!parent.user.isActive) {
    //         throw new HttpException(
    //             'Tài khoản phụ huynh đã bị vô hiệu hóa',
    //             HttpStatus.BAD_REQUEST
    //         );
    //     }

    //     // Validate required fields
    //     if (!studentData.fullName || !studentData.username || !studentData.schoolId) {
    //         throw new HttpException(
    //             'Thông tin học sinh không đầy đủ (cần: fullName, username, schoolId)',
    //             HttpStatus.BAD_REQUEST
    //         );
    //     }

    //     // Check if student username already exists
    //     const existingUsername = await this.prisma.user.findUnique({
    //         where: { username: studentData.username + "@student.qne.edu.vn" }
    //     });

    //     if (existingUsername) {
    //         throw new HttpException(
    //             'Username học sinh đã được sử dụng',
    //             HttpStatus.CONFLICT
    //         );
    //     }

    //     // Check if student email already exists (if provided)
    //     if (studentData.email) {
    //         const existingEmail = await this.prisma.user.findUnique({
    //             where: { email: studentData.email }
    //         });

    //         if (existingEmail) {
    //             throw new HttpException(
    //                 'Email học sinh đã được sử dụng',
    //                 HttpStatus.CONFLICT
    //             );
    //         }
    //     }

    //     // Check if phone already exists (if provided)
    //     if (studentData.phone) {
    //         const existingPhone = await this.prisma.user.findFirst({
    //             where: { phone: studentData.phone }
    //         });

    //         if (existingPhone) {
    //             throw new HttpException(
    //                 'Số điện thoại đã được sử dụng',
    //                 HttpStatus.CONFLICT
    //             );
    //         }
    //     }

    //     // Generate unique student code
    //     const studentCode = generateQNCode();

    //     // Default password if not provided
    //     const defaultPassword = studentData.password || '123456';

    //     // Use provided username with student domain
    //     const studentUsername = studentData.username + "@student.qne.edu.vn";

    //     // Generate email if not provided (based on username)
    //     const studentEmail = studentData.email || 
    //         studentData.username + "@temp.qne.edu.vn";

    //     // Create student user
    //     const studentUser = await this.prisma.user.create({
    //         data: {
    //             email: studentEmail,
    //             username: studentUsername,
    //             fullName: studentData.fullName,
    //             phone: studentData.phone || null,
    //             gender: studentData.gender || 'OTHER',
    //             birthDate: studentData.birthDate ? new Date(studentData.birthDate) : null,
    //             password: hash.make(defaultPassword),
    //             isActive: true,
    //             role: 'student'
    //         }
    //     });

    //     // Create student record with auto-generated studentCode
    //     const newStudent = await this.prisma.student.create({
    //         data: {
    //             userId: studentUser.id,
    //             parentId: parentId,
    //             studentCode: studentCode,
    //             address: studentData.address || null,
    //             grade: studentData.grade || null,
    //             schoolId: studentData.schoolId
    //         },
    //         include: {
    //             user: {
    //                 select: {
    //                     id: true,
    //                     fullName: true,
    //                     email: true,
    //                     username: true,
    //                     phone: true,
    //                     avatar: true,
    //                     isActive: true,
    //                     gender: true,
    //                     birthDate: true
    //                 }
    //             }
    //         }
    //     });

    //     // Get updated parent with all students
    //     const updatedParent = await this.prisma.parent.findUnique({
    //         where: { id: parentId },
    //         include: {
    //             user: {
    //                 select: {
    //                     id: true,
    //                     email: true,
    //                     username: true,
    //                     fullName: true,
    //                     phone: true,
    //                     avatar: true,
    //                     isActive: true,
    //                     gender: true,
    //                     birthDate: true
    //                 }
    //             },
    //             students: {
    //                 include: {
    //                     user: {
    //                         select: {
    //                             id: true,
    //                             fullName: true,
    //                             email: true,
    //                             username: true,
    //                             phone: true
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     });

    //     return {
    //         data: {
    //             id: updatedParent.id,
    //             user: updatedParent.user,
    //             students: updatedParent.students.map(s => ({
    //                 id: s.id,
    //                 studentCode: s.studentCode,
    //                 grade: s.grade,
    //                 address: s.address,
    //                 user: {
    //                     ...s.user,
    //                     password: s.id === newStudent.id ? defaultPassword : undefined
    //                 }
    //             })),
    //             studentCount: updatedParent.students.length
    //         },
    //         message: 'Thêm học sinh mới cho phụ huynh thành công'
    //     };
    // }
}