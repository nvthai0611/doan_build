import { Controller, Post, Get, Query, Param, UseGuards, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from 'src/db/prisma.service';
import { BillCronService } from '../../cronjob/service/bill-cron.service';
import { PayrollCronService } from '../../cronjob/service/payroll-teacherv2.service';
import { TriggerManagementService } from '../services/trigger-management.service';
import { CronJobFilterDto, CronJobHistoryDto, CronJobStatsDto } from '../dto/cron-job-filter.dto';
import { FeeReminderService } from '../../cronjob/service/send-email-bill.service';
// import { AdminGuard } from 'src_auth/guards/admin.guard'; // (RẤT QUAN TRỌNG)

@ApiTags('Admin Center - Job Triggers')
@Controller('triggers')
// @UseGuards(AdminGuard) // 1. BẮT BUỘC PHẢI CÓ BẢO VỆ ADMIN
export class JobTriggerController {
  private readonly logger = new Logger(JobTriggerController.name);

  constructor(
    private readonly billCron: BillCronService,
    private readonly payrollCron: PayrollCronService,
    private readonly feeReminder: FeeReminderService,
    private readonly prisma: PrismaService,
    private readonly triggerManagement: TriggerManagementService,
  ) {}

  /**
   * Kích hoạt chạy cron tính hóa đơn HỌC SINH
   */
  @Post('bill_generation')
  @ApiOperation({ summary: 'Trigger bill generation job manually' })
  async triggerBillGeneration() {
    this.logger.warn('Kích hoạt tạo Hóa đơn HỌC SINH bằng tay!');
    
    // 2. Kiểm tra "khóa": Job này đã đang chạy chưa?
    await this.checkIfJobRunning('bill_generation');
    
    // 3. Chạy "Fire-and-Forget" (Không await)
    // Trả về response cho Admin ngay, để job chạy ngầm
    this.billCron.handleCreateMonthlyStudentBills();
    
    return { message: 'Quy trình tạo hóa đơn HỌC SINH đã bắt đầu.' };
  }

  /**
   * Kích hoạt chạy cron tính lương GIÁO VIÊN
   */
  @Post('teacher_payroll_generation')
  @ApiOperation({ summary: 'Trigger payroll generation job manually' })
  async triggerPayrollGeneration() {
    this.logger.warn('Kích hoạt tạo Bảng Lương GIÁO VIÊN bằng tay!');
    
    // 2. Kiểm tra "khóa": Job này đã đang chạy chưa?
    await this.checkIfJobRunning('teacher_payroll_generation');
    
    // 3. Chạy "Fire-and-Forget" (Không await)
    this.payrollCron.handleGenerateTeacherPayroll(); 
    
    return { message: 'Quy trình tạo bảng lương GIÁO VIÊN đã bắt đầu.' };
  }

  @Post('bill_publishing')
  @ApiOperation({ summary: 'Trigger payroll generation job manually' })
  async triggerBillPublish() {
    this.logger.warn('Kích hoạt tạo Bảng Lương GIÁO VIÊN bằng tay!');
    
    // 2. Kiểm tra "khóa": Job này đã đang chạy chưa?
    await this.checkIfJobRunning('bill_publishing');
    
    // 3. Chạy "Fire-and-Forget" (Không await)
    this.billCron.handlePublishCalculatedBills(); 
    
    return { message: 'Quy trình tạo bảng lương GIÁO VIÊN đã bắt đầu.' };
  }


  @Post('fee_reminder_early')
  @ApiOperation({ summary: 'Trigger early fee reminder job manually' })
  async triggerEarlyFeeReminder() {
    this.logger.warn('Kích hoạt gửi email nhắc nhở học phí sớm bằng tay!');
    
    await this.checkIfJobRunning('fee_reminder_early');
    
    this.feeReminder.handleEarlyFeeReminder();
    
    return { message: 'Quy trình gửi email nhắc nhở học phí sớm đã bắt đầu.' };
  }

  /**
   * Kích hoạt gửi email nhắc hạn đóng học phí
   */
  @Post('fee_reminder_due')
  @ApiOperation({ summary: 'Trigger due date fee reminder job manually' })
  async triggerDueFeeReminder() {
    this.logger.warn('Kích hoạt gửi email nhắc hạn đóng học phí bằng tay!');
    
    await this.checkIfJobRunning('fee_reminder_due');
    
    this.feeReminder.handleDueFeeReminder();
    
    return { message: 'Quy trình gửi email nhắc hạn đóng học phí đã bắt đầu.' };
  }

  /**
   * List all cron jobs with filters
   */
  @Get('executions')
  @ApiOperation({ summary: 'Get all cron job executions (latest of each type)' })
  async listCronJobs(@Query() filters: CronJobFilterDto) {
    return this.triggerManagement.listCronJobs({
      ...filters,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    });
  }

  @Get('types')
  async getAllTypeController(){
    return this.triggerManagement.getAllType()
  }

  /**
   * Get latest execution for each job type
   */
  @Get('executions/latest')
  @ApiOperation({ summary: 'Get latest execution of each job type' })
  async getLatestExecutions() {
    return this.triggerManagement.getLatestExecutions();
  }

  /**
   * Get all available job types
   */
  @Get('executions/types')
  @ApiOperation({ summary: 'Get all available job types' })
  async getJobTypes() {
    return this.triggerManagement.getJobTypes();
  }

  /**
   * Get execution history of a specific job type
   */
  @Get('executions/history/:jobType')
  @ApiOperation({ summary: 'Get execution history of specific job type' })
  async getCronJobHistory(
    @Param('jobType') jobType: string,
    @Query() filters: Omit<CronJobHistoryDto, 'jobType'>
  ) {
    return this.triggerManagement.getCronJobHistory(jobType, {
      ...filters,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    });
  }

  /**
   * Get statistics for a specific job type
   */
  @Get('executions/stats/:jobType')
  @ApiOperation({ summary: 'Get statistics for specific job type' })
  async getCronJobStats(
    @Param('jobType') jobType: string,
    @Query() query: Omit<CronJobStatsDto, 'jobType'>
  ) {
    return this.triggerManagement.getCronJobStats(jobType, query.days);
  }

  /**
   * Get execution details by ID
   */
  @Get('executions/:id')
  @ApiOperation({ summary: 'Get cron job execution details by ID' })
  async getCronJobDetails(@Param('id') id: string) {
    return this.triggerManagement.getCronJobDetails(id);
  }

  /**
   * Retry a failed cron job
   */
  @Post('executions/:id/retry')
  @ApiOperation({ summary: 'Retry a failed cron job' })
  async retryCronJob(@Param('id') id: string) {
    return this.triggerManagement.retryCronJob(id);
  }

  /**
   * Helper để kiểm tra xem job có đang chạy không
   */
  private async checkIfJobRunning(jobType: string) {
    const runningJob = await this.prisma.cronJobExecution.findFirst({
      where: {
        jobType: jobType,
        status: 'running',
      },
    });

    if (runningJob) {
      this.logger.warn(`Job ${jobType} đang chạy. Kích hoạt thủ công bị từ chối.`);
      // 4. Trả lỗi HTTP 409 (Conflict)
      throw new HttpException(
        'Quy trình đã đang chạy. Vui lòng chờ nó hoàn thành.',
        HttpStatus.CONFLICT,
      );
    }
  }

  
}