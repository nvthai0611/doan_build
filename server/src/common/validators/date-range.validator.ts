import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsDateRange(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isDateRange',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return true; // Skip validation if value is empty
          
          // Parse as LocalDate (YYYY-MM-DD format)
          const startDateStr = value.toString();
          const endDateStr = (args.object as any).endDate?.toString();
          
          if (!endDateStr) return true; // Skip if endDate not provided
          
          // Validate date format (YYYY-MM-DD)
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(startDateStr) || !dateRegex.test(endDateStr)) {
            return false;
          }
          
          // Parse dates
          const startDate = new Date(startDateStr + 'T00:00:00.000Z');
          const endDate = new Date(endDateStr + 'T00:00:00.000Z');
          
          // Check if dates are valid
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return false;
          }
          
          // Check if start date is not in the past (except today)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (startDate < today) {
            return false;
          }
          
          // Check if start date is before end date
          if (startDate >= endDate) {
            return false;
          }
          
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const startDateStr = args.value?.toString();
          const endDateStr = (args.object as any).endDate?.toString();
          
          if (!startDateStr || !endDateStr) {
            return 'Ngày không được để trống';
          }
          
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(startDateStr) || !dateRegex.test(endDateStr)) {
            return 'Định dạng ngày phải là YYYY-MM-DD';
          }
          
          const startDate = new Date(startDateStr + 'T00:00:00.000Z');
          const endDate = new Date(endDateStr + 'T00:00:00.000Z');
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (isNaN(startDate.getTime())) {
            return 'Ngày bắt đầu không hợp lệ';
          }
          
          if (startDate < today) {
            return 'Ngày bắt đầu không được trong quá khứ';
          }
          
          if (startDate >= endDate) {
            return 'Ngày bắt đầu phải trước ngày kết thúc';
          }
          
          return 'Ngày không hợp lệ';
        }
      },
    });
  };
}

export function IsEndDateAfterStart(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEndDateAfterStart',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return true; // Skip validation if value is empty
          
          const endDateStr = value.toString();
          const startDateStr = (args.object as any).startDate?.toString();
          
          if (!startDateStr) return true; // Skip if startDate not provided
          
          // Validate date format (YYYY-MM-DD)
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(startDateStr) || !dateRegex.test(endDateStr)) {
            return false;
          }
          
          const endDate = new Date(endDateStr + 'T00:00:00.000Z');
          const startDate = new Date(startDateStr + 'T00:00:00.000Z');
          
          // Check if dates are valid
          if (isNaN(endDate.getTime()) || isNaN(startDate.getTime())) {
            return false;
          }
          
          // Check if end date is after start date
          return endDate > startDate;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Ngày kết thúc phải sau ngày bắt đầu';
        }
      },
    });
  };
}

export function IsNotOverlappingHoliday(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotOverlappingHoliday',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        async validate(value: any, args: ValidationArguments) {
          if (!value) return true; // Skip validation if value is empty
          
          const startDateStr = value.toString();
          const endDateStr = (args.object as any).endDate?.toString();
          
          if (!endDateStr) return true; // Skip if endDate not provided
          
          // Validate date format (YYYY-MM-DD)
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(startDateStr) || !dateRegex.test(endDateStr)) {
            return false;
          }
          
          const startDate = new Date(startDateStr + 'T00:00:00.000Z');
          const endDate = new Date(endDateStr + 'T00:00:00.000Z');
          
          // Check if dates are valid
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return false;
          }
          
          // This validation will be handled in the service layer
          // where we have access to the database
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Kỳ nghỉ này trùng với kỳ nghỉ đã tồn tại';
        }
      },
    });
  };
}
