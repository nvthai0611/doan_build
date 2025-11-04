import { TeacherFeedbackMonitoringService } from '../services/teacher-feedback-monitoring.service';
import { PrismaService } from '../../../db/prisma.service';
export declare class TeacherFeedbackMonitoringController {
    private readonly feedbackMonitoringService;
    private readonly prisma;
    constructor(feedbackMonitoringService: TeacherFeedbackMonitoringService, prisma: PrismaService);
    checkTeacher(teacherId: string, query: {
        classId?: string;
        periodDays?: number;
    }): Promise<{
        success: boolean;
        data: {
            shouldTransfer: boolean;
            reason: string;
            metrics: {
                avgRating: number;
                negativeCount: number;
                negativePercentage: number;
                sentimentAvg: number;
                totalFeedbacks: number;
                metrics: {
                    rating1: number;
                    rating2: number;
                    rating3: number;
                    rating4: number;
                    rating5: number;
                };
            };
            thresholds: {
                minNegativeRating: any;
                minNegativeCount: any;
                periodDays: any;
                minNegativePercentage: any;
                minSentimentScore: any;
                autoCreateTransfer: any;
            };
            checks: {
                avgRatingLow: boolean;
                negativeCountHigh: boolean;
                negativePercentageHigh: boolean;
                sentimentLow: boolean;
            };
        };
        message: string;
    }>;
    getTeachersAtRisk(query: any): Promise<{
        success: boolean;
        data: any[];
        meta: {
            total: number;
            page: any;
            limit: any;
            totalPages: number;
        };
        message: string;
    }>;
    updateAutoTransferSettings(body: any, req: any): Promise<{
        success: boolean;
        data: {
            createdAt: Date;
            updatedAt: Date;
            id: string;
            description: string | null;
            value: import("@prisma/client/runtime/library").JsonValue;
            key: string;
            group: string;
            updatedBy: string | null;
        };
        message: string;
    }>;
    monitorAll(): Promise<{
        success: boolean;
        message: string;
        data: {
            checked: number;
            alerts: number;
            alertsList: any[];
        };
    }>;
    getTeacherFeedbacksForReview(teacherId: string, query: {
        classId?: string;
        periodDays?: number;
        page?: number;
        limit?: number;
    }): Promise<{
        success: boolean;
        data: {
            feedbacks: ({
                parent: {
                    user: {
                        email: string;
                        fullName: string;
                    };
                } & {
                    createdAt: Date;
                    updatedAt: Date;
                    id: string;
                    userId: string;
                    relationshipType: string | null;
                };
                student: {
                    user: {
                        fullName: string;
                    };
                } & {
                    grade: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    id: string;
                    userId: string;
                    studentCode: string | null;
                    address: string | null;
                    schoolId: string;
                    parentId: string | null;
                    scholarshipId: string | null;
                };
                class: {
                    id: string;
                    name: string;
                };
                analysis: {
                    id: string;
                    analyzedAt: Date;
                    feedbackId: string;
                    sentimentScore: import("@prisma/client/runtime/library").Decimal;
                    sentimentLabel: string;
                    toxicityScore: import("@prisma/client/runtime/library").Decimal | null;
                    keyPhrases: import("@prisma/client/runtime/library").JsonValue | null;
                    categorizedIssues: import("@prisma/client/runtime/library").JsonValue | null;
                    aiSummary: string | null;
                    recommendedAction: string | null;
                    confidenceScore: import("@prisma/client/runtime/library").Decimal | null;
                    aiModel: string;
                    processingTimeMs: number | null;
                }[];
            } & {
                createdAt: Date;
                updatedAt: Date;
                id: string;
                parentId: string;
                teacherId: string;
                status: string;
                studentId: string | null;
                classId: string | null;
                rating: number;
                comment: string | null;
                categories: import("@prisma/client/runtime/library").JsonValue | null;
                isAnonymous: boolean;
            })[];
            metrics: {
                avgRating: number;
                negativeCount: number;
                negativePercentage: number;
                sentimentAvg: number;
                totalFeedbacks: number;
                metrics: {
                    rating1: number;
                    rating2: number;
                    rating3: number;
                    rating4: number;
                    rating5: number;
                };
            };
            thresholdCheck: {
                shouldTransfer: boolean;
                reason: string;
                metrics: {
                    avgRating: number;
                    negativeCount: number;
                    negativePercentage: number;
                    sentimentAvg: number;
                    totalFeedbacks: number;
                    metrics: {
                        rating1: number;
                        rating2: number;
                        rating3: number;
                        rating4: number;
                        rating5: number;
                    };
                };
                thresholds: {
                    minNegativeRating: any;
                    minNegativeCount: any;
                    periodDays: any;
                    minNegativePercentage: any;
                    minSentimentScore: any;
                    autoCreateTransfer: any;
                };
                checks: {
                    avgRatingLow: boolean;
                    negativeCountHigh: boolean;
                    negativePercentageHigh: boolean;
                    sentimentLow: boolean;
                };
            };
            shouldShowTransferButton: boolean;
        };
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        message: string;
    }>;
}
