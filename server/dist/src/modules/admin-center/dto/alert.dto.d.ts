export declare enum AlertType {
    PARENT_REGISTRATION = "parent_registration",
    LEAVE_REQUEST = "leave_request",
    SESSION_REQUEST = "session_request",
    INCIDENT_REPORT = "incident_report",
    ENROLLMENT = "enrollment",
    PAYMENT = "payment",
    STUDENT_CLASS_REQUEST = "student_class_request",
    OTHER = "other"
}
export declare enum AlertSeverity {
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3
}
export declare class CreateAlertDto {
    alertType: AlertType;
    title: string;
    message: string;
    severity?: AlertSeverity;
    payload?: any;
}
export declare class UpdateAlertDto {
    isRead?: boolean;
    processed?: boolean;
}
export declare class GetAlertsDto {
    page?: number;
    limit?: number;
    alertType?: string;
    severity?: string;
    isRead?: boolean;
    processed?: boolean;
}
