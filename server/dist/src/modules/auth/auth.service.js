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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../db/prisma.service");
const hasing_util_1 = require("../../utils/hasing.util");
const jwt_util_1 = require("../../utils/jwt.util");
const permission_service_1 = require("./permission.service");
const alert_service_1 = require("../admin-center/services/alert.service");
const function_util_1 = require("../../utils/function.util");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
let AuthService = class AuthService {
    constructor(prisma, permissionService, alertService, cloudinaryService) {
        this.prisma = prisma;
        this.permissionService = permissionService;
        this.alertService = alertService;
        this.cloudinaryService = cloudinaryService;
    }
    async getUserByField(field = 'id', value) {
        return this.prisma.user.findFirst({
            where: {
                [field]: value,
            },
            include: {
                teacher: true,
                student: true,
                parent: true,
                roleData: {
                    include: {
                        rolePermissions: {
                            include: {
                                permission: true
                            }
                        }
                    }
                }
            },
        });
    }
    async validateUser(identifier, password) {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { username: identifier }
                ]
            },
            include: {
                teacher: true,
                student: true,
                parent: true,
                roleData: {
                    include: {
                        rolePermissions: {
                            include: {
                                permission: true
                            }
                        }
                    }
                }
            }
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Email/Tên đăng nhập hoặc mật khẩu không chính xác');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
        }
        const isPasswordValid = await hasing_util_1.default.verify(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Email/Tên đăng nhập hoặc mật khẩu không chính xác');
        }
        return user;
    }
    async login(identifier, password) {
        const user = await this.validateUser(identifier, password);
        const accessToken = jwt_util_1.default.createAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        const refreshToken = jwt_util_1.default.createRefreshToken(user.id);
        await this.prisma.userSession.create({
            data: {
                userId: user.id,
                refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                gender: user.gender,
                birthDate: user.birthDate,
                fullName: user.fullName,
                role: user.role,
                phone: user.phone,
                isActive: user.isActive,
                student: user.student,
                parent: user.parent,
            },
        };
    }
    async registerParent(registerDto) {
        const parentRole = await this.prisma.role.findUnique({
            where: { name: 'parent' },
        });
        if (!parentRole) {
            throw new common_1.NotFoundException('Không tìm thấy vai trò phụ huynh trong hệ thống');
        }
        const studentRole = await this.prisma.role.findUnique({
            where: { name: 'student' },
        });
        if (!studentRole) {
            throw new common_1.NotFoundException('Không tìm thấy vai trò học sinh trong hệ thống');
        }
        const hashedPassword = await hasing_util_1.default.hash(registerDto.password);
        let result;
        try {
            result = await this.prisma.$transaction(async (prisma) => {
                const existingEmail = await prisma.user.findUnique({
                    where: { email: registerDto.email },
                });
                if (existingEmail) {
                    throw new common_1.ConflictException('Email đã được sử dụng');
                }
                const existingUsername = await prisma.user.findUnique({
                    where: { username: registerDto.username },
                });
                if (existingUsername) {
                    throw new common_1.ConflictException('Tên đăng nhập đã được sử dụng');
                }
                if (registerDto.phone) {
                    const existingPhone = await prisma.user.findFirst({
                        where: { phone: registerDto.phone },
                    });
                    if (existingPhone) {
                        throw new common_1.ConflictException('Số điện thoại đã được sử dụng');
                    }
                }
                const user = await prisma.user.create({
                    data: {
                        email: registerDto.email,
                        username: registerDto.username,
                        password: hashedPassword,
                        fullName: registerDto.fullName,
                        phone: registerDto.phone,
                        birthDate: registerDto.birthDate ? new Date(registerDto.birthDate) : null,
                        role: 'parent',
                        roleId: parentRole.id,
                        isActive: true,
                    },
                });
                const parent = await prisma.parent.create({
                    data: {
                        userId: user.id,
                        relationshipType: registerDto.relationshipType,
                    },
                });
                const createdChildren = [];
                for (const child of registerDto.children) {
                    const childUsername = `${registerDto.username}_${createdChildren.length + 1}`;
                    const defaultStudentPassword = await hasing_util_1.default.hash('123456');
                    const childUser = await prisma.user.create({
                        data: {
                            email: `${childUsername}@student.qne.edu.vn`,
                            username: childUsername,
                            password: defaultStudentPassword,
                            fullName: child.fullName,
                            birthDate: new Date(child.dateOfBirth),
                            gender: child.gender,
                            role: 'student',
                            roleId: studentRole.id,
                            isActive: true,
                        },
                    });
                    let schoolId = null;
                    if (child.schoolName && child.schoolName.trim()) {
                        const trimmedSchoolName = child.schoolName.trim();
                        let school = await prisma.school.findFirst({
                            where: {
                                name: {
                                    equals: trimmedSchoolName,
                                    mode: 'insensitive'
                                }
                            },
                        });
                        if (!school) {
                            school = await prisma.school.create({
                                data: {
                                    name: trimmedSchoolName,
                                    address: child.schoolAddress?.trim() || null,
                                    phone: null,
                                },
                            });
                        }
                        schoolId = school.id;
                    }
                    if (!schoolId) {
                        throw new common_1.BadRequestException(`Thiếu thông tin trường học cho con ${child.fullName}`);
                    }
                    let studentCode = (0, function_util_1.generateQNCode)('student');
                    while (true) {
                        const existingStudentWithCode = await prisma.student.findFirst({
                            where: { studentCode: studentCode }
                        });
                        if (!existingStudentWithCode) {
                            break;
                        }
                        studentCode = (0, function_util_1.generateQNCode)('student');
                    }
                    const student = await prisma.student.create({
                        data: {
                            user: {
                                connect: { id: childUser.id }
                            },
                            parent: {
                                connect: { id: parent.id }
                            },
                            school: {
                                connect: { id: schoolId }
                            },
                            studentCode: studentCode
                        },
                    });
                    createdChildren.push({
                        user: childUser,
                        student,
                    });
                }
                return { user, parent, children: createdChildren };
            });
        }
        catch (error) {
            if (error.code === 'P2002') {
                const field = error.meta?.target?.[0];
                if (field === 'email') {
                    throw new common_1.ConflictException('Email đã được sử dụng');
                }
                else if (field === 'username') {
                    throw new common_1.ConflictException('Tên đăng nhập đã được sử dụng');
                }
                else {
                    throw new common_1.ConflictException('Thông tin đã tồn tại trong hệ thống');
                }
            }
            if (error instanceof common_1.ConflictException || error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            console.error('Error in registerParent transaction:', error);
            throw new common_1.BadRequestException('Có lỗi xảy ra khi đăng ký tài khoản. Vui lòng thử lại.');
        }
        return {
            success: true,
            message: `Đăng ký tài khoản thành công! Đã tạo ${result.children.length} tài khoản cho con.`,
            data: {
                parent: {
                    id: result.user.id,
                    email: result.user.email,
                    username: result.user.username,
                    fullName: result.user.fullName,
                    phone: result.user.phone,
                    birthDate: result.user.birthDate,
                    gender: result.user.gender,
                },
                children: result.children.map(child => ({
                    id: child.user.id,
                    username: child.user.username,
                    email: child.user.email,
                    fullName: child.user.fullName,
                    birthDate: child.user.birthDate,
                    gender: child.user.gender,
                })),
            },
        };
    }
    async refreshToken(refreshToken) {
        const session = await this.prisma.userSession.findFirst({
            where: {
                refreshToken,
                isActive: true,
                expiresAt: {
                    gt: new Date(),
                },
            },
            include: {
                user: {
                    include: {
                        student: true,
                        parent: true,
                    },
                },
            },
        });
        if (!session) {
            const reusedSession = await this.prisma.userSession.findFirst({
                where: {
                    refreshToken,
                    isActive: false,
                },
            });
            if (reusedSession) {
                await this.prisma.userSession.updateMany({
                    where: {
                        userId: reusedSession.userId,
                    },
                    data: {
                        isActive: false,
                    },
                });
                throw new common_1.UnauthorizedException('Phát hiện sử dụng lại refresh token. Tất cả phiên đăng nhập đã bị vô hiệu hóa vì lý do bảo mật.');
            }
            throw new common_1.UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
        }
        const user = session.user;
        const newAccessToken = jwt_util_1.default.createAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        const newRefreshToken = jwt_util_1.default.createRefreshToken(user.id);
        await this.prisma.userSession.update({
            where: { id: session.id },
            data: {
                isActive: false,
            },
        });
        await this.prisma.userSession.create({
            data: {
                userId: user.id,
                refreshToken: newRefreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                phone: user.phone,
                isActive: user.isActive,
                student: user.student,
                parent: user.parent,
            },
        };
    }
    async logout(userId, refreshToken) {
        if (refreshToken) {
            await this.prisma.userSession.updateMany({
                where: {
                    userId,
                    refreshToken,
                },
                data: {
                    isActive: false,
                },
            });
        }
        else {
            await this.prisma.userSession.updateMany({
                where: {
                    userId,
                },
                data: {
                    isActive: false,
                },
            });
        }
        return { success: true, message: 'Đăng xuất thành công' };
    }
    async changePassword(userId, oldPassword, newPassword) {
        const user = await this.getUserByField('id', userId);
        if (!user) {
            throw new common_1.NotFoundException('Không tìm thấy người dùng');
        }
        const isOldPasswordValid = await hasing_util_1.default.verify(oldPassword, user.password);
        if (!isOldPasswordValid) {
            throw new common_1.BadRequestException('Mật khẩu cũ không chính xác');
        }
        const hashedNewPassword = await hasing_util_1.default.hash(newPassword);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });
        return { success: true, message: 'Đổi mật khẩu thành công' };
    }
    async getProfile(userId) {
        const user = await this.getUserByField('id', userId);
        if (!user) {
            throw new common_1.NotFoundException('Không tìm thấy người dùng');
        }
        const permissions = await this.permissionService.getUserPermissions(userId);
        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            phone: user.phone,
            avatar: user.avatar,
            gender: user.gender,
            birthDate: user.birthDate,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            student: user.student,
            parent: user.parent,
            permissions: permissions.map(p => p.name),
            roleData: user.roleData
        };
    }
    async updateProfile(userId, updateData) {
        const user = await this.getUserByField('id', userId);
        if (!user) {
            throw new common_1.NotFoundException('Không tìm thấy người dùng');
        }
        const updateUserData = {};
        if (updateData.fullName !== undefined) {
            updateUserData.fullName = updateData.fullName;
        }
        if (updateData.phone !== undefined) {
            updateUserData.phone = updateData.phone;
        }
        if (updateData.avatar !== undefined) {
            let avatarUrl = updateData.avatar;
            if (avatarUrl && avatarUrl.startsWith('data:image')) {
                const base64Data = avatarUrl.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');
                const file = {
                    fieldname: 'avatar',
                    originalname: `avatar-${userId}-${Date.now()}.jpg`,
                    encoding: '7bit',
                    mimetype: 'image/jpeg',
                    size: buffer.length,
                    buffer: buffer,
                };
                const uploadResult = await this.cloudinaryService.uploadImage(file, 'avatars');
                avatarUrl = uploadResult.secure_url;
            }
            updateUserData.avatar = avatarUrl;
        }
        if (updateData.gender !== undefined) {
            updateUserData.gender = updateData.gender;
        }
        if (updateData.birthDate !== undefined) {
            updateUserData.birthDate = updateData.birthDate ? new Date(updateData.birthDate) : null;
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: updateUserData,
            include: {
                student: true,
                parent: true,
            },
        });
        return {
            id: updatedUser.id,
            email: updatedUser.email,
            fullName: updatedUser.fullName,
            role: updatedUser.role,
            phone: updatedUser.phone,
            avatar: updatedUser.avatar,
            gender: updatedUser.gender,
            birthDate: updatedUser.birthDate,
            isActive: updatedUser.isActive,
            student: updatedUser.student,
            parent: updatedUser.parent,
        };
    }
    async getActiveSessions(userId) {
        return this.prisma.userSession.findMany({
            where: {
                userId,
                isActive: true,
                expiresAt: {
                    gt: new Date(),
                },
            },
            select: {
                id: true,
                createdAt: true,
                expiresAt: true,
            },
        });
    }
    async revokeSession(userId, sessionId) {
        await this.prisma.userSession.updateMany({
            where: {
                id: sessionId,
                userId,
            },
            data: {
                isActive: false,
            },
        });
        return { success: true, message: 'Hủy session thành công' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        permission_service_1.PermissionService,
        alert_service_1.AlertService,
        cloudinary_service_1.CloudinaryService])
], AuthService);
//# sourceMappingURL=auth.service.js.map