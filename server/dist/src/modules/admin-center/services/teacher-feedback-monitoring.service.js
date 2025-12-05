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
exports.TeacherFeedbackMonitoringService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let TeacherFeedbackMonitoringService = class TeacherFeedbackMonitoringService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async evaluateTeacherFeedback(teacherId, options = {}) {
        const { classId, periodDays = 30 } = options;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - periodDays);
        const where = {
            teacherId,
            createdAt: {
                gte: startDate,
            },
            status: 'approved',
        };
        if (classId) {
            where.classId = classId;
        }
        const feedbacks = await this.prisma.teacherFeedback.findMany({
            where,
            include: {
                analysis: {
                    take: 1,
                    orderBy: {
                        analyzedAt: 'desc',
                    },
                },
            },
        });
        if (feedbacks.length === 0) {
            return {
                avgRating: 0,
                negativeCount: 0,
                negativePercentage: 0,
                sentimentAvg: 0,
                totalFeedbacks: 0,
                metrics: {
                    rating1: 0,
                    rating2: 0,
                    rating3: 0,
                    rating4: 0,
                    rating5: 0,
                },
            };
        }
        const totalFeedbacks = feedbacks.length;
        const ratings = feedbacks.map((f) => f.rating);
        const avgRating = ratings.reduce((sum, r) => sum + r, 0) / totalFeedbacks;
        const metrics = {
            rating1: ratings.filter((r) => r === 1).length,
            rating2: ratings.filter((r) => r === 2).length,
            rating3: ratings.filter((r) => r === 3).length,
            rating4: ratings.filter((r) => r === 4).length,
            rating5: ratings.filter((r) => r === 5).length,
        };
        const negativeCount = metrics.rating1 + metrics.rating2;
        const negativePercentage = (negativeCount / totalFeedbacks) * 100;
        const sentiments = feedbacks
            .filter((f) => f.analysis && f.analysis.length > 0)
            .map((f) => {
            const analysis = f.analysis[0];
            const score = typeof analysis.sentimentScore === 'string'
                ? parseFloat(analysis.sentimentScore)
                : Number(analysis.sentimentScore) || 0;
            return score;
        });
        const sentimentAvg = sentiments.length > 0
            ? sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length
            : 0;
        return {
            avgRating,
            negativeCount,
            negativePercentage,
            sentimentAvg,
            totalFeedbacks,
            metrics,
        };
    }
    async getThresholds() {
        const setting = await this.prisma.systemSetting.findUnique({
            where: { key: 'feedback_transfer_thresholds' },
        });
        if (!setting) {
            return {
                minNegativeRating: 2,
                minNegativeCount: 5,
                periodDays: 30,
                minNegativePercentage: 60,
                minSentimentScore: -0.3,
                autoCreateTransfer: false,
            };
        }
        const value = setting.value;
        return {
            minNegativeRating: value?.minNegativeRating || 2,
            minNegativeCount: value?.minNegativeCount || 5,
            periodDays: value?.periodDays || 30,
            minNegativePercentage: value?.minNegativePercentage || 60,
            minSentimentScore: value?.minSentimentScore || -0.3,
            autoCreateTransfer: value?.autoCreateTransfer || false,
        };
    }
    async checkTeacherFeedbackThresholds(teacherId, options = {}) {
        const metrics = await this.evaluateTeacherFeedback(teacherId, options);
        const thresholds = await this.getThresholds();
        const checks = {
            avgRatingLow: metrics.avgRating < 2.5,
            negativeCountHigh: metrics.negativeCount >= thresholds.minNegativeCount,
            negativePercentageHigh: metrics.negativePercentage >= thresholds.minNegativePercentage,
            sentimentLow: metrics.sentimentAvg !== 0 &&
                metrics.sentimentAvg < thresholds.minSentimentScore,
        };
        const shouldTransfer = checks.avgRatingLow ||
            (checks.negativeCountHigh && checks.negativePercentageHigh) ||
            checks.sentimentLow;
        let reason = '';
        if (shouldTransfer) {
            const reasons = [];
            if (checks.avgRatingLow) {
                reasons.push(`Điểm đánh giá trung bình thấp (${metrics.avgRating.toFixed(2)}/5)`);
            }
            if (checks.negativeCountHigh && checks.negativePercentageHigh) {
                reasons.push(`${metrics.negativeCount} feedback xấu (${metrics.negativePercentage.toFixed(1)}%)`);
            }
            if (checks.sentimentLow) {
                reasons.push(`Sentiment score thấp (${metrics.sentimentAvg.toFixed(2)})`);
            }
            reason = reasons.join('; ');
        }
        return {
            shouldTransfer,
            reason,
            metrics,
            thresholds,
            checks,
        };
    }
    async getTeacherFeedbacksForReview(teacherId, options = {}) {
        const { classId, periodDays = 30, page = 1, limit = 20 } = options;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - periodDays);
        const where = {
            teacherId,
            createdAt: {
                gte: startDate,
            },
            status: 'approved',
        };
        if (classId) {
            where.classId = classId;
        }
        const skip = (page - 1) * limit;
        const [feedbacks, total] = await Promise.all([
            this.prisma.teacherFeedback.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    parent: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    student: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                },
                            },
                        },
                    },
                    class: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    analysis: {
                        take: 1,
                        orderBy: {
                            analyzedAt: 'desc',
                        },
                    },
                },
            }),
            this.prisma.teacherFeedback.count({ where }),
        ]);
        const metrics = await this.evaluateTeacherFeedback(teacherId, {
            classId,
            periodDays,
        });
        const thresholdCheck = await this.checkTeacherFeedbackThresholds(teacherId, {
            classId,
            periodDays,
        });
        return {
            success: true,
            data: {
                feedbacks,
                metrics,
                thresholdCheck,
                shouldShowTransferButton: thresholdCheck.shouldTransfer,
            },
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            message: 'Lấy danh sách feedback thành công',
        };
    }
    async monitorAllTeachers() {
        try {
            const activeTeachers = await this.prisma.teacher.findMany({
                where: {
                    user: {
                        isActive: true,
                    },
                    classes: {
                        some: {
                            status: 'active',
                        },
                    },
                },
                include: {
                    classes: {
                        where: {
                            status: 'active',
                        },
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    user: {
                        select: {
                            fullName: true,
                            email: true,
                        },
                    },
                },
            });
            const alerts = [];
            const thresholds = await this.getThresholds();
            for (const teacher of activeTeachers) {
                for (const classItem of teacher.classes) {
                    const check = await this.checkTeacherFeedbackThresholds(teacher.id, {
                        classId: classItem.id,
                        periodDays: thresholds.periodDays,
                    });
                    if (check.shouldTransfer) {
                        alerts.push({
                            teacherId: teacher.id,
                            teacherName: teacher.user.fullName,
                            classId: classItem.id,
                            className: classItem.name,
                            metrics: check.metrics,
                            reason: check.reason,
                            riskLevel: check.metrics.avgRating < 2.0 ? 'high' : 'medium',
                        });
                    }
                }
            }
            return {
                success: true,
                message: `Đã kiểm tra ${activeTeachers.length} giáo viên`,
                data: {
                    checked: activeTeachers.length,
                    alerts: alerts.length,
                    alertsList: alerts,
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi monitor feedback giáo viên',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getTeachersAtRisk(params = {}) {
        try {
            const { page = 1, limit = 10 } = params;
            const thresholds = await this.getThresholds();
            const activeTeachers = await this.prisma.teacher.findMany({
                where: {
                    user: {
                        isActive: true,
                    },
                    classes: {
                        some: {
                            status: 'active',
                        },
                    },
                },
                include: {
                    user: {
                        select: {
                            fullName: true,
                            email: true,
                        },
                    },
                    classes: {
                        where: {
                            status: 'active',
                        },
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            const teachersAtRisk = [];
            for (const teacher of activeTeachers) {
                const overallCheck = await this.checkTeacherFeedbackThresholds(teacher.id, {
                    periodDays: thresholds.periodDays,
                });
                const classIssues = [];
                if (overallCheck.shouldTransfer) {
                    for (const classItem of teacher.classes) {
                        const classCheck = await this.checkTeacherFeedbackThresholds(teacher.id, {
                            classId: classItem.id,
                            periodDays: thresholds.periodDays,
                        });
                        if (classCheck.shouldTransfer) {
                            classIssues.push({
                                classId: classItem.id,
                                className: classItem.name,
                                metrics: classCheck.metrics,
                                reason: classCheck.reason,
                            });
                        }
                    }
                }
                if (overallCheck.shouldTransfer || classIssues.length > 0) {
                    teachersAtRisk.push({
                        teacher: {
                            id: teacher.id,
                            fullName: teacher.user.fullName,
                            email: teacher.user.email,
                        },
                        overallMetrics: overallCheck.metrics,
                        overallReason: overallCheck.reason,
                        riskLevel: overallCheck.metrics.avgRating < 2.0 ? 'high' : 'medium',
                        classes: teacher.classes,
                        classIssues: classIssues,
                    });
                }
            }
            const skip = (page - 1) * limit;
            const paginated = teachersAtRisk.slice(skip, skip + limit);
            return {
                success: true,
                data: paginated,
                meta: {
                    total: teachersAtRisk.length,
                    page,
                    limit,
                    totalPages: Math.ceil(teachersAtRisk.length / limit),
                },
                message: 'Lấy danh sách giáo viên có nguy cơ thành công',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách giáo viên có nguy cơ',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.TeacherFeedbackMonitoringService = TeacherFeedbackMonitoringService;
exports.TeacherFeedbackMonitoringService = TeacherFeedbackMonitoringService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeacherFeedbackMonitoringService);
//# sourceMappingURL=teacher-feedback-monitoring.service.js.map