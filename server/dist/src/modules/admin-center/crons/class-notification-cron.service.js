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
var ClassNotificationCronService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassNotificationCronService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const class_notification_service_1 = require("../services/class-notification.service");
const crypto = require("crypto");
if (typeof global.crypto === 'undefined') {
    global.crypto = crypto;
}
let ClassNotificationCronService = ClassNotificationCronService_1 = class ClassNotificationCronService {
    constructor(classNotificationService) {
        this.classNotificationService = classNotificationService;
        this.logger = new common_1.Logger(ClassNotificationCronService_1.name);
    }
    async checkClassNotifications() {
        this.logger.log('🔄 Bắt đầu kiểm tra thông báo lớp học...');
        try {
            await this.classNotificationService.checkClassesStartingSoon();
            await this.classNotificationService.checkClassesEndingSoon();
            this.logger.log('✅ Hoàn thành kiểm tra thông báo lớp học');
        }
        catch (error) {
            this.logger.error('❌ Lỗi khi kiểm tra thông báo lớp học:', error);
        }
    }
};
exports.ClassNotificationCronService = ClassNotificationCronService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_NOON),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClassNotificationCronService.prototype, "checkClassNotifications", null);
exports.ClassNotificationCronService = ClassNotificationCronService = ClassNotificationCronService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [class_notification_service_1.ClassNotificationService])
], ClassNotificationCronService);
//# sourceMappingURL=class-notification-cron.service.js.map