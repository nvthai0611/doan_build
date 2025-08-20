import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { AuthService } from 'src/modules/auth/auth.service';
import JWT from 'src/utils/jwt';
// import { redis } from 'src/utils/redis';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: any, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ').slice(-1).join();
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized, Token not provided',
      });
    }
    try {
      const decoded = JWT.verifyAccessToken(token);
      if (!decoded) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Unauthorized, Invalid token',
        });
      }
      // const redisStore = await redis;
      // const blackList = await redisStore.get(`blacklist_${token}`);
      // if (blackList) {
      //   return res.status(HttpStatus.UNAUTHORIZED).json({
      //     success: false,
      //     message: 'Unauthorized, Token has been logged out',
      //   });
      // }
      // const user = await this.authService.getUserByFiel('id', decoded.userId);
      // if (!user) {
      //   return res.status(HttpStatus.UNAUTHORIZED).json({
      //     success: false,
      //     message: 'Unauthorized, User not found',
      //   });
      // }
      // req.user = user;
      req.token = token;
      next();
    } catch {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized, Token verification failed',
      });
    }
  }
}
