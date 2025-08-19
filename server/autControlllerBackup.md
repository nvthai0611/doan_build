import {
Body,
Controller,
Get,
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
import { redis } from 'src/utils/redis';

@Controller('auth')
export class AuthController {
constructor(private readonly authService: AuthService) {}
@Post('login')
async login(@Body() { email, password }: LoginDto, @Res() res: Response) {
if (!email || !password) {
return res.status(HttpStatus.BAD*REQUEST).json({
success: false,
message: 'Vui lòng nhập email và password',
});
}
const user = await this.authService.getUserByFiel('email', email);
if (!user) {
return res.status(HttpStatus.UNAUTHORIZED).json({
// code 401
success: false,
message: 'Email hoặc mật khẩu không chính xác',
});
}
const passWordHash = user.password;
if (!Hash.verify(password, passWordHash)) {
return res.status(HttpStatus.UNAUTHORIZED).json({
// code 401
success: false,
message: 'Email hoặc mật khẩu không chính xác',
});
}
// tạo accesstoken
const accessToken = JWT.createAccessToken({
userId: user.id,
email: user.email,
});
// tạo refreshToken
const refreshToken = JWT.createRefreshToken();
// Lưu refreshToken vào redis
const redisStore = await redis;
await redisStore.set(
`refreshToken*${user.id}`,
JSON.stringify({
refreshToken,
email,
}),
);
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
return res.json({
success: true,
message: 'Get success',
data: req.user,
});
}

@Post('logout')
async logout(@Req() req: any) {
const token = req.token;
// blacklist accesstoken : true
const redisStore = await redis;
await redisStore.set(`blacklist_${token}`, 1);
return { success: true, message: 'Logout success' };
}
}
