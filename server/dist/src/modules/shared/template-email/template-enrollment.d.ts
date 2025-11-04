export declare const enrollmentNotificationEmailTemplate: (data: {
    studentName: string;
    parentName: string;
    className: string;
    subjectName: string;
    teacherName?: string;
    startDate?: string;
    schedule?: any;
    enrollmentStatus: string;
}) => string;
