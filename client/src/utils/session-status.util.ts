/**
 * Interface cho session data từ API
 */
export interface SessionData {
  id: string;
  sessionDate: string | Date;
  startTime: string;
  endTime: string;
  status: string;
  [key: string]: unknown;
}

/**
 * Tính toán status của session dựa trên thời gian thực
 * @param session - Session data object
 * @returns string - Status được tính toán
 */
export function calculateSessionStatus(session: SessionData | null | undefined): string {
  // Nếu session null hoặc undefined, trả về default
  if (!session) {
    return 'scheduled';
  }
  
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
 * Lấy status hiển thị cho session (có override logic)
 * @param session - Session data object
 * @returns string - Status cuối cùng để hiển thị
 */
export function getDisplaySessionStatus(session: SessionData | null | undefined): string {
  // Nếu session null hoặc undefined, trả về default
  if (!session) {
    return 'scheduled';
  }
  
  // Nếu session đã bị cancelled trong DB, giữ nguyên
  if (session.status === 'cancelled') {
    return 'cancelled';
  }
  
  // Tính toán status động
  const calculatedStatus = calculateSessionStatus(session);
  
  // Nếu session đã kết thúc nhưng chưa có điểm danh, hiển thị "Chưa hoàn thành"
  if (calculatedStatus === 'completed') {
    // Kiểm tra xem có attendance data không
    const hasAttendance = session.attendanceStatus || 
                         session.attendance || 
                         (session.attendances && Array.isArray(session.attendances) && session.attendances.length > 0);
    
    // Nếu chưa có điểm danh, hiển thị "Chưa hoàn thành"
    if (!hasAttendance) {
      return 'incomplete';
    }
    
    // Nếu đã có điểm danh, mới hiển thị 'completed'
    return 'completed';
  }
  
  // Trả về status được tính toán
  return calculatedStatus;
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
 * Format thời gian còn lại cho session
 * @param session - Session data object
 * @returns string - Thời gian còn lại được format
 */
export function formatTimeRemaining(session: SessionData): string {
  const timeInfo = getSessionTimeInfo(session);
  
  if (timeInfo.isBeforeSession) {
    const hours = Math.floor(timeInfo.timeUntilStart / (1000 * 60 * 60));
    const minutes = Math.floor((timeInfo.timeUntilStart % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `Còn ${hours}h ${minutes}m`;
    } else {
      return `Còn ${minutes}m`;
    }
  } else if (timeInfo.isDuringSession) {
    const minutes = Math.floor(timeInfo.timeUntilEnd / (1000 * 60));
    return `Còn ${minutes}m`;
  } else {
    const hours = Math.floor(timeInfo.timeSinceEnd / (1000 * 60 * 60));
    const minutes = Math.floor((timeInfo.timeSinceEnd % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `Đã kết thúc ${hours}h ${minutes}m`;
    } else {
      return `Đã kết thúc ${minutes}m`;
    }
  }
}
