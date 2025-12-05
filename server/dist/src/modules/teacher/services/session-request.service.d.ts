import { PrismaService } from '../../../db/prisma.service';
import { CreateSessionRequestDto } from '../dto/session-request/create-session-request.dto';
import { SessionRequestResponseDto } from '../dto/session-request/session-request-response.dto';
import { SessionRequestFiltersDto } from '../dto/session-request/session-request-filters.dto';
export declare class SessionRequestService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createSessionRequest(teacherId: string, dto: CreateSessionRequestDto): Promise<SessionRequestResponseDto>;
    getMySessionRequests(teacherId: string, filters: SessionRequestFiltersDto): Promise<{
        data: SessionRequestResponseDto[];
        total: number;
        page: number;
        limit: number;
    }>;
    getSessionRequestDetail(teacherId: string, requestId: string): Promise<SessionRequestResponseDto | null>;
    cancelSessionRequest(teacherId: string, requestId: string): Promise<SessionRequestResponseDto | null>;
    private formatSessionRequestResponse;
}
