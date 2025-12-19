"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailConnection = verifyEmailConnection;
exports.default = emailUtil;
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROMNAME, SMTP_FROMEMAIL, } = process.env;
const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_PORT === '465' || SMTP_SECURE === 'true',
    auth: {
        user: SMTP_USERNAME,
        pass: SMTP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
    connectionTimeout: 30000,
    greetingTimeout: 10000,
    socketTimeout: 30000,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
});
let isVerified = false;
let verifyPromise = null;
async function verifyEmailConnection() {
    if (isVerified) {
        return true;
    }
    if (verifyPromise) {
        return verifyPromise;
    }
    verifyPromise = (async () => {
        try {
            if (!SMTP_USERNAME || !SMTP_PASSWORD) {
                throw new Error('Thiếu cấu hình SMTP_USERNAME hoặc SMTP_PASSWORD.');
            }
            await transporter.verify();
            isVerified = true;
            return true;
        }
        catch (error) {
            return false;
        }
        finally {
            verifyPromise = null;
        }
    })();
    return verifyPromise;
}
async function emailUtil(to, subject, html) {
    try {
        if (!SMTP_USERNAME || !SMTP_PASSWORD) {
            throw new Error('Thiếu cấu hình SMTP_USERNAME hoặc SMTP_PASSWORD.');
        }
        if (!isVerified && !verifyPromise) {
            verifyEmailConnection().catch(() => {
            });
        }
        const info = await transporter.sendMail({
            from: `"${SMTP_FROMNAME}" <${SMTP_FROMEMAIL || SMTP_USERNAME}>`,
            to,
            subject,
            html,
        });
        return info;
    }
    catch (error) {
        if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
            isVerified = false;
        }
        throw new Error(error.message || 'Không thể gửi email, vui lòng kiểm tra cấu hình.');
    }
}
//# sourceMappingURL=email.util.js.map