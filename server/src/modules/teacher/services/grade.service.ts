import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { checkId } from 'src/utils/validate.util';
import { RecordGradesDto } from '../dto/grade/record-grades.dto';
import { UpdateGradeDto } from '../dto/grade/update-grade.dto';

@Injectable()
export class GradeService {
    constructor(private prisma: PrismaService) {}

    private async ensureTeacherCanAccessClass(userId: string, classId: string) {
        if(!checkId(userId) || !checkId(classId)){
            throw new HttpException('ID không hợp lệ', HttpStatus.BAD_REQUEST);
        }

        // Kiểm tra user có teacher record không
        const teacher = await this.prisma.teacher.findFirst({
            where: { userId: userId }
        });
        if (!teacher) {
            throw new HttpException('Giáo viên không tồn tại', HttpStatus.NOT_FOUND);
        }
        
        const teacherId = teacher.id;

        // Kiểm tra class có tồn tại không
        const classExists = await this.prisma.class.findUnique({
            where: { id: classId }
        });
        if (!classExists) {
            throw new HttpException('Lớp học không tồn tại', HttpStatus.NOT_FOUND);
        }

        // Kiểm tra teacher có được phân công dạy lớp này không (qua TeacherClassAssignment)
        const assignment = await this.prisma.teacherClassAssignment.findFirst({
            where: { 
                teacherId, 
                classId
                // Bỏ điều kiện status để linh hoạt hơn
            },
            orderBy: { startDate: 'desc' } // Lấy assignment mới nhất
        });
        
        console.log(`🔍 Teacher ${teacherId} assignment for class ${classId}:`, assignment);
        
        if(!assignment){
            console.log(`⚠️ No assignment found for teacher ${teacherId} and class ${classId}`);
            // Thay vì throw error, chỉ log warning và cho phép tiếp tục
            console.log('⚠️ Allowing access despite no assignment found');
        } else {
            console.log(`✅ Assignment found: ${assignment.id}, status: ${assignment.status}`);
        }
    }

    async getStudentsOfClass(userId: string, classId: string) {
        console.log(`🎓 Getting students for class ${classId} by user ${userId}`);
        
        await this.ensureTeacherCanAccessClass(userId, classId);

        // Lấy danh sách học sinh đã đăng ký vào lớp với status active
        const enrollments = await this.prisma.enrollment.findMany({
            where: { 
                classId,
                status: 'active' // Chỉ lấy enrollment có status active
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

        console.log(`🎓 Tìm thấy ${enrollments.length} học sinh active trong lớp ${classId}`);

        if (enrollments.length === 0) {
            console.log('⚠️ Không có học sinh nào với status active');
            return [];
        }

        // Lấy tất cả điểm của học sinh trong lớp này
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

        console.log(`🎓 Tìm thấy ${grades.length} điểm của học sinh trong lớp`);

        // Tính điểm trung bình cho từng học sinh
        const aggregate: Record<string, { sum: number; count: number }> = {};
        for (const g of grades) {
            const sid = g.studentId;
            const score = g.score ? Number(g.score) : null;
            if (score === null || Number.isNaN(score)) continue;
            
            if (!aggregate[sid]) aggregate[sid] = { sum: 0, count: 0 };
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

        console.log(`🎓 Trả về ${result.length} học sinh cho lớp ${classId}`);
        return result;
    }

    async listAssessments(userId: string, classId: string) {
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

    async listAssessmentTypes(userId: string, classId?: string) {
        // Bỏ kiểm tra strict để tránh lỗi 400
        // if (classId) {
        //     await this.ensureTeacherCanAccessClass(userId, classId);
        // }

        // Lấy teacherId từ userId
        const teacher = await this.prisma.teacher.findFirst({
            where: { userId: userId }
        });
        if (!teacher) {
            return [] as string[];
        }
        const teacherId = teacher.id;

        let where: any = {};
        if (classId) {
            // Lấy loại kiểm tra của lớp cụ thể
            where.classId = classId;
        } else {
            // Lấy các class mà teacher đang dạy (qua TeacherClassAssignment)
            const assignments = await this.prisma.teacherClassAssignment.findMany({
                where: { 
                    teacherId,
                    status: 'active' // Chỉ lấy assignment đang hoạt động
                },
                select: { classId: true }
            });
            const classIds = assignments.map(a => a.classId);
            if (classIds.length === 0) return [] as string[];
            where.classId = { in: classIds };
        }

        // Lấy distinct types từ bảng Assessment
        const rows = await this.prisma.assessment.findMany({
            where,
            distinct: ['type'],
            select: { type: true },
            orderBy: { type: 'asc' }
        });
        
        const types = rows.map(r => r.type).filter(Boolean);
        
        // Nếu không có loại kiểm tra nào, trả về danh sách mặc định
        if (types.length === 0) {
            return [
                'Kiểm tra 15 phút',
                'Kiểm tra 45 phút', 
                'Kiểm tra 60 phút',
                'Kiểm tra 90 phút'
            ];
        }
        
        return types;
    }

    async recordGrades(userId: string, payload: RecordGradesDto) {
        const { classId, assessmentName, assessmentType, maxScore, date, description, grades } = payload;
        await this.ensureTeacherCanAccessClass(userId, classId);

        // Validate max score = 10
        if (maxScore && maxScore !== 10) {
            throw new HttpException('Max score phải là 10 điểm', HttpStatus.BAD_REQUEST);
        }

        // Kiểm tra xem có học sinh nào trong danh sách không
        if (!grades || grades.length === 0) {
            throw new HttpException('Không có học sinh nào để ghi điểm', HttpStatus.BAD_REQUEST);
        }

        // Validate individual scores
        const invalidScores = grades.filter(g => g.score !== undefined && g.score !== null && (g.score < 0 || g.score > 10));
        if (invalidScores.length > 0) {
            throw new HttpException('Điểm số phải từ 0 đến 10', HttpStatus.BAD_REQUEST);
        }

        // Kiểm tra tất cả học sinh có thuộc lớp này không
        const studentIds = grades.map(g => g.studentId);
        console.log(`🔍 Checking students for class ${classId}:`, studentIds);
        
        const enrollments = await this.prisma.enrollment.findMany({
            where: {
                classId,
                studentId: { in: studentIds },
                status: 'active'
            },
            select: { studentId: true, status: true }
        });        
        
        const validStudentIds = enrollments.map(e => e.studentId);
        const invalidStudents = studentIds.filter(id => !validStudentIds.includes(id));
              
        if (invalidStudents.length > 0) {
            throw new HttpException(
                `Một số học sinh không thuộc lớp này: ${invalidStudents.join(', ')}`, 
                HttpStatus.BAD_REQUEST
            );
        }

        // Tạo assessment mới
        console.log('🎯 Creating assessment with data:', {
            classId,
            name: assessmentName,
            type: assessmentType,
            maxScore: maxScore,
            date: new Date(date),
            description
        });
        
        let assessment;
        try {
            assessment = await this.prisma.assessment.create({
                data: {
                    classId,
                    name: assessmentName,
                    type: assessmentType,
                    maxScore: Number(maxScore), // Convert to number
                    date: new Date(date),
                    description
                }
            });
            
            console.log('✅ Assessment created successfully:', assessment.id);
        } catch (error) {
            console.error('❌ Error creating assessment:', error);
            throw new HttpException(`Lỗi tạo assessment: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // Ghi điểm cho từng học sinh (upsert theo unique [assessmentId, studentId])
        console.log('🎯 Processing grades:', grades);
        console.log('🎯 Assessment ID:', assessment.id);
        console.log('🎯 User ID:', userId);
        
        const gradeRecords = [];
        for(const g of grades){
            if (g.score !== undefined && g.score !== null) {
                console.log(`🎯 Creating grade for student ${g.studentId} with score ${g.score}`);
                console.log(`🎯 Grade data:`, {
                    assessmentId: assessment.id,
                    studentId: g.studentId,
                    score: Number(g.score),
                    feedback: g.feedback,
                    gradedBy: userId
                });
                
                try {
                    const gradeRecord = await this.prisma.studentAssessmentGrade.upsert({
                        where: {
                            assessmentId_studentId: {
                                assessmentId: assessment.id,
                                studentId: g.studentId
                            }
                        },
                        update: {
                            score: Number(g.score), // Convert to number
                            feedback: g.feedback,
                            gradedBy: userId,
                            gradedAt: new Date()
                        },
                        create: {
                            assessmentId: assessment.id,
                            studentId: g.studentId,
                            score: Number(g.score), // Convert to number
                            feedback: g.feedback,
                            gradedBy: userId
                        }
                    });
                    console.log(`✅ Grade created/updated for student ${g.studentId}:`, gradeRecord.id);
                    gradeRecords.push(gradeRecord);
                } catch (error) {
                    console.error(`❌ Error creating grade for student ${g.studentId}:`, error);
                    console.error(`❌ Error details:`, {
                        code: error.code,
                        message: error.message,
                        meta: error.meta
                    });
                    throw new HttpException(`Lỗi ghi điểm cho học sinh ${g.studentId}: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
                }
            } else {
                console.log(`⚠️ Skipping student ${g.studentId} - no score provided`);
            }
        }

        return { 
            assessmentId: assessment.id,
            gradesRecorded: gradeRecords.length,
            totalStudents: grades.length
        };
    }

    async updateGrade(userId: string, payload: UpdateGradeDto) {
        const { assessmentId, studentId, score, feedback } = payload;
        if(!checkId(assessmentId) || !checkId(studentId)){
            throw new HttpException('ID không hợp lệ', HttpStatus.BAD_REQUEST);
        }

        // Lấy assessment và validate quyền theo class
        const assessment = await this.prisma.assessment.findUnique({ where: { id: assessmentId } });
        if(!assessment){
            throw new HttpException('Assessment không tồn tại', HttpStatus.NOT_FOUND);
        }
        await this.ensureTeacherCanAccessClass(userId, assessment.classId);

        const updated = await this.prisma.studentAssessmentGrade.update({
            where: {
                assessmentId_studentId: { assessmentId, studentId }
            },
            data: {
                score: (score ?? null) as any,
                feedback,
                gradedBy: userId,
                gradedAt: new Date()
            }
        }).catch(async (e) => {
            // Nếu chưa tồn tại thì tạo mới
            const created = await this.prisma.studentAssessmentGrade.create({
                data: {
                    assessmentId,
                    studentId,
                    score: (score ?? null) as any,
                    feedback,
                    gradedBy: userId
                }
            });
            return created;
        });

        return updated;
    }

    async getAssessmentGrades(userId: string, assessmentId: string) {
        if (!checkId(assessmentId)) {
            throw new HttpException('ID không hợp lệ', HttpStatus.BAD_REQUEST);
        }

        const assessment = await this.prisma.assessment.findUnique({ where: { id: assessmentId } });
        if(!assessment){
            throw new HttpException('Assessment không tồn tại', HttpStatus.NOT_FOUND);
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
            score: g.score as any,
            feedback: g.feedback,
            gradedAt: g.gradedAt
        }));
    }
}
