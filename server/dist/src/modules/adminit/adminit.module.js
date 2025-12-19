"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminitModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../../db/prisma.service");
const adminit_middleware_1 = require("../../common/middleware/adminit/adminit.middleware");
const audit_log_controller_1 = require("./controllers/audit-log.controller");
const audit_log_service_1 = require("./services/audit-log.service");
const user_management_service_1 = require("./services/user-management.service");
const user_management_controller_1 = require("./controllers/user-management.controller");
let AdminitModule = class AdminitModule {
    configure(consumer) {
        consumer
            .apply(adminit_middleware_1.MiddlewareAdminit)
            .forRoutes({ path: 'adminit/*', method: common_1.RequestMethod.ALL });
    }
};
exports.AdminitModule = AdminitModule;
exports.AdminitModule = AdminitModule = __decorate([
    (0, common_1.Module)({
        imports: [
            core_1.RouterModule.register([
                {
                    path: "adminit",
                    module: AdminitModule,
                },
            ]),
        ],
        controllers: [audit_log_controller_1.AuditLogController, user_management_controller_1.UsersController],
        providers: [prisma_service_1.PrismaService, audit_log_service_1.AuditLogService, user_management_service_1.UsersService],
        exports: [audit_log_service_1.AuditLogService, user_management_service_1.UsersService],
    })
], AdminitModule);
//# sourceMappingURL=adminit.module.js.map