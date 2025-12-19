export declare const classStatusChangeEmailTemplate: (data: {
    parentName: string;
    studentName: string;
    className: string;
    subjectName: string;
    teacherName?: string;
    oldStatus: string;
    newStatus: string;
    statusLabel: string;
    statusColor: string;
    statusIcon: string;
}) => string;
