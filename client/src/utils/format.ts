const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
}

export { formatDate };


// Utility function để format schedule
export const formatSchedule = (recurringSchedule: any): string => {
  if (!recurringSchedule) return 'Chưa có lịch';
  
  if (typeof recurringSchedule === 'string') {
    try {
      const parsed = JSON.parse(recurringSchedule);
      return formatSchedule(parsed);
    } catch {
      return recurringSchedule;
    }
  }
  
  if (recurringSchedule.schedules && Array.isArray(recurringSchedule.schedules)) {
    const dayNames: { [key: string]: string } = {
      'monday': 'Thứ 2',
      'tuesday': 'Thứ 3', 
      'wednesday': 'Thứ 4',
      'thursday': 'Thứ 5',
      'friday': 'Thứ 6',
      'saturday': 'Thứ 7',
      'sunday': 'CN'
    };
    
    return recurringSchedule.schedules.map((schedule: any) => {
      const dayName = dayNames[schedule.day] || schedule.day;
       return `${dayName} ${schedule.startTime} → ${schedule.endTime}`
    }).join(', ');
  }
  
  return 'Chưa có lịch';
};

// Utility function để format schedule
export const formatScheduleTwo = (recurringSchedule: any): string => {
    if (!recurringSchedule) return 'Chưa có lịch';
    
    if (typeof recurringSchedule === 'string') {
      try {
        const parsed = JSON.parse(recurringSchedule);
        return formatSchedule(parsed);
      } catch {
        return recurringSchedule;
      }
    }
    
    if (recurringSchedule.schedules && Array.isArray(recurringSchedule.schedules)) {
      const dayNames: { [key: string]: string } = {
        'monday': 'Thứ 2',
        'tuesday': 'Thứ 3', 
        'wednesday': 'Thứ 4',
        'thursday': 'Thứ 5',
        'friday': 'Thứ 6',
        'saturday': 'Thứ 7',
        'sunday': 'CN'
      };
      
      return recurringSchedule.schedules.map((schedule: any) => {
        const dayName = dayNames[schedule.day] || schedule.day;
        return `${dayName}: ${schedule.startTime}-${schedule.endTime}`;
      }).join(', ');
    }
    
    return 'Chưa có lịch';
  };
