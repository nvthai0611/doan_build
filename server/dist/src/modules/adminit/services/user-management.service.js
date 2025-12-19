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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../db/prisma.service");
const hasing_util_1 = require("../../../utils/hasing.util");
const validate_util_1 = require("../../../utils/validate.util");
const query_user_dto_1 = require("../dto/user/query-user.dto");
const ROLE_LABELS = {
    admin: 'Quản trị viên',
    teacher: 'Giáo viên',
    parent: 'Phụ huynh',
    student: 'Học sinh',
    center_owner: 'Chủ trung tâm',
};
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUsers(query) {
        const { search, status = 'all', role = 'all', roles, gender, startDate, endDate, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const pageNumber = Math.max(1, Number(page) || 1);
        const pageSize = Math.max(1, Math.min(100, Number(limit) || 10));
        const where = this.buildWhereClause({
            search,
            status,
            role,
            roles,
            gender,
            startDate,
            endDate,
        });
        const orderBy = this.buildOrderClause(sortBy, sortOrder);
        const existingCreatedAtFilter = where.createdAt && typeof where.createdAt === 'object' && !(where.createdAt instanceof Date)
            ? where.createdAt
            : {};
        const monthlyWhere = {
            ...where,
            createdAt: {
                ...existingCreatedAtFilter,
                gte: this.getStartOfMonth(),
                lte: new Date(),
            },
        };
        const [users, total, activeUsers, inactiveUsers, newUsersThisMonth] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                skip: (pageNumber - 1) * pageSize,
                take: pageSize,
                orderBy,
                include: this.defaultUserInclude(),
            }),
            this.prisma.user.count({ where }),
            this.prisma.user.count({ where: { ...where, isActive: true } }),
            this.prisma.user.count({ where: { ...where, isActive: false } }),
            this.prisma.user.count({ where: monthlyWhere }),
        ]);
        const formattedUsers = users.map((user) => this.formatUser(user));
        return {
            data: formattedUsers,
            meta: {
                total,
                page: pageNumber,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
            summary: {
                totalUsers: total,
                activeUsers,
                inactiveUsers,
                newUsersThisMonth,
            },
            filters: {
                roles: query_user_dto_1.USER_ROLES_FILTER.map((value) => ({
                    label: ROLE_LABELS[value] || value,
                    value,
                })),
                statuses: query_user_dto_1.USER_STATUS_FILTER,
                genders: Object.values(client_1.Gender),
            },
            message: 'Lấy danh sách người dùng thành công',
        };
    }
    async getUserById(id) {
        this.validateId(id);
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                ...this.defaultUserInclude(),
                sessions: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
                auditLogs: {
                    orderBy: { timestamp: 'desc' },
                    take: 5,
                    select: {
                        id: true,
                        action: true,
                        tableName: true,
                        recordId: true,
                        timestamp: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.HttpException('Không tìm thấy người dùng', common_1.HttpStatus.NOT_FOUND);
        }
        return {
            data: this.formatDetailedUser(user),
            message: 'Lấy chi tiết người dùng thành công',
        };
    }
    async createUser(payload) {
        await this.ensureUniqueCredential(payload.email, payload.username);
        const roleId = await this.resolveRoleId(payload.role);
        const password = payload.password || '123456';
        const newUser = await this.prisma.user.create({
            data: {
                email: payload.email.toLowerCase(),
                username: payload.username,
                fullName: payload.fullName,
                phone: payload.phone,
                role: payload.role,
                roleId,
                avatar: payload.avatar ?? null,
                isActive: payload.isActive ?? true,
                password: hasing_util_1.default.make(password),
                gender: payload.gender ?? null,
                birthDate: payload.birthDate ? new Date(payload.birthDate) : null,
            },
            include: this.defaultUserInclude(),
        });
        return {
            data: this.formatUser(newUser),
            message: 'Tạo người dùng thành công',
        };
    }
    async updateUser(id, payload) {
        this.validateId(id);
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.HttpException('Không tìm thấy người dùng', common_1.HttpStatus.NOT_FOUND);
        }
        if (payload.email && payload.email !== existing.email) {
            await this.ensureUniqueCredential(payload.email, undefined, id);
        }
        if (payload.username && payload.username !== existing.username) {
            await this.ensureUniqueCredential(undefined, payload.username, id);
        }
        const roleId = payload.role ? await this.resolveRoleId(payload.role) : existing.roleId;
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                email: payload.email?.toLowerCase() ?? existing.email,
                username: payload.username ?? existing.username,
                fullName: payload.fullName ?? existing.fullName,
                phone: payload.phone ?? existing.phone,
                avatar: payload.avatar ?? existing.avatar,
                isActive: payload.isActive ?? existing.isActive,
                role: payload.role ?? existing.role,
                roleId,
                gender: payload.gender ?? existing.gender,
                birthDate: payload.birthDate ? new Date(payload.birthDate) : existing.birthDate,
                password: payload.password ? hasing_util_1.default.make(payload.password) : existing.password,
            },
            include: this.defaultUserInclude(),
        });
        return {
            data: this.formatUser(updatedUser),
            message: 'Cập nhật người dùng thành công',
        };
    }
    async toggleStatus(id) {
        this.validateId(id);
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.HttpException('Không tìm thấy người dùng', common_1.HttpStatus.NOT_FOUND);
        }
        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                isActive: !user.isActive,
            },
            include: this.defaultUserInclude(),
        });
        return {
            data: this.formatUser(updated),
            message: `Đã ${updated.isActive ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản`,
        };
    }
    async resetPassword(id, payload) {
        this.validateId(id);
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.HttpException('Không tìm thấy người dùng', common_1.HttpStatus.NOT_FOUND);
        }
        const isCustomPassword = !!payload.newPassword && payload.newPassword.trim().length > 0;
        let passwordToSet;
        if (isCustomPassword) {
            const trimmedPassword = payload.newPassword.trim();
            if (trimmedPassword.length < 6) {
                throw new common_1.HttpException('Mật khẩu phải có ít nhất 6 ký tự', common_1.HttpStatus.BAD_REQUEST);
            }
            passwordToSet = trimmedPassword;
        }
        else {
            const generated = hasing_util_1.default.generateRandomPassword();
            passwordToSet = generated.rawPassword;
        }
        await this.prisma.$transaction(async (trx) => {
            await trx.user.update({
                where: { id },
                data: {
                    password: hasing_util_1.default.make(passwordToSet),
                },
            });
            if (payload.forceLogout) {
                await trx.userSession.updateMany({
                    where: { userId: id, isActive: true },
                    data: { isActive: false },
                });
            }
        });
        return {
            data: {
                id: user.id,
                username: user.username,
                ...(isCustomPassword ? {} : { temporaryPassword: passwordToSet }),
            },
            message: isCustomPassword
                ? 'Mật khẩu đã được cập nhật thành công'
                : 'Đặt lại mật khẩu thành công',
        };
    }
    buildWhereClause(params) {
        const where = {};
        if (params.search) {
            where.OR = [
                { fullName: { contains: params.search, mode: 'insensitive' } },
                { email: { contains: params.search, mode: 'insensitive' } },
                { username: { contains: params.search, mode: 'insensitive' } },
                { phone: { contains: params.search, mode: 'insensitive' } },
            ];
        }
        if (params.status && params.status !== 'all') {
            where.isActive = params.status === 'active';
        }
        const roleFilters = params.roles?.length
            ? params.roles
            : params.role && params.role !== 'all'
                ? [params.role]
                : [];
        if (roleFilters.length) {
            where.role = { in: roleFilters };
        }
        if (params.gender) {
            where.gender = params.gender;
        }
        if (params.startDate || params.endDate) {
            where.createdAt = {};
            if (params.startDate) {
                where.createdAt.gte = new Date(params.startDate);
            }
            if (params.endDate) {
                where.createdAt.lte = new Date(params.endDate);
            }
        }
        return where;
    }
    buildOrderClause(sortBy, sortOrder) {
        const direction = sortOrder === 'asc' ? 'asc' : 'desc';
        switch (sortBy) {
            case 'fullName':
                return { fullName: direction };
            case 'username':
                return { username: direction };
            case 'role':
                return { role: direction };
            default:
                return { createdAt: direction };
        }
    }
    defaultUserInclude() {
        return {
            roleData: {
                include: {
                    rolePermissions: {
                        select: {
                            permissionId: true,
                        },
                    },
                },
            },
            teacher: {
                select: {
                    id: true,
                    teacherCode: true,
                    school: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
            student: {
                select: {
                    id: true,
                    studentCode: true,
                    grade: true,
                    parent: {
                        select: {
                            id: true,
                            relationshipType: true,
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                },
                            },
                        },
                    },
                },
            },
            parent: {
                select: {
                    id: true,
                    relationshipType: true,
                    students: {
                        select: {
                            id: true,
                            studentCode: true,
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                },
                            },
                        },
                    },
                },
            },
            sessions: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: {
                    id: true,
                    createdAt: true,
                    isActive: true,
                },
            },
        };
    }
    formatUser(user) {
        return {
            id: user.id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role,
            roleDisplayName: user.roleData?.displayName || ROLE_LABELS[user.role] || user.role,
            avatar: user.avatar,
            isActive: user.isActive,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            gender: user.gender,
            birthDate: user.birthDate ? user.birthDate.toISOString() : null,
            lastLoginAt: user.sessions?.[0]?.createdAt
                ? user.sessions[0].createdAt.toISOString()
                : null,
            linkedEntities: {
                teacher: user.teacher
                    ? {
                        id: user.teacher.id,
                        teacherCode: user.teacher.teacherCode,
                        schoolName: user.teacher.school?.name || null,
                    }
                    : null,
                parent: user.parent
                    ? {
                        id: user.parent.id,
                        relationshipType: user.parent.relationshipType,
                        studentsCount: user.parent.students?.length || 0,
                        students: user.parent.students?.map((s) => ({
                            id: s.id,
                            studentCode: s.studentCode,
                            fullName: s.user?.fullName || null,
                        })) || [],
                    }
                    : null,
                student: user.student
                    ? {
                        id: user.student.id,
                        studentCode: user.student.studentCode,
                        grade: user.student.grade,
                        parent: user.student.parent
                            ? {
                                id: user.student.parent.id,
                                relationshipType: user.student.parent.relationshipType,
                                fullName: user.student.parent.user?.fullName || null,
                            }
                            : null,
                    }
                    : null,
            },
            permissionCount: user.roleData?.rolePermissions?.length || 0,
        };
    }
    formatDetailedUser(user) {
        const base = this.formatUser(user);
        return {
            ...base,
            sessions: (user.sessions || []).map((session) => ({
                id: session.id,
                createdAt: session.createdAt.toISOString(),
                isActive: session.isActive,
            })),
            recentActivities: (user.auditLogs || []).map((log) => ({
                id: log.id,
                action: log.action,
                tableName: log.tableName,
                recordId: log.recordId,
                timestamp: log.timestamp?.toISOString?.() || null,
            })),
        };
    }
    async checkAvailability(email, username, excludeId) {
        const result = {
            emailAvailable: true,
            usernameAvailable: true,
        };
        if (email) {
            const existingEmail = await this.prisma.user.findFirst({
                where: {
                    email: email.toLowerCase(),
                    ...(excludeId ? { id: { not: excludeId } } : {}),
                },
            });
            if (existingEmail) {
                result.emailAvailable = false;
                result.emailMessage = 'Email đã được sử dụng';
            }
        }
        if (username) {
            const existingUsername = await this.prisma.user.findFirst({
                where: {
                    username,
                    ...(excludeId ? { id: { not: excludeId } } : {}),
                },
            });
            if (existingUsername) {
                result.usernameAvailable = false;
                result.usernameMessage = 'Tên đăng nhập đã được sử dụng';
            }
        }
        return {
            data: result,
            message: 'Kiểm tra tính khả dụng thành công',
        };
    }
    async ensureUniqueCredential(email, username, excludeId) {
        if (email) {
            const existingEmail = await this.prisma.user.findFirst({
                where: {
                    email: email.toLowerCase(),
                    ...(excludeId ? { id: { not: excludeId } } : {}),
                },
            });
            if (existingEmail) {
                throw new common_1.HttpException('Email đã được sử dụng', common_1.HttpStatus.CONFLICT);
            }
        }
        if (username) {
            const existingUsername = await this.prisma.user.findFirst({
                where: {
                    username,
                    ...(excludeId ? { id: { not: excludeId } } : {}),
                },
            });
            if (existingUsername) {
                throw new common_1.HttpException('Tên đăng nhập đã được sử dụng', common_1.HttpStatus.CONFLICT);
            }
        }
    }
    async resolveRoleId(roleName) {
        if (!roleName)
            return null;
        const role = await this.prisma.role.findUnique({
            where: { name: roleName },
        });
        return role?.id ?? null;
    }
    validateId(id) {
        if (!(0, validate_util_1.checkId)(id)) {
            throw new common_1.HttpException('ID không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    getStartOfMonth() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=user-management.service.js.map