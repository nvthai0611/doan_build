const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
}

// Format date string (YYYY-MM-DD) to Vietnamese format without timezone issues
export const formatDateString = (dateStr: string | null | undefined): string => {
    if (!dateStr) return 'Chưa xác định';
    
    try {
        // Parse YYYY-MM-DD format directly to avoid timezone issues
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const day = parseInt(parts[2], 10);
            
            // Create date in local timezone
            const date = new Date(year, month - 1, day);
            return date.toLocaleDateString('vi-VN');
        }
        
        // Fallback to original formatDate if format is different
        return formatDate(dateStr);
    } catch (error) {
        console.error('Error formatting date string:', error);
        return dateStr;
    }
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
      const dayKey = schedule.dayOfWeek?.toLowerCase() || schedule.day?.toLowerCase();
      const dayName = dayNames[dayKey] || schedule.dayOfWeek || schedule.day || '?';
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

  // Utility function để format schedule thành array of objects
  export const formatScheduleArray = (recurringSchedule: any): Array<{ day: string; time: string }> => {
    if (!recurringSchedule) return [];
    
    if (typeof recurringSchedule === 'string') {
      try {
        const parsed = JSON.parse(recurringSchedule);
        return formatScheduleArray(parsed);
      } catch {
        return [];
      }
    }
    
    if (recurringSchedule.schedules && Array.isArray(recurringSchedule.schedules)) {
      const dayNames: { [key: string]: string } = {
        'monday': 'T2',
        'tuesday': 'T3', 
        'wednesday': 'T4',
        'thursday': 'T5',
        'friday': 'T6',
        'saturday': 'T7',
        'sunday': 'CN'
      };
      
      return recurringSchedule.schedules.map((schedule: any) => {
        const dayKey = schedule.dayOfWeek?.toLowerCase() || schedule.day?.toLowerCase();
        const day = dayNames[dayKey] || schedule.dayOfWeek || schedule.day || '?';
        return {
          day,
          time: `${schedule.startTime}-${schedule.endTime}`
        };
      });
    }
    
    return [];
  };