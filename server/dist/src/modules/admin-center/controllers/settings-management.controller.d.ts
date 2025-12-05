import { SettingsManagementService } from '../services/settings-management.service';
import { UpdateSettingDto } from '../dto/setting/update-setting.dto';
export declare class SettingsManagementController {
    private service;
    constructor(service: SettingsManagementService);
    getAll(group?: string): Promise<{
        data: {
            createdAt: Date;
            updatedAt: Date;
            id: string;
            description: string | null;
            value: import("@prisma/client/runtime/library").JsonValue;
            key: string;
            group: string;
            updatedBy: string | null;
        }[];
        message: string;
    }>;
    getByKey(key: string): Promise<{
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
    upsert(dto: UpdateSettingDto): Promise<{
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
}
