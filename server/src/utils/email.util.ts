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
  connectionTimeout: 10000, // Giảm từ 60s xuống 10s
  greetingTimeout: 5000,     // Giảm từ 30s xuống 5s
  socketTimeout: 10000,       // Giảm từ 60s xuống 10s
  pool: true,                 // Enable connection pooling để reuse connections
  maxConnections: 5,          // Số lượng connections tối đa trong pool
  maxMessages: 100,          // Số lượng messages tối đa mỗi connection
});

// Biến để track xem đã verify chưa (chỉ verify một lần khi khởi động)
let isVerified = false;
let verifyPromise: Promise<boolean> | null = null;

/**
 * Verify SMTP connection một lần khi khởi động app
 * Có thể gọi từ main.ts hoặc để tự động verify lần đầu tiên gửi email
 */
export async function verifyEmailConnection(): Promise<boolean> {
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
    } catch (error: any) {
      // Không throw error, chỉ log để app vẫn có thể chạy
      // Email sẽ fail khi gửi nếu connection không hợp lệ
      return false;
    } finally {
      verifyPromise = null;
    }
  })();

  return verifyPromise;
}

export default async function emailUtil(
  to: string,
  subject: string,
  html: string,
) {
  try {
    if (!SMTP_USERNAME || !SMTP_PASSWORD) {
      throw new Error('Thiếu cấu hình SMTP_USERNAME hoặc SMTP_PASSWORD.');
    }

    // Verify connection một lần (không block nếu đang verify)
    if (!isVerified && !verifyPromise) {
      // Verify async, không await để không block
      verifyEmailConnection().catch(() => {
        // Ignore errors, sẽ retry khi gửi email
      });
    }

    // Gửi email trực tiếp, không verify mỗi lần
    const info = await transporter.sendMail({
      from: `"${SMTP_FROMNAME}" <${SMTP_FROMEMAIL || SMTP_USERNAME}>`,
      to,
      subject,
      html,
    });

    return info;
  } catch (error: any) {
    // Reset verified status nếu có lỗi connection
    if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      isVerified = false;
    }
    
    throw new Error(
      error.message || 'Không thể gửi email, vui lòng kiểm tra cấu hình.',
    );
  }
}
