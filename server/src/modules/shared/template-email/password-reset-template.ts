/**
 * Template email reset password
 */
export const passwordResetEmailTemplate = (
  userName: string,
  resetLink: string,
  expiresInMinutes: number = 15
): string => {
  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Đặt lại mật khẩu</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
        <h2 style="color: #3b82f6;">🔐 Đặt lại mật khẩu</h2>
        
        <p>Xin chào <strong>${userName}</strong>,</p>
        
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
        
        <p>Vui lòng click vào nút bên dưới để đặt lại mật khẩu:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Đặt lại mật khẩu
          </a>
        </div>
        
        <p>Hoặc copy và dán link sau vào trình duyệt:</p>
        <p style="background-color: #fff; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
          ${resetLink}
        </p>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>⚠️ Lưu ý bảo mật:</strong></p>
          <ul>
            <li>Link này chỉ có hiệu lực trong ${expiresInMinutes} phút</li>
            <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
            <li>Không chia sẻ link này với bất kỳ ai</li>
          </ul>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Nếu bạn gặp vấn đề, vui lòng liên hệ với bộ phận hỗ trợ.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} Educational Center. Email này được gửi tự động.
        </p>
      </div>
    </body>
    </html>
  `;
};

