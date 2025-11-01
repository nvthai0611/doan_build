/**
 * Template email thông báo thay đổi trạng thái lớp học cho phụ huynh
 */
export const classStatusChangeEmailTemplate = (data: {
  parentName: string;
  studentName: string;
  className: string;
  subjectName: string;
  teacherName?: string;
  oldStatus: string;
  newStatus: string;
  statusLabel: string;
  statusColor: string;
  statusIcon: string;
}): string => {
  const { parentName, studentName, className, subjectName, teacherName, oldStatus, newStatus, statusLabel } = data;

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      'draft': 'Bản nháp',
      'ready': 'Sẵn sàng',
      'active': 'Đang hoạt động',
      'completed': 'Đã hoàn thành',
      'suspended': 'Tạm dừng',
      'cancelled': 'Đã hủy',
    };
    return labels[status] || status;
  };

  const oldStatusLabel = getStatusLabel(oldStatus);

  let statusMessage = '';
  if (newStatus === 'completed') {
    statusMessage = 'Chúc mừng! Lớp học đã hoàn thành thành công. Cảm ơn bạn đã đồng hành cùng chúng tôi!';
  } else if (newStatus === 'suspended') {
    statusMessage = 'Lưu ý: Lớp học đã tạm dừng. Chúng tôi sẽ thông báo khi lớp học tiếp tục hoạt động.';
  } else if (newStatus === 'cancelled') {
    statusMessage = 'Thông báo: Lớp học đã bị hủy. Vui lòng liên hệ với chúng tôi nếu có thắc mắc.';
  } else if (newStatus === 'active') {
    statusMessage = 'Lớp học đã bắt đầu! Lớp học đã chính thức hoạt động. Vui lòng theo dõi lịch học và thông báo từ giáo viên.';
  }

  return `
Thông báo thay đổi trạng thái lớp học

Kính gửi ${parentName},

Chúng tôi xin thông báo về việc thay đổi trạng thái lớp học mà học sinh ${studentName} đang tham gia:

Trạng thái: ${statusLabel}

Thông tin lớp học:
- Học sinh: ${studentName}
- Lớp học: ${className}
- Môn học: ${subjectName}
${teacherName ? `- Giáo viên: ${teacherName}` : ''}
- Trạng thái cũ: ${oldStatusLabel}
- Trạng thái mới: ${statusLabel}

${statusMessage ? `${statusMessage}\n` : ''}

Liên hệ hỗ trợ:
Hotline: 0386828929
Email: hainvthe172670@fpt.edu.vn
Địa chỉ: Thủy Nguyên - Hải Phòng

Trân trọng,
Ban Quản Lý Trung Tâm Giáo Dục

---
Email tự động từ hệ thống - Vui lòng không trả lời email này
  `;
};

