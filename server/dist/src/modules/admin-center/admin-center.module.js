"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCenterModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const approval_management_controller_1 = require("./controllers/approval-management.controller");
const class_management_controller_1 = require("./controllers/class-management.controller");
const enrollment_management_controller_1 = require("./controllers/enrollment-management.controller");
const financial_management_controller_1 = require("./controllers/financial-management.controller");
const leave_requests_controller_1 = require("./controllers/leave-requests.controller");
const session_requests_controller_1 = require("./controllers/session-requests.controller");
const schedule_management_controller_1 = require("./controllers/schedule-management.controller");
const teacher_management_controller_1 = require("./controllers/teacher-management.controller");
const user_management_controller_1 = require("./controllers/user-management.controller");
const approval_management_service_1 = require("./services/approval-management.service");
const class_management_service_1 = require("./services/class-management.service");
const enrollment_management_service_1 = require("./services/enrollment-management.service");
const financial_management_service_1 = require("./services/financial-management.service");
const leave_requests_service_1 = require("./services/leave-requests.service");
const session_requests_service_1 = require("./services/session-requests.service");
const schedule_management_service_1 = require("./services/schedule-management.service");
const teacher_management_service_1 = require("./services/teacher-management.service");
const user_management_service_1 = require("./services/user-management.service");
const prisma_service_1 = require("../../db/prisma.service");
const core_1 = require("@nestjs/core");
const student_management_controller_1 = require("./controllers/student-management.controller");
const student_management_service_1 = require("./services/student-management.service");
const incident_handle_controller_1 = require("./controllers/incident-handle.controller");
const incident_handle_service_1 = require("./services/incident-handle.service");
const parent_management_controller_1 = require("./controllers/parent-management.controller");
const parent_management_service_1 = require("./services/parent-management.service");
const shared_module_1 = require("../shared/shared.module");
const settings_management_controller_1 = require("./controllers/settings-management.controller");
const settings_management_service_1 = require("./services/settings-management.service");
const holidays_setting_controller_1 = require("./controllers/holidays-setting.controller");
const holidays_setting_service_1 = require("./services/holidays-setting.service");
const file_management_controller_1 = require("./controllers/file-management.controller");
const file_management_service_1 = require("./services/file-management.service");
const alert_controller_1 = require("./controllers/alert.controller");
const alert_service_1 = require("./services/alert.service");
const student_class_request_controller_1 = require("./controllers/student-class-request.controller");
const student_class_request_service_1 = require("./services/student-class-request.service");
const teacher_feedback_controller_1 = require("./controllers/teacher-feedback.controller");
const teacher_feedback_service_1 = require("./services/teacher-feedback.service");
const teacher_feedback_monitoring_controller_1 = require("./controllers/teacher-feedback-monitoring.controller");
const teacher_feedback_monitoring_service_1 = require("./services/teacher-feedback-monitoring.service");
const showcase_management_controller_1 = require("./controllers/showcase-management.controller");
const showcase_management_service_1 = require("./services/showcase-management.service");
const center_owner_middleware_1 = require("../../common/middleware/center-owner/center-owner.middleware");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
let AdminCenterModule = class AdminCenterModule {
    configure(consumer) {
        consumer
            .apply(center_owner_middleware_1.MiddlewareCenterOwner)
            .forRoutes({ path: 'admin-center/*', method: common_1.RequestMethod.ALL });
    }
};
exports.AdminCenterModule = AdminCenterModule;
exports.AdminCenterModule = AdminCenterModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            core_1.RouterModule.register([
                {
                    path: "admin-center",
                    module: AdminCenterModule,
                },
            ]),
            shared_module_1.SharedModule,
        ],
        controllers: [
            approval_management_controller_1.ApprovalManagementController,
            class_management_controller_1.ClassManagementController,
            enrollment_management_controller_1.EnrollmentManagementController,
            financial_management_controller_1.FinancialManagementController,
            leave_requests_controller_1.LeaveRequestsController,
            session_requests_controller_1.SessionRequestsController,
            schedule_management_controller_1.ScheduleManagementController,
            teacher_management_controller_1.TeacherManagementController,
            user_management_controller_1.UsersController,
            student_management_controller_1.StudentManagementController,
            incident_handle_controller_1.IncidentHandleController,
            parent_management_controller_1.ParentManagementController,
            settings_management_controller_1.SettingsManagementController,
            holidays_setting_controller_1.HolidaysSettingController,
            file_management_controller_1.FileManagementController,
            alert_controller_1.AlertController,
            student_class_request_controller_1.StudentClassRequestController,
            teacher_feedback_controller_1.TeacherFeedbackController,
            teacher_feedback_monitoring_controller_1.TeacherFeedbackMonitoringController,
            showcase_management_controller_1.ShowcaseManagementController,
        ],
        providers: [
            prisma_service_1.PrismaService,
            approval_management_service_1.ApprovalManagementService,
            class_management_service_1.ClassManagementService,
            enrollment_management_service_1.EnrollmentManagementService,
            financial_management_service_1.FinancialManagementService,
            leave_requests_service_1.LeaveRequestsService,
            session_requests_service_1.SessionRequestsService,
            schedule_management_service_1.ScheduleManagementService,
            teacher_management_service_1.TeacherManagementService,
            user_management_service_1.UsersService,
            student_management_service_1.StudentManagementService,
            incident_handle_service_1.IncidentHandleService,
            parent_management_service_1.ParentManagementService,
            settings_management_service_1.SettingsManagementService,
            holidays_setting_service_1.HolidaysSettingService,
            file_management_service_1.FileManagementService,
            alert_service_1.AlertService,
            student_class_request_service_1.StudentClassRequestService,
            teacher_feedback_service_1.TeacherFeedbackService,
            teacher_feedback_monitoring_service_1.TeacherFeedbackMonitoringService,
            showcase_management_service_1.ShowcaseManagementService,
            cloudinary_service_1.CloudinaryService,
        ],
        exports: [alert_service_1.AlertService, holidays_setting_service_1.HolidaysSettingService],
    })
], AdminCenterModule);
//# sourceMappingURL=admin-center.module.js.map