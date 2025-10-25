import { ClassSession } from '@prisma/client';

/**
 * Interface cho session data cần thiết để tính toán status
 */
interface SessionData {
  sessionDate: Date;
  startTime: string;
  endTime: string;
  status: string;
}

/**
 * Tính toán status của session dựa trên thời gian thực
 * @param session - Session data object
 * @returns string - Status được tính toán
 */
export function calculateSessionStatus(session: SessionData): string {
  const now = new Date();
  const sessionDate = new Date(session.sessionDate);
  
  // Parse thời gian bắt đầu và kết thúc
  const [startHour, startMin] = session.startTime.split(':').map(Number);
  const [endHour, endMin] = session.endTime.split(':').map(Number);
  
  // Tạo datetime cho thời gian bắt đầu và kết thúc
  const sessionStartDateTime = new Date(sessionDate);
  sessionStartDateTime.setHours(startHour, startMin, 0, 0);
  
  const sessionEndDateTime = new Date(sessionDate);
  sessionEndDateTime.setHours(endHour, endMin, 0, 0);
  
  // Logic tính toán status
  if (now < sessionStartDateTime) {
    // Chưa đến giờ học
    return 'scheduled';
  } else if (now >= sessionStartDateTime && now <= sessionEndDateTime) {
    // Đang trong giờ học
    return 'happening';
  } else {
    // Đã kết thúc giờ học
    return 'completed';
  }
}

/**
 * Tính toán status với override cho các trường hợp đặc biệt
 * @param session - Session data object
 * @param overrideStatus - Status override (nếu có)
 * @returns string - Status cuối cùng
 */
export function getSessionStatus(session: SessionData, overrideStatus?: string): string {
  // Nếu có override status và là cancelled, ưu tiên override
  if (overrideStatus === 'cancelled') {
    return 'cancelled';
  }
  
  // Tính toán status động
  const calculatedStatus = calculateSessionStatus(session);
  
  // Nếu session đã bị cancelled trong DB, giữ nguyên
  if (session.status === 'cancelled') {
    return 'cancelled';
  }
  
  // Nếu session đã kết thúc nhưng chưa có điểm danh, hiển thị "incomplete"
  if (calculatedStatus === 'completed') {
    // Nếu có override status là 'no_attendance', hiển thị "incomplete"
    if (overrideStatus === 'no_attendance') {
      return 'incomplete';
    }
    
    // Nếu đã có điểm danh, mới hiển thị 'completed'
    return 'completed';
  }
  
  // Trả về status được tính toán
  return calculatedStatus;
}

/**
 * Kiểm tra xem session có cần cập nhật status không
 * @param session - Session data object
 * @returns boolean - true nếu cần cập nhật
 */
export function shouldUpdateSessionStatus(session: SessionData): boolean {
  const calculatedStatus = calculateSessionStatus(session);
  
  // Chỉ cập nhật nếu status khác với status hiện tại
  // và không phải là cancelled (cancelled không bao giờ thay đổi)
  return session.status !== calculatedStatus && session.status !== 'cancelled';
}

/**
 * Lấy thông tin chi tiết về thời gian session
 * @param session - Session data object
 * @returns object - Thông tin thời gian
 */
export function getSessionTimeInfo(session: SessionData) {
  const now = new Date();
  const sessionDate = new Date(session.sessionDate);
  
  const [startHour, startMin] = session.startTime.split(':').map(Number);
  const [endHour, endMin] = session.endTime.split(':').map(Number);
  
  const sessionStartDateTime = new Date(sessionDate);
  sessionStartDateTime.setHours(startHour, startMin, 0, 0);
  
  const sessionEndDateTime = new Date(sessionDate);
  sessionEndDateTime.setHours(endHour, endMin, 0, 0);
  
  return {
    now,
    sessionStartDateTime,
    sessionEndDateTime,
    isBeforeSession: now < sessionStartDateTime,
    isDuringSession: now >= sessionStartDateTime && now <= sessionEndDateTime,
    isAfterSession: now > sessionEndDateTime,
    timeUntilStart: sessionStartDateTime.getTime() - now.getTime(),
    timeUntilEnd: sessionEndDateTime.getTime() - now.getTime(),
    timeSinceEnd: now.getTime() - sessionEndDateTime.getTime()
  };
}
