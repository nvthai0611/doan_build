import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

export default class JWT {
  /**
   * Tạo Access Token
   * - Thời gian sống: 1 giờ (hoặc theo JWT_ACCESS_EXPIRE)
   * - Chứa thông tin: userId, email, role
   */
  static createAccessToken(payload: {
    userId: string;
    email: string;
    role: string;
  }) {
    return jwt.sign(
      {
        ...payload,
        type: 'access',
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: process.env.JWT_ACCESS_EXPIRE || '1h',
      }
    );
  }

  /**
   * Tạo Refresh Token với userId
   * - Thời gian sống: 7 ngày (hoặc theo JWT_REFRESH_EXPIRE)
   * - Chứa userId và sessionId để tracking
   */
  static createRefreshToken(userId: string) {
    const payload = {
      userId: userId,
      sessionId: crypto.randomUUID(),
      type: 'refresh',
    };
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
    });
  }

  /**
   * Verify Access Token
   */
  static verifyAccessToken(accessToken: string) {
    try {
      return jwt.verify(accessToken, process.env.JWT_SECRET as string);
    } catch {
      return false;
    }
  }

  /**
   * Verify Refresh Token
   */
  static verifyRefreshToken(refreshToken: string) {
    try {
      return jwt.verify(refreshToken, process.env.JWT_SECRET as string);
    } catch {
      return false;
    }
  }
}
