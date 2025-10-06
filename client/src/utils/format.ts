const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
}

export { formatDate };


// Utility functions
export const formatSchedule = (schedule: { days: string[], startTime: string, endTime: string }): string[] => {
    const dayMap: { [key: string]: string } = {
      'monday': 'Thứ Hai',
      'tuesday': 'Thứ Ba', 
      'wednesday': 'Thứ Tư',
      'thursday': 'Thứ Năm',
      'friday': 'Thứ Sáu',
      'saturday': 'Thứ Bảy',
      'sunday': 'Chủ Nhật'
    }
    return schedule.days.map(day => {
        const dayName = dayMap[day] || day
        return `${dayName} ${schedule.startTime} → ${schedule.endTime}`
    })
}