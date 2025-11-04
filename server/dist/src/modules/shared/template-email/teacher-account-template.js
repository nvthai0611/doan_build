"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teacherAccountEmailTemplate = void 0;
const teacherAccountEmailTemplate = (teacherName, username, email, password, teacherCode) => {
    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thông tin tài khoản</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
        <h2 style="color: #3b82f6;">🎓 Chào mừng đến với Trung tâm</h2>
        
        <p>Xin chào <strong>${teacherName}</strong>,</p>
        
        <p>Tài khoản giáo viên của bạn đã được tạo thành công. Dưới đây là thông tin đăng nhập:</p>
        
        <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Mã giáo viên:</strong> ${teacherCode}</p>
          <p><strong>Tên đăng nhập:</strong> ${username}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p style="color: #dc2626;"><strong>Mật khẩu:</strong> ${password}</p>
        </div>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>⚠️ Lưu ý bảo mật:</strong></p>
          <ul>
            <li>Vui lòng đổi mật khẩu ngay sau lần đăng nhập đầu tiên</li>
            <li>Không chia sẻ thông tin tài khoản với bất kỳ ai</li>
          </ul>
        </div>
        
        <p style="text-align: center;">
          <a href="${'http://localhost:5173/auth/login/management'}" 
             style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0;">
            Đăng nhập ngay
          </a>
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Nếu bạn cần hỗ trợ, vui lòng liên hệ với bộ phận quản lý.
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
exports.teacherAccountEmailTemplate = teacherAccountEmailTemplate;
//# sourceMappingURL=teacher-account-template.js.map