"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSessionStatus = calculateSessionStatus;
exports.getSessionStatus = getSessionStatus;
exports.shouldUpdateSessionStatus = shouldUpdateSessionStatus;
exports.getSessionTimeInfo = getSessionTimeInfo;
function calculateSessionStatus(session) {
    const now = new Date();
    const sessionDate = new Date(session.sessionDate);
    const [startHour, startMin] = session.startTime.split(':').map(Number);
    const [endHour, endMin] = session.endTime.split(':').map(Number);
    const sessionStartDateTime = new Date(sessionDate);
    sessionStartDateTime.setHours(startHour, startMin, 0, 0);
    const sessionEndDateTime = new Date(sessionDate);
    sessionEndDateTime.setHours(endHour, endMin, 0, 0);
    if (now < sessionStartDateTime) {
        return 'scheduled';
    }
    else if (now >= sessionStartDateTime && now <= sessionEndDateTime) {
        return 'happening';
    }
    else {
        return 'completed';
    }
}
function getSessionStatus(session, overrideStatus) {
    if (overrideStatus === 'cancelled') {
        return 'cancelled';
    }
    const calculatedStatus = calculateSessionStatus(session);
    if (session.status === 'cancelled') {
        return 'cancelled';
    }
    if (calculatedStatus === 'completed') {
        if (overrideStatus === 'no_attendance') {
            return 'incomplete';
        }
        return 'completed';
    }
    return calculatedStatus;
}
function shouldUpdateSessionStatus(session) {
    const calculatedStatus = calculateSessionStatus(session);
    return session.status !== calculatedStatus && session.status !== 'cancelled';
}
function getSessionTimeInfo(session) {
    const now = new Date();
    const sessionDate = new Date(session.sessionDate);
    const [startHour, startMin] = session.startTime.split(':').map(Number);
    const [endHour, endMin] = session.endTime.split(':').map(Number);
    const sessionStartDateTime = new Date(sessionDate);
    sessionStartDateTime.setHours(startHour, startMin, 0, 0);
    const sessionEndDateTime = new Date(sessionDate);
    sessionEndDateTime.setHours(endHour, endMin, 0, 0);
    return {
        now,
        sessionStartDateTime,
        sessionEndDateTime,
        isBeforeSession: now < sessionStartDateTime,
        isDuringSession: now >= sessionStartDateTime && now <= sessionEndDateTime,
        isAfterSession: now > sessionEndDateTime,
        timeUntilStart: sessionStartDateTime.getTime() - now.getTime(),
        timeUntilEnd: sessionEndDateTime.getTime() - now.getTime(),
        timeSinceEnd: now.getTime() - sessionEndDateTime.getTime()
    };
}
//# sourceMappingURL=session-status.util.js.map