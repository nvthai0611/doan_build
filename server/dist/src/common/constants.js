"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_STATUS = exports.API_RESPONSE_CODES = exports.VALIDATION_MESSAGES = exports.COMMON_FILTER_VALUES = exports.COMMON_SORT_ORDER = exports.COMMON_PAGINATION = exports.USER_ROLE_LABELS = exports.UserRole = exports.CONTRACT_STATUS_LABELS = exports.ContractStatus = exports.REQUEST_STATUS_LABELS = exports.RequestStatus = exports.ENROLLMENT_STATUS_COLORS = exports.ENROLLMENT_STATUS_LABELS = exports.EnrollmentStatus = exports.ATTENDANCE_STATUS_LABELS = exports.AttendanceStatus = exports.SESSION_TYPE_LABELS = exports.SessionType = exports.SESSION_STATUS_LABELS = exports.SessionStatus = exports.ACTIVE_TO_COMPLETED_CONDITIONS = exports.READY_TO_ACTIVE_CONDITIONS = exports.DRAFT_TO_READY_CONDITIONS = exports.CLASS_STATUS_TRANSITIONS = exports.CLASS_STATUS_COLORS = exports.CLASS_STATUS_LABELS = exports.ClassStatus = exports.STUDENT_STATUS_MAPPING = exports.STUDENT_STATUS_LABELS = exports.StudentStatus = exports.GENDER_LABELS = exports.Gender = void 0;
exports.getStatusLabel = getStatusLabel;
exports.isValidStatus = isValidStatus;
exports.mapVietnameseStatusToEnum = mapVietnameseStatusToEnum;
exports.mapEnumToVietnameseStatus = mapEnumToVietnameseStatus;
exports.getStatusValues = getStatusValues;
exports.createSelectOptions = createSelectOptions;
exports.validateStatus = validateStatus;
var Gender;
(function (Gender) {
    Gender["MALE"] = "MALE";
    Gender["FEMALE"] = "FEMALE";
    Gender["OTHER"] = "OTHER";
})(Gender || (exports.Gender = Gender = {}));
exports.GENDER_LABELS = {
    [Gender.MALE]: 'Nam',
    [Gender.FEMALE]: 'Nữ',
    [Gender.OTHER]: 'Khác'
};
var StudentStatus;
(function (StudentStatus) {
    StudentStatus["PENDING"] = "pending";
    StudentStatus["UPCOMING"] = "upcoming";
    StudentStatus["STUDYING"] = "studying";
    StudentStatus["RESERVED"] = "reserved";
    StudentStatus["STOPPED"] = "stopped";
    StudentStatus["GRADUATED"] = "graduated";
    StudentStatus["ALL"] = "all";
})(StudentStatus || (exports.StudentStatus = StudentStatus = {}));
exports.STUDENT_STATUS_LABELS = {
    [StudentStatus.ALL]: 'Tất cả',
    [StudentStatus.PENDING]: 'Chờ xếp lớp',
    [StudentStatus.UPCOMING]: 'Sắp học',
    [StudentStatus.STUDYING]: 'Đang học',
    [StudentStatus.RESERVED]: 'Bảo lưu',
    [StudentStatus.STOPPED]: 'Dừng học',
    [StudentStatus.GRADUATED]: 'Tốt nghiệp'
};
exports.STUDENT_STATUS_MAPPING = {
    'Chờ xếp lớp': StudentStatus.PENDING,
    'Sắp học': StudentStatus.UPCOMING,
    'Đang học': StudentStatus.STUDYING,
    'Bảo lưu': StudentStatus.RESERVED,
    'Dừng học': StudentStatus.STOPPED,
    'Tốt nghiệp': StudentStatus.GRADUATED,
    'Chưa cập nhật lịch học': StudentStatus.PENDING
};
var ClassStatus;
(function (ClassStatus) {
    ClassStatus["DRAFT"] = "draft";
    ClassStatus["READY"] = "ready";
    ClassStatus["ACTIVE"] = "active";
    ClassStatus["COMPLETED"] = "completed";
    ClassStatus["SUSPENDED"] = "suspended";
    ClassStatus["CANCELLED"] = "cancelled";
    ClassStatus["ALL"] = "all";
})(ClassStatus || (exports.ClassStatus = ClassStatus = {}));
exports.CLASS_STATUS_LABELS = {
    [ClassStatus.ALL]: 'Tất cả',
    [ClassStatus.DRAFT]: 'Lớp nháp',
    [ClassStatus.READY]: 'Sẵn sàng',
    [ClassStatus.ACTIVE]: 'Đang hoạt động',
    [ClassStatus.COMPLETED]: 'Đã hoàn thành',
    [ClassStatus.SUSPENDED]: 'Tạm dừng',
    [ClassStatus.CANCELLED]: 'Đã hủy'
};
exports.CLASS_STATUS_COLORS = {
    [ClassStatus.ALL]: 'border-blue-500 text-blue-700 bg-blue-50',
    [ClassStatus.DRAFT]: 'border-gray-500 text-gray-700 bg-gray-50',
    [ClassStatus.READY]: 'border-yellow-500 text-yellow-700 bg-yellow-50',
    [ClassStatus.ACTIVE]: 'border-green-500 text-green-700 bg-green-50',
    [ClassStatus.COMPLETED]: 'border-emerald-500 text-emerald-700 bg-emerald-50',
    [ClassStatus.SUSPENDED]: 'border-orange-500 text-orange-700 bg-orange-50',
    [ClassStatus.CANCELLED]: 'border-red-500 text-red-700 bg-red-50'
};
exports.CLASS_STATUS_TRANSITIONS = {
    [ClassStatus.DRAFT]: [
        ClassStatus.READY,
        ClassStatus.CANCELLED
    ],
    [ClassStatus.READY]: [
        ClassStatus.ACTIVE,
        ClassStatus.CANCELLED
    ],
    [ClassStatus.ACTIVE]: [
        ClassStatus.COMPLETED,
        ClassStatus.SUSPENDED,
        ClassStatus.CANCELLED
    ],
    [ClassStatus.COMPLETED]: [],
    [ClassStatus.SUSPENDED]: [
        ClassStatus.ACTIVE,
        ClassStatus.CANCELLED
    ],
    [ClassStatus.CANCELLED]: [],
    [ClassStatus.ALL]: []
};
exports.DRAFT_TO_READY_CONDITIONS = {
    requiredFields: ['name', 'subjectId', 'grade', 'roomId'],
    requiredSchedule: true,
    requiredTeacher: true,
    requiredDates: ['expectedStartDate']
};
exports.READY_TO_ACTIVE_CONDITIONS = {
    hasActualStartDate: true,
    startDateReached: true,
    hasSessions: false
};
exports.ACTIVE_TO_COMPLETED_CONDITIONS = {
    hasActualEndDate: true,
    endDatePassed: true,
    allSessionsCompleted: true
};
var SessionStatus;
(function (SessionStatus) {
    SessionStatus["HAPPENING"] = "happening";
    SessionStatus["HAS_NOT_HAPPENED"] = "has_not_happened";
    SessionStatus["END"] = "end";
    SessionStatus["DAY_OFF"] = "day_off";
    SessionStatus["CANCELLED"] = "cancelled";
    SessionStatus["ALL"] = "all";
})(SessionStatus || (exports.SessionStatus = SessionStatus = {}));
exports.SESSION_STATUS_LABELS = {
    [SessionStatus.ALL]: 'Tất cả',
    [SessionStatus.HAPPENING]: 'Đang diễn ra',
    [SessionStatus.HAS_NOT_HAPPENED]: 'Chưa diễn ra',
    [SessionStatus.END]: 'Đã hoàn thành',
    [SessionStatus.DAY_OFF]: 'Nghỉ lễ',
    [SessionStatus.CANCELLED]: 'Đã hủy'
};
var SessionType;
(function (SessionType) {
    SessionType["REGULAR"] = "regular";
    SessionType["EXAM"] = "exam";
    SessionType["MAKEUP"] = "makeup";
    SessionType["ALL"] = "all";
})(SessionType || (exports.SessionType = SessionType = {}));
exports.SESSION_TYPE_LABELS = {
    [SessionType.ALL]: 'Tất cả',
    [SessionType.REGULAR]: 'Buổi học thường',
    [SessionType.EXAM]: 'Buổi thi',
    [SessionType.MAKEUP]: 'Buổi học bù'
};
var AttendanceStatus;
(function (AttendanceStatus) {
    AttendanceStatus["PRESENT"] = "present";
    AttendanceStatus["ABSENT"] = "absent";
    AttendanceStatus["LATE"] = "late";
})(AttendanceStatus || (exports.AttendanceStatus = AttendanceStatus = {}));
exports.ATTENDANCE_STATUS_LABELS = {
    [AttendanceStatus.PRESENT]: 'Có mặt',
    [AttendanceStatus.ABSENT]: 'Vắng mặt',
    [AttendanceStatus.LATE]: 'Đi muộn'
};
var EnrollmentStatus;
(function (EnrollmentStatus) {
    EnrollmentStatus["ALL"] = "all";
    EnrollmentStatus["NOT_BEEN_UPDATED"] = "not_been_updated";
    EnrollmentStatus["STUDYING"] = "studying";
    EnrollmentStatus["STOPPED"] = "stopped";
    EnrollmentStatus["GRADUATED"] = "graduated";
})(EnrollmentStatus || (exports.EnrollmentStatus = EnrollmentStatus = {}));
exports.ENROLLMENT_STATUS_LABELS = {
    [EnrollmentStatus.ALL]: 'Tất cả',
    [EnrollmentStatus.NOT_BEEN_UPDATED]: 'Chưa cập nhật lịch học',
    [EnrollmentStatus.STUDYING]: 'Đang học',
    [EnrollmentStatus.STOPPED]: 'Dừng học',
    [EnrollmentStatus.GRADUATED]: 'Tốt nghiệp'
};
exports.ENROLLMENT_STATUS_COLORS = {
    [EnrollmentStatus.ALL]: 'border-blue-500 text-blue-700 bg-blue-50',
    [EnrollmentStatus.NOT_BEEN_UPDATED]: 'border-gray-500 text-gray-700 bg-gray-50',
    [EnrollmentStatus.STUDYING]: 'border-green-500 text-green-700 bg-green-50',
    [EnrollmentStatus.STOPPED]: 'border-red-500 text-red-700 bg-red-50',
    [EnrollmentStatus.GRADUATED]: 'border-purple-500 text-purple-700 bg-purple-50'
};
var RequestStatus;
(function (RequestStatus) {
    RequestStatus["PENDING"] = "pending";
    RequestStatus["APPROVED"] = "approved";
    RequestStatus["REJECTED"] = "rejected";
    RequestStatus["PROCESSING"] = "processing";
})(RequestStatus || (exports.RequestStatus = RequestStatus = {}));
exports.REQUEST_STATUS_LABELS = {
    [RequestStatus.PENDING]: 'Chờ xử lý',
    [RequestStatus.APPROVED]: 'Đã duyệt',
    [RequestStatus.REJECTED]: 'Đã từ chối',
    [RequestStatus.PROCESSING]: 'Đang xử lý'
};
var ContractStatus;
(function (ContractStatus) {
    ContractStatus["ACTIVE"] = "active";
    ContractStatus["EXPIRED"] = "expired";
    ContractStatus["TERMINATED"] = "terminated";
    ContractStatus["DRAFT"] = "draft";
})(ContractStatus || (exports.ContractStatus = ContractStatus = {}));
exports.CONTRACT_STATUS_LABELS = {
    [ContractStatus.ACTIVE]: 'Đang có hiệu lực',
    [ContractStatus.EXPIRED]: 'Đã hết hạn',
    [ContractStatus.TERMINATED]: 'Đã chấm dứt',
    [ContractStatus.DRAFT]: 'Nháp'
};
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["MANAGER"] = "manager";
    UserRole["TEACHER"] = "teacher";
    UserRole["STUDENT"] = "student";
    UserRole["PARENT"] = "parent";
})(UserRole || (exports.UserRole = UserRole = {}));
exports.USER_ROLE_LABELS = {
    [UserRole.ADMIN]: 'Quản trị viên',
    [UserRole.MANAGER]: 'Quản lý',
    [UserRole.TEACHER]: 'Giáo viên',
    [UserRole.STUDENT]: 'Học sinh',
    [UserRole.PARENT]: 'Phụ huynh'
};
exports.COMMON_PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
};
exports.COMMON_SORT_ORDER = {
    ASC: 'asc',
    DESC: 'desc'
};
exports.COMMON_FILTER_VALUES = {
    ALL: 'all',
    NONE: 'none'
};
exports.VALIDATION_MESSAGES = {
    REQUIRED: 'Trường này là bắt buộc',
    INVALID_EMAIL: 'Email không hợp lệ',
    INVALID_PHONE: 'Số điện thoại không hợp lệ',
    INVALID_DATE: 'Ngày không hợp lệ',
    INVALID_STATUS: 'Trạng thái không hợp lệ',
    INVALID_ENUM: 'Giá trị không hợp lệ'
};
exports.API_RESPONSE_CODES = {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};
function getStatusLabel(status, labels) {
    return labels[status] || status;
}
function isValidStatus(status, validStatuses) {
    return Object.values(validStatuses).includes(status);
}
function mapVietnameseStatusToEnum(vietnameseStatus) {
    return exports.STUDENT_STATUS_MAPPING[vietnameseStatus] || StudentStatus.PENDING;
}
function mapEnumToVietnameseStatus(status) {
    return exports.STUDENT_STATUS_LABELS[status];
}
function getStatusValues(statusEnum, excludeAll = true) {
    const values = Object.values(statusEnum);
    return excludeAll ? values.filter(v => v !== 'all') : values;
}
function createSelectOptions(statusEnum, labels, includeAll = false) {
    const options = Object.values(statusEnum).map(status => ({
        value: status,
        label: labels[status]
    }));
    if (includeAll) {
        return options;
    }
    return options.filter(option => option.value !== 'all');
}
function validateStatus(status, validStatuses, fieldName = 'status') {
    if (!isValidStatus(status, validStatuses)) {
        throw new Error(`${fieldName} không hợp lệ. Giá trị hợp lệ: ${Object.values(validStatuses).join(', ')}`);
    }
    return status;
}
exports.DEFAULT_STATUS = {
    STUDENT: StudentStatus.PENDING,
    CLASS: ClassStatus.DRAFT,
    SESSION: SessionStatus.HAPPENING,
    ENROLLMENT: EnrollmentStatus.NOT_BEEN_UPDATED,
    REQUEST: RequestStatus.PENDING,
    CONTRACT: ContractStatus.DRAFT
};
//# sourceMappingURL=constants.js.map