import { PrismaService } from '../../../db/prisma.service';
import { CreateRoomDto } from '../dto/room/create-room.dto';
import { UpdateRoomDto } from '../dto/room/update-room.dto';
export declare class RoomsManagementService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        name: string;
        capacity: number;
        equipment: string[];
        isActive: boolean;
        createdAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        capacity: number;
        equipment: string[];
        isActive: boolean;
        createdAt: Date;
    }>;
    create(createRoomDto: CreateRoomDto): Promise<{
        id: string;
        name: string;
        capacity: number;
        equipment: string[];
        isActive: boolean;
        createdAt: Date;
    }>;
    update(id: string, updateRoomDto: UpdateRoomDto): Promise<{
        id: string;
        name: string;
        capacity: number;
        equipment: string[];
        isActive: boolean;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
