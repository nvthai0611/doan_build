interface SessionChangeTemplateData {
    type: 'cancelled' | 'rescheduled';
    parentName: string;
    studentNames: string[];
    className: string;
    subjectName?: string;
    teacherName?: string;
    originalDate: string;
    originalTime: string;
    newDate?: string;
    newTime?: string;
    reason?: string;
}
export declare const sessionChangeEmailTemplate: ({ type, parentName, studentNames, className, subjectName, teacherName, originalDate, originalTime, newDate, newTime, reason, }: SessionChangeTemplateData) => string;
export type { SessionChangeTemplateData };
