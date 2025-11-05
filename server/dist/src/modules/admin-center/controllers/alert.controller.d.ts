import { AlertService } from '../services/alert.service';
import { CreateAlertDto, UpdateAlertDto, GetAlertsDto } from '../dto/alert.dto';
export declare class AlertController {
    private readonly alertService;
    constructor(alertService: AlertService);
    getAlerts(query: GetAlertsDto): Promise<{
        data: {
            id: bigint;
            message: string;
            processedAt: Date | null;
            alertType: string;
            payload: import("@prisma/client/runtime/library").JsonValue | null;
            triggeredAt: Date;
            processed: boolean;
            severity: number;
            title: string;
            isRead: boolean;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            unreadCount: number;
        };
        message: string;
    }>;
    getUnreadCount(): Promise<{
        data: {
            count: number;
        };
        message: string;
    }>;
    createAlert(createAlertDto: CreateAlertDto): Promise<{
        data: {
            id: bigint;
            message: string;
            processedAt: Date | null;
            alertType: string;
            payload: import("@prisma/client/runtime/library").JsonValue | null;
            triggeredAt: Date;
            processed: boolean;
            severity: number;
            title: string;
            isRead: boolean;
        };
        message: string;
    }>;
    markAllAsRead(): Promise<{
        data: {
            count: number;
        };
        message: string;
    }>;
    updateAlert(id: string, updateAlertDto: UpdateAlertDto): Promise<{
        data: {
            id: bigint;
            message: string;
            processedAt: Date | null;
            alertType: string;
            payload: import("@prisma/client/runtime/library").JsonValue | null;
            triggeredAt: Date;
            processed: boolean;
            severity: number;
            title: string;
            isRead: boolean;
        };
        message: string;
    }>;
    deleteAlert(id: string): Promise<{
        message: string;
    }>;
}
