import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
export declare class ApiKeyMiddleware implements NestMiddleware {
    private configService;
    constructor(configService: ConfigService);
    use(req: Request, res: Response, next: NextFunction): void;
}
