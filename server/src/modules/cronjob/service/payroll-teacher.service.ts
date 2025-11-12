import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../db/prisma.service';

/**
 * Interface lưu thông tin lỗi khi xử lý từng giai đoạn
 */
interface ErrorDetail {
  itemId: string;      // ID của item bị lỗi
  itemName: string;    // Tên item bị lỗi
  error: string;       // Nội dung lỗi
}

/**
 * Interface định nghĩa điều khoản hợp đồng
 */
interface ContractTerms {
  payoutRate: number;  // Tỷ lệ hoa hồng thanh toán cho giáo viên
  [key: string]: any;  // Các thuộc tính khác
}

/**
 * Interface lưu metadata của bảng lương
 */
interface PayrollMetadata {
  totalSessions: number;           // Tổng số buổi học
  totalSessionPayouts: number | string;  // Tổng tiền từ các buổi học
  backPayCount: number;            // Số lượng khoản truy lĩnh
  backPayTotal: number | string;   // Tổng tiền truy lĩnh
  processedAt: string;             // Thời điểm xử lý
}

/**
 * Map lưu thông tin truy lĩnh cho từng giáo viên
 * Key: teacherId
 * Value: { amount: tổng tiền truy lĩnh, details: mảng mô tả chi tiết }
 */
type BackPayMap = Map<string, { amount: Prisma.Decimal; details: string[] }>;

@Injectable()
export class PayrollCronService {
  private readonly logger = new Logger(PayrollCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * CRON JOB CHÍNH - Chạy lúc 2h sáng ngày 10 hàng tháng
   * Nhiệm vụ: Tạo bảng lương cho giáo viên của tháng trước
   * 
   * Quy trình gồm 3 giai đoạn:
   * 1. Tính lương cho các buổi học trong tháng (chỉ tính học sinh đã trả tiền)
   * 2. Tính tiền truy lĩnh từ các hóa đơn nợ cũ được thanh toán trong tháng này
   * 3. Gộp tất cả vào bảng lương tổng hợp (Payroll)
   */
  @Cron('0 2 10 * *')
  async handleGenerateTeacherPayroll() {
    this.logger.log('Bắt đầu Cron Job: Chốt Sổ Lương Giáo Viên...');

    const startTime = Date.now();
    const errorDetails: ErrorDetail[] = [];
    let successCount = 0;
    let failedCount = 0;

    // Tạo record theo dõi việc thực thi cron job
    const cronExecutionId = await this.createCronExecution('teacher_payroll_generation');

    try {
      // === THIẾT LẬP KHOẢNG THỜI GIAN ===
      const now = new Date();
      // Ngày đầu tháng trước (VD: 1/10 nếu đang là 10/11)
      const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      // Ngày cuối tháng trước (VD: 31/10 nếu đang là 10/11)
      const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      // Hạn thanh toán hóa đơn: ngày 7 của tháng hiện tại
      const billDueDate = new Date(now.getFullYear(), now.getMonth(), 7);

      this.logger.log(
        `Kỳ lương: ${firstDayOfLastMonth.toISOString().split('T')[0]} - ${
          lastDayOfLastMonth.toISOString().split('T')[0]
        }`,
      );

      // === KIỂM TRA THÁNG ĐÃ CHỐT SỔ CHƯA ===
      const existingPayroll = await this.prisma.payroll.findFirst({
        where: {
          periodStart: firstDayOfLastMonth,
          periodEnd: lastDayOfLastMonth,
        },
      });

      if (existingPayroll) {
        this.logger.log('Tháng này đã chốt sổ. Bỏ qua...');
        await this.updateCronExecution(cronExecutionId, {
          status: 'completed',
          totalItems: 0,
          successCount: 0,
          failedCount: 0,
          durationMs: Date.now() - startTime,
        });
        return;
      }

      // === GIAI ĐOẠN 1: TÍNH LƯƠNG CHO CÁC BUỔI HỌC ===
      // Tính lương cho tất cả buổi học trong tháng trước
      // Chỉ tính cho những học sinh đã trả tiền bill kỳ này
      this.logger.log('Giai đoạn 1: Tính lương cho các buổi học...');
      let phase1Count = 0;
      try {
        phase1Count = await this.processCurrentMonthSessions(
          firstDayOfLastMonth,
          lastDayOfLastMonth,
          billDueDate,
        );
        successCount++;
        this.logger.log(`Giai đoạn 1: Hoàn thành (${phase1Count} TSP tạo)`);
      } catch (error) {
        failedCount++;
        errorDetails.push({
          itemId: 'phase-1',
          itemName: 'Process Current Month Sessions',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        this.logger.error('Giai đoạn 1 thất bại:', error);
      }

      // === GIAI ĐOẠN 2: TÍNH TIỀN TRUY LĨNH ===
      // Tính tiền cho các hóa đơn nợ cũ được thanh toán trong tháng này
      // Áp dụng tỷ lệ hoa hồng HIỆN TẠI của giáo viên
      this.logger.log('Giai đoạn 2: Tính truy lĩnh nợ cũ (fee-based)...');
      let backPayMap: BackPayMap = new Map();
      try {
        backPayMap = await this.processBackPayments(
          firstDayOfLastMonth,
          lastDayOfLastMonth,
        );
        successCount++;
        this.logger.log(`Giai đoạn 2: Tìm thấy ${backPayMap.size} GV có truy lĩnh`);
      } catch (error) {
        failedCount++;
        errorDetails.push({
          itemId: 'phase-2',
          itemName: 'Process Back Payments',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        this.logger.error('Giai đoạn 2 thất bại:', error);
      }

      // === GIAI ĐOẠN 3: GỘP VÀO BẢNG LƯƠNG TỔNG HỢP ===
      // Tạo bảng lương (Payroll) cho mỗi giáo viên
      // Bao gồm: lương buổi học + tiền truy lĩnh
      this.logger.log('Giai đoạn 3: Gộp Payroll tổng hợp...');
      let phase3Count = 0;
      try {
        phase3Count = await this.aggregatePayrolls(
          firstDayOfLastMonth,
          lastDayOfLastMonth,
          backPayMap,
        );
        successCount++;
        this.logger.log(`Giai đoạn 3: Hoàn thành (${phase3Count} Payroll tạo)`);
      } catch (error) {
        failedCount++;
        errorDetails.push({
          itemId: 'phase-3',
          itemName: 'Aggregate Payrolls',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        this.logger.error('Giai đoạn 3 thất bại:', error);
      }

      // === CẬP NHẬT KẾT QUẢ THỰC THI ===
      const durationMs = Date.now() - startTime;
      const status = failedCount > 0 ? 'completed_with_errors' : 'completed';
      const errorMessage =
        failedCount > 0 ? `Failed to complete ${failedCount}/3 phases` : null;

      await this.updateCronExecution(cronExecutionId, {
        status,
        totalItems: 3,
        successCount,
        failedCount,
        errorDetails: errorDetails.length > 0 ? errorDetails : null,
        errorMessage,
        durationMs,
      });

      this.logger.log(
        `Hoàn thành Cron Job: ${successCount} thành công, ${failedCount} thất bại`,
      );
    } catch (error) {
      // === XỬ LÝ LỖI TOÀN BỘ CRON JOB ===
      const durationMs = Date.now() - startTime;
      this.logger.error('Cron Job Chốt Sổ Lương Giáo Viên thất bại:', error);

      await this.updateCronExecution(cronExecutionId, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        failedCount: 3,
        durationMs,
      });
    }
  }

  /**
   * GIAI ĐOẠN 1: TÍNH LƯƠNG CHO CÁC BUỔI HỌC
   * 
   * Logic:
   * 1. Lấy tất cả buổi học trong khoảng thời gian
   * 2. Lấy tỷ lệ hoa hồng của tất cả giáo viên từ hợp đồng
   * 3. Lấy danh sách học sinh đã trả tiền bill kỳ này
   * 4. Với mỗi buổi học:
   *    - Đếm số học sinh đã trả tiền và có điểm danh
   *    - Tính doanh thu thực tế = số học sinh * học phí/buổi
   *    - Tính lương GV = doanh thu * tỷ lệ hoa hồng
   *    - Tạo record TeacherSessionPayout
   * 
   * @param startDate Ngày bắt đầu kỳ lương
   * @param endDate Ngày kết thúc kỳ lương
   * @param billDueDate Hạn thanh toán hóa đơn
   * @returns Số lượng TeacherSessionPayout được tạo
   */
  private async processCurrentMonthSessions(
    startDate: Date,
    endDate: Date,
    billDueDate: Date,
  ): Promise<number> {
    // === LẤY TẤT CẢ BUỔI HỌC TRONG THÁNG ===
    const sessions = await this.prisma.classSession.findMany({
      where: {
        sessionDate: { gte: startDate, lte: endDate },
      },
      select: {
        id: true,
        sessionDate: true,
        teacherId: true,              // GV chính thức
        substituteTeacherId: true,    // GV thay thế (nếu có)
        classId: true,
        class: {
          select: {
            feeStructure: { select: { amount: true, period: true } },
            feeAmount: true,
            feePeriod: true,
          },
        },
      },
    });

    if (sessions.length === 0) {
      this.logger.log('Không có buổi học trong tháng');
      return 0;
    }

    // === LẤY TỶ LỆ HOA HỒNG CỦA TẤT CẢ GIÁO VIÊN ===
    // Lấy từ hợp đồng còn hiệu lực (status = 'active')
    const teacherContractUploads = await this.prisma.contractUpload.findMany({
      where: {
        status: 'active',
        expiredAt: { gte: startDate },      // Hợp đồng còn hạn
        teacherId: { not: null },            // Là hợp đồng giáo viên
        teacherSalaryPercent: { not: null }, // Có tỷ lệ hoa hồng
      },
      select: {
        teacherId: true,
        teacherSalaryPercent: true,
      },
    });

    // Tạo Map: teacherId -> tỷ lệ hoa hồng
    const teacherPayoutRateMap = new Map<string, Prisma.Decimal>();
    teacherContractUploads.forEach((upload) => {
      if (upload.teacherId && upload.teacherSalaryPercent) {
        teacherPayoutRateMap.set(
          upload.teacherId,
          new Prisma.Decimal(upload.teacherSalaryPercent),
        );
      }
    });

    // === LẤY DANH SÁCH HỌC SINH ĐÃ TRẢ TIỀN ===
    // Chỉ tính lương cho buổi học có học sinh đã trả bill kỳ này
    const allPaidStudents = await this.prisma.feeRecord.findMany({
      where: {
        classId: { in: sessions.map((s) => s.classId) },
        dueDate: billDueDate,  // Bill của kỳ này
        status: 'paid',        // Đã thanh toán
      },
      select: { classId: true, studentId: true },
    });

    // Tạo Map: classId -> Set<studentId> đã trả tiền
    const paidStudentsByClass = new Map<string, Set<string>>();
    allPaidStudents.forEach((record) => {
      if (!paidStudentsByClass.has(record.classId)) {
        paidStudentsByClass.set(record.classId, new Set());
      }
      paidStudentsByClass.get(record.classId)!.add(record.studentId);
    });

    // === XỬ LÝ TỪNG BUỔI HỌC ===
    let payoutCount = 0;
    for (const session of sessions) {
      try {
        // 1. Xác định người nhận lương (GV thay thế hoặc GV chính)
        const personToPayId = session.substituteTeacherId || session.teacherId;
        if (!personToPayId) {
          this.logger.warn(`Buổi ${session.id} không có GV`);
          continue;
        }

        // 2. Lấy học phí/buổi
        const sessionFee =
          session.class.feeAmount ||
          session.class.feeStructure?.amount ||
          new Prisma.Decimal(0);
        const period = session.class.feePeriod || session.class.feeStructure?.period;

        // 3. Chỉ tính cho lớp tính phí theo buổi
        if (period !== 'per_session' || sessionFee.isZero()) {
          this.logger.debug(`Buổi ${session.id} không tính theo buổi`);
          continue;
        }

        // 4. Lấy tỷ lệ hoa hồng của GV
        const payoutRate = teacherPayoutRateMap.get(personToPayId);
        if (!payoutRate || payoutRate.isZero()) {
          this.logger.warn(
            `GV ${personToPayId} (Buổi ${session.id}) không có hợp đồng hợp lệ với teacherSalaryPercent`,
          );
          continue;
        }

        // 5. Lấy danh sách học sinh đã trả tiền của lớp này
        const paidStudentIds = paidStudentsByClass.get(session.classId) || new Set();

        // 6. Đếm số học sinh có điểm danh VÀ đã trả tiền
        const attendances = await this.prisma.studentSessionAttendance.findMany({
          where: {
            sessionId: session.id,
            status: { not: 'excused' },              // Không tính học sinh nghỉ có phép
            studentId: { in: Array.from(paidStudentIds) }, // Chỉ tính HS đã trả tiền
          },
          select: { studentId: true },
        });

        const paidStudentCount = attendances.length;

        if (paidStudentCount === 0) {
          this.logger.debug(`Buổi ${session.id} không có HS trả tiền`);
          continue;
        }

        // 7. Tính toán lương
        // Doanh thu thực tế = số HS đã trả tiền * học phí/buổi
        const actualRevenue = new Prisma.Decimal(paidStudentCount).times(sessionFee);
        // Lương GV = doanh thu * tỷ lệ hoa hồng
        const teacherPayout = actualRevenue.times(payoutRate);

        // 8. Tạo record TeacherSessionPayout
        await this.prisma.teacherSessionPayout.create({
          data: {
            sessionId: session.id,
            teacherId: personToPayId,
            status: 'calculated',             // Trạng thái: đã tính toán
            sessionFeePerStudent: sessionFee,
            studentCount: paidStudentCount,
            totalRevenue: actualRevenue,
            payoutRate,
            teacherPayout,
          },
        });

        payoutCount++;
      } catch (error) {
        this.logger.error(`Lỗi xử lý buổi ${session.id}:`, error);
      }
    }

    return payoutCount;
  }

  /**
   * GIAI ĐOẠN 2: TÍNH TIỀN TRUY LĨNH
   * 
   * Logic:
   * 1. Tìm các hóa đơn CŨ (dueDate < startDate) được thanh toán trong tháng này
   * 2. Lấy tỷ lệ hoa hồng HIỆN TẠI của tất cả giáo viên
   * 3. Lấy mapping Class -> Teacher
   * 4. Với mỗi hóa đơn cũ:
   *    - Tìm giáo viên của lớp đó
   *    - Lấy tỷ lệ hoa hồng hiện tại của GV
   *    - Tính tiền truy lĩnh = Tổng tiền hóa đơn * Tỷ lệ hoa hồng
   * 
   * ⚠️ LƯU Ý: Đang áp dụng tỷ lệ hoa hồng HIỆN TẠI (tháng 11)
   *           cho hóa đơn tháng 9, 10...
   *           Có thể cần điều chỉnh nếu muốn dùng tỷ lệ của tháng cũ
   * 
   * @param startDate Ngày bắt đầu kỳ lương
   * @param endDate Ngày kết thúc kỳ lương
   * @returns Map chứa thông tin truy lĩnh của từng giáo viên
   */
  private async processBackPayments(
    startDate: Date,
    endDate: Date,
  ): Promise<BackPayMap> {
    // === TÌM CÁC HÓA ĐƠN CŨ ĐƯỢC THANH TOÁN TRONG KỲ NÀY ===
    const backPayments = await this.prisma.feeRecordPayment.findMany({
      where: {
        payment: {
          paidAt: { gte: startDate, lte: endDate },  // Thanh toán trong tháng này
        },
        feeRecord: {
          dueDate: { lt: startDate },  // Hóa đơn của tháng trước đó
          status: 'paid',              // Đã thanh toán
        },
      },
      select: {
        feeRecord: {
          select: {
            id: true,
            studentId: true,
            classId: true,
            amount: true,    // Tổng tiền hóa đơn
            dueDate: true,
            notes: true,
          },
        },
      },
    });

    if (backPayments.length === 0) {
      this.logger.log('Không có hóa đơn nợ cũ được thanh toán trong kỳ');
      return new Map();
    }

    // === LẤY TỶ LỆ HOA HỒNG HIỆN TẠI CỦA TẤT CẢ GIÁO VIÊN ===
    const teacherContractUploads = await this.prisma.contractUpload.findMany({
      where: {
        status: 'active',
        expiredAt: { gte: startDate },      // Hợp đồng còn hạn
        teacherId: { not: null },
        teacherSalaryPercent: { not: null },
      },
      select: {
        teacherId: true,
        teacherSalaryPercent: true,
      },
    });

    // Tạo Map: teacherId -> tỷ lệ hoa hồng
    const teacherPayoutRateMap = new Map<string, Prisma.Decimal>();
    teacherContractUploads.forEach((upload) => {
      if (upload.teacherId && upload.teacherSalaryPercent) {
        teacherPayoutRateMap.set(
          upload.teacherId,
          new Prisma.Decimal(upload.teacherSalaryPercent),
        );
      }
    });

    // === LẤY MAPPING: CLASS -> TEACHER ===
    const classIdsInBackPay = [
      ...new Set(backPayments.map((p) => p.feeRecord?.classId).filter(Boolean)),
    ] as string[];

    const classes = await this.prisma.class.findMany({
      where: { id: { in: classIdsInBackPay } },
      select: { id: true, teacherId: true },
    });

    // Tạo Map: classId -> teacherId
    const classTeacherMap = new Map<string, string>();
    classes.forEach((c) => {
      if (c.teacherId) {
        classTeacherMap.set(c.id, c.teacherId);
      }
    });

    // === TÍNH TOÁN TRUY LĨNH CHO TỪNG GIÁO VIÊN ===
    const backPayMap: BackPayMap = new Map();

    for (const payment of backPayments) {
      const { feeRecord } = payment;
      if (!feeRecord || !feeRecord.classId) continue;

      // 1. Tìm giáo viên của lớp này
      const teacherId = classTeacherMap.get(feeRecord.classId);
      if (!teacherId) {
        this.logger.debug(
          `Không tìm thấy GV cho Lớp ${feeRecord.classId} (HĐ ${feeRecord.id})`,
        );
        continue;
      }

      // 2. Lấy tỷ lệ hoa hồng HIỆN TẠI của GV
      // ⚠️ Đang dùng rate tháng 11 cho hóa đơn tháng 9
      const payoutRate = teacherPayoutRateMap.get(teacherId);
      if (!payoutRate || payoutRate.isZero()) {
        this.logger.warn(
          `GV ${teacherId} không có payoutRate hợp lệ cho truy lĩnh (HĐ ${feeRecord.id})`,
        );
        continue;
      }

      // 3. Tính tiền truy lĩnh
      // Công thức: Tổng tiền hóa đơn * Tỷ lệ hoa hồng
      const teacherPayout = feeRecord.amount.times(payoutRate);
      const dueDateStr = feeRecord.dueDate.toISOString().split('T')[0];
      const detail = `Truy lĩnh HĐ ${dueDateStr}: ${teacherPayout.toFixed(
        0,
      )} VND (từ ${feeRecord.amount.toFixed(0)} VND)`;

      // 4. Cộng dồn vào Map
      if (!backPayMap.has(teacherId)) {
        backPayMap.set(teacherId, { amount: new Prisma.Decimal(0), details: [] });
      }

      const existing = backPayMap.get(teacherId)!;
      existing.amount = existing.amount.plus(teacherPayout);
      existing.details.push(detail);

      this.logger.debug(
        `Truy lĩnh cho GV ${teacherId} từ Lớp ${
          feeRecord.classId
        }: ${teacherPayout.toFixed(0)} VND`,
      );
    }

    return backPayMap;
  }

  /**
   * GIAI ĐOẠN 3: GỘP VÀO BẢNG LƯƠNG TỔNG HỢP
   * 
   * Logic:
   * 1. Lấy tất cả TeacherSessionPayout đã tính (status = 'calculated')
   * 2. Gộp theo teacherId
   * 3. Với mỗi giáo viên:
   *    - Tính tổng lương từ buổi học
   *    - Cộng thêm tiền truy lĩnh (nếu có)
   *    - Tạo bảng lương Payroll
   *    - Cập nhật status các TSP thành 'batched'
   * 4. Với giáo viên chỉ có truy lĩnh (không có buổi học):
   *    - Tạo Payroll chỉ chứa tiền truy lĩnh
   * 
   * @param startDate Ngày bắt đầu kỳ lương
   * @param endDate Ngày kết thúc kỳ lương
   * @param backPayMap Map chứa thông tin truy lĩnh
   * @returns Số lượng Payroll được tạo
   */
  private async aggregatePayrolls(
    startDate: Date,
    endDate: Date,
    backPayMap: BackPayMap,
  ): Promise<number> {
    // === LẤY TẤT CẢ TSP ĐÃ TÍNH TOÁN ===
    const pendingPayouts = await this.prisma.teacherSessionPayout.findMany({
      where: {
        status: 'calculated',  // Đã tính toán nhưng chưa gộp vào Payroll
        session: {
          sessionDate: { gte: startDate, lte: endDate },
        },
      },
    });

    // === GỘP TSP THEO GIÁO VIÊN ===
    const payrollDataMap = new Map<
      string,
      {
        payouts: typeof pendingPayouts;  // Danh sách TSP
        totalAmount: Prisma.Decimal;     // Tổng tiền từ buổi học
      }
    >();

    for (const payout of pendingPayouts) {
      if (!payrollDataMap.has(payout.teacherId)) {
        payrollDataMap.set(payout.teacherId, {
          payouts: [],
          totalAmount: new Prisma.Decimal(0),
        });
      }
      const existing = payrollDataMap.get(payout.teacherId)!;
      existing.payouts.push(payout);
      existing.totalAmount = existing.totalAmount.plus(payout.teacherPayout);
    }

    let payrollCount = 0;

    // === TẠO PAYROLL CHO GV CÓ BUỔI HỌC ===
    for (const [teacherId, data] of payrollDataMap.entries()) {
      // Lấy thông tin truy lĩnh (nếu có)
      const backPay = backPayMap.get(teacherId) || {
        amount: new Prisma.Decimal(0),
        details: [],
      };

      // Tạo metadata
      const metadata: PayrollMetadata = {
        totalSessions: data.payouts.length,
        totalSessionPayouts: data.totalAmount.toFixed(0),
        backPayCount: backPay.details.length,
        backPayTotal: backPay.amount.toFixed(0),
        processedAt: new Date().toISOString(),
      };

      // Tạo Payroll
      const newPayroll = await this.prisma.payroll.create({
        data: {
          teacherId,
          periodStart: startDate,
          periodEnd: endDate,
          totalAmount: data.totalAmount.plus(backPay.amount),  // Lương buổi học + Truy lĩnh
          bonuses: backPay.amount,                             // Truy lĩnh lưu vào bonuses
          computedDetails: this.buildComputedDetails(metadata, backPay.details),
          status: 'pending',  // Chờ duyệt
        },
      });

      // Cập nhật status các TSP thành 'batched'
      const payoutIds = data.payouts.map((p) => p.id);
      await this.prisma.teacherSessionPayout.updateMany({
        where: { id: { in: payoutIds } },
        data: { status: 'batched', payrollId: newPayroll.id },
      });

      payrollCount++;
      this.logger.log(
        `Tạo Payroll [${newPayroll.id}] cho GV ${teacherId}: ${newPayroll.totalAmount.toFixed(
          0,
        )} VND`,
      );
    }

    // === TẠO PAYROLL CHO GV CHỈ CÓ TRUY LĨNH ===
    // (Không có buổi học trong tháng này)
    for (const [teacherId, backPay] of backPayMap.entries()) {
      if (!payrollDataMap.has(teacherId)) {
        const metadata: PayrollMetadata = {
          totalSessions: 0,
          totalSessionPayouts: '0',
          backPayCount: backPay.details.length,
          backPayTotal: backPay.amount.toFixed(0),
          processedAt: new Date().toISOString(),
        };

        await this.prisma.payroll.create({
          data: {
            teacherId,
            periodStart: startDate,
            periodEnd: endDate,
            totalAmount: backPay.amount,
            bonuses: backPay.amount,
            computedDetails: this.buildComputedDetails(metadata, backPay.details),
            status: 'pending',
          },
        });

        payrollCount++;
        this.logger.log(
          `Tạo Payroll (chỉ truy lĩnh) cho GV ${teacherId}: ${backPay.amount.toFixed(
            0,
          )} VND`,
        );
      }
    }

    return payrollCount;
  }

  /**
   * Tạo object computedDetails cho Payroll
   * Chứa metadata và chi tiết truy lĩnh
   */
  private buildComputedDetails(
    metadata: PayrollMetadata,
    backPayDetails: string[],
  ): Record<string, any> {
    return {
      metadata,
      backPayDetails,
    };
  }

  /**
   * Tạo record theo dõi việc thực thi Cron Job
   * @returns ID của record
   */
  private async createCronExecution(jobType: string): Promise<string> {
    const execution = await this.prisma.cronJobExecution.create({
      data: {
        jobType,
        status: 'running',
        totalItems: 0,
        successCount: 0,
        failedCount: 0,
      },
    });
    return execution.id;
  }

  /**
   * Cập nhật kết quả thực thi Cron Job
   */
  private async updateCronExecution(
    id: string,
    data: {
      status: string;
      totalItems?: number;
      successCount?: number;
      failedCount?: number;
      errorDetails?: ErrorDetail[] | null;
      errorMessage?: string | null;
      durationMs?: number;
    },
  ) {
    const updateData: any = {
      status: data.status,
      totalItems: data.totalItems ?? 0,
      successCount: data.successCount ?? 0,
      failedCount: data.failedCount ?? 0,
      errorMessage: data.errorMessage ?? null,
      durationMs: data.durationMs,
      // Nếu đã hoàn thành (thành công/lỗi/thất bại) thì ghi thời điểm
      completedAt: ['completed', 'completed_with_errors', 'failed'].includes(
        data.status,
      )
        ? new Date()
        : undefined,
    };

    if (data.errorDetails !== undefined) {
      updateData.errorDetails = data.errorDetails;
    }

    await this.prisma.cronJobExecution.update({
      where: { id },
      data: updateData,
    });
  }
}