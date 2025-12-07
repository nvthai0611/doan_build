import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../db/prisma.service';

// --- Interfaces ---

interface PhaseResult<T = void> {
  success: number;
  failed: number;
  errors: any[];
  data?: T;
}

interface BackPayDetail {
  feeRecordId: string;
  sessionDate: string;
  sessionId: string;
  description: string;
  revenuePerSession: number;
  payoutRate: number;
  payoutAmount: number;
}

interface BackPayEntry {
  amount: Prisma.Decimal;
  details: BackPayDetail[];
}

type BackPayMap = Map<string, BackPayEntry>;

interface PayrollMetadata {
  totalSessions: number;
  totalSessionPayouts: string;
  backPayCount: number;
  backPayTotal: string;
  processedAt: string;
  note?: string;
}

interface ErrorDetail {
  itemId: string;
  itemName: string;
  phase: string;
  error: string;
}

@Injectable()
export class PayrollCronService {
  private readonly logger = new Logger(PayrollCronService.name);
  private readonly JOB_TYPE = 'teacher_payroll_generation';

  constructor(private readonly prisma: PrismaService) { }
  private roundMoney(amount: Prisma.Decimal): Prisma.Decimal {
    return new Prisma.Decimal(amount.toFixed(0));
  }

  private toDbDate(date: Date): Date {
    // Cộng thêm 7 tiếng (7 * 60 * 60 * 1000 ms)
    return new Date(date.getTime() + 7 * 60 * 60 * 1000);
  }
  /**
   * CRON JOB: CHẠY LÚC 02:00 SÁNG NGÀY 10 HÀNG THÁNG
   * Ví dụ: Chạy ngày 10/12 để tính lương cho công việc của Tháng 11
   */
  @Cron('0 2 10 * *')
  async handleGenerateTeacherPayroll() {
    this.logger.log('🚀 Bắt đầu Cron Job: Tính Lương (Quỹ Lớp & Truy Lĩnh)...');
    const startTime = Date.now();

    // 1. Tạo Record CronJobExecution
    const execution = await this.prisma.cronJobExecution.create({
      data: {
        jobType: this.JOB_TYPE,
        status: 'running',
        startedAt: new Date(),
        metadata: { type: 'monthly_closing_pool_based' },
      },
    });

    // === THIẾT LẬP THỜI GIAN (QUAN TRỌNG) ===
    const now = new Date(); // Ví dụ: 10/12/2025

    // A. Kỳ Học (Tháng trước - T11): Dùng để tìm ClassSession
    const studyMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const studyMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    studyMonthEnd.setHours(23, 59, 59, 999);
    // B. Kỳ Hóa Đơn (Tháng này - T12): Dùng để tìm FeeRecord hiện tại (vì dueDate là 07/12)
    const billingMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const billingMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    billingMonthEnd.setHours(23, 59, 59, 999);
    // C. Hạn Chốt Sổ Tháng Này (Mùng 7/12): Hạn cuối ghi nhận thanh toán cho kỳ này
    const closingDate = new Date(now.getFullYear(), now.getMonth(), 7);
    closingDate.setHours(23, 59, 59, 999);

    // D. Hạn Chốt Sổ Tháng Trước (Mùng 7/11): Điểm bắt đầu để quét các khoản thanh toán nợ
    // (Để không bỏ sót các khoản trả vào ngày 8/11, 9/11...)
    const previousClosingDate = new Date(now.getFullYear(), now.getMonth() - 1, 7);
    previousClosingDate.setHours(23, 59, 59, 999);
    const fmtDate = (d: Date) => {
        // const y = d.getFullYear();
        // const m = String(d.getMonth() + 1).padStart(2, '0');
        // const day = String(d.getDate()).padStart(2, '0');
        // return `${y}-${m}-${day}`;
        
      return d.toLocaleString('vi-VN', { 
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false 
      });
    
    };
    
    const fmtDateTime = (d: Date) => {
         return d.toLocaleString('vi-VN', { hour12: false });
    };
    this.logger.log(`Kỳ Học: ${fmtDate(studyMonthStart)} -> ${fmtDate(studyMonthEnd)}`);
    this.logger.log(`Kỳ Hóa Đơn: ${fmtDate(billingMonthStart)} -> ${fmtDate(billingMonthEnd)}`);
    this.logger.log(`Quét thanh toán từ: ${fmtDateTime(previousClosingDate)} -> ${fmtDateTime(closingDate)}`);

    let totalSuccess = 0;
    let totalFailed = 0;
    let allErrors: ErrorDetail[] = [];

    try {
      // === GIAI ĐOẠN 1: TÍNH LƯƠNG THÁNG HIỆN TẠI (POOL-BASED) ===
      this.logger.log('--- Giai đoạn 1: Tính Quỹ Lớp ---');
      const phase1Result = await this.processCurrentMonthPools(
        studyMonthStart,
        studyMonthEnd,
        previousClosingDate,
        billingMonthEnd,
        closingDate,
      );

      totalSuccess += phase1Result.success;
      totalFailed += phase1Result.failed;
      allErrors = [...allErrors, ...phase1Result.errors];

      // === GIAI ĐOẠN 2: TÍNH TRUY LĨNH (WINNER TAKES ALL) ===
      this.logger.log('--- Giai đoạn 2: Tính Truy Lĩnh ---');
      // Quét các thanh toán từ sau chốt sổ tháng trước -> chốt sổ tháng này
      const phase2Result = await this.processBackPay(
        previousClosingDate,
        closingDate,
        previousClosingDate, // Các hóa đơn có dueDate < ngày này được coi là nợ cũ
      );

      totalSuccess += phase2Result.success;
      totalFailed += phase2Result.failed;
      allErrors = [...allErrors, ...phase2Result.errors];

      const backPayMap = phase2Result.data || new Map();

      // === GIAI ĐOẠN 3: GỘP VÀO PAYROLL ===
      this.logger.log('--- Giai đoạn 3: Tổng hợp Payroll ---');
      const phase3Result = await this.aggregateAndCreatePayrolls(
        studyMonthStart,
        studyMonthEnd,
        backPayMap,
      );

      totalSuccess += phase3Result.success;
      totalFailed += phase3Result.failed;
      allErrors = [...allErrors, ...phase3Result.errors];

      // === CẬP NHẬT KẾT QUẢ ===
      const finalStatus = totalFailed > 0 ? 'completed_with_errors' : 'success';

      await this.prisma.cronJobExecution.update({
        where: { id: execution.id },
        data: {
          status: finalStatus,
          completedAt: new Date(),
          durationMs: Date.now() - startTime,
          totalItems: totalSuccess + totalFailed,
          successCount: totalSuccess,
          failedCount: totalFailed,
          errorDetails: allErrors as any,
          errorMessage: totalFailed > 0 ? `Hoàn thành với ${totalFailed} lỗi xử lý item.` : null,
        },
      });

      this.logger.log(`✅ Cron Job hoàn tất. Success: ${totalSuccess}, Failed: ${totalFailed}`);
    } catch (error) {
      this.logger.error('❌ Cron Job CRASHED:', error);
      await this.prisma.cronJobExecution.update({
        where: { id: execution.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          durationMs: Date.now() - startTime,
          errorMessage: error instanceof Error ? error.message : 'Unknown system error',
          errorDetails: allErrors as any,
        },
      });
    }
  }

  /**
   * Helper: Lấy % lương từ ContractUpload tại một thời điểm cụ thể
   */
  private async getTeacherRate(teacherId: string, date: Date): Promise<Prisma.Decimal> {
    const contract = await this.prisma.contractUpload.findFirst({
      where: {
        teacherId: teacherId,
        status: 'active',
        // Logic: Tìm hợp đồng bao trùm ngày 'date'
        AND: [
          { OR: [{ startDate: { lte: date } }, { startDate: null }] },
          { OR: [{ expiredAt: { gte: date } }, { expiredAt: null }] },
        ],
      },
      orderBy: { uploadedAt: 'desc' },
      select: { teacherSalaryPercent: true },
    });

    if (!contract || !contract.teacherSalaryPercent) return new Prisma.Decimal(0);

    let rate = new Prisma.Decimal(contract.teacherSalaryPercent);
    // Chuẩn hóa: Nếu lưu 30 (30%) -> chia 100 thành 0.3. Nếu lưu 0.3 -> giữ nguyên.
    if (rate.gt(1)) rate = rate.dividedBy(100);

    return rate;
  }

  /**
   * PHẦN 1: TÍNH QUỸ LỚP THÁNG HIỆN TẠI
   * Logic: Tổng tiền thu được trong tháng chốt sổ (cho việc học tháng trước) / Tổng số buổi dạy
   */
  private async processCurrentMonthPools(
    studyStart: Date,
    studyEnd: Date,
    previousClosingDate: Date,
    billingEnd: Date,
    closingDate: Date, // Ngay chốt sổ tháng hiện tại VD: 7/12
  ): Promise<PhaseResult> {
    let success = 0;
    let failed = 0;
    const errors: ErrorDetail[] = [];

    // 1. Tìm các lớp CÓ HOẠT ĐỘNG HỌC trong Kỳ Học (T11)
    const activeClasses = await this.prisma.class.findMany({
      where: {
        sessions: {
          some: { sessionDate: { gte: studyStart, lte: studyEnd }, status: 'end' },
        },
      },
      select: { id: true, name: true },
    });
    console.log("Tính toán ngày học bắt");
    
    for (const cls of activeClasses) {
      try {
        // A. Tính Tổng Thu (Dựa trên Hóa Đơn của Tháng Tính Lương - T12)
        // Chỉ lấy hóa đơn có hạn trong T12 VÀ đã trả trước ngày chốt sổ
        const feeRecords = await this.prisma.feeRecord.findMany({
          where: {
            classId: cls.id,
            // dueDate LỚN HƠN 07/11 (tức là từ 08/11)
            // tìm hóa đơn có dueDate từ 08/11 đến 30/12
            dueDate: { gt: previousClosingDate, lte: billingEnd },
            status: 'paid',
            feeRecordPayments: {
              some: { payment: { paidAt: { lte: closingDate } } },
            },
          },
          select: { totalAmount: true, amount: true },
        });
        console.log(previousClosingDate, billingEnd, closingDate);
        console.log(feeRecords, feeRecords.length);
        
        
        console.log("Lớp học hoạt động trong tháng: ", cls.name);
        

        const totalRevenue = feeRecords.reduce(
          (sum, rec) => sum.plus(rec.totalAmount ?? rec.amount),
          new Prisma.Decimal(0),
        );
        console.log(`Tổng doanh thu lớp ${cls.name}:`, new Intl.NumberFormat('vi-VN').format(totalRevenue.toNumber()));

        // B. Đếm số buổi dạy trong Kỳ Học (T11)
        const sessions = await this.prisma.classSession.findMany({
          where: {
            classId: cls.id,
            sessionDate: { gte: studyStart, lte: studyEnd },
            status: 'end',
            teacherSessionPayout: { is: null }
          },
          select: { id: true, teacherId: true, substituteTeacherId: true, sessionDate: true },
        });
        console.log(studyStart, studyEnd);
        console.log(cls.id);
        
        const totalSessions = sessions.length;
        console.log("Các buổi dạy trong tháng của lớp: ",totalSessions);

        // Nếu không có doanh thu hoặc không có buổi học -> Bỏ qua
        if (totalRevenue.isZero() || totalSessions === 0) {
          success++;
          continue;
        }

        // C. Tính Giá Trị Gốc 1 Buổi (Raw Value Per Session)
        // Doanh thu cả lớp / Số buổi = Giá trị 1 buổi
        const rawValuePerSession = this.roundMoney(totalRevenue).dividedBy(totalSessions); 
        console.log("Số tiền trên 1 buổi: ", rawValuePerSession);
        
        // D. Chia tiền cho từng buổi
        for (const session of sessions) {
          const personToPayId = session.substituteTeacherId || session.teacherId;
          if (!personToPayId) continue;

          // Lấy % động của người dạy tại thời điểm dạy
          const teacherRate = await this.getTeacherRate(personToPayId, session.sessionDate);
          if (teacherRate.isZero()) continue;
          console.log("% Lương tháng này của giáo viên: ", teacherRate.toNumber());
          
          // Tính lương thực nhận = Giá gốc 1 buổi * % của GV
          const teacherPayout = this.roundMoney(rawValuePerSession.times(teacherRate))
          console.log("Tiền lương giáo viên nhận được cho buổi: ", teacherPayout.toNumber());
          // Đếm HS (cho FE hiển thị - không ảnh hưởng tiền)
          const attendanceCount = await this.prisma.studentSessionAttendance.count({
            where: { sessionId: session.id, status: { not: 'excused' } },
          });
          console.log("Số học sinh tham gia buổi: ", attendanceCount);
          await this.prisma.teacherSessionPayout.create({
            data: {
              sessionId: session.id,
              teacherId: personToPayId,
              status: 'calculated',
              studentCount: attendanceCount,
              sessionFeePerStudent: 0, // Không quan trọng trong mô hình pool
              totalRevenue: this.roundMoney(rawValuePerSession), // Lưu giá trị gốc 1 buổi
              payoutRate: teacherRate,
              teacherPayout: teacherPayout,
            },
          });
        }

        success++;
      } catch (err) {
        failed++;
        errors.push({
          itemId: cls.id,
          itemName: `Lớp ${cls.name}`,
          phase: 'Giai đoạn 1 (Quỹ Lớp)',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
        this.logger.error(`Lỗi xử lý lớp ${cls.id}:`, err);
      }
    }

    return { success, failed, errors };
  }

  /**
   * PHẦN 2: TÍNH TRUY LĨNH (WINNER TAKES ALL)
   * Logic: Tiền nợ cũ thu được -> Trả hết cho GV Chính hiện tại của lớp
   * CẬP NHẬT: Lấy Rate từ lịch sử TeacherSessionPayout của tháng nợ (nếu có)
   */
  private async processBackPay(
    paymentWindowStart: Date,
    paymentWindowEnd: Date,
    currentBillingStart: Date, // Các hóa đơn có dueDate < ngày này được coi là nợ cũ ví dụ: 07/12 là hạn nộp tháng 11
    // Hóa đơn có hạn nộp trước thì là nợ ví dụ là 07/11
  ): Promise<PhaseResult<BackPayMap>> {
    let success = 0;
    let failed = 0;
    const errors: ErrorDetail[] = [];
    const backPayMap = new Map<string, BackPayEntry>();

    // 1. Tìm các khoản thanh toán NỢ
    const latePayments = await this.prisma.feeRecordPayment.findMany({
      where: {
        payment: { paidAt: { gt: paymentWindowStart, lte: paymentWindowEnd } },
        feeRecord: { dueDate: { lte: currentBillingStart }, status: 'paid' },
      },
      include: {
        feeRecord: {
          include: {
            class: { select: { id: true, teacherId: true, name: true } },
            student: { select: { user: { select: { fullName: true } } } },
          },
        },
      },
    });

    if (latePayments.length === 0) {
      return { success: 0, failed: 0, errors: [], data: backPayMap };
    }

    for (const p of latePayments) {
      const feeRecord = p.feeRecord;
      if (!feeRecord || !feeRecord.classId) continue;

      try {
        const paymentAmount = feeRecord.totalAmount || feeRecord.amount;
        const studentName = feeRecord.student?.user?.fullName || 'HS';
        const className = feeRecord.class?.name || 'Lớp';

        // --- A. XÁC ĐỊNH NGƯỜI NHẬN ---
        const targetTeacherId = feeRecord.class?.teacherId;

        if (!targetTeacherId) {
          this.logger.warn(
            `Không tìm thấy GV chính để trả nợ HĐ ${feeRecord.id} (Lớp ${className})`,
          );
          success++;
          continue;
        }

        // --- B. TÍNH TOÁN RATE (LOGIC MỚI) ---
        let finalRate: Prisma.Decimal;

        // B1. Xác định tháng của hóa đơn nợ
        const debtDate = feeRecord.dueDate;
        const debtMonthStart = new Date(debtDate.getFullYear(), debtDate.getMonth(), 1);
        const debtMonthEnd = new Date(debtDate.getFullYear(), debtDate.getMonth() + 1, 0);

        // B2. Tìm lịch sử Payout của GV này, tại Lớp này, trong Tháng nợ đó
        // Mục đích: "Snapshot" lại mức lương GV đã nhận lúc đó
        const historyPayout = await this.prisma.teacherSessionPayout.findFirst({
          where: {
            teacherId: targetTeacherId,
            session: {
              classId: feeRecord.classId,
              sessionDate: { gte: debtMonthStart, lte: debtMonthEnd },
            },
          },
          select: { payoutRate: true },
        });

        if (historyPayout) {
          // Case 1: Tìm thấy lịch sử -> Dùng Rate cũ (Chính xác tuyệt đối)
          finalRate = historyPayout.payoutRate;
        } else {
          // Case 2: Không tìm thấy (VD: Tháng đó lớp nghỉ, hoặc GV nghỉ dạy) -> Fallback về Hợp đồng
          finalRate = await this.getTeacherRate(targetTeacherId, debtDate);
          this.logger.warn(
            `BackPay: Không tìm thấy lịch sử Payout tháng ${debtDate.getMonth() + 1} cho GV ${targetTeacherId}. Dùng Fallback Rate theo hợp đồng.`,
          );
        }

        // Nếu Rate vẫn = 0 (do không có HĐ) -> Bỏ qua
        if (finalRate.isZero()) {
          success++;
          continue;
        }

        // --- C. TÍNH TIỀN ---
        const teacherPayout = this.roundMoney(paymentAmount.times(finalRate));

        // --- D. CỘNG DỒN VÀO MAP ---
        if (!backPayMap.has(targetTeacherId)) {
          backPayMap.set(targetTeacherId, {
            amount: new Prisma.Decimal(0),
            details: [],
          });
        }
        const entry = backPayMap.get(targetTeacherId)!;

        entry.amount = entry.amount.plus(teacherPayout);

        entry.details.push({
          feeRecordId: feeRecord.id,
          sessionId: 'BACKPAY',
          sessionDate: debtDate.toISOString().slice(0, 10), // Hiển thị ngày nợ
          description: `Lương cũ T${debtDate.getMonth() + 1}: ${className} (${studentName}) - Rate áp dụng: ${finalRate.times(100)}%`,
          revenuePerSession: paymentAmount.toNumber(),
          payoutRate: finalRate.toNumber(),
          payoutAmount: teacherPayout.toNumber(),
        });

        success++;
      } catch (err) {
        failed++;
        errors.push({
          itemId: p.id.toString(),
          itemName: `Payment ID ${p.id}`,
          phase: 'Phase 2 (Back Pay)',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
        this.logger.error(`Lỗi xử lý BackPay ID ${p.id}:`, err);
      }
    }

    return { success, failed, errors, data: backPayMap };
  }

  /**
   * PHẦN 3: GỘP VÀ TẠO PAYROLL TỔNG
   */
  private async aggregateAndCreatePayrolls(
    startDate: Date,
    endDate: Date,
    backPayMap: BackPayMap,
  ): Promise<PhaseResult> {
    let success = 0;
    let failed = 0;
    const errors: ErrorDetail[] = [];

    // 1. Lấy tất cả TSP vừa tính ở Phase 1 (thuộc Kỳ Học)
    const newPayouts = await this.prisma.teacherSessionPayout.findMany({
      where: {
        status: 'calculated',
        session: { sessionDate: { gte: startDate, lte: endDate } },
      },
    });

    // Gom dữ liệu lương tháng này
    const currentPayMap = new Map<string, Prisma.Decimal>();
    const payoutIdsMap = new Map<string, bigint[]>();

    for (const payout of newPayouts) {
      const tid = payout.teacherId;
      const currentTotal = currentPayMap.get(tid) || new Prisma.Decimal(0);
      currentPayMap.set(tid, currentTotal.plus(payout.teacherPayout));

      const ids = payoutIdsMap.get(tid) || [];
      ids.push(payout.id);
      payoutIdsMap.set(tid, ids);
    }

    // Lấy danh sách TẤT CẢ giáo viên (có lương tháng này HOẶC có truy lĩnh)
    const allTeacherIds = new Set([...currentPayMap.keys(), ...backPayMap.keys()]);

    for (const teacherId of allTeacherIds) {
      try {
        const checkStart = new Date(startDate);
        checkStart.setDate(checkStart.getDate() - 5); 
        console.log(checkStart);
        
        const checkEnd = new Date(startDate);
        checkEnd.setDate(checkEnd.getDate() + 5);
        console.log(checkEnd);
        
        // Idempotency: Kiểm tra đã có Payroll tháng này chưa
        const exists = await this.prisma.payroll.findFirst({
          where: { teacherId, periodStart: {
                  gte: checkStart,
                  lte: checkEnd
              } },
          include: { teacher: true },
        });
        if (exists) {
          this.logger.debug(`Payroll ${exists.id} for teacher ${exists.teacher.teacherCode} already exists. Skipping...`);
          success++;
          continue;
        }

        const currentSalary = currentPayMap.get(teacherId) || new Prisma.Decimal(0);
        const backPayEntry = backPayMap.get(teacherId);
        const backPayAmount = backPayEntry?.amount || new Prisma.Decimal(0);
        const backPayDetails = backPayEntry?.details || [];

        const totalAmount = currentSalary.plus(backPayAmount);
        const totalSessions = payoutIdsMap.get(teacherId)?.length || 0;

        // [FE COMPATIBILITY] Tạo metadata cho FE hiển thị
        const metadata: PayrollMetadata = {
          totalSessions: totalSessions,
          totalSessionPayouts: currentSalary.toFixed(0),
          backPayCount: backPayDetails.length,
          backPayTotal: backPayAmount.toFixed(0),
          processedAt: new Date().toISOString(),
          note: 'Lương Quỹ Lớp + Lương từ buổi học cũ',
        };

        const computedDetails = {
          metadata,
          backPayDetails: backPayDetails,
        };

        // Tạo Payroll
        const payroll = await this.prisma.payroll.create({
          data: {
            teacherId,
            periodStart: this.toDbDate(startDate),
            periodEnd: this.toDbDate(endDate),
            totalAmount: totalAmount,
            backPayAmount: backPayAmount,
            bonuses: 0,
            computedDetails: computedDetails as any, // Ép kiểu để tránh lỗi TS
            status: 'pending',
          },
        });

        // Gán Payroll ID cho TSP
        const idsToUpdate = payoutIdsMap.get(teacherId);
        if (idsToUpdate && idsToUpdate.length > 0) {
          await this.prisma.teacherSessionPayout.updateMany({
            where: { id: { in: idsToUpdate } },
            data: { status: 'batched', payrollId: payroll.id },
          });
        }

        success++;
        this.logger.log(`Đã tạo Payroll [${payroll.id}] cho GV ${teacherId}`);
      } catch (err) {
        failed++;
        errors.push({
          itemId: teacherId,
          itemName: `Teacher ID ${teacherId}`,
          phase: 'Phase 3 (Aggregation)',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
        this.logger.error(`Lỗi tạo Payroll cho GV ${teacherId}:`, err);
      }
    }

    return { success, failed, errors };
  }
}