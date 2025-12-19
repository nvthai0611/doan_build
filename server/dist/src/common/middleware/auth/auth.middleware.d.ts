import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { AuthService } from 'src/modules/auth/auth.service';
export declare class AuthMiddleware implements NestMiddleware {
    private readonly authService;
    constructor(authService: AuthService);
    use(req: any, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
}
