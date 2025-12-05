// import { Injectable, Logger } from '@nestjs/common';
// import { Cron } from '@nestjs/schedule';
// import { Prisma } from '@prisma/client';
// import { PrismaService } from '../../../db/prisma.service';

// /**
//  * Interface lưu thông tin lỗi khi xử lý từng giai đoạn
//  */
// interface ErrorDetail {
//   itemId: string; // ID của item bị lỗi
//   itemName: string; // Tên item bị lỗi
//   error: string; // Nội dung lỗi
// }

// /**
//  * Interface định nghĩa điều khoản hợp đồng
//  */
// interface ContractTerms {
//   payoutRate: number; // Tỷ lệ hoa hồng thanh toán cho giáo viên
//   [key: string]: any; // Các thuộc tính khác
// }

// /**
//  * Interface lưu metadata của bảng lương
//  */
// interface PayrollMetadata {
//   totalSessions: number; // Tổng số buổi học
//   totalSessionPayouts: number | string; // Tổng tiền từ các buổi học
//   backPayCount: number; // Số lượng khoản truy lĩnh
//   backPayTotal: number | string; // Tổng tiền truy lĩnh
//   processedAt: string; // Thời điểm xử lý
// }

// //  Interface cho chi tiết truy lĩnh
// interface BackPayDetail {
//   feeRecordId: string;    // ID của hóa đơn gốc
//   sessionDate: string;    // Ngày của buổi học được truy lĩnh
//   sessionId: string;      // ID của buổi học
//   description: string;    // Mô tả ngắn gọn
//   revenuePerSession: number; // Doanh thu (đã chia) của buổi đó
//   payoutRate: number;     // % rate đã áp dụng
//   payoutAmount: number;   // Số tiền GV nhận được
// }
// /**
//  * Map lưu thông tin truy lĩnh cho từng giáo viên
//  * Key: teacherId
//  * Value: { amount: tổng tiền truy lĩnh, details: mảng mô tả chi tiết }
//  */
// type BackPayMap = Map<string, { amount: Prisma.Decimal; details: BackPayDetail[] }>;

// @Injectable()
// export class PayrollCronService {
//   private readonly logger = new Logger(PayrollCronService.name);

//   constructor(private readonly prisma: PrismaService) {}

//   /**
//    * CRON JOB CHÍNH - Chạy lúc 2h sáng ngày 10 hàng tháng
//    */
//   @Cron('0 2 10 * *')
//   async handleGenerateTeacherPayroll() {
//     this.logger.log('Bắt đầu Cron Job: Chốt Sổ Lương Giáo Viên...');

//     const startTime = Date.now();
//     const errorDetails: ErrorDetail[] = [];
//     let successCount = 0;
//     let failedCount = 0;

//     const cronExecutionId =
//       await this.createCronExecution('teacher_payroll_generation');

//     try {
//       // === THIẾT LẬP KHOẢNG THỜI GIAN ===
//       const now = new Date();
//       const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//       const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
//       const billDueDate = new Date(now.getFullYear(), now.getMonth(), 7);

//       this.logger.log(
//         `Kỳ lương: ${firstDayOfLastMonth.toISOString().split('T')[0]} - ${
//           lastDayOfLastMonth.toISOString().split('T')[0]
//         }`,
//       );
//       //Xóa bỏ vì nhỡ đâu server hẹo thì nó vẫn chạy được cho những người sau nhưng phải check
//       // // === KIỂM TRA THÁNG ĐÃ CHỐT SỔ CHƯA ===
//       // const existingPayroll = await this.prisma.payroll.findFirst({
//       //   where: {
//       //     periodStart: firstDayOfLastMonth,
//       //     periodEnd: lastDayOfLastMonth,
//       //   },
//       // });

//       // if (existingPayroll) {
//       //   this.logger.log('Tháng này đã chốt sổ. Bỏ qua...');
//       //   await this.updateCronExecution(cronExecutionId, {
//       //     status: 'completed',
//       //     totalItems: 0,
//       //     successCount: 0,
//       //     failedCount: 0,
//       //     durationMs: Date.now() - startTime,
//       //   });
//       //   return;
//       // }

//       // === GIAI ĐOẠN 1: TÍNH LƯƠNG CHO CÁC BUỔI HỌC ===
//       this.logger.log('Giai đoạn 1: Tính lương cho các buổi học...');
//       let phase1Count = 0;
//       try {
//         phase1Count = await this.processCurrentMonthSessions(
//           firstDayOfLastMonth,
//           lastDayOfLastMonth,
//           billDueDate,
//         );
//         successCount++;
//         this.logger.log(`Giai đoạn 1: Hoàn thành (${phase1Count} TSP tạo)`);
//       } catch (error) {
//         failedCount++;
//         errorDetails.push({
//           itemId: 'phase-1',
//           itemName: 'Process Current Month Sessions',
//           error: error instanceof Error ? error.message : 'Unknown error',
//         });
//         this.logger.error('Giai đoạn 1 thất bại:', error);
//       }

//       // === GIAI ĐOẠN 2: TÍNH TIỀN TRUY LĨNH ===
//       this.logger.log('Giai đoạn 2: Tính truy lĩnh nợ cũ (fee-based)...');
//       let backPayMap: BackPayMap = new Map();
//       try {
//         backPayMap = await this.processBackPayments(
//           firstDayOfLastMonth,
//           lastDayOfLastMonth,
//         );
//         successCount++;
//         this.logger.log(`Giai đoạn 2: Tìm thấy ${backPayMap.size} GV có truy lĩnh`);
//       } catch (error) {
//         failedCount++;
//         errorDetails.push({
//           itemId: 'phase-2',
//           itemName: 'Process Back Payments',
//           error: error instanceof Error ? error.message : 'Unknown error',
//         });
//         this.logger.error('Giai đoạn 2 thất bại:', error);
//       }

//       // === GIAI ĐOẠN 3: GỘP VÀO BẢNG LƯƠNG TỔNG HỢP ===
//       this.logger.log('Giai đoạn 3: Gộp Payroll tổng hợp...');
//       let phase3Count = 0;
//       try {
//         phase3Count = await this.aggregatePayrolls(
//           firstDayOfLastMonth,
//           lastDayOfLastMonth,
//           backPayMap,
//         );
//         successCount++;
//         this.logger.log(`Giai đoạn 3: Hoàn thành (${phase3Count} Payroll tạo)`);
//       } catch (error) {
//         failedCount++;
//         errorDetails.push({
//           itemId: 'phase-3',
//           itemName: 'Aggregate Payrolls',
//           error: error instanceof Error ? error.message : 'Unknown error',
//         });
//         this.logger.error('Giai đoạn 3 thất bại:', error);
//       }

//       // === CẬP NHẬT KẾT QUẢ THỰC THI ===
//       const durationMs = Date.now() - startTime;
//       const status = failedCount > 0 ? 'completed_with_errors' : 'completed';
//       const errorMessage =
//         failedCount > 0 ? `Failed to complete ${failedCount}/3 phases` : null;

//       await this.updateCronExecution(cronExecutionId, {
//         status,
//         totalItems: 3,
//         successCount,
//         failedCount,
//         errorDetails: errorDetails.length > 0 ? errorDetails : null,
//         errorMessage,
//         durationMs,
//       });

//       this.logger.log(
//         `Hoàn thành Cron Job: ${successCount} thành công, ${failedCount} thất bại`,
//       );
//     } catch (error) {
//       // === XỬ LÝ LỖI TOÀN BỘ CRON JOB ===
//       const durationMs = Date.now() - startTime;
//       this.logger.error('Cron Job Chốt Sổ Lương Giáo Viên thất bại:', error);

//       await this.updateCronExecution(cronExecutionId, {
//         status: 'failed',
//         errorMessage: error instanceof Error ? error.message : 'Unknown error',
//         failedCount: 3,
//         durationMs,
//       });
//     }
//   }

//   /**
//    * GIAI ĐOẠN 1: TÍNH LƯƠNG CHO CÁC BUỔI HỌC
//    * (SỬA) Logic:
//    * 1. Lấy tất cả buổi học
//    * 2. Lấy tỷ lệ hoa hồng
//    * 3. (SỬA) Lấy HÓA ĐƠN (FeeRecord) đã trả tiền, bao gồm SỐ TIỀN THỰC THU
//    * 4. (SỬA) Tạo Map "classId:studentId" -> số tiền thực thu
//    * 5. Với mỗi buổi học:
//    *    - Lấy tất cả HS có điểm danh
//    *    - (SỬA) Tính tổng doanh thu thực tế = TỔNG(số tiền thực thu của HS đi học)
//    *    - Tính lương GV = tổng doanh thu thực tế * tỷ lệ hoa hồng
//    *    - Tạo record TeacherSessionPayout
//    */
//   private async processCurrentMonthSessions(
//     startDate: Date,
//     endDate: Date,
//     billDueDate: Date,
//   ): Promise<number> {
//     // === LẤY TẤT CẢ BUỔI HỌC TRONG THÁNG ===
//     const sessions = await this.prisma.classSession.findMany({
//       where: {
//         sessionDate: { gte: startDate, lte: endDate },
//         status: 'end'
//       },
//       select: {
//         id: true,
//         sessionDate: true,
//         teacherId: true,
//         substituteTeacherId: true,
//         classId: true,
//         class: {
//           select: {
//             feeStructure: { select: { amount: true, period: true } },
//             feeAmount: true,
//             feePeriod: true,
//           },
//         },
//       },
//     });

//     if (sessions.length === 0) {
//       this.logger.log('Không có buổi học trong tháng');
//       return 0;
//     }

//     // === ĐẾM SỐ BUỔI HỌC THỰC TẾ CỦA MỖI LỚP ===
//     // Map: classId -> số buổi học
//     const sessionCountByClass = new Map<string, number>();
//     for (const session of sessions) {
//       const count = sessionCountByClass.get(session.classId) || 0;
//       sessionCountByClass.set(session.classId, count + 1);
//     }

//     // === LẤY TỶ LỆ HOA HỒNG CỦA TẤT CẢ GIÁO VIÊN ===
//     const teacherContractUploads = await this.prisma.contractUpload.findMany({
//       where: {
//         status: 'active',
//         expiredAt: { gte: startDate },
//         teacherId: { not: null },
//         teacherSalaryPercent: { not: null },
//       },
//       select: {
//         teacherId: true,
//         teacherSalaryPercent: true,
//       },
//     });

//     const teacherPayoutRateMap = new Map<string, Prisma.Decimal>();
//     teacherContractUploads.forEach((upload) => {
//       if (upload.teacherId && upload.teacherSalaryPercent) {
//         teacherPayoutRateMap.set(
//           upload.teacherId,
//           new Prisma.Decimal(upload.teacherSalaryPercent),
//         );
//       }
//     });

//     // ===  LẤY HÓA ĐƠN ĐÃ TRẢ TIỀN (BAO GỒM SỐ TIỀN THỰC THU) ===
//     const allPaidFeeRecords = await this.prisma.feeRecord.findMany({
//       where: {
//         classId: { in: sessions.map((s) => s.classId) },
//         dueDate: billDueDate,
//         status: 'paid',
//       },
//       select: {
//         classId: true,
//         studentId: true,
//         amount: true, // Phí gốc
//         totalAmount: true, // Phí thực thu sau khi trừ scholarship
//       },
//     });

//     // === (SỬA) TẠO MAP DOANH THU THỰC TẾ (ĐÃ CHIA TRUNG BÌNH) ===
//     // Map: "classId:studentId" -> Số tiền thực thu TRÊN MỖI BUỔI HỌC
//     const paidStudentRevenueMap = new Map<string, Prisma.Decimal>();
//     allPaidFeeRecords.forEach((record) => {
//       // 1. Lấy số tiền thực thu của cả HĐ
//       const actualRevenue = record.totalAmount || record.amount;

//       // 2. Lấy số buổi học của HĐ này
//       const sessionCount = sessionCountByClass.get(record.classId);

//       // 3. Chia trung bình
//       let revenuePerSession = new Prisma.Decimal(0);
//       if (sessionCount && sessionCount > 0) {
//         revenuePerSession = actualRevenue.dividedBy(sessionCount);
//       } else {
//          // Nếu không tìm thấy buổi học nào (lỗi dữ liệu?),
//          // thì tạm coi là 1 để tránh lỗi chia cho 0
//         revenuePerSession = actualRevenue; 
//         this.logger.warn(`Lớp ${record.classId} có HĐ đã trả nhưng không có session.`)
//       }

//       // 4. Lưu số tiền ĐÃ CHIA vào Map
//       paidStudentRevenueMap.set(
//         `${record.classId}:${record.studentId}`,
//         revenuePerSession,
//       );
//     });

//     // === XỬ LÝ TỪNG BUỔI HỌC ===
//     let payoutCount = 0;
//     for (const session of sessions) {
//       try {
//         // 1. Xác định người nhận lương
//         const personToPayId = session.substituteTeacherId || session.teacherId;
//         if (!personToPayId) continue;

//         // 2. Lấy học phí/buổi (GỐC)
//         const baseSessionFee = // (SỬA) Đổi tên biến để rõ nghĩa
//           session.class.feeAmount ||
//           session.class.feeStructure?.amount ||
//           new Prisma.Decimal(0);
//         const period = session.class.feePeriod || session.class.feeStructure?.period;

//         // 3. Chỉ tính cho lớp tính phí theo buổi
//         if (period !== 'per_session' || baseSessionFee.isZero()) continue;

//         // 4. Lấy tỷ lệ hoa hồng của GV
//         const payoutRate = teacherPayoutRateMap.get(personToPayId);
//         if (!payoutRate || payoutRate.isZero()) continue;

//         // 5.  Lấy TẤT CẢ học sinh có điểm danh (kể cả chưa trả tiền)
//         const attendances = await this.prisma.studentSessionAttendance.findMany({
//           where: {
//             sessionId: session.id,
//             status: { not: 'excused' }, // Không tính nghỉ có phép
//           },
//           select: { studentId: true },
//         });

//         if (attendances.length === 0) {
//           this.logger.debug(`Buổi ${session.id} không có HS đi học`);
//           continue;
//         }

//         // 6. Tính tổng DOANH THU THỰC TẾ của buổi học
//         let sessionActualRevenue = new Prisma.Decimal(0);
//         let paidStudentCount = 0;

//         for (const attendance of attendances) {
//           const key = `${session.classId}:${attendance.studentId}`;
//           // Lấy doanh thu thực tế của học sinh này từ Map
//           const revenueFromStudent = paidStudentRevenueMap.get(key);

//           // Nếu HS này vừa đi học, VỪA có trong map HĐ đã trả
//           if (revenueFromStudent) {
//             // Cộng doanh thu thực tế (đã trừ scholarship), không phải đếm 1
//             sessionActualRevenue = sessionActualRevenue.plus(revenueFromStudent);
//             paidStudentCount++;
//           }
//           // Nếu không, HS này đi học nhưng chưa trả tiền -> không cộng
//         }

//         if (paidStudentCount === 0) {
//           this.logger.debug(`Buổi ${session.id} không có HS (đã trả tiền) tham gia`);
//           continue;
//         }

//         // 7. Tính toán lương dựa trên DOANH THU THỰC TẾ
//         const teacherPayout = sessionActualRevenue.times(payoutRate);

//         // 8. Tạo record TeacherSessionPayout
//         await this.prisma.teacherSessionPayout.create({
//           data: {
//             sessionId: session.id,
//             teacherId: personToPayId,
//             status: 'calculated',
//             sessionFeePerStudent: baseSessionFee, //  Lưu phí GỐC để tham khảo
//             studentCount: paidStudentCount,
//             totalRevenue: sessionActualRevenue, //  Lưu doanh thu THỰC TẾ
//             payoutRate,
//             teacherPayout: teacherPayout, //  Lưu lương THỰC TẾ
//           },
//         });

//         payoutCount++;
//       } catch (error) {
//         this.logger.error(`Lỗi xử lý buổi ${session.id}:`, error);
//       }
//     }

//     return payoutCount;
//   }

//  /**
//    * GIAI ĐOẠN 2: TÍNH TIỀN TRUY LĨNH (SESSION-BASED)
//    * * Logic:
//    * 1. Tìm các hóa đơn CŨ (FeeRecord) được thanh toán trong kỳ này.
//    * 2. Với MỖI hóa đơn:
//    *    a. Suy luận ra kỳ nợ (ví dụ: bill T10 -> nợ T9).
//    *    b. Tìm TẤT CẢ buổi học (ClassSession) trong kỳ nợ đó.
//    *    c. Chia trung bình (prorate) số tiền thực thu của hóa đơn cho từng buổi học.
//    *    d. Với MỖI buổi học:
//    *        i.  Tìm người dạy (GV chính hoặc GV thay thế).
//    *        ii. Lấy % rate LỊCH SỬ của người đó.
//    *        iii.Tính lương và cộng dồn vào `backPayMap` cho ĐÚNG người.
//    */
//   private async processBackPayments(
//     startDate: Date,
//     endDate: Date,
//   ): Promise<BackPayMap> {
//     // === 1. TÌM CÁC HÓA ĐƠN CŨ ĐƯỢC THANH TOÁN ===
//     const backPayments = await this.prisma.feeRecordPayment.findMany({
//       where: {
//         payment: {
//           paidAt: { gte: startDate, lte: endDate },
//         },
//         feeRecord: {
//           dueDate: { lt: startDate },
//           status: 'paid',
//         },
//       },
//       select: {
//         feeRecord: {
//           select: {
//             id: true,
//             classId: true,
//             totalAmount: true,
//             amount: true,
//             dueDate: true, // Quan trọng để suy luận kỳ nợ
//             student: {
//               select:{
//                 user:{
//                   select:{
//                     fullName: true
//                   }

//                 }
//               }
//             }
//           },
//         },
//       },
//     });

//     if (backPayments.length === 0) {
//       this.logger.log('Không có hóa đơn nợ cũ được thanh toán trong kỳ');
//       return new Map();
//     }

//     // === TẠO CACHE ĐỂ LƯU CONTRACT LỊCH SỬ ===
//     // Map: "teacherId:YYYY-MM-DD" -> payoutRate
//     // Dùng để tránh query N+1 khi lặp qua các buổi học
//     const historicalRateCache = new Map<string, Prisma.Decimal>();
//     const backPayMap: BackPayMap = new Map();

//     // === 2. LẶP QUA TỪNG HÓA ĐƠN ĐÃ TRẢ ===
//     for (const payment of backPayments) {
//       const { feeRecord } = payment;
//       if (!feeRecord || !feeRecord.classId) continue;

//       try {
//         const actualFeeRecordAmount = feeRecord.totalAmount || feeRecord.amount;

//         // === 3. SUY LUẬN KỲ NỢ TỪ `dueDate` ===
//         // Quy tắc: dueDate 7/10 -> kỳ nợ là Tháng 9
//         const billingStart = new Date(feeRecord.dueDate.getFullYear(), feeRecord.dueDate.getMonth() - 1, 1);
//         const billingEnd = new Date(feeRecord.dueDate.getFullYear(), feeRecord.dueDate.getMonth(), 0);

//         // === 4. TÌM TẤT CẢ BUỔI HỌC TRONG KỲ NỢ ===
//         const sessionsInDebtPeriod = await this.prisma.classSession.findMany({
//           where: {
//             classId: feeRecord.classId,
//             sessionDate: { gte: billingStart, lte: billingEnd },
//             status: 'end', // Chỉ các buổi thực dạy
//           },
//           select: {
//             id: true,
//             sessionDate: true,
//             teacherId: true,
//             substituteTeacherId: true,
//           },
//         });

//         const sessionCount = sessionsInDebtPeriod.length;
//         if (sessionCount === 0) {
//           this.logger.warn(
//             `HĐ ${feeRecord.id} đã trả tiền nhưng không tìm thấy buổi học nào trong kỳ ${billingStart.toISOString().split('T')[0]}`,
//           );
//           continue;
//         }

//         // === 5. CHIA TRUNG BÌNH SỐ TIỀN ===
//         // (Giống hệt Giai đoạn 1)
//         const revenuePerSession = actualFeeRecordAmount.dividedBy(sessionCount);

//         // === 6. LẶP QUA TỪNG BUỔI HỌC ĐỂ TRẢ LƯƠNG ĐÚNG NGƯỜI ===
//         for (const session of sessionsInDebtPeriod) {
//           // 6a. Tìm ĐÚNG người dạy (GV chính hoặc GV thay thế)
//           const personToPayId = session.substituteTeacherId || session.teacherId;
//           if (!personToPayId) {
//             this.logger.warn(`Buổi ${session.id} (nợ cũ) không có GV`);
//             continue;
//           }

//           // 6b. Lấy % rate LỊCH SỬ của người này
//           const billingDateKey = billingStart.toISOString().split('T')[0]; // Dùng ngày đầu kỳ nợ làm key
//           const cacheKey = `${personToPayId}:${billingDateKey}`;

//           let payoutRate = historicalRateCache.get(cacheKey);

//           if (!payoutRate) {
//             const historicalContract = await this.prisma.contractUpload.findFirst({
//               where: {
//                 teacherId: personToPayId,
//                 teacherSalaryPercent: { not: null },
//                 // Tìm HĐ có hiệu lực tại thời điểm kỳ nợ
//                 expiredAt: { gte: billingStart }, 
//                 // (Có thể thêm startDate: { lte: billingStart } nếu bạn có)
//               },
//               select: { teacherSalaryPercent: true },
//               orderBy: { expiredAt: 'desc' },
//             });

//             if (historicalContract?.teacherSalaryPercent) {
//               payoutRate = new Prisma.Decimal(historicalContract.teacherSalaryPercent);
//               historicalRateCache.set(cacheKey, payoutRate);
//             } else {
//               this.logger.warn(
//                 `GV ${personToPayId} không có HĐ hợp lệ cho kỳ ${billingDateKey} (session ${session.id})`,
//               );
//               continue;
//             }
//           }

//           if (payoutRate.isZero()) continue;

//           // 6c. Tính lương cho buổi này và cho đúng người
//           const teacherPayout = revenuePerSession.times(payoutRate);
//           const sessionDateStr = session.sessionDate.toISOString().split('T')[0];
//           const detailObject: BackPayDetail = {
//             feeRecordId: feeRecord.id,
//             sessionId: session.id,
//             sessionDate: sessionDateStr,
//             description: `Truy lĩnh buổi ${sessionDateStr} (từ hóa đơn của học sinh ${feeRecord.student.user.fullName})`,
//             revenuePerSession: revenuePerSession.toNumber(),
//             payoutRate: payoutRate.toNumber(),
//             payoutAmount: teacherPayout.toNumber(),
//           };
//           // 6d. Cộng dồn vào `backPayMap`
//           if (!backPayMap.has(personToPayId)) {
//             backPayMap.set(personToPayId, { amount: new Prisma.Decimal(0), details: [] });
//           }
//           const existing = backPayMap.get(personToPayId)!;
//           existing.amount = existing.amount.plus(teacherPayout);
//           existing.details.push(detailObject);

//         } // Kết thúc lặp qua các buổi học
//       } catch (error) {
//          this.logger.error(`Lỗi xử lý back-payment cho HĐ ${feeRecord.id}:`, error);
//       }
//     } // Kết thúc lặp qua các hóa đơn

//     return backPayMap;
//   }

//   /**
//    * GIAI ĐOẠN 3: GỘP VÀO BẢNG LƯƠNG TỔNG HỢP
//    * (Không thay đổi) - Hàm này sẽ tự động đúng
//    * vì GĐ1 và GĐ2 đã cung cấp `teacherPayout` chính xác.
//    */
//   private async aggregatePayrolls(
//     startDate: Date,
//     endDate: Date,
//     backPayMap: BackPayMap,
//   ): Promise<number> {
//     // === LẤY TẤT CẢ TSP ĐÃ TÍNH TOÁN ===
//     const pendingPayouts = await this.prisma.teacherSessionPayout.findMany({
//       where: {
//         status: 'calculated',
//         session: {
//           sessionDate: { gte: startDate, lte: endDate },
//         },
//       },
//     });

//     // === GỘP TSP THEO GIÁO VIÊN ===
//     const payrollDataMap = new Map<
//       string,
//       {
//         payouts: typeof pendingPayouts;
//         totalAmount: Prisma.Decimal;
//       }
//     >();

//     for (const payout of pendingPayouts) {
//       if (!payrollDataMap.has(payout.teacherId)) {
//         payrollDataMap.set(payout.teacherId, {
//           payouts: [],
//           totalAmount: new Prisma.Decimal(0),
//         });
//       }
//       const existing = payrollDataMap.get(payout.teacherId)!;
//       existing.payouts.push(payout);
//       existing.totalAmount = existing.totalAmount.plus(payout.teacherPayout);
//     }

//     let payrollCount = 0;

//     // === TẠO PAYROLL CHO GV CÓ BUỔI HỌC ===
//     for (const [teacherId, data] of payrollDataMap.entries()) {

//       // KIỂM TRA IDEMPOTENCY CHO TỪNG GIÁO VIÊN
//       //Đây là cho trường hợp đã chạy nhưng sập server
//       const existing = await this.prisma.payroll.findFirst({
//         where: { teacherId, periodStart: startDate, periodEnd: endDate },
//       });
//       if (existing) {
//         this.logger.log(`Payroll cho GV ${teacherId} đã tồn tại. Bỏ qua.`);
//         continue; // Bỏ qua GV này, tiếp tục vòng lặp
//       }

//       const backPay = backPayMap.get(teacherId) || {
//         amount: new Prisma.Decimal(0),
//         details: [],
//       };

//       const metadata: PayrollMetadata = {
//         totalSessions: data.payouts.length,
//         totalSessionPayouts: data.totalAmount.toFixed(0),
//         backPayCount: backPay.details.length,
//         backPayTotal: backPay.amount.toFixed(0),
//         processedAt: new Date().toISOString(),
//       };

//       const newPayroll = await this.prisma.payroll.create({
//         data: {
//           teacherId,
//           periodStart: startDate,
//           periodEnd: endDate,
//           totalAmount: data.totalAmount.plus(backPay.amount),
//           backPayAmount: backPay.amount, 
//           bonuses: 0, 
//           computedDetails: this.buildComputedDetails(metadata, backPay.details),
//           status: 'pending',
//         },
//       });

//       const payoutIds = data.payouts.map((p) => p.id);
//       await this.prisma.teacherSessionPayout.updateMany({
//         where: { id: { in: payoutIds } },
//         data: { status: 'batched', payrollId: newPayroll.id },
//       });

//       payrollCount++;
//       this.logger.log(
//         `Tạo Payroll [${newPayroll.id}] cho GV ${teacherId}: ${newPayroll.totalAmount.toFixed(
//           0,
//         )} VND`,
//       );
//     }

//     // === TẠO PAYROLL CHO GV CHỈ CÓ TRUY LĨNH ===
//     for (const [teacherId, backPay] of backPayMap.entries()) {
//       if (!payrollDataMap.has(teacherId)) {
//         // KIỂM TRA IDEMPOTENCY CHO TỪNG GIÁO VIÊN
//         const existing = await this.prisma.payroll.findFirst({
//           where: { teacherId, periodStart: startDate, periodEnd: endDate },
//         });
//         if (existing) {
//           this.logger.log(`Payroll (truy lĩnh) cho GV ${teacherId} đã tồn tại. Bỏ qua.`);
//           continue; // Bỏ qua GV này, tiếp tục vòng lặp
//         }
//         const metadata: PayrollMetadata = {
//           totalSessions: 0,
//           totalSessionPayouts: '0',
//           backPayCount: backPay.details.length,
//           backPayTotal: backPay.amount.toFixed(0),
//           processedAt: new Date().toISOString(),
//         };

//         await this.prisma.payroll.create({
//           data: {
//             teacherId,
//             periodStart: startDate,
//             periodEnd: endDate,
//             totalAmount: backPay.amount,
//             backPayAmount: backPay.amount,
//             bonuses: 0, 
//             computedDetails: this.buildComputedDetails(metadata, backPay.details),
//             status: 'pending',
//           },
//         });

//         payrollCount++;
//         this.logger.log(
//           `Tạo Payroll (chỉ truy lĩnh) cho GV ${teacherId}: ${backPay.amount.toFixed(
//             0,
//           )} VND`,
//         );
//       }
//     }

//     return payrollCount;
//   }


//   private buildComputedDetails(
//     metadata: PayrollMetadata,
//     backPayDetails: BackPayDetail[],
//   ): Record<string, any> {
//     return {
//       metadata,
//       backPayDetails,
//     };
//   }


//   private async createCronExecution(jobType: string): Promise<string> {
//     const execution = await this.prisma.cronJobExecution.create({
//       data: {
//         jobType,
//         status: 'running',
//         totalItems: 0,
//         successCount: 0,
//         failedCount: 0,
//       },
//     });
//     return execution.id;
//   }

//   private async updateCronExecution(
//     id: string,
//     data: {
//       status: string;
//       totalItems?: number;
//       successCount?: number;
//       failedCount?: number;
//       errorDetails?: ErrorDetail[] | null;
//       errorMessage?: string | null;
//       durationMs?: number;
//     },
//   ) {
//     const updateData: any = {
//       status: data.status,
//       totalItems: data.totalItems ?? 0,
//       successCount: data.successCount ?? 0,
//       failedCount: data.failedCount ?? 0,
//       errorMessage: data.errorMessage ?? null,
//       durationMs: data.durationMs,
//       completedAt: ['success', 'completed_with_errors', 'failed'].includes(
//         data.status,
//       )
//         ? new Date()
//         : undefined,
//     };

//     if (data.errorDetails !== undefined) {
//       updateData.errorDetails = data.errorDetails;
//     }

//     await this.prisma.cronJobExecution.update({
//       where: { id },
//       data: updateData,
//     });
//   }
// }