import { PrismaService } from '../../../db/prisma.service';
import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
export declare class MiddlewareTeacher implements NestMiddleware {
    private prismaService;
    constructor(prismaService: PrismaService);
    use(req: any, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    private extractTokenFromHeader;
}
