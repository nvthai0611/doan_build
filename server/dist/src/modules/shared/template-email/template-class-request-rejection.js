"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classRequestRejectionEmailTemplate = void 0;
const classRequestRejectionEmailTemplate = (data) => {
    const { studentName, parentName, className, subjectName, reason } = data;
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thông báo từ chối yêu cầu tham gia lớp học</title>
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
      background-color: #f44336;
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
      border-left: 4px solid #f44336;
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
      background-color: #ffebee;
      border: 1px solid #f44336;
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
    .reason-box {
      background-color: #fff9e6;
      border: 1px solid #ff9800;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❌ Yêu Cầu Đã Bị Từ Chối</h1>
    </div>
    
    <div class="content">
      <p>Kính gửi <strong>${parentName}</strong>,</p>
      
      <p>Chúng tôi rất tiếc phải thông báo rằng yêu cầu tham gia lớp học của học sinh <strong>${studentName}</strong> đã bị từ chối.</p>
      
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
      </div>
      
      ${reason ? `
      <div class="reason-box">
        <p style="margin: 0 0 10px 0;"><strong>📝 Lý do từ chối:</strong></p>
        <p style="margin: 5px 0; font-size: 14px;">${reason}</p>
      </div>
      ` : ''}
      
      <div class="status-box">
        <p style="margin: 0; font-size: 15px;">
          <strong>⚠️ Yêu cầu đã bị từ chối</strong>
        </p>
      </div>
      
      <div class="contact">
        <p style="margin: 0 0 10px 0;"><strong>📞 Liên hệ hỗ trợ:</strong></p>
        <p style="margin: 5px 0;">☎️ Hotline: 0386828929</p>
        <p style="margin: 5px 0;">📧 Email: hainvthe172670@fpt.edu.vn</p>
        <p style="margin: 5px 0;">🏢 Địa chỉ: Thủy Nguyên - Hải Phòng</p>
        <p style="margin: 10px 0 0 0; font-size: 14px;">
          Nếu bạn có bất kỳ thắc mắc nào về quyết định này, vui lòng liên hệ với chúng tôi để được giải đáp.
        </p>
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
exports.classRequestRejectionEmailTemplate = classRequestRejectionEmailTemplate;
//# sourceMappingURL=template-class-request-rejection.js.map