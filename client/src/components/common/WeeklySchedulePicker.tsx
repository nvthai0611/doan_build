// ==================== IMPORTS ====================
// Import React hooks để quản lý state và tối ưu performance
import { useState, useEffect, useMemo } from 'react';
// Import React Query để fetch và cache dữ liệu từ API
import { useQuery } from '@tanstack/react-query';
// Import các UI components từ shadcn/ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// Import icons từ lucide-react
import { Loader2, Clock, X, Info, ChevronLeft, ChevronRight } from 'lucide-react';
// Import axios client để gọi API
import { apiClient } from '../../utils/clientAxios';
// Import Alert components
import { Alert, AlertDescription } from '@/components/ui/alert';
// Import utility function để merge CSS classes
import { cn } from '@/lib/utils';
import { generateTimeSlots } from '../../utils/generate';
import { dayOptions } from '../../utils/commonData';

// ==================== TYPESCRIPT INTERFACES ====================

/**
 * Interface cho một time slot đã được chọn
 * Đại diện cho một khoảng thời gian mà người dùng đã chọn cho lịch học
 */
interface ScheduleSlot {
  id: string;           // Unique ID để phân biệt các slots (dùng timestamp)
  day: string;          // Ngày trong tuần (monday, tuesday, etc.)
  startTime: string;    // Giờ bắt đầu (HH:mm format, VD: "08:00")
  endTime: string;      // Giờ kết thúc được tính từ startTime + duration (VD: "09:30")
  duration: number;     // Thời lượng tính bằng phút (VD: 90 phút = 1.5 giờ)
  roomId?: string;      // ID của phòng học
  roomName?: string;    // Tên phòng học (để hiển thị)
}

/**
 * Interface cho một buổi học đang có trong hệ thống
 * Data này được fetch từ API để hiển thị các lớp đang diễn ra
 */
interface ClassSession {
  id: string;                   // ID của buổi học
  name: string;                 // Tên lớp học
  date: string;                 // Ngày học (ISO format, VD: "2025-10-27")
  startTime: string;            // Giờ bắt đầu (HH:mm)
  endTime: string;              // Giờ kết thúc (HH:mm)
  roomName: string | null;      // Tên phòng (có thể null nếu chưa assign)
  teacherName: string;          // Tên giáo viên
  subjectName: string;          // Tên môn học
  studentCount: number;         // Số học sinh hiện tại
  maxStudents: number;          // Sức chứa tối đa
  status: string;               // Trạng thái buổi học
}

/**
 * Props của component WeeklySchedulePicker
 */
interface WeeklySchedulePickerProps {
  selectedSlots: ScheduleSlot[];                    // Mảng các slots đã chọn (controlled state)
  onSlotsChange: (slots: ScheduleSlot[]) => void;   // Callback khi slots thay đổi
  defaultDuration?: number;                         // Thời lượng mặc định (phút), default = 90
  expectedStartDate?: string;                       // Ngày khai giảng dự kiến (YYYY-MM-DD), nếu có sẽ lấy lịch từ ngày này đến 31/05 năm sau
  teacherId?: string;                              // ID của giáo viên (nếu có, sẽ disable các slot trùng với lịch dạy của giáo viên)
  excludeClassId?: string;                         // ID của lớp cần loại trừ khi check conflict (khi đang edit lịch của lớp này)
}

// ==================== CONSTANTS ====================

/**
 * Danh sách các ngày trong tuần
 * Dùng để map giữa value (dùng trong code) và label (hiển thị cho user)
 */




// Tạo mảng TIME_SLOTS một lần duy nhất khi component load
// Kết quả: ["07:00", "07:30", "08:00", ..., "21:00"] - tổng 29 slots
const TIME_SLOTS = generateTimeSlots();

// ==================== MAIN COMPONENT ====================
export const WeeklySchedulePicker = ({
  selectedSlots,        // Mảng các slots đã chọn từ parent component
  onSlotsChange,        // Callback để update slots cho parent
  defaultDuration = 90, // Thời lượng mặc định = 90 phút (1.5 giờ)
  expectedStartDate,    // Ngày dự kiến bắt đầu lớp học (optional)
  teacherId,            // ID của giáo viên (optional)
  excludeClassId,       // ID của lớp cần loại trừ (optional)
}: WeeklySchedulePickerProps) => {
  
  // ===== LOCAL STATES =====
  // State lưu phòng được chọn để filter (mặc định = 'all' hiển thị tất cả)
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  
  // State lưu thời lượng hiện tại (user có thể thay đổi)
  const [duration, setDuration] = useState<number>(defaultDuration);
  
  // State lưu phòng đã được chọn slot đầu tiên (chỉ cho phép chọn 1 phòng)
  // Nếu đã chọn slot ở phòng A, không thể chọn slot ở phòng B nữa
  const selectedRoomId = useMemo(() => {
    if (selectedSlots.length === 0) return null;
    // Lấy roomId của slot đầu tiên (tất cả slots phải cùng phòng)
    return selectedSlots[0].roomId;
  }, [selectedSlots]);
  
  // ===== FETCH ROOMS DATA =====
  // Sử dụng React Query để fetch danh sách phòng học từ API
  // React Query tự động handle caching, loading states, và error handling
  const { data: roomsData, isLoading: roomsLoading, error: roomsError } = useQuery({
    queryKey: ['rooms'],              
    queryFn: async () => {            
      try {
        const response = await apiClient.get('/rooms');
        return response;
      } catch (error) {
        console.error('Error fetching rooms:', error);
        return [];
      }
    },
  });

  // Extract mảng rooms từ response (với fallback là empty array)
  const rooms = (roomsData as any)?.data || [];
  
  // Debug: Log để kiểm tra
  useEffect(() => {
    if (roomsData) {
      console.log('Rooms data:', roomsData);
      console.log('Rooms array:', rooms);
    }
    if (roomsError) {
      console.error('Error fetching rooms:', roomsError);
    }
  }, [roomsData, rooms, roomsError]);

  // ===== CALCULATE DATE RANGE =====
  /**
   * Tính toán start và end date dựa trên expectedStartDate:
   * - Nếu có expectedStartDate: từ ngày đó đến 31/05 năm sau
   */
  const dateRange = useMemo(() => {
    if (expectedStartDate) {
      // Nếu có expectedStartDate: từ ngày đó đến 31/05 năm sau
      const start = new Date(expectedStartDate);
      if (isNaN(start.getTime())) {
        // Nếu date không hợp lệ, return null để dùng API all-active
        return null;
      }
      start.setHours(0, 0, 0, 0);
      
      // Lấy năm sau và tạo Date cho 31/05
      const nextYear = start.getFullYear() + 1;
      const end = new Date(nextYear, 4, 31); // Tháng 5 (index 4 = tháng 5)
      end.setHours(23, 59, 59, 999);
      
      return { start, end };
    }
    return null;
  }, [expectedStartDate]);  // Chỉ recalculate khi expectedStartDate thay đổi

  // ===== CALCULATE DATES FOR EACH DAY OF WEEK =====
  /**
   * Tính toán ngày cụ thể cho mỗi thứ trong tuần
   * Dựa trên expectedStartDate hoặc tuần hiện tại
   */
  const dayDates = useMemo(() => {
    // Map từ day value sang số thứ tự trong tuần (0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7)
    const dayToNumberMap: Record<string, number> = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6,
    };

    // Lấy ngày tham chiếu: nếu có expectedStartDate thì dùng ngày đó, không thì dùng hôm nay
    let referenceDate: Date;
    if (expectedStartDate) {
      referenceDate = new Date(expectedStartDate);
      referenceDate.setHours(0, 0, 0, 0);
    } else {
      referenceDate = new Date();
      referenceDate.setHours(0, 0, 0, 0);
    }

    // Tính toán thứ của ngày tham chiếu (0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7)
    const referenceDay = referenceDate.getDay();

    // Tìm thứ 2 của tuần chứa ngày tham chiếu
    // Nếu referenceDay = 0 (Chủ nhật), thì thứ 2 là ngày mai (+1)
    // Nếu referenceDay = 1 (Thứ 2), thì thứ 2 là hôm nay (0)
    // Nếu referenceDay > 1, thì thứ 2 là - (referenceDay - 1) ngày
    const mondayOffset = referenceDay === 0 ? 1 : referenceDay === 1 ? 0 : -(referenceDay - 1);
    const mondayDate = new Date(referenceDate);
    mondayDate.setDate(referenceDate.getDate() + mondayOffset);

    // Tạo map chứa ngày cho mỗi thứ trong tuần
    const dates: Record<string, Date> = {};
    dayOptions.forEach((day) => {
      const dayNumber = dayToNumberMap[day.value];
      if (dayNumber !== undefined) {
        // Tính số ngày cần cộng từ thứ 2 để đến thứ cần tìm
        // Thứ 2 = 1, nên offset = dayNumber - 1
        const offset = dayNumber === 0 ? 6 : dayNumber - 1; // Chủ nhật là ngày thứ 6 sau thứ 2
        const dayDate = new Date(mondayDate);
        dayDate.setDate(mondayDate.getDate() + offset);
        dates[day.value] = dayDate;
      }
    });

    return dates;
  }, [expectedStartDate]);

  // ===== FETCH CLASSES WITH SCHEDULES =====
  /**
   * Lấy tất cả lớp đang hoạt động/đang tuyển sinh/tạm dừng kèm recurringSchedule
   * Backend sẽ tự động filter theo khoảng thời gian nếu có expectedStartDate
   */
  const { data: classesData, isLoading: scheduleLoading } = useQuery({
    queryKey: ['classes', 'active-schedules', expectedStartDate],
    queryFn: async () => {
      // Gọi API để lấy tất cả lớp đang hoạt động kèm lịch học
      // Nếu có expectedStartDate, truyền vào query param để backend filter
      const params = expectedStartDate ? { expectedStartDate } : {};
      const response = await apiClient.get('/admin-center/schedule-management/classes/active-schedules', params );
      return response;
    },
    enabled: true,
  });

  // Extract mảng classes từ response
  const allClasses: Array<{
    classId: string;
    className: string;
    teacherId: string | null;  // Thêm teacherId
    teacherName: string;
    subjectName: string;
    roomId: string | null;
    roomName: string | null;
    expectedStartDate: string | null;
    actualStartDate: string | null;
    actualEndDate: string | null;
    schedules: Array<{ day: string; startTime: string; endTime: string; roomId?: string }>;
  }> = (classesData as any)?.data || [];
  
  // Filter classes: loại bỏ class hiện tại nếu đang edit (excludeClassId)
  // Lịch cũ của class hiện tại sẽ hiển thị trong selectedSlots (màu xanh, có thể toggle)
  // Không hiển thị trong occupiedSlots (màu đỏ, disabled)
  const filteredClasses = useMemo(() => {
    if (!excludeClassId) {
      return allClasses;
    }
    // Loại bỏ class hiện tại khỏi filteredClasses để không hiển thị trong occupiedSlots
    return allClasses.filter((cls: any) => cls.classId !== excludeClassId);
  }, [allClasses, excludeClassId]);

  // Filter mảng classes của giáo viên từ allClasses
  // Filter theo teacherId và excludeClassId ở frontend
  const teacherClasses = useMemo(() => {
    if (!teacherId) {
      return [];
    }
    
    // Filter: chỉ lấy lớp có teacherId khớp và loại trừ excludeClassId
    const filtered = allClasses.filter((cls: any) => {
      // Nếu có excludeClassId, loại trừ lớp đó
      if (excludeClassId && cls.classId === excludeClassId) {
        return false;
      }
      // Check teacherId khớp với giáo viên hiện tại
      return cls.teacherId === teacherId;
    });
    
    console.log('[WeeklySchedulePicker] Teacher classes filtered:', {
      teacherId,
      excludeClassId,
      allClassesCount: allClasses.length,
      filteredCount: filtered.length,
      filtered: filtered.map((cls: any) => ({
        classId: cls.classId,
        className: cls.className,
        teacherId: cls.teacherId,
        schedules: cls.schedules,
      })),
    });
    
    return filtered;
  }, [allClasses, teacherId, excludeClassId]);
  
  // ===== HELPER: Format date =====
  /**
   * Format date thành string dạng dd/mm/yyyy
   */
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
      return date.toLocaleDateString('vi-VN', options);
    } catch {
      return '';
    }
  };

  /**
   * Format Date object thành string dạng dd/mm (chỉ ngày và tháng)
   */
  const formatDayDate = (date: Date): string => {
    try {
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit' };
      return date.toLocaleDateString('vi-VN', options);
    } catch {
      return '';
    }
  };

  // ===== BUILD OCCUPIED SLOTS MAP =====
  /**
   * Tạo một Map để tra cứu nhanh xem một time slot có bị chiếm bởi lớp học nào không
   * Key format: "{day}-{time}-{roomName}" → VD: "monday-08:00-Phòng A1"
   * Value: Class info object với className, teacherName, dates, etc.
   * 
   * Dựa trên recurringSchedule của các lớp để tạo occupied slots
   */
  const occupiedSlots = useMemo(() => {
    const map = new Map<string, { 
      className: string; 
      teacherName: string; 
      subjectName: string;
      actualStartDate: string | null;
      actualEndDate: string | null;
      expectedStartDate: string | null;
    }>();
    // Nếu không có classes thì return empty map
    if (!filteredClasses || filteredClasses.length === 0) {
      return map;
    }
    // Loop qua tất cả classes để build map từ recurringSchedule
    filteredClasses.forEach((cls) => {
      // Skip lớp không có schedules
      if (!cls.schedules || cls.schedules.length === 0) {
        return;
      }
      // Skip lớp chưa được assign phòng
      const roomName = cls.roomName;
      if (!roomName) {
        return;
      }
      // Loop qua từng schedule trong recurringSchedule
      cls.schedules.forEach((schedule) => {
        // Validate schedule
        if (!schedule.day || !schedule.startTime || !schedule.endTime) {
          return;
        }
        const dayValue = schedule.day.toLowerCase(); // 'monday', 'tuesday', etc.
        const startTime = schedule.startTime;  // VD: "08:00"
        const endTime = schedule.endTime;      // VD: "10:00"
        // Loop qua tất cả TIME_SLOTS (07:00, 07:30, 08:00, ..., 21:00)
        TIME_SLOTS.forEach((timeSlot) => {
          // Check xem timeSlot có nằm trong range [startTime, endTime) không
          // Dùng >= startTime và < endTime (không bao gồm endTime)
          // VD: Schedule 08:00-10:00 → chiếm slots: 08:00, 08:30, 09:00, 09:30 (không chiếm 10:00)
          if (timeSlot >= startTime && timeSlot < endTime) {
            // Tạo unique key format: "day-time-roomName"
            const key = `${dayValue}-${timeSlot}-${roomName}`;
            // Store class info vào map với key này (chỉ lưu lần đầu, không override)
            if (!map.has(key)) {
              map.set(key, {
                className: cls.className,
                teacherName: cls.teacherName,
                subjectName: cls.subjectName,
                actualStartDate: cls.actualStartDate,
                actualEndDate: cls.actualEndDate,
                expectedStartDate: cls.expectedStartDate,
              });
            }
          }
        });
      });
    });
    
    return map;
  }, [filteredClasses]);  // Chỉ rebuild map khi filteredClasses thay đổi

  // ===== BUILD TEACHER OCCUPIED SLOTS MAP =====
  /**
   * Tạo một Map để tra cứu nhanh xem một time slot có bị chiếm bởi lịch dạy của giáo viên không
   * Key format: "{day}-{time}" → VD: "monday-08:00" (không phụ thuộc vào phòng)
   * Value: Class info object với className, subjectName, dates, etc.
   * 
   * Dùng để disable tất cả các phòng trong khoảng thời gian giáo viên đang dạy
   */
  const teacherOccupiedSlots = useMemo(() => {
    const map = new Map<string, { 
      className: string; 
      subjectName: string;
      actualStartDate: string | null;
      actualEndDate: string | null;
      expectedStartDate: string | null;
    }>();
    
    // Nếu không có teacherId hoặc không có classes thì return empty map
    if (!teacherId || !teacherClasses || teacherClasses.length === 0) {
      console.log('[WeeklySchedulePicker] No teacher classes to build occupied slots:', { teacherId, teacherClassesCount: teacherClasses?.length || 0 });
      return map;
    }
    
    // Loop qua tất cả classes của giáo viên để build map từ recurringSchedule
    teacherClasses.forEach((cls) => {
      // Skip lớp không có schedules
      if (!cls.schedules || cls.schedules.length === 0) {
        return;
      }
      
      // Loop qua từng schedule trong recurringSchedule
      cls.schedules.forEach((schedule) => {
        // Validate schedule
        if (!schedule.day || !schedule.startTime || !schedule.endTime) {
          return;
        }
        const dayValue = schedule.day.toLowerCase(); // 'monday', 'tuesday', etc.
        const startTime = schedule.startTime;  // VD: "08:00"
        const endTime = schedule.endTime;      // VD: "10:00"
        
        // Loop qua tất cả TIME_SLOTS (07:00, 07:30, 08:00, ..., 21:00)
        TIME_SLOTS.forEach((timeSlot) => {
          // Check xem timeSlot có nằm trong range [startTime, endTime) không
          if (timeSlot >= startTime && timeSlot < endTime) {
            // Tạo unique key format: "day-time" (không có roomName vì disable tất cả phòng)
            const key = `${dayValue}-${timeSlot}`;
            // Store class info vào map với key này (override nếu có conflict để lưu thông tin mới nhất)
            // Nhưng thực ra chỉ cần biết có conflict hay không, không cần override
            map.set(key, {
              className: cls.className,
              subjectName: cls.subjectName,
              actualStartDate: cls.actualStartDate,
              actualEndDate: cls.actualEndDate,
              expectedStartDate: cls.expectedStartDate,
            });
          }
        });
      });
    });
    
    console.log('[WeeklySchedulePicker] Teacher occupied slots built:', {
      teacherId,
      teacherClassesCount: teacherClasses.length,
      occupiedSlotsCount: map.size,
      sampleKeys: Array.from(map.keys()).slice(0, 10),
    });
    
    return map;
  }, [teacherId, teacherClasses]);  // Chỉ rebuild map khi teacherId hoặc teacherClasses thay đổi

  // ===== HELPER FUNCTIONS =====
  
  /**
   * Kiểm tra xem một time slot có bị block bởi các slots đã chọn không
   * 
   * @param day - Ngày trong tuần (monday, tuesday, etc.)
   * @param timeSlot - Time slot cần check (VD: "08:30")
   * @param roomId - ID của phòng
   * @returns true nếu slot bị block, false nếu free
   * 
   * Logic:
   * - Chỉ check các slots cùng ngày và cùng phòng
   * - Slot bị block nếu nằm trong range [startTime, endTime) của slot đã chọn
   * 
   * VD: Đã chọn slot 08:00-09:30 (duration 90 phút)
   *     → 08:00 = start time (not blocked, vì đây là điểm bắt đầu)
   *     → 08:30 = blocked (nằm trong range)
   *     → 09:00 = blocked (nằm trong range)
   *     → 09:30 = free (endTime không bị block)
   */
  const isTimeBlocked = (day: string, timeSlot: string, roomId: string): boolean => {
    return selectedSlots.some((slot) => {
      // Chỉ check slots cùng ngày và cùng phòng
      if (slot.day !== day || slot.roomId !== roomId) return false;
      // Check xem timeSlot có nằm trong range [startTime, endTime) không
      return timeSlot >= slot.startTime && timeSlot < slot.endTime;
    });
  };

  /**
   * Kiểm tra xem slot mới có overlap với các slots đã chọn không
   * 
   * @param day - Ngày trong tuần
   * @param startTime - Giờ bắt đầu của slot mới (VD: "08:30")
   * @param endTime - Giờ kết thúc của slot mới (VD: "10:00")
   * @param roomId - ID của phòng
   * @returns true nếu overlap, false nếu không
   * 
   * Công thức overlap: A.start < B.end AND B.start < A.end
   * 
   * VD 1: Đã chọn 08:00-09:30, muốn chọn 08:30-10:00
   *       → 08:30 < 09:30 AND 10:00 > 08:00 → TRUE (OVERLAP)
   * 
   * VD 2: Đã chọn 08:00-09:30, muốn chọn 09:30-11:00
   *       → 09:30 < 09:30 → FALSE (ADJACENT, OK)
   * 
   * VD 3: Đã chọn 08:00-09:30, muốn chọn 10:00-11:30
   *       → 10:00 < 09:30 → FALSE (SEPARATE, OK)
   */
  const wouldOverlap = (day: string, startTime: string, endTime: string, roomId: string): boolean => {
    return selectedSlots.some((slot) => {
      // Chỉ check slots cùng ngày và cùng phòng
      if (slot.day !== day || slot.roomId !== roomId) return false;
      // Công thức overlap: new.start < existing.end AND new.end > existing.start
      return (startTime < slot.endTime && endTime > slot.startTime);
    });
  };

  /**
   * Handler khi user click vào một time slot
   * Xử lý logic: validate → add/remove slot → update state
   * 
   * @param day - Ngày trong tuần
   * @param startTime - Giờ bắt đầu của slot được click
   * @param roomId - ID của phòng
   * @param roomName - Tên phòng (để build key)
   * 
   * Flow:
   * 1. Check slot có bị occupied bởi lớp học không → return nếu có
   * 2. Check slot có phải start time của slot đã chọn không → remove nếu có
   * 3. Check nếu đã chọn phòng khác → không cho phép chọn phòng khác
   * 4. Nếu chưa chọn → validate và add slot mới
   */
  const handleSlotClick = (day: string, startTime: string, roomId: string, roomName: string) => {
    // ===== STEP 0: CHECK DIFFERENT ROOM =====
    // Chỉ cho phép chọn 1 phòng duy nhất
    if (selectedSlots.length > 0) {
      const firstSlotRoomId = selectedSlots[0].roomId;
      if (firstSlotRoomId && firstSlotRoomId !== roomId) {
        // Đã chọn phòng khác → không cho phép chọn phòng mới
        // Có thể show toast/warning ở đây nếu cần
        return;
      }
    }

    // ===== STEP 1: CHECK OCCUPIED =====
    // Tạo key để tra cứu trong occupiedSlots map
    const key = `${day}-${startTime}-${roomName}`;
    if (occupiedSlots.has(key)) {
      // Slot đã có lớp học → không cho phép chọn
      return;
    }
    
    // ===== STEP 2: CHECK IF REMOVING EXISTING SELECTION =====
    // Tìm xem timeSlot được click có nằm trong range [startTime, endTime) của slot đã chọn không
    // Nếu có → user muốn bỏ chọn slot đó (toggle behavior)
    const existingSlot = selectedSlots.find((slot) => {
      // Chỉ check slots cùng ngày và cùng phòng
      if (slot.day !== day || slot.roomId !== roomId) return false;
      // Check xem startTime được click có nằm trong range [slot.startTime, slot.endTime) không
      const isInRange = startTime >= slot.startTime && startTime < slot.endTime;
        return isInRange;
    });

    if (existingSlot) {
      // Tìm thấy → user muốn bỏ chọn (click vào bất kỳ ô nào trong slot đã chọn)
      // Remove slot khỏi array
      const newSlots = selectedSlots.filter((slot) => slot.id !== existingSlot.id);
      // Update state thông qua callback
      onSlotsChange(newSlots);
      return;
    }
    
    // ===== STEP 3: ADDING NEW SELECTION =====
    // Tính endTime dựa trên startTime + duration
    // VD: startTime="08:00", duration=90 → endTime="09:30"
    const endTime = calculateEndTime(startTime, duration);
    
    // ===== STEP 4: CHECK OVERLAP WITH SELECTED SLOTS =====
    // Kiểm tra xem slot mới có overlap với các slots đã chọn không
    if (wouldOverlap(day, startTime, endTime, roomId)) {
      // Có overlap → không cho phép chọn
      return;
    }
    
    // ===== STEP 5: CHECK CONFLICT WITH OCCUPIED SESSIONS =====
    // Kiểm tra xem TẤT CẢ các time slots trong khoảng duration có trống không
    // VD: Chọn 08:00 duration 90 phút → phải check 08:00, 08:30, 09:00
    let hasConflict = false;
    TIME_SLOTS.forEach((timeSlot) => {
      // Check xem timeSlot có nằm trong range [startTime, endTime) không
      if (timeSlot >= startTime && timeSlot < endTime) {
        // Build key cho timeSlot này
        const checkKey = `${day}-${timeSlot}-${roomName}`;
        // Check xem có lớp học tại time slot này không
        if (occupiedSlots.has(checkKey)) {
          hasConflict = true;
        }
      }
    });
    
    if (hasConflict) {
      // Có conflict với lớp học đang có → không cho phép chọn
      return;
    }
    
    // ===== STEP 6: ALL CHECKS PASSED - CREATE NEW SLOT =====
    const newSlot: ScheduleSlot = {
      id: Date.now().toString(),  // Dùng timestamp làm unique ID
      day,
      startTime,
      endTime,
      duration,
      roomId,
      roomName,
    };
    
    // Add slot mới vào array và update state
    onSlotsChange([...selectedSlots, newSlot]);
  };

  /**
   * Tính endTime dựa trên startTime và duration
   * 
   * @param startTime - Giờ bắt đầu (HH:mm format, VD: "08:00")
   * @param duration - Thời lượng tính bằng phút (VD: 90)
   * @returns Giờ kết thúc (HH:mm format, VD: "09:30")
   * 
   * Logic:
   * 1. Parse startTime thành hours và minutes
   * 2. Tạo Date object với giờ/phút đó
   * 3. Cộng thêm duration (convert phút → milliseconds)
   * 4. Extract hours/minutes từ Date object mới và format
   * 
   * VD: calculateEndTime("08:00", 90)
   *     → Date(2000, 0, 1, 8, 0) + 90*60000ms
   *     → Date(2000, 0, 1, 9, 30)
   *     → "09:30"
   */
  const calculateEndTime = (startTime: string, duration: number): string => {
    // Parse "08:00" thành [8, 0]
    const [hours, minutes] = startTime.split(':').map(Number);
    // Tạo Date object (năm/tháng/ngày không quan trọng, chỉ dùng để tính toán)
    const startDate = new Date(2000, 0, 1, hours, minutes);
    // Cộng duration (phút) convert sang milliseconds (1 phút = 60,000 ms)
    const endDate = new Date(startDate.getTime() + duration * 60000);
    // Format về HH:mm với leading zeros
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  /**
   * Kiểm tra xem một slot có phải là start time của slot đã chọn không
   * 
   * @param day - Ngày trong tuần
   * @param startTime - Giờ bắt đầu
   * @param roomId - ID phòng
   * @returns true nếu slot này là start time đã chọn, false nếu không
   * 
   * Dùng để hiển thị dấu ✓ tại ô start time
   */
  const isSlotSelected = (day: string, startTime: string, roomId: string): boolean => {
    return selectedSlots.some(
      (slot) => slot.day === day && slot.startTime === startTime && slot.roomId === roomId
    );
  };

  /**
   * Remove một slot đã chọn dựa trên ID
   * 
   * @param slotId - ID của slot cần xóa
   * 
   * Được gọi khi user click nút X trong badge của selected slots summary
   */
  const removeSlot = (slotId: string) => {
    onSlotsChange(selectedSlots.filter((slot) => slot.id !== slotId));
  };

  /**
   * Filter danh sách rooms dựa trên selectedRoom state
   * Nếu selectedRoom = 'all' → hiển thị tất cả
   * Nếu selectedRoom = specific ID → chỉ hiển thị 1 phòng đó
   */
  const filteredRooms = selectedRoom === 'all' ? rooms : rooms.filter((r: any) => r.id === selectedRoom);

  /**
   * Format date range thành string để hiển thị
   * VD: "27/10/2025 - 31/05/2026" hoặc "Hiển thị tất cả lịch các lớp đang hoạt động"
   */
  const formatDateRange = () => {
    if (expectedStartDate && dateRange) {
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
      return `${dateRange.start.toLocaleDateString('vi-VN', options)} - ${dateRange.end.toLocaleDateString('vi-VN', options)}`;
    } else {
      return `Hiển thị tất cả lịch các lớp đang hoạt động`;
    }
  };

  // ===== LOADING STATE =====
  // Hiển thị loading spinner khi đang fetch rooms data
  if (roomsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  // ===== ERROR STATE =====
  // Hiển thị error message nếu có lỗi khi fetch rooms
  if (roomsError) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <AlertDescription className="text-red-800 dark:text-red-200">
            ❌ Lỗi khi tải danh sách phòng học. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ===== NO ROOMS STATE =====
  // Hiển thị thông báo nếu không có phòng nào
  if (!rooms || rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            ⚠️ Không tìm thấy phòng học nào trong hệ thống. Vui lòng tạo phòng học trước khi chọn lịch.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <div className="space-y-4">
      {/* ===== CONTROLS SECTION ===== */}
      {/* Grid 3 cột: Room Filter | Duration Input | Week Navigation */}
      <div className="grid grid-cols-3 gap-4">
        {/* Room Filter Dropdown */}
        <div>
          <Label htmlFor="room-filter">Lọc theo phòng</Label>
          {/* Select component từ shadcn/ui để chọn phòng */}
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger id="room-filter" className="mt-1.5">
              <SelectValue placeholder="Chọn phòng" />
            </SelectTrigger>
            <SelectContent>
              {/* Option để hiển thị tất cả phòng */}
              <SelectItem value="all">Tất cả phòng</SelectItem>
              {/* Map qua danh sách rooms để tạo options */}
              {rooms.map((room: any) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Duration Input */}
        <div>
          <Label htmlFor="duration">Thời lượng (phút)</Label>
          {/* Input để user nhập thời lượng mong muốn */}
          {/* Min=15, step=15 → chỉ cho phép nhập bội số của 15 */}
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            min={15}
            step={15}
            className="mt-1.5"
          />
        </div>

        {/* Date Range Display */}
        <div>
          <Label>Khoảng thời gian hiển thị</Label>
          <div className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-md">
            {formatDateRange()}
          </div>
        </div>
      </div>

      {/* ===== INFO ALERT ===== */}
      {/* Hướng dẫn sử dụng cho user */}
        <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Click vào ô trống để chọn thời gian bắt đầu. Hệ thống sẽ tự động block các ô theo thời lượng đã chọn. 
          Ô màu đỏ đã có lớp, ô xanh đậm là thời gian bắt đầu, ô xanh nhạt là khoảng thời gian trong buổi học.
          <strong className="block mt-1">Lưu ý: Chỉ có thể chọn lịch trong 1 phòng duy nhất.</strong>
        </AlertDescription>
      </Alert>

      {/* ===== SELECTED SLOTS SUMMARY ===== */}
      {/* Chỉ hiển thị khi có slots đã chọn */}
      {selectedSlots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Lịch đã chọn ({selectedSlots.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Hiển thị các slots đã chọn dưới dạng badges */}
            <div className="flex flex-wrap gap-2">
              {selectedSlots.map((slot) => {
                // Tìm label của ngày (Thứ 2, Thứ 3, etc.)
                const dayLabel = dayOptions.find((d: any) => d.value === slot.day)?.label;
                return (
                  <Badge
                    key={slot.id}
                    variant="secondary"
                    className="px-3 py-1.5 flex items-center gap-2"
                  >
                    <Clock className="w-3 h-3" />
                    {/* Hiển thị: Thứ 2 • 08:00 - 09:30 • Phòng A1 */}
                    {dayLabel} • {slot.startTime} - {slot.endTime}
                    {slot.roomName && ` • ${slot.roomName}`}
                    {/* Button X để xóa slot */}
                    <button
                      onClick={() => removeSlot(slot.id)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== SCHEDULE GRID ===== */}
      {/* Container chính cho lịch học */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {/* Hiển thị loading khi đang fetch schedule */}
          {scheduleLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Đang tải lịch...</span>
            </div>
          ) : (
            /* Loop qua các rooms đã filter (tất cả hoặc 1 phòng cụ thể) */
            filteredRooms.map((room: any) => {
              // Kiểm tra xem phòng này có bị disable không
              // Phòng bị disable nếu đã chọn phòng khác
              const isRoomDisabled = selectedRoomId !== null && selectedRoomId !== room.id;
              
              return (
              <div key={room.id} className={`mb-6 last:mb-0 ${isRoomDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                {/* Header hiển thị tên phòng và sức chứa */}
                <div className={`bg-gray-100 dark:bg-gray-800 px-4 py-2 font-semibold ${selectedRoomId === room.id ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500' : ''}`}>
                  {room.name} (Sức chứa: {room.capacity})
                  {selectedRoomId === room.id && (
                    <span className="ml-2 text-sm text-green-700 dark:text-green-300 font-normal">
                      (Đang chọn lịch)
                    </span>
                  )}
                  {isRoomDisabled && (
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 font-normal">
                      (Đã chọn phòng khác)
                    </span>
                  )}
                </div>
                
                {/* Table chính hiển thị lịch */}
                <table className="w-full border-collapse">
                  {/* THEAD: Header row với các ngày trong tuần */}
                  <thead>
                    <tr>
                      {/* Cột đầu tiên: Giờ */}
                      <th className="border-2 p-3 bg-gray-50 dark:bg-gray-900 w-24 sticky left-0 z-10 font-semibold">
                        Giờ
                      </th>
                      {/* Loop các ngày trong tuần để tạo columns */}
                      {dayOptions.map((day) => {
                        const dayDate = dayDates[day.value];
                        return (
                          <th
                            key={day.value}
                            className="border-2 p-3 bg-gray-50 dark:bg-gray-900 text-sm font-semibold"
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span>{day.label}</span>
                              {dayDate && (
                                <span className="text-xs font-normal text-gray-600 dark:text-gray-400">
                                  {formatDayDate(dayDate)}
                                </span>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  
                  {/* TBODY: Các rows với time slots */}
                  <tbody>
                    {/* Loop qua TIME_SLOTS để tạo rows (07:00, 07:30, ..., 21:00) */}
                    {TIME_SLOTS.map((timeSlot) => (
                      <tr key={timeSlot}>
                        {/* Cột đầu tiên: Hiển thị giờ (sticky để luôn nhìn thấy) */}
                        <td className="border-2 p-3 bg-gray-50 dark:bg-gray-900 text-center text-xs font-semibold sticky left-0 z-10">
                          {timeSlot}
                        </td>
                        
                        {/* Loop qua các ngày để tạo cells cho mỗi time slot */}
                        {dayOptions.map((day) => {
                          // ===== STEP 1: Xác định state của cell =====
                          // Build key để tra cứu trong occupiedSlots map
                          const key = `${day.value}-${timeSlot}-${room.name}`;
                          
                          // Build key để tra cứu trong teacherOccupiedSlots map (không có roomName)
                          const teacherKey = `${day.value}-${timeSlot}`;
                          
                          // Check 4 states:
                          const occupiedSession = occupiedSlots.get(key);  // Có lớp học ở phòng này không?
                          const teacherOccupied = teacherOccupiedSlots.get(teacherKey);  // Giáo viên đang dạy ở thời gian này không?
                          const isSelected = isSlotSelected(day.value, timeSlot, room.id);  // Là start time đã chọn không?
                          const isBlocked = isTimeBlocked(day.value, timeSlot, room.id);    // Bị block bởi duration không?
                          
                          // Nếu giáo viên đang dạy ở thời gian này, coi như occupied cho tất cả phòng
                          const isTeacherBusy = !!teacherOccupied;
                          // ===== STEP 2: Render cell với styling động =====
                          return (
                            <td
                              key={`${day.value}-${timeSlot}`}
                              // Sử dụng cn() utility để merge CSS classes động
                              className={cn(
                                // Base classes: luôn có
                                'border-2 p-3 text-xs transition-all duration-150',
                                {
                                  // STATE 1: Occupied - Đã có lớp học ở phòng này (PRIORITY CAO NHẤT)
                                  // → Màu đỏ, cursor not-allowed, hover đỏ đậm hơn
                                  'bg-red-100 dark:bg-red-900/30 cursor-not-allowed hover:bg-red-200 dark:hover:bg-red-900/40':
                                    occupiedSession,
                                  
                                  // STATE 1b: Teacher Occupied - Giáo viên đang dạy ở thời gian này (PRIORITY CAO)
                                  // → Màu cam, cursor not-allowed, disable tất cả phòng
                                  'bg-orange-100 dark:bg-orange-900/30 cursor-not-allowed hover:bg-orange-200 dark:hover:bg-orange-900/40':
                                    isTeacherBusy && !occupiedSession,
                                  
                                  // STATE 2: Selected - Là start time đã chọn
                                  // → Màu xanh đậm, cursor pointer (có thể click để bỏ), hover xanh đậm hơn
                                  'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 cursor-pointer':
                                    isSelected && !occupiedSession && !isTeacherBusy,
                                  
                                  // STATE 3: Blocked - Bị block bởi duration của slot khác
                                  // → Màu xanh nhạt, cursor not-allowed
                                  'bg-green-50 dark:bg-green-900/10 cursor-not-allowed':
                                    !isSelected && isBlocked && !occupiedSession && !isTeacherBusy,
                                  
                                  // STATE 4: Available - Trống, có thể chọn
                                  // → Màu trắng, cursor pointer, hover xanh dương nhạt
                                  // STATE 5: Disabled - Ở phòng khác khi đã chọn phòng
                                  // → Màu xám, cursor not-allowed
                                  'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20':
                                    !occupiedSession && !isBlocked && !isTeacherBusy && !(selectedSlots.length > 0 && selectedSlots[0].roomId !== room.id),
                                  'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-50':
                                    selectedSlots.length > 0 && selectedSlots[0].roomId !== room.id,
                                }
                              )}
                              // Click handler: 
                              // - Cho phép click nếu không occupied, không teacher busy, và phòng không bị disable
                              // - Cho phép click vào các ô bị blocked NẾU chúng nằm trong range của slot đã chọn (để toggle)
                              onClick={() => {
                                if (isRoomDisabled || occupiedSession || isTeacherBusy) return;
                                
                                // Check xem timeSlot này có nằm trong range của slot đã chọn không
                                const isInSelectedRange = selectedSlots.some((slot) => {
                                  return slot.day === day.value && 
                                         slot.roomId === room.id && 
                                         timeSlot >= slot.startTime && 
                                         timeSlot < slot.endTime;
                                });
                                
                                // Cho phép click nếu:
                                // 1. Không bị blocked (slot trống)
                                // 2. HOẶC nằm trong range của slot đã chọn (để toggle - bất kể có bị blocked hay không)
                                const canClick = !isBlocked || isInSelectedRange;
                                
                                if (canClick) {
                                  handleSlotClick(day.value, timeSlot, room.id, room.name);
                                }
                              }}
                              // Tooltip hiển thị thông tin khi hover
                              title={
                                occupiedSession
                                  ? (() => {
                                      const dateInfo = occupiedSession.actualStartDate 
                                        ? `Bắt đầu: ${formatDate(occupiedSession.actualStartDate)}${occupiedSession.actualEndDate ? ` | Kết thúc: ${formatDate(occupiedSession.actualEndDate)}` : ''}`
                                        : occupiedSession.expectedStartDate
                                        ? `Dự kiến: ${formatDate(occupiedSession.expectedStartDate)}`
                                        : '';
                                      return `${occupiedSession.className} - ${occupiedSession.teacherName || 'Chưa có GV'}${dateInfo ? `\n${dateInfo}` : ''}`;
                                    })()
                                  : isTeacherBusy
                                  ? (() => {
                                      const dateInfo = teacherOccupied!.actualStartDate 
                                        ? `Bắt đầu: ${formatDate(teacherOccupied!.actualStartDate)}${teacherOccupied!.actualEndDate ? ` | Kết thúc: ${formatDate(teacherOccupied!.actualEndDate)}` : ''}`
                                        : teacherOccupied!.expectedStartDate
                                        ? `Dự kiến: ${formatDate(teacherOccupied!.expectedStartDate)}`
                                        : '';
                                      return `Giáo viên đang dạy: ${teacherOccupied!.className} - ${teacherOccupied!.subjectName}${dateInfo ? `\n${dateInfo}` : ''}`;
                                    })()
                                  : isSelected
                                  ? 'Click để bỏ chọn'
                                  : isBlocked
                                  ? 'Đã được chọn trong khoảng thời gian của lịch khác'
                                      : isRoomDisabled
                                  ? 'Đã chọn phòng khác, không thể chọn phòng này'
                                  : 'Click để chọn'
                              }
                            >
                              {/* ===== STEP 3: Render nội dung cell theo state ===== */}
                              
                              {/* CASE 1a: Giáo viên đang dạy → Hiển thị thông tin lớp giáo viên đang dạy */}
                              {isTeacherBusy && !occupiedSession ? (
                                <div className="text-[11px] leading-tight min-h-[32px]">
                                  <div className="font-semibold truncate text-orange-800 dark:text-orange-200">
                                    {teacherOccupied!.className}
                                  </div>
                                  <div className="text-orange-700 dark:text-orange-300 truncate">
                                    GV: {teacherOccupied!.subjectName}
                                  </div>
                                  {teacherOccupied!.actualStartDate && (
                                    <div className="text-[10px] text-orange-600 dark:text-orange-400 truncate mt-0.5">
                                      {formatDate(teacherOccupied!.actualStartDate)}
                                      {teacherOccupied!.actualEndDate ? ` - ${formatDate(teacherOccupied!.actualEndDate)}` : ''}
                                    </div>
                                  )}
                                  {!teacherOccupied!.actualStartDate && teacherOccupied!.expectedStartDate && (
                                    <div className="text-[10px] text-orange-600 dark:text-orange-400 truncate mt-0.5">
                                      Dự kiến: {formatDate(teacherOccupied!.expectedStartDate)}
                                    </div>
                                  )}
                                </div>
                              ) : occupiedSession ? (
                                /* CASE 1: Có lớp học → Hiển thị tên lớp, giáo viên và ngày */
                                <div className="text-[11px] leading-tight min-h-[32px]">
                                  <div className="font-semibold truncate">
                                    {occupiedSession.className}
                                  </div>
                                  <div className="text-gray-600 dark:text-gray-400 truncate">
                                    {occupiedSession.teacherName || 'N/A'}
                                  </div>
                                  {occupiedSession.actualStartDate && (
                                    <div className="text-[10px] text-gray-500 dark:text-gray-500 truncate mt-0.5">
                                      {formatDate(occupiedSession.actualStartDate)}
                                      {occupiedSession.actualEndDate ? ` - ${formatDate(occupiedSession.actualEndDate)}` : ''}
                                    </div>
                                  )}
                                  {!occupiedSession.actualStartDate && occupiedSession.expectedStartDate && (
                                    <div className="text-[10px] text-gray-500 dark:text-gray-500 truncate mt-0.5">
                                      Dự kiến: {formatDate(occupiedSession.expectedStartDate)}
                                    </div>
                                  )}
                                </div>
                              ) : isSelected ? (
                              /* CASE 2: Là start time đã chọn → Hiển thị dấu ✓ */
                                <div className="text-center text-green-700 dark:text-green-300 font-bold text-base min-h-[32px] flex items-center justify-center">
                                  ✓
                                </div>
                              ) 
                              
                              /* CASE 3: Bị block bởi duration → Hiển thị dấu ― */
                              : isBlocked ? (
                                <div className="text-center text-green-600 dark:text-green-400 text-base min-h-[32px] flex items-center justify-center">
                                  ―
                                </div>
                              ) 
                              
                              /* CASE 4: Trống → Không hiển thị gì */
                              : null}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              );
            })
          )}
        </div>
      </div>

      {/* ===== LEGEND ===== */}
      {/* Chú thích màu sắc để user hiểu ý nghĩa của từng trạng thái */}
      <div className="flex items-center gap-4 text-sm flex-wrap">
        {/* Trống - Có thể chọn */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white dark:bg-gray-800 border-2"></div>
          <span>Trống</span>
        </div>
        {/* Đỏ - Đã có lớp học */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-red-100 dark:bg-red-900/30 border-2"></div>
          <span>Đã có lớp</span>
        </div>
        {/* Xanh đậm + ✓ - Start time đã chọn */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 border-2 flex items-center justify-center font-bold">✓</div>
          <span>Thời gian bắt đầu đã chọn</span>
        </div>
        {/* Xanh nhạt + ― - Bị block bởi duration */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-50 dark:bg-green-900/10 border-2 flex items-center justify-center">―</div>
          <span>Đang trong khoảng thời gian đã chọn</span>
        </div>
      </div>
    </div>
  );
};

// ==================== END OF COMPONENT ====================

