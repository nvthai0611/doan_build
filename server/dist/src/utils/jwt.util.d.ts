import * as jwt from 'jsonwebtoken';
export default class JWT {
    static createAccessToken(payload: {
        userId: string;
        email: string;
        role: string;
    }): string;
    static createRefreshToken(userId: string): string;
    static verifyAccessToken(accessToken: string): string | false | jwt.JwtPayload;
    static verifyRefreshToken(refreshToken: string): string | false | jwt.JwtPayload;
}
