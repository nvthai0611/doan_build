import { PrismaService } from '../../../db/prisma.service';
import { TeacherFeedbackService } from '../services/teacher-feedback.service';
export declare class FeedbackAnalysisCronService {
    private readonly prisma;
    private readonly teacherFeedbackService;
    private readonly logger;
    constructor(prisma: PrismaService, teacherFeedbackService: TeacherFeedbackService);
    analyzeNewFeedbacks(): Promise<void>;
}
