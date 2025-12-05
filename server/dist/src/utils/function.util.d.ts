type CodeType = 'teacher' | 'student' | 'class' | 'default';
declare function generateQNCode(type?: CodeType): string;
declare const formatSchedule: (schedule: any) => string;
declare const extractOrderCode: (content: string) => string | null;
declare const createOrderCode: () => string;
export { generateQNCode, CodeType, formatSchedule, extractOrderCode, createOrderCode };
