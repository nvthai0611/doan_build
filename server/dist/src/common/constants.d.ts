export declare enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER"
}
export declare const GENDER_LABELS: Record<Gender, string>;
export declare enum StudentStatus {
    PENDING = "pending",
    UPCOMING = "upcoming",
    STUDYING = "studying",
    RESERVED = "reserved",
    STOPPED = "stopped",
    GRADUATED = "graduated",
    ALL = "all"
}
export declare const STUDENT_STATUS_LABELS: Record<StudentStatus, string>;
export declare const STUDENT_STATUS_MAPPING: Record<string, StudentStatus>;
export declare enum ClassStatus {
    DRAFT = "draft",
    READY = "ready",
    ACTIVE = "active",
    COMPLETED = "completed",
    SUSPENDED = "suspended",
    CANCELLED = "cancelled",
    ALL = "all"
}
export declare const CLASS_STATUS_LABELS: Record<ClassStatus, string>;
export declare const CLASS_STATUS_COLORS: Record<ClassStatus, string>;
export declare const CLASS_STATUS_TRANSITIONS: Record<ClassStatus, ClassStatus[]>;
export declare const DRAFT_TO_READY_CONDITIONS: {
    requiredFields: string[];
    requiredSchedule: boolean;
    requiredTeacher: boolean;
    requiredDates: string[];
};
export declare const READY_TO_ACTIVE_CONDITIONS: {
    hasActualStartDate: boolean;
    startDateReached: boolean;
    hasSessions: boolean;
};
export declare const ACTIVE_TO_COMPLETED_CONDITIONS: {
    hasActualEndDate: boolean;
    endDatePassed: boolean;
    allSessionsCompleted: boolean;
};
export declare enum SessionStatus {
    HAPPENING = "happening",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    ALL = "all"
}
export declare const SESSION_STATUS_LABELS: Record<SessionStatus, string>;
export declare enum SessionType {
    REGULAR = "regular",
    EXAM = "exam",
    MAKEUP = "makeup",
    ALL = "all"
}
export declare const SESSION_TYPE_LABELS: Record<SessionType, string>;
export declare enum AttendanceStatus {
    PRESENT = "present",
    ABSENT = "absent",
    LATE = "late"
}
export declare const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string>;
export declare enum EnrollmentStatus {
    ALL = "all",
    NOT_BEEN_UPDATED = "not_been_updated",
    STUDYING = "studying",
    STOPPED = "stopped",
    GRADUATED = "graduated"
}
export declare const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string>;
export declare const ENROLLMENT_STATUS_COLORS: Record<EnrollmentStatus, string>;
export declare enum RequestStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    PROCESSING = "processing"
}
export declare const REQUEST_STATUS_LABELS: Record<RequestStatus, string>;
export declare enum ContractStatus {
    ACTIVE = "active",
    EXPIRED = "expired",
    TERMINATED = "terminated",
    DRAFT = "draft"
}
export declare const CONTRACT_STATUS_LABELS: Record<ContractStatus, string>;
export declare enum UserRole {
    ADMIN = "admin",
    MANAGER = "manager",
    TEACHER = "teacher",
    STUDENT = "student",
    PARENT = "parent"
}
export declare const USER_ROLE_LABELS: Record<UserRole, string>;
export declare const COMMON_PAGINATION: {
    DEFAULT_PAGE: number;
    DEFAULT_LIMIT: number;
    MAX_LIMIT: number;
};
export declare const COMMON_SORT_ORDER: {
    ASC: "asc";
    DESC: "desc";
};
export declare const COMMON_FILTER_VALUES: {
    ALL: string;
    NONE: string;
};
export declare const VALIDATION_MESSAGES: {
    REQUIRED: string;
    INVALID_EMAIL: string;
    INVALID_PHONE: string;
    INVALID_DATE: string;
    INVALID_STATUS: string;
    INVALID_ENUM: string;
};
export declare const API_RESPONSE_CODES: {
    SUCCESS: number;
    CREATED: number;
    BAD_REQUEST: number;
    UNAUTHORIZED: number;
    FORBIDDEN: number;
    NOT_FOUND: number;
    INTERNAL_SERVER_ERROR: number;
};
export declare function getStatusLabel<T extends Record<string, string>>(status: string, labels: T): string;
export declare function isValidStatus<T extends Record<string, string>>(status: string, validStatuses: T): boolean;
export declare function mapVietnameseStatusToEnum(vietnameseStatus: string): StudentStatus;
export declare function mapEnumToVietnameseStatus(status: StudentStatus): string;
export declare function getStatusValues<T extends Record<string, string>>(statusEnum: T, excludeAll?: boolean): string[];
export declare function createSelectOptions<T extends Record<string, string>>(statusEnum: T, labels: T, includeAll?: boolean): Array<{
    value: string;
    label: string;
}>;
export declare function validateStatus<T extends Record<string, string>>(status: string, validStatuses: T, fieldName?: string): string;
export declare const DEFAULT_STATUS: {
    STUDENT: StudentStatus;
    CLASS: ClassStatus;
    SESSION: SessionStatus;
    ENROLLMENT: EnrollmentStatus;
    REQUEST: RequestStatus;
    CONTRACT: ContractStatus;
};
