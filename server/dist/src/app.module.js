"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const config_1 = require("@nestjs/config");
const auth_middleware_1 = require("./common/middleware/auth/auth.middleware");
const auth_module_1 = require("./modules/auth/auth.module");
const auth_service_1 = require("./modules/auth/auth.service");
const prisma_service_1 = require("./db/prisma.service");
const students_module_1 = require("./modules/manager/students/students.module");
const parent_module_1 = require("./modules/parent/parent.module");
const schools_module_1 = require("./modules/school/schools/schools.module");
const class_requests_module_1 = require("./modules/school/class-requests/class-requests.module");
const class_sessions_module_1 = require("./modules/school/class-sessions/class-sessions.module");
const subjects_module_1 = require("./modules/school/subjects/subjects.module");
const rooms_module_1 = require("./modules/school/rooms/rooms.module");
const teacher_module_1 = require("./modules/teacher/teacher.module");
const student_module_1 = require("./modules/student/student.module");
const admin_center_module_1 = require("./modules/admin-center/admin-center.module");
const cloudinary_module_1 = require("./modules/cloudinary/cloudinary.module");
const shared_module_1 = require("./modules/shared/shared.module");
const bull_1 = require("@nestjs/bull");
const schedule_1 = require("@nestjs/schedule");
const api_key_middleware_1 = require("./common/middleware/api-key.middleware");
const payment_module_1 = require("./modules/payment/payment.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(api_key_middleware_1.ApiKeyMiddleware).forRoutes('*');
        consumer.apply(auth_middleware_1.AuthMiddleware).forRoutes({
            path: 'auth/profile',
            method: common_1.RequestMethod.GET,
        }, {
            path: 'auth/logout',
            method: common_1.RequestMethod.POST,
        });
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
            schedule_1.ScheduleModule.forRoot(),
            bull_1.BullModule.forRoot({
                redis: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT) || 6379,
                    password: process.env.REDIS_PASSWORD || undefined,
                    db: parseInt(process.env.REDIS_DB) || 0,
                },
            }),
            auth_module_1.AuthModule,
            teacher_module_1.TeacherModule,
            student_module_1.StudentModule,
            students_module_1.StudentsModule,
            parent_module_1.ParentModule,
            schools_module_1.SchoolsModule,
            class_requests_module_1.ClassRequestsModule,
            class_sessions_module_1.ClassSessionsModule,
            subjects_module_1.SubjectsModule,
            rooms_module_1.RoomsModule,
            admin_center_module_1.AdminCenterModule,
            cloudinary_module_1.CloudinaryModule,
            shared_module_1.SharedModule,
            payment_module_1.PaymentModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, auth_service_1.AuthService, prisma_service_1.PrismaService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map