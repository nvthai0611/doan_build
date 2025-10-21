/**
 * Template email thông báo vắng mặt của học sinh gửi cho phụ huynh
 */
export const studentAbsenceEmailTemplate = (
  studentName: string,
  className: string,
  absenceDate: string,
  sessionTime?: string,
  subject?: string,
  teacherName?: string,
  note?: string
): string => {
  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thông báo vắng học</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .email-container {
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #f59e0b, #ef4444);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .content {
          padding: 30px;
        }
        .greeting {
          font-size: 16px;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .alert-box {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 20px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
        .alert-title {
          font-size: 18px;
          font-weight: 600;
          color: #92400e;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
        }
        .alert-icon {
          font-size: 24px;
          margin-right: 10px;
        }
        .info-section {
          background-color: #f8fafc;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .info-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
        }
        .info-row {
          display: flex;
          margin-bottom: 12px;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }
        .info-label {
          font-weight: 600;
          color: #374151;
          min-width: 140px;
          margin-right: 10px;
        }
        .info-value {
          color: #6b7280;
          flex: 1;
        }
        .highlight {
          background-color: #fef3c7;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 600;
          color: #92400e;
        }
        .note-section {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
        }
        .note-title {
          font-weight: 600;
          color: #991b1b;
          margin-bottom: 8px;
        }
        .note-content {
          color: #7f1d1d;
          font-style: italic;
        }
        .action-section {
          background-color: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        .action-title {
          font-size: 16px;
          font-weight: 600;
          color: #1e40af;
          margin-bottom: 15px;
        }
        .action-list {
          text-align: left;
          color: #1e3a8a;
          line-height: 1.8;
        }
        .action-list li {
          margin-bottom: 8px;
        }
        .button {
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin-top: 15px;
          transition: background-color 0.3s;
        }
        .button:hover {
          background-color: #2563eb;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          color: #6c757d;
          font-size: 14px;
          border-top: 1px solid #dee2e6;
        }
        .footer p {
          margin: 5px 0;
        }
        .contact-info {
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
        }
        .contact-info p {
          margin: 5px 0;
          color: #166534;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>⚠️ Thông Báo Vắng Học</h1>
          <p>Hệ thống điểm danh tự động</p>
        </div>
        
        <div class="content">
          <div class="greeting">
            <p>Kính gửi <strong>Quý phụ huynh</strong>,</p>
          </div>
          
          <div class="alert-box">
            <div class="alert-title">
              <span class="alert-icon">📢</span>
              Học sinh vắng mặt trong buổi học hôm nay
            </div>
            <p style="color: #92400e; margin: 0;">
              Chúng tôi xin thông báo học sinh <span class="highlight">${studentName}</span> đã vắng mặt trong buổi học.
            </p>
          </div>
          
          <div class="info-section">
            <div class="info-title">
              📋 Thông tin chi tiết
            </div>
            <div class="info-row">
              <span class="info-label">👨‍🎓 Tên học sinh:</span>
              <span class="info-value"><strong>${studentName}</strong></span>
            </div>
            <div class="info-row">
              <span class="info-label">🏫 Lớp học:</span>
              <span class="info-value"><strong>${className}</strong></span>
            </div>
            <div class="info-row">
              <span class="info-label">📅 Ngày vắng:</span>
              <span class="info-value"><strong>${absenceDate}</strong></span>
            </div>
            ${sessionTime ? `
              <div class="info-row">
                <span class="info-label">🕐 Thời gian:</span>
                <span class="info-value">${sessionTime}</span>
              </div>
            ` : ''}
            ${subject ? `
              <div class="info-row">
                <span class="info-label">📚 Môn học:</span>
                <span class="info-value">${subject}</span>
              </div>
            ` : ''}
            ${teacherName ? `
              <div class="info-row">
                <span class="info-label">👨‍🏫 Giáo viên:</span>
                <span class="info-value">${teacherName}</span>
              </div>
            ` : ''}
          </div>
          
          ${note ? `
            <div class="note-section">
              <div class="note-title">📝 Ghi chú từ giáo viên:</div>
              <div class="note-content">${note}</div>
            </div>
          ` : ''}
          
          <div class="action-section">
            <div class="action-title">🤝 Quý phụ huynh vui lòng:</div>
            <ul class="action-list">
              <li>✅ Kiểm tra và xác nhận thông tin với con em</li>
              <li>✅ Liên hệ với giáo viên nếu có thắc mắc</li>
              <li>✅ Gửi đơn xin phép nếu em có lý do chính đáng</li>
              <li>✅ Theo dõi tình hình học tập của con thường xuyên</li>
            </ul>
            <a href="#" class="button">Xem chi tiết điểm danh</a>
          </div>
          
          <div class="contact-info">
            <p><strong>📞 Liên hệ hỗ trợ:</strong></p>
            <p>☎️ Hotline: 1900-xxxx</p>
            <p>📧 Email: support@educational-center.edu.vn</p>
            <p>🏢 Địa chỉ: [Địa chỉ trung tâm]</p>
          </div>
          
          <p style="margin-top: 30px; color: #6b7280;">
            Trân trọng,<br>
            <strong style="color: #1f2937;">Ban Giám Hiệu Trung Tâm Giáo Dục</strong>
          </p>
        </div>
        
        <div class="footer">
          <p><strong>🔔 Email tự động từ hệ thống quản lý trung tâm</strong></p>
          <p>Vui lòng không trả lời email này</p>
          <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
            © ${new Date().getFullYear()} Educational Center Management System. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Template email tổng hợp vắng mặt nhiều buổi (gửi cho phụ huynh hàng tuần/tháng)
 */
export const multipleAbsenceEmailTemplate = (
  studentName: string,
  className: string,
  absenceCount: number,
  absenceDates: string[],
  totalSessions: number,
  attendanceRate: number
): string => {
  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Báo cáo tình hình điểm danh</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .email-container {
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #dc2626, #991b1b);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          padding: 30px;
        }
        .warning-box {
          background-color: #fee2e2;
          border-left: 4px solid #dc2626;
          padding: 20px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin: 20px 0;
        }
        .stat-card {
          background-color: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          border: 2px solid #e5e7eb;
        }
        .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: #dc2626;
        }
        .stat-label {
          font-size: 14px;
          color: #6b7280;
          margin-top: 5px;
        }
        .absence-list {
          background-color: #fef2f2;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .absence-item {
          padding: 10px;
          margin: 5px 0;
          background-color: white;
          border-left: 3px solid #dc2626;
          border-radius: 4px;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          color: #6c757d;
          font-size: 14px;
          border-top: 1px solid #dee2e6;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>📊 Báo Cáo Tình Hình Điểm Danh</h1>
        </div>
        
        <div class="content">
          <div class="warning-box">
            <h2 style="margin-top: 0; color: #991b1b;">⚠️ Cảnh báo tỷ lệ vắng mặt cao</h2>
            <p style="color: #7f1d1d; margin: 0;">
              Học sinh <strong>${studentName}</strong> đã vắng mặt <strong>${absenceCount}</strong> buổi trong tổng số <strong>${totalSessions}</strong> buổi học gần đây.
            </p>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${absenceCount}</div>
              <div class="stat-label">Buổi vắng</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${attendanceRate}%</div>
              <div class="stat-label">Tỷ lệ đi học</div>
            </div>
          </div>
          
          <div class="absence-list">
            <h3 style="margin-top: 0; color: #991b1b;">📅 Danh sách các ngày vắng:</h3>
            ${absenceDates.map(date => `
              <div class="absence-item">❌ ${date}</div>
            `).join('')}
          </div>
          
          <p style="color: #7f1d1d; font-weight: 600; margin-top: 20px;">
            Quý phụ huynh vui lòng lưu ý tình trạng vắng học của con em để đảm bảo việc học tập được liên tục và hiệu quả.
          </p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Educational Center. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};