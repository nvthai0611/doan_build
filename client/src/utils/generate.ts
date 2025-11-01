/**
 * Function tạo mảng các time slots từ 7:00 sáng đến 21:00 tối
 * Mỗi slot cách nhau 30 phút
 * VD: ["07:00", "07:30", "08:00", ..., "21:00"]
 */
export const generateTimeSlots = () => {
    const slots = [];
    // Loop từ giờ 7 đến giờ 21
    for (let hour = 7; hour <= 23; hour++) {
      // Với mỗi giờ, tạo 2 slots: :00 và :30
      for (let minute = 0; minute < 60; minute += 30) {
        // Format thành HH:mm với leading zeros (VD: 07:00, 08:30)
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };