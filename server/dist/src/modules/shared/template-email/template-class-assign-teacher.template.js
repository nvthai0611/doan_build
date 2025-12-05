"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classAssignTeacherEmailTemplate = void 0;
const function_util_1 = require("../../../utils/function.util");
const classAssignTeacherEmailTemplate = (teacherName, className, subject, startDate, schedule) => {
    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thông báo phân công lớp học</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
        <h2 style="color: #3b82f6;">📚 Thông báo phân công lớp học</h2>
        
        <p>Xin chào <strong>${teacherName}</strong>,</p>
        
        <p>Bạn đã được phân công giảng dạy lớp học mới:</p>
        
        <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Tên lớp:</strong> ${className}</p>
          ${subject ? `<p><strong>Môn học:</strong> ${subject}</p>` : ''}
          ${startDate ? `<p><strong>Ngày bắt đầu:</strong> ${startDate}</p>` : ''}
        </div>
        
        ${schedule ? `
        <div style="background-color: #e0f2fe; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>📅 Lịch học:</strong></p>
          <p style="margin: 5px 0; font-size: 14px;">${(0, function_util_1.formatSchedule)(schedule)}</p>
        </div>
        ` : ''}
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>📌 Lưu ý:</strong></p>
          <ul>
            <li>Vui lòng kiểm tra lịch dạy trên hệ thống</li>
            <li>Chuẩn bị giáo án và tài liệu giảng dạy</li>
            <li>Liên hệ phụ trách nếu có thắc mắc</li>
          </ul>
        </div>
        
        <p style="text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/teachers/schedule" 
             style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0;">
            Xem lịch dạy
          </a>
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Chúc bạn có một năm học thành công!
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
exports.classAssignTeacherEmailTemplate = classAssignTeacherEmailTemplate;
//# sourceMappingURL=template-class-assign-teacher.template.js.map