"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const academic_tracking_controller_1 = require("./controllers/academic-tracking.controller");
const class_information_controller_1 = require("./controllers/class-information.controller");
const enrollments_controller_1 = require("./controllers/enrollments.controller");
const materials_controller_1 = require("./controllers/materials.controller");
const notifications_controller_1 = require("./controllers/notifications.controller");
const profile_controller_1 = require("./controllers/profile.controller");
const schedule_controller_1 = require("./controllers/schedule.controller");
const academic_tracking_service_1 = require("./services/academic-tracking.service");
const class_information_service_1 = require("./services/class-information.service");
const enrollments_service_1 = require("./services/enrollments.service");
const materials_service_1 = require("./services/materials.service");
const notifications_service_1 = require("./services/notifications.service");
const profile_service_1 = require("./services/profile.service");
const schedule_service_1 = require("./services/schedule.service");
const prisma_service_1 = require("../../db/prisma.service");
const student_middleware_1 = require("../../common/middleware/student/student.middleware");
let StudentModule = class StudentModule {
    configure(consumer) {
        consumer.apply(student_middleware_1.MiddlewareStudent).forRoutes('student');
    }
};
exports.StudentModule = StudentModule;
exports.StudentModule = StudentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            core_1.RouterModule.register([
                {
                    path: 'student',
                    module: StudentModule,
                },
            ]),
        ],
        controllers: [
            academic_tracking_controller_1.AcademicTrackingController,
            academic_tracking_controller_1.GradesController,
            class_information_controller_1.ClassInformationController,
            enrollments_controller_1.EnrollmentsController,
            materials_controller_1.MaterialsController,
            notifications_controller_1.NotificationsController,
            profile_controller_1.ProfileController,
            schedule_controller_1.ScheduleController,
        ],
        providers: [
            prisma_service_1.PrismaService,
            academic_tracking_service_1.AcademicTrackingService,
            class_information_service_1.ClassInformationService,
            enrollments_service_1.EnrollmentsService,
            materials_service_1.MaterialsService,
            notifications_service_1.NotificationsService,
            profile_service_1.ProfileService,
            schedule_service_1.StudentScheduleService,
        ],
    })
], StudentModule);
//# sourceMappingURL=student.module.js.map