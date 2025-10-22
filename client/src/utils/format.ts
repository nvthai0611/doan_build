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
       return `${dayName}: ${schedule.startTime} → ${schedule.endTime}`
    }).join('\n');
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


  // Helper function để format ngày cho input date
  export const formatDateForInput = (date: string | Date | null | undefined): string => {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return '';
      
      return dateObj.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Helper function để convert date string từ input sang ISO 8601 format cho backend
  export const convertDateToISO = (dateStr: string | null | undefined): string | undefined => {
    if (!dateStr) return undefined;
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return undefined;
      
      return date.toISOString(); // Format: YYYY-MM-DDTHH:mm:ss.sssZ
    } catch (error) {
      console.error('Error converting date to ISO:', error);
      return undefined;
    }
  };

  // Utility function để format schedule thành array
  export const formatScheduleArray = (recurringSchedule: any): string[] => {
    if (!recurringSchedule) return ['Chưa có lịch'];
    
    if (typeof recurringSchedule === 'string') {
      try {
        const parsed = JSON.parse(recurringSchedule);
        return formatScheduleArray(parsed);
      } catch {
        return [recurringSchedule];
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
        return `${dayName}: ${schedule.startTime} → ${schedule.endTime}`;
      });
    }
    
    return ['Chưa có lịch'];
  };