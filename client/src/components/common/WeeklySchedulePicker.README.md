# WeeklySchedulePicker Component - Technical Documentation

## 📋 Tổng quan

`WeeklySchedulePicker` là một component React phức tạp cho phép người dùng chọn lịch học hàng tuần với các tính năng:
- Hiển thị lịch theo tuần (Monday - Sunday)
- Lọc theo phòng học
- Chọn thời gian với duration tùy chỉnh
- Tự động block các time slots trong khoảng duration
- Hiển thị các lớp đang có trong tuần
- Ngăn chặn conflict giữa các lịch đã chọn

---

## 🏗️ Kiến trúc dữ liệu

### 1. Interface chính

```typescript
interface ScheduleSlot {
  id: string;           // Unique identifier
  day: string;          // 'monday', 'tuesday', etc.
  startTime: string;    // '08:00', '08:30', etc.
  endTime: string;      // Tính toán từ startTime + duration
  duration: number;     // Thời lượng tính bằng phút (90, 120, etc.)
  roomId?: string;      // ID của phòng học
  roomName?: string;    // Tên phòng học
}

interface ClassSession {
  id: string;
  name: string;          // Tên lớp
  date: string;          // Ngày học (ISO format)
  startTime: string;     // Giờ bắt đầu
  endTime: string;       // Giờ kết thúc
  roomName: string | null;
  teacherName: string;
  subjectName: string;
  studentCount: number;
  maxStudents: number;
  status: string;
}
```

### 2. Constants

```typescript
// Các ngày trong tuần
DAYS_OF_WEEK = [
  { value: 'monday', label: 'Thứ 2' },
  { value: 'tuesday', label: 'Thứ 3' },
  // ... 7 ngày
]

// Time slots: 7:00 - 21:00, mỗi 30 phút
TIME_SLOTS = ['07:00', '07:30', '08:00', ..., '21:00']
```

---

## 🔄 Logic Flow

### Phase 1: Data Fetching

#### 1.1. Fetch Rooms
```typescript
const { data: roomsData } = useQuery({
  queryKey: ['rooms'],
  queryFn: async () => {
    const response = await apiClient.get('/rooms');
    return response;
  },
});
```
**Mục đích**: Lấy danh sách phòng học để hiển thị và filter

#### 1.2. Calculate Week Range
```typescript
const weekDates = useMemo(() => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 (Sunday) - 6 (Saturday)
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  
  // Tính Monday của tuần hiện tại + offset
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset + (currentWeekOffset * 7));
  
  // Tính Sunday (6 ngày sau Monday)
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return { start: monday, end: sunday };
}, [currentWeekOffset]);
```

**Logic chi tiết**:
- `currentDay === 0` → Sunday → cần lùi 6 ngày để về Monday
- `currentDay === 1-6` → Monday-Saturday → công thức: `1 - currentDay`
- `currentWeekOffset`: cho phép navigate qua lại giữa các tuần
  - `0`: tuần hiện tại
  - `-1`: tuần trước
  - `+1`: tuần sau

**Ví dụ**:
- Hôm nay: Wednesday (currentDay = 3)
- mondayOffset = 1 - 3 = -2
- monday.setDate(today.getDate() - 2) → về Monday
- sunday.setDate(monday.getDate() + 6) → Sunday cùng tuần

#### 1.3. Fetch Weekly Schedule
```typescript
const { data: scheduleData } = useQuery({
  queryKey: ['weekly-schedule', weekDates.start, weekDates.end],
  queryFn: async () => {
    const response = await apiClient.get(
      '/admin-center/schedule-management/sessions/week',
      {
        startDate: weekDates.start.toISOString().split('T')[0],
        endDate: weekDates.end.toISOString().split('T')[0],
      }
    );
    return response;
  },
});
```
**Mục đích**: Lấy tất cả buổi học trong tuần để hiển thị và check conflict

---

### Phase 2: Build Occupied Slots Map

Đây là **phần quan trọng nhất** - tạo một Map để tra cứu nhanh các slot đã bị chiếm:

```typescript
const occupiedSlots = useMemo(() => {
  const map = new Map<string, ClassSession>();
  
  sessions.forEach((session) => {
    // 1. Validate dữ liệu
    if (!session?.date || !session?.startTime || !session?.endTime || !session?.roomName) {
      return; // Skip invalid sessions
    }

    // 2. Convert date sang day of week
    const sessionDate = new Date(session.date);
    const dayIndex = sessionDate.getDay(); // 0-6
    
    // 3. Map dayIndex → dayValue
    let dayValue: string;
    if (dayIndex === 0) {
      dayValue = 'sunday';
    } else if (dayIndex >= 1 && dayIndex <= 6) {
      dayValue = DAYS_OF_WEEK[dayIndex - 1].value;
    }
    
    // 4. Tạo keys cho TẤT CẢ time slots trong khoảng session
    TIME_SLOTS.forEach((timeSlot) => {
      if (timeSlot >= session.startTime && timeSlot < session.endTime) {
        const key = `${dayValue}-${timeSlot}-${session.roomName}`;
        map.set(key, session);
      }
    });
  });
  
  return map;
}, [sessions]);
```

**Logic chi tiết**:

1. **Key format**: `"{day}-{time}-{roomName}"`
   - Ví dụ: `"monday-08:00-Phòng A1"`

2. **Tại sao loop TIME_SLOTS?**
   - Session từ 08:00 - 10:00 phải chiếm:
     - `08:00`, `08:30`, `09:00`, `09:30`
   - Vì thế cần tạo key cho mỗi 30 phút
   
3. **Điều kiện**: `timeSlot >= startTime && timeSlot < endTime`
   - `>=` startTime: bao gồm giờ bắt đầu
   - `<` endTime: không bao gồm giờ kết thúc
   - Ví dụ: 08:00-10:00 → [08:00, 08:30, 09:00, 09:30] (không có 10:00)

**Ví dụ cụ thể**:
```
Session: {
  date: "2025-10-27", // Monday
  startTime: "08:00",
  endTime: "09:30",
  roomName: "Phòng A1"
}

→ Tạo keys:
- "monday-08:00-Phòng A1"
- "monday-08:30-Phòng A1"
- "monday-09:00-Phòng A1"
```

**Tại sao dùng Map?**
- Tra cứu O(1) thay vì O(n)
- Với 100 sessions × 3 slots mỗi session = 300 keys
- Tra cứu nhanh hơn array.find() rất nhiều

---

### Phase 3: Time Blocking Logic

Đây là **logic core** để ngăn chặn conflict khi chọn slots:

#### 3.1. Hàm `isTimeBlocked()`

```typescript
const isTimeBlocked = (day: string, timeSlot: string, roomId: string): boolean => {
  return selectedSlots.some((slot) => {
    // Chỉ check cùng ngày và cùng phòng
    if (slot.day !== day || slot.roomId !== roomId) return false;
    
    // Check timeSlot có nằm trong range [startTime, endTime) không
    return timeSlot >= slot.startTime && timeSlot < slot.endTime;
  });
};
```

**Mục đích**: Kiểm tra xem một time slot có bị block bởi các slot đã chọn không

**Logic**:
1. Chỉ xét các slots cùng `day` và cùng `roomId`
2. Time slot bị block nếu nằm trong range `[startTime, endTime)`

**Ví dụ**:
```
Selected slot: {
  day: "monday",
  roomId: "room-1",
  startTime: "08:00",
  endTime: "09:30",  // 08:00 + 90 minutes
  duration: 90
}

isTimeBlocked("monday", "08:00", "room-1") → true  (start time)
isTimeBlocked("monday", "08:30", "room-1") → true  (trong range)
isTimeBlocked("monday", "09:00", "room-1") → true  (trong range)
isTimeBlocked("monday", "09:30", "room-1") → false (endTime không bị block)
isTimeBlocked("monday", "10:00", "room-1") → false (ngoài range)
```

**Visual representation**:
```
Time:     08:00  08:30  09:00  09:30  10:00
Status:     ✓     ―      ―      □      □
          (start)(blocked)(blocked)(free)(free)
```

#### 3.2. Hàm `wouldOverlap()`

```typescript
const wouldOverlap = (
  day: string, 
  startTime: string, 
  endTime: string, 
  roomId: string
): boolean => {
  return selectedSlots.some((slot) => {
    if (slot.day !== day || slot.roomId !== roomId) return false;
    
    // Overlap condition: A.start < B.end AND B.start < A.end
    return (startTime < slot.endTime && endTime > slot.startTime);
  });
};
```

**Mục đích**: Kiểm tra xem slot mới có overlap với slots đã chọn không

**Công thức overlap**:
```
Slot A: [A.start -------- A.end]
Slot B:          [B.start -------- B.end]

Overlap nếu: A.start < B.end AND B.start < A.end
```

**Các trường hợp**:
```
Case 1: No overlap
[A.start --- A.end]
                    [B.start --- B.end]
A.end <= B.start → OK

Case 2: Partial overlap (BAD)
[A.start ------- A.end]
           [B.start ------- B.end]
A.start < B.end AND B.start < A.end → OVERLAP

Case 3: Full overlap (BAD)
[A.start ------------ A.end]
    [B.start - B.end]
A.start < B.end AND B.start < A.end → OVERLAP

Case 4: Adjacent (OK)
[A.start --- A.end]
                [B.start --- B.end]
A.end == B.start → NO OVERLAP (vì dùng <, không dùng <=)
```

**Ví dụ thực tế**:
```typescript
// Đã chọn: 08:00-09:30
wouldOverlap("monday", "08:30", "10:00", "room-1")
// 08:30 < 09:30 AND 10:00 > 08:00 → true (OVERLAP)

wouldOverlap("monday", "09:30", "11:00", "room-1")
// 09:30 < 09:30 → false (NO OVERLAP - adjacent OK)

wouldOverlap("monday", "10:00", "11:30", "room-1")
// 10:00 < 09:30 → false (NO OVERLAP - sau slot đã chọn)
```

#### 3.3. Hàm `calculateEndTime()`

```typescript
const calculateEndTime = (startTime: string, duration: number): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  
  // Tạo Date object với giờ/phút cụ thể
  const startDate = new Date(2000, 0, 1, hours, minutes);
  
  // Cộng thêm duration (convert phút → milliseconds)
  const endDate = new Date(startDate.getTime() + duration * 60000);
  
  // Format về HH:mm
  return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
};
```

**Logic**:
1. Parse `"08:00"` → hours=8, minutes=0
2. Tạo Date object (năm/tháng/ngày không quan trọng, chỉ dùng để tính toán)
3. Cộng `duration * 60000` milliseconds
4. Extract hours/minutes và format

**Ví dụ**:
```typescript
calculateEndTime("08:00", 90)
// startDate = Date(2000, 0, 1, 8, 0)  → 08:00:00
// endDate = startDate + 90*60000       → 90 minutes = 5,400,000 ms
// endDate = Date(2000, 0, 1, 9, 30)   → 09:30:00
// return "09:30"

calculateEndTime("08:30", 120)
// startDate = 08:30
// endDate = 08:30 + 2 hours = 10:30
// return "10:30"

calculateEndTime("20:30", 90)
// startDate = 20:30
// endDate = 20:30 + 1.5 hours = 22:00
// return "22:00"
```

---

### Phase 4: Handle Slot Selection

```typescript
const handleSlotClick = (day: string, startTime: string, roomId: string, roomName: string) => {
  // === STEP 1: Check occupied ===
  const key = `${day}-${startTime}-${roomName}`;
  if (occupiedSlots.has(key)) {
    return; // Slot đã có lớp → không cho chọn
  }
  
  // === STEP 2: Check if removing selection ===
  const existingIndex = selectedSlots.findIndex(
    (slot) => slot.day === day && 
              slot.startTime === startTime && 
              slot.roomId === roomId
  );

  if (existingIndex !== -1) {
    // Bỏ chọn → xóa khỏi array
    const newSlots = selectedSlots.filter((_, index) => index !== existingIndex);
    onSlotsChange(newSlots);
    return;
  }
  
  // === STEP 3: Adding new selection - Calculate end time ===
  const endTime = calculateEndTime(startTime, duration);
  
  // === STEP 4: Check overlap with selected slots ===
  if (wouldOverlap(day, startTime, endTime, roomId)) {
    return; // Overlap với slot đã chọn → không cho chọn
  }
  
  // === STEP 5: Check conflict with occupied sessions ===
  let hasConflict = false;
  TIME_SLOTS.forEach((timeSlot) => {
    if (timeSlot >= startTime && timeSlot < endTime) {
      const checkKey = `${day}-${timeSlot}-${roomName}`;
      if (occupiedSlots.has(checkKey)) {
        hasConflict = true;
      }
    }
  });
  
  if (hasConflict) {
    return; // Có conflict với lớp đang có → không cho chọn
  }
  
  // === STEP 6: All checks passed - Add slot ===
  const newSlot: ScheduleSlot = {
    id: Date.now().toString(),
    day,
    startTime,
    endTime,
    duration,
    roomId,
    roomName,
  };
  
  onSlotsChange([...selectedSlots, newSlot]);
};
```

**Flow chart**:
```
User clicks slot (08:00, Monday, Room A1)
         ↓
[1] occupiedSlots.has("monday-08:00-Room A1")?
    YES → Return (cannot select)
    NO → Continue
         ↓
[2] Is this slot already selected as start time?
    YES → Remove from selectedSlots
    NO → Continue
         ↓
[3] Calculate endTime (08:00 + 90min = 09:30)
         ↓
[4] wouldOverlap("monday", "08:00", "09:30", "room-1")?
    YES → Return (overlap with other selection)
    NO → Continue
         ↓
[5] Check all time slots in range [08:00, 09:30)
    - occupiedSlots.has("monday-08:00-Room A1")?
    - occupiedSlots.has("monday-08:30-Room A1")?
    - occupiedSlots.has("monday-09:00-Room A1")?
    ANY YES → Return (conflict with class)
    ALL NO → Continue
         ↓
[6] Create new ScheduleSlot
    Add to selectedSlots array
    ✓ Success
```

**Ví dụ thực tế**:

**Scenario 1**: Chọn slot trống
```
State: selectedSlots = []
Action: Click "monday-08:00-room-1"
Duration: 90 minutes

Step 1: occupiedSlots.has("monday-08:00-Room A1") → false ✓
Step 2: findIndex → -1 (not selected) ✓
Step 3: endTime = "09:30"
Step 4: wouldOverlap → false (no other selections) ✓
Step 5: Check ["08:00", "08:30", "09:00"] → all free ✓
Step 6: Add {
  day: "monday",
  startTime: "08:00",
  endTime: "09:30",
  duration: 90,
  roomId: "room-1"
}

Result: selectedSlots = [new slot]
Visual: 08:00=✓, 08:30=―, 09:00=―
```

**Scenario 2**: Chọn slot bị overlap
```
State: selectedSlots = [{
  day: "monday",
  startTime: "08:00",
  endTime: "09:30"
}]
Action: Click "monday-08:30-room-1"
Duration: 90 minutes

Step 1: occupiedSlots → false ✓
Step 2: findIndex → -1 ✓
Step 3: endTime = "10:00" (08:30 + 90min)
Step 4: wouldOverlap("monday", "08:30", "10:00", "room-1")
        → 08:30 < 09:30 AND 10:00 > 08:00 → true ✗

Result: Return early, no change
Visual: User sees 08:30 is blocked (―)
```

**Scenario 3**: Bỏ chọn slot
```
State: selectedSlots = [{
  id: "123",
  day: "monday",
  startTime: "08:00",
  endTime: "09:30"
}]
Action: Click "monday-08:00-room-1" (same start time)

Step 1: occupiedSlots → false ✓
Step 2: findIndex → 0 (found) ✓
Step 2a: Remove slot at index 0

Result: selectedSlots = []
Visual: All slots become free (□)
```

---

### Phase 5: Render Logic

#### 5.1. Determine Cell State

```typescript
{DAYS_OF_WEEK.map((day) => {
  // 1. Build lookup key
  const key = `${day.value}-${timeSlot}-${room.name}`;
  
  // 2. Get states
  const occupiedSession = occupiedSlots.get(key);        // Có lớp?
  const isSelected = isSlotSelected(day.value, timeSlot, room.id);  // Là start time?
  const isBlocked = isTimeBlocked(day.value, timeSlot, room.id);    // Bị block?
  
  // 3. Determine visual state
  // Priority: occupied > selected > blocked > free
})}
```

**State Priority**:
```
1. occupiedSession (Highest priority)
   → Đã có lớp → Hiển thị info lớp, màu đỏ, không cho click

2. isSelected
   → Là start time của slot đã chọn → Màu xanh đậm, dấu ✓, cho phép click để bỏ

3. isBlocked
   → Nằm trong duration của slot khác → Màu xanh nhạt, dấu ―, không cho click

4. Free (Default)
   → Trống → Không màu, cho phép click để chọn
```

#### 5.2. CSS Classes Logic

```typescript
className={cn(
  'border-2 p-3 text-xs transition-all duration-150',
  {
    // Occupied by a class (Highest priority)
    'bg-red-100 dark:bg-red-900/30 cursor-not-allowed hover:bg-red-200 dark:hover:bg-red-900/40':
      occupiedSession,
    
    // Selected as start time (can click to remove)
    'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 cursor-pointer':
      isSelected && !occupiedSession,
    
    // Blocked by selected duration (cannot select)
    'bg-green-50 dark:bg-green-900/10 cursor-not-allowed':
      !isSelected && isBlocked && !occupiedSession,
    
    // Available (can click to select)
    'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20':
      !occupiedSession && !isBlocked,
  }
)}
```

**CSS Class Breakdown**:

1. **Base classes**: Luôn áp dụng
   - `border-2`: Border dày 2px
   - `p-3`: Padding 12px
   - `text-xs`: Font size nhỏ
   - `transition-all duration-150`: Smooth transitions

2. **Conditional classes**: Theo priority
   - Occupied: màu đỏ, `cursor-not-allowed`, hover đỏ đậm
   - Selected: màu xanh đậm, `cursor-pointer`, hover xanh đậm hơn
   - Blocked: màu xanh nhạt, `cursor-not-allowed`
   - Free: `cursor-pointer`, hover xanh dương nhạt

#### 5.3. Cell Content

```typescript
{occupiedSession ? (
  // Case 1: Có lớp đang học
  <div className="text-[11px] leading-tight min-h-[32px]">
    <div className="font-semibold truncate">
      {occupiedSession.name}
    </div>
    <div className="text-gray-600 dark:text-gray-400 truncate">
      {occupiedSession.teacherName || 'N/A'}
    </div>
  </div>
) : isSelected ? (
  // Case 2: Start time đã chọn
  <div className="text-center text-green-700 dark:text-green-300 font-bold text-base min-h-[32px] flex items-center justify-center">
    ✓
  </div>
) : isBlocked ? (
  // Case 3: Bị block bởi duration
  <div className="text-center text-green-600 dark:text-green-400 text-base min-h-[32px] flex items-center justify-center">
    ―
  </div>
) : null}  // Case 4: Trống → không hiển thị gì
```

**Visual Examples**:

```
┌──────────────────────────────────────────────────────┐
│ Thứ 2                                                │
├──────────┬──────────┬──────────┬──────────┬─────────┤
│ 08:00    │          │ Lớp A1   │          │         │
│          │    ✓     │ GV: Nam  │    ―     │         │
│          │  (green) │  (red)   │ (light)  │ (white) │
├──────────┼──────────┼──────────┼──────────┼─────────┤
│ Free     │ Selected │ Occupied │ Blocked  │  Free   │
└──────────┴──────────┴──────────┴──────────┴─────────┘
```

---

## 🎯 Key Features Implementation

### 1. Week Navigation

```typescript
const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

// Previous week
<Button onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}>
  <ChevronLeft />
</Button>

// Next week
<Button onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}>
  <ChevronRight />
</Button>
```

- `offset = 0`: Tuần hiện tại
- `offset = -1`: Tuần trước
- `offset = +1`: Tuần sau

### 2. Room Filter

```typescript
const filteredRooms = selectedRoom === 'all' 
  ? rooms 
  : rooms.filter((r: any) => r.id === selectedRoom);

// Render filtered rooms only
{filteredRooms.map((room) => (
  <div key={room.id}>
    {/* Room schedule table */}
  </div>
))}
```

- `'all'`: Hiển thị tất cả phòng
- Specific ID: Chỉ hiển thị 1 phòng

### 3. Dynamic Duration

```typescript
<Input
  type="number"
  value={duration}
  onChange={(e) => setDuration(parseInt(e.target.value))}
  min={15}
  step={15}
/>
```

- User có thể thay đổi duration
- Minimum: 15 phút
- Step: 15 phút
- Khi duration thay đổi, các selection tiếp theo sẽ dùng duration mới

---

## 🔍 Performance Optimizations

### 1. useMemo for Week Dates
```typescript
const weekDates = useMemo(() => {
  // Calculate week range
}, [currentWeekOffset]);
```
- Chỉ recalculate khi `currentWeekOffset` thay đổi
- Tránh calculate mỗi render

### 2. useMemo for Occupied Slots Map
```typescript
const occupiedSlots = useMemo(() => {
  // Build Map<string, ClassSession>
}, [sessions]);
```
- Chỉ rebuild Map khi `sessions` data thay đổi
- Map lookup O(1) vs Array.find() O(n)

### 3. React Query Caching
```typescript
const { data } = useQuery({
  queryKey: ['weekly-schedule', weekDates.start, weekDates.end],
  // ...
});
```
- Cache data theo week range
- Không refetch khi quay lại tuần đã xem

---

## 🐛 Edge Cases Handled

### 1. Invalid Session Data
```typescript
if (!session || !session.date || !session.startTime || !session.endTime) {
  console.warn('Invalid session data:', session);
  return; // Skip invalid session
}
```

### 2. Invalid Date
```typescript
if (isNaN(sessionDate.getTime())) {
  console.warn('Invalid session date:', session.date);
  return;
}
```

### 3. Day Index Out of Range
```typescript
if (dayIndex === 0) {
  dayValue = 'sunday';
} else if (dayIndex >= 1 && dayIndex <= 6) {
  dayValue = DAYS_OF_WEEK[dayIndex - 1].value;
} else {
  console.warn('Day index out of range:', dayIndex);
  return;
}
```

### 4. No Room Assigned
```typescript
if (!session.roomName) {
  return; // Skip sessions without room
}
```

### 5. End Time Past Midnight
```typescript
calculateEndTime("23:00", 90)
// → "00:30" (next day)
// JavaScript Date handles this automatically
```

---

## 📊 Visual State Matrix

| Condition | Background | Icon | Cursor | Hover | Clickable |
|-----------|-----------|------|--------|-------|-----------|
| Occupied | Red | Class name | not-allowed | Red darker | ❌ No |
| Selected start | Green dark | ✓ | pointer | Green darker | ✅ Yes (to remove) |
| Blocked duration | Green light | ― | not-allowed | No change | ❌ No |
| Free | White | None | pointer | Blue light | ✅ Yes (to select) |

---

## 🧪 Testing Scenarios

### Scenario 1: Basic Selection
```
Given: Empty schedule
When: User clicks "Monday 08:00" with duration 90
Then:
  - 08:00 shows ✓ (green dark)
  - 08:30 shows ― (green light)
  - 09:00 shows ― (green light)
  - 09:30 is free
  - Selected slots count = 1
```

### Scenario 2: Overlap Prevention
```
Given: Slot selected at "Monday 08:00" (90 min → ends 09:30)
When: User clicks "Monday 08:30"
Then:
  - Click is ignored (slot is blocked)
  - No new slot added
  - 08:30 remains showing ―
```

### Scenario 3: Adjacent Selection (OK)
```
Given: Slot selected at "Monday 08:00" (90 min → ends 09:30)
When: User clicks "Monday 09:30"
Then:
  - New slot created: 09:30-11:00
  - 09:30 shows ✓
  - 10:00, 10:30 show ―
  - Selected slots count = 2
```

### Scenario 4: Occupied Slot
```
Given: Class exists at "Monday 08:00-10:00" in "Room A1"
When: User clicks any time 08:00-09:30
Then:
  - All clicks ignored
  - Cells show class name
  - Red background
  - Tooltip shows class info
```

### Scenario 5: Remove Selection
```
Given: Slot selected at "Monday 08:00" (90 min)
When: User clicks "Monday 08:00" again (the ✓ cell)
Then:
  - Slot removed from selectedSlots
  - 08:00, 08:30, 09:00 become free
  - Selected slots count decreases
```

### Scenario 6: Different Rooms (No Conflict)
```
Given: Slot selected at "Monday 08:00 Room A1"
When: User clicks "Monday 08:00 Room A2"
Then:
  - New slot created (different room = no conflict)
  - Both slots exist independently
```

---

## 🚀 Future Improvements

1. **Drag to Select**: Thay vì click từng ô
2. **Copy/Paste Schedule**: Copy lịch từ tuần này sang tuần khác
3. **Recurring Patterns**: "Repeat every Monday"
4. **Export Schedule**: Export ra PDF, Excel
5. **Conflict Warnings**: Highlight potential conflicts
6. **Teacher Availability**: Show teacher free/busy times
7. **Undo/Redo**: History stack cho selections
8. **Keyboard Navigation**: Arrow keys, Enter to select

---

## 📝 Summary

Component này implement một **lịch học thông minh** với:

✅ **Collision Detection**: Ngăn chặn conflict với lớp đang có
✅ **Duration Blocking**: Tự động block các slots trong duration
✅ **Overlap Prevention**: Không cho chọn slots overlap nhau
✅ **Multi-Room Support**: Quản lý nhiều phòng độc lập
✅ **Week Navigation**: Xem lịch các tuần khác nhau
✅ **Performance Optimized**: useMemo, Map lookup, React Query cache
✅ **Edge Cases Handled**: Invalid data, date edge cases, etc.
✅ **User-Friendly UI**: Clear visual states, hover effects, tooltips

**Key Algorithms**:
1. Map-based lookup cho occupied slots (O(1))
2. Range overlap detection cho conflict checking
3. Time calculation với JavaScript Date
4. State priority system cho visual rendering

**Code Quality**:
- TypeScript types cho type safety
- Validation cho edge cases
- Comments giải thích logic phức tạp
- Consistent naming conventions

