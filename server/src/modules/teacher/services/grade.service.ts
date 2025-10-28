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

        // Kiểm tra class có tồn tại và teacher có được phân công dạy lớp này không
        const classExists = await this.prisma.class.findFirst({
            where: { 
                id: classId,
                teacherId: teacherId // Kiểm tra teacher có được phân công dạy lớp này không
            }
        });
        
        console.log(`🔍 Teacher ${teacherId} access to class ${classId}:`, classExists ? 'Authorized' : 'Not authorized');
        
        if (!classExists) {
            console.log(`⛔ Teacher ${teacherId} is NOT assigned to class ${classId}`);
            throw new HttpException('Bạn không có quyền thao tác lớp học này', HttpStatus.FORBIDDEN);
        } else {
            console.log(`✅ Teacher ${teacherId} is assigned to class ${classId}`);
        }
    }

    async getStudentsOfClass(userId: string, classId: string) {
        console.log(`🎓 Getting students for class ${classId} by user ${userId}`);
        
        await this.ensureTeacherCanAccessClass(userId, classId);

        // Lấy danh sách học sinh đã đăng ký vào lớp với trạng thái 'studying' (đang theo học)
        const enrollments = await this.prisma.enrollment.findMany({
            where: { 
                classId,
                status: 'studying' // Chỉ lấy enrollment có status studying (đang theo học)
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

    console.log(`🎓 Tìm thấy ${enrollments.length} học sinh đang theo học trong lớp ${classId}`);

        if (enrollments.length === 0) {
            console.log('⚠️ Không có học sinh đang theo học (studying)');
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
        // Lấy loại kiểm tra từ SystemSetting với key 'exam_types'
        try {
            const setting = await this.prisma.systemSetting.findUnique({
                where: { key: 'exam_types' }
            });

            if (setting && setting.value) {
                const valueData = setting.value as any;
                
                // Lấy danh sách items từ value.items
                if (valueData.items && Array.isArray(valueData.items)) {
                    // Lọc chỉ lấy các loại kiểm tra active và extract tên
                    const examTypes = valueData.items
                        .filter((item: any) => item.isActive === true)
                        .map((item: any) => item.name)
                        .filter(Boolean);
                    
                    console.log('📚 Active exam types from system settings:', examTypes);
                    return examTypes as string[];
                }
            }
        } catch (error) {
            console.error('❌ Error fetching exam types from system settings:', error);
        }

        // Nếu không có trong system settings, trả về mảng rỗng
        console.log('⚠️ No exam types configured in system settings');
        return [];
    }

    async getExamTypesConfig(userId: string) {
        // Lấy cấu hình đầy đủ của exam types từ SystemSetting
        try {
            const setting = await this.prisma.systemSetting.findUnique({
                where: { key: 'exam_types' }
            });

            if (setting && setting.value) {
                const valueData = setting.value as any;
                
                if (valueData.items && Array.isArray(valueData.items)) {
                    // Trả về toàn bộ config của items (bao gồm name, maxScore, description, isActive)
                    const activeItems = valueData.items.filter((item: any) => item.isActive === true);
                    console.log('📚 Exam types config from system settings:', activeItems);
                    return activeItems;
                }
            }
        } catch (error) {
            console.error('❌ Error fetching exam types config:', error);
        }

        return [];
    }

    async recordGrades(userId: string, payload: RecordGradesDto) {
        const { classId, assessmentName, assessmentType, maxScore, date, description, grades } = payload;
        await this.ensureTeacherCanAccessClass(userId, classId);

        // Lấy maxScore từ SystemSetting nếu không được cung cấp
        let finalMaxScore = maxScore;
        if (!finalMaxScore) {
            try {
                const setting = await this.prisma.systemSetting.findUnique({
                    where: { key: 'exam_types' }
                });

                if (setting && setting.value) {
                    const valueData = setting.value as any;
                    if (valueData.items && Array.isArray(valueData.items)) {
                        const examTypeItem = valueData.items.find((item: any) => 
                            item.name === assessmentType && item.isActive === true
                        );
                        if (examTypeItem && examTypeItem.maxScore) {
                            finalMaxScore = examTypeItem.maxScore;
                            console.log(`📚 Using maxScore ${finalMaxScore} from system settings for exam type: ${assessmentType}`);
                        }
                    }
                }
            } catch (error) {
                console.error('❌ Error fetching maxScore from system settings:', error);
            }
        }

        // Nếu vẫn không có maxScore, mặc định là 10
        if (!finalMaxScore) {
            finalMaxScore = 10;
            console.log('⚠️ No maxScore found, using default: 10');
        }

        // Validate date not in the future (server-side guard)
        if (date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selectedDate = new Date(date);
            selectedDate.setHours(0, 0, 0, 0);
            if (selectedDate.getTime() > today.getTime()) {
                throw new HttpException('Ngày kiểm tra không được lớn hơn ngày hôm nay', HttpStatus.BAD_REQUEST);
            }
        }

        // Kiểm tra xem có học sinh nào trong danh sách không
        if (!grades || grades.length === 0) {
            throw new HttpException('Không có học sinh nào để ghi điểm', HttpStatus.BAD_REQUEST);
        }

        // Validate individual scores dựa trên finalMaxScore
        const invalidScores = grades.filter(g => 
            g.score !== undefined && g.score !== null && (g.score < 0 || g.score > finalMaxScore)
        );
        if (invalidScores.length > 0) {
            throw new HttpException(`Điểm số phải từ 0 đến ${finalMaxScore}`, HttpStatus.BAD_REQUEST);
        }

        // Kiểm tra tất cả học sinh có thuộc lớp này không
        const studentIds = grades.map(g => g.studentId);
        console.log(`🔍 Checking students for class ${classId}:`, studentIds);
        
        const enrollments = await this.prisma.enrollment.findMany({
            where: {
                classId,
                studentId: { in: studentIds },
                status: 'studying'
            },
            select: { studentId: true, status: true }
        });
        
        console.log(`🔍 Found enrollments:`, enrollments);
        
        // Kiểm tra tất cả enrollments của class này (không filter theo studentIds)
        const allEnrollments = await this.prisma.enrollment.findMany({
            where: {
                classId,
                status: 'studying'
            },
            select: { studentId: true, status: true }
        });
        
        console.log(`🔍 All active enrollments for class ${classId}:`, allEnrollments);
        
        const validStudentIds = enrollments.map(e => e.studentId);
        const invalidStudents = studentIds.filter(id => !validStudentIds.includes(id));
        
        console.log(`🔍 Valid student IDs:`, validStudentIds);
        console.log(`🔍 Invalid student IDs:`, invalidStudents);
        
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
            maxScore: finalMaxScore,
            date: new Date(date),
            description
        });
        
        let assessment;
        try {
            // Reuse existing assessment if same class+name+type+date exists
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
                        maxScore: Number(finalMaxScore), // Sử dụng finalMaxScore từ SystemSetting
                        date: new Date(date),
                        description
                    }
                });
                console.log('✅ Assessment created successfully:', assessment.id);
            } else {
                console.log('ℹ️ Reusing existing assessment:', assessment.id);
            }
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

    async getTeacherIdFromUserId(userId: string): Promise<string | null> {
        console.log('🔍 Getting teacherId from userId:', userId);
        
        if (!checkId(userId)) {
            console.log('❌ Invalid userId');
            return null;
        }

        const teacher = await this.prisma.teacher.findUnique({
            where: { userId: userId }
        });

        console.log('👨‍🏫 Teacher found:', teacher ? teacher.id : 'null');
        return teacher ? teacher.id : null;
    }

    async getGradeViewData(teacherId: string, filters: any) {
        console.log('📚 getGradeViewData called with teacherId:', teacherId);
        
        if (!teacherId || !checkId(teacherId)) {
            console.log('❌ Invalid teacherId:', teacherId);
            return {
                students: [],
                subjectStats: [],
                totalStudents: 0,
                overallAverage: 0,
                passRate: 0
            };
        }

        // Lấy tất cả lớp học mà giáo viên đang dạy và đang active,
        // và chỉ include enrollments có trạng thái 'active'
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
        
        console.log('📚 Found classes:', classes.length);
        console.log('📚 Class IDs:', classIds);
        
        if (classIds.length === 0) {
            console.log('⚠️ No classes found for teacher');
            return {
                students: [],
                subjectStats: [],
                totalStudents: 0,
                overallAverage: 0,
                passRate: 0
            };
        }
        
        // Lấy tất cả assessments của các lớp active này
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

        console.log('📚 Found assessments:', assessments.length);
        
        // Nếu không có assessments, thử lấy danh sách học sinh từ enrollments
        if (assessments.length === 0) {
            console.log('⚠️ No assessments found, trying to get students from enrollments');
            
            // Lấy tất cả học sinh từ các lớp
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
                            trend: 'stable' as const,
                            trendValue: 0
                        }));
                    }
                });
            });
            
            const students = Array.from(allStudents).map(s => JSON.parse(s as string));
            console.log('📚 Found students from enrollments:', students.length);
            
            return {
                students,
                subjectStats: await this.getSubjectStats(teacherId),
                totalStudents: students.length,
                overallAverage: 0,
                passRate: 0
            };
        }
        
        // Xử lý dữ liệu để tạo StudentGradeDetail
        const studentMap = new Map();

        // Build a map of active studentIds per class from enrollments
        const activeStudentsByClass = new Map<string, Set<string>>();
        classes.forEach(c => {
            const set = new Set<string>();
            (c.enrollments || []).forEach((en: any) => {
                if (en && en.studentId) set.add(en.studentId);
            });
            activeStudentsByClass.set(c.id, set);
        });

        assessments.forEach(assessment => {
            const classId = assessment.classId || assessment.class?.id;
            const activeSet = classId ? activeStudentsByClass.get(classId) : undefined;
            assessment.grades.forEach(grade => {
                const studentId = grade.studentId;

                // skip grades for students who are not active in this class
                if (activeSet && !activeSet.has(studentId)) return;

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
                        trend: 'stable' as const,
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

        // Tính điểm trung bình cho mỗi học sinh
        const students = Array.from(studentMap.values()).map(student => {
            if (student.grades.length > 0) {
                const totalWeight = student.grades.reduce((sum: number, g: any) => sum + g.weight, 0);
                const weightedSum = student.grades.reduce((sum: number, g: any) => sum + g.score * g.weight, 0);
                student.average = Number((weightedSum / totalWeight).toFixed(1));
            }
            return student;
        });

        // Lọc theo filters
        let filteredStudents = students;
        if (filters.searchTerm) {
            const searchTerm = filters.searchTerm.toLowerCase();
            filteredStudents = students.filter(s => 
                s.studentName.toLowerCase().includes(searchTerm) ||
                s.studentCode.toLowerCase().includes(searchTerm)
            );
        }
        if (filters.subjectFilter && filters.subjectFilter !== 'all') {
            filteredStudents = filteredStudents.filter(s => s.subject === filters.subjectFilter);
        }
        if (filters.classFilter && filters.classFilter !== 'all') {
            filteredStudents = filteredStudents.filter(s => s.class === filters.classFilter);
        }

        // Tính thống kê theo môn học
        const subjectStats = await this.getSubjectStats(teacherId);

        // Tính tổng quan
        const totalStudents = filteredStudents.length;
        const overallAverage = totalStudents > 0 
            ? Number((filteredStudents.reduce((sum, s) => sum + s.average, 0) / totalStudents).toFixed(1))
            : 0;
        const passRate = totalStudents > 0
            ? Math.round((filteredStudents.filter(s => s.average >= 5).length / totalStudents) * 100)
            : 0;

        console.log('✅ Returning grade view data:');
        console.log('   - Total students:', totalStudents);
        console.log('   - Overall average:', overallAverage);
        console.log('   - Pass rate:', passRate);
        console.log('   - Subject stats:', subjectStats.length);

        return {
            students: filteredStudents,
            subjectStats,
            totalStudents,
            overallAverage,
            passRate
        };
    }

    async getStudentGrades(teacherId: string, filters: any) {
        const gradeViewData = await this.getGradeViewData(teacherId, filters);
        return gradeViewData.students;
    }

    async getSubjectStats(teacherId: string) {
        console.log('📊 getSubjectStats called with teacherId:', teacherId);
        
        if (!teacherId || !checkId(teacherId)) {
            console.log('❌ Invalid teacherId');
            return [];
        }

        // Lấy tất cả lớp học active mà giáo viên đang dạy và include chỉ enrollments có trạng thái 'studying'
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
        
        // Lấy assessments và grades
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

        // Nhóm theo môn học
        const subjectMap = new Map();
        
        // Build map of active students per class to filter grades
        const activeStudentsByClass = new Map<string, Set<string>>();
        classes.forEach(c => {
            const set = new Set<string>();
            (c.enrollments || []).forEach((en: any) => {
                if (en && en.studentId) set.add(en.studentId);
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
                    trend: 'stable' as const
                });
            }

            const subject = subjectMap.get(subjectName);
            const activeSet = activeStudentsByClass.get(assessment.classId || assessment.class?.id);
            assessment.grades.forEach(grade => {
                // only include grades where student is active in that class
                if (activeSet && !activeSet.has(grade.studentId)) return;
                subject.grades.push(Number(grade.score) || 0);
            });
        });

        // Tính toán thống kê cho mỗi môn
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
                ? Number((subject.grades.reduce((sum: number, g: number) => sum + g, 0) / subject.grades.length).toFixed(1))
                : 0;
            subject.passRate = subject.grades.length > 0
                ? Math.round((subject.grades.filter((g: number) => g >= 5).length / subject.grades.length) * 100)
                : 0;
            
            return subject;
        });

        return subjectStats;
    }

    async updateStudentGrade(teacherId: string, payload: { studentId: string; assessmentId: string; score: number }) {
        console.log('💾 updateStudentGrade called:', { teacherId, payload });
        
        const { studentId, assessmentId, score } = payload;
        
        if (!teacherId || !checkId(teacherId)) {
            throw new HttpException('Teacher ID không hợp lệ', HttpStatus.BAD_REQUEST);
        }
        
        if (!checkId(studentId) || !checkId(assessmentId)) {
            throw new HttpException('ID không hợp lệ', HttpStatus.BAD_REQUEST);
        }

        if (score < 0 || score > 10) {
            throw new HttpException('Điểm số phải từ 0 đến 10', HttpStatus.BAD_REQUEST);
        }

        // Kiểm tra assessment có tồn tại không
        const assessment = await this.prisma.assessment.findUnique({
            where: { id: assessmentId },
            include: { class: true }
        });

        if (!assessment) {
            throw new HttpException('Assessment không tồn tại', HttpStatus.NOT_FOUND);
        }

        // Lấy userId của giáo viên và kiểm tra quyền truy cập lớp
        const teacher = await this.prisma.teacher.findUnique({
            where: { id: teacherId },
            select: { userId: true }
        });
        if (!teacher) {
            throw new HttpException('Giáo viên không tồn tại', HttpStatus.NOT_FOUND);
        }
        await this.ensureTeacherCanAccessClass(teacher.userId, assessment.classId);

        // Đảm bảo học sinh thuộc lớp và đang theo học
        const enrollment = await this.prisma.enrollment.findFirst({
            where: { classId: assessment.classId, studentId, status: 'studying' }
        });
        if (!enrollment) {
            throw new HttpException('Học sinh không thuộc lớp này hoặc không ở trạng thái đang theo học', HttpStatus.BAD_REQUEST);
        }

        // Cập nhật hoặc tạo grade
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

    private getWeightByType(type: string): number {
        const t = (type || '').toLowerCase();
        if (t.includes('15')) return 1;
        if (t.includes('45')) return 2; // bài 45 phút
        if (t.includes('60')) return 2; // bài 60 phút ~ hệ số 2
        if (t.includes('90')) return 3; // bài 90 phút ~ hệ số 3
        if (t.includes('giữa kỳ')) return 2;
        if (t.includes('cuối kỳ')) return 3;
        return 1;
    }
}
