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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailQueueService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../../../db/prisma.service");
let EmailQueueService = class EmailQueueService {
    constructor(emailQueue, prisma) {
        this.emailQueue = emailQueue;
        this.prisma = prisma;
    }
    async addTeacherAssignmentEmailJob(classId, teacherId, options) {
        const jobData = {
            type: 'teacher_assignment',
            classId,
            teacherId,
            priority: options?.priority || 0,
            delay: options?.delay || 0
        };
        try {
            const job = await this.emailQueue.add('send-teacher-assignment-email', jobData, {
                priority: jobData.priority,
                delay: jobData.delay,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
                removeOnComplete: 10,
                removeOnFail: 5,
            });
            console.log(`📧 Email job đã được thêm vào queue: ${job.id}`);
            return {
                success: true,
                jobId: job.id,
                message: 'Email job đã được thêm vào queue'
            };
        }
        catch (error) {
            console.error('❌ Lỗi khi thêm email job vào queue:', error);
            throw new Error(`Không thể thêm email job vào queue: ${error.message}`);
        }
    }
    async getQueueInfo() {
        try {
            const waiting = await this.emailQueue.getWaiting();
            const active = await this.emailQueue.getActive();
            const completed = await this.emailQueue.getCompleted();
            const failed = await this.emailQueue.getFailed();
            return {
                waiting: waiting.length,
                active: active.length,
                completed: completed.length,
                failed: failed.length,
                total: waiting.length + active.length + completed.length + failed.length
            };
        }
        catch (error) {
            console.error('❌ Lỗi khi lấy thông tin queue:', error);
            return null;
        }
    }
    async clearQueue() {
        try {
            await this.emailQueue.empty();
            console.log('🧹 Đã xóa tất cả jobs trong email queue');
            return { success: true, message: 'Queue đã được xóa' };
        }
        catch (error) {
            console.error('❌ Lỗi khi xóa queue:', error);
            throw new Error(`Không thể xóa queue: ${error.message}`);
        }
    }
    async removeJob(jobId) {
        try {
            const job = await this.emailQueue.getJob(jobId);
            if (job) {
                await job.remove();
                console.log(`🗑️ Đã xóa job ${jobId}`);
                return { success: true, message: `Job ${jobId} đã được xóa` };
            }
            else {
                return { success: false, message: `Không tìm thấy job ${jobId}` };
            }
        }
        catch (error) {
            console.error('❌ Lỗi khi xóa job:', error);
            throw new Error(`Không thể xóa job: ${error.message}`);
        }
    }
};
exports.EmailQueueService = EmailQueueService;
exports.EmailQueueService = EmailQueueService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bull_1.InjectQueue)('email')),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService])
], EmailQueueService);
//# sourceMappingURL=email-queue.service.js.map