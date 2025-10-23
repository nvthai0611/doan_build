export const classRemoveTeacherEmailTemplate = (
  teacherName: string,
  className: string,
  reason?: string
) => {
  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thông báo hủy phân công lớp học</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
        <h2 style="color: #dc2626;">📋 Thông báo hủy phân công lớp học</h2>
        
        <p>Xin chào <strong>${teacherName}</strong>,</p>
        
        <p>Chúng tôi xin thông báo về việc hủy phân công giảng dạy:</p>
        
        <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p><strong>Lớp học:</strong> ${className}</p>
          <p style="color: #dc2626;"><strong>Trạng thái:</strong> Đã hủy phân công</p>
          ${reason ? `<p><strong>Lý do:</strong> ${reason}</p>` : ''}
        </div>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>📌 Lưu ý:</strong></p>
          <ul>
            <li>Lịch dạy lớp này đã được gỡ khỏi lịch trình của bạn</li>
            <li>Vui lòng kiểm tra lại lịch dạy hiện tại trên hệ thống</li>
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
          Cảm ơn bạn đã hợp tác!
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

