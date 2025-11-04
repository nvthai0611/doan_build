"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const student_service_1 = require("./services/student.service");
const students_controller_1 = require("./controllers/students.controller");
const prisma_service_1 = require("../../db/prisma.service");
const grades_controller_1 = require("./controllers/grades.controller");
const grade_service_1 = require("./services/grade.service");
const core_1 = require("@nestjs/core");
const email_queue_service_1 = require("./services/email-queue.service");
const email_processor_service_1 = require("./services/email-processor.service");
const email_notification_service_1 = require("./services/email-notification.service");
const email_notification_processor_1 = require("./consumer/email_notification.processor");
const teacher_account_processor_1 = require("./consumer/teacher_account.processor");
const class_assign_teacher_processor_1 = require("./consumer/class_assign_teacher.processor");
const enrollment_email_processor_1 = require("./consumer/enrollment-email.processor");
const class_status_change_processor_1 = require("./consumer/class-status-change.processor");
const class_request_email_processor_1 = require("./consumer/class-request-email.processor");
const public_classes_controller_1 = require("./controllers/public-classes.controller");
const public_classes_service_1 = require("./services/public-classes.service");
const public_showcases_controller_1 = require("./controllers/public-showcases.controller");
const public_showcases_service_1 = require("./services/public-showcases.service");
const DEFAULT_BULL_JOB_OPTIONS = {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
        type: 'exponential',
        delay: 2000,
    },
};
let SharedModule = class SharedModule {
};
exports.SharedModule = SharedModule;
exports.SharedModule = SharedModule = __decorate([
    (0, common_1.Module)({
        imports: [
            core_1.RouterModule.register([
                {
                    path: 'shared',
                    module: SharedModule,
                },
            ]),
            bull_1.BullModule.registerQueue({
                name: 'email',
                defaultJobOptions: DEFAULT_BULL_JOB_OPTIONS,
            }),
            bull_1.BullModule.registerQueue({
                name: 'email_notification',
                defaultJobOptions: DEFAULT_BULL_JOB_OPTIONS,
            }),
            bull_1.BullModule.registerQueue({
                name: 'teacher_account',
                defaultJobOptions: DEFAULT_BULL_JOB_OPTIONS,
            }),
            bull_1.BullModule.registerQueue({
                name: 'class_assign_teacher',
                defaultJobOptions: DEFAULT_BULL_JOB_OPTIONS,
            }),
            bull_1.BullModule.registerQueue({
                name: 'enrollment_email',
                defaultJobOptions: DEFAULT_BULL_JOB_OPTIONS,
            }),
            bull_1.BullModule.registerQueue({
                name: 'class_status_change_email',
                defaultJobOptions: DEFAULT_BULL_JOB_OPTIONS,
            }),
            bull_1.BullModule.registerQueue({
                name: 'class_request_email',
                defaultJobOptions: DEFAULT_BULL_JOB_OPTIONS,
            }),
        ],
        controllers: [
            students_controller_1.StudentsSharedController,
            grades_controller_1.GradesController,
            public_classes_controller_1.PublicClassesController,
            public_showcases_controller_1.PublicShowcasesController
        ],
        providers: [
            prisma_service_1.PrismaService,
            student_service_1.StudentSharedService,
            grade_service_1.GradeService,
            public_classes_service_1.PublicClassesService,
            public_showcases_service_1.PublicShowcasesService,
            email_queue_service_1.EmailQueueService,
            email_processor_service_1.EmailProcessor,
            email_notification_service_1.EmailNotificationService,
            email_notification_processor_1.EmailNotificationProcessor,
            teacher_account_processor_1.TeacherAccountProcessor,
            class_assign_teacher_processor_1.ClassAssignTeacherProcessor,
            enrollment_email_processor_1.EnrollmentEmailProcessor,
            class_status_change_processor_1.ClassStatusChangeProcessor,
            class_request_email_processor_1.ClassRequestEmailProcessor
        ],
        exports: [
            student_service_1.StudentSharedService,
            grade_service_1.GradeService,
            prisma_service_1.PrismaService,
            email_queue_service_1.EmailQueueService,
            email_notification_service_1.EmailNotificationService,
        ],
    })
], SharedModule);
//# sourceMappingURL=shared.module.js.map