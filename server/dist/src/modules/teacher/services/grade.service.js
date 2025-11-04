"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
const validate_util_1 = require("../../../utils/validate.util");
let GradeService = class GradeService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async ensureTeacherCanAccessClass(userId, classId) {
        if (!(0, validate_util_1.checkId)(userId) || !(0, validate_util_1.checkId)(classId)) {
            throw new common_1.HttpException('ID không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        const teacher = await this.prisma.teacher.findFirst({
            where: { userId: userId }
        });
        if (!teacher) {
            throw new common_1.HttpException('Giáo viên không tồn tại', common_1.HttpStatus.NOT_FOUND);
        }
        const teacherId = teacher.id;
        const classExists = await this.prisma.class.findFirst({
            where: {
                id: classId,
                teacherId: teacherId
            }
        });
        console.log(`Teacher ${teacherId} access to class ${classId}:`, classExists ? 'Authorized' : 'Not authorized');
        if (!classExists) {
            console.log(`Teacher ${teacherId} is NOT assigned to class ${classId}`);
            throw new common_1.HttpException('Bạn không có quyền thao tác lớp học này', common_1.HttpStatus.FORBIDDEN);
        }
        else {
            console.log(`Teacher ${teacherId} is assigned to class ${classId}`);
        }
    }
    async getStudentsOfClass(userId, classId) {
        await this.ensureTeacherCanAccessClass(userId, classId);
        const enrollments = await this.prisma.enrollment.findMany({
            where: {
                classId,
                status: 'studying'
            },
            include: {
                student: {
                    include: {
                        user: {
                            select: { id: true, fullName: true, email: true }
                        }
                    }
                }
            },
            orderBy: { id: 'asc' }
        });
        if (enrollments.length === 0) {
            return [];
        }
        const studentIds = enrollments.map(e => e.studentId);
        const grades = await this.prisma.studentAssessmentGrade.findMany({
            where: {
                studentId: { in: studentIds },
                assessment: { classId }
            },
            select: {
                studentId: true,
                score: true,
                assessment: {
                    select: { maxScore: true }
                }
            }
        });
        const aggregate = {};
        for (const g of grades) {
            const sid = g.studentId;
            const score = g.score ? Number(g.score) : null;
            if (score === null || Number.isNaN(score))
                continue;
            if (!aggregate[sid])
                aggregate[sid] = { sum: 0, count: 0 };
            aggregate[sid].sum += score;
            aggregate[sid].count += 1;
        }
        const result = enrollments.map(e => {
            const agg = aggregate[e.studentId];
            const currentGrade = agg && agg.count > 0 ? Number((agg.sum / agg.count).toFixed(2)) : null;
            return {
                studentId: e.studentId,
                fullName: e.student.user.fullName,
                email: e.student.user.email,
                studentCode: e.student.studentCode,
                currentGrade,
            };
        });
        return result;
    }
    async listAssessments(userId, classId) {
        await this.ensureTeacherCanAccessClass(userId, classId);
        const assessments = await this.prisma.assessment.findMany({
            where: { classId },
            include: {
                grades: {
                    include: {
                        student: {
                            include: {
                                user: { select: { fullName: true, email: true } }
                            }
                        }
                    }
                },
                class: {
                    select: {
                        name: true,
                        subject: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: { date: 'desc' }
        });
        return assessments;
    }
    async listAssessmentTypes(userId, classId) {
        try {
            const setting = await this.prisma.systemSetting.findUnique({
                where: { key: 'exam_types' }
            });
            if (setting && setting.value) {
                const valueData = setting.value;
                if (valueData.items && Array.isArray(valueData.items)) {
                    const examTypes = valueData.items
                        .filter((item) => item.isActive === true)
                        .map((item) => item.name)
                        .filter(Boolean);
                    return examTypes;
                }
            }
        }
        catch (error) {
            console.error(' Error fetching exam types from system settings:', error);
        }
        return [];
    }
    async getExamTypesConfig(userId) {
        try {
            const setting = await this.prisma.systemSetting.findUnique({
                where: { key: 'exam_types' }
            });
            if (setting && setting.value) {
                const valueData = setting.value;
                if (valueData.items && Array.isArray(valueData.items)) {
                    const activeItems = valueData.items.filter((item) => item.isActive === true);
                    return activeItems;
                }
            }
        }
        catch (error) {
            console.error('Error fetching exam types config:', error);
        }
        return [];
    }
    async recordGrades(userId, payload) {
        const { classId, assessmentName, assessmentType, maxScore, date, description, grades } = payload;
        await this.ensureTeacherCanAccessClass(userId, classId);
        let finalMaxScore = maxScore;
        if (!finalMaxScore) {
            try {
                const setting = await this.prisma.systemSetting.findUnique({
                    where: { key: 'exam_types' }
                });
                if (setting && setting.value) {
                    const valueData = setting.value;
                    if (valueData.items && Array.isArray(valueData.items)) {
                        const examTypeItem = valueData.items.find((item) => item.name === assessmentType && item.isActive === true);
                        if (examTypeItem && examTypeItem.maxScore) {
                            finalMaxScore = examTypeItem.maxScore;
                        }
                    }
                }
            }
            catch (error) {
                console.error('Error fetching maxScore from system settings:', error);
            }
        }
        if (!finalMaxScore) {
            finalMaxScore = 10;
        }
        if (date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selectedDate = new Date(date);
            selectedDate.setHours(0, 0, 0, 0);
            if (selectedDate.getTime() > today.getTime()) {
                throw new common_1.HttpException('Ngày kiểm tra không được lớn hơn ngày hôm nay', common_1.HttpStatus.BAD_REQUEST);
            }
        }
        if (!grades || grades.length === 0) {
            throw new common_1.HttpException('Không có học sinh nào để ghi điểm', common_1.HttpStatus.BAD_REQUEST);
        }
        const invalidScores = grades.filter(g => g.score !== undefined && g.score !== null && (g.score < 0 || g.score > finalMaxScore));
        if (invalidScores.length > 0) {
            throw new common_1.HttpException(`Điểm số phải từ 0 đến ${finalMaxScore}`, common_1.HttpStatus.BAD_REQUEST);
        }
        const studentIds = grades.map(g => g.studentId);
        const enrollments = await this.prisma.enrollment.findMany({
            where: {
                classId,
                studentId: { in: studentIds },
                status: 'studying'
            },
            select: { studentId: true, status: true }
        });
        const allEnrollments = await this.prisma.enrollment.findMany({
            where: {
                classId,
                status: 'studying'
            },
            select: { studentId: true, status: true }
        });
        const validStudentIds = enrollments.map(e => e.studentId);
        const invalidStudents = studentIds.filter(id => !validStudentIds.includes(id));
        if (invalidStudents.length > 0) {
            throw new common_1.HttpException(`Một số học sinh không thuộc lớp này: ${invalidStudents.join(', ')}`, common_1.HttpStatus.BAD_REQUEST);
        }
        let assessment;
        try {
            assessment = await this.prisma.assessment.findFirst({
                where: {
                    classId,
                    name: assessmentName,
                    type: assessmentType,
                    date: new Date(date)
                }
            });
            if (!assessment) {
                assessment = await this.prisma.assessment.create({
                    data: {
                        classId,
                        name: assessmentName,
                        type: assessmentType,
                        maxScore: Number(finalMaxScore),
                        date: new Date(date),
                        description
                    }
                });
                console.log('Assessment created successfully:', assessment.id);
            }
            else {
                console.log('Reusing existing assessment:', assessment.id);
            }
        }
        catch (error) {
            throw new common_1.HttpException(`Lỗi tạo assessment: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const gradeRecords = [];
        for (const g of grades) {
            if (g.score !== undefined && g.score !== null) {
                try {
                    const gradeRecord = await this.prisma.studentAssessmentGrade.upsert({
                        where: {
                            assessmentId_studentId: {
                                assessmentId: assessment.id,
                                studentId: g.studentId
                            }
                        },
                        update: {
                            score: Number(g.score),
                            feedback: g.feedback,
                            gradedBy: userId,
                            gradedAt: new Date()
                        },
                        create: {
                            assessmentId: assessment.id,
                            studentId: g.studentId,
                            score: Number(g.score),
                            feedback: g.feedback,
                            gradedBy: userId
                        }
                    });
                    gradeRecords.push(gradeRecord);
                }
                catch (error) {
                    throw new common_1.HttpException(`Lỗi ghi điểm cho học sinh ${g.studentId}: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
            else {
                console.log(`Skipping student ${g.studentId} - no score provided`);
            }
        }
        return {
            assessmentId: assessment.id,
            gradesRecorded: gradeRecords.length,
            totalStudents: grades.length
        };
    }
    async updateGrade(userId, payload) {
        const { assessmentId, studentId, score, feedback } = payload;
        if (!(0, validate_util_1.checkId)(assessmentId) || !(0, validate_util_1.checkId)(studentId)) {
            throw new common_1.HttpException('ID không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        const assessment = await this.prisma.assessment.findUnique({ where: { id: assessmentId } });
        if (!assessment) {
            throw new common_1.HttpException('Assessment không tồn tại', common_1.HttpStatus.NOT_FOUND);
        }
        await this.ensureTeacherCanAccessClass(userId, assessment.classId);
        const updated = await this.prisma.studentAssessmentGrade.update({
            where: {
                assessmentId_studentId: { assessmentId, studentId }
            },
            data: {
                score: (score ?? null),
                feedback,
                gradedBy: userId,
                gradedAt: new Date()
            }
        }).catch(async (e) => {
            const created = await this.prisma.studentAssessmentGrade.create({
                data: {
                    assessmentId,
                    studentId,
                    score: (score ?? null),
                    feedback,
                    gradedBy: userId
                }
            });
            return created;
        });
        return updated;
    }
    async getAssessmentGrades(userId, assessmentId) {
        if (!(0, validate_util_1.checkId)(assessmentId)) {
            throw new common_1.HttpException('ID không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        const assessment = await this.prisma.assessment.findUnique({ where: { id: assessmentId } });
        if (!assessment) {
            throw new common_1.HttpException('Assessment không tồn tại', common_1.HttpStatus.NOT_FOUND);
        }
        await this.ensureTeacherCanAccessClass(userId, assessment.classId);
        const grades = await this.prisma.studentAssessmentGrade.findMany({
            where: { assessmentId },
            include: {
                student: {
                    include: {
                        user: { select: { fullName: true } }
                    }
                }
            },
            orderBy: { id: 'asc' }
        });
        return grades.map(g => ({
            studentId: g.studentId,
            fullName: g.student.user.fullName,
            score: g.score,
            feedback: g.feedback,
            gradedAt: g.gradedAt
        }));
    }
    async getTeacherIdFromUserId(userId) {
        if (!(0, validate_util_1.checkId)(userId)) {
            return null;
        }
        const teacher = await this.prisma.teacher.findUnique({
            where: { userId: userId }
        });
        return teacher ? teacher.id : null;
    }
    async getGradeViewData(teacherId, filters) {
        if (!teacherId || !(0, validate_util_1.checkId)(teacherId)) {
            return {
                students: [],
                subjectStats: [],
                totalStudents: 0,
                overallAverage: 0,
                passRate: 0
            };
        }
        const classes = await this.prisma.class.findMany({
            where: {
                teacherId: teacherId,
                status: 'active'
            },
            include: {
                subject: true,
                enrollments: {
                    where: { status: 'studying' },
                    include: {
                        student: {
                            include: {
                                user: true
                            }
                        }
                    }
                }
            }
        });
        const classIds = classes.map(c => c.id);
        if (classIds.length === 0) {
            return {
                students: [],
                subjectStats: [],
                totalStudents: 0,
                overallAverage: 0,
                passRate: 0
            };
        }
        const assessments = await this.prisma.assessment.findMany({
            where: { classId: { in: classIds } },
            include: {
                grades: {
                    include: {
                        student: {
                            include: {
                                user: true
                            }
                        }
                    }
                },
                class: {
                    include: {
                        subject: true
                    }
                }
            },
            orderBy: { date: 'desc' }
        });
        if (assessments.length === 0) {
            const allStudents = new Set();
            classes.forEach(classItem => {
                classItem.enrollments.forEach(enrollment => {
                    if (enrollment.student && enrollment.student.user) {
                        allStudents.add(JSON.stringify({
                            id: enrollment.student.id,
                            studentId: enrollment.student.id,
                            studentName: enrollment.student.user.fullName || 'N/A',
                            studentCode: enrollment.student.studentCode || 'N/A',
                            avatar: enrollment.student.user.avatar,
                            subject: classItem.subject.name,
                            class: classItem.name,
                            grades: [],
                            historicalGrades: [],
                            average: 0,
                            previousAverage: 0,
                            trend: 'stable',
                            trendValue: 0
                        }));
                    }
                });
            });
            const students = Array.from(allStudents).map(s => JSON.parse(s));
            return {
                students,
                subjectStats: await this.getSubjectStats(teacherId),
                totalStudents: students.length,
                overallAverage: 0,
                passRate: 0
            };
        }
        const studentMap = new Map();
        const activeStudentsByClass = new Map();
        classes.forEach(c => {
            const set = new Set();
            (c.enrollments || []).forEach((en) => {
                if (en && en.studentId)
                    set.add(en.studentId);
            });
            activeStudentsByClass.set(c.id, set);
        });
        assessments.forEach(assessment => {
            const classId = assessment.classId || assessment.class?.id;
            const activeSet = classId ? activeStudentsByClass.get(classId) : undefined;
            assessment.grades.forEach(grade => {
                const studentId = grade.studentId;
                if (activeSet && !activeSet.has(studentId))
                    return;
                if (!studentMap.has(studentId)) {
                    studentMap.set(studentId, {
                        id: studentId,
                        studentId: studentId,
                        studentName: grade.student.user.fullName || 'N/A',
                        studentCode: grade.student.studentCode || 'N/A',
                        avatar: grade.student.user.avatar,
                        subject: assessment.class.subject.name,
                        class: assessment.class.name,
                        grades: [],
                        historicalGrades: [],
                        average: 0,
                        previousAverage: 0,
                        trend: 'stable',
                        trendValue: 0
                    });
                }
                const student = studentMap.get(studentId);
                student.grades.push({
                    type: assessment.type,
                    testName: assessment.name,
                    score: Number(grade.score) || 0,
                    date: assessment.date.toISOString().split('T')[0],
                    weight: this.getWeightByType(assessment.type),
                    assessmentId: assessment.id
                });
            });
        });
        const students = Array.from(studentMap.values()).map(student => {
            if (student.grades.length > 0) {
                const totalWeight = student.grades.reduce((sum, g) => sum + g.weight, 0);
                const weightedSum = student.grades.reduce((sum, g) => sum + g.score * g.weight, 0);
                student.average = Number((weightedSum / totalWeight).toFixed(1));
            }
            return student;
        });
        let filteredStudents = students;
        if (filters.searchTerm) {
            const searchTerm = filters.searchTerm.toLowerCase();
            filteredStudents = students.filter(s => s.studentName.toLowerCase().includes(searchTerm) ||
                s.studentCode.toLowerCase().includes(searchTerm));
        }
        if (filters.subjectFilter && filters.subjectFilter !== 'all') {
            filteredStudents = filteredStudents.filter(s => s.subject === filters.subjectFilter);
        }
        if (filters.classFilter && filters.classFilter !== 'all') {
            filteredStudents = filteredStudents.filter(s => s.class === filters.classFilter);
        }
        const subjectStats = await this.getSubjectStats(teacherId);
        const totalStudents = filteredStudents.length;
        const overallAverage = totalStudents > 0
            ? Number((filteredStudents.reduce((sum, s) => sum + s.average, 0) / totalStudents).toFixed(1))
            : 0;
        const passRate = totalStudents > 0
            ? Math.round((filteredStudents.filter(s => s.average >= 5).length / totalStudents) * 100)
            : 0;
        return {
            students: filteredStudents,
            subjectStats,
            totalStudents,
            overallAverage,
            passRate
        };
    }
    async getStudentGrades(teacherId, filters) {
        const gradeViewData = await this.getGradeViewData(teacherId, filters);
        return gradeViewData.students;
    }
    async getSubjectStats(teacherId) {
        const classes = await this.prisma.class.findMany({
            where: {
                teacherId: teacherId,
                status: 'active'
            },
            include: {
                subject: true,
                enrollments: {
                    where: { status: 'studying' },
                    include: {
                        student: {
                            include: { user: true }
                        }
                    }
                }
            }
        });
        const classIds = classes.map(c => c.id);
        const assessments = await this.prisma.assessment.findMany({
            where: { classId: { in: classIds } },
            include: {
                grades: {
                    include: {
                        student: {
                            include: {
                                user: true
                            }
                        }
                    }
                },
                class: {
                    include: {
                        subject: true
                    }
                }
            }
        });
        const subjectMap = new Map();
        const activeStudentsByClass = new Map();
        classes.forEach(c => {
            const set = new Set();
            (c.enrollments || []).forEach((en) => {
                if (en && en.studentId)
                    set.add(en.studentId);
            });
            activeStudentsByClass.set(c.id, set);
        });
        assessments.forEach(assessment => {
            const subjectName = assessment.class.subject.name;
            if (!subjectMap.has(subjectName)) {
                subjectMap.set(subjectName, {
                    subject: subjectName,
                    totalStudents: 0,
                    grades: [],
                    averageGrade: 0,
                    previousAverage: 0,
                    passRate: 0,
                    trend: 'stable'
                });
            }
            const subject = subjectMap.get(subjectName);
            const activeSet = activeStudentsByClass.get(assessment.classId || assessment.class?.id);
            assessment.grades.forEach(grade => {
                if (activeSet && !activeSet.has(grade.studentId))
                    return;
                subject.grades.push(Number(grade.score) || 0);
            });
        });
        const subjectStats = Array.from(subjectMap.values()).map(subject => {
            const uniqueStudents = new Set();
            assessments.forEach(assessment => {
                if (assessment.class.subject.name === subject.subject) {
                    assessment.grades.forEach(grade => {
                        uniqueStudents.add(grade.studentId);
                    });
                }
            });
            subject.totalStudents = uniqueStudents.size;
            subject.averageGrade = subject.grades.length > 0
                ? Number((subject.grades.reduce((sum, g) => sum + g, 0) / subject.grades.length).toFixed(1))
                : 0;
            subject.passRate = subject.grades.length > 0
                ? Math.round((subject.grades.filter((g) => g >= 5).length / subject.grades.length) * 100)
                : 0;
            return subject;
        });
        return subjectStats;
    }
    async updateStudentGrade(teacherId, payload) {
        const { studentId, assessmentId, score } = payload;
        if (!teacherId || !(0, validate_util_1.checkId)(teacherId)) {
            throw new common_1.HttpException('Teacher ID không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!(0, validate_util_1.checkId)(studentId) || !(0, validate_util_1.checkId)(assessmentId)) {
            throw new common_1.HttpException('ID không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
        }
        if (score < 0 || score > 10) {
            throw new common_1.HttpException('Điểm số phải từ 0 đến 10', common_1.HttpStatus.BAD_REQUEST);
        }
        const assessment = await this.prisma.assessment.findUnique({
            where: { id: assessmentId },
            include: { class: true }
        });
        if (!assessment) {
            throw new common_1.HttpException('Assessment không tồn tại', common_1.HttpStatus.NOT_FOUND);
        }
        const teacher = await this.prisma.teacher.findUnique({
            where: { id: teacherId },
            select: { userId: true }
        });
        if (!teacher) {
            throw new common_1.HttpException('Giáo viên không tồn tại', common_1.HttpStatus.NOT_FOUND);
        }
        await this.ensureTeacherCanAccessClass(teacher.userId, assessment.classId);
        const enrollment = await this.prisma.enrollment.findFirst({
            where: { classId: assessment.classId, studentId, status: 'studying' }
        });
        if (!enrollment) {
            throw new common_1.HttpException('Học sinh không thuộc lớp này hoặc không ở trạng thái đang theo học', common_1.HttpStatus.BAD_REQUEST);
        }
        await this.prisma.studentAssessmentGrade.upsert({
            where: {
                assessmentId_studentId: {
                    assessmentId,
                    studentId
                }
            },
            update: {
                score: score,
                gradedAt: new Date()
            },
            create: {
                assessmentId,
                studentId,
                score: score,
                gradedBy: teacher.userId,
                gradedAt: new Date()
            }
        });
    }
    getWeightByType(type) {
        const t = (type || '').toLowerCase();
        if (t.includes('15'))
            return 1;
        if (t.includes('45'))
            return 2;
        if (t.includes('60'))
            return 2;
        if (t.includes('90'))
            return 3;
        if (t.includes('giữa kỳ'))
            return 2;
        if (t.includes('cuối kỳ'))
            return 3;
        return 1;
    }
};
exports.GradeService = GradeService;
exports.GradeService = GradeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GradeService);
//# sourceMappingURL=grade.service.js.map