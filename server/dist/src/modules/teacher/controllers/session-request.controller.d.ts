import { SessionRequestService } from '../services/session-request.service';
import { CreateSessionRequestDto } from '../dto/session-request/create-session-request.dto';
import { SessionRequestResponseDto } from '../dto/session-request/session-request-response.dto';
import { SessionRequestFiltersDto } from '../dto/session-request/session-request-filters.dto';
export declare class SessionRequestController {
    private readonly sessionRequestService;
    constructor(sessionRequestService: SessionRequestService);
    createSessionRequest(req: any, dto: CreateSessionRequestDto): Promise<{
        success: boolean;
        data: SessionRequestResponseDto;
        message: string;
    }>;
    getMySessionRequests(req: any, filters: SessionRequestFiltersDto): Promise<{
        success: boolean;
        data: {
            data: SessionRequestResponseDto[];
            total: number;
            page: number;
            limit: number;
        };
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        message: string;
    }>;
    getSessionRequestDetail(req: any, requestId: string): Promise<{
        success: boolean;
        data: SessionRequestResponseDto;
        message: string;
    }>;
    cancelSessionRequest(req: any, requestId: string): Promise<{
        success: boolean;
        data: SessionRequestResponseDto;
        message: string;
    }>;
}
