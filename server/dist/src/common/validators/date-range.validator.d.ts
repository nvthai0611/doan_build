import { ValidationOptions } from 'class-validator';
export declare function IsDateRange(validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
export declare function IsEndDateAfterStart(validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
export declare function IsNotOverlappingHoliday(validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
