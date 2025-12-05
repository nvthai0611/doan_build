"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const permission_service_1 = require("./permission.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const prisma_service_1 = require("../../db/prisma.service");
const admin_center_module_1 = require("../admin-center/admin-center.module");
const cloudinary_module_1 = require("../cloudinary/cloudinary.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [admin_center_module_1.AdminCenterModule, cloudinary_module_1.CloudinaryModule],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, permission_service_1.PermissionService, jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, prisma_service_1.PrismaService],
        exports: [auth_service_1.AuthService, permission_service_1.PermissionService, jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map