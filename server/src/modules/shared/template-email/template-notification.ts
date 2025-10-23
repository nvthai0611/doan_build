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
          </div>
          
          <div class="contact-info">
            <p><strong>📞 Liên hệ hỗ trợ:</strong></p>
            <p>☎️ Hotline: 0382657962</p>
            <p>📧 Email: support@qne.edu.vn</p>
            <p>🏢 Địa chỉ: Thủy Nguyên - Hải Phòng</p>
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

/**
 * Template email thông báo thanh toán thành công
 * Hỗ trợ thanh toán cho nhiều học sinh
 */
export const paymentSuccessEmailTemplate = (data: {
  parentName: string;
  orderCode: string;
  totalAmount: number;
  paymentDate: string;
  paymentTime: string;
  paymentMethod: string;
  bankName?: string;
  transactionCode?: string;
  students: Array<{
    studentName: string;
    studentCode: string;
    className: string;
    feeAmount: number;
    feeDescription?: string;
  }>;
}): string => {
  const { parentName, orderCode, totalAmount, paymentDate, paymentTime, paymentMethod, bankName, transactionCode, students } = data;
  
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận thanh toán thành công</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background-color: #f9fafb;
      padding: 20px;
    }

    .email-container {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      max-width: 600px;
      margin: 0 auto;
    }

    /* Header */
    .header {
      background-color: #065f46;
      color: white;
      padding: 48px 32px;
      text-align: center;
    }

    .header-icon {
      font-size: 48px;
      margin-bottom: 16px;
      display: inline-block;
    }

    .header h1 {
      font-size: 32px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.5px;
    }

    .header p {
      font-size: 14px;
      margin: 8px 0 0 0;
      opacity: 0.95;
    }

    /* Content */
    .content {
      padding: 40px 32px;
    }

    .greeting {
      font-size: 16px;
      color: #1f2937;
      margin-bottom: 24px;
      line-height: 1.6;
    }

    .greeting strong {
      color: #065f46;
      font-weight: 600;
    }

    .success-box {
      background-color: #ecfdf5;
      border-left: 4px solid #10b981;
      padding: 16px 20px;
      margin-bottom: 32px;
      border-radius: 4px;
    }

    .success-box p {
      color: #047857;
      margin: 0;
      font-size: 15px;
      line-height: 1.6;
    }

    /* Amount Section */
    .amount-box {
      background-color: #f0fdf4;
      border: 1px solid #d1fae5;
      border-radius: 6px;
      padding: 32px;
      margin: 32px 0;
      text-align: center;
    }

    .amount-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      font-weight: 600;
    }

    .amount-value {
      font-size: 40px;
      font-weight: 700;
      color: #065f46;
      letter-spacing: -1px;
    }

    /* Info Section */
    .info-box {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 24px;
      margin: 24px 0;
    }

    .info-title {
      font-size: 15px;
      font-weight: 600;
      color: #065f46;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      font-size: 14px;
      border-bottom: 1px solid #f3f4f6;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-label {
      font-weight: 600;
      color: #6b7280;
    }

    .info-value {
      color: #1f2937;
      text-align: right;
    }

    /* Student Section */
    .student-box {
      background-color: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 6px;
      padding: 20px;
      margin: 16px 0;
    }

    .student-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #bae6fd;
    }

    .student-name {
      font-size: 15px;
      font-weight: 600;
      color: #0c4a6e;
    }

    .student-description {
      font-size: 13px;
      color: #0369a1;
      margin-top: 4px;
    }

    .student-code {
      font-size: 12px;
      color: #0c4a6e;
      background-color: white;
      padding: 6px 12px;
      border-radius: 4px;
      border: 1px solid #bae6fd;
      font-weight: 600;
    }

    .student-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      font-size: 14px;
    }

    .student-label {
      color: #0c4a6e;
      font-weight: 600;
    }

    .student-value {
      color: #0369a1;
    }

    .fee-amount {
      font-size: 18px;
      color: #065f46;
      font-weight: 700;
    }

    /* Total Section */
    .total-box {
      background-color: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 6px;
      padding: 24px;
      margin: 24px 0;
      text-align: center;
    }

    .total-label {
      font-size: 12px;
      color: #92400e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      font-weight: 600;
    }

    .total-amount {
      font-size: 36px;
      font-weight: 700;
      color: #b45309;
    }

    /* Notes Section */
    .notes-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin: 24px 0;
      border-radius: 4px;
    }

    .notes-title {
      font-weight: 600;
      color: #92400e;
      margin-bottom: 12px;
      font-size: 15px;
    }

    .notes-list {
      color: #78350f;
      font-size: 14px;
      line-height: 1.7;
      padding-left: 20px;
    }

    .notes-list li {
      margin-bottom: 8px;
    }

    /* Contact Section */
    .contact-box {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 6px;
      padding: 20px;
      margin: 24px 0;
    }

    .contact-box p {
      margin: 8px 0;
      color: #166534;
      font-size: 14px;
      line-height: 1.6;
    }

    .contact-box strong {
      font-weight: 600;
      color: #15803d;
    }

    /* Closing */
    .closing {
      margin-top: 32px;
      color: #4b5563;
      font-size: 14px;
      line-height: 1.7;
    }

    .closing strong {
      color: #065f46;
      font-weight: 600;
    }

    /* Footer */
    .footer {
      background-color: #f9fafb;
      padding: 24px 32px;
      text-align: center;
      color: #6b7280;
      font-size: 13px;
      border-top: 1px solid #e5e7eb;
    }

    .footer p {
      margin: 6px 0;
    }

    .footer strong {
      color: #4b5563;
      font-weight: 600;
    }

    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 24px 0;
    }

    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: #065f46;
      margin: 24px 0 16px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <div class="header-icon">✓</div>
      <h1>Thanh Toán Thành Công</h1>
      <p>Xác nhận giao dịch học phí</p>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="greeting">
        Kính gửi <strong>Phụ huynh</strong>,
      </div>

      <div class="success-box">
        <p>Cảm ơn Quý phụ huynh đã thanh toán học phí. Chúng tôi xin xác nhận đã nhận được khoản thanh toán của bạn.</p>
      </div>

      <!-- Amount -->
      <div class="amount-box">
        <div class="amount-label">Tổng số tiền thanh toán</div>
        <div class="amount-value">5,000,000đ</div>
      </div>

      <!-- Transaction Info -->
      <div class="info-box">
        <div class="info-title">Thông tin giao dịch</div>
        <div class="info-row">
          <span class="info-label">Mã đơn hàng</span>
          <span class="info-value">ORD-2024-001</span>
        </div>
        <div class="info-row">
          <span class="info-label">Ngày thanh toán</span>
          <span class="info-value">23/10/2024</span>
        </div>
        <div class="info-row">
          <span class="info-label">Thời gian</span>
          <span class="info-value">14:30</span>
        </div>
        <div class="info-row">
          <span class="info-label">Phương thức</span>
          <span class="info-value">Chuyển khoản ngân hàng</span>
        </div>
        <div class="info-row">
          <span class="info-label">Ngân hàng</span>
          <span class="info-value">Vietcombank</span>
        </div>
        <div class="info-row">
          <span class="info-label">Mã giao dịch</span>
          <span class="info-value">TXN-2024-123456</span>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Student Details -->
      <div class="section-title">Chi tiết học phí</div>

      <div class="student-box">
        <div class="student-header">
          <div>
            <div class="student-name">1. Nguyễn Văn A</div>
            <div class="student-description">Học phí tháng 10/2024</div>
          </div>
          <div class="student-code">SV-001</div>
        </div>
        <div class="student-row">
          <span class="student-label">Lớp học</span>
          <span class="student-value">Lớp 10A1</span>
        </div>
        <div class="student-row">
          <span class="student-label">Số tiền</span>
          <span class="fee-amount">2,500,000đ</span>
        </div>
      </div>

      <div class="student-box">
        <div class="student-header">
          <div>
            <div class="student-name">2. Nguyễn Văn B</div>
            <div class="student-description">Học phí tháng 10/2024</div>
          </div>
          <div class="student-code">SV-002</div>
        </div>
        <div class="student-row">
          <span class="student-label">Lớp học</span>
          <span class="student-value">Lớp 11B2</span>
        </div>
        <div class="student-row">
          <span class="student-label">Số tiền</span>
          <span class="fee-amount">2,500,000đ</span>
        </div>
      </div>

      <!-- Total -->
      <div class="total-box">
        <div class="total-label">Tổng cộng (2 học sinh)</div>
        <div class="total-amount">5,000,000đ</div>
      </div>

      <!-- Notes -->
      <div class="notes-box">
        <div class="notes-title">Lưu ý quan trọng</div>
        <ul class="notes-list">
          <li>Vui lòng lưu lại email này để đối chiếu</li>
          <li>Biên lai thanh toán đã được ghi nhận vào hệ thống</li>
          <li>Quý phụ huynh có thể xem lịch sử thanh toán trong tài khoản</li>
          <li>Nếu có thắc mắc, vui lòng liên hệ bộ phận tài chính</li>
        </ul>
      </div>

      <!-- Contact -->
      <div class="contact-box">
        <p><strong>Liên hệ hỗ trợ</strong></p>
        <p>☎️ Hotline: 0382657962</p>
        <p>📧 Email: finance@qne.edu.vn</p>
        <p>🏢 Địa chỉ: Thủy Nguyên - Hải Phòng</p>
        <p>🕐 Giờ làm việc: 8:00 - 17:30 (Thứ 2 - Thứ 7)</p>
      </div>

      <!-- Closing -->
      <p class="closing">
        Trân trọng cảm ơn,<br>
        <strong>Phòng Tài Chính - Kế Toán<br>Trung Tâm Giáo Dục QNEdu</strong>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Email xác nhận tự động từ hệ thống</strong></p>
      <p>Vui lòng không trả lời email này</p>
      <p style="margin-top: 12px; color: #9ca3af;">
        © 2025 QNEdu - Educational Center Management System. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`
};