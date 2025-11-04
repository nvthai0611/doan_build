"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderCode = exports.extractOrderCode = exports.formatSchedule = void 0;
exports.generateQNCode = generateQNCode;
const CODE_PREFIXES = {
    teacher: 'QNTC',
    student: 'QNST',
    class: 'QNCL',
    default: 'QN'
};
function generateQNCode(type = 'default') {
    const seed = Date.now() + Math.random();
    const n = Math.floor((seed % 1_000_000));
    const prefix = CODE_PREFIXES[type] || CODE_PREFIXES.default;
    return `${prefix}${n.toString().padStart(6, '0')}`;
}
const formatSchedule = (schedule) => {
    let scheduleArray = schedule;
    if (typeof schedule === 'string') {
        try {
            scheduleArray = JSON.parse(schedule);
        }
        catch (error) {
            return 'Chưa có lịch học';
        }
    }
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
    const result = scheduleArray.map((item) => {
        const dayKey = item.day || item.dayOfWeek;
        const day = dayNames[dayKey] || dayKey;
        const startTime = item.startTime || 'Chưa xác định';
        const endTime = item.endTime || 'Chưa xác định';
        return `${day}: ${startTime} - ${endTime}`;
    }).join('<br>');
    return result;
};
exports.formatSchedule = formatSchedule;
const extractOrderCode = (content) => {
    const match = content.match(/PAY\d+/);
    return match ? match[0] : null;
};
exports.extractOrderCode = extractOrderCode;
const createOrderCode = () => {
    return `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`;
};
exports.createOrderCode = createOrderCode;
//# sourceMappingURL=function.util.js.map