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
var JobTriggerController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobTriggerController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../../../db/prisma.service");
const bill_cron_service_1 = require("../../cronjob/service/bill-cron.service");
const payroll_teacherv2_service_1 = require("../../cronjob/service/payroll-teacherv2.service");
const trigger_management_service_1 = require("../services/trigger-management.service");
const cron_job_filter_dto_1 = require("../dto/cron-job-filter.dto");
const send_email_bill_service_1 = require("../../cronjob/service/send-email-bill.service");
const change_status_session_service_1 = require("../../cronjob/service/change-status-session.service");
let JobTriggerController = JobTriggerController_1 = class JobTriggerController {
    constructor(billCron, payrollCron, feeReminder, prisma, triggerManagement, changeStatusSession) {
        this.billCron = billCron;
        this.payrollCron = payrollCron;
        this.feeReminder = feeReminder;
        this.prisma = prisma;
        this.triggerManagement = triggerManagement;
        this.changeStatusSession = changeStatusSession;
        this.logger = new common_1.Logger(JobTriggerController_1.name);
    }
    async triggerBillGeneration() {
        this.logger.warn('Kích hoạt tạo Hóa đơn HỌC SINH bằng tay!');
        await this.checkIfJobRunning('bill_generation');
        this.billCron.handleCreateMonthlyStudentBills();
        return { message: 'Quy trình tạo hóa đơn HỌC SINH đã bắt đầu.' };
    }
    async triggerPayrollGeneration() {
        this.logger.warn('Kích hoạt tạo Bảng Lương GIÁO VIÊN bằng tay!');
        await this.checkIfJobRunning('teacher_payroll_generation');
        this.payrollCron.handleGenerateTeacherPayroll();
        return { message: 'Quy trình tạo bảng lương GIÁO VIÊN đã bắt đầu.' };
    }
    async triggerBillPublish() {
        this.logger.warn('Kích hoạt tạo Bảng Lương GIÁO VIÊN bằng tay!');
        await this.checkIfJobRunning('bill_publishing');
        this.billCron.handlePublishCalculatedBills();
        return { message: 'Quy trình tạo bảng lương GIÁO VIÊN đã bắt đầu.' };
    }
    async triggerEarlyFeeReminder() {
        this.logger.warn('Kích hoạt gửi email nhắc nhở học phí sớm bằng tay!');
        await this.checkIfJobRunning('fee_reminder_early');
        this.feeReminder.handleEarlyFeeReminder();
        return { message: 'Quy trình gửi email nhắc nhở học phí sớm đã bắt đầu.' };
    }
    async triggerDueFeeReminder() {
        this.logger.warn('Kích hoạt gửi email nhắc hạn đóng học phí bằng tay!');
        await this.checkIfJobRunning('fee_reminder_due');
        this.feeReminder.handleDueFeeReminder();
        return { message: 'Quy trình gửi email nhắc hạn đóng học phí đã bắt đầu.' };
    }
    async triggerChangeStatusSession() {
        this.logger.warn('Kích hoạt chuyển trạng thái buổi học bằng tay!');
        await this.checkIfJobRunning('change-status-session');
        this.changeStatusSession.manualChangeStatusSession();
        return { message: 'Quy trình chuyển trạng thái buổi học đã bắt đầu.' };
    }
    async listCronJobs(filters) {
        return this.triggerManagement.listCronJobs({
            ...filters,
            startDate: filters.startDate ? new Date(filters.startDate) : undefined,
            endDate: filters.endDate ? new Date(filters.endDate) : undefined,
        });
    }
    async getAllTypeController() {
        return this.triggerManagement.getAllType();
    }
    async getLatestExecutions() {
        return this.triggerManagement.getLatestExecutions();
    }
    async getJobTypes() {
        return this.triggerManagement.getJobTypes();
    }
    async getCronJobHistory(jobType, filters) {
        return this.triggerManagement.getCronJobHistory(jobType, {
            ...filters,
            startDate: filters.startDate ? new Date(filters.startDate) : undefined,
            endDate: filters.endDate ? new Date(filters.endDate) : undefined,
        });
    }
    async getCronJobStats(jobType, query) {
        return this.triggerManagement.getCronJobStats(jobType, query.days);
    }
    async getCronJobDetails(id) {
        return this.triggerManagement.getCronJobDetails(id);
    }
    async retryCronJob(id) {
        return this.triggerManagement.retryCronJob(id);
    }
    async checkIfJobRunning(jobType) {
        const runningJob = await this.prisma.cronJobExecution.findFirst({
            where: {
                jobType: jobType,
                status: 'running',
            },
        });
        if (runningJob) {
            this.logger.warn(`Job ${jobType} đang chạy. Kích hoạt thủ công bị từ chối.`);
            throw new common_1.HttpException('Quy trình đã đang chạy. Vui lòng chờ nó hoàn thành.', common_1.HttpStatus.CONFLICT);
        }
    }
};
exports.JobTriggerController = JobTriggerController;
__decorate([
    (0, common_1.Post)('bill_generation'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger bill generation job manually' }),
    openapi.ApiResponse({ status: 201 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobTriggerController.prototype, "triggerBillGeneration", null);
__decorate([
    (0, common_1.Post)('teacher_payroll_generation'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger payroll generation job manually' }),
    openapi.ApiResponse({ status: 201 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobTriggerController.prototype, "triggerPayrollGeneration", null);
__decorate([
    (0, common_1.Post)('bill_publishing'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger payroll generation job manually' }),
    openapi.ApiResponse({ status: 201 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobTriggerController.prototype, "triggerBillPublish", null);
__decorate([
    (0, common_1.Post)('fee_reminder_early'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger early fee reminder job manually' }),
    openapi.ApiResponse({ status: 201 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobTriggerController.prototype, "triggerEarlyFeeReminder", null);
__decorate([
    (0, common_1.Post)('fee_reminder_due'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger due date fee reminder job manually' }),
    openapi.ApiResponse({ status: 201 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobTriggerController.prototype, "triggerDueFeeReminder", null);
__decorate([
    (0, common_1.Post)('change-status-session'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger change status session job manually' }),
    openapi.ApiResponse({ status: 201 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobTriggerController.prototype, "triggerChangeStatusSession", null);
__decorate([
    (0, common_1.Get)('executions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all cron job executions (latest of each type)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cron_job_filter_dto_1.CronJobFilterDto]),
    __metadata("design:returntype", Promise)
], JobTriggerController.prototype, "listCronJobs", null);
__decorate([
    (0, common_1.Get)('types'),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobTriggerController.prototype, "getAllTypeController", null);
__decorate([
    (0, common_1.Get)('executions/latest'),
    (0, swagger_1.ApiOperation)({ summary: 'Get latest execution of each job type' }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobTriggerController.prototype, "getLatestExecutions", null);
__decorate([
    (0, common_1.Get)('executions/types'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all available job types' }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobTriggerController.prototype, "getJobTypes", null);
__decorate([
    (0, common_1.Get)('executions/history/:jobType'),
    (0, swagger_1.ApiOperation)({ summary: 'Get execution history of specific job type' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('jobType')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JobTriggerController.prototype, "getCronJobHistory", null);
__decorate([
    (0, common_1.Get)('executions/stats/:jobType'),
    (0, swagger_1.ApiOperation)({ summary: 'Get statistics for specific job type' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('jobType')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JobTriggerController.prototype, "getCronJobStats", null);
__decorate([
    (0, common_1.Get)('executions/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get cron job execution details by ID' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JobTriggerController.prototype, "getCronJobDetails", null);
__decorate([
    (0, common_1.Post)('executions/:id/retry'),
    (0, swagger_1.ApiOperation)({ summary: 'Retry a failed cron job' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JobTriggerController.prototype, "retryCronJob", null);
exports.JobTriggerController = JobTriggerController = JobTriggerController_1 = __decorate([
    (0, swagger_1.ApiTags)('Admin Center - Job Triggers'),
    (0, common_1.Controller)('triggers'),
    __metadata("design:paramtypes", [bill_cron_service_1.BillCronService,
        payroll_teacherv2_service_1.PayrollCronService,
        send_email_bill_service_1.FeeReminderService,
        prisma_service_1.PrismaService,
        trigger_management_service_1.TriggerManagementService,
        change_status_session_service_1.ChangeStatusSessionService])
], JobTriggerController);
//# sourceMappingURL=job-trigger.controller.js.map