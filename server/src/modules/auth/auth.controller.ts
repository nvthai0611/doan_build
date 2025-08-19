import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { LoginDto } from './dto/loginDto';
import { Response } from 'express';
import { AuthService } from './auth.service';
import Hash from 'src/utils/hasing';
import JWT from 'src/utils/jwt';
// import { redis } from 'src/utils/redis';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() { email, password }: LoginDto, @Res() res: Response) {
    if (!email || !password) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Vui lòng nhập email và password',
      });
    }

    const user = await this.authService.getUserByFiel('email', email);
    if (!user) {
      // Nếu không tìm thấy người dùng, trả về lỗi không được ủy quyền
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác',
      });
    }

    const passWordHash = user.password;
    if (!Hash.verify(password, passWordHash)) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác',
      });
    }

    const accessToken = JWT.createAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = JWT.createRefreshToken();

    // const redisStore = await redis;
    // await redisStore.set(
    //   `refreshToken_${user.id}`,
    //   JSON.stringify({
    //     refreshToken,
    //     email,
    //   }),
    // );

    return res.json({
      success: true,
      message: 'Login successfully',
      data: {
        accessToken,
        refreshToken,
      },
    });
  }

  @Get('profile')
  profile(@Req() req: any, @Res() res: Response) {
    console.log(req);
    return res.json({
      success: true,
      message: 'Get success',
      data: req.user,
    });
  }

  @Post('logout')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async logout(@Req() req: any) {
    // const token = req.token;
    // const redisStore = await redis;
    // await redisStore.set(`blacklist_${token}`, 1);
    return { success: true, message: 'Logout success' };
  }

  @Post('refresh')
  async refresh(
    @Headers('refresh-token') refreshToken: string,
    @Res() res: Response,
  ) {
    console.log('Received refresh token:', refreshToken);
    return res.json('check');
  }
}
