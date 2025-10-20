import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USERNAME,
  SMTP_PASSWORD,
  SMTP_FROMNAME,
  SMTP_FROMEMAIL,
} = process.env;

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

export default async function emailUtil(
  to: string,
  subject: string,
  html: string,
) {
  try {
    if (!SMTP_USERNAME || !SMTP_PASSWORD) {
      throw new Error('Thiếu cấu hình SMTP_USERNAME hoặc SMTP_PASSWORD.');
    }

    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');

    const info = await transporter.sendMail({
      from: `"${SMTP_FROMNAME}" <${SMTP_FROMEMAIL || SMTP_USERNAME}>`,
      to,
      subject,
      html,
    });

    console.log(`📧 Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error: any) {
    console.error('❌ Failed to send email:', error);
    throw new Error(
      error.message || 'Không thể gửi email, vui lòng kiểm tra cấu hình.',
    );
  }
}
