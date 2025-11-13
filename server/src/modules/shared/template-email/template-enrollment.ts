import { formatSchedule } from '../../../utils/function.util';

/**
 * Template email thông báo đăng ký lớp học hoặc chuyển lớp cho phụ huynh
 */
export const enrollmentNotificationEmailTemplate = (data: {
  studentName: string;
  parentName: string;
  className: string;
  subjectName: string;
  teacherName?: string;
  startDate?: string;
  schedule?: any;
  enrollmentStatus: string;
  isTransfer?: boolean;
  oldClassName?: string;
  transferReason?: string;
}): string => {
  const {
    studentName,
    parentName,
    className,
    subjectName,
    teacherName,
    startDate,
    schedule,
    enrollmentStatus,
    isTransfer,
    oldClassName,
    transferReason,
  } = data;

  const isChuyểnLớp = isTransfer === true;

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thông báo đăng ký lớp học</title>
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
  </style>
</head>
<body>
  <div class="container">
    <div class="header" style="background-color: ${isChuyểnLớp ? '#2196F3' : '#4CAF50'};">
      <h1>${isChuyểnLớp ? '🔄 Thông Báo Chuyển Lớp' : '✅ Đăng Ký Lớp Học Thành Công'}</h1>
    </div>
    
    <div class="content">
      <p>Kính gửi <strong>${parentName}</strong>,</p>
      
      <p>Chúng tôi xin thông báo học sinh <strong>${studentName}</strong> ${isChuyểnLớp ? 'đã được chuyển lớp học' : 'đã được đăng ký thành công vào lớp học'}.</p>
      
      ${
        isChuyểnLớp && oldClassName
          ? `
      <div class="info-box" style="background-color: #ffebee; border-left: 4px solid #f44336;">
        <p style="margin: 0 0 10px 0;"><strong>📚 Lớp cũ:</strong></p>
        <div class="info-row">
          <span class="label">🏫 Tên lớp:</span> ${oldClassName}
        </div>
      </div>
      
      <div style="text-align: center; font-size: 24px; color: #2196F3; margin: 10px 0;">
        ⬇️
      </div>
      `
          : ''
      }
      
      <div class="info-box" style="border-left-color: ${isChuyểnLớp ? '#2196F3' : '#4CAF50'}; background-color: ${isChuyểnLớp ? '#e8f5e9' : '#f9f9f9'};">
        <div class="info-row">
          <span class="label">👨‍🎓 Học sinh:</span> ${studentName}
        </div>
        ${isChuyểnLớp ? '<p style="margin: 0 0 10px 0;"><strong>📚 Lớp mới:</strong></p>' : ''}
        <div class="info-row">
          <span class="label">🏫 ${isChuyểnLớp ? 'Tên lớp:' : 'Lớp học:'}</span> ${className}
        </div>
        <div class="info-row">
          <span class="label">📚 Môn học:</span> ${subjectName}
        </div>
        ${
          teacherName
            ? `
        <div class="info-row">
          <span class="label">👨‍🏫 Giáo viên:</span> ${teacherName}
        </div>
        `
            : ''
        }
        ${
          startDate
            ? `
        <div class="info-row">
          <span class="label">📅 Ngày bắt đầu:</span> ${startDate}
        </div>
        `
            : ''
        }
      </div>
      
      ${
        schedule
          ? `
      <div style="background-color: #e0f2fe; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p style="margin: 0 0 10px 0;"><strong>📅 Lịch học:</strong></p>
        <p style="margin: 5px 0; font-size: 14px;">${formatSchedule(schedule)}</p>
      </div>
      `
          : ''
      }
      
      ${
        transferReason
          ? `
      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 4px;">
        <p style="margin: 0 0 10px 0;"><strong>📝 Lý do chuyển lớp:</strong></p>
        <p style="margin: 5px 0;">${transferReason}</p>
      </div>
      `
          : ''
      }
      
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
