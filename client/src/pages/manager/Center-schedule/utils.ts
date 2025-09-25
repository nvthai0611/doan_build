export const getSessionDisplayName = (session: any, viewType: string) => {
  if (viewType === 'subject') return session.subjectName || "Chưa phân môn";
  if (viewType === 'class') return session.name || "Chưa phân lớp";
  if (viewType === 'room') return session.roomName || "Chưa phân lớp";
  if (viewType === 'teacher') return session.teacherName || "Chưa phân giáo viên";
  return session.name || "Chưa phân lớp";
};

export const getDateString = (date: Date) => {
  return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh',
    })
    .split(' ')
    .join(' ')
    .split('/')
    .reverse()
    .join('-');
};
