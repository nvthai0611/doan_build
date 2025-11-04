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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradesController = exports.AcademicTrackingController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const academic_tracking_service_1 = require("../services/academic-tracking.service");
let AcademicTrackingController = class AcademicTrackingController {
};
exports.AcademicTrackingController = AcademicTrackingController;
exports.AcademicTrackingController = AcademicTrackingController = __decorate([
    (0, common_1.Controller)('academic-tracking')
], AcademicTrackingController);
let GradesController = class GradesController {
    constructor(academicTrackingService) {
        this.academicTrackingService = academicTrackingService;
    }
    async getClasses(req) {
        const studentId = req.user?.studentId;
        const rows = await this.academicTrackingService["prisma"].$queryRawUnsafe(`
      SELECT DISTINCT c.id as class_id, c.name as class_name, c.academic_year, s.name as subject_name
      FROM enrollments e
      JOIN classes c ON c.id = e.class_id
      JOIN subjects s ON s.id = c.subject_id
      WHERE e.student_id = $1::uuid
      AND c.status = 'active'
      ORDER BY c.name ASC
      `, studentId || null);
        const classes = rows.map(r => ({ id: r.class_id, name: r.class_name, academicYear: r.academic_year, subjectName: r.subject_name }));
        return { data: classes, message: 'Lấy danh sách lớp thành công' };
    }
    async getTerms(req, academicYear) {
        const studentId = req.user?.studentId;
        const rows = await this.academicTrackingService["prisma"].$queryRawUnsafe(`
      SELECT DISTINCT e.semester as term
      FROM enrollments e
      JOIN classes c ON c.id = e.class_id
      WHERE e.student_id = $1::uuid
        AND ($2::text IS NULL OR c.academic_year = $2::text)
        AND e.semester IS NOT NULL
      ORDER BY term ASC
      `, studentId || null, academicYear || null);
        const terms = rows.map(r => r.term).filter(Boolean);
        return { data: terms, message: 'Lấy danh sách học kỳ thành công' };
    }
    async getTranscript(req, classId, testType, academicYear, term, subjectId) {
        const studentId = req.user?.studentId;
        let normalizedSemester = term || undefined;
        if (term && /\d{4}-[12]/.test(term)) {
            const part = term.split('-')[1];
            normalizedSemester = part === '1' ? 'Học kỳ 1' : 'Học kỳ 2';
        }
        let dateStart;
        let dateEnd;
        if (academicYear && (normalizedSemester === 'Học kỳ 1' || normalizedSemester === 'Học kỳ 2')) {
            const [y1, y2] = academicYear.split('-').map((x) => parseInt(x, 10));
            if (normalizedSemester === 'Học kỳ 1') {
                dateStart = `${y1}-07-01`;
                dateEnd = `${y1}-12-31`;
            }
            else {
                dateStart = `${y2}-01-01`;
                dateEnd = `${y2}-06-30`;
            }
        }
        const data = await this.academicTrackingService.getTranscript(studentId, {
            classId,
            testType,
            academicYear,
            term: normalizedSemester,
            subjectId,
            dateStart,
            dateEnd,
        });
        return { data, message: 'Lấy bảng điểm thành công' };
    }
    async getSubjects(req, academicYear, term) {
        const studentId = req.user?.studentId;
        const rows = await this.academicTrackingService["prisma"].$queryRawUnsafe(`
      SELECT DISTINCT s.id as subject_id, s.name as subject_name
      FROM enrollments e
      JOIN classes c ON c.id = e.class_id
      JOIN subjects s ON s.id = c.subject_id
      WHERE e.student_id = $1::uuid
        AND ($2::text IS NULL OR c.academic_year = $2::text)
        AND ($3::text IS NULL OR e.semester = $3::text)
      ORDER BY s.name ASC
      `, studentId || null, academicYear || null, term || null);
        const subjects = rows.map(r => ({ id: r.subject_id, name: r.subject_name }));
        return { data: subjects, message: 'Lấy danh sách môn học thành công' };
    }
    async getTestTypes(req, classId) {
        const studentId = req.user?.studentId;
        const rows = await this.academicTrackingService["prisma"].$queryRawUnsafe(`
      SELECT DISTINCT a.type
      FROM student_assessment_grades sag
      JOIN assessments a ON a.id = sag.assessment_id
      JOIN classes c ON c.id = a.class_id
      JOIN enrollments e ON e.class_id = c.id AND e.student_id = sag.student_id
      WHERE sag.student_id = $1::uuid
        AND ($2::uuid IS NULL OR c.id = $2::uuid)
      ORDER BY a.type ASC
      `, studentId || null, classId || null);
        const types = rows.map(r => r.type).filter(Boolean);
        return { data: types, message: 'Lấy danh sách loại kiểm tra thành công' };
    }
    async getOverview(req) {
        const studentId = req.user?.studentId;
        const data = await this.academicTrackingService.getOverview(studentId);
        return { data, message: 'Lấy thống kê tổng quan thành công' };
    }
};
exports.GradesController = GradesController;
__decorate([
    (0, common_1.Get)('classes'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GradesController.prototype, "getClasses", null);
__decorate([
    (0, common_1.Get)('terms'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('academicYear')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GradesController.prototype, "getTerms", null);
__decorate([
    (0, common_1.Get)('transcript'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('classId')),
    __param(2, (0, common_1.Query)('testType')),
    __param(3, (0, common_1.Query)('academicYear')),
    __param(4, (0, common_1.Query)('term')),
    __param(5, (0, common_1.Query)('subjectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], GradesController.prototype, "getTranscript", null);
__decorate([
    (0, common_1.Get)('subjects'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('academicYear')),
    __param(2, (0, common_1.Query)('term')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], GradesController.prototype, "getSubjects", null);
__decorate([
    (0, common_1.Get)('test-types'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('classId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GradesController.prototype, "getTestTypes", null);
__decorate([
    (0, common_1.Get)('overview'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GradesController.prototype, "getOverview", null);
exports.GradesController = GradesController = __decorate([
    (0, common_1.Controller)('grades'),
    __metadata("design:paramtypes", [academic_tracking_service_1.AcademicTrackingService])
], GradesController);
//# sourceMappingURL=academic-tracking.controller.js.map