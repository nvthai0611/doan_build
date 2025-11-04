"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classRequestApprovalEmailTemplate = void 0;
const function_util_1 = require("../../../utils/function.util");
const classRequestApprovalEmailTemplate = (data) => {
    const { studentName, parentName, className, subjectName, teacherName, startDate, schedule, username, password } = data;
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yêu cầu tham gia lớp học đã được chấp nhận</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #4CAF50;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
      margin: -30px -30px 20px -30px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 20px 0;
    }
    .info-box {
      background-color: #f9f9f9;
      border-left: 4px solid #4CAF50;
      padding: 15px;
      margin: 15px 0;
    }
    .info-row {
      margin: 10px 0;
      font-size: 15px;
    }
    .label {
      font-weight: bold;
      color: #555;
    }
    .status-box {
      background-color: #e8f5e9;
      border: 1px solid #4CAF50;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      text-align: center;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 14px;
      color: #777;
      text-align: center;
    }
    .contact {
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .account-box {
      background-color: #f0f9ff;
      border: 2px solid #3b82f6;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .account-row {
      margin: 12px 0;
      font-size: 15px;
    }
    .account-label {
      font-weight: bold;
      color: #1e40af;
      display: inline-block;
      min-width: 120px;
    }
    .password-display {
      background-color: #ffffff;
      border: 1px solid #cbd5e0;
      padding: 8px 12px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-weight: bold;
      letter-spacing: 1px;
      display: inline-block;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Yêu Cầu Đã Được Chấp Nhận</h1>
    </div>
    
    <div class="content">
      <p>Kính gửi <strong>${parentName}</strong>,</p>
      
      <p>Chúng tôi xin thông báo yêu cầu tham gia lớp học của học sinh <strong>${studentName}</strong> đã được chấp nhận.</p>
      
      <div class="info-box">
        <div class="info-row">
          <span class="label">👨‍🎓 Học sinh:</span> ${studentName}
        </div>
        <div class="info-row">
          <span class="label">🏫 Lớp học:</span> ${className}
        </div>
        <div class="info-row">
          <span class="label">📚 Môn học:</span> ${subjectName}
        </div>
        ${teacherName ? `
        <div class="info-row">
          <span class="label">👨‍🏫 Giáo viên:</span> ${teacherName}
        </div>
        ` : ''}
        ${startDate ? `
        <div class="info-row">
          <span class="label">📅 Ngày bắt đầu:</span> ${startDate}
        </div>
        ` : ''}
      </div>
      
      ${schedule ? `
      <div style="background-color: #e0f2fe; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p style="margin: 0 0 10px 0;"><strong>📅 Lịch học:</strong></p>
        <p style="margin: 5px 0; font-size: 14px;">${(0, function_util_1.formatSchedule)(schedule)}</p>
      </div>
      ` : ''}
      
      <div class="status-box">
        <p style="margin: 0; font-size: 15px;">
          <strong>🎉 Học sinh đã được ghi danh vào lớp học thành công!</strong>
        </p>
      </div>
      
      ${username && password ? `
      <div class="account-box">
        <p style="margin: 0 0 15px 0; font-size: 16px;"><strong>🔐 Thông tin đăng nhập</strong></p>
        <div class="account-row">
          <span class="account-label">👨‍🎓 Học sinh:</span> ${studentName}
        </div>
        <div class="account-row">
          <span class="account-label">👤 Tài khoản:</span> <strong>${username}</strong>
        </div>
        <div class="account-row">
          <span class="account-label">🔑 Mật khẩu:</span> 
          <span class="password-display">${password}</span>
        </div>
        <div style="margin-top: 15px; padding: 12px; background-color: #fff9e6; border-radius: 4px;">
          <p style="margin: 0; font-size: 13px; color: #744210;">
            <strong>⚠️ Lưu ý:</strong> Vui lòng đổi mật khẩu ngay sau lần đăng nhập đầu tiên để bảo mật tài khoản.
          </p>
        </div>
      </div>
      ` : ''}
      
      <div class="contact">
        <p style="margin: 0 0 10px 0;"><strong>📞 Liên hệ hỗ trợ:</strong></p>
        <p style="margin: 5px 0;">☎️ Hotline: 0386828929</p>
        <p style="margin: 5px 0;">📧 Email: hainvthe172670@fpt.edu.vn</p>
        <p style="margin: 5px 0;">🏢 Địa chỉ: Thủy Nguyên - Hải Phòng</p>
      </div>
      
      <p style="margin-top: 20px;">
        Trân trọng,<br>
        <strong>Ban Quản Lý Trung Tâm Giáo Dục</strong>
      </p>
    </div>
    
    <div class="footer">
      <p>Email tự động từ hệ thống - Vui lòng không trả lời email này</p>
      <p>© ${new Date().getFullYear()} Educational Center Management System</p>
    </div>
  </div>
</body>
</html>
  `;
};
exports.classRequestApprovalEmailTemplate = classRequestApprovalEmailTemplate;
//# sourceMappingURL=template-class-request-approval.js.map