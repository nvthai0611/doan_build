"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionChangeEmailTemplate = void 0;
const formatStudentList = (students) => {
    if (students.length === 1) {
        return students[0];
    }
    const last = students[students.length - 1];
    const rest = students.slice(0, -1);
    return `${rest.join(', ')} và ${last}`;
};
const sessionChangeEmailTemplate = ({ type, parentName, studentNames, className, subjectName, teacherName, originalDate, originalTime, newDate, newTime, reason, }) => {
    const greeting = `Kính gửi ${parentName},`;
    const studentLine = `Phụ huynh của ${formatStudentList(studentNames)}.`;
    const classLine = subjectName
        ? `Lớp học: ${className} (${subjectName}).`
        : `Lớp học: ${className}.`;
    const teacherLine = teacherName ? `Giáo viên phụ trách: ${teacherName}.` : '';
    if (type === 'cancelled') {
        return `
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <title>Thông báo nghỉ buổi học</title>
  </head>
  <body>
    <p>${greeting}</p>
    <p>${studentLine}</p>
    <p>${classLine}</p>
    ${teacherLine ? `<p>${teacherLine}</p>` : ''}
    <p>Buổi học dự kiến diễn ra vào <strong>${originalDate}</strong> lúc <strong>${originalTime}</strong> sẽ <strong>tạm nghỉ</strong>.</p>
    ${reason ? `<p>Lý do: ${reason}.</p>` : '<p>Lý do: Trung tâm sẽ thông báo sau.</p>'}
    <p>Thông tin buổi học tiếp theo sẽ được cập nhật trên hệ thống ngay khi có thay đổi.</p>
    <p>Trân trọng,</p>
    <p>Hệ thống QN Education</p>
  </body>
</html>
    `;
    }
    return `
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <title>Cập nhật lịch buổi học</title>
  </head>
  <body>
    <p>${greeting}</p>
    <p>${studentLine}</p>
    <p>${classLine}</p>
    ${teacherLine ? `<p>${teacherLine}</p>` : ''}
    <p>Buổi học ban đầu dự kiến vào <strong>${originalDate}</strong> lúc <strong>${originalTime}</strong> đã được <strong>điều chỉnh lịch</strong>.</p>
    <p>Thời gian mới: <strong>${newDate || originalDate}</strong> lúc <strong>${newTime || originalTime}</strong>.</p>
    ${reason ? `<p>Lý do cập nhật: ${reason}.</p>` : ''}
    <p>Rất mong quý phụ huynh và học sinh lưu ý để tham gia đúng thời gian.</p>
    <p>Trân trọng,</p>
    <p>Hệ thống QN Education</p>
  </body>
</html>
  `;
};
exports.sessionChangeEmailTemplate = sessionChangeEmailTemplate;
//# sourceMappingURL=template-session-change.js.map