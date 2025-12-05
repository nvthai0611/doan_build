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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const loginDto_1 = require("./dto/loginDto");
const change_password_dto_1 = require("./dto/change-password.dto");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const register_parent_dto_1 = require("./dto/register-parent.dto");
const auth_service_1 = require("./auth.service");
const permission_service_1 = require("./permission.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let AuthController = class AuthController {
    constructor(authService, permissionService) {
        this.authService = authService;
        this.permissionService = permissionService;
    }
    async login(loginDto) {
        const result = await this.authService.login(loginDto.identifier, loginDto.password);
        return {
            success: true,
            message: 'Đăng nhập thành công',
            data: result,
        };
    }
    async registerParent(registerDto) {
        const result = await this.authService.registerParent(registerDto);
        return result;
    }
    async profile(req) {
        const userId = req.user.userId;
        const profile = await this.authService.getProfile(userId);
        return {
            success: true,
            message: 'Lấy thông tin profile thành công',
            data: profile,
        };
    }
    async logout(req) {
        const userId = req.user.userId;
        const result = await this.authService.logout(userId);
        return result;
    }
    async refresh(refreshToken) {
        if (!refreshToken) {
            throw new Error('Refresh token không được cung cấp');
        }
        const result = await this.authService.refreshToken(refreshToken);
        return {
            success: true,
            message: 'Làm mới token thành công',
            data: result,
        };
    }
    async changePassword(changePasswordDto, req) {
        const userId = req.user.userId;
        const { oldPassword, newPassword } = changePasswordDto;
        const result = await this.authService.changePassword(userId, oldPassword, newPassword);
        return result;
    }
    async updateProfile(updateProfileDto, req) {
        const userId = req.user.userId;
        const profile = await this.authService.updateProfile(userId, updateProfileDto);
        return {
            success: true,
            message: 'Cập nhật profile thành công',
            data: profile,
        };
    }
    async getActiveSessions(req) {
        const userId = req.user.userId;
        const sessions = await this.authService.getActiveSessions(userId);
        return {
            success: true,
            message: 'Lấy danh sách session thành công',
            data: sessions,
        };
    }
    async revokeSession(sessionId, req) {
        const userId = req.user.userId;
        const result = await this.authService.revokeSession(userId, sessionId);
        return result;
    }
    async getUserPermissions(req) {
        const userId = req.user.userId;
        const permissions = await this.permissionService.getUserPermissions(userId);
        return {
            success: true,
            message: 'Lấy danh sách quyền thành công',
            data: permissions,
        };
    }
    async checkPermission(permissionName, req) {
        const userId = req.user.userId;
        const hasPermission = await this.permissionService.hasPermission(userId, permissionName);
        return {
            success: true,
            message: 'Kiểm tra quyền thành công',
            data: { hasPermission, permissionName },
        };
    }
    async getAllRoles() {
        const roles = await this.permissionService.getAllRoles();
        return {
            success: true,
            message: 'Lấy danh sách vai trò thành công',
            data: roles,
        };
    }
    async getAllPermissions() {
        const permissions = await this.permissionService.getAllPermissions();
        return {
            success: true,
            message: 'Lấy danh sách tất cả quyền thành công',
            data: permissions,
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [loginDto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register/parent'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_parent_dto_1.RegisterParentDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerParent", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "profile", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('refresh'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Headers)('refresh-token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Patch)('change-password'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [change_password_dto_1.ChangePasswordDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Patch)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_profile_dto_1.UpdateProfileDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('sessions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getActiveSessions", null);
__decorate([
    (0, common_1.Delete)('sessions/:sessionId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "revokeSession", null);
__decorate([
    (0, common_1.Get)('permissions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getUserPermissions", null);
__decorate([
    (0, common_1.Get)('permissions/check/:permissionName'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('permissionName')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkPermission", null);
__decorate([
    (0, common_1.Get)('roles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getAllRoles", null);
__decorate([
    (0, common_1.Get)('all-permissions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getAllPermissions", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        permission_service_1.PermissionService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map