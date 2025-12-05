"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsDateRange = IsDateRange;
exports.IsEndDateAfterStart = IsEndDateAfterStart;
exports.IsNotOverlappingHoliday = IsNotOverlappingHoliday;
const class_validator_1 = require("class-validator");
function IsDateRange(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isDateRange',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value, args) {
                    if (!value)
                        return true;
                    const startDateStr = value.toString();
                    const endDateStr = args.object.endDate?.toString();
                    if (!endDateStr)
                        return true;
                    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                    if (!dateRegex.test(startDateStr) || !dateRegex.test(endDateStr)) {
                        return false;
                    }
                    const startDate = new Date(startDateStr + 'T00:00:00.000Z');
                    const endDate = new Date(endDateStr + 'T00:00:00.000Z');
                    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                        return false;
                    }
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (startDate < today) {
                        return false;
                    }
                    if (startDate >= endDate) {
                        return false;
                    }
                    return true;
                },
                defaultMessage(args) {
                    const startDateStr = args.value?.toString();
                    const endDateStr = args.object.endDate?.toString();
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
function IsEndDateAfterStart(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isEndDateAfterStart',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value, args) {
                    if (!value)
                        return true;
                    const endDateStr = value.toString();
                    const startDateStr = args.object.startDate?.toString();
                    if (!startDateStr)
                        return true;
                    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                    if (!dateRegex.test(startDateStr) || !dateRegex.test(endDateStr)) {
                        return false;
                    }
                    const endDate = new Date(endDateStr + 'T00:00:00.000Z');
                    const startDate = new Date(startDateStr + 'T00:00:00.000Z');
                    if (isNaN(endDate.getTime()) || isNaN(startDate.getTime())) {
                        return false;
                    }
                    return endDate > startDate;
                },
                defaultMessage(args) {
                    return 'Ngày kết thúc phải sau ngày bắt đầu';
                }
            },
        });
    };
}
function IsNotOverlappingHoliday(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isNotOverlappingHoliday',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                async validate(value, args) {
                    if (!value)
                        return true;
                    const startDateStr = value.toString();
                    const endDateStr = args.object.endDate?.toString();
                    if (!endDateStr)
                        return true;
                    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                    if (!dateRegex.test(startDateStr) || !dateRegex.test(endDateStr)) {
                        return false;
                    }
                    const startDate = new Date(startDateStr + 'T00:00:00.000Z');
                    const endDate = new Date(endDateStr + 'T00:00:00.000Z');
                    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                        return false;
                    }
                    return true;
                },
                defaultMessage(args) {
                    return 'Kỳ nghỉ này trùng với kỳ nghỉ đã tồn tại';
                }
            },
        });
    };
}
//# sourceMappingURL=date-range.validator.js.map