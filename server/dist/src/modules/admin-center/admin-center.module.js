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
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const approval_management_controller_1 = require("./controllers/approval-management.controller");
const class_management_controller_1 = require("./controllers/class-management.controller");
const enrollment_management_controller_1 = require("./controllers/enrollment-management.controller");
const financial_management_controller_1 = require("./controllers/financial-management.controller");
const leave_requests_controller_1 = require("./controllers/leave-requests.controller");
const session_requests_controller_1 = require("./controllers/session-requests.controller");
const schedule_management_controller_1 = require("./controllers/schedule-management.controller");
const teacher_management_controller_1 = require("./controllers/teacher-management.controller");
const approval_management_service_1 = require("./services/approval-management.service");
const class_management_service_1 = require("./services/class-management.service");
const enrollment_management_service_1 = require("./services/enrollment-management.service");
const financial_management_service_1 = require("./services/financial-management.service");
const leave_requests_service_1 = require("./services/leave-requests.service");
const session_requests_service_1 = require("./services/session-requests.service");
const schedule_management_service_1 = require("./services/schedule-management.service");
const teacher_management_service_1 = require("./services/teacher-management.service");
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
const class_notification_cron_service_1 = require("./crons/class-notification-cron.service");
const feedback_analysis_cron_service_1 = require("./crons/feedback-analysis-cron.service");
const class_notification_service_1 = require("./services/class-notification.service");
const contract_upload_controller_1 = require("./controllers/contract-upload.controller");
const contract_upload_service_1 = require("./services/contract-upload.service");
const rooms_management_controller_1 = require("./controllers/rooms-management.controller");
const rooms_management_service_1 = require("./services/rooms-management.service");
const subject_management_controller_1 = require("./controllers/subject-management.controller");
const subject_management_service_1 = require("./services/subject-management.service");
const payroll_teacher_service_1 = require("./services/payroll-teacher.service");
const payroll_teacher_controller_1 = require("./controllers/payroll-teacher.controller");
const center_info_controller_1 = require("./controllers/center-info.controller");
const center_info_service_1 = require("./services/center-info.service");
const cloudinary_module_1 = require("../cloudinary/cloudinary.module");
const school_management_controller_1 = require("./controllers/school-management.controller");
const school_management_service_1 = require("./services/school-management.service");
const job_trigger_controller_1 = require("./controllers/job-trigger.controller");
const bill_cron_service_1 = require("../cronjob/service/bill-cron.service");
const payroll_teacherv2_service_1 = require("../cronjob/service/payroll-teacherv2.service");
const trigger_management_service_1 = require("./services/trigger-management.service");
const send_email_bill_service_1 = require("../cronjob/service/send-email-bill.service");
const email_notification_bill_service_1 = require("../shared/services/email-notification-bill.service");
const bull_1 = require("@nestjs/bull");
const change_status_session_service_1 = require("../cronjob/service/change-status-session.service");
const email_notification_payroll_service_1 = require("../shared/services/email-notification-payroll.service");
const financial_reports_controller_1 = require("./controllers/financial-reports.controller");
const financial_reports_service_1 = require("./services/financial-reports.service");
const scholarship_management_controller_1 = require("./controllers/scholarship-management.controller");
const scholarship_management_service_1 = require("./services/scholarship-management.service");
const schedule_change_controller_1 = require("./controllers/schedule-change.controller");
const schedule_change_service_1 = require("./services/schedule-change.service");
const schedule_conflict_controller_1 = require("./controllers/schedule-conflict.controller");
const schedule_conflict_service_1 = require("./services/schedule-conflict.service");
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
            bull_1.BullModule.registerQueue({
                name: 'payroll-notification',
            }),
            bull_1.BullModule.registerQueue({
                name: 'payroll-recalculation',
            }),
            bull_1.BullModule.registerQueue({
                name: 'payroll-payment-notification',
            }),
            core_1.RouterModule.register([
                {
                    path: 'admin-center',
                    module: AdminCenterModule,
                },
            ]),
            axios_1.HttpModule,
            config_1.ConfigModule,
            shared_module_1.SharedModule,
            cloudinary_module_1.CloudinaryModule,
        ],
        controllers: [
            approval_management_controller_1.ApprovalManagementController,
            class_management_controller_1.ClassManagementController,
            enrollment_management_controller_1.EnrollmentManagementController,
            financial_management_controller_1.FinancialManagementController,
            leave_requests_controller_1.LeaveRequestsController,
            session_requests_controller_1.SessionRequestsController,
            schedule_management_controller_1.ScheduleManagementController,
            schedule_change_controller_1.ScheduleChangeAdminController,
            teacher_management_controller_1.TeacherManagementController,
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
            contract_upload_controller_1.ContractUploadController,
            rooms_management_controller_1.RoomsManagementController,
            subject_management_controller_1.SubjectManagementController,
            payroll_teacher_controller_1.PayrollTeacherController,
            center_info_controller_1.CenterInfoController,
            school_management_controller_1.SchoolManagementController,
            job_trigger_controller_1.JobTriggerController,
            financial_reports_controller_1.FinancialReportsController,
            scholarship_management_controller_1.ScholarshipManagementController,
            schedule_conflict_controller_1.ScheduleConflictController,
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
            schedule_change_service_1.ScheduleChangeAdminService,
            teacher_management_service_1.TeacherManagementService,
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
            contract_upload_service_1.ContractUploadService,
            rooms_management_service_1.RoomsManagementService,
            subject_management_service_1.SubjectManagementService,
            class_notification_service_1.ClassNotificationService,
            class_notification_cron_service_1.ClassNotificationCronService,
            feedback_analysis_cron_service_1.FeedbackAnalysisCronService,
            payroll_teacher_service_1.PayRollTeacherService,
            center_info_service_1.CenterInfoService,
            school_management_service_1.SchoolManagementService,
            bill_cron_service_1.BillCronService,
            payroll_teacherv2_service_1.PayrollCronService,
            trigger_management_service_1.TriggerManagementService,
            send_email_bill_service_1.FeeReminderService,
            email_notification_bill_service_1.EmailServiceNotificationBill,
            change_status_session_service_1.ChangeStatusSessionService,
            email_notification_payroll_service_1.EmailNotificationPayrollService,
            financial_reports_service_1.FinancialReportsService,
            scholarship_management_service_1.ScholarshipManagementService,
            schedule_conflict_service_1.ScheduleConflictService,
        ],
        exports: [alert_service_1.AlertService, holidays_setting_service_1.HolidaysSettingService, teacher_feedback_service_1.TeacherFeedbackService],
    })
], AdminCenterModule);
//# sourceMappingURL=admin-center.module.js.map