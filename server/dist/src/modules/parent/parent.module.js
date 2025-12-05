"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParentModule = void 0;
const parent_middleware_1 = require("./../../common/middleware/parent/parent.middleware");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const academic_tracking_controller_1 = require("./controllers/academic-tracking.controller");
const class_information_controller_1 = require("./controllers/class-information.controller");
const communication_controller_1 = require("./controllers/communication.controller");
const financial_controller_1 = require("./controllers/financial.controller");
const materials_controller_1 = require("./controllers/materials.controller");
const student_management_controller_1 = require("./controllers/student-management.controller");
const student_leave_request_controller_1 = require("./controllers/student-leave-request.controller");
const child_classes_controller_1 = require("./controllers/child-classes.controller");
const class_join_controller_1 = require("./controllers/class-join.controller");
const academic_tracking_service_1 = require("./services/academic-tracking.service");
const class_information_service_1 = require("./services/class-information.service");
const communication_service_1 = require("./services/communication.service");
const financial_service_1 = require("./services/financial.service");
const materials_service_1 = require("./services/materials.service");
const student_management_service_1 = require("./services/student-management.service");
const student_leave_request_service_1 = require("./services/student-leave-request.service");
const class_join_service_1 = require("./services/class-join.service");
const prisma_service_1 = require("../../db/prisma.service");
const child_teacher_feedback_controller_1 = require("./controllers/child-teacher-feedback.controller");
const child_teacher_feedback_service_1 = require("./services/child-teacher-feedback.service");
const parent_overview_controller_1 = require("./controllers/parent-overview.controller");
const parent_overview_service_1 = require("./services/parent-overview.service");
const commitments_controller_1 = require("./controllers/commitments.controller");
const commitments_service_1 = require("./services/commitments.service");
const admin_center_module_1 = require("../admin-center/admin-center.module");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
let ParentModule = class ParentModule {
    configure(consumer) {
        consumer
            .apply(parent_middleware_1.MiddlewareParent)
            .forRoutes({ path: 'parent/*', method: common_1.RequestMethod.ALL });
    }
};
exports.ParentModule = ParentModule;
exports.ParentModule = ParentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            core_1.RouterModule.register([
                {
                    path: 'parent',
                    module: ParentModule,
                },
            ]),
            admin_center_module_1.AdminCenterModule,
        ],
        controllers: [
            academic_tracking_controller_1.AcademicTrackingController,
            class_information_controller_1.ClassInformationController,
            communication_controller_1.CommunicationController,
            financial_controller_1.FinancialController,
            materials_controller_1.MaterialsController,
            student_management_controller_1.StudentManagementController,
            student_leave_request_controller_1.StudentLeaveRequestController,
            child_classes_controller_1.ChildClassesController,
            class_join_controller_1.ClassJoinController,
            child_teacher_feedback_controller_1.ChildTeacherFeedbackController,
            parent_overview_controller_1.ParentOverviewController,
            commitments_controller_1.CommitmentsController,
        ],
        providers: [
            prisma_service_1.PrismaService,
            academic_tracking_service_1.AcademicTrackingService,
            class_information_service_1.ClassInformationService,
            communication_service_1.CommunicationService,
            financial_service_1.FinancialService,
            materials_service_1.MaterialsService,
            student_management_service_1.StudentManagementService,
            student_leave_request_service_1.StudentLeaveRequestService,
            class_join_service_1.ClassJoinService,
            child_teacher_feedback_service_1.ChildTeacherFeedbackService,
            parent_overview_service_1.ParentOverviewService,
            commitments_service_1.CommitmentsService,
            cloudinary_service_1.CloudinaryService,
        ],
    })
], ParentModule);
//# sourceMappingURL=parent.module.js.map