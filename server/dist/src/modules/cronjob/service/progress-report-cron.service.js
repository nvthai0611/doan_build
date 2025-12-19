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
var ProgressReportCronService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressReportCronService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../../../src/db/prisma.service");
function buildPeriodLabel(date) {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `Tháng ${month}/${year}`;
}
function getLastMonthRange(base = new Date()) {
    const firstDayCurrentMonth = new Date(base.getFullYear(), base.getMonth(), 1);
    const periodEnd = new Date(firstDayCurrentMonth.getTime() - 1);
    const periodStart = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), 1);
    return { periodStart, periodEnd };
}
let ProgressReportCronService = ProgressReportCronService_1 = class ProgressReportCronService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ProgressReportCronService_1.name);
    }
    async generateMonthlyProgressReports() {
        return await this.generateReportsForPeriod();
    }
    async generateReportsForPeriod(customStart, customEnd) {
        const { periodStart, periodEnd } = customStart && customEnd
            ? { periodStart: customStart, periodEnd: customEnd }
            : getLastMonthRange();
        const periodLabel = buildPeriodLabel(periodStart);
        this.logger.log(`Generating progress reports for ${periodLabel} (${periodStart.toISOString()} - ${periodEnd.toISOString()})`);
        const studyingEnrollments = await this.prisma.enrollment.findMany({
            where: {
                status: 'studying',
                class: {
                    status: 'active'
                }
            },
            include: {
                class: {
                    include: {
                        subject: true,
                        teacher: true,
                    },
                },
                student: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        if (studyingEnrollments.length === 0) {
            this.logger.log('No active enrollments found for progress reports');
            return { message: 'No active enrollments found', created: 0 };
        }
        let createdCount = 0;
        let skippedCount = 0;
        const errors = [];
        for (const enrollment of studyingEnrollments) {
            try {
                const { studentId, classId, student, class: classData } = enrollment;
                if (!classData.teacherId) {
                    this.logger.warn(`Class ${classId} (${classData.name}) has no teacherId assigned. Skipping.`);
                    skippedCount++;
                    continue;
                }
                const exists = await this.prisma.progressReport.findFirst({
                    where: {
                        studentId,
                        classId,
                        periodLabel,
                    },
                });
                if (exists) {
                    skippedCount++;
                    continue;
                }
                const { averageScore, attendanceRate } = await this.computeStudentMetricsForClass(studentId, classId, periodStart, periodEnd);
                const trend = await this.computeTrend(studentId, classId, periodStart, averageScore);
                const autoComment = this.generateAutoComment(averageScore, attendanceRate);
                await this.prisma.progressReport.create({
                    data: {
                        studentId,
                        classId,
                        teacherId: classData.teacherId,
                        reportType: 'MONTHLY',
                        periodLabel,
                        periodStart,
                        periodEnd,
                        averageScore: averageScore ?? undefined,
                        attendanceRate: attendanceRate ?? undefined,
                        trend: trend ?? undefined,
                        overallComment: autoComment,
                        status: 'DRAFT',
                        generatedAt: new Date(),
                        publishedAt: null,
                    },
                });
                createdCount++;
            }
            catch (error) {
                this.logger.error(`Failed to create report for enrollment ${enrollment.id}:`, error);
                errors.push({
                    studentId: enrollment.studentId,
                    classId: enrollment.classId,
                    error: error.message
                });
            }
        }
        this.logger.log(`Created ${createdCount} draft progress reports for ${periodLabel} (skipped: ${skippedCount})`);
        return {
            message: `Created ${createdCount} reports for ${periodLabel}`,
            periodLabel,
            created: createdCount,
            skipped: skippedCount,
            errors: errors.length > 0 ? errors : undefined,
        };
    }
    async computeStudentMetrics(studentId, start, end) {
        const grades = await this.prisma.studentAssessmentGrade.findMany({
            where: {
                studentId,
                assessment: {
                    date: { gte: start, lte: end },
                },
            },
            include: {
                assessment: {
                    include: {
                        class: { include: { subject: true } },
                    },
                },
            },
        });
        const attendance = await this.prisma.studentSessionAttendance.findMany({
            where: {
                studentId,
                recordedAt: { gte: start, lte: end },
            },
            include: {
                session: true,
            },
        });
        const numericScores = grades.map((g) => (g.score ? Number(g.score) : null)).filter((x) => x !== null);
        const averageScore = numericScores.length ? Number((numericScores.reduce((a, b) => a + b, 0) / numericScores.length).toFixed(2)) : null;
        const subjectGroups = new Map();
        for (const g of grades) {
            const subjectName = g.assessment.class.subject?.name ?? 'Khác';
            const val = g.score ? Number(g.score) : null;
            if (val === null)
                continue;
            if (!subjectGroups.has(subjectName))
                subjectGroups.set(subjectName, []);
            subjectGroups.get(subjectName).push(val);
        }
        const items = Array.from(subjectGroups.entries()).map(([subject, arr]) => ({
            subject,
            score: Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)),
            trend: 'stable',
            comment: null,
            rank: null,
        }));
        this.logger.debug(`[computeStudentMetrics] AverageScore: ${averageScore}, Items: ${JSON.stringify(items)}`);
        const total = attendance.length;
        const attended = attendance.filter((a) => a.status?.toLowerCase() === 'present' || a.status?.toLowerCase() === 'late').length;
        const attendanceRate = total > 0 ? Number(((attended / total) * 100).toFixed(2)) : null;
        return { averageScore, attendanceRate, items };
    }
    async computeStudentMetricsForClass(studentId, classId, start, end) {
        const grades = await this.prisma.studentAssessmentGrade.findMany({
            where: {
                studentId,
                assessment: {
                    classId,
                    date: { gte: start, lte: end },
                },
            },
            include: {
                assessment: true,
            },
        });
        const attendance = await this.prisma.studentSessionAttendance.findMany({
            where: {
                studentId,
                session: {
                    classId,
                    sessionDate: { gte: start, lte: end },
                },
            },
        });
        const numericScores = grades.map((g) => (g.score ? Number(g.score) : null)).filter((x) => x !== null);
        const averageScore = numericScores.length ? Number((numericScores.reduce((a, b) => a + b, 0) / numericScores.length).toFixed(2)) : null;
        const total = attendance.length;
        const attended = attendance.filter((a) => a.status?.toLowerCase() === 'present' || a.status?.toLowerCase() === 'late').length;
        const attendanceRate = total > 0 ? Number(((attended / total) * 100).toFixed(2)) : null;
        this.logger.debug(`Class ${classId} - Student ${studentId}: ${grades.length} grades, ${attendance.length} sessions, avg: ${averageScore}, attendance: ${attendanceRate}%`);
        return { averageScore, attendanceRate };
    }
    async computeTrend(studentId, classId, currentPeriodStart, currentScore) {
        if (currentScore === null)
            return null;
        const previousReport = await this.prisma.progressReport.findFirst({
            where: {
                studentId,
                classId,
                periodStart: { lt: currentPeriodStart },
            },
            orderBy: { periodStart: 'desc' },
            select: { averageScore: true },
        });
        if (!previousReport || previousReport.averageScore === null) {
            return 'stable';
        }
        const diff = currentScore - previousReport.averageScore;
        const epsilon = 0.5;
        if (diff > epsilon)
            return 'up';
        if (diff < -epsilon)
            return 'down';
        return 'stable';
    }
    generateAutoComment(averageScore, attendanceRate) {
        if (averageScore === null && attendanceRate === null) {
            return 'Chưa có đủ dữ liệu để đánh giá kết quả học tập và chuyên cần của học sinh.';
        }
        if (averageScore === null) {
            return this.generateAttendanceOnlyComment(attendanceRate);
        }
        if (attendanceRate === null) {
            return this.generateScoreOnlyComment(averageScore);
        }
        return this.generateCombinedComment(averageScore, attendanceRate);
    }
    generateScoreOnlyComment(score) {
        if (score >= 9) {
            return 'Học sinh có kết quả học tập xuất sắc. Tiếp tục duy trì và phát huy.';
        }
        else if (score >= 8) {
            return 'Học sinh có kết quả học tập tốt. Hãy tiếp tục nỗ lực để đạt kết quả cao hơn.';
        }
        else if (score >= 6.5) {
            return 'Học sinh có kết quả học tập khá. Cần ôn tập và rèn luyện thêm để nâng cao kiến thức.';
        }
        else if (score >= 5) {
            return 'Học sinh có kết quả học tập trung bình. Cần chú ý lắng nghe bài giảng và làm bài tập đầy đủ.';
        }
        else {
            return 'Học sinh cần cố gắng nhiều hơn nữa trong học tập. Phụ huynh cần quan tâm và hỗ trợ con em.';
        }
    }
    generateAttendanceOnlyComment(rate) {
        if (rate >= 95) {
            return 'Học sinh có ý thức học tập rất tốt, đi học đầy đủ và đúng giờ.';
        }
        else if (rate >= 85) {
            return 'Học sinh có ý thức học tập tốt, thường xuyên đi học đầy đủ.';
        }
        else if (rate >= 75) {
            return 'Học sinh có ý thức học tập khá, tuy nhiên cần cải thiện tình trạng vắng mặt.';
        }
        else if (rate >= 60) {
            return 'Học sinh cần cải thiện ý thức đi học. Phụ huynh cần giám sát và nhắc nhở con em.';
        }
        else {
            return 'Học sinh vắng mặt quá nhiều, ảnh hưởng nghiêm trọng đến việc học. Phụ huynh cần có biện pháp can thiệp kịp thời.';
        }
    }
    generateCombinedComment(score, attendance) {
        if (score >= 9 && attendance >= 95) {
            return 'Học sinh có kết quả học tập xuất sắc với điểm số cao và chuyên cần rất tốt. Đây là tấm gương sáng cho các bạn học sinh khác. Hãy tiếp tục phát huy và duy trì thành tích này.';
        }
        if (score >= 8 && attendance >= 90) {
            return 'Học sinh thể hiện sự nỗ lực đáng khen ngợi với kết quả học tập tốt và ý thức học tập cao. Tiếp tục phát huy để đạt kết quả xuất sắc.';
        }
        if (score >= 8 && attendance < 75) {
            return 'Học sinh có năng lực học tập tốt nhưng tình trạng vắng học còn nhiều. Nếu đi học đầy đủ hơn, em sẽ đạt kết quả cao hơn nữa.';
        }
        if (score < 6.5 && attendance >= 85) {
            return 'Học sinh có ý thức học tập tốt, đi học đầy đủ nhưng kết quả học tập chưa cao. Cần tập trung lắng nghe bài giảng và ôn tập thêm ở nhà.';
        }
        if (score >= 6.5 && score < 8 && attendance >= 75 && attendance < 90) {
            return 'Học sinh có kết quả học tập và ý thức học tập ở mức khá. Cần nỗ lực hơn nữa để nâng cao cả điểm số và chuyên cần.';
        }
        if (score < 5 && attendance < 60) {
            return 'Học sinh có kết quả học tập và chuyên cần chưa đạt yêu cầu. Phụ huynh cần quan tâm, giám sát chặt chẽ và có biện pháp hỗ trợ con em kịp thời.';
        }
        if (score < 5 || attendance < 60) {
            if (score < 5) {
                return 'Học sinh cần cố gắng nhiều hơn trong học tập. Phụ huynh nên trao đổi với giáo viên để tìm phương pháp học phù hợp cho con.';
            }
            else {
                return 'Học sinh cần cải thiện ý thức đi học. Việc vắng mặt thường xuyên ảnh hưởng tiêu cực đến kết quả học tập.';
            }
        }
        return `Học sinh có điểm trung bình ${score} và chuyên cần ${attendance}%. Cần tiếp tục nỗ lực để đạt kết quả tốt hơn.`;
    }
};
exports.ProgressReportCronService = ProgressReportCronService;
__decorate([
    (0, schedule_1.Cron)('0 30 0 1 * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProgressReportCronService.prototype, "generateMonthlyProgressReports", null);
exports.ProgressReportCronService = ProgressReportCronService = ProgressReportCronService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProgressReportCronService);
//# sourceMappingURL=progress-report-cron.service.js.map