import { HttpStatus } from '@nestjs/common';
import { PrismaService } from './db/prisma.service';
export declare class AppController {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    getUsers(): Promise<{
        data: {
            role: string;
            email: string | null;
            password: string;
            createdAt: Date;
            fullName: string | null;
            isActive: boolean;
            avatar: string | null;
            phone: string | null;
            roleId: string | null;
            updatedAt: Date;
            username: string;
            id: string;
            gender: import(".prisma/client").$Enums.Gender | null;
            birthDate: Date | null;
        }[];
        message: string;
        status: HttpStatus;
    }>;
    getAbout(): string;
}
