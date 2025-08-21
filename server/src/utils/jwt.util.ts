import * as jwt from 'jsonwebtoken';
export default class JWT {
  static createAccessToken(payload: unknown) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRE,
    });
  }

  static createRefreshToken() {
    const payload = {
      value: Math.random() + new Date().getTime(),
    };
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRE,
    });
  }

  static verifyAccessToken(accessToken: string) {
    try {
      return jwt.verify(accessToken, process.env.JWT_SECRET);
    } catch {
      return false;
    }
  }
}
