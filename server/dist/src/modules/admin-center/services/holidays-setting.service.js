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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HolidaysSettingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let HolidaysSettingService = class HolidaysSettingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(year) {
        const where = {};
        if (year) {
            const startOfYear = new Date(`${year}-01-01`);
            const endOfYear = new Date(`${year}-12-31`);
            where.startDate = {
                gte: startOfYear,
                lte: endOfYear,
            };
            where.endDate = {
                gte: startOfYear,
                lte: endOfYear,
            };
        }
        const items = await this.prisma.holidayPeriod.findMany({
            where,
            orderBy: { startDate: 'desc' },
        });
        return { data: items, message: 'Lấy danh sách kỳ nghỉ thành công' };
    }
    async create(dto) {
        const { type, startDate, endDate, note, isActive } = dto;
        const startAt = new Date(startDate);
        const endAt = new Date(endDate);
        const overlappingHoliday = await this.checkOverlappingHolidays(startAt, endAt);
        if (overlappingHoliday) {
            throw new common_1.ConflictException(`Kỳ nghỉ này trùng với kỳ nghỉ đã tồn tại từ ${overlappingHoliday.startDate.toLocaleDateString('vi-VN')} đến ${overlappingHoliday.endDate.toLocaleDateString('vi-VN')}`);
        }
        const created = await this.prisma.holidayPeriod.create({
            data: {
                type: type || 'PUBLIC',
                startDate: startAt,
                endDate: endAt,
                note,
                isActive: isActive ?? true
            },
        });
        if (isActive !== false) {
            await this.apply(created.id);
        }
        return { data: created, message: 'Tạo kỳ nghỉ và đánh dấu các buổi học thành công' };
    }
    async update(id, dto) {
        const existed = await this.prisma.holidayPeriod.findUnique({ where: { id } });
        if (!existed)
            throw new common_1.NotFoundException('Holiday period not found');
        if (dto.startDate || dto.endDate) {
            const newStartDate = dto.startDate ? new Date(dto.startDate) : existed.startDate;
            const newEndDate = dto.endDate ? new Date(dto.endDate) : existed.endDate;
            const overlappingHoliday = await this.checkOverlappingHolidays(newStartDate, newEndDate, id);
            if (overlappingHoliday) {
                throw new common_1.ConflictException(`Kỳ nghỉ này trùng với kỳ nghỉ đã tồn tại từ ${overlappingHoliday.startDate.toLocaleDateString('vi-VN')} đến ${overlappingHoliday.endDate.toLocaleDateString('vi-VN')}`);
            }
        }
        const updated = await this.prisma.holidayPeriod.update({
            where: { id },
            data: {
                type: dto.type ?? undefined,
                startDate: dto.startDate ? new Date(dto.startDate) : undefined,
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
                note: dto.note ?? undefined,
                isActive: dto.isActive ?? undefined,
            },
        });
        return { data: updated, message: 'Cập nhật kỳ nghỉ thành công' };
    }
    async remove(id) {
        const existed = await this.prisma.holidayPeriod.findUnique({ where: { id } });
        if (!existed)
            throw new common_1.NotFoundException('Holiday period not found');
        const affectedLinks = await this.prisma.holidayPeriodSession.findMany({
            where: { holidayPeriodId: id },
            select: { sessionId: true },
        });
        await this.prisma.$transaction(async (tx) => {
            if (affectedLinks.length > 0) {
                const now = new Date();
                const sessionIds = affectedLinks.map(link => link.sessionId);
                const sessions = await tx.classSession.findMany({
                    where: { id: { in: sessionIds } },
                    select: { id: true, sessionDate: true, startTime: true },
                });
                for (const session of sessions) {
                    const sessionDateTime = new Date(session.sessionDate);
                    const [hours, minutes] = session.startTime.split(':').map(Number);
                    sessionDateTime.setHours(hours, minutes);
                    let newStatus = 'has_not_happened';
                    if (sessionDateTime < now) {
                        newStatus = 'end';
                    }
                    else {
                        newStatus = 'has_not_happened';
                    }
                    await tx.classSession.update({
                        where: { id: session.id },
                        data: {
                            status: newStatus,
                            cancellationReason: null,
                        },
                    });
                }
            }
            await tx.holidayPeriod.delete({ where: { id } });
        });
        return {
            data: { revertedSessions: affectedLinks.length },
            message: `Xóa kỳ nghỉ và khôi phục ${affectedLinks.length} buổi học thành công`
        };
    }
    async apply(id) {
        const holiday = await this.prisma.holidayPeriod.findUnique({ where: { id } });
        if (!holiday)
            throw new common_1.NotFoundException('Holiday period not found');
        const sessions = await this.prisma.classSession.findMany({
            where: {
                sessionDate: {
                    gte: holiday.startDate,
                    lte: holiday.endDate,
                },
            },
            select: { id: true },
        });
        if (sessions.length === 0) {
            return { data: { created: 0 }, message: 'Không có phiên học để liên kết' };
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.classSession.updateMany({
                where: {
                    id: { in: sessions.map(s => s.id) },
                },
                data: {
                    status: 'day_off',
                    cancellationReason: holiday.note,
                },
            });
            await Promise.all(sessions.map(s => tx.holidayPeriodSession.upsert({
                where: { holidayPeriodId_sessionId: { holidayPeriodId: id, sessionId: s.id } },
                create: { holidayPeriodId: id, sessionId: s.id },
                update: {},
            })));
        });
        return {
            data: {
                affectedSessions: sessions.length,
                holidayNote: holiday.note,
            },
            message: `Đã đánh dấu ${sessions.length} buổi học là ngày nghỉ`
        };
    }
    async checkOverlappingHolidays(startDate, endDate, excludeId) {
        const where = {
            OR: [
                {
                    AND: [
                        { startDate: { lte: startDate } },
                        { endDate: { gte: startDate } }
                    ]
                },
                {
                    AND: [
                        { startDate: { lte: endDate } },
                        { endDate: { gte: endDate } }
                    ]
                },
                {
                    AND: [
                        { startDate: { gte: startDate } },
                        { endDate: { lte: endDate } }
                    ]
                },
                {
                    AND: [
                        { startDate: { lte: startDate } },
                        { endDate: { gte: endDate } }
                    ]
                }
            ]
        };
        if (excludeId) {
            where.id = { not: excludeId };
        }
        const overlappingHoliday = await this.prisma.holidayPeriod.findFirst({
            where,
            select: {
                id: true,
                startDate: true,
                endDate: true,
                note: true
            }
        });
        return overlappingHoliday;
    }
};
exports.HolidaysSettingService = HolidaysSettingService;
exports.HolidaysSettingService = HolidaysSettingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HolidaysSettingService);
//# sourceMappingURL=holidays-setting.service.js.map