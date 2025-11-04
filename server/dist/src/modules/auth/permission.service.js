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
exports.PermissionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../db/prisma.service");
let PermissionService = class PermissionService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRolePermissions(roleName) {
        const role = await this.prisma.role.findUnique({
            where: { name: roleName },
            include: {
                rolePermissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });
        if (!role) {
            return [];
        }
        return role.rolePermissions
            .filter(rp => rp.permission.isActive)
            .map(rp => ({
            id: rp.permission.id,
            name: rp.permission.name,
            displayName: rp.permission.displayName,
            description: rp.permission.description,
            module: rp.permission.module,
            action: rp.permission.action,
            isActive: rp.permission.isActive
        }));
    }
    async getUserPermissions(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
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
        if (!user || !user.roleData) {
            return [];
        }
        return user.roleData.rolePermissions
            .filter(rp => rp.permission.isActive)
            .map(rp => ({
            id: rp.permission.id,
            name: rp.permission.name,
            displayName: rp.permission.displayName,
            description: rp.permission.description,
            module: rp.permission.module,
            action: rp.permission.action,
            isActive: rp.permission.isActive
        }));
    }
    async hasPermission(userId, permissionName) {
        const permissions = await this.getUserPermissions(userId);
        return permissions.some(permission => permission.name === permissionName);
    }
    async hasAnyPermission(userId, permissionNames) {
        const permissions = await this.getUserPermissions(userId);
        const userPermissionNames = permissions.map(p => p.name);
        return permissionNames.some(permissionName => userPermissionNames.includes(permissionName));
    }
    async hasAllPermissions(userId, permissionNames) {
        const permissions = await this.getUserPermissions(userId);
        const userPermissionNames = permissions.map(p => p.name);
        return permissionNames.every(permissionName => userPermissionNames.includes(permissionName));
    }
    async getAllRoles() {
        const roles = await this.prisma.role.findMany({
            where: { isActive: true },
            include: {
                rolePermissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });
        return roles.map(role => ({
            id: role.id,
            name: role.name,
            displayName: role.displayName,
            description: role.description,
            isActive: role.isActive,
            permissions: role.rolePermissions
                .filter(rp => rp.permission.isActive)
                .map(rp => ({
                id: rp.permission.id,
                name: rp.permission.name,
                displayName: rp.permission.displayName,
                description: rp.permission.description,
                module: rp.permission.module,
                action: rp.permission.action,
                isActive: rp.permission.isActive
            }))
        }));
    }
    async getAllPermissions() {
        const permissions = await this.prisma.permission.findMany({
            where: { isActive: true }
        });
        return permissions.map(permission => ({
            id: permission.id,
            name: permission.name,
            displayName: permission.displayName,
            description: permission.description,
            module: permission.module,
            action: permission.action,
            isActive: permission.isActive
        }));
    }
    async assignPermissionsToRole(roleId, permissionIds) {
        await this.prisma.rolePermission.deleteMany({
            where: { roleId }
        });
        await this.prisma.rolePermission.createMany({
            data: permissionIds.map(permissionId => ({
                roleId,
                permissionId
            }))
        });
    }
    async createPermission(data) {
        const permission = await this.prisma.permission.create({
            data
        });
        return {
            id: permission.id,
            name: permission.name,
            displayName: permission.displayName,
            description: permission.description,
            module: permission.module,
            action: permission.action,
            isActive: permission.isActive
        };
    }
    async createRole(data) {
        const role = await this.prisma.role.create({
            data,
            include: {
                rolePermissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });
        return {
            id: role.id,
            name: role.name,
            displayName: role.displayName,
            description: role.description,
            isActive: role.isActive,
            permissions: []
        };
    }
};
exports.PermissionService = PermissionService;
exports.PermissionService = PermissionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PermissionService);
//# sourceMappingURL=permission.service.js.map