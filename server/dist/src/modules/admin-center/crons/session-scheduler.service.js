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
var SessionSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../../db/prisma.service");
const crypto = require("crypto");
if (typeof global.crypto === 'undefined') {
    global.crypto = crypto;
}
let SessionSchedulerService = SessionSchedulerService_1 = class SessionSchedulerService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SessionSchedulerService_1.name);
    }
    async updateSessionStatus() {
        this.logger.log('🔄 Starting session status update cron job...');
        try {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const threeDaysFromNow = new Date(now);
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
            const happeningResult = await this.prisma.classSession.updateMany({
                where: {
                    sessionDate: {
                        gte: now,
                        lt: threeDaysFromNow,
                    },
                    status: {
                        in: ['has_not_happened', 'happening'],
                    },
                },
                data: {
                    status: 'happening',
                },
            });
            const notHappenedResult = await this.prisma.classSession.updateMany({
                where: {
                    sessionDate: {
                        gte: threeDaysFromNow,
                    },
                    status: {
                        notIn: ['end', 'cancelled'],
                    },
                },
                data: {
                    status: 'has_not_happened',
                },
            });
            this.logger.log(`✅ Updated ${happeningResult.count} sessions to 'happening' (< 3 days)`);
            this.logger.log(`✅ Updated ${notHappenedResult.count} sessions to 'has_not_happened' (>= 3 days)`);
        }
        catch (error) {
            this.logger.error('❌ Error updating session status:', error);
        }
    }
    async markPastSessionsAsEnded() {
        this.logger.log('🔄 Marking past sessions as ended...');
        try {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const result = await this.prisma.classSession.updateMany({
                where: {
                    sessionDate: {
                        lt: now,
                    },
                    status: {
                        in: ['happening', 'has_not_happened'],
                    },
                },
                data: {
                    status: 'end',
                },
            });
            this.logger.log(`✅ Marked ${result.count} past sessions as 'end'`);
        }
        catch (error) {
            this.logger.error('❌ Error marking past sessions as ended:', error);
        }
    }
};
exports.SessionSchedulerService = SessionSchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SessionSchedulerService.prototype, "updateSessionStatus", null);
__decorate([
    (0, schedule_1.Cron)('59 23 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SessionSchedulerService.prototype, "markPastSessionsAsEnded", null);
exports.SessionSchedulerService = SessionSchedulerService = SessionSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SessionSchedulerService);
//# sourceMappingURL=session-scheduler.service.js.map