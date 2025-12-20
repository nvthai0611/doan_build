import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

// Lazy initialization transporter để đảm bảo env vars đã sẵn sàng
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) {
    return transporter;
  }

  const SMTP_HOST = process.env.SMTP_HOST?.trim();
  const SMTP_PORT = process.env.SMTP_PORT?.trim();
  const SMTP_SECURE = process.env.SMTP_SECURE?.trim();
  const SMTP_USERNAME = process.env.SMTP_USERNAME?.trim();
  const SMTP_PASSWORD = process.env.SMTP_PASSWORD?.trim();

  if (!SMTP_HOST || !SMTP_PORT) {
    throw new Error('Thiếu cấu hình SMTP_HOST hoặc SMTP_PORT. Vui lòng kiểm tra environment variables.');
  }

  if (!SMTP_USERNAME || !SMTP_PASSWORD) {
    throw new Error('Thiếu cấu hình SMTP_USERNAME hoặc SMTP_PASSWORD. Vui lòng kiểm tra environment variables.');
  }

  console.log(`[Email] Khởi tạo SMTP transporter: ${SMTP_HOST}:${SMTP_PORT}`);

  transporter = nodemailer.createTransport({
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
    family: 4,
    connectionTimeout: 30000, // 30 giây - tăng cho production
    greetingTimeout: 10000,   // 10 giây - tăng cho production
    socketTimeout: 30000,      // 30 giây - tăng cho production
    pool: true,                 // Enable connection pooling để reuse connections
    maxConnections: 5,          // Số lượng connections tối đa trong pool
    maxMessages: 100,          // Số lượng messages tối đa mỗi connection
  });

  return transporter;
}

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
      const SMTP_USERNAME = process.env.SMTP_USERNAME;
      const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

      if (!SMTP_USERNAME || !SMTP_PASSWORD) {
        console.error('[Email] ⚠️ Thiếu SMTP_USERNAME hoặc SMTP_PASSWORD');
        return false;
      }

      const transport = getTransporter();
      console.log('[Email] Đang verify SMTP connection...');
      await transport.verify();
      isVerified = true;
      console.log('[Email]SMTP connection verified successfully');
      return true;
    } catch (error: any) {
      // Không throw error, chỉ log để app vẫn có thể chạy
      // Email sẽ fail khi gửi nếu connection không hợp lệ
      console.error('[Email] ❌ SMTP verification failed:', error.message);
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
    const SMTP_USERNAME = process.env.SMTP_USERNAME;
    const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
    const SMTP_FROMNAME = process.env.SMTP_FROMNAME;
    const SMTP_FROMEMAIL = process.env.SMTP_FROMEMAIL;

    if (!SMTP_USERNAME || !SMTP_PASSWORD) {
      console.error('[Email] ❌ Thiếu SMTP_USERNAME hoặc SMTP_PASSWORD');
      throw new Error('Thiếu cấu hình SMTP_USERNAME hoặc SMTP_PASSWORD. Vui lòng kiểm tra environment variables.');
    }

    // Verify connection một lần (không block nếu đang verify)
    if (!isVerified && !verifyPromise) {
      // Verify async, không await để không block
      verifyEmailConnection().catch((err) => {
        console.warn('[Email] ⚠️ Verify connection failed:', err.message);
        // Ignore errors, sẽ retry khi gửi email
      });
    }

    // Gửi email trực tiếp, không verify mỗi lần
    const transport = getTransporter();
    console.log(` Đang gửi email đến ${to}...`);
    
    const info = await transport.sendMail({
      from: `"${SMTP_FROMNAME || 'Hệ thống'}" <${SMTP_FROMEMAIL || SMTP_USERNAME}>`,
      to,
      subject,
      html, 
    });

    console.log(` Đã gửi email thành công đến ${to}, messageId: ${info.messageId}`);
    return info;
  } catch (error: any) {
    // Reset verified status nếu có lỗi connection
    if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      isVerified = false;
      transporter = null; // Reset transporter để retry với config mới
      console.error(` Connection error: ${error.code} - ${error.message}`);
    } else {
      console.error(` Send error: ${error.message}`, {
        code: error.code,
        command: error.command,
        response: error.response,
      });
    }
    
    throw new Error(
      error.message || 'Không thể gửi email, vui lòng kiểm tra cấu hình.',
    );
  }
}
