import { RoomsManagementService } from '../services/rooms-management.service';
import { CreateRoomDto } from '../dto/room/create-room.dto';
import { UpdateRoomDto } from '../dto/room/update-room.dto';
export declare class RoomsManagementController {
    private readonly roomsManagementService;
    constructor(roomsManagementService: RoomsManagementService);
    findAll(): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            capacity: number;
            equipment: string[];
            isActive: boolean;
            createdAt: Date;
        }[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            capacity: number;
            equipment: string[];
            isActive: boolean;
            createdAt: Date;
        };
    }>;
    create(createRoomDto: CreateRoomDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            capacity: number;
            equipment: string[];
            isActive: boolean;
            createdAt: Date;
        };
    }>;
    update(id: string, updateRoomDto: UpdateRoomDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            capacity: number;
            equipment: string[];
            isActive: boolean;
            createdAt: Date;
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
