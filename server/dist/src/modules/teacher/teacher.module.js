"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherModule = void 0;
const common_1 = require("@nestjs/common");
const attendance_controller_1 = require("./controllers/attendance.controller");
const class_management_controller_1 = require("./controllers/class-management.controller");
const communication_controller_1 = require("./controllers/communication.controller");
const grade_controller_1 = require("./controllers/grade.controller");
const leave_request_controller_1 = require("./controllers/leave-request.controller");
const material_controller_1 = require("./controllers/material.controller");
const schedule_controller_1 = require("./controllers/schedule.controller");
const session_controller_1 = require("./controllers/session.controller");
const session_request_controller_1 = require("./controllers/session-request.controller");
const schedule_change_controller_1 = require("./controllers/schedule-change.controller");
const student_management_controller_1 = require("./controllers/student-management.controller");
const attendance_service_1 = require("./services/attendance.service");
const class_management_service_1 = require("./services/class-management.service");
const communication_service_1 = require("./services/communication.service");
const grade_service_1 = require("./services/grade.service");
const leave_request_service_1 = require("./services/leave-request.service");
const material_service_1 = require("./services/material.service");
const report_service_1 = require("./services/report.service");
const schedule_service_1 = require("./services/schedule.service");
const session_service_1 = require("./services/session.service");
const session_request_service_1 = require("./services/session-request.service");
const schedule_change_service_1 = require("./services/schedule-change.service");
const student_management_service_1 = require("./services/student-management.service");
const core_1 = require("@nestjs/core");
const teacher_middleware_1 = require("../../common/middleware/teacher/teacher.middleware");
const common_controller_1 = require("./controllers/common.controller");
const common_service_1 = require("./services/common.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const file_management_controller_1 = require("./controllers/file-management.controller");
const file_management_service_1 = require("./services/file-management.service");
const incident_report_controller_1 = require("./controllers/incident-report.controller");
const incident_report_service_1 = require("./services/incident-report.service");
const student_leave_request_controller_1 = require("./controllers/student-leave-request.controller");
const student_leave_request_service_1 = require("./services/student-leave-request.service");
const contracts_manage_controller_1 = require("./controllers/contracts-manage.controller");
const contracts_manage_service_1 = require("./services/contracts-manage.service");
const shared_module_1 = require("../shared/shared.module");
const prisma_service_1 = require("../../db/prisma.service");
let TeacherModule = class TeacherModule {
    configure(consumer) {
        consumer
            .apply(teacher_middleware_1.MiddlewareTeacher)
            .forRoutes({ path: 'teacher/*', method: common_1.RequestMethod.ALL });
    }
};
exports.TeacherModule = TeacherModule;
exports.TeacherModule = TeacherModule = __decorate([
    (0, common_1.Module)({
        imports: [
            core_1.RouterModule.register([
                {
                    path: 'teacher',
                    module: TeacherModule
                }
            ]),
            shared_module_1.SharedModule,
        ],
        controllers: [
            attendance_controller_1.AttendanceController,
            class_management_controller_1.ClassManagementController,
            communication_controller_1.CommunicationController,
            grade_controller_1.GradeController,
            leave_request_controller_1.LeaveRequestController,
            material_controller_1.MaterialController,
            schedule_controller_1.ScheduleController,
            session_controller_1.SessionController,
            session_request_controller_1.SessionRequestController,
            schedule_change_controller_1.ScheduleChangeController,
            student_management_controller_1.StudentManagementController,
            common_controller_1.CommonController,
            leave_request_controller_1.LeaveRequestController,
            file_management_controller_1.FileManagementController,
            incident_report_controller_1.IncidentReportController,
            contracts_manage_controller_1.ContractsManageController,
            student_leave_request_controller_1.TeacherStudentLeaveRequestController,
        ],
        providers: [
            attendance_service_1.AttendanceService,
            class_management_service_1.ClassManagementService,
            communication_service_1.CommunicationService,
            grade_service_1.GradeService,
            leave_request_service_1.LeaveRequestService,
            material_service_1.MaterialService,
            report_service_1.ReportService,
            schedule_service_1.ScheduleService,
            session_service_1.SessionService,
            session_request_service_1.SessionRequestService,
            schedule_change_service_1.ScheduleChangeService,
            student_management_service_1.StudentManagementService,
            common_service_1.CommonService,
            leave_request_service_1.LeaveRequestService,
            cloudinary_service_1.CloudinaryService,
            file_management_service_1.FileManagementService,
            incident_report_service_1.IncidentReportService,
            contracts_manage_service_1.ContractsManageService,
            student_leave_request_service_1.TeacherStudentLeaveRequestService,
            prisma_service_1.PrismaService,
        ],
        exports: [
            attendance_service_1.AttendanceService,
        ]
    })
], TeacherModule);
//# sourceMappingURL=teacher.module.js.map