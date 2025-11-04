"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
});
async function emailUtil(to, subject, html) {
    try {
        if (!SMTP_USERNAME || !SMTP_PASSWORD) {
            throw new Error('Thiếu cấu hình SMTP_USERNAME hoặc SMTP_PASSWORD.');
        }
        await transporter.verify();
        const info = await transporter.sendMail({
            from: `"${SMTP_FROMNAME}" <${SMTP_FROMEMAIL || SMTP_USERNAME}>`,
            to,
            subject,
            html,
        });
        return info;
    }
    catch (error) {
        throw new Error(error.message || 'Không thể gửi email, vui lòng kiểm tra cấu hình.');
    }
}
//# sourceMappingURL=email.util.js.map