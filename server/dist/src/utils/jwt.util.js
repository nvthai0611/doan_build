"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
class JWT {
    static createAccessToken(payload) {
        return jwt.sign({
            ...payload,
            type: 'access',
        }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_ACCESS_EXPIRE || '1h',
        });
    }
    static createRefreshToken(userId) {
        const payload = {
            userId: userId,
            sessionId: crypto.randomUUID(),
            type: 'refresh',
        };
        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
        });
    }
    static verifyAccessToken(accessToken) {
        try {
            return jwt.verify(accessToken, process.env.JWT_SECRET);
        }
        catch {
            return false;
        }
    }
    static verifyRefreshToken(refreshToken) {
        try {
            return jwt.verify(refreshToken, process.env.JWT_SECRET);
        }
        catch {
            return false;
        }
    }
}
exports.default = JWT;
//# sourceMappingURL=jwt.util.js.map