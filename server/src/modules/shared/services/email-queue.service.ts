import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../../db/prisma.service';

export interface EmailJobData {
  type: 'teacher_assignment';
  classId: string;
  teacherId: string;
  priority?: number;
  delay?: number;
}

@Injectable()
export class EmailQueueService {
  constructor(
    @InjectQueue('email') private emailQueue: Queue,
    private prisma: PrismaService
  ) {}

  /**
   * Thêm job gửi email thông báo gán giáo viên vào queue
   */
  async addTeacherAssignmentEmailJob(classId: string, teacherId: string, options?: {
    priority?: number;
    delay?: number;
  }) {
    const jobData: EmailJobData = {
      type: 'teacher_assignment',
      classId,
      teacherId,
      priority: options?.priority || 0,
      delay: options?.delay || 0
    };

    try {
      const job = await this.emailQueue.add('send-teacher-assignment-email', jobData, {
        priority: jobData.priority,
        delay: jobData.delay,
        attempts: 3, // Thử lại tối đa 3 lần
        backoff: {
          type: 'exponential',
          delay: 2000, // Delay 2s, 4s, 8s...
        },
        removeOnComplete: 10, // Giữ lại 10 job hoàn thành gần nhất
        removeOnFail: 5, // Giữ lại 5 job thất bại gần nhất
      });

      console.log(`📧 Email job đã được thêm vào queue: ${job.id}`);
      return {
        success: true,
        jobId: job.id,
        message: 'Email job đã được thêm vào queue'
      };
    } catch (error) {
      console.error('❌ Lỗi khi thêm email job vào queue:', error);
      throw new Error(`Không thể thêm email job vào queue: ${error.message}`);
    }
  }

  /**
   * Lấy thông tin về queue
   */
  async getQueueInfo() {
    try {
      const waiting = await this.emailQueue.getWaiting();
      const active = await this.emailQueue.getActive();
      const completed = await this.emailQueue.getCompleted();
      const failed = await this.emailQueue.getFailed();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        total: waiting.length + active.length + completed.length + failed.length
      };
    } catch (error) {
      console.error('❌ Lỗi khi lấy thông tin queue:', error);
      return null;
    }
  }

  /**
   * Xóa tất cả jobs trong queue
   */
  async clearQueue() {
    try {
      await this.emailQueue.empty();
      console.log('🧹 Đã xóa tất cả jobs trong email queue');
      return { success: true, message: 'Queue đã được xóa' };
    } catch (error) {
      console.error('❌ Lỗi khi xóa queue:', error);
      throw new Error(`Không thể xóa queue: ${error.message}`);
    }
  }

  /**
   * Xóa job cụ thể
   */
  async removeJob(jobId: string) {
    try {
      const job = await this.emailQueue.getJob(jobId);
      if (job) {
        await job.remove();
        console.log(`🗑️ Đã xóa job ${jobId}`);
        return { success: true, message: `Job ${jobId} đã được xóa` };
      } else {
        return { success: false, message: `Không tìm thấy job ${jobId}` };
      }
    } catch (error) {
      console.error('❌ Lỗi khi xóa job:', error);
      throw new Error(`Không thể xóa job: ${error.message}`);
    }
  }
}
