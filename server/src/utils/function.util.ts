type CodeType = 'teacher' | 'student' | 'class' | 'default';

const CODE_PREFIXES: Record<CodeType, string> = {
  teacher: 'QNTC',
  student: 'QNST',
  class: 'QNCL',
  default: 'QN'
};

function generateQNCode(type: CodeType = 'default'): string {
  const seed = Date.now() + Math.random();
  const n = Math.floor((seed % 1_000_000));
  const prefix = CODE_PREFIXES[type] || CODE_PREFIXES.default;
  return `${prefix}${n.toString().padStart(6, '0')}`;
}


 // Format lịch học
 const formatSchedule = (schedule: any) => {
  let scheduleArray = schedule;
  
  // Nếu schedule là string JSON, parse nó
  if (typeof schedule === 'string') {
    try {
      scheduleArray = JSON.parse(schedule);
    } catch (error) {
      return 'Chưa có lịch học';
    }
  }
  
  // Nếu schedule có property 'schedules', lấy nó
  if (scheduleArray && typeof scheduleArray === 'object' && scheduleArray.schedules) {
    scheduleArray = scheduleArray.schedules;
  }
  
  if (!scheduleArray || !Array.isArray(scheduleArray)) {
    return 'Chưa có lịch học';
  }

  const dayNames = {
    'monday': 'Thứ 2',
    'tuesday': 'Thứ 3', 
    'wednesday': 'Thứ 4',
    'thursday': 'Thứ 5',
    'friday': 'Thứ 6',
    'saturday': 'Thứ 7',
    'sunday': 'Chủ nhật'
  };

  const result = scheduleArray.map((item: any) => {
    // Hỗ trợ cả 'day' và 'dayOfWeek' để tương thích
    const dayKey = item.day || item.dayOfWeek;
    const day = dayNames[dayKey as keyof typeof dayNames] || dayKey;
    const startTime = item.startTime || 'Chưa xác định';
    const endTime = item.endTime || 'Chưa xác định';
    return `${day}: ${startTime} - ${endTime}`;
  }).join('<br>');
  
  return result;
};

const extractOrderCode = (content: string): string | null => {
    //PAY1761731230904487
    const match = content.match(/PAY\d+/);
    return match ? match[0] : null;
  }

  const createOrderCode = () => {
    return `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
export { generateQNCode, CodeType , formatSchedule, extractOrderCode, createOrderCode };